// ═══════════════════════════════════════════════════════
// Teamtailor Signal Board — Background Service Worker
// Handles API calls, caching, and message passing
// ═══════════════════════════════════════════════════════

const API_BASE = 'https://teamtailor-gtm-workspace-production.up.railway.app';
const SUPABASE_URL = 'https://tqmpaaxocpwmziivxkym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbXBhYXhvY3B3bXppaXZ4a3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTM4MTQsImV4cCI6MjA5Njc2OTgxNH0.HKzwSig37xAC-zv5HE34HEsJ7vk8wZqq6AxyeYxLq8Q';

// ── Cache ──
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 min

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// ── Supabase Query ──

async function querySupabase(table, params = '') {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!resp.ok) throw new Error(`Supabase error: ${resp.status}`);
  return resp.json();
}

// ── Lookup by Domain ──

async function lookupDomain(domain) {
  const cacheKey = `domain:${domain}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // Clean domain
    const clean = domain.replace(/^www\./, '').replace(/\/$/, '').toLowerCase();

    // 1. Check accounts table
    const accounts = await querySupabase('accounts', `domain=eq.${encodeURIComponent(clean)}&select=*`);
    const account = accounts?.[0] || null;

    // 2. Check clay_signals for this domain
    const signals = await querySupabase('clay_signals', `company_domain=eq.${encodeURIComponent(clean)}&select=*&order=detected_at.desc&limit=20`);

    // 3. Check contacts for this domain
    const contacts = await querySupabase('contacts', `domain=eq.${encodeURIComponent(clean)}&select=*`);

    const result = {
      found: !!(account || signals?.length > 0),
      account,
      signals: signals || [],
      contacts: contacts || [],
      domain: clean,
    };

    // Compute buying committee gaps
    const COMMITTEE_ROLES = ['decision_maker', 'champion', 'end_user', 'technical_buyer', 'economic_buyer', 'evaluator'];
    const coveredRoles = new Set();
    // We'd need persona data to compute this properly, but we can use title matching
    result.committeeGaps = COMMITTEE_ROLES; // For now, show all as gaps if no contacts
    if (contacts?.length > 0) {
      result.committeeGaps = COMMITTEE_ROLES.filter(r => {
        // Simple title-based detection
        return !contacts.some(c => {
          const t = (c.title || '').toLowerCase();
          if (r === 'decision_maker') return t.includes('vp') || t.includes('chief') || t.includes('director') || t.includes('head');
          if (r === 'champion') return t.includes('head of') || t.includes('director') || t.includes('lead');
          if (r === 'end_user') return t.includes('recruiter') || t.includes('coordinator') || t.includes('specialist');
          if (r === 'evaluator') return t.includes('manager') || t.includes('analyst');
          if (r === 'technical_buyer') return t.includes('it') || t.includes('security') || t.includes('engineer');
          if (r === 'economic_buyer') return t.includes('finance') || t.includes('cfo') || t.includes('procurement');
          return false;
        });
      });
    }

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[Signal Board] Domain lookup error:', err);
    return { found: false, account: null, signals: [], contacts: [], domain, error: err.message };
  }
}

// ── Lookup Person by LinkedIn URL ──

async function lookupPerson(linkedinUrl) {
  const cacheKey = `person:${linkedinUrl}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // Extract username from LinkedIn URL
    const match = linkedinUrl.match(/linkedin\.com\/in\/([^/?\s]+)/);
    if (!match) return { found: false };

    const slug = match[1].toLowerCase();

    // Search contacts by linkedin_url
    const contacts = await querySupabase('contacts', `linkedin_url=ilike.*${encodeURIComponent(slug)}*&select=*&limit=1`);
    const contact = contacts?.[0] || null;

    const result = {
      found: !!contact,
      contact,
      slug,
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[Signal Board] Person lookup error:', err);
    return { found: false, error: err.message };
  }
}

// ── Message Handler ──

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'LOOKUP_DOMAIN') {
    lookupDomain(msg.domain).then(sendResponse);
    return true; // async
  }

  if (msg.type === 'LOOKUP_PERSON') {
    lookupPerson(msg.linkedinUrl).then(sendResponse);
    return true;
  }

  if (msg.type === 'ADD_TO_SIGNAL_BOARD') {
    addToSignalBoard(msg.data).then(sendResponse);
    return true;
  }

  if (msg.type === 'GET_SETTINGS') {
    chrome.storage.local.get(['aimfoxKey', 'repName', 'repId'], sendResponse);
    return true;
  }
});

// ── Add Contact to Signal Board ──

async function addToSignalBoard(data) {
  try {
    const { name, title, linkedinUrl, companyName, companyDomain, committeeRole } = data;

    // Upsert to contacts table
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@${companyDomain || 'unknown.com'}`;

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        full_name: name,
        title,
        linkedin_url: linkedinUrl,
        company_name: companyName,
        domain: companyDomain,
        source: 'chrome_extension',
        updated_at: new Date().toISOString(),
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(err);
    }

    return { success: true };
  } catch (err) {
    console.error('[Signal Board] Add contact error:', err);
    return { success: false, error: err.message };
  }
}
