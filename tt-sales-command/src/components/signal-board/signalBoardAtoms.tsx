/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ArrowDown } from 'lucide-react';
import type { SignalEvent, AccountView } from '../../data/signalBoardData';
import { getSignalIcon } from '../../data/signalBoardData';

// ────────────────────────────────────────────
// Shared UI atoms
// ────────────────────────────────────────────

export function LinkedinIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

export function TargetSignalIcon({ size = 16, className = 'text-pink-500' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

export function ScoreBadge({ score, fitScore, intentScore }: { score: number; fitScore?: number; intentScore?: number }) {
  const cls = score >= 30
    ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20 font-bold border border-pink-400/30'
    : score >= 18 ? 'bg-white text-stone-800 border border-stone-200 shadow-sm font-semibold'
    : 'bg-stone-50 text-stone-500 border border-stone-100 font-medium';
  
  if (fitScore != null && intentScore != null) {
    return (
      <div className="flex items-center gap-0.5 group relative">
        <span className={`inline-flex items-center justify-center min-w-[28px] h-[22px] px-1.5 rounded-l text-[11px] transition-all ${cls}`}>{score}</span>
        <div className="flex flex-col gap-0 -ml-0.5">
          <span className={`inline-flex items-center justify-center h-[11px] px-1 rounded-tr text-[8px] font-bold transition-all ${
            intentScore > 0 ? 'bg-violet-100 text-violet-700' : 'bg-stone-100 text-stone-400'
          }`} title="Intent (web visits + triggers)">
            {intentScore > 0 ? `⚡${intentScore}` : '⚡0'}
          </span>
          <span className={`inline-flex items-center justify-center h-[11px] px-1 rounded-br text-[8px] font-bold transition-all ${
            fitScore > 0 ? 'bg-blue-50 text-blue-600' : 'bg-stone-50 text-stone-300'
          }`} title="Fit (firmographic enrichment)">
            {fitScore > 0 ? `🎯${fitScore}` : '🎯0'}
          </span>
        </div>
      </div>
    );
  }
  
  return <span className={`inline-flex items-center justify-center min-w-[28px] h-[22px] px-1.5 rounded text-[11px] transition-all ${cls}`}>{score}</span>;
}

export function TierDot({ tier }: { tier: 'hot' | 'warm' | 'watch' }) {
  const c = { 
    hot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] border border-rose-400', 
    warm: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] border border-amber-300', 
    watch: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] border border-emerald-300' 
  }[tier];
  return <span className={`block w-[10px] h-[10px] rounded-full ${c}`} />;
}

export function SignalTag({ signal }: { signal: SignalEvent }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded text-[10px] font-medium bg-stone-100/80 text-stone-500 whitespace-nowrap" title={signal.description}>
      <span className="text-[10px] leading-none text-stone-400">{getSignalIcon(signal.source, signal.name)}</span>
      <span className="truncate max-w-[120px]">{signal.name}</span>
    </span>
  );
}

export function SourcePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-2.5 py-[5px] rounded text-[12px] font-medium transition-all ${active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
      {label}
    </button>
  );
}

export function TrendArrow({ signals }: { signals: SignalEvent[] }) {
  if (signals.length < 2) return null;
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const recentCount = signals.filter(s => now - new Date(s.detectedAt).getTime() < week).length;
  const olderCount = signals.filter(s => {
    const age = now - new Date(s.detectedAt).getTime();
    return age >= week && age < week * 2;
  }).length;
  
  if (recentCount > olderCount) {
    return <span className="text-[9px] font-bold text-emerald-600 ml-0.5" title="Heating up — more signals this week">↑</span>;
  } else if (recentCount < olderCount) {
    return <span className="text-[9px] font-bold text-stone-400 ml-0.5" title="Cooling off — fewer signals this week">↓</span>;
  }
  return <span className="text-[9px] font-bold text-stone-300 ml-0.5" title="Stable activity">→</span>;
}

