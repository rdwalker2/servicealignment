import React, { useMemo, useState, useEffect, useRef } from 'react';
import MapGL, { Source, Layer, Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import './PortfolioWeatherMap.css';
import { ShieldAlert, Activity, ArrowRight, Crosshair } from 'lucide-react';
import type { MapRef } from 'react-map-gl';

interface PortfolioWeatherMapProps {
  predictiveData: any;
}

export const PortfolioWeatherMap: React.FC<PortfolioWeatherMapProps> = ({ predictiveData }) => {
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const mapRef = useRef<MapRef>(null);

  // Extract coordinates for markers
  const markers = useMemo(() => {
    if (!predictiveData || !predictiveData.properties) return [];
    
    return predictiveData.properties.map((item: any) => {
      const coords = item.property?.coordinates?.coordinates;
      if (!coords || coords.length !== 2) return null;
      
      const score = item.healthScore?.health_score ?? 100;
      let color = '#10b981'; // Green
      if (score < 50) color = '#ef4444'; // Red
      else if (score < 70) color = '#f97316'; // Orange
      else if (score < 85) color = '#eab308'; // Yellow

      return {
        id: item.property.id,
        longitude: coords[0],
        latitude: coords[1],
        score,
        color,
        name: item.property.property_name
      };
    }).filter(Boolean);
  }, [predictiveData]);

  // Calculate bounds to fit all markers
  const initialViewState = useMemo(() => {
    if (markers.length === 0) {
      return { longitude: -84.5120, latitude: 39.1031, zoom: 10 }; // Default to Cincinnati
    }
    
    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
    markers.forEach((m: any) => {
      if (m.longitude < minLng) minLng = m.longitude;
      if (m.longitude > maxLng) maxLng = m.longitude;
      if (m.latitude < minLat) minLat = m.latitude;
      if (m.latitude > maxLat) maxLat = m.latitude;
    });

    const lng = (minLng + maxLng) / 2;
    const lat = (minLat + maxLat) / 2;
    
    // Calculate dynamic zoom based on extent
    const lngDiff = maxLng - minLng;
    const latDiff = maxLat - minLat;
    const maxDiff = Math.max(lngDiff, latDiff, 0.01);
    
    // Roughly 360 degrees is zoom 0. Each zoom halves the degrees.
    let zoom = markers.length === 1 ? 15 : Math.floor(Math.log2(360 / maxDiff)) - 1;
    // Constrain zoom to sensible values
    zoom = Math.max(3, Math.min(zoom, 14));
    
    return {
      longitude: lng,
      latitude: lat,
      zoom: zoom,
      pitch: 45
    };
  }, [markers]);


  const [radarUrl, setRadarUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch RainViewer predictive radar (nowcast)
    const fetchPredictiveRadar = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) return;
        const data = await res.json();
        
        // Grab the latest predictive frame (nowcast)
        if (data && data.radar && data.radar.nowcast && data.radar.nowcast.length > 0) {
          const nowcastFrames = data.radar.nowcast;
          const targetFrame = nowcastFrames[Math.min(2, nowcastFrames.length - 1)]; // 30 mins into future
          
          // Format: host + path + /size/z/x/y/color/smooth_0_1.png
          // color 2 = classic radar colors, 1_1 = smooth overlay
          const url = `${data.host}${targetFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;
          setRadarUrl(url);
        }
      } catch (e) {
        console.error("Failed to load predictive radar", e);
      }
    };
    
    fetchPredictiveRadar();
  }, []);

  const satelliteStyle = useMemo(() => ({
    version: 8,
    sources: {
      'satellite': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'satellite',
        type: 'raster',
        source: 'satellite',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  }), []);

  return (
    <div className="premium-map-container" style={{ width: '100%', height: '500px', borderRadius: '16px', border: '1px solid #e7e5e4', position: 'relative', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
      {/* HUD Overlay */}
      <div className="absolute top-3 left-3 md:top-5 md:left-5 z-10 bg-black/80 text-white p-2.5 md:p-3 rounded-lg backdrop-blur-md border border-white/10 shadow-xl max-w-[calc(100%-24px)] pointer-events-none">
        <div className="text-[0.55rem] md:text-[0.65rem] font-extrabold tracking-[0.15em] text-red-500 mb-1 flex items-center gap-1.5 uppercase">
          <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
          Live Satellite Uplink
        </div>
        <div className="text-sm md:text-[0.9rem] font-bold leading-tight">Property Portfolio Monitor</div>
        <div className="text-[0.65rem] md:text-[0.75rem] text-white/60 mt-0.5">Predictive Doppler Radar Active (T+30m Forecast)</div>
      </div>

      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={satelliteStyle as any}
        interactive={true}
      >
        {/* Predictive Doppler Radar (RainViewer Nowcast) */}
        {radarUrl && (
          <Source
            id="predictive-radar"
            type="raster"
            tiles={[radarUrl]}
            tileSize={256}
          >
            <Layer
              id="predictive-radar-layer"
              type="raster"
              paint={{
                'raster-opacity': 0.6,
                'raster-fade-duration': 500
              }}
            />
          </Source>
        )}

        {/* Live Weather Radar (IEM Nexrad) */}
        <Source
          id="live-weather-radar"
          type="raster"
          tiles={['https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png']}
          tileSize={256}
        >
          <Layer
            id="live-weather-radar-layer"
            type="raster"
            paint={{
              'raster-opacity': 0.7,
              'raster-fade-duration': 500
            }}
          />
        </Source>


        <NavigationControl position="bottom-right" />

        {/* Render Property Markers */}
        {markers.map((m: any) => (
          <Marker
            key={m.id}
            longitude={m.longitude}
            latitude={m.latitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedMarker(m);
              // Fly to the marker and offset the latitude slightly so the popup fits perfectly
              mapRef.current?.flyTo({
                center: [m.longitude, m.latitude],
                zoom: Math.max(10, initialViewState.zoom + 2), // Zoom in slightly
                duration: 1200,
                offset: [0, 80] // Shift the center down by 80px to make room for popup
              });
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: 'translateY(5px)',
              cursor: 'pointer'
            }}>
              {/* Pulsing ring behind marker */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: m.color,
                opacity: 0.4,
                animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                zIndex: -1
              }} />

              {/* Marker Body */}
              <div style={{
                background: 'rgba(9, 9, 11, 0.95)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                boxShadow: `0 0 15px ${m.color}66`,
                border: `1px solid ${m.color}`,
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: 6, height: 6, 
                  borderRadius: '50%', 
                  backgroundColor: m.color,
                  boxShadow: `0 0 8px ${m.color}`
                }} />
                {m.score}
              </div>
              {/* Pointer arrow */}
              <div style={{
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: `6px solid rgba(9, 9, 11, 0.95)`
              }} />
            </div>
          </Marker>
        ))}

        {selectedMarker && (
          <Popup
            longitude={selectedMarker.longitude}
            latitude={selectedMarker.latitude}
            // By omitting anchor, Maplibre automatically calculates the best anchor side
            offset={[0, -20]}
            onClose={() => setSelectedMarker(null)}
            closeOnClick={false}
            className="premium-map-popup"
            style={{ padding: 0 }}
          >
            <div style={{ 
              background: 'rgba(9, 9, 11, 0.95)', 
              color: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
              padding: '16px',
              width: '260px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.2 }}>
                  {selectedMarker.name}
                </h4>
              </div>

              <div style={{ 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '8px', 
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Activity size={14} color={selectedMarker.color} />
                  Health Score
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedMarker.color }}>
                  {selectedMarker.score}
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <Crosshair size={14} className="mt-0.5" style={{ color: selectedMarker.color }} />
                <span>Geospatial weather tracking actively monitoring this location.</span>
              </div>

              <button 
                onClick={() => {
                  const el = document.getElementById(`property-${selectedMarker.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  color: '#0f172a',
                  border: 'none',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                View Full Diagnosis <ArrowRight size={14} />
              </button>
            </div>
          </Popup>
        )}
      </MapGL>
    </div>
  );
};
