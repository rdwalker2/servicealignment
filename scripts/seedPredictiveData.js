import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding predictive engine test data...");

  // Let's seed 4 JLL buildings to show the grid.
  const token = 'test-jll-hq';

  const buildings = [
    { name: 'JLL Corporate HQ', addr: '200 E Randolph St, Chicago, IL', score: 34, notes: 'Warranty expired Dec 2025. Hail event Mar 14, satellite damage flagged.' },
    { name: 'Crossroads Logistics Hub', addr: '1875 Distribution Way, Orlando, FL', score: 58, notes: 'Roof age 16 years. Ponding detected in 3 quadrants.' },
    { name: 'Meridian Technology Park', addr: '7700 Tech Cir, Orlando, FL', score: 76, notes: 'Minor seam separation detected.' },
    { name: 'Sunridge Distribution Center', addr: '5500 Sunridge Way, Tampa, FL', score: 92, notes: 'All systems normal. Routine monitoring active.' }
  ];

  for (const b of buildings) {
    const propertyId = crypto.randomUUID();
    
    // 1. Insert Property
    await supabase.from('roof_properties').upsert({
      id: propertyId,
      property_name: b.name,
      address: b.addr,
      square_footage: Math.floor(Math.random() * 200000) + 50000,
      industry: 'Commercial Real Estate'
    });

    // 2. Insert Signal
    await supabase.from('roof_signals').upsert({
      id: crypto.randomUUID(),
      property_id: propertyId,
      signal_type: 'automated',
      signal_data: { description: b.notes, severity: b.score < 50 ? 'high' : b.score < 70 ? 'medium' : 'low' }
    });

    // 3. Insert Score
    await supabase.from('roof_health_scores').upsert({
      id: crypto.randomUUID(),
      property_id: propertyId,
      health_score: b.score,
      score_factors: []
    });

    // 4. Insert Campaign Outreach
    await supabase.from('campaign_outreach').upsert({
      id: crypto.randomUUID(),
      property_id: propertyId,
      campaign_name: 'JLL Portfolio',
      status: 'active',
      prospect_room_token: token
    });
  }

  console.log("Seeding complete! You can view the business case at: /case/" + token);
}

seed();
