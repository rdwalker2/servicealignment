// ============================================================
// SmartRoomModal — Unified Room Creation Experience
// Merges RoomBuilder wizard + Deal Card Grid creation into one
// intelligent modal that auto-configures based on persona + Provider.
//
// UX Upgrade #1: One modal → room is live with smart defaults.
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sparkles, X, ChevronRight, Check,
  Target, CheckCircle2, Zap,
} from 'lucide-react';
import { TT_PAINS } from './PainDiscoveryModule';
import { Q1_PAIN_MAP } from '../../data/personaSheets';

// ── Options ──

const PERSONA_OPTIONS = [
  { id: 'vp-ta', label: 'VP of Talent Acquisition', short: 'VP TA' },
  { id: 'dir-eb', label: 'Dir. Employer Brand', short: 'Dir. EB' },
  { id: 'chro', label: 'CHRO / CPO', short: 'CHRO' },
  { id: 'cfo', label: 'CFO / Finance', short: 'CFO' },
  { id: 'hiring-manager', label: 'Hiring Manager', short: 'HM' },
  { id: 'recruiter', label: 'Recruiter', short: 'Recruiter' },
];

const ATS_OPTIONS = [
  'None', 'Greenhouse', 'Ashby', 'BambooHR', 'BreezyHR', 'Lever', 'Workday', 'iCIMS',
  'SmartRecruiters', 'Workable', 'JazzHR', 'Paycor', 'Paycom', 'Paylocity',
  'Rippling', 'UKG', 'ADP', 'Dayforce', 'other',
];

const INDUSTRY_OPTIONS = [
  '', 'Technology', 'Healthcare', 'Financial Services', 'Retail',
  'Manufacturing', 'Hospitality', 'Education', 'Professional Services',
  'Media & Entertainment', 'Non-Profit', 'Government', 'Other',
];

const SIZE_OPTIONS = [
  '', '1-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+',
];

// ── Pain suggestion logic ──

/** Resolve persona ID to personaSheet ID for Q1_PAIN_MAP */
function resolveSheetId(persona: string): string {
  switch (persona) {
    case 'dir-eb':
    case 'hiring-manager':
      return 'hr-director';
    case 'vp-ta':
    case 'recruiter':
      return 'ta-manager';
    case 'chro':
      return 'chro';
    case 'cfo':
      return 'ceo';
    default:
      return 'hr-director';
  }
}

/** Get the top suggested pains for a persona — union of all Q1 pain mappings */
function getSuggestedPains(persona: string): string[] {
  const sheetId = resolveSheetId(persona);
  const painMap = Q1_PAIN_MAP[sheetId];
  if (!painMap) return [];

  // Collect all unique pain IDs from all Q1 options
  const allPainIds = new Set<string>();
  for (const painIds of Object.values(painMap)) {
    for (const id of painIds) allPainIds.add(id);
  }

  // Return the first 6 most common pains (they appear across multiple Q1 options)
  const painCounts = new Map<string, number>();
  for (const painIds of Object.values(painMap)) {
    for (const id of painIds) {
      painCounts.set(id, (painCounts.get(id) || 0) + 1);
    }
  }

  return [...painCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => id);
}

// ── Props ──

interface SmartRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (config: SmartRoomConfig) => void;
}

export interface SmartRoomConfig {
  companyName: string;
  persona: string | null;
  currentATS: string | null;
  industry: string | null;
  companySize: string | null;
  selectedPains: string[];
}

// ── Persona badge colors ──

