// ════════════════════════════════════════════════════════════════
// Pain selection modal
// Extracted from RepWorkspace.tsx
// ════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Target, Search, CheckCircle2,
} from 'lucide-react';
import { TT_PAINS } from './PainDiscoveryModule';
import { PAIN_FILTER_TABS, PERSONA_BADGE, PERSONA_SHORT } from './repWorkspaceConstants';

export function PainModal({ open, onClose, selectedPains, onToggle }: {
  open: boolean; onClose: () => void; selectedPains: string[]; onToggle: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = TT_PAINS.filter(p => {
    if (search.trim()) { const q = search.toLowerCase(); if (!p.title.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) return false; }
    if (filter === 'all') return true;
    if (filter === 'selected') return selectedPains.includes(p.id);
    const pt = (p as any).personaTabs as string[] | undefined;
    return (pt && pt.includes(filter)) || p.persona === filter;
  }).sort((a, b) => {
    const aS = selectedPains.includes(a.id) ? 0 : 1;
    const bS = selectedPains.includes(b.id) ? 0 : 1;
    return aS !== bS ? aS - bS : a.title.localeCompare(b.title);
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-[680px] max-h-[78vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center"><Target size={15} className="text-white" /></div>
                <div>
                  <h2 className="text-sm font-bold text-stone-800">Pain Points</h2>
                  <p className="text-[10px] text-stone-400">{selectedPains.length} selected · auto-scores Q1 Core Problem</p>
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"><X size={14} /></button>
            </div>
            <div className="px-6 py-2.5 border-b border-stone-50 bg-stone-50/50">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PAIN_FILTER_TABS.map(tab => {
                  const isActive = filter === tab.id;
                  return <button key={tab.id} onClick={() => setFilter(tab.id)} className={`px-2.5 py-1 text-[9px] font-bold rounded-full border transition-all ${isActive ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'}`}>{tab.label}</button>;
                })}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={13} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pain points…" autoFocus className="w-full rounded-lg border border-stone-200 bg-white py-1.5 pl-9 pr-3 text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-stone-400" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-3">
              <div className="flex flex-wrap gap-2">
                {filtered.map(pain => {
                  const isSel = selectedPains.includes(pain.id);
                  const badge = PERSONA_BADGE[pain.persona] || 'bg-stone-100 text-stone-500';
                  return (
                    <button key={pain.id} onClick={() => onToggle(pain.id)} title={pain.description}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all ${isSel ? 'bg-stone-800 text-white border border-stone-700' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-50'}`}>
                      {isSel ? <CheckCircle2 size={11} className="text-emerald-400" /> : <span className={`w-4 h-4 rounded-full text-[7px] font-bold flex items-center justify-center ${badge}`}>{PERSONA_SHORT[pain.persona] || '?'}</span>}
                      {pain.title}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/50 flex justify-end">
              <button onClick={onClose} className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors">Done</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
