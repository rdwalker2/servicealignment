import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateROI(propertyName?: string) {
  console.log('===========================================================');
  console.log(' GENERATING ROOF WARS ROI PROJECTIONS ');
  console.log('===========================================================\n');

  let query = supabase.from('roof_properties').select('id, property_name, square_footage, workspace_id');
  
  if (propertyName) {
    query = query.ilike('property_name', `%${propertyName}%`).limit(1);
  } else {
    // just do one for testing if none provided
    query = query.limit(1);
  }

  const { data: properties, error: propErr } = await query;

  if (propErr || !properties || properties.length === 0) {
    console.error('❌ Could not find property:', propertyName);
    return;
  }

  for (const prop of properties) {
    console.log(`📍 Processing: ${prop.property_name} (${prop.square_footage || 0} sq ft)`);

    if (!prop.square_footage) {
      console.log('⚠️ Property has no square footage. Cannot calculate accurate ROI.');
      continue;
    }

    // Check for hail signals
    const { data: signals } = await supabase.from('roof_signals').select('signal_type, signal_data').eq('property_id', prop.id);
    const hasHail = signals?.some(s => s.signal_type === 'weather' && typeof s.signal_data === 'string' && s.signal_data.includes('hail'));

    console.log(`   - Hail Detected: ${hasHail ? 'Yes' : 'No'}`);

    const sqFt = prop.square_footage;

    // Roof Wars Math
    const capexRisk = sqFt * 7.20 * (hasHail ? 0.65 : 0.07);
    const disruptionCost = hasHail ? 10000 : 2500;
    const maintenanceSpike = sqFt * 0.10 * (hasHail ? 3 : 1);
    const totalRisk = capexRisk + disruptionCost + maintenanceSpike;

    const tearOffCost = sqFt * 15.00;
    const coatingCost = sqFt * 7.20;
    const reactiveSpend = sqFt * 0.45;

    console.log(`   - CapEx Liability: $${capexRisk.toLocaleString()}`);
    console.log(`   - Disruption Cost: $${disruptionCost.toLocaleString()}`);
    console.log(`   - Maintenance Spike: $${maintenanceSpike.toLocaleString()}`);
    console.log(`   - 1-Year Cost of Inaction: $${totalRisk.toLocaleString()}`);
    console.log(`   - Full Replacement (Best): $${tearOffCost.toLocaleString()}`);
    console.log(`   - Coating Mitigation (Better): $${coatingCost.toLocaleString()}`);

    // Generate DiscoverySession payload for Prospector Room
    // Create an ID that links it to the property so it can be looked up via token
    const token = prop.property_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Check if campaign outreach exists to map the token
    const { data: campaign } = await supabase.from('campaign_outreach').select('prospect_room_token').eq('property_id', prop.id).single();
    const prospectToken = campaign?.prospect_room_token || token;

    const sessionId = crypto.randomUUID();

    const sessionData = {
      id: sessionId,
      rep_id: 'system',
      company_name: prop.property_name,
      property_id: prop.id,
      roof_square_footage: sqFt,
      roi_total: totalRisk,
      deal_stage: 'diagnosis',
      status: 'in_progress',
      created_at: new Date().toISOString(),
      
      // Pricing Packages (Good, Better, Best)
      pricing_packages: [
        { id: 'pkg_good', name: 'Good (Reactive Band-Aid)', description: 'Mitigate immediate leak risk. No warranty extension.', addon_ids: [] },
        { id: 'pkg_better', name: 'Better (Restoration)', description: 'Preserve the asset. Extend warranty by 10-15 years.', addon_ids: [] },
        { id: 'pkg_best', name: 'Best (Tear-Off / Replacement)', description: 'Reset lifecycle to Year 0. 20-Year NDL Warranty.', addon_ids: [] }
      ],
      pricing_setup_type: 'options',
      pricing_presentation_style: 'options',
      
      // We will store the base prices in custom ROI assumptions so the UI can pick them up
      roi_assumptions: {
        cost_good: reactiveSpend,
        cost_better: coatingCost,
        cost_best: tearOffCost,
        cost_of_inaction_10yr: coatingCost * 0.40 // 40% accelerated decay
      }
    };

    const { error: upsertErr } = await supabase.from('discovery_sessions').upsert({
      id: sessionId,
      workspace_id: prop.workspace_id || 'default',
      company_name: prop.property_name,
      data: sessionData as any,
      created_at: sessionData.created_at,
      updated_at: new Date().toISOString()
    });

    if (upsertErr) {
      console.error(`❌ Failed to inject ROI session:`, upsertErr);
    } else {
      console.log(`✅ Successfully injected ROI projections into Prospect Room: ${prospectToken}`);
    }
  }

  console.log('\n✅ ROI Generation Pipeline Complete.');
}

const args = process.argv.slice(2);
const propertyName = args[0];
generateROI(propertyName);
