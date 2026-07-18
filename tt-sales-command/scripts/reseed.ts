import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { SEED_CLAY_ROWS } from './src/data/signalBoardData.js'; // Assuming tsx runs it

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE config in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("🔥 Wiping existing clay_signals table...");
  const { error: deleteErr } = await supabase
    .from('clay_signals')
    .delete()
    .neq('signal_name', 'bogus'); // deleting all rows

  if (deleteErr) {
    console.error("Error wiping:", deleteErr);
    process.exit(1);
  }

  console.log("✅ Wiped clay_signals. Reseeding with fresh, rich mock data...");

  // Batch insert
  const batchSize = 50;
  for (let i = 0; i < SEED_CLAY_ROWS.length; i += batchSize) {
    const batch = SEED_CLAY_ROWS.slice(i, i + batchSize).map(r => ({
      full_name: r.full_name,
      email: r.email,
      job_title: r.job_title,
      linkedin_url: r.linkedin_url,
      phone: r.phone,
      company_name: r.company_name,
      company_domain: r.company_domain,
      company_location: r.company_location,
      employee_count: r.employee_count,
      open_roles: r.open_roles,
      current_ats: r.current_ats,
      signal_name: r.signal_name,
      signal_source: r.signal_source,
      signal_score: r.signal_score,
      signal_description: r.signal_description,
      page_visited: r.page_visited,
      icp_tier: r.icp_tier,
      detected_at: r.detected_at,
      assigned_rep_id: r.assigned_rep_id,
      ai_research_brief: r.ai_research_brief,
      account_intel: r.account_intel,
      pain_points: r.pain_points,
      recommended_approach: r.recommended_approach,
      isp_explanation: r.isp_explanation,
      isp_score: r.isp_score,
      g2_score: r.g2_score,
      indeed_score: r.indeed_score,
      glassdoor_score: r.glassdoor_score,
      negative_reviews: r.negative_reviews,
      signal_category: r.signal_category,
      hiring_signals: r.hiring_signals,
    }));

    const { error: insertErr } = await supabase.from('clay_signals').insert(batch);
    if (insertErr) {
      console.error(`Error inserting batch ${i}:`, insertErr);
      process.exit(1);
    }
  }

  console.log(`✅ Successfully reseeded ${SEED_CLAY_ROWS.length} signals into Supabase!`);
}

run();
