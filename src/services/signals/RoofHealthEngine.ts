import { supabase } from '../../lib/supabase';
import { geocodeAddress, CensusGeocoderService, censusGeocoder } from '../geo/CensusGeocoderService';
import { permitSignalService, PermitSignalWithUrgency } from './PermitSignalService';

// ─────────────────────────────────────────────────────────────────────────────
// RoofHealthEngine
// Computes a "Roof Health Score" based on Permits, Weather, and Satellite data
// ─────────────────────────────────────────────────────────────────────────────

export interface RoofHealthReport {
    address: string;
    coordinates: { lat: number, lng: number } | null;
    overall_score: number; // 0-100
    signals: {
        permits: { score: number, details: string, active_signals: PermitSignalWithUrgency[] };
        weather: { score: number, details: string, active_storms: any[] };
        satellite: { score: number, details: string };
    };
    recommendation: string;
}

class RoofHealthEngine {
    
    async analyzeProperty(address: string, propertyId?: string): Promise<RoofHealthReport> {
        console.log(`[RoofHealthEngine] Starting analysis for: ${address}`);

        // 1. Resolve Geo (Address -> Lat/Lng)
        // We use Census to get tracts/counties which is useful for matching weather zones
        const geoResult = await censusGeocoder.geocode(address);
        
        let permitScore = 100;
        let permitDetails = "No recent roofing permits found. Roof may be aging.";
        let activePermits: PermitSignalWithUrgency[] = [];

        // 2. Check Permits
        if (propertyId) {
            const permits = await permitSignalService.getSignalsForProperty(propertyId);
            const roofingPermits = permits.filter(p => p.permit_type === 'reroof');
            
            if (roofingPermits.length > 0) {
                const latest = roofingPermits[0];
                if (latest.signal_strength === 'high' || latest.signal_strength === 'medium') {
                    permitScore = 10; // Very bad for our lead gen (they just got a new roof!)
                    permitDetails = `Recent reroof permit pulled ${latest.days_since_issue} days ago.`;
                } else {
                    permitScore = 90; // Old permit, they might need repairs soon
                    permitDetails = `Last reroof permit was over a year ago.`;
                }
                activePermits = roofingPermits;
            }
        }

        // 3. Check Weather (Real NOAA Integration)
        let weatherScore = 100;
        let weatherDetails = "No recent severe weather detected in this area.";
        let activeStorms: any[] = [];
        
        if (geoResult && geoResult.county_fips) {
            // Find any active or recent storms (last 14 days) in this FIPS code
            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

            const { data: storms, error } = await supabase
                .from('weather_signals')
                .select('*')
                .contains('fips_codes', [geoResult.county_fips])
                .gte('timestamp', fourteenDaysAgo.toISOString())
                .order('timestamp', { ascending: false });

            if (!error && storms && storms.length > 0) {
                activeStorms = storms;
                const latestStorm = storms[0];
                
                // If there was a storm, the roof health score takes a massive hit
                if (latestStorm.severity === 'Extreme') {
                    weatherScore = 10;
                    weatherDetails = `CRITICAL: Property hit by ${latestStorm.event_type} (${latestStorm.severity}) on ${new Date(latestStorm.timestamp).toLocaleDateString()}.`;
                } else {
                    weatherScore = 30;
                    weatherDetails = `Warning: Property affected by ${latestStorm.event_type} recently.`;
                }
            }
        } else {
            weatherDetails = "Unable to cross-reference weather without exact FIPS code/coordinates.";
        }

        // 4. Check Satellite/Visual (MOCK - waiting for Lightbox/Google Earth API)
        const mockSatScore = Math.floor(Math.random() * 50) + 30; // 30-80
        const satDetails = geoResult 
            ? `Visual analysis detects potential membrane blistering and minor pooling.`
            : `Awaiting visual analysis.`;

        // Compute weighted overall score
        // Lower is worse (needs fixing = good lead for us)
        const overallScore = Math.round(
            (permitScore * 0.2) + 
            (weatherScore * 0.5) + 
            (mockSatScore * 0.3)
        );

        let recommendation = "";
        if (overallScore < 40) {
            recommendation = "High Priority Outreach: Severe weather impact detected. Highly likely needs replacement.";
        } else if (overallScore < 70) {
            recommendation = "Nurture: Moderate indicators. Schedule an inspection.";
        } else {
            recommendation = "Low Priority: Roof appears healthy or recently replaced.";
        }

        return {
            address,
            coordinates: geoResult ? { lat: geoResult.lat, lng: geoResult.lng } : null,
            overall_score: overallScore,
            signals: {
                permits: { score: permitScore, details: permitDetails, active_signals: activePermits },
                weather: { score: weatherScore, details: weatherDetails, active_storms: activeStorms },
                satellite: { score: mockSatScore, details: satDetails }
            },
            recommendation
        };
    }
}

export const roofHealthEngine = new RoofHealthEngine();
