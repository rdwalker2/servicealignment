const fs = require('fs');
const file = 'src/components/discovery/PortfolioWeatherMap.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the hailGeoJSON state and useEffect with predictive radar state
const oldStateStart = "  const [hailGeoJSON, setHailGeoJSON] = useState<any>(null);";
const oldStateEnd = "  }, [initialViewState]);";
const startIndex = code.indexOf(oldStateStart);
const endIndex = code.indexOf(oldStateEnd, startIndex) + oldStateEnd.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find the target code to replace.");
    process.exit(1);
}

const newStateAndEffect = `  const [radarUrl, setRadarUrl] = useState<string | null>(null);

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
          const url = \`\${data.host}\${targetFrame.path}/256/{z}/{x}/{y}/2/1_1.png\`;
          setRadarUrl(url);
        }
      } catch (e) {
        console.error("Failed to load predictive radar", e);
      }
    };
    
    fetchPredictiveRadar();
  }, []);`;

code = code.substring(0, startIndex) + newStateAndEffect + code.substring(endIndex);

// Replace the sources
const mapSourcesRegex = /\{\/\* Historical Severe Hail Heatmap \(Real NOAA Data\) \*\/\}[\s\S]*?<\/Source>[\s\n]*\{\/\* Real Live Weather Radar Layer \(NEXRAD Base Reflectivity\) \*\/\}[\s\S]*?<\/Source>/m;

const newSources = `        {/* Predictive Doppler Radar (RainViewer Nowcast) */}
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
        )}`;

code = code.replace(mapSourcesRegex, newSources);

// Update HUD
const hudOld = `<div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Live NEXRAD Radar & Historical NOAA Hail Analytics Active</div>`;
const hudNew = `<div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Predictive Doppler Radar Active (T+30m Forecast)</div>`;
code = code.replace(hudOld, hudNew);

fs.writeFileSync(file, code);
