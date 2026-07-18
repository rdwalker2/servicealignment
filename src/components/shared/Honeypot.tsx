import React, { useEffect, useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';

export function Honeypot() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const sequence = [
      'DETECTING UNAUTHORIZED PROBE...',
      'ANALYZING REQUEST SIGNATURE...',
      'MATCHING AGAINST KNOWN THREAT VECTORS...',
      'THREAT DETECTED. INITIATING DEFENSE PROTOCOL...',
      'LOGGING ORIGIN IP ADDRESS...',
      'CAPTURING BROWSER FINGERPRINT...',
      'UPLOADING INCIDENT REPORT TO SERVICE ALIGNMENT SEC OPS...',
      'LOCKING DOWN ASSET...',
      'TARPIT ENGAGED. PLEASE WAIT.',
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setLogs(prev => [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-emerald-500 font-mono p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full border border-red-500/30 p-8 rounded-lg bg-red-950/20 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden">
        {/* Scanning line effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 animate-[scan_3s_ease-in-out_infinite]" />
        
        <div className="flex items-center gap-4 mb-8 text-red-500">
          <ShieldAlert className="w-12 h-12 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold tracking-widest uppercase">Restricted Area</h1>
            <p className="text-sm opacity-80 uppercase tracking-widest">Service Alignment Fortress Defense</p>
          </div>
        </div>

        <div className="space-y-4 min-h-[300px]">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-red-500 opacity-50 mt-1">{'>'}</span>
              <span className={i === logs.length - 1 && i === 8 ? 'text-red-500 animate-pulse' : ''}>
                {log}
              </span>
            </div>
          ))}
          {logs.length === 9 && (
            <div className="flex items-center gap-3 text-red-500 mt-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="animate-pulse">Processing...</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
