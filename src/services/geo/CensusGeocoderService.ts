/**
 * CensusGeocoderService — Free US Address Geocoding
 * ═══════════════════════════════════════════════════════════════════════════
 * Adapted for Roof Health Monitor.
 *
 * Uses the US Census Bureau Geocoding Service (free, no API key, no rate limit):
 *   - Single address: REST endpoint → returns lat/lng + FIPS codes
 *   - Batch mode: CSV upload → up to 10,000 addresses per request
 *
 * Returns: lat, lng, state_fips, county_fips, tract, block, match_quality
 */

import { supabase } from '../../lib/supabase';

const SERVICE = 'CensusGeocoder';

// ── Census Bureau API endpoints ─────────────────────────────────────────────
const CENSUS_SINGLE_URL = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress';
const CENSUS_BATCH_URL = 'https://geocoding.geo.census.gov/geocoder/geographies/addressbatch';
const BENCHMARK = 'Public_AR_Current';
const VINTAGE = 'Current_Current';

// ── Types ────────────────────────────────────────────────────────────────────

export interface GeocodedAddress {
    lat: number;
    lng: number;
    matched_address: string;
    match_quality: 'EXACT' | 'NON_EXACT' | 'INTERPOLATED';
    state_fips: string | null;
    county_fips: string | null;
    tract: string | null;
    block: string | null;
    source: 'CENSUS_GEOCODER';
}

export interface BatchGeoResult {
    id: string;
    result: GeocodedAddress | null;
}

// ── In-memory cache for session ─────────────────────────────────────────────
const geocodeCache = new Map<string, GeocodedAddress | null>();

class CensusGeocoderService {

