import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudLightning, X } from 'lucide-react';

export function LiveWeatherAlert() {
  const [alert, setAlert] = useState<any>(null);

  useEffect(() => {
    // Connect to the WebSocket server running on the same host/port
    const wsUrl = window.location.protocol === 'https:' ? `wss://${window.location.host}` : `ws://${window.location.hostname}:3000`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'SEVERE_WEATHER_ALERT') {
          setAlert(payload.data);
          // Auto-hide after 12 seconds
          setTimeout(() => setAlert(null), 12000);
        }
      } catch (err) {}
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-3 overflow-hidden rounded-2xl border border-red-500/30 bg-black/80 p-5 shadow-2xl backdrop-blur-xl"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <CloudLightning className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white">Live Weather Alert</h4>
                <p className="text-xs font-medium text-red-400">{alert.alert_type}</p>
              </div>
            </div>
            <button onClick={() => setAlert(null)} className="text-zinc-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-1 rounded-xl bg-white/5 p-3">
            <p className="text-sm text-zinc-300">
              A severe cell has been detected <span className="font-bold text-white">{alert.distance_miles} miles</span> from <span className="font-semibold text-white">{alert.zone}</span>.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 12, ease: 'linear' }}
                  className="h-full bg-red-500" 
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
