import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fetchAndAnalyzePermits } from './permit-crawler';

dotenv.config({ path: ['.env.local', '.env'] });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function runEnrichment() {
  console.log('===========================================================');
  console.log(' PREDICTIVE ENGINE: ROOF INTELLIGENCE ENRICHMENT PIPELINE');
  console.log('===========================================================');

  // For this prototype, we'll fetch a small batch of properties to enrich
  // In production, this would query for properties where `last_enriched_at` is null or old
  const { data: properties, error: propErr } = await supabase
    .from('roof_properties')
    .select('id, property_name, site_address, coordinates, workspace_id')
    .limit(3); // Just 3 for the demo to save time

  if (propErr || !properties || properties.length === 0) {
    console.error('No properties found to enrich.');
    return;
  }

  for (const prop of properties) {
    console.log(`\n🏢 Processing Property: ${prop.property_name} (${prop.site_address})`);
    let healthScore = 100; // Start at 100
    let scoreFactors = [];

    // 1. Fetch Building Permits & Warranty Info
    const permitData = await fetchAndAnalyzePermits(prop.site_address);
    if (permitData) {
      if (permitData.is_warranty_expired) {
        healthScore -= 30; // Huge penalty for expired warranty
        scoreFactors.push({ factor: 'warranty_expired', impact: -30 });
        
        // Insert a signal for the warranty expiration
        await supabase.from('roof_signals').insert({
          property_id: prop.id,
          signal_type: 'permit',
          signal_data: JSON.stringify({ description: permitData.summary_signal }),
          detected_at: new Date().toISOString()
        });
      } else if (permitData.roof_age_years > 10) {
        healthScore -= 15; // Moderate penalty for aging roof
        scoreFactors.push({ factor: 'aging_roof', impact: -15 });
        
        await supabase.from('roof_signals').insert({
          property_id: prop.id,
          signal_type: 'permit',
          signal_data: JSON.stringify({ description: `Roof is ${permitData.roof_age_years} years old. Approaching mid-life capital planning phase.` }),
          detected_at: new Date().toISOString()
        });
      }
    }

    // Ensure score doesn't drop below 0
    healthScore = Math.max(0, healthScore);

    // 2. Update Health Score
    console.log(`  📊 Final Baseline Health Score: ${healthScore}`);
    
    // We will upsert or insert the new health score
    await supabase.from('roof_health_scores').delete().eq('property_id', prop.id); // Clear old scores for prototype
    
    const { error: scoreErr } = await supabase.from('roof_health_scores').insert({
      property_id: prop.id,
      health_score: healthScore,
      score_factors: JSON.stringify(scoreFactors),
      calculated_at: new Date().toISOString()
    });
    
    if (scoreErr) {
      console.error(`  ❌ Failed to save health score: ${scoreErr.message}`);
    } else {
      console.log(`  ✅ Successfully enriched baseline data for ${prop.property_name}!`);
    }
  }

  console.log('\n✅ Baseline Enrichment Pipeline Complete.');
}

runEnrichment();
