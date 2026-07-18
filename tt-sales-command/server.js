// ============================================================
// Production Server for Railway
// Serves the built React app AND proxies Salesloft API calls
// so the API key never reaches the browser.
// ============================================================
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleInboundWebhook } from './flywheel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies for our webhooks
app.use(express.json());

// ── 15-min Salesforce Sync Cron (batch fallback) ──
import cron from 'node-cron';
import { runSync as runSalesloftSync } from './salesloft-sync.js';

cron.schedule('*/15 * * * *', async () => {
  try {
    const connected = await isConnected().catch(() => false);
    if (!connected) return;
    console.log('[SF Cron] Running 15-minute sync...');
    await runFullSync();
    console.log('[SF Cron] Sync complete.');
  } catch (err) {
    console.error('[SF Cron] Error:', err.message);
  }
});

// ── 15-min Salesloft → Supabase Ownership Sync ──
// Keeps account/contact ownership data fresh from SFDC via Salesloft
cron.schedule('7,22,37,52 * * * *', async () => {
  try {
    if (!process.env.SALESLOFT_API_KEY) return;
    console.log('[SL Cron] Running Salesloft ownership sync...');
    await runSalesloftSync();
    console.log('[SL Cron] Sync complete.');
  } catch (err) {
    console.error('[SL Cron] Error:', err.message);
  }
});

// ── Salesloft API Proxy ──
// Mirrors exactly what vite.config.ts does in dev mode.
// The SALESLOFT_API_KEY env var is set in Railway's dashboard.
app.use('/salesloft-api', createProxyMiddleware({
  target: 'https://api.salesloft.com',
  changeOrigin: true,
  pathRewrite: { '^/salesloft-api': '' },
  on: {
    proxyReq: (proxyReq) => {
      proxyReq.setHeader('Authorization', `Bearer ${process.env.SALESLOFT_API_KEY}`);
      proxyReq.setHeader('Accept', 'application/json');
      proxyReq.setHeader('Content-Type', 'application/json');
    },
  },
}));

