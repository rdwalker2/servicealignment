import { motion } from 'framer-motion';
import { ShieldAlert, Wind, CloudRain, Sun, Activity, Search } from 'lucide-react';
import { PREMIUM_EASE } from '../RoomSections';
import { SatelliteHeatmap } from '../SatelliteHeatmap';

export function RoofHealthSection({ score = 65, signals = [] }: { score?: number, signals?: any[] }) {
  const isCritical = score < 50;
  const isWarning = score >= 50 && score < 80;
  
  return (
    <div className="w-full relative overflow-hidden bg-white border border-stone-200 shadow-sm rounded-2xl p-6 md:p-8">
      {/* Background gradients */}
      <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-20 rounded-full mix-blend-multiply ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      
      <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start">
        {/* Score Ring */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f5f5f4" strokeWidth="8" />
              <motion.circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'} 
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 300' }}
                whileInView={{ strokeDasharray: `${(score / 100) * 283} 300` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: PREMIUM_EASE }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold tracking-tight ${isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                {score}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-stone-500">
            Overall Health Score
          </p>
        </div>

        {/* Info Area */}
        <div className="flex-1 space-y-5">
          <div>
            <h3 className="text-2xl font-bold text-stone-900 tracking-tight">Property Risk Assessment</h3>
            <p className="text-stone-500 mt-1">Based on historical weather data and recent permit activity for your location.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Example Signals / Widgets */}
            <div className="rounded-xl bg-stone-50 p-4 border border-stone-100 flex items-start gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Wind size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">Wind Events</p>
                <p className="text-xs text-stone-500 mt-0.5">3 high-wind storms (65mph+) recorded in the last 24 months.</p>
              </div>
            </div>
            
            <div className="rounded-xl bg-stone-50 p-4 border border-stone-100 flex items-start gap-3">
              <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
                <CloudRain size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">Precipitation Stress</p>
                <p className="text-xs text-stone-500 mt-0.5">Top 15% for regional rainfall; high risk of ponding on low-slope areas.</p>
              </div>
            </div>

            <div className="rounded-xl bg-stone-50 p-4 border border-stone-100 flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Sun size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">UV Degradation</p>
                <p className="text-xs text-stone-500 mt-0.5">Significant sun exposure leading to accelerated membrane aging.</p>
              </div>
            </div>

            <div className="rounded-xl bg-stone-50 p-4 border border-stone-100 flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Search size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">Permit Activity</p>
                <p className="text-xs text-stone-500 mt-0.5">No major roof repairs filed since 2012 (14 years).</p>
              </div>
            </div>
          </div>
          
          <div className={`mt-4 rounded-lg p-4 flex items-center gap-3 ${isCritical ? 'bg-red-50 text-red-800' : isWarning ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
            <ShieldAlert size={20} className={isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'} />
            <p className="text-sm font-medium">
              {isCritical ? "Critical Action Recommended: Schedule an immediate infrared scan to identify trapped moisture."
               : isWarning ? "Proactive Maintenance Advised: Your roof is entering the phase where preventative care yields highest ROI."
               : "Good Condition: Continue standard bi-annual inspections."}
            </p>
          </div>
        </div>

        {/* Satellite Heatmap */}
        <div className="w-full lg:w-1/3 shrink-0">
          <SatelliteHeatmap lat={39.1031} lon={-84.5120} healthScore={score} />
        </div>
      </div>
    </div>
  );
}
