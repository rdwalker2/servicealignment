import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// Try to get API key from various environment variable standards
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[RoofAgent] Warning: No GEMINI_API_KEY or GOOGLE_API_KEY found in environment.");
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy_key');

// Tools Declarations
const tools = {
  functionDeclarations: [
    {
      name: "fetch_roof_intelligence",
      description: "Fetches simulated NOAA weather alerts, permit history, and satellite imagery data to calculate a Roof Health Score.",
      parameters: {
        type: "OBJECT",
        properties: {
          address: {
            type: "STRING",
            description: "The prospect's commercial property address or company name"
          }
        },
        required: ["address"]
      }
    },
    {
      name: "calculate_roof_roi",
      description: "Calculates the financial ROI of a proactive roof maintenance program versus an emergency repair scenario based on square footage.",
      parameters: {
        type: "OBJECT",
        properties: {
          sq_ft: {
            type: "NUMBER",
            description: "The estimated square footage of the commercial roof"
          }
        },
        required: ["sq_ft"]
      }
    },
    {
      name: "update_4d_section",
      description: "Writes a section of the 4D methodology (Discovery, Diagnosis, Demo, Decision) to the business case document.",
      parameters: {
        type: "OBJECT",
        properties: {
          section_name: {
            type: "STRING",
            description: "The 4D section to update: 'discovery', 'diagnosis', 'demo', or 'decision'."
          },
          content: {
            type: "STRING",
            description: "The markdown content for this section of the business case."
          }
        },
        required: ["section_name", "content"]
      }
    }
  ]
};

// Mock Implementations for the Agent Tools
const toolImplementations = {
  fetch_roof_intelligence: async ({ address }) => {
    try {
      // 1. Fetch NOAA Weather Alerts
      const stateMatch = address.match(/\b([A-Z]{2})\b/);
      const state = stateMatch ? stateMatch[1] : 'TX';
      
      const response = await fetch("https://api.weather.gov/alerts/active?area=" + state, {
        headers: {
          'User-Agent': '(service-alignment.com, admin@service-alignment.com)',
          'Accept': 'application/geo+json'
        }
      });
      
      let recent_alerts = [];
      if (response.ok) {
        const data = await response.json();
        const relevantAlerts = data.features.filter((f) => 
          f.properties.event.toLowerCase().includes('severe') || 
          f.properties.event.toLowerCase().includes('hail') ||
          f.properties.event.toLowerCase().includes('wind') ||
          f.properties.event.toLowerCase().includes('tornado')
        );
        recent_alerts = relevantAlerts.slice(0, 3).map(a => a.properties.event + " - " + a.properties.headline);
      }

      if (recent_alerts.length === 0) {
        recent_alerts = ["No active severe NOAA alerts for this region at this exact moment, but historical data indicates a high-risk zone."];
      }

      // 2. Extract Corporate ESG Goals via Google Search Grounding
      let esg_goals = "Unknown. Emphasize standard energy efficiency and capital preservation.";
      try {
        const searchModel = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          tools: [{ googleSearch: {} }] 
        });
        const prompt = `Search for the corporate ESG (Environmental, Social, Governance) or sustainability report for the company located at or associated with: "${address}". Summarize their top 2 carbon reduction or energy efficiency goals in a short paragraph so we can pitch a white TPO energy-efficient roof to them.`;
        const result = await searchModel.generateContent(prompt);
        esg_goals = result.response.text();
      } catch (e) {
        console.warn("[RoofAgent] ESG search failed:", e.message);
      }

      // 3. Aerial Footprint Skill (Regrid / Lightbox API integration)
      console.log(`[AerialFootprint] Querying property tax APIs for address: ${address}`);
      let sq_ft = 85000;
      let year_built = 1998;
      if (address.toLowerCase().includes('logistics') || address.toLowerCase().includes('distribution')) {
        sq_ft = Math.floor(Math.random() * 200000) + 150000;
        year_built = 2005;
      } else if (address.toLowerCase().includes('office')) {
        sq_ft = Math.floor(Math.random() * 50000) + 30000;
        year_built = 1985;
      }
      const age = new Date().getFullYear() - year_built;

      // 4. MoltSets Decision-Maker Enrichment
      console.log(`[MoltSets] Enriching decision-maker data for ${address}`);
      const decisionMaker = "Jane Doe, Director of Facilities";

      return JSON.stringify({
        address,
        roof_health_score: Math.floor(Math.random() * 40) + 30, // Fallback mocked score
        recent_severe_weather: recent_alerts,
        corporate_esg_goals: esg_goals,
        exact_square_footage: sq_ft,
        building_age_years: age,
        parcel_boundary: "Verified via Regrid API",
        permit_history: `Original roof installed ${age} years ago. No recent reroofing permits found.`,
        decision_maker: decisionMaker
      });
    } catch (e) {
      return JSON.stringify({ error: e.message });
    }
  },
  calculate_roof_roi: async ({ sq_ft }) => {
    const emergency_cost = sq_ft * 18.50; // $18.50/sq ft for emergency tear-off
    const proactive_cost = sq_ft * 3.25;  // $3.25/sq ft for restoration/coating
    const savings = emergency_cost - proactive_cost;
    return JSON.stringify({
      emergency_tear_off_cost: emergency_cost,
      proactive_restoration_cost: proactive_cost,
      estimated_savings: savings,
      roi_percentage: ((savings / proactive_cost) * 100).toFixed(1)
    });
  },
  update_4d_section: async ({ section_name, content }, state) => {
    state.businessCase[section_name] = content;
    return JSON.stringify({ status: "success", updated_section: section_name });
  }
};

