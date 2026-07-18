import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface SatelliteHeatmapProps {
  lat: number;
  lon: number;
  healthScore: number;
}

export function SatelliteHeatmap({ lat, lon, healthScore }: SatelliteHeatmapProps) {
  // Use a placeholder Mapbox key until the user configures one
  const MAPBOX_TOKEN = 'pk.mock-mapbox-key';
  
  // A generic static mapbox URL
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${lon},${lat},18,0/800x400?access_token=${MAPBOX_TOKEN}`;

  const isHighRisk = healthScore < 50;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 shadow-xl">
      {/* 
        We use a placeholder image if the token is mock so the UI still looks good 
        In production, the mapUrl will return a real satellite image.
      */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
        style={{ 
          backgroundImage: MAPBOX_TOKEN.includes('mock') 
            ? 'url(https://images.unsplash.com/photo-1634825946820-27772fb27f05?q=80&w=2000&auto=format&fit=crop)' 
            : `url(${mapUrl})` 
        }}
      />
      
      {/* Dynamic Overlay based on health score */}
      <div className={`absolute inset-0 mix-blend-multiply transition-colors duration-700 ${
        isHighRisk ? 'bg-red-500/20' : 'bg-emerald-500/10'
      }`} />

      {/* SVG Heat zones - pseudo-randomly placed for effect */}
      {isHighRisk && (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.circle 
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 15, opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            cx="40" cy="50" fill="url(#heat-grad)" 
          />
          <motion.circle 
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 10, opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            cx="70" cy="30" fill="url(#heat-grad)" 
          />
          <defs>
            <radialGradient id="heat-grad">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      )}

      {/* Badge Overlay */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
        {isHighRisk ? (
          <>
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span>High Risk Anomalies Detected</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Structural Integrity Stable</span>
          </>
        )}
      </div>
      
      <div className="relative h-[250px] sm:h-[350px] w-full" />
    </div>
  );
}
