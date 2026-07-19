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


  const [radarFrames, setRadarFrames] = useState<{url: string, time: number, type: 'past' | 'nowcast'}[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Telemetry state
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  
  useEffect(() => {
    // Telemetry typewriter effect sequence
    const sequence = [
      { text: "> Uplink established.", delay: 500 },
      { text: "> Syncing NOAA & RainViewer radar feeds...", delay: 1500 },
      { text: "> SCANNING PORTFOLIO COORDINATES...", delay: 3000 },
      { text: "> ⚠️ WARNING: High-density storm cell detected intersecting regional assets.", delay: 5000 },
      { text: "> Activating predictive health score penalties.", delay: 7000 }
    ];

    let timeouts: NodeJS.Timeout[] = [];
    sequence.forEach((item, index) => {
      const t = setTimeout(() => {
        setTelemetryLogs(prev => [...prev, item.text]);
      }, item.delay);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    // Fetch RainViewer radar frames (past + nowcast)
    const fetchRadar = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) return;
        const data = await res.json();
        
        let frames: {url: string, time: number, type: 'past' | 'nowcast'}[] = [];
        
        if (data && data.radar) {
          if (data.radar.past) {
            data.radar.past.forEach((f: any) => {
              frames.push({
                url: `${data.host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`,
                time: f.time,
                type: 'past'
              });
            });
          }
          if (data.radar.nowcast) {
            data.radar.nowcast.forEach((f: any) => {
              frames.push({
                url: `${data.host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`,
                time: f.time,
                type: 'nowcast'
              });
            });
          }
          setRadarFrames(frames);
          if (frames.length > 0) {
            setCurrentFrameIndex(0);
          }
        }
      } catch (e) {
        console.error("Failed to load radar frames", e);
      }
    };
    
    fetchRadar();
  }, []);

  // Radar playback loop
  useEffect(() => {
    if (!isPlaying || radarFrames.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentFrameIndex(prev => (prev + 1) % radarFrames.length);
    }, 700); // 700ms per frame
    
    return () => clearInterval(interval);
  }, [isPlaying, radarFrames.length]);

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

  const currentFrame = radarFrames[currentFrameIndex];

  return (
    <div className="premium-map-container" style={{ width: '100%', height: '500px', borderRadius: '16px', border: '1px solid #e7e5e4', position: 'relative', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
      {/* HUD Overlay - Title */}
      <div className="absolute top-3 right-3 md:top-5 md:right-5 z-10 bg-black/80 text-white p-2.5 md:p-3 rounded-lg backdrop-blur-md border border-white/10 shadow-xl pointer-events-none text-right">
        <div className="text-[0.55rem] md:text-[0.65rem] font-extrabold tracking-[0.15em] text-emerald-500 mb-1 flex items-center justify-end gap-1.5 uppercase">
          Live Satellite Uplink
          <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
        </div>
        <div className="text-sm md:text-[0.9rem] font-bold leading-tight">Property Portfolio Monitor</div>
      </div>

      {/* Telemetry Log */}
      <div className="absolute bottom-16 left-3 md:bottom-20 md:left-5 z-10 w-[280px] md:w-[320px] pointer-events-none">
        <div className="flex flex-col gap-1">
          {telemetryLogs.map((log, i) => (
            <div 
              key={i} 
              className={`text-[0.65rem] md:text-[0.7rem] font-mono tracking-tight leading-relaxed px-2 py-1 rounded bg-black/70 backdrop-blur-md border border-white/5 shadow-lg
                ${log.includes('WARNING') || log.includes('penalties') ? 'text-red-400' : 'text-emerald-400'}
                animate-in slide-in-from-left-4 fade-in duration-300`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Radar Timeline Overlay */}
      {radarFrames.length > 0 && currentFrame && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black/80 text-white p-2 px-4 rounded-full backdrop-blur-md border border-white/10 shadow-xl flex items-center gap-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white hover:text-emerald-400 transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="text-[0.7rem] font-bold tracking-widest uppercase flex items-center gap-2">
            {currentFrame.type === 'nowcast' ? (
              <span className="text-orange-400">Predictive</span>
            ) : (
              <span className="text-emerald-400">Historical</span>
            )}
            <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[0.65rem]">
              {new Date(currentFrame.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-0.5 ml-2">
            {radarFrames.map((f, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentFrameIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      )}

      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={satelliteStyle as any}
        interactive={true}
      >
        {/* Predictive Doppler Radar (RainViewer Nowcast) */}
        {currentFrame && (
          <Source
            id="predictive-radar"
            type="raster"
            tiles={[currentFrame.url]}
            tileSize={256}
          >
            <Layer
              id="predictive-radar-layer"
              type="raster"
              paint={{
                'raster-opacity': 0.6,
                'raster-fade-duration': 0 // Set to 0 to prevent flickering during animation
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
            <div className="bg-white/95 text-zinc-900 rounded-xl border border-zinc-200 backdrop-blur-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] p-4 w-[260px] flex flex-col gap-3">
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.2 }}>
                  {selectedMarker.name}
                </h4>
              </div>

              <div className="bg-zinc-50 rounded-lg p-2.5 flex justify-between items-center border border-zinc-100">
                <div className="flex items-center gap-1.5 text-[0.75rem] font-bold text-zinc-500 uppercase tracking-[0.05em]">
                  <Activity size={14} color={selectedMarker.color} />
                  Health Score
                </div>
                <div className="text-[1.2rem] font-black" style={{ color: selectedMarker.color }}>
                  {selectedMarker.score}
                </div>
              </div>

              <div className="text-[0.75rem] font-medium text-zinc-500 flex items-start gap-1.5">
                <Crosshair size={14} className="mt-0.5 shrink-0" style={{ color: selectedMarker.color }} />
                <span>Geospatial weather tracking actively monitoring this location.</span>
              </div>

              <button 
                onClick={() => {
                  const el = document.getElementById(`property-${selectedMarker.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="w-full bg-zinc-900 text-white border-none py-2.5 px-3 rounded-lg text-[0.8rem] font-bold cursor-pointer flex justify-center items-center gap-1.5 mt-1 transition-all duration-200 hover:-translate-y-px hover:shadow-md hover:bg-black"
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
