#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════════════
// Customer Data Migration Script
// Reads customerUniverse.ts and inserts all records into Supabase
//
// Usage:
//   1. Run the SQL in supabase/customers_table.sql first
//   2. node scripts/migrate_customers.cjs
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ── Load environment variables from .env ──
const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  env[key] = value;
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Extract CUSTOMERS array from the TypeScript file ──
function extractCustomers() {
  const tsPath = path.resolve(__dirname, '..', 'src', 'data', 'customerUniverse.ts');
  console.log(`📂 Reading: ${tsPath}`);

  const content = fs.readFileSync(tsPath, 'utf-8');
  const lines = content.split('\n');

  // Find the line that starts the CUSTOMERS array
  let startLine = -1;
  let endLine = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('export const CUSTOMERS: Customer[] = [')) {
      startLine = i;
    }
    // The array ends with '];' on its own line (after the last object)
    if (startLine !== -1 && i > startLine && lines[i].trim() === '];') {
      endLine = i;
      break;
    }
  }

  if (startLine === -1 || endLine === -1) {
    console.error('❌ Could not find CUSTOMERS array boundaries');
    console.error(`   startLine: ${startLine}, endLine: ${endLine}`);
    process.exit(1);
  }

  console.log(`📊 Found array: lines ${startLine + 1} to ${endLine + 1}`);

  // Extract just the array content (the [ is at end of startLine, ] is at endLine)
  // Build: [ ...objects... ]
  const arrayLines = lines.slice(startLine, endLine + 1);
  // Replace the export prefix to get clean JSON
  arrayLines[0] = '[';
  arrayLines[arrayLines.length - 1] = ']';

  const jsonStr = arrayLines.join('\n');
  console.log(`📊 Extracted JSON: ${(jsonStr.length / 1024 / 1024).toFixed(1)} MB`);

  try {
    const customers = JSON.parse(jsonStr);
    console.log(`✅ Parsed ${customers.length} customer records`);
    return customers;
  } catch (err) {
    // If JSON.parse fails, try a more lenient approach — strip trailing commas
    console.log('⚠️  JSON.parse failed, trying with trailing comma cleanup...');
    const cleaned = jsonStr.replace(/,\s*([}\]])/g, '$1');
    try {
      const customers = JSON.parse(cleaned);
      console.log(`✅ Parsed ${customers.length} customer records (after cleanup)`);
      return customers;
    } catch (err2) {
      console.error('❌ Failed to parse JSON:', err2.message);
      console.error('   First 200 chars:', jsonStr.slice(0, 200));
      console.error('   Last 200 chars:', jsonStr.slice(-200));
      process.exit(1);
    }
  }
}

// ── Map camelCase to snake_case for DB insertion ──
function toDbRow(customer) {
  return {
    id: customer.id,
    account_name: customer.accountName,
    website: customer.website,
    career_site: customer.careerSite,
    phase: customer.phase,
    last_active: customer.lastActive,
    linkedin_url: customer.linkedinUrl,
    segment: customer.segment,
    employee_range: customer.employeeRange,
    previous_ats: customer.previousAts,
    billing_country: customer.billingCountry,
    billing_state: customer.billingState,
    region: customer.region,
    country_flag: customer.countryFlag,
    industry: customer.industry,
    won_opportunities: customer.wonOpportunities,
    nps_score: customer.npsScore,
    nps_classification: customer.npsClassification,
    nps_avg_score: customer.npsAvgScore,
    nps_responses: customer.npsResponses,
  };
}

// ── Batch insert in chunks ──
async function batchInsert(customers) {
  const CHUNK_SIZE = 500;
  const rows = customers.map(toDbRow);
  const totalChunks = Math.ceil(rows.length / CHUNK_SIZE);

  console.log(`\n🚀 Inserting ${rows.length} records in ${totalChunks} batches of ${CHUNK_SIZE}...\n`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const batchNum = Math.floor(i / CHUNK_SIZE) + 1;

    const { error } = await supabase
      .from('customers')
      .upsert(chunk, { onConflict: 'id' });

    if (error) {
      console.error(`  ❌ Batch ${batchNum}/${totalChunks} failed:`, error.message);
      errors++;
    } else {
      inserted += chunk.length;
      const pct = ((inserted / rows.length) * 100).toFixed(0);
      console.log(`  ✅ Batch ${batchNum}/${totalChunks} — ${inserted}/${rows.length} (${pct}%)`);
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ Migration complete: ${inserted} records inserted`);
  if (errors > 0) {
    console.log(`⚠️  ${errors} batch(es) had errors`);
  }
  console.log(`${'═'.repeat(50)}\n`);
}

// ── Verify insertion ──
async function verify() {
  const { count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Verification query failed:', error.message);
    return;
  }

  console.log(`🔍 Verification: ${count} records in 'customers' table`);

  // Spot-check first record
  const { data } = await supabase
    .from('customers')
    .select('id, account_name, segment, phase, region')
    .limit(1)
    .single();

  if (data) {
    console.log(`📋 Sample record:`, JSON.stringify(data, null, 2));
  }
}

// ── Main ──
async function main() {
  console.log('═'.repeat(50));
  console.log('  Customer Universe → Supabase Migration');
  console.log('═'.repeat(50));
  console.log(`\n🔗 Supabase URL: ${SUPABASE_URL}\n`);

  const customers = extractCustomers();
  await batchInsert(customers);
  await verify();
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