export function FreshnessDot({ dateStr }: { dateStr: string }) {
  const ageMs = Date.now() - new Date(dateStr).getTime();
  if (ageMs < 2 * 60 * 60 * 1000) {
    return (
      <span className="relative flex h-2 w-2 shrink-0" title="Active in last 2 hours">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
      </span>
    );
  }
  if (ageMs < 24 * 60 * 60 * 1000) {
    return <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400 shrink-0" title="Active in last 24 hours"></span>;
  }
  if (ageMs < 7 * 24 * 60 * 60 * 1000) {
    return <span className="inline-flex rounded-full h-1.5 w-1.5 bg-amber-300 shrink-0" title="Active this week"></span>;
  }
  return <span className="inline-flex rounded-full h-1.5 w-1.5 bg-stone-200 shrink-0" title="Older than 7 days"></span>;
}


// ────────────────────────────────────────────
// Score popover
// ────────────────────────────────────────────

export function ScorePopover({ account, anchorRef }: { account: AccountView; anchorRef?: React.RefObject<HTMLElement | null> }) {
  // Build plain-language insight bullets from actual signal data
  const insights: string[] = [];
  
  // Web visit insights
  const webSignals = account.signals.filter(s => s.source === 'rb2b');
  const pricingVisits = webSignals.filter(s => s.pageVisited?.includes('/pricing'));
  const demoVisits = webSignals.filter(s => s.pageVisited?.includes('/demo'));
  const caseStudyVisits = webSignals.filter(s => s.pageVisited?.includes('/case-stud'));
  if (pricingVisits.length > 1) insights.push(`Visited pricing page ${pricingVisits.length}× — strong buying signal`);
  else if (pricingVisits.length === 1) insights.push('Visited pricing page — evaluating cost');
  if (demoVisits.length > 0) insights.push('Visited demo page — ready for conversation');
  if (caseStudyVisits.length > 0) insights.push('Reading case studies — building internal case');
  
  // ATS insight
  const atsSignal = account.signals.find(s => s.name === 'Competitor ATS Detected');
  if (atsSignal) {
    const atsName = atsSignal.description.match(/using ([^—–]+)/i)?.[1]?.trim();
    if (atsName) insights.push(`Currently using ${atsName} — displacement opportunity`);
  }
  
  // Hiring velocity
  const hiringSignal = account.signals.find(s => s.name === 'High Job Volume');
  if (hiringSignal) {
    const roleMatch = hiringSignal.description.match(/(\d+)\+?\s*active/i);
    insights.push(`${roleMatch?.[1] || account.openRoles}+ active postings — high hiring velocity`);
  }
  
  // Org size
  if (account.employeeCount > 10000) insights.push(`${account.employeeCount.toLocaleString()} employees — enterprise account`);
  else if (account.employeeCount > 5000) insights.push(`${account.employeeCount.toLocaleString()} employees — mid-market opportunity`);
  
  // Freshness
  const now = Date.now();
  const freshSignals = account.signals.filter(s => now - new Date(s.detectedAt).getTime() < 24 * 60 * 60 * 1000);
  if (freshSignals.length > 0) insights.push(`${freshSignals.length} signal${freshSignals.length > 1 ? 's' : ''} in last 24h — act now`);
  
  // Fallback
  if (insights.length === 0) insights.push(`${account.signals.length} total signals detected`);

  const bySource = { rb2b: 0, clay: 0, linkedin: 0, job_board: 0 };
  for (const s of account.signals) bySource[s.source] += s.score;
  const max = Math.max(...Object.values(bySource), 10);

  const bars: { label: string; color: string; value: number; key: string }[] = [
    { label: 'RB2B Web Intent', color: 'bg-stone-700', value: bySource.rb2b, key: 'rb2b' },
    { label: 'Clay Enrichment', color: 'bg-stone-500', value: bySource.clay, key: 'clay' },
    { label: 'LinkedIn', color: 'bg-stone-400', value: bySource.linkedin, key: 'linkedin' },
    { label: 'Job Board', color: 'bg-stone-300', value: bySource.job_board, key: 'job_board' },
  ];

  // Compute fixed position from anchor
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  React.useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 - 144 });
    }
  }, [anchorRef]);

  const content = (
    <div 
      className="w-72 bg-white rounded-xl shadow-xl ring-1 ring-stone-200 p-4 text-left pointer-events-none"
      style={pos ? { position: 'fixed', top: pos.top, left: Math.max(8, pos.left), zIndex: 9999 } : { position: 'absolute', zIndex: 9999, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] font-bold text-stone-900">Score: {account.score}</div>
        <TrendArrow signals={account.signals} />
      </div>

      {/* Fit vs Intent split */}
      <div className="flex gap-2 mb-3 pb-3 border-b border-stone-100">
        <div className={`flex-1 rounded-lg p-2 text-center ${
          account.intentScore > 0 ? 'bg-violet-50 ring-1 ring-violet-200/60' : 'bg-stone-50'
        }`}>
          <div className="text-[9px] font-semibold text-stone-400 uppercase tracking-wide">Intent</div>
          <div className={`text-[16px] font-bold ${
            account.intentScore > 0 ? 'text-violet-700' : 'text-stone-300'
          }`}>⚡ {account.intentScore}</div>
          <div className="text-[8px] text-stone-400">Web visits + triggers</div>
        </div>
        <div className={`flex-1 rounded-lg p-2 text-center ${
          account.fitScore > 0 ? 'bg-stone-50 ring-1 ring-stone-200/60' : 'bg-stone-50'
        }`}>
          <div className="text-[9px] font-semibold text-stone-400 uppercase tracking-wide">Fit</div>
          <div className={`text-[16px] font-bold ${
            account.fitScore > 0 ? 'text-stone-700' : 'text-stone-300'
          }`}>🎯 {account.fitScore}</div>
          <div className="text-[8px] text-stone-400">Firmographic match</div>
        </div>
      </div>
      
      {/* Plain-language insights */}
      <div className="space-y-1.5 mb-3 pb-3 border-b border-stone-100">
        {insights.slice(0, 4).map((insight, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px] text-stone-600">
            <span className="text-stone-400 mt-0.5 shrink-0">•</span>
            <span className="leading-snug">{insight}</span>
          </div>
        ))}
      </div>

      {/* Source breakdown mini-bars */}
      <div className="space-y-1.5">
        {bars.filter(b => b.value > 0).map(b => (
          <div key={b.key} className="flex items-center gap-2">
            <span className="text-[9px] font-medium text-stone-400 w-16 truncate">{b.label}</span>
            <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
              <div className={`h-full ${b.color} rounded-full`} style={{ width: `${(b.value / max) * 100}%` }} />
            </div>
            <span className="text-[9px] font-semibold text-stone-500 w-4 text-right">{b.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Portal to body if we have a computed position, fallback to inline
  if (pos) {
    return ReactDOM.createPortal(content, document.body);
  }
  return content;
}


// ═══════════════════════════════════════════
// Disposition tracking
// ═══════════════════════════════════════════

export type Disposition = 'new' | 'working' | 'engaged' | 'meeting_set' | 'nurture' | 'not_now' | 'disqualified';
export const DISPOSITION_CONFIG: Record<Disposition, { label: string; color: string; bg: string; ring: string }> = {
  new: { label: 'New', color: 'text-stone-500', bg: 'bg-stone-50', ring: 'ring-stone-200' },
  working: { label: 'Working', color: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200' },
  engaged: { label: 'Engaged', color: 'text-violet-700', bg: 'bg-violet-50', ring: 'ring-violet-200' },
  meeting_set: { label: 'Meeting Set', color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  nurture: { label: 'Nurture', color: 'text-sky-700', bg: 'bg-sky-50', ring: 'ring-sky-200' },
  not_now: { label: 'Not Now', color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  disqualified: { label: 'DQ', color: 'text-stone-400', bg: 'bg-stone-50', ring: 'ring-stone-200' },
};

export function DispositionDropdown({ domain, current, onChange }: { 
  domain: string; 
  current: Disposition; 
  onChange: (domain: string, status: Disposition) => void;
}) {
  const [open, setOpen] = useState(false);
  const config = DISPOSITION_CONFIG[current];
  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2 py-[3px] rounded text-[10px] font-medium transition-all ${config.bg} ${config.color} hover:opacity-80`}
      >
        {config.label}
        <ArrowDown size={8} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-36 bg-white rounded-lg shadow-lg ring-1 ring-stone-200 p-1">
            {(Object.entries(DISPOSITION_CONFIG) as [Disposition, typeof config][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => { onChange(domain, key); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                  current === key ? 'bg-stone-50 text-stone-900' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.bg}`} />
                {cfg.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