// ── Inbound Audience Flywheel (RB2B Webhook) ──
app.post('/api/webhook/rb2b', async (req, res) => {
  try {
    const result = await handleInboundWebhook(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error('[Webhook Error]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ── CRM Pipeline Flywheel (Smartlead/Apollo/Calendly Webhook) ──
import { handleCrmWebhook } from './crm_webhook.js';

app.post('/api/webhook/crm', async (req, res) => {
  try {
    const result = await handleCrmWebhook(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error('[CRM Webhook Error]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ── Clay Data Webhook ──
import { handleClayWebhook } from './clay_webhook.js';

app.post('/api/webhook/clay', async (req, res) => {
  try {
    const result = await handleClayWebhook(req.body, req.headers);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[Clay Webhook Error]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ── Salesloft Call Logging ──
// Used by the Signal Board's click-to-call feature.
// Looks up the person in Salesloft, then logs a call activity.

app.post('/api/salesloft/log-call', async (req, res) => {
  try {
    const { email, phone, sentiment, disposition, duration, notes } = req.body;
    const SL_KEY = process.env.SALESLOFT_API_KEY;
    
    if (!SL_KEY) {
      return res.status(500).json({ error: 'Salesloft API key not configured' });
    }
    if (!email || !disposition) {
      return res.status(400).json({ error: 'email and disposition are required' });
    }

    const slHeaders = {
      'Authorization': `Bearer ${SL_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // 1. Find the person in Salesloft by email
    const searchResp = await fetch(
      `https://api.salesloft.com/v2/people?email_addresses[]=${encodeURIComponent(email)}&per_page=1`,
      { headers: slHeaders }
    );
    const searchData = await searchResp.json();
    const personId = searchData.data?.[0]?.id;

    if (!personId) {
      return res.status(404).json({ error: 'Person not found in Salesloft', email });
    }

    // 2. Get the current user (caller) — use the API key owner
    // The Salesloft API key is user-scoped, so we can use /v2/me
    const meResp = await fetch('https://api.salesloft.com/v2/me', { headers: slHeaders });
    const meData = await meResp.json();
    const userId = meData.data?.id;

    // 3. Log the call
    const callPayload = {
      person_id: personId,
      disposition: disposition || 'Connected',
      duration: duration || 0,
      to: phone || undefined,
      user_id: userId || undefined,
    };

    // Add sentiment if provided
    if (sentiment) {
      callPayload.sentiment = sentiment;
    }

    // Add notes if provided
    if (notes) {
      callPayload.note = { content: notes };
    }

    const callResp = await fetch('https://api.salesloft.com/v2/activities/calls', {
      method: 'POST',
      headers: slHeaders,
      body: JSON.stringify(callPayload),
    });

    const callData = await callResp.json();

    if (!callResp.ok) {
      console.error('[Call Log] Salesloft error:', callData);
      return res.status(callResp.status).json({ error: callData.errors?.[0] || 'Salesloft API error' });
    }

    console.log(`[Call Log] Logged call for ${email}: ${disposition} (${duration}s)`);

    res.json({
      success: true,
      callId: callData.data?.id,
      personId,
      disposition: callData.data?.disposition,
      sentiment: callData.data?.sentiment,
      crmActivity: !!callData.data?.crm_activity,
    });
  } catch (err) {
    console.error('[Call Log] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Salesforce Integration ──
import { getAuthorizationUrl, handleCallback, isConnected, getConnectionStatus } from './salesforce-auth.js';
import { runFullSync, pullAccountOwnership, pushSignalActivity } from './salesforce-sync.js';
import { detectAndResolve, scanAllGaps, createLead, createContact } from './salesforce-gap-detector.js';

// Start OAuth flow — redirects to Salesforce login
app.get('/api/salesforce/authorize', (_req, res) => {
  const url = getAuthorizationUrl();
  res.redirect(url);
});

// OAuth callback — exchanges code for tokens
app.get('/api/salesforce/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Missing authorization code' });
    await handleCallback(code);
    res.json({ ok: true, message: 'Salesforce connected successfully! You can close this tab.' });
  } catch (err) {
    console.error('[SF Callback Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Connection status
app.get('/api/salesforce/status', async (_req, res) => {
  try {
    const status = await getConnectionStatus();
    const connected = await isConnected();
    res.json({ ...status, connected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual full sync trigger
app.post('/api/salesforce/sync', async (_req, res) => {
  try {
    const connected = await isConnected();
    if (!connected) return res.status(400).json({ error: 'Salesforce not connected. Visit /api/salesforce/authorize first.' });
    const result = await runFullSync();
    res.json({ ok: true, result });
  } catch (err) {
    console.error('[SF Sync Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Pull account ownership from SFDC
app.post('/api/salesforce/pull-ownership', async (_req, res) => {
  try {
    const result = await pullAccountOwnership();
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Push signal activity for a specific domain
app.post('/api/salesforce/push-signals', async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: 'Missing domain' });
    const result = await pushSignalActivity(domain);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scan for gaps (records not in SFDC)
app.post('/api/salesforce/scan-gaps', async (req, res) => {
  try {
    const { dryRun = false, limit = 100 } = req.body || {};
    const result = await scanAllGaps({ dryRun, limit });
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Lead for a specific signal
app.post('/api/salesforce/create-lead', async (req, res) => {
  try {
    const result = await createLead(req.body);
    res.json({ ok: true, leadId: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Contact on an existing Account
app.post('/api/salesforce/create-contact', async (req, res) => {
  try {
    const { signal, accountId } = req.body;
    if (!signal || !accountId) return res.status(400).json({ error: 'Missing signal or accountId' });
    const result = await createContact(signal, accountId);
    res.json({ ok: true, contactId: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detect and resolve a single signal (check SFDC, create if needed)
app.post('/api/salesforce/detect', async (req, res) => {
  try {
    const result = await detectAndResolve(req.body);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Google Calendar Integration ──
import {
  getAuthorizationUrl as getGCalAuthUrl,
  handleCallback as handleGCalCallback,
  isConnected as isGCalConnected,
  getConnectionStatus as getGCalStatus,
  disconnectCalendar,
} from './google-calendar-auth.js';
import {
  fetchAllEvents,
  filterExternalMeetings,
  transformToCalendarEvents,
} from './google-calendar-sync.js';

// Start OAuth flow — redirects to Google consent screen
app.get('/api/google-calendar/authorize', (_req, res) => {
  const url = getGCalAuthUrl();
  res.redirect(url);
});

// OAuth callback — exchanges code for tokens
app.get('/api/google-calendar/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Missing authorization code' });
    await handleGCalCallback(code);
    res.send('<html><body><h2>✅ Google Calendar connected!</h2><p>You can close this tab and return to the workspace.</p><script>setTimeout(() => window.close(), 2000)</script></body></html>');
  } catch (err) {
    console.error('[GCal Callback Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Connection status
app.get('/api/google-calendar/status', async (_req, res) => {
  try {
    const status = await getGCalStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch external meeting events (with optional months & internalDomains params)
app.get('/api/google-calendar/events', async (req, res) => {
  try {
    const connected = await isGCalConnected();
    if (!connected) return res.status(400).json({ error: 'Google Calendar not connected' });
    const months = parseInt(req.query.months) || 12;
    const internalDomains = (req.query.internalDomains || 'teamtailor.com').split(',');
    const rawEvents = await fetchAllEvents({ months });
    const externalOnly = filterExternalMeetings(rawEvents, internalDomains);
    const events = transformToCalendarEvents(externalOnly);
    res.json({ ok: true, count: events.length, events });
  } catch (err) {
    console.error('[GCal Events Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Disconnect Google Calendar
app.post('/api/google-calendar/disconnect', async (_req, res) => {
  try {
    disconnectCalendar();
    res.json({ ok: true, message: 'Google Calendar disconnected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Data Health Status (for Daniel to verify flow) ──
import { createClient } from '@supabase/supabase-js';
const sbHealth = createClient(
  process.env.SUPABASE_URL || 'https://tqmpaaxocpwmziivxkym.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbXBhYXhvY3B3bXppaXZ4a3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE5MzgxNCwiZXhwIjoyMDk2NzY5ODE0fQ.TUwDSbyhI6FMhO6XMq_pgAOQCn_zHxHHrCh6i1C2dkE'
);

app.get('/api/health/clay', async (_req, res) => {
  try {
    const { count: signalCount } = await sbHealth.from('clay_signals').select('*', { count: 'exact', head: true });
    const { data: lastSync } = await sbHealth.from('audit_log')
      .select('metadata, created_at')
      .eq('action', 'clay_sync')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      status: 'ok',
      clay_signals_count: signalCount || 0,
      recent_syncs: (lastSync || []).map(s => ({
        time: s.created_at,
        ...s.metadata,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Serve static React build ──
// ── Lead Routing & Distribution ──
import { getDistributionStats, reassignAccount, setRepAvailability, getRoster, updateRep, getAssignmentLog } from './lead-router.js';

app.get('/api/routing/stats', async (_req, res) => {
  try {
    const stats = await getDistributionStats();
    res.json({ stats });
  } catch (err) {
    console.error('[Routing] Stats error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/routing/reassign', async (req, res) => {
  try {
    const { domain, toRepId, reason } = req.body;
    if (!domain || !toRepId) return res.status(400).json({ error: 'domain and toRepId are required' });
    const result = await reassignAccount(domain, toRepId, reason || 'Admin reassignment');
    res.json(result);
  } catch (err) {
    console.error('[Routing] Reassign error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/routing/availability', async (req, res) => {
  try {
    const { repId, available, reason } = req.body;
    if (!repId || available === undefined) return res.status(400).json({ error: 'repId and available are required' });
    const result = await setRepAvailability(repId, available, reason);
    res.json(result);
  } catch (err) {
    console.error('[Routing] Availability error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/routing/roster', async (_req, res) => {
  try {
    const roster = await getRoster();
    res.json({ roster });
  } catch (err) {
    console.error('[Routing] Roster error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/routing/roster', async (req, res) => {
  try {
    const { repId, updates } = req.body;
    if (!repId || !updates) return res.status(400).json({ error: 'repId and updates are required' });
    const result = await updateRep(repId, updates);
    res.json(result);
  } catch (err) {
    console.error('[Routing] Roster update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/routing/log', async (req, res) => {
  try {
    const log = await getAssignmentLog({
      limit: parseInt(req.query.limit) || 50,
      domain: req.query.domain,
      repId: req.query.repId
    });
    res.json({ log });
  } catch (err) {
    console.error('[Routing] Log error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Static standalone pages (no auth) — must be BEFORE express.static ──
app.get('/4d', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', '4d', 'index.html'));
});

app.get('/scout-clinical/business-case', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'scout-clinical', 'business-case', 'index.html'));
});
app.get('/scout-clinical/business-case/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'scout-clinical', 'business-case', 'index.html'));
});

app.get('/scout-clinical/mcp', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'scout-clinical', 'mcp', 'index.html'));
});
app.get('/scout-clinical/mcp/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'scout-clinical', 'mcp', 'index.html'));
});

app.get('/complete-fence/business-case', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'complete-fence', 'business-case', 'index.html'));
});
app.get('/complete-fence/business-case/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'complete-fence', 'business-case', 'index.html'));
});

app.get('/rooms/ya-group/business-case', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'rooms', 'ya-group', 'business-case', 'index.html'));
});
app.get('/rooms/ya-group/business-case/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'rooms', 'ya-group', 'business-case', 'index.html'));
});

// ── GTM Infra Walkthrough — serve SPA so React router handles it ──
app.get('/briefing', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.get('/briefing/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.get('/gtm-infra', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ── Serve the built React app ──
app.use(express.static(path.join(__dirname, 'dist')));

// ── SPA fallback — all non-API routes serve index.html ──
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[SCC] Production server running on port ${PORT}`);
  console.log(`[SCC] Salesloft proxy: /salesloft-api → api.salesloft.com`);
  console.log(`[SCC] Clay webhook: POST /api/webhook/clay`);
  console.log(`[SCC] Clay health: GET /api/health/clay`);
  console.log(`[SCC] Salesforce: GET /api/salesforce/status`);
  console.log(`[SCC] API key configured: ${process.env.SALESLOFT_API_KEY ? '✅ yes' : '❌ MISSING'}`);
  console.log(`[SCC] Salesforce OAuth: ${process.env.SF_CLIENT_ID ? '✅ configured' : '⏳ pending Gordon'}`);
  console.log(`[SCC] Google Calendar: ${process.env.GOOGLE_CALENDAR_CLIENT_ID ? '✅ configured' : '⏳ not configured'}`);
});
