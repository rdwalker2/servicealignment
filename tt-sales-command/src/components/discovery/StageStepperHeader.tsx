// ════════════════════════════════════════════════════════════════
// Stage stepper header — single compact row
// Extracted from RepWorkspace.tsx
// ════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import {
  CheckCircle2, Lock, RefreshCw, Settings,
} from 'lucide-react';
import { scoreDeal } from '../../lib/leaderboard';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { STAGES } from './repWorkspaceConstants';

export function StageStepperHeader({
  session, onStageChange, onOpenGranolaSync, onOpenGranolaSettings, companyName,
  activeTab, onTabChange,
}: {
  session: DiscoverySession; onStageChange: (s: string) => void;
  onOpenGranolaSync: () => void; onOpenGranolaSettings: () => void;
  companyName: string;
  activeTab: 'bap' | 'meddpicc' | 'settings' | 'analytics'; onTabChange: (tab: 'bap' | 'meddpicc' | 'settings' | 'analytics') => void;
}) {
  const score = scoreDeal(session);
  const pct = score.totalPoints;
  const currentIdx = STAGES.findIndex(s => s.id === (session.deal_stage || 'qualifying'));

  return (
    <div className="shrink-0 flex items-center gap-3 px-5 py-2 bg-white border-b border-stone-100">
      {/* Tabs — left side */}
      <div className="flex items-center gap-1 shrink-0">
        {([
          { id: 'bap' as const, label: 'BAP' },
          { id: 'meddpicc' as const, label: 'MEDDPICC' },
          { id: 'settings' as const, label: 'Room' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-stone-100 shrink-0" />

      {/* Stage dots — center, compact */}
      <div className="flex items-center flex-1 gap-0">
        {STAGES.map((stage, idx) => {
          const isActive = idx === currentIdx;
          const isPast = idx < currentIdx;
          const color = isActive || isPast ? stage.color : '#d4d4d8';
          return (
            <div key={stage.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => onStageChange(stage.id)}
                title={stage.label}
                className={`relative flex items-center gap-1.5 ${isActive || isPast ? '' : 'opacity-40'}`}
              >
                <motion.div className="rounded-full flex items-center justify-center"
                  style={{ width: isActive ? 24 : 16, height: isActive ? 24 : 16, backgroundColor: color, boxShadow: isActive ? `0 0 0 3px ${stage.color}20` : 'none' }}
                  animate={{ scale: isActive ? 1 : 0.85 }} transition={{ duration: 0.2 }}>
                  {isActive && <span className="text-[8px] font-bold text-white">{stage.short}</span>}
                  {isPast && <CheckCircle2 size={9} className="text-white" />}
                  {!isActive && !isPast && <Lock size={7} className="text-white/80" />}
                </motion.div>
                {isActive && <span className="text-[9px] font-bold whitespace-nowrap" style={{ color: stage.color }}>{stage.label}</span>}
              </button>
              {idx < STAGES.length - 1 && (
                <div className="flex-1 h-[1.5px] mx-1.5 rounded-full" style={{ backgroundColor: isPast ? STAGES[idx + 1].color + '50' : '#e4e4e7' }} />
              )}
            </div>
          );
        })}
      </div>

      <div className="h-5 w-px bg-stone-100 shrink-0" />

      {/* Health — compact */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-14 h-1.5 rounded-full bg-stone-200 overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ backgroundColor: pct > 70 ? '#10b981' : pct > 40 ? '#f59e0b' : '#ef4444' }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
        </div>
        <span className="text-[10px] font-bold tabular-nums" style={{ color: pct > 70 ? '#10b981' : pct > 40 ? '#f59e0b' : '#ef4444' }}>{pct}%</span>
      </div>

      {/* Granola — compact */}
      <button onClick={onOpenGranolaSync} className="flex items-center gap-1 px-2.5 py-1 bg-[#F05A28]/10 text-[#F05A28] rounded-lg text-[10px] font-semibold hover:bg-[#F05A28]/20 transition-colors shrink-0">
        <RefreshCw size={10} /> Sync
      </button>
      <button onClick={onOpenGranolaSettings} className="p-1 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors shrink-0">
        <Settings size={13} />
      </button>
    </div>
  );
}
