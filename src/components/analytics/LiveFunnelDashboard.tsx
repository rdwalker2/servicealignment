import React, { useState, useEffect } from 'react';
import { getFunnelMetrics } from '../../lib/salesloft';
import type { FunnelMetrics } from '../../lib/salesloft';

export function LiveFunnelDashboard({ repId, isTeam }: { repId?: string, isTeam?: boolean }) {
  const [metrics, setMetrics] = useState<FunnelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getFunnelMetrics(isTeam ? undefined : repId, 'last_30_days');
      setMetrics(data);
      setLoading(false);
    }
    load();
  }, [repId, isTeam]);

  if (loading) {
    return <div className="p-10 text-center text-stone-400 text-sm">Loading live metrics from Salesloft...</div>;
  }

  if (!metrics) {
    return <div className="p-10 text-center text-stone-400 text-sm">Failed to load funnel metrics.</div>;
  }

  // Calculate bottom-of-funnel baselines
  const qualifiedOpps = Math.round(metrics.meetings_set * 0.5);
  const closes = Math.round(qualifiedOpps * 0.5);

  const formatRate = (numerator: number, denominator: number) => {
    if (denominator === 0) return '0%';
    return Math.round((numerator / denominator) * 100) + '%';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-2">
      {/* Top of Funnel / Activity */}
      <div className="bg-stone-50 border border-stone-200 shadow-sm rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1 z-10">Dials</div>
        <div className="text-3xl font-black text-stone-800 z-10">{metrics.dials}</div>
        <div className="absolute -bottom-4 -right-4 text-stone-200 opacity-50 z-0 text-7xl">📞</div>
      </div>

      <div className="bg-sky-50 border border-sky-100 shadow-sm rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
        <div className="flex justify-between items-start z-10">
          <div className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-1">Connects</div>
          <div className="text-[10px] font-semibold bg-sky-200/50 text-sky-800 px-1.5 py-0.5 rounded">{formatRate(metrics.connects, metrics.dials)}</div>
        </div>
        <div className="text-3xl font-black text-sky-900 z-10">{metrics.connects}</div>
        <div className="absolute -bottom-4 -right-4 text-sky-200/40 opacity-50 z-0 text-7xl">🗣️</div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 shadow-sm rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
        <div className="flex justify-between items-start z-10">
          <div className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-1">Conversations</div>
          <div className="text-[10px] font-semibold bg-indigo-200/50 text-indigo-800 px-1.5 py-0.5 rounded">{formatRate(metrics.conversations, metrics.connects)}</div>
        </div>
        <div className="text-3xl font-black text-indigo-900 z-10">{metrics.conversations}</div>
        <div className="absolute -bottom-4 -right-4 text-indigo-200/40 opacity-50 z-0 text-7xl">💬</div>
      </div>

      <div className="bg-pink-50 border border-pink-100 shadow-sm rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
        <div className="flex justify-between items-start z-10">
          <div className="text-xs font-bold text-pink-700 uppercase tracking-widest mb-1">Meetings Set</div>
          <div className="text-[10px] font-semibold bg-pink-200/50 text-pink-800 px-1.5 py-0.5 rounded">{formatRate(metrics.meetings_set, metrics.conversations)}</div>
        </div>
        <div className="text-3xl font-black text-pink-900 z-10">{metrics.meetings_set}</div>
        <div className="absolute -bottom-4 -right-4 text-pink-200/40 opacity-50 z-0 text-7xl">📅</div>
      </div>

      {/* Bottom of Funnel / Outputs */}
      <div className="md:col-start-2 bg-emerald-50 border border-emerald-100 shadow-sm rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
        <div className="flex justify-between items-start z-10">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Qual. Opps</div>
          <div className="text-[10px] font-semibold bg-emerald-200/50 text-emerald-800 px-1.5 py-0.5 rounded">{formatRate(qualifiedOpps, metrics.meetings_set)}</div>
        </div>
        <div className="text-3xl font-black text-emerald-900 z-10">{qualifiedOpps}</div>
        <div className="absolute -bottom-4 -right-4 text-emerald-200/40 opacity-50 z-0 text-7xl">✅</div>
      </div>

      <div className="bg-emerald-100/60 border border-emerald-200 shadow-sm rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
        <div className="flex justify-between items-start z-10">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1">Closes</div>
          <div className="text-[10px] font-semibold bg-emerald-300/50 text-emerald-900 px-1.5 py-0.5 rounded">{formatRate(closes, qualifiedOpps)}</div>
        </div>
        <div className="text-3xl font-black text-emerald-950 z-10">{closes}</div>
        <div className="absolute -bottom-4 -right-4 text-emerald-200/50 opacity-50 z-0 text-7xl">🤝</div>
      </div>
      
      {/* Context string */}
      <div className="col-span-2 md:col-span-4 mt-2 text-center">
        <p className="text-[11px] text-stone-500 italic">
          *Bottom-of-funnel metrics are estimated baselines based on top-of-funnel SalesLoft activity.
        </p>
      </div>
    </div>
  );
}
