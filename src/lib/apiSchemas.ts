// src/lib/apiSchemas.ts

/**
 * Weather & Hail Integration
 * Mocking HailTrace / CoreLogic API schemas
 */
export interface WeatherEvent {
  id: string;
  eventType: 'hail' | 'wind' | 'tornado';
  date: string; // ISO 8601
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: {
    hailSizeInches?: number;
    windSpeedMph?: number;
  };
  geoJsonPolygon: any; // A polygon defining the swath of the storm
}

/**
 * Property Data & Ownership Integration
 * Mocking Lightbox / Regrid API schemas
 */
export interface PropertyRecord {
  parcelId: string;
  ownerName: string;
  ownerContactEmail?: string;
  ownerContactPhone?: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  footprintPolygon?: any; // Building footprint GeoJSON
  squareFootage: number;
  buildingType: string;
  yearBuilt: number;
}

/**
 * Permit Data Integration
 * Mocking BuildZoom / Shovels.ai API schemas
 */
export interface PermitRecord {
  permitId: string;
  parcelId: string;
  permitType: 'roofing' | 'electrical' | 'plumbing' | 'general';
  filingDate: string;
  status: 'issued' | 'completed' | 'expired';
  description: string;
  contractorName: string;
  estimatedCost: number;
}

/**
 * The internal mapping of these external APIs to a Roof Health Score
 */
export function calculateSimulatedHealthScore(
  property: PropertyRecord,
  weatherEvents: WeatherEvent[],
  permits: PermitRecord[]
): { score: number; notes: string[] } {
  let score = 100;
  const notes: string[] = [];

  // 1. Age Factor (Determine from last roofing permit or year built)
  const roofPermits = permits.filter(p => p.permitType === 'roofing');
  // Simple heuristic: if no permits, assume original roof.
  const lastRoofDate = roofPermits.length > 0 
    ? new Date(Math.max(...roofPermits.map(p => new Date(p.filingDate).getTime())))
    : new Date(property.yearBuilt, 0, 1);
  
  const ageInYears = (new Date().getTime() - lastRoofDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  if (ageInYears > 20) {
    score -= 30;
    notes.push(`Roof age estimated > 20 years (${ageInYears.toFixed(1)} yrs).`);
  } else if (ageInYears > 10) {
    score -= 15;
    notes.push(`Roof age estimated at ${ageInYears.toFixed(1)} years.`);
  }

  // 2. Weather Event Factor
  for (const event of weatherEvents) {
    if (event.eventType === 'hail' && event.details.hailSizeInches && event.details.hailSizeInches >= 1.5) {
      score -= 40;
      notes.push(`${event.details.hailSizeInches} inch hail detected on ${event.date.split('T')[0]}.`);
    } else if (event.eventType === 'wind' && event.details.windSpeedMph && event.details.windSpeedMph >= 70) {
      score -= 20;
      notes.push(`Severe wind event (${event.details.windSpeedMph} mph) detected.`);
    }
  }

  return {
    score: Math.max(0, score),
    notes
  };
}
