import { EnrichmentOrchestrator } from '../src/lib/data-engine/orchestrator';

async function runTests() {
  console.log("==================================================");
  console.log("🔬 NATIVE ENRICHMENT ORCHESTRATOR TEST 🔬");
  console.log("==================================================");

  const targets = [
    "1151 Galleria Blvd, Roseville, CA", // Should map to Brookfield
    "8000 Metro Air Pkwy, Sacramento, CA", // Should map to Prologis
    "999 Random Unknown St, Chicago, IL"   // Should fallback gracefully
  ];

  for (const address of targets) {
    const result = await EnrichmentOrchestrator.runPipeline(address);
    console.log(`\nFinal Payload Delivered to Supabase for [${address}]:`);
    console.log(JSON.stringify(result, null, 2));
    console.log("--------------------------------------------------");
  }
}

runTests().catch(console.error);
