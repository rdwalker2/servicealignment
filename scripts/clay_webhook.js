// ============================================================
// clay_webhook.js — Clay Webhook Handler
// Accepts Clay webhook POSTs, normalizes fields, upserts into clay_signals.
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tqmpaaxocpwmziivxkym.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbXBhYXhvY3B3bXppaXZ4a3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE5MzgxNCwiZXhwIjoyMDk2NzY5ODE0fQ.TUwDSbyhI6FMhO6XMq_pgAOQCn_zHxHHrCh6i1C2dkE';
const WEBHOOK_SECRET = process.env.CLAY_WEBHOOK_SECRET || 'tt-clay-2025';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

import { assignAccount } from './lead-router.js';

// ── Field Mapping ──
// Maps common Clay column names → our clay_signals schema.
const FIELD_MAP = {
  'company': 'company_name',
  'company name': 'company_name',
  'company_name': 'company_name',
  'domain': 'company_domain',
  'company domain': 'company_domain',
  'company_domain': 'company_domain',
  'website': 'company_domain',
  'location': 'company_location',
  'company location': 'company_location',
  'hq': 'company_location',
  'headquarters': 'company_location',
  'employees': 'employee_count',
  'employee count': 'employee_count',
  'employee_count': 'employee_count',
  'headcount': 'employee_count',
  'size': 'employee_count',
  'current ats': 'current_ats',
  'current_ats': 'current_ats',
  'ats': 'current_ats',
  'industry': 'industry',
  'contact': 'contact_name',
  'contact name': 'contact_name',
  'contact_name': 'contact_name',
  'name': 'contact_name',
  'full name': 'contact_name',
  'first name': 'first_name',
  'first_name': 'first_name',
  'last name': 'last_name',
  'last_name': 'last_name',
  'email': 'email',
  'contact email': 'email',
  'work email': 'email',
  'title': 'title',
  'job title': 'title',
  'job_title': 'title',
  'role': 'title',
  'phone': 'phone',
  'phone number': 'phone',
  'linkedin': 'linkedin_url',
  'linkedin url': 'linkedin_url',
  'linkedin_url': 'linkedin_url',
  'profile url': 'linkedin_url',
  'signal': 'signal_name',
  'signal name': 'signal_name',
  'signal_name': 'signal_name',
  'signal type': 'signal_type',
  'signal_type': 'signal_type',
  'page visited': 'page_visited',
  'page_visited': 'page_visited',
  'page url': 'page_visited',
  'visited url': 'page_visited',
  'open roles': 'open_roles',
  'open_roles': 'open_roles',
  'job postings': 'open_roles',
  'market': 'market',
  'region': 'market',
  'audience': 'audience_source',
  'audience source': 'audience_source',
  'audience_source': 'audience_source',
  'source': 'audience_source',
  // Salesforce CRM fields
  'salesforce account id': 'salesforce_account_id',
  'salesforce_account_id': 'salesforce_account_id',
  'sf account id': 'salesforce_account_id',
  'sf_account_id': 'salesforce_account_id',
  'account id': 'salesforce_account_id',
  'salesforce contact id': 'salesforce_contact_id',
  'salesforce_contact_id': 'salesforce_contact_id',
  'sf contact id': 'salesforce_contact_id',
  'sf_contact_id': 'salesforce_contact_id',
  'contact id': 'salesforce_contact_id',
  'account owner': 'sf_account_owner',
  'sf account owner': 'sf_account_owner',
  'sf_account_owner': 'sf_account_owner',
  'salesforce owner': 'sf_account_owner',
  'salesforce_owner_id': 'salesforce_owner_id',
};

function normalizeKey(key) {
  return key.toLowerCase().trim().replace(/[_\s]+/g, ' ');
}

