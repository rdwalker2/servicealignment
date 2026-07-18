import React from 'react';
import { Activity, Database, CheckCircle2, ShieldAlert } from 'lucide-react';

export function RoofHealthScoreExplainer() {
  return (
    <div className="mb-12 bg-white border border-zinc-200 p-6 md:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-zinc-200 pb-6 mb-6 gap-6 md:gap-4">
        <div>
          <div className="text-[0.65rem] font-extrabold text-red-600 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
            <Activity size={14} /> PREDICTIVE ENGINE
          </div>
          <h2 className="m-0 mb-3 text-3xl font-black text-zinc-900 tracking-tight">Roof Health Score</h2>
          <p className="m-0 text-zinc-600 text-[0.95rem] max-w-[600px] leading-relaxed font-medium">
            A proprietary 1-100 metric calculated dynamically. It aggregates building age, roof material, historical NOAA weather events, and satellite imagery to predict failure probability.
          </p>
        </div>
        <div className="flex gap-8 items-center self-start md:self-auto shrink-0 mt-4 md:mt-0">
          <div className="text-center">
            <div className="text-[2.5rem] font-black text-emerald-500 font-mono leading-none">80+</div>
            <div className="text-[0.65rem] font-extrabold text-zinc-500 uppercase tracking-[0.1em] mt-2">HEALTHY</div>
          </div>
          <div className="w-px h-10 bg-zinc-200"></div>
          <div className="text-center">
            <div className="text-[2.5rem] font-black text-red-600 font-mono leading-none">&lt;40</div>
            <div className="text-[0.65rem] font-extrabold text-red-600 uppercase tracking-[0.1em] mt-2">CRITICAL RISK</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        <div className="flex-1">
          <h3 className="text-[0.85rem] font-extrabold text-zinc-900 mb-4 flex items-center gap-2 uppercase tracking-[0.05em]">
            <Database size={16} className="text-zinc-500" /> Data Sources
          </h3>
          <ul className="list-none p-0 m-0 flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-zinc-900 text-[0.85rem]">NOAA SWDI Database</strong>
                <span className="text-zinc-600 text-[0.8rem]">Severe weather data mapped directly to building coordinates.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-zinc-900 text-[0.85rem]">Local Permit Records</strong>
                <span className="text-zinc-600 text-[0.8rem]">Verified installation dates to track baseline degradation.</span>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="hidden md:block w-px bg-zinc-200"></div>
        <div className="md:hidden h-px bg-zinc-200 w-full my-2"></div>
        
        <div className="flex-1 md:pl-2">
          <h3 className="text-[0.85rem] font-extrabold text-zinc-900 mb-4 flex items-center gap-2 uppercase tracking-[0.05em]">
            <ShieldAlert size={16} className="text-red-600" /> The "Why"
          </h3>
          <p className="text-zinc-600 text-[0.85rem] leading-relaxed m-0">
            How do we know a roof is failing if we haven't been on it? <br/><br/>
            Our predictive engine tracks NOAA data against the specific installation year of your TPO system. Recent weather events in your grid have dropped your score below our safety threshold. We want to do a physical inspection to verify the algorithm's findings <strong className="text-zinc-900 font-bold">before</strong> the water hits your tenants.
          </p>
        </div>
      </div>
    </div>
  );
}
