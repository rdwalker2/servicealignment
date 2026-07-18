import { WebSocketServer } from 'ws';

// Simulated coordinates array for active monitoring
const MONITORED_ZONES = [
  { id: 'cushman-1', lat: 39.1031, lon: -84.5120, name: 'C&W Facility - Walnut' },
  { id: 'cushman-2', lat: 40.0384, lon: -84.2014, name: 'C&W Logistics Center - Dorset' },
];

let monitoringInterval;

export function startWeatherMonitor(wss) {
  if (monitoringInterval) clearInterval(monitoringInterval);
  
  console.log('[WeatherMonitor] Started active WebSocket polling for severe cells...');
  
  monitoringInterval = setInterval(() => {
    // We mock a Tomorrow.io response for demonstration purposes.
    // In production, this uses the real Tomorrow.io Real-Time API.
    const isSevere = Math.random() > 0.85; // 15% chance every 10s
    
    if (isSevere && wss.clients.size > 0) {
      const zone = MONITORED_ZONES[Math.floor(Math.random() * MONITORED_ZONES.length)];
      
      const alertPayload = JSON.stringify({
        type: 'SEVERE_WEATHER_ALERT',
        data: {
          zone: zone.name,
          alert_type: 'Severe Hail Anomaly',
          distance_miles: (Math.random() * 5 + 1).toFixed(1),
          severity: 'HIGH',
          timestamp: new Date().toISOString()
        }
      });

      console.log(`[WeatherMonitor] 🚨 BROADCASTING ALERT: ${alertPayload}`);
      
      wss.clients.forEach((client) => {
        if (client.readyState === 1 /* OPEN */) {
          client.send(alertPayload);
        }
      });
    }
  }, 10000); // Check every 10 seconds for the demo
}
