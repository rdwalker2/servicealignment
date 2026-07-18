#!/usr/bin/env node
// ============================================================
// SalesLoft Historical Data Audit
// Pulls call + email activity data for Jack Luther, Moe Aqel,
// Tyler Hanson (Jan–Jun 2026) and compares against seedData.
// ============================================================

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load API key from .env ──
const envFile = readFileSync(resolve(__dirname, '.env'), 'utf-8');
const API_KEY = envFile.match(/SALESLOFT_API_KEY=(.+)/)?.[1]?.trim();
if (!API_KEY) { console.error('❌ No SALESLOFT_API_KEY found in .env'); process.exit(1); }

const BASE = 'https://api.salesloft.com/v2';
const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

// ── Rate-limit-aware fetch ──
let requestCount = 0;
async function sl(path) {
  requestCount++;
  // Small delay every request to stay well under 600/min
  if (requestCount > 1) await sleep(150);

  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const body = await res.text();
    console.error(`❌ API error ${res.status} on ${path}:`, body.slice(0, 200));
    throw new Error(`SalesLoft API ${res.status}`);
  }
  return res.json();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Paginate through all results ──
async function fetchAll(basePath) {
  let page = 1;
  const allData = [];
  while (true) {
    const sep = basePath.includes('?') ? '&' : '?';
    const data = await sl(`${basePath}${sep}per_page=100&page=${page}`);
    if (data.data) allData.push(...data.data);
    const meta = data.metadata?.paging;
    if (!meta?.next_page || page >= (meta.total_pages || 999)) break;
    page++;
    // Higher pages cost more against rate limit
    if (page > 100) await sleep(300);
  }
  return allData;
}