    /**
     * Geocode a single address string.
     * Returns lat/lng + FIPS codes, or null if no match.
     */
    async geocode(address: string): Promise<GeocodedAddress | null> {
        const cacheKey = address.trim().toLowerCase();
        
        // L1: In-memory cache (zero latency)
        if (geocodeCache.has(cacheKey)) {
            return geocodeCache.get(cacheKey) || null;
        }

        // L2: Supabase persistent cache (survives restarts)
        try {
            const { data: cached } = await supabase
                .from('geocode_cache')
                .select('result')
                .eq('address_key', cacheKey)
                .maybeSingle();
            
            if (cached?.result) {
                const result = cached.result as GeocodedAddress;
                geocodeCache.set(cacheKey, result);
                console.log(`[${SERVICE}] Cache hit (Supabase): ${address}`);
                return result;
            }
        } catch {
            // Table may not exist yet — fall through to API
        }

        try {
            const url = new URL(CENSUS_SINGLE_URL);
            url.searchParams.set('address', address);
            url.searchParams.set('benchmark', BENCHMARK);
            url.searchParams.set('vintage', VINTAGE);
            url.searchParams.set('format', 'json');

            const response = await fetch(url.toString(), {
                signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) {
                console.warn(`[${SERVICE}] Census API HTTP ${response.status} for: ${address}`);
                return null;
            }

            const data = await response.json() as any;
            const matches = data?.result?.addressMatches;

            if (!matches || matches.length === 0) {
                console.log(`[${SERVICE}] No geocode match for: ${address}`);
                geocodeCache.set(cacheKey, null);
                return null;
            }

            const match = matches[0];
            const coords = match.coordinates;
            const geographies = match.geographies;

            // Extract FIPS codes from Census Blocks (most granular)
            const blocks = geographies?.['Census Blocks']?.[0] || {};
            const tracts = geographies?.['Census Tracts']?.[0] || {};
            const counties = geographies?.['Counties']?.[0] || {};
            const states = geographies?.['States']?.[0] || {};

            const result: GeocodedAddress = {
                lat: coords.y,
                lng: coords.x,
                matched_address: match.matchedAddress || address,
                match_quality: match.tigerLine?.side ? 'EXACT' : 'INTERPOLATED',
                state_fips: states.STATE || blocks.STATE || null,
                county_fips: counties.COUNTY ? `${states.STATE || ''}${counties.COUNTY}` : null,
                tract: tracts.TRACT || blocks.TRACT || null,
                block: blocks.BLOCK || null,
                source: 'CENSUS_GEOCODER',
            };

            console.log(`[${SERVICE}] Geocoded: ${address} → ${result.lat.toFixed(5)}, ${result.lng.toFixed(5)} (FIPS: ${result.state_fips}-${result.county_fips}, tract ${result.tract})`);

            geocodeCache.set(cacheKey, result);
            
            // Persist to Supabase for cross-session caching
            this.persistToCache(cacheKey, address, result).catch(() => {});
            
            return result;

        } catch (err: any) {
            console.error(`[${SERVICE}] Geocode error for "${address}": ${err.message}`);
            return null;
        }
    }

    /**
     * Geocode a parsed address with individual components.
     */
    async geocodeComponents(street: string, city: string, state: string, zip?: string): Promise<GeocodedAddress | null> {
        const full = [street, city, state, zip].filter(Boolean).join(', ');
        return this.geocode(full);
    }

    /**
     * Batch geocode multiple addresses.
     * Uses the Census batch endpoint (CSV upload, up to 10K addresses).
     */
    async geocodeBatch(addresses: Array<{ id: string; address: string }>): Promise<BatchGeoResult[]> {
        if (addresses.length === 0) return [];
        if (addresses.length > 10000) {
            console.warn(`[${SERVICE}] Batch too large (${addresses.length}), truncating to 10,000`);
            addresses = addresses.slice(0, 10000);
        }

        // Build CSV: ID, Street, City, State, ZIP
        // For one-line addresses, put everything in the street field
        const csv = addresses.map(a =>
            `${a.id},"${a.address.replace(/"/g, '')}","","",""`
        ).join('\n');

        try {
            const formData = new FormData();
            formData.append('addressFile', new Blob([csv], { type: 'text/csv' }), 'addresses.csv');
            formData.append('benchmark', BENCHMARK);
            formData.append('vintage', VINTAGE);

            const response = await fetch(CENSUS_BATCH_URL, {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(60000), // 60s for large batches
            });

            if (!response.ok) {
                throw new Error(`Census batch API HTTP ${response.status}`);
            }

            const text = await response.text();
            return this.parseBatchResponse(text);

        } catch (err: any) {
            console.error(`[${SERVICE}] Batch geocode error: ${err.message}`);
            return addresses.map(a => ({ id: a.id, result: null }));
        }
    }

    /**
     * Parse Census batch response CSV.
     */
    private parseBatchResponse(text: string): BatchGeoResult[] {
        const results: BatchGeoResult[] = [];

        for (const line of text.split('\n')) {
            if (!line.trim()) continue;

            // Census batch CSV uses quoted fields with commas inside
            const parts = line.split(',');
            const id = parts[0]?.replace(/"/g, '').trim();
            const matchIndicator = parts[2]?.replace(/"/g, '').trim();
            const coordsStr = parts[5]?.replace(/"/g, '').trim();

            if (!id) continue;

            if (matchIndicator === 'Match' && coordsStr) {
                const [lngStr, latStr] = coordsStr.split(',');
                const lat = parseFloat(latStr);
                const lng = parseFloat(lngStr);

                if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                    const rawStateFips = parts[8]?.replace(/"/g, '').trim() || null;
                    const rawCountyFips = parts[9]?.replace(/"/g, '').trim() || null;
                    const rawTract = parts[10]?.replace(/"/g, '').trim() || null;
                    const rawBlock = parts[11]?.replace(/"/g, '').trim() || null;

                    const countyFips = (rawStateFips && rawCountyFips)
                        ? `${rawStateFips}${rawCountyFips}`
                        : null;

                    results.push({
                        id,
                        result: {
                            lat, lng,
                            matched_address: parts[4]?.replace(/"/g, '').trim() || '',
                            match_quality: 'EXACT',
                            state_fips: rawStateFips,
                            county_fips: countyFips,
                            tract: rawTract,
                            block: rawBlock,
                            source: 'CENSUS_GEOCODER',
                        },
                    });
                } else {
                    results.push({ id, result: null });
                }
            } else {
                results.push({ id, result: null });
            }
        }

        console.log(`[${SERVICE}] Batch: ${results.length} processed, ${results.filter(r => r.result).length} matched`);

        return results;
    }

    /** Clear the in-memory cache */
    clearCache(): void {
        geocodeCache.clear();
    }

    /** Persist geocode result to Supabase for cross-session caching */
    private async persistToCache(key: string, address: string, result: GeocodedAddress): Promise<void> {
        try {
            await supabase.from('geocode_cache').upsert({
                address_key: key,
                raw_address: address,
                result,
                state_fips: result.state_fips,
                county_fips: result.county_fips,
                cached_at: new Date().toISOString(),
            }, { onConflict: 'address_key' });
        } catch (err: any) {
            console.warn(`[${SERVICE}] Cache persist failed: ${err.message}`);
        }
    }

    getCacheStats(): { memory: number } {
        return { memory: geocodeCache.size };
    }
}

export const censusGeocoder = new CensusGeocoderService();
