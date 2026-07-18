import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import MapGL, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as MapIcon, Search, X, Building2, MapPin, Maximize2, ZoomIn, ArrowRight, CloudLightning, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRoofingMapData, MOCK_HAIL_SWATH } from '../lib/predictiveMapDb';
import { fetchLiveFootprints, fetchLiveTaxParcels } from '../lib/spatialDb';
import type { GeoFeatureCollection, GeoFeature } from '../lib/spatialDb';
import { supabase } from '../lib/supabase';

// ── Map style — CARTO's dark basemap (no API key required) ──
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// ── US center and zoom (Centered on Dallas, TX for live data demo) ──
const INITIAL_VIEW = {
  longitude: -96.8,
  latitude: 32.8,
  zoom: 12.5,
};

export default function TerritoryMap() {
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const [footprints, setFootprints] = useState<GeoFeatureCollection>({ type: 'FeatureCollection', features: [] });
  const [taxParcels, setTaxParcels] = useState<GeoFeatureCollection>({ type: 'FeatureCollection', features: [] });
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<GeoFeature | null>(null);
  const [popupCoords, setPopupCoords] = useState<[number, number] | null>(null);
  
  // Real-time LLC piercing state
  const [piercedData, setPiercedData] = useState<any>(null);
  const [isPiercing, setIsPiercing] = useState(false);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // ── Fetch data ──
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [footprintData, taxData] = await Promise.all([
          fetchLiveFootprints(),
          fetchLiveTaxParcels()
        ]);
        setFootprints(footprintData);
        setTaxParcels(taxData);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Filtered data (memoized) ──
  const filteredFootprints = useMemo(() => {
    let features = footprints.features;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      features = features.filter(f => 
        f.properties.property_name?.toLowerCase().includes(q)
      );
    }
    
    return { type: 'FeatureCollection' as const, features };
  }, [footprints, searchQuery]);

  // ── Stats ──
  const totalProperties = filteredFootprints.features.length;
  const atRiskCount = 0; // Legacy placeholder

  // ── Map click handler ──
  const handleMapClick = useCallback(async (e: any) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Check for footprint clicks
    const footprintLayers = ['roof-footprint-fill'];
    if (map.getLayer(footprintLayers[0])) {
      const features = map.queryRenderedFeatures(e.point, { layers: footprintLayers });
      if (features.length > 0) {
        const feature = features[0];
        // Center of the clicked polygon for popup
        const coords = [e.lngLat.lng, e.lngLat.lat] as [number, number];
        
        setSelectedFeature({ type: 'Feature', geometry: feature.geometry, properties: { ...feature.properties } });
        setPopupCoords(coords);
        setPiercedData(null); // Reset previous pierced data
        setIsPiercing(true);

        // Since the Anchor is immaculate, the data is already pre-computed on the feature!
        if (feature.properties.legal_owner_name) {
          setPiercedData({
            legal_owner_name: feature.properties.legal_owner_name,
            site_address: feature.properties.site_address,
            assessed_value: feature.properties.assessed_value,
            parcel_id: feature.properties.parcel_id
          });
        } else {
          setPiercedData(null);
        }
        
        setIsPiercing(false);
      } else {
        setSelectedFeature(null);
        setPopupCoords(null);
        setPiercedData(null);
      }
    }
  }, []);

  // ── Reset view ──
  const resetView = useCallback(() => {
    mapRef.current?.getMap()?.flyTo({ ...INITIAL_VIEW, duration: 1000 });
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#111]">
      {/* ── Header ── */}
      <div className="bg-[#1a1a1a] border-b border-[#333] px-6 py-3 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E1251B] to-[#991b1b] flex items-center justify-center shadow-sm">
            <ShieldAlert size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">Predictive Weather Radar</h1>
            <p className="text-[10px] text-gray-400">
              {loading ? 'Loading properties...' : (
                <>
                  <span className="font-semibold text-gray-300">{totalProperties}</span> properties monitored
                  {atRiskCount > 0 && <> · <span className="font-semibold text-[#ef4444]">{atRiskCount} At Risk</span></>}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md relative ml-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search properties or addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#222] border border-[#333] text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E1251B]/50 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={resetView}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#333] border border-[#444] transition-all"
            title="Reset view"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-[#1a1a1a] rounded-xl px-6 py-4 flex items-center gap-3 shadow-xl border border-[#333]">
                <div className="w-5 h-5 border-2 border-[#E1251B] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-white">Loading radar data...</span>
              </div>
            </div>
          )}

          <MapGL
            ref={mapRef}
            {...viewState}
            onMove={(evt: any) => setViewState(evt.viewState)}
            onClick={handleMapClick}
            mapStyle={MAP_STYLE}
            style={{ width: '100%', height: '100%' }}
            interactiveLayerIds={['roof-footprint-fill']}
            cursor="pointer"
          >
            <NavigationControl position="bottom-right" showCompass={false} />

            {/* ── Weather Overlay (Simulated Hail Swath) ── */}
            <Source id="weather-hail" type="geojson" data={MOCK_HAIL_SWATH}>
              <Layer
                id="weather-hail-fill"
                type="fill"
                paint={{
                  'fill-color': '#a855f7', // Purple for hail
                  'fill-opacity': 0.25,
                }}
              />
              <Layer
                id="weather-hail-outline"
                type="line"
                paint={{
                  'line-color': '#a855f7',
                  'line-width': 2,
                  'line-dasharray': [2, 2],
                }}
              />
            </Source>

            {/* ── County Tax Parcels (Yellow Outlines) ── */}
            <Source id="tax-parcels" type="geojson" data={taxParcels}>
              <Layer
                id="tax-parcel-outline"
                type="line"
                paint={{
                  'line-color': '#eab308', // Yellow
                  'line-width': 1.5,
                  'line-dasharray': [4, 2],
                  'line-opacity': 0.6,
                }}
              />
            </Source>

            {/* ── Overture Roof Footprints (Solid Polygons) ── */}
            <Source
              id="roof-footprints"
              type="geojson"
              data={filteredFootprints}
            >
              <Layer
                id="roof-footprint-fill"
                type="fill"
                paint={{
                  'fill-color': '#0ea5e9', // Sky blue
                  'fill-opacity': 0.3,
                }}
              />
              <Layer
                id="roof-footprint-outline"
                type="line"
                paint={{
                  'line-color': '#38bdf8', // Lighter blue
                  'line-width': 2,
                }}
              />
            </Source>

            {/* ── Popup ── */}
            {selectedFeature && popupCoords && (
              <Popup
                longitude={popupCoords[0]}
                latitude={popupCoords[1]}
                anchor="bottom"
                onClose={() => { setSelectedFeature(null); setPopupCoords(null); }}
                closeOnClick={false}
                maxWidth="340px"
                className="predictive-map-popup"
              >
                <PropertyPopupContent 
                  feature={selectedFeature} 
                  isPiercing={isPiercing} 
                  piercedData={piercedData} 
                />
              </Popup>
            )}
          </MapGL>

          {/* ── Legend overlay ── */}
          <div className="absolute bottom-6 left-4 bg-[#1a1a1a]/95 backdrop-blur-sm rounded-xl border border-[#333] px-4 py-3 shadow-lg z-10">
            <div className="flex items-center gap-3 text-[10px] flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-black" style={{ backgroundColor: '#22c55e' }} />
                <span className="text-gray-300 font-medium">Clear ({'>'}75)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-black" style={{ backgroundColor: '#f59e0b' }} />
                <span className="text-gray-300 font-medium">Watch (50-75)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-black" style={{ backgroundColor: '#ef4444' }} />
                <span className="text-gray-300 font-medium">At Risk ({'<'}50)</span>
              </div>
              
              <div className="w-px h-3 bg-[#444]" />
              
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#a855f7]/30 border border-[#a855f7] border-dashed" />
                <span className="text-gray-300 font-medium">NOAA Weather Layer</span>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border border-[#eab308] border-dashed" />
                <span className="text-gray-300 font-medium">County Tax Property Line</span>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#0ea5e9]/30 border border-[#38bdf8]" />
                <span className="text-gray-300 font-medium">Overture Commercial Footprint</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Property Popup Content (Data Engine Piercing) ──
function PropertyPopupContent({ feature, isPiercing, piercedData }: { feature: GeoFeature, isPiercing: boolean, piercedData: any }) {
  const p = feature.properties;
  
  return (
    <div className="min-w-[300px] text-white p-1 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 border-b border-[#333] pb-3">
        <div className="w-10 h-10 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-[#38bdf8]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] text-[#38bdf8] font-bold tracking-widest uppercase mb-0.5">Footprint Selected</div>
          <h3 className="text-sm font-bold text-white truncate">{p.property_name || 'Commercial Building'}</h3>
        </div>
      </div>

      {/* Spatial Join Engine Status */}
      <div className="bg-[#111] rounded-lg p-3 mb-3 border border-[#333]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Spatial Join Engine</span>
          {isPiercing ? (
             <div className="flex items-center gap-1.5 text-[#eab308]">
               <div className="w-2.5 h-2.5 border border-[#eab308] border-t-transparent rounded-full animate-spin" />
               <span className="text-[10px] font-bold">Piercing LLC...</span>
             </div>
          ) : piercedData ? (
             <div className="flex items-center gap-1 text-[#22c55e]">
               <ShieldAlert size={12} />
               <span className="text-[10px] font-bold">Matched</span>
             </div>
          ) : (
             <div className="text-[10px] font-bold text-gray-500">Unmatched</div>
          )}
        </div>

        {piercedData ? (
          <div className="space-y-2 mt-3 pt-2 border-t border-[#222]">
            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">Legal Tax Owner</div>
              <div className="text-xs font-bold text-white">{piercedData.legal_owner_name}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">Site Address</div>
              <div className="text-[11px] text-gray-300 flex items-start gap-1">
                <MapPin size={12} className="shrink-0 mt-0.5 text-gray-500" />
                <span>{piercedData.site_address}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">Parcel Number</div>
              <div className="text-xs font-mono text-gray-400 bg-[#000] px-1.5 py-0.5 rounded w-fit">{piercedData.parcel_id}</div>
            </div>
          </div>
        ) : !isPiercing ? (
           <div className="text-[11px] text-gray-500 mt-2">
             No intersecting county tax records found for this footprint.
           </div>
        ) : null}
      </div>

      {/* Action button */}
      <div className="mt-1">
        <button
          disabled={!piercedData}
          className="flex items-center justify-center gap-2 w-full text-xs font-bold text-white py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: piercedData ? '#E1251B' : '#333' }}
        >
          {piercedData ? 'Discover True Contacts (Apollo)' : 'Awaiting Tax Match'} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
