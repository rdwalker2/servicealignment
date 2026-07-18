
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * PERMIT CRAWLER
 * 
 * Simulates navigating a County Building Department portal, extracting permit history,
 * and using Gemini to determine Roof Age and Warranty expiration.
 */
export async function fetchAndAnalyzePermits(address: string) {
  console.log(`\n▶️ Starting Permit Crawler for: ${address}`);
  
  try {
    // 1. Fetch real permit data from Dallas Open Data API (Legacy Building Permits)
    console.log(`  🌐 Querying Dallas Open Data API...`);
    
    // We'll search the historical Dallas permit dataset for the street name
    // e.g. address: "151 Regal Row Dallas TX" -> search for "REGAL"
    const streetNameMatch = address.match(/\d+\s+([a-zA-Z]+)\s+/);
    const streetName = streetNameMatch ? streetNameMatch[1].toUpperCase() : 'REGAL';
    
    // Using Socrata full-text search parameter $q
    const apiUrl = `https://www.dallasopendata.com/resource/e7gq-4sah.json?$q=${streetName}&$limit=20`;
    
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} from Dallas Open Data`);
    
    const permits = await res.json();
    
    if (permits.length === 0) {
       console.log(`  ⚠️ No permits found in Dallas Open Data for street: ${streetName}`);
       return null;
    }
    
    // Format the real permit data into a readable table for Gemini
    console.log(`  📄 Extracting Permit History (${permits.length} records found)...`);
    let permitText = `PERMIT HISTORY FOR ${address.toUpperCase()}\n\nPermit # | Type | Description | Status | Issued Date\n--------------------------------------------------------------\n`;
    
    for (const p of permits) {
      const pNum = p.permit_number || 'N/A';
      const pType = p.permit_type || 'N/A';
      const pDesc = p.work_description || p.permit_type || 'N/A';
      const pStatus = p.status || 'N/A';
      const pDate = p.issued_date ? p.issued_date.substring(0, 10) : 'N/A';
      permitText += `${pNum} | ${pType} | ${pDesc} | ${pStatus} | ${pDate}\n`;
    }

    // 3. Use Gemini to analyze the real permit history
    console.log(`  🧠 Analyzing real permit data with Gemini...`);
    const currentYear = new Date().getFullYear();
    
    let extracted: any;
    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are an expert commercial roofing analyst. Review the following REAL permit history table from the City of Dallas.
      Find the most recent commercial roof replacement, re-roof, or roofing permit.
      If a roofing permit exists, calculate the roof age in years (current year is ${currentYear}). Assume the roof was replaced the year the permit was issued.
      Assume a standard 15-year commercial roof warranty starting from the year the permit was issued.
      Calculate the warranty expiration year.
      
      Respond STRICTLY in JSON format with the following keys:
      - "roof_age_years" (number or null if no roof permit found)
      - "warranty_expiration_year" (number or null)
      - "is_warranty_expired" (boolean or null)
      - "summary_signal" (string): A short, punchy 1-2 sentence alert. Example: "Warranty expired in 2025." or "No roof permit found in historical data."
      
      TEXT:
      ${permitText}
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) extracted = JSON.parse(jsonMatch[0]);
    } else {
      console.log(`  ❌ GEMINI_API_KEY not found. Please provide an API key to analyze real data.`);
      return null;
    }
    
    if (extracted) {
      console.log(`  ✅ Extraction Complete: Age = ${extracted.roof_age_years}, Warranty Expires = ${extracted.warranty_expiration_year}`);
      return extracted;
    }

  } catch (error: any) {
    console.error(`  ❌ Crawler failed: ${error.message}`);
    return null;
  }
}

// Optional local test runner
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAndAnalyzePermits('151 Regal Row Dallas TX').then(console.log);
}
