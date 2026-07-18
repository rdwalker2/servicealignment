import { supabase } from '../../../lib/supabase';

/**
 * NOAA Weather Events Adapter
 * ──────────────────────────────────────────────────────────────
 * Ingests real-time severe weather events (Hail, Wind, Tornado)
 * from NOAA's National Weather Service (NWS) Active Alerts.
 * 
 * Used for Predictive Marketing to trigger 'Roof Health Monitor'
 * outreach to commercial properties that were just hit by storms.
 */

export interface RawWeatherSignal {
    source: string;
    externalId: string;
    eventType: string;
    title: string;
    timestamp: Date;
    lat?: number;
    lng?: number;
    fields: {
        nws_severity: string;
        nws_certainty: string;
        nws_fips_codes: string[];
        nws_area_desc: string;
        nws_expires: string;
    };
    rawData: any;
}

/** Map NWS event types to roof-damaging events */
const NWS_EVENT_MAP: Record<string, string> = {
    'Tornado Warning': 'Tornado',
    'Hurricane Warning': 'Hurricane',
    'Severe Thunderstorm Warning': 'Severe Storm (Hail/Wind)',
    'High Wind Warning': 'High Wind',
};

/** Severity thresholds - only track events that destroy roofs */
const QUALIFYING_SEVERITIES = new Set(['Extreme', 'Severe']);
const QUALIFYING_CERTAINTIES = new Set(['Observed', 'Likely']);

export class NoaaWeatherAdapter {
    private readonly ALERTS_BASE = 'https://api.weather.gov/alerts/active';

    async pollAndProcess(): Promise<void> {
        try {
            console.log('[NoaaWeatherAdapter] Polling NWS Active Alerts for roof-damaging signals...');

            const response = await fetch(this.ALERTS_BASE, {
                headers: {
                    Accept: 'application/geo+json',
                    // NWS requires a User-Agent with contact info
                    'User-Agent': '(servicealignment.com, engineering@servicealignment.com)',
                },
                signal: AbortSignal.timeout(15000),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status} from NWS Alerts`);

            const geojson = await response.json();
            const features: any[] = geojson.features || [];

            console.log(`[NoaaWeatherAdapter] Received ${features.length} NWS alerts`);

            let processed = 0;
            const seenEvents = new Set<string>();

            for (const feature of features) {
                const props = feature.properties || {};
                const event = props.event || '';

                // Only process qualifying severe events
                if (!NWS_EVENT_MAP[event]) continue;
                if (!QUALIFYING_SEVERITIES.has(props.severity)) continue;
                if (!QUALIFYING_CERTAINTIES.has(props.certainty)) continue;

                // Deduplicate by geographic cluster
                const areaDesc = props.areaDesc || '';
                const dedupeKey = `${event}_${areaDesc.substring(0, 50)}`;
                if (seenEvents.has(dedupeKey)) continue;
                seenEvents.add(dedupeKey);

                const signal = this.mapToSignal(feature);
                if (signal) {
                    await this.saveSignal(signal);
                    processed++;
                }
            }

            console.log(`[NoaaWeatherAdapter] Logged ${processed} qualifying roof-damaging alerts`);
        } catch (error: any) {
            console.error(`[NoaaWeatherAdapter] Failed to poll NWS: ${error.message}`);
        }
    }

    private mapToSignal(feature: any): RawWeatherSignal | null {
        try {
            const props = feature.properties || {};
            const geometry = feature.geometry;

            let lat: number | undefined;
            let lng: number | undefined;

            if (geometry?.type === 'Polygon' && geometry.coordinates?.[0]) {
                const coords = geometry.coordinates[0] as [number, number][];
                const sumLat = coords.reduce((s, c) => s + c[1], 0);
                const sumLng = coords.reduce((s, c) => s + c[0], 0);
                lat = sumLat / coords.length;
                lng = sumLng / coords.length;
            } else if (geometry?.type === 'Point') {
                lng = geometry.coordinates[0];
                lat = geometry.coordinates[1];
            }

            const fipsArray: string[] = props.geocode?.FIPS6 || props.geocode?.UGC || [];
            if (!lat || !lng) {
                if (fipsArray.length === 0) return null;
            }

            return {
                source: 'noaa_nws',
                externalId: props.id || `${props.event}_${Date.now()}`,
                eventType: NWS_EVENT_MAP[props.event],
                title: `WEATHER ALERT: ${props.headline || props.event}`,
                timestamp: new Date(props.onset || props.effective || props.sent),
                lat,
                lng,
                fields: {
                    nws_severity: props.severity,
                    nws_certainty: props.certainty,
                    nws_area_desc: props.areaDesc,
                    nws_fips_codes: fipsArray,
                    nws_expires: props.expires,
                },
                rawData: props,
            };
        } catch (err: any) {
            console.warn(`[NoaaWeatherAdapter] Failed to map NWS alert: ${err.message}`);
            return null;
        }
    }

    private async saveSignal(signal: RawWeatherSignal): Promise<void> {
        try {
            const { error } = await supabase.from('weather_signals').upsert({
                external_id: signal.externalId,
                source: signal.source,
                event_type: signal.eventType,
                title: signal.title,
                timestamp: signal.timestamp.toISOString(),
                lat: signal.lat,
                lng: signal.lng,
                fips_codes: signal.fields.nws_fips_codes,
                severity: signal.fields.nws_severity,
                expires_at: signal.fields.nws_expires,
                raw_data: signal.rawData,
                created_at: new Date().toISOString()
            }, { onConflict: 'external_id' });

            if (error) {
                console.error(`[NoaaWeatherAdapter] Database error saving signal: ${error.message}`);
            }
        } catch (err: any) {
            console.error(`[NoaaWeatherAdapter] Failed to save signal: ${err.message}`);
        }
    }
}

export const noaaWeatherAdapter = new NoaaWeatherAdapter();