function mapFields(raw) {
  const mapped = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined || value === '') continue;
    const normalized = normalizeKey(key);
    const target = FIELD_MAP[normalized];
    if (target) {
      mapped[target] = value;
    } else {
      // Store unmapped fields in metadata
      if (!mapped.metadata) mapped.metadata = {};
      mapped.metadata[key] = value;
    }
  }

  // Combine first_name + last_name if contact_name is missing
  if (!mapped.contact_name && (mapped.first_name || mapped.last_name)) {
    mapped.contact_name = [mapped.first_name, mapped.last_name].filter(Boolean).join(' ');
  }
  delete mapped.first_name;
  delete mapped.last_name;

  // Parse employee_count to number
  if (mapped.employee_count && typeof mapped.employee_count === 'string') {
    const num = parseInt(mapped.employee_count.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) mapped.employee_count = num;
    else delete mapped.employee_count;
  }

  // Parse open_roles to number
  if (mapped.open_roles && typeof mapped.open_roles === 'string') {
    const num = parseInt(mapped.open_roles.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) mapped.open_roles = num;
    else delete mapped.open_roles;
  }

  // Clean domain
  if (mapped.company_domain && typeof mapped.company_domain === 'string') {
    mapped.company_domain = mapped.company_domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '')
      .toLowerCase();
  }

  // Defaults
  if (!mapped.signal_type) mapped.signal_type = 'clay_enrichment';
  if (!mapped.signal_name && mapped.page_visited) mapped.signal_name = 'Page Visited';
  else if (!mapped.signal_name) mapped.signal_name = 'Clay Signal';
  mapped.detected_at = mapped.detected_at || new Date().toISOString();

  return mapped;
}

export async function handleClayWebhook(body, headers = {}) {
  // Auth check
  const secret = headers['x-webhook-secret'];
  if (secret !== WEBHOOK_SECRET) {
    return { status: 401, body: { error: 'Unauthorized — add header: x-webhook-secret' } };
  }

  const rows = Array.isArray(body) ? body : [body];
  if (rows.length === 0) {
    return { status: 400, body: { error: 'Empty payload' } };
  }

  const results = { inserted: 0, updated: 0, errors: [] };

  for (const raw of rows) {
    const mapped = mapFields(raw);

    if (!mapped.company_domain) {
      results.errors.push(`Missing domain for: ${JSON.stringify(raw).slice(0, 100)}`);
      continue;
    }

    // Upsert: check if domain+email exists
    let query = supabase.from('clay_signals').select('id').eq('company_domain', mapped.company_domain);
    if (mapped.email) query = query.eq('email', mapped.email);
    const { data: existing } = await query.limit(1).maybeSingle();

    if (existing) {
      const { error } = await supabase.from('clay_signals').update(mapped).eq('id', existing.id);
      if (error) results.errors.push(`Update failed for ${mapped.company_domain}: ${error.message}`);
      else results.updated++;
    } else {
      const { data: inserted, error } = await supabase.from('clay_signals').insert(mapped).select('id').single();
      if (error) {
        results.errors.push(`Insert failed for ${mapped.company_domain}: ${error.message}`);
      } else {
        results.inserted++;
        // Auto-assign rep if Clay didn't provide one
        if (!mapped.assigned_rep_id && inserted?.id) {
          try {
            const assignment = await assignAccount(mapped.company_domain, { ...mapped, id: inserted.id }, { triggeredBy: 'clay_webhook' });
            if (assignment.repId) {
              await supabase.from('clay_signals')
                .update({ assigned_rep_id: assignment.repId, assignment_method: assignment.method })
                .eq('id', inserted.id);
            }
          } catch (err) {
            console.warn(`[Clay Webhook] Auto-assign failed for ${mapped.company_domain}:`, err.message);
          }
        }
      }
    }
  }

  // Log sync event
  await supabase.from('audit_log').insert({
    user_id: 'clay-webhook',
    action: 'clay_sync',
    metadata: {
      rows_received: rows.length,
      inserted: results.inserted,
      updated: results.updated,
      errors: results.errors.length,
      timestamp: new Date().toISOString(),
    },
  }).catch(() => {}); // Don't fail on audit log errors

  console.log(`[Clay Webhook] Received ${rows.length} rows → ${results.inserted} inserted, ${results.updated} updated, ${results.errors.length} errors`);

  return {
    status: 200,
    body: {
      ok: true,
      received: rows.length,
      inserted: results.inserted,
      updated: results.updated,
      errors: results.errors.length > 0 ? results.errors : undefined,
    },
  };
}
