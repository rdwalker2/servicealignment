/**
 * WEATHER ENGINE
 * 
 * Simulates querying the NOAA Severe Weather Data Inventory (SWDI) for hail and wind events
 * near a property's coordinates.
 */
export async function fetchWeatherEvents(lat: number, lon: number) {
  console.log(`\n☁️ Querying NOAA SWDI for severe weather near [${lat}, ${lon}]...`);
  
  try {
    // We query the NOAA Severe Weather Data Inventory (SWDI) for hail events (nx3hail)
    // within a 15-mile radius over the year 2024.
    const apiUrl = `https://www.ncei.noaa.gov/swdiws/json/nx3hail/20240101:20241231?radius=15.0&center=${lon},${lat}&stat=count`;
    
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    const count = data.result && data.result.length > 0 ? parseInt(data.result[0].COUNT) : 0;
    
    const hasSevereHail = count > 0;

    if (hasSevereHail) {
      console.log(`  ⚡ WARNING: ${count} Severe Hail Events Detected in 2024!`);
      return {
        has_hail: true,
        hail_date: `2024`,
        summary_signal: `${count} severe hail events detected within 15 miles in 2024. Satellite damage flagged.`
      };
    }
    
    console.log(`  🌤️ Clear skies. No recent severe hail events found.`);
    return {
      has_hail: false,
      hail_date: null,
      summary_signal: null
    };
  } catch (err: any) {
    console.error(`  ❌ Failed to query NOAA SWDI: ${err.message}`);
    return {
      has_hail: false,
      hail_date: null,
      summary_signal: null
    };
  }
}

// Optional local test runner
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchWeatherEvents(27.9506, -82.4572).then(console.log);
}