// ── Month boundaries ──
function getMonthRange(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01T00:00:00.000000Z`;
  const endDate = new Date(year, month, 1); // month is 0-indexed in Date but we pass 1-indexed, so this is next month
  const end = endDate.toISOString().replace(/\.\d+Z$/, '.000000Z');
  return { start, end };
}

// ── Existing seed data (hardcoded from seedData.ts) ──
const SEED_DATA = {
  'Jack Luther': {
    '2026-01': { dials: 374, connects: 50, conversations: 39, emails_sent: 600 },
    '2026-02': { dials: 410, connects: 54, conversations: 31, emails_sent: 348 },
    '2026-03': { dials: 721, connects: 89, conversations: 50, emails_sent: 781 },
    '2026-04': { dials: 1892, connects: 138, conversations: 84, emails_sent: 1580 },
    '2026-05': { dials: 1061, connects: 54, conversations: 35, emails_sent: 1561 },
    '2026-06': { dials: null, connects: null, conversations: null, emails_sent: null }, // no seed data yet
  },
  'Moe Aqel': {
    '2026-01': { dials: 576, connects: 33, conversations: 18, emails_sent: 1413 },
    '2026-02': { dials: 438, connects: 29, conversations: 12, emails_sent: 424 },
    '2026-03': { dials: 708, connects: 49, conversations: 23, emails_sent: 1068 },
    '2026-04': { dials: 2024, connects: 153, conversations: 72, emails_sent: 1762 },
    '2026-05': { dials: 404, connects: 26, conversations: 14, emails_sent: 471 },
    '2026-06': { dials: null, connects: null, conversations: null, emails_sent: null },
  },
  'Tyler Hanson': {
    '2026-01': { dials: 461, connects: 34, conversations: 20, emails_sent: 1266 },
    '2026-02': { dials: 359, connects: 26, conversations: 12, emails_sent: 732 },
    '2026-03': { dials: 596, connects: 26, conversations: 14, emails_sent: 891 },
    '2026-04': { dials: 2994, connects: 191, conversations: 99, emails_sent: 2752 },
    '2026-05': { dials: 1103, connects: 61, conversations: 24, emails_sent: 796 },
    '2026-06': { dials: null, connects: null, conversations: null, emails_sent: null },
  },
};

// Rep name matching (case-insensitive partial match)
const TARGET_REPS = ['Jack Luther', 'Moe Aqel', 'Tyler Hanson'];

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🔍 SalesLoft Historical Data Audit');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 1: Get all users
  console.log('📋 Step 1: Fetching SalesLoft users...');
  const usersData = await sl('/users.json?per_page=100');
  const allUsers = usersData.data || [];
  console.log(`   Found ${allUsers.length} users total`);

  // Match our target reps
  const repUsers = {};
  for (const user of allUsers) {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const match = TARGET_REPS.find(r =>
      fullName.toLowerCase().includes(r.toLowerCase()) ||
      r.toLowerCase().includes(fullName.toLowerCase())
    );
    if (match) {
      repUsers[match] = user;
      console.log(`   ✅ Matched "${match}" → ID: ${user.id}, GUID: ${user.guid || 'N/A'}, Email: ${user.email}`);
    }
  }

  // Show all users if we didn't match everyone
  const missing = TARGET_REPS.filter(r => !repUsers[r]);
  if (missing.length > 0) {
    console.log(`\n   ⚠️  Could not match: ${missing.join(', ')}`);
    console.log('   All users in SalesLoft:');
    for (const u of allUsers) {
      console.log(`     - "${u.first_name} ${u.last_name}" (ID: ${u.id}, Email: ${u.email}, Active: ${u.active})`);
    }
  }

  if (Object.keys(repUsers).length === 0) {
    console.error('\n❌ No matching reps found. Check user names in SalesLoft.');
    process.exit(1);
  }

  // Step 2: Pull activity data per rep per month
  console.log('\n📊 Step 2: Pulling activity data (Jan–Jun 2026)...\n');

  const months = [
    { year: 2026, month: 1, label: 'Jan 2026' },
    { year: 2026, month: 2, label: 'Feb 2026' },
    { year: 2026, month: 3, label: 'Mar 2026' },
    { year: 2026, month: 4, label: 'Apr 2026' },
    { year: 2026, month: 5, label: 'May 2026' },
    { year: 2026, month: 6, label: 'Jun 2026' },
  ];

  const results = {};

  for (const [repName, user] of Object.entries(repUsers)) {
    results[repName] = {};
    console.log(`   🧑 ${repName} (User ID: ${user.id})...`);

    for (const { year, month, label } of months) {
      const { start, end } = getMonthRange(year, month);
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      process.stdout.write(`      ${label}: `);

      // Pull calls
      let calls = [];
      try {
        calls = await fetchAll(
          `/activities/calls.json?user_guid[]=${user.guid || user.id}&created_at[gte]=${start}&created_at[lt]=${end}`
        );
      } catch (e) {
        // Try with user_id if guid fails
        try {
          calls = await fetchAll(
            `/activities/calls.json?user_id[]=${user.id}&created_at[gte]=${start}&created_at[lt]=${end}`
          );
        } catch (e2) {
          console.warn(`⚠️ Call fetch failed: ${e2.message}`);
        }
      }

      // Pull emails
      let emails = [];
      try {
        emails = await fetchAll(
          `/activities/emails.json?user_id[]=${user.id}&sent_at[gte]=${start}&sent_at[lt]=${end}`
        );
      } catch (e) {
        console.warn(`⚠️ Email fetch failed: ${e.message}`);
      }

      // Analyze calls
      const totalDials = calls.length;
      // "Connects" = calls with a disposition indicating connection
      const connectDispositions = ['connected', 'interested', 'meeting scheduled', 'demo scheduled', 'qualified'];
      const connects = calls.filter(c => {
        const disp = (c.disposition || '').toLowerCase();
        return connectDispositions.some(d => disp.includes(d)) || disp === 'connected';
      }).length;
      // "Conversations" = calls with duration >= 120 seconds (2 minutes)
      const conversations = calls.filter(c => {
        const dur = c.duration || 0;
        return dur >= 120;
      }).length;

      // Also count calls with any non-zero duration as an alternative metric
      const callsWithDuration = calls.filter(c => (c.duration || 0) > 0).length;

      // Analyze emails
      const emailsSent = emails.filter(e =>
        !e.bounced && ['sent', 'sent_from_gmail', 'sent_from_external'].includes(e.status || 'sent')
      ).length;
      const totalEmails = emails.length;
      const emailsReplied = emails.filter(e => (e.status || '').includes('replied')).length;
      const emailsBounced = emails.filter(e => e.bounced).length;

      results[repName][monthKey] = {
        dials: totalDials,
        connects,
        conversations,
        calls_with_duration: callsWithDuration,
        emails_sent: emailsSent,
        total_emails: totalEmails,
        emails_replied: emailsReplied,
        emails_bounced: emailsBounced,
      };

      console.log(`${totalDials} calls, ${connects} connects, ${conversations} convos (≥2m), ${emailsSent} emails sent`);
    }
    console.log('');
  }

  // Step 3: Comparison table
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 COMPARISON: SalesLoft API vs Seed Data');
  console.log('═══════════════════════════════════════════════════════════════\n');

  for (const repName of Object.keys(results)) {
    console.log(`\n🧑 ${repName}`);
    console.log('─'.repeat(110));
    console.log(
      'Month'.padEnd(10),
      '│',
      'Dials(SL)'.padStart(10),
      'Dials(Seed)'.padStart(12),
      'Δ'.padStart(6),
      '│',
      'Emails(SL)'.padStart(11),
      'Emails(Seed)'.padStart(13),
      'Δ'.padStart(6),
      '│',
      'Convos(SL)'.padStart(11),
      'Convos(Seed)'.padStart(13),
      'Δ'.padStart(6),
    );
    console.log('─'.repeat(110));

    for (const { year, month, label } of months) {
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const sl = results[repName]?.[monthKey];
      const seed = SEED_DATA[repName]?.[monthKey];

      if (!sl) continue;

      const fmtDelta = (a, b) => {
        if (b === null || b === undefined) return '  NEW';
        const d = a - b;
        if (d === 0) return '    =';
        return (d > 0 ? '+' : '') + String(d).padStart(5);
      };

      console.log(
        label.padEnd(10),
        '│',
        String(sl.dials).padStart(10),
        String(seed?.dials ?? '—').padStart(12),
        fmtDelta(sl.dials, seed?.dials),
        '│',
        String(sl.emails_sent).padStart(11),
        String(seed?.emails_sent ?? '—').padStart(13),
        fmtDelta(sl.emails_sent, seed?.emails_sent),
        '│',
        String(sl.conversations).padStart(11),
        String(seed?.conversations ?? '—').padStart(13),
        fmtDelta(sl.conversations, seed?.conversations),
      );
    }
    console.log('─'.repeat(110));

    // Also show connects comparison
    console.log('\n  Connects detail:');
    for (const { year, month, label } of months) {
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const sl = results[repName]?.[monthKey];
      const seed = SEED_DATA[repName]?.[monthKey];
      if (!sl) continue;
      console.log(
        `    ${label}: SL=${sl.connects} (by disposition), Calls w/ duration=${sl.calls_with_duration}, Seed=${seed?.connects ?? 'N/A'}`
      );
    }

    // Show email reply data (bonus)
    console.log('\n  Email engagement (bonus data from SalesLoft):');
    for (const { year, month, label } of months) {
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const sl = results[repName]?.[monthKey];
      if (!sl) continue;
      console.log(
        `    ${label}: ${sl.total_emails} total, ${sl.emails_sent} sent, ${sl.emails_replied} replied, ${sl.emails_bounced} bounced`
      );
    }
    console.log('');
  }

  // Step 4: Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📋 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`Total API requests made: ${requestCount}`);
  console.log(`Reps audited: ${Object.keys(results).length}`);
  console.log(`Months covered: Jan–Jun 2026\n`);

  // Check for June data availability
  for (const repName of Object.keys(results)) {
    const jun = results[repName]?.['2026-06'];
    if (jun && (jun.dials > 0 || jun.emails_sent > 0)) {
      console.log(`✅ ${repName} has June 2026 data: ${jun.dials} dials, ${jun.emails_sent} emails, ${jun.conversations} convos`);
    } else {
      console.log(`⚠️  ${repName}: No June 2026 activity data found`);
    }
  }

  console.log('\n🏁 Audit complete!\n');
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
