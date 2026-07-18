import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runWeatherMonitor() {
  console.log('\n===========================================================');
  console.log(' PREDICTIVE ENGINE: REAL-TIME WEATHER MONITORING CRON');
  console.log('===========================================================\n');

  // 1. Fetch properties
  const { data: properties, error } = await supabase
    .from('roof_properties')
    .select('id, property_name, address, site_address, coordinates');

  if (error || !properties) {
    console.error('❌ Failed to fetch properties:', error?.message);
    return;
  }

  // Calculate the time window (last 24 hours) for NOAA SWDI
  // Note: For the prototype we format it as YYYYMMDD:YYYYMMDD
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  
  // Format as YYYYMMDD
  const formatNOAADate = (d: Date) => {
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  };
  
  const dateRange = `${formatNOAADate(startDate)}:${formatNOAADate(endDate)}`;
  console.log(`⏰ Scanning window: ${dateRange} (Last 24 Hours)`);

  for (const prop of properties) {
    let lat = 32.8129, lon = -96.9017; // Default fallback to Dallas
    if (prop.coordinates) {
      let coordsObj = prop.coordinates;
      if (typeof coordsObj === 'string') {
        try { coordsObj = JSON.parse(coordsObj); } catch(e) {}
      }
      if (coordsObj.coordinates && coordsObj.coordinates.length === 2) {
        lon = coordsObj.coordinates[0];
        lat = coordsObj.coordinates[1];
      }
    }

    console.log(`\n🏢 Property: ${prop.property_name} [${lat}, ${lon}]`);
    console.log(`  ☁️ Querying NOAA SWDI for recent hail...`);

    try {
      // Query NOAA Severe Weather Data Inventory (SWDI) for nx3hail within 5 miles
      const apiUrl = `https://www.ncei.noaa.gov/swdiws/json/nx3hail/${dateRange}?radius=5.0&center=${lon},${lat}&stat=count`;
      
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      const count = data.result && data.result.length > 0 ? parseInt(data.result[0].COUNT) : 0;
      
      if (count > 0) {
        console.log(`  🚨 ACTION REQUIRED: ${count} Severe Hail Strikes detected over ${prop.property_name} in the last 24 hours!`);
        
        // 1. Insert Roof Signal Trigger
        await supabase.from('roof_signals').insert({
          property_id: prop.id,
          signal_type: 'weather',
          signal_data: JSON.stringify({ 
            description: `Urgent: ${count} severe hail anomalies recorded over this property in the last 24 hours. Dispatch inspection immediately.` 
          }),
          detected_at: new Date().toISOString()
        });

        // 2. Fetch current health score and penalize it
        const { data: scores } = await supabase
          .from('roof_health_scores')
          .select('*')
          .eq('property_id', prop.id)
          .order('calculated_at', { ascending: false })
          .limit(1);

        if (scores && scores.length > 0) {
          const currentScore = scores[0];
          const newScore = Math.max(0, currentScore.health_score - 25);
          
          let factors = [];
          try { factors = JSON.parse(currentScore.score_factors || '[]'); } catch(e){}
          factors.push({ factor: 'real_time_severe_hail', impact: -25 });

          await supabase.from('roof_health_scores').insert({
            property_id: prop.id,
            health_score: newScore,
            score_factors: JSON.stringify(factors),
            calculated_at: new Date().toISOString()
          });
          
          console.log(`  📉 Roof Health Score dropped from ${currentScore.health_score} to ${newScore}. Lead sent to rep.`);
        }
      } else {
        console.log(`  🌤️ Clear skies. No recent hail detected.`);
      }

    } catch (e: any) {
      console.error(`  ❌ Failed to query weather: ${e.message}`);
    }
  }

  console.log('\n✅ Weather Monitoring Scan Complete.');
}

runWeatherMonitor();
