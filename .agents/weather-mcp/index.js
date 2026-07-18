import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Create an MCP server instance
const server = new Server(
  {
    name: "weather-signals-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tool arguments schemas
const GetWeatherAlertsSchema = z.object({
  state: z.string().length(2).describe("Two-letter state abbreviation (e.g., TX, FL, NY)"),
});

const CalculateRoofRiskSchema = z.object({
  hasHail: z.boolean().describe("Whether hail was detected"),
  hasHighWind: z.boolean().describe("Whether high winds were detected (> 50mph)"),
  roofAgeYears: z.number().optional().describe("Age of the roof in years"),
});

// Expose tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_weather_alerts",
        description: "Get active severe weather alerts for a given US state using the free National Weather Service API.",
        inputSchema: {
          type: "object",
          properties: {
            state: { type: "string", description: "Two-letter state abbreviation (e.g., TX)" }
          },
          required: ["state"]
        }
      },
      {
        name: "calculate_roof_risk",
        description: "Calculate a 0-100 Roof Health Score based on weather signals and roof age.",
        inputSchema: {
          type: "object",
          properties: {
            hasHail: { type: "boolean" },
            hasHighWind: { type: "boolean" },
            roofAgeYears: { type: "number" }
          },
          required: ["hasHail", "hasHighWind"]
        }
      }
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_weather_alerts") {
    try {
      const { state } = GetWeatherAlertsSchema.parse(args);
      
      const response = await fetch(`https://api.weather.gov/alerts/active/area/${state.toUpperCase()}`, {
        headers: {
          "User-Agent": "ServiceAlignmentMCP/1.0",
          "Accept": "application/geo+json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`NWS API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract relevant alert summaries
      const alerts = data.features?.map((f) => ({
        event: f.properties.event,
        severity: f.properties.severity,
        headline: f.properties.headline,
        description: f.properties.description,
        areaDesc: f.properties.areaDesc
      })) || [];
      
      return {
        content: [{ type: "text", text: JSON.stringify({ state, total_alerts: alerts.length, alerts }, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching weather alerts: ${error.message}` }],
        isError: true,
      };
    }
  } 
  
  if (name === "calculate_roof_risk") {
    try {
      const { hasHail, hasHighWind, roofAgeYears } = CalculateRoofRiskSchema.parse(args);
      
      // Baseline score starts at 100 (perfect health)
      let score = 100;
      let notes = [];
      
      if (hasHail) {
        score -= 40;
        notes.push("CRITICAL: Severe hail detected. High probability of membrane punctures or granule loss.");
      }
      
      if (hasHighWind) {
        score -= 20;
        notes.push("WARNING: High winds detected. Risk of membrane uplift or perimeter flashing damage.");
      }
      
      if (roofAgeYears) {
        if (roofAgeYears > 20) {
          score -= 30;
          notes.push(`WARNING: Roof is ${roofAgeYears} years old (past typical useful life).`);
        } else if (roofAgeYears > 15) {
          score -= 15;
          notes.push(`NOTE: Roof is ${roofAgeYears} years old (approaching end of life).`);
        }
      }
      
      // Ensure score stays between 0 and 100
      score = Math.max(0, Math.min(100, score));
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({ 
            roof_health_score: score, 
            risk_level: score < 50 ? "High Risk" : score < 80 ? "Medium Risk" : "Low Risk",
            analysis: notes 
          }, null, 2) 
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error calculating risk: ${error.message}` }],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather Signals MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