const PERSONA_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  'vp-ta': { bg: 'bg-cyan-50', text: 'text-cyan-700', ring: 'ring-cyan-200' },
  'dir-eb': { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200' },
  'chro': { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200' },
  'cfo': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  'hiring-manager': { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200' },
  'recruiter': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
};

// ── Component ──

export function SmartRoomModal({ open, onClose, onCreate }: SmartRoomModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [persona, setPersona] = useState<string | null>(null);
  const [currentATS, setCurrentATS] = useState<string | null>(null);
  const [industry, setIndustry] = useState<string | null>(null);
  const [companySize, setCompanySize] = useState<string | null>(null);
  const [selectedPains, setSelectedPains] = useState<string[]>([]);
  const [suggestedPains, setSuggestedPains] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const companyInputRef = useRef<HTMLInputElement>(null);

  // Focus company input on open
  useEffect(() => {
    if (open) {
      setCompanyName('');
      setPersona(null);
      setCurrentATS(null);
      setIndustry(null);
      setCompanySize(null);
      setSelectedPains([]);
      setSuggestedPains([]);
      setShowAdvanced(false);
      setTimeout(() => companyInputRef.current?.focus(), 100);
    }
  }, [open]);

  // Update suggested pains when persona changes
  useEffect(() => {
    if (persona) {
      const suggested = getSuggestedPains(persona);
      setSuggestedPains(suggested);
      // Auto-select the top 3 suggested pains
      setSelectedPains(suggested.slice(0, 3));
    } else {
      setSuggestedPains([]);
      setSelectedPains([]);
    }
  }, [persona]);

  const togglePain = useCallback((painId: string) => {
    setSelectedPains(prev =>
      prev.includes(painId) ? prev.filter(p => p !== painId) : [...prev, painId]
    );
  }, []);

  const handleCreate = useCallback(() => {
    if (!companyName.trim()) return;
    onCreate({
      companyName: companyName.trim(),
      persona,
      currentATS: currentATS && currentATS !== 'None' ? currentATS : null,
      industry: industry || null,
      companySize: companySize || null,
      selectedPains,
    });
    onClose();
  }, [companyName, persona, currentATS, industry, companySize, selectedPains, onCreate, onClose]);

  // Keyboard: ⌘↵ to create
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.metaKey && companyName.trim()) {
        e.preventDefault();
        handleCreate();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, companyName, handleCreate, onClose]);

  const isValid = companyName.trim().length > 0;
  const readinessItems = [
    { label: 'Company name', done: companyName.trim().length > 0 },
    { label: 'Persona selected', done: !!persona },
    { label: 'Pains identified', done: selectedPains.length > 0 },
  ];
  const readyCount = readinessItems.filter(i => i.done).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center shadow-sm">
                  <Sparkles size={18} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900">Create Discovery Room</h2>
                  <p className="text-xs text-stone-400 mt-0.5">AI auto-configures sections, call sheet & case studies</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="px-6 py-5 space-y-5">
              {/* Company Name — primary input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Company Name <span className="text-stone-900">*</span>
                </label>
                <input
                  ref={companyInputRef}
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Acme Corporation"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all"
                  autoFocus
                />
              </div>

              {/* Persona — pill selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Who Are You Meeting With?
                </label>
                <div className="flex flex-wrap gap-2">
                  {PERSONA_OPTIONS.map(p => {
                    const isSelected = persona === p.id;
                    const colors = PERSONA_COLORS[p.id] || { bg: 'bg-stone-50', text: 'text-stone-700', ring: 'ring-stone-200' };
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPersona(isSelected ? null : p.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                          isSelected
                            ? `${colors.bg} ${colors.text} ring-2 ${colors.ring} shadow-sm`
                            : 'bg-stone-50 text-stone-500 border border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} />}
                        {p.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Provider */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Current Provider
                </label>
                <select
                  value={currentATS ?? 'None'}
                  onChange={e => setCurrentATS(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all cursor-pointer"
                >
                  {ATS_OPTIONS.map(ats => (
                    <option key={ats} value={ats}>{ats}</option>
                  ))}
                </select>
              </div>

              {/* Advanced: Industry + Size */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-stone-600 transition-colors"
              >
                <ChevronRight size={12} className={`transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`} />
                More context (optional)
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Industry</label>
                        <select
                          value={industry ?? ''}
                          onChange={e => setIndustry(e.target.value || null)}
                          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-stone-400 transition-colors cursor-pointer"
                        >
                          <option value="">Select…</option>
                          {INDUSTRY_OPTIONS.filter(Boolean).map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Company Size</label>
                        <select
                          value={companySize ?? ''}
                          onChange={e => setCompanySize(e.target.value || null)}
                          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-stone-400 transition-colors cursor-pointer"
                        >
                          <option value="">Select…</option>
                          {SIZE_OPTIONS.filter(Boolean).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggested Pains — only shown when persona is selected */}
              <AnimatePresence>
                {persona && suggestedPains.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Zap size={12} className="text-amber-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                            Suggested Pain Points
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                          <CheckCircle2 size={8} />
                          {selectedPains.length} selected
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedPains.map(painId => {
                          const pain = TT_PAINS.find(p => p.id === painId);
                          if (!pain) return null;
                          const isSelected = selectedPains.includes(painId);
                          return (
                            <button
                              key={painId}
                              onClick={() => togglePain(painId)}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 ${
                                isSelected
                                  ? 'bg-stone-800 text-white shadow-sm'
                                  : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                              }`}
                              title={pain.description}
                            >
                              {isSelected && <CheckCircle2 size={9} />}
                              {pain.title}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-[10px] text-stone-400">
                        Based on {PERSONA_OPTIONS.find(p => p.id === persona)?.short} persona · Click to toggle · You can refine later
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50">
              {/* Mini readiness indicators */}
              <div className="flex items-center gap-4 mb-3">
                {readinessItems.map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    {item.done ? (
                      <CheckCircle2 size={11} className="text-emerald-500" />
                    ) : (
                      <div className="w-[11px] h-[11px] rounded-full border-2 border-stone-300" />
                    )}
                    <span className={`text-[10px] font-medium ${item.done ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-stone-400">
                  {readyCount === 3 ? '✨ Room will be fully configured' : `${readyCount}/3 setup steps complete`}
                  {' · '}Press ⌘↵ to create
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!isValid}
                    className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                  >
                    <Sparkles size={14} className="text-amber-400" />
                    Create Room
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
