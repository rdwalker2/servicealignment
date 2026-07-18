import React, { useState, useEffect } from 'react';
import { CloudRain, AlertTriangle, CheckCircle } from 'lucide-react';

interface NwsPrecipitationForecastProps {
  lat: number;
  lon: number;
}

export function NwsPrecipitationForecast({ lat, lon }: NwsPrecipitationForecastProps) {
  const [loading, setLoading] = useState(true);
  const [totalPrecipInches, setTotalPrecipInches] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    async function fetchPrecipitation() {
      try {
        setLoading(true);
        // 1. Get the gridpoint for the exact lat/lon
        const pointRes = await fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`, {
          headers: { 'User-Agent': '(servicealignment.com, support@servicealignment.com)' }
        });
        if (!pointRes.ok) throw new Error('NWS Point API Error');
        const pointData = await pointRes.json();
        const gridUrl = pointData.properties.forecastGridData;

        // 2. Fetch the grid data
        const gridRes = await fetch(gridUrl, {
          headers: { 'User-Agent': '(servicealignment.com, support@servicealignment.com)' }
        });
        if (!gridRes.ok) throw new Error('NWS Grid API Error');
        const gridData = await gridRes.json();
        
        // 3. Extract Quantitative Precipitation (7-day outlook)
        const precipValues = gridData.properties?.quantitativePrecipitation?.values || [];
        
        // Sum precipitation in mm, convert to inches
        let totalMm = 0;
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        for (const item of precipValues) {
           const validTimeRaw = item.validTime; // e.g. "2026-07-13T15:00:00+00:00/PT3H"
           const timeStr = validTimeRaw.split('/')[0];
           const itemDate = new Date(timeStr);
           if (itemDate >= now && itemDate <= sevenDaysFromNow) {
               totalMm += (item.value || 0);
           }
        }
        
        const totalInches = totalMm / 25.4;
        
        if (mounted) {
          setTotalPrecipInches(totalInches);
          setLoading(false);
        }
      } catch (err) {
        console.error("NWS Fetch Error:", err);
        if (mounted) {
           setError(true);
           setLoading(false);
        }
      }
    }

    fetchPrecipitation();
    return () => { mounted = false; };
  }, [lat, lon]);

  if (loading) {
    return <div style={{ fontSize: '0.75rem', color: '#78716c', animation: 'pulse 2s infinite' }}>Connecting to NOAA NWS...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '16px 0', borderTop: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7', marginBottom: '16px' }}>
        <div style={{ fontSize: '0.85rem', color: '#78716c', fontStyle: 'italic' }}>
          NOAA API currently unavailable.
        </div>
      </div>
    );
  }

  const precip = totalPrecipInches || 0;
  
  let zone = 'ZONE 3: DRY';
  let zoneColor = '#a1a1aa'; // Using a sharper gray than before
  let cta = 'Clear Backlog & Schedule Preventative Maintenance';
  let icon = <CheckCircle size={16} />;
  
  if (precip > 4.0) {
     zone = 'ZONE 1: EXTREME MOISTURE SYSTEM';
     zoneColor = '#dc2626';
     cta = 'STAGE EMERGENCY CREWS IMMEDIATELY';
     icon = <AlertTriangle size={16} />;
  } else if (precip >= 1.5) {
     zone = 'ZONE 2: HEAVY SOAKING RISK';
     zoneColor = '#a855f7';
     cta = 'Dispatch Preventative Perimeter Checks';
     icon = <CloudRain size={16} />;
  }

  return (
    <div style={{ padding: '16px 0', borderTop: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: zoneColor }}>
            {icon}
         </div>
         <span style={{ fontSize: '0.65rem', fontWeight: 800, color: zoneColor, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
           {zone}
         </span>
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em' }}>
         NOAA 7-Day Precipitation Forecast: <span style={{ fontFamily: 'monospace', color: '#dc2626' }}>{precip.toFixed(2)} inches</span>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#52525b', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '6px', textTransform: 'uppercase', lineHeight: 1.4 }}>
         <strong style={{ color: '#09090b' }}>ACTION:</strong> <span>{cta}</span>
      </div>
    </div>
  );
}
