// ============================================================
// clay-webhook — Supabase Edge Function
// Accepts Clay webhook POSTs, normalizes fields, upserts into clay_signals.
// URL: https://tqmpaaxocpwmziivxkym.supabase.co/functions/v1/clay-webhook
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://tqmpaaxocpwmziivxkym.supabase.co';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Simple auth token — Daniel adds this as a header: x-webhook-secret
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || 'tt-clay-2025';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-webhook-secret, Authorization',
};

// ── Field Mapping ──
// Maps common Clay column names → our clay_signals schema.
// Case-insensitive, spaces/underscores normalized.
const FIELD_MAP: Record<string, string> = {
  // Company fields
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

  // Contact fields
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

  // Signal fields
  'signal': 'signal_name',
  'signal name': 'signal_name',
  'signal_name': 'signal_name',
  'signal type': 'signal_type',
  'signal_type': 'signal_type',
  'page visited': 'page_visited',
  'page_visited': 'page_visited',
  'page url': 'page_visited',
  'visited url': 'page_visited',

  // Enrichment fields
  'open roles': 'open_roles',
  'open_roles': 'open_roles',
  'job postings': 'open_roles',
  'market': 'market',
  'region': 'market',
  'audience': 'audience_source',
  'audience source': 'audience_source',
  'audience_source': 'audience_source',
  'source': 'audience_source',
};

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/[_\s]+/g, ' ');
}

function mapFields(raw: Record<string, any>): Record<string, any> {
  const mapped: Record<string, any> = {};

  for (const [key, value] of Object.entries(raw)) {
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

  // Clean domain (remove protocol, www, trailing slash)
  if (mapped.company_domain && typeof mapped.company_domain === 'string') {
    mapped.company_domain = mapped.company_domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '')
      .toLowerCase();
  }

  // Default signal_type
  if (!mapped.signal_type) {
    mapped.signal_type = 'clay_enrichment';
  }

  // Default signal_name
  if (!mapped.signal_name && mapped.page_visited) {
    mapped.signal_name = 'Page Visited';
  } else if (!mapped.signal_name) {
    mapped.signal_name = 'Clay Signal';
  }

  // Timestamp
  mapped.detected_at = mapped.detected_at || new Date().toISOString();

  return mapped;
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Auth check
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const rows: Record<string, any>[] = Array.isArray(body) ? body : [body];

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Empty payload' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const results = { inserted: 0, updated: 0, errors: [] as string[] };

    for (const raw of rows) {
      const mapped = mapFields(raw);

      // Must have a domain to upsert
      if (!mapped.company_domain) {
        results.errors.push(`Missing domain for: ${JSON.stringify(raw).slice(0, 100)}`);
        continue;
      }

      // Upsert: if domain+email combo exists, update; otherwise insert
      const matchKey = mapped.email
        ? { company_domain: mapped.company_domain, email: mapped.email }
        : { company_domain: mapped.company_domain };

      // Check if exists
      let query = supabase.from('clay_signals').select('id').eq('company_domain', mapped.company_domain);
      if (mapped.email) query = query.eq('email', mapped.email);
      const { data: existing } = await query.limit(1).single();

      if (existing) {
        // Update
        const { error } = await supabase.from('clay_signals').update(mapped).eq('id', existing.id);
        if (error) results.errors.push(`Update failed for ${mapped.company_domain}: ${error.message}`);
        else results.updated++;
      } else {
        // Insert
        const { error } = await supabase.from('clay_signals').insert(mapped);
        if (error) results.errors.push(`Insert failed for ${mapped.company_domain}: ${error.message}`);
        else results.inserted++;
      }
    }

    // Log the sync event
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
    });

    return new Response(JSON.stringify({
      ok: true,
      received: rows.length,
      inserted: results.inserted,
      updated: results.updated,
      errors: results.errors.length > 0 ? results.errors : undefined,
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: `Parse error: ${err.message}` }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
