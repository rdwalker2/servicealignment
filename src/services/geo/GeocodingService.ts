// ─────────────────────────────────────────────────────────────────────────────
// GeocodingService — Address ↔ Coordinate ↔ Jurisdiction resolution
// Adapted for Roof Health Monitor Predictive Marketing
// ─────────────────────────────────────────────────────────────────────────────

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'RoofHealthMonitor/1.0 (predictive@servicealignment.com)';

export interface GeocodingResult {
    lat: number;
    lng: number;
    display_name: string;
    city: string | null;
    county: string | null;
    state: string | null;
    state_code: string | null;
    postcode: string | null;
    country: string | null;
}

/**
 * Forward geocode: address string → coordinates.
 * Uses OpenStreetMap Nominatim (free, 1 req/sec rate limit).
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
        const params = new URLSearchParams({
            q: address,
            format: 'json',
            addressdetails: '1',
            limit: '1',
            countrycodes: 'us',
        });

        const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
            headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        });

        if (!res.ok) return null;
        const data = await res.json();
        if (!data || data.length === 0) return null;

        const result = data[0];
        const addr = result.address || {};

        return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            display_name: result.display_name || address,
            city: addr.city || addr.town || addr.village || null,
            county: addr.county || null,
            state: addr.state || null,
            state_code: addr.state_code?.toUpperCase() || null,
            postcode: addr.postcode || null,
            country: addr.country || null,
        };
    } catch (error) {
        console.error(`[Geocoding] Forward geocode failed for: ${address}`, error);
        return null;
    }
}

/**
 * Reverse geocode: coordinates → address components.
 * Used for lat/lng → jurisdiction resolution.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
    try {
        const params = new URLSearchParams({
            lat: String(lat),
            lon: String(lng),
            format: 'json',
            addressdetails: '1',
        });

        const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
            headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        });

        if (!res.ok) return null;
        const result = await res.json();
        const addr = result.address || {};

        return {
            lat, lng,
            display_name: result.display_name || '',
            city: addr.city || addr.town || addr.village || null,
            county: addr.county || null,
            state: addr.state || null,
            state_code: addr.state_code?.toUpperCase() || null,
            postcode: addr.postcode || null,
            country: addr.country || null,
        };
    } catch (error) {
        console.error(`[Geocoding] Reverse geocode failed for: ${lat},${lng}`, error);
        return null;
    }
}
