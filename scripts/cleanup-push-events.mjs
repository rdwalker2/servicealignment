/**
 * Cleanup script for corrupted push_events in Supabase.
 * 
 * THE BUG: useSignalBoardCache.ts was calling insertPushEvent with arguments
 * in the wrong order:
 *   insertPushEvent(domain, 'account', repId, {outreach: true})
 * 
 * But the function signature expects:
 *   insertPushEvent(entityType, entityId, tool, pushedBy)
 * 
 * This means corrupted rows have:
 *   entity_type = a domain string (e.g., "acme.com")
 *   entity_id = "account" or "contact" (literal strings)
 *   tool = a rep ID (e.g., "rep-jl")
 *   pushed_by = "[object Object]" (stringified object)
 * 
 * This script:
 * 1. Finds all corrupted rows
 * 2. Fixes their column values by swapping them back
 * 3. Reports what was cleaned
 * 
 * RUN: node --env-file=.env cleanup-push-events.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('🔍 Scanning push_events for corrupted rows...\n');

  // Fetch all push events
  const { data: rows, error } = await supabase
    .from('push_events')
    .select('*');

  if (error) {
    console.error('Failed to fetch push_events:', error);
    return;
  }

  if (!rows || rows.length === 0) {
    console.log('✅ No push events found. Table is clean.');
    return;
  }

  console.log(`Found ${rows.length} total push_events.\n`);

  // Identify corrupted rows:
  // entity_type should be 'account' or 'contact' — if it's anything else, it's corrupted
  const validEntityTypes = ['account', 'contact'];
  const corrupted = rows.filter(r => !validEntityTypes.includes(r.entity_type));
  const clean = rows.filter(r => validEntityTypes.includes(r.entity_type));

  console.log(`  ✅ ${clean.length} clean rows`);
  console.log(`  ❌ ${corrupted.length} corrupted rows\n`);

  if (corrupted.length === 0) {
    console.log('🎉 No corrupted rows found. Nothing to fix!');
    return;
  }

  // Show what's corrupted
  console.log('Corrupted rows:');
  for (const row of corrupted) {
    console.log(`  entity_type="${row.entity_type}" entity_id="${row.entity_id}" tool="${row.tool}" pushed_by="${row.pushed_by}"`);
  }
  console.log('');

  // Fix each corrupted row:
  // The domain ended up in entity_type, "account"/"contact" ended up in entity_id
  // The repId ended up in tool, and {outreach:true} ended up in pushed_by
  let fixed = 0;
  let deleted = 0;

  for (const row of corrupted) {
    const correctedEntityType = row.entity_id; // "account" or "contact" was put here
    const correctedEntityId = row.entity_type;  // domain was put here
    const correctedTool = 'salesloft';           // was always meant to be salesloft
    const correctedPushedBy = row.tool;          // repId was put here

    // Validate the correction makes sense
    if (!validEntityTypes.includes(correctedEntityType)) {
      // Can't determine the correct entity_type — delete this row
      console.log(`  🗑️  Deleting unfixable row: entity_type="${row.entity_type}" entity_id="${row.entity_id}"`);
      
      // Delete by matching all original column values
      const { error: delErr } = await supabase
        .from('push_events')
        .delete()
        .eq('entity_type', row.entity_type)
        .eq('entity_id', row.entity_id)
        .eq('tool', row.tool);

      if (delErr) {
        console.error(`    Failed to delete:`, delErr);
      } else {
        deleted++;
      }
      continue;
    }

    // Delete the corrupted row first (can't update composite primary key)
    const { error: delErr } = await supabase
      .from('push_events')
      .delete()
      .eq('entity_type', row.entity_type)
      .eq('entity_id', row.entity_id)
      .eq('tool', row.tool);

    if (delErr) {
      console.error(`  Failed to delete corrupted row for ${correctedEntityId}:`, delErr);
      continue;
    }

    // Insert the corrected row
    const { error: insertErr } = await supabase
      .from('push_events')
      .upsert({
        entity_type: correctedEntityType,
        entity_id: correctedEntityId,
        tool: correctedTool,
        pushed_by: correctedPushedBy,
        pushed_at: row.pushed_at,
      }, { onConflict: 'entity_type,entity_id,tool' });

    if (insertErr) {
      console.error(`  Failed to insert corrected row for ${correctedEntityId}:`, insertErr);
    } else {
      console.log(`  ✅ Fixed: ${correctedEntityType} "${correctedEntityId}" → tool=${correctedTool}, pushed_by=${correctedPushedBy}`);
      fixed++;
    }
  }

  console.log(`\n🏁 Done! Fixed: ${fixed}, Deleted: ${deleted}, Skipped: ${corrupted.length - fixed - deleted}`);
}

cleanup().catch(console.error);
