import dotenv from 'dotenv';
dotenv.config();

import { runGranolaSync } from './granola-sync.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  console.log('Inserting test Deal Rooms...');
  
  // Insert Test Deal Room for Farmers District 40
  await supabase.from('discovery_sessions').upsert({
    id: 'ds_test_farmers',
    rep_id: 'rep-jl', // Using Jack Luther's ID
    company_name: 'Farmers District 40',
    company_domain: 'farmers.com',
    status: 'evaluating',
    selected_pains: ['poor-candidate-communication', 'no-pipeline-visibility'],
    data: {
      meddpicc: {},
      bap_answers: {}
    }
  });

  // Insert Test Deal Room for RxDiet
  await supabase.from('discovery_sessions').upsert({
    id: 'ds_test_rxdiet',
    rep_id: 'rep-jl',
    company_name: 'RxDiet',
    company_domain: 'rxdiet.com',
    status: 'evaluating',
    selected_pains: ['tool-sprawl-centralization'],
    data: {
      meddpicc: {},
      bap_answers: {}
    }
  });

  console.log('Running Granola Sync...');
  const result = await runGranolaSync();
  console.log('Sync Result:', result);
  
  // Find the sessions that were matched
  const { data: queue } = await supabase
    .from('granola_sync_queue')
    .select('session_id, granola_note_title, status, pending_review_fields')
    .eq('status', 'pending');
    
  if (queue && queue.length > 0) {
    console.log('\n✅ Sync successfully matched and processed notes!');
    for (const q of queue) {
      console.log(`\n--- Deal Room ID: ${q.session_id} ---`);
      console.log(`Note Title: ${q.granola_note_title}`);
      
      const fields = q.pending_review_fields || {};
      
      console.log('\nExtracted Summary:');
      console.log(fields.summary);
      
      console.log('\nExtracted MEDDPICC:');
      console.log(JSON.stringify(fields.meddpicc, null, 2));

      console.log('\nExtracted Next Steps:');
      console.log(JSON.stringify(fields.next_steps, null, 2));
    }
  } else {
    console.log('\n❌ No pending items in queue.');
  }
}

test();