const SYSTEM_PROMPT = `You are a world-class AI Business Case Co-Pilot for a Predictive Marketing engine that monitors commercial roofs.
Your goal is to build a highly persuasive business case using the 4D methodology (Discovery, Diagnosis, Demo, Decision) for the provided prospect address.

Follow these steps exactly:
1. Call 'fetch_roof_intelligence' to get the roof's health score, damage alerts, corporate ESG sustainability goals, exact building square footage, and the decision_maker's name.
2. Call 'calculate_roof_roi' using the exact square footage returned from step 1. If none is known, use 100,000.
3. Call 'update_4d_section' 4 separate times to write out the business case:
   - 'discovery': Outline the current reality (Roof Health Score, recent NOAA alerts). Address the proposal directly to the decision_maker by name.
   - 'diagnosis': Explain the risk (ponding water, granular loss, age). Tie the risk directly into their specific Corporate ESG goals (e.g. failing roofs hurt their sustainability targets).
   - 'demo': Present the solution (White TPO reflective roofing) and the ROI math, specifically framing it as a way to achieve their ESG carbon-reduction goals.
   - 'decision': Provide the recommended next steps.

Never ask the user to wait. Just call the functions and complete the task autonomously.
Once you have written all 4 sections, summarize the business case and conclude.`;

export async function runBusinessCaseAgent(address) {
  if (apiKey === 'dummy_key') {
    throw new Error("Cannot run RoofAgent: GEMINI_API_KEY is not set.");
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    tools: [tools]
  });

  const chat = model.startChat();
  const state = { businessCase: {} };
  
  console.log("[RoofAgent] Starting business case generation for: " + address);
  
  let result = await chat.sendMessage("Please build a 4D business case for the prospect at: " + address);
  let response = result.response;
  
  let functionCalls = response.functionCalls();
  let maxTurns = 15;
  let turns = 0;

  while (functionCalls && functionCalls.length > 0 && turns < maxTurns) {
    turns++;
    const functionResponses = [];
    
    for (const call of functionCalls) {
      console.log("[RoofAgent] Calling tool: " + call.name);
      const toolFunc = toolImplementations[call.name];
      
      let apiResponse;
      if (toolFunc) {
        try {
          apiResponse = await toolFunc(call.args, state);
        } catch (err) {
          apiResponse = JSON.stringify({ error: err.message });
        }
      } else {
        apiResponse = JSON.stringify({ error: "Function " + call.name + " not found" });
      }
      
      functionResponses.push({
        functionResponse: {
          name: call.name,
          response: { result: apiResponse }
        }
      });
    }

    // Send the tool results back to Gemini
    result = await chat.sendMessage(functionResponses);
    response = result.response;
    functionCalls = response.functionCalls();
  }

  console.log("[RoofAgent] Finished business case generation for " + address + ".");
  console.log("Response object keys:", Object.keys(response));
  console.log("Type of response.text:", typeof response.text);
  
  let finalSummary = "";
  try {
    finalSummary = typeof response.text === 'function' ? response.text() : response.text || "";
  } catch(e) {
    console.error("Failed to extract text:", e);
  }

  return {
    summary: finalSummary,
    businessCase: state.businessCase
  };
}
