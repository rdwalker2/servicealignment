// ============================================================
// Sales Redemption — PowerTable
// Closed-lost deal autopsy & fatality analysis table
// Pattern: CustomerUniverse / FarmersUniverse PowerTable
// ============================================================
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArchiveX, Search, ChevronDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, X, ArrowUpDown, ArrowUp, ArrowDown,
  Skull, Shield, AlertTriangle, Clock, UserMinus, Users, Building2,
  HelpCircle, DollarSign, CheckCircle2, Inbox, Activity,
  BookOpen, FileText, LayoutList, Filter, RefreshCw,
  Crosshair, Zap, Eye, Heart, ExternalLink,
} from 'lucide-react';
import { CleanCard, CleanPage, CleanPageHeader, CleanPageToolbar } from '../components/ui/CleanUI';
import { getAllDiscoverySessions, updatePostMortemFields } from '../lib/discoveryDatabase';
import type { DiscoverySession } from '../lib/discoveryDatabase';
import { buildFatalityTally, getTopCompetitorLosses } from '../lib/fatalityAnalysis';
import { fmtCurrency } from '../lib/format';
import { useAuth, REP_PROFILES } from '../contexts/AuthContext';

// ============================================================
// Constants
// ============================================================

const PAGE_SIZE = 25;

const SYMPTOMS: Record<string, string[]> = {
  timing: [
    'Ghosted, delayed indefinitely',
    'No clear next steps',
    'Not a priority right now',
  ],
  competition: [
    'Went with another vendor',
    'Decided to solve it internally',
    'We can do this ourselves',
  ],
  price: [
    "It's too expensive",
    'No budget allocated',
    'Negotiations stalled on cost',
  ],
  fit: [
    "This isn't exactly what we need",
    'They saw another solution as a better fit',
    'We need more customization',
  ],
  trust: [
    'Hesitation on credibility',
    'Doubts about implementation',
    "We're not sure this will work for us",
  ],
};

const SYMPTOM_CATEGORY_LABELS: Record<string, string> = {
  timing: 'Timing',
  competition: 'Competition',
  price: 'Price',
  fit: 'Fit',
  trust: 'Trust',
};

const SYMPTOM_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  timing: <Clock className="w-3.5 h-3.5" />,
  competition: <Shield className="w-3.5 h-3.5" />,
  price: <DollarSign className="w-3.5 h-3.5" />,
  fit: <Crosshair className="w-3.5 h-3.5" />,
  trust: <Heart className="w-3.5 h-3.5" />,
};

// ---- Fatality analysis (inlined from DealPostMortem) ----

interface FatalityAnalysis {
  type: string;
  checkpoint: number;
  description: string;
  trainingLink: { label: string; sublabel: string; route: string };
}

function analyzeDealFatality(selectedSymptoms: string[]): FatalityAnalysis | null {
  if (selectedSymptoms.length === 0) return null;
  if (selectedSymptoms.some(s => SYMPTOMS.trust.includes(s))) {
    return {
      type: 'Trust Fatality', checkpoint: 3,
      description: 'The buyer did not believe you could deliver the outcome. You failed Checkpoint 3 (Are We the Best Solution?).',
      trainingLink: { label: 'Five Fatalities — Trust', sublabel: 'Playbook · Five Fatalities section', route: '/team/process/overview?topic=five-fatalities' },
    };
  }
  if (selectedSymptoms.some(s => SYMPTOMS.competition.includes(s)) || selectedSymptoms.some(s => SYMPTOMS.price.includes(s))) {
    return {
      type: 'Value / Competition Fatality', checkpoint: 2,
      description: 'The buyer did not see enough unique value to justify the cost or change. You failed Checkpoint 2 (Do They Need Outside Help?).',
      trainingLink: { label: 'Three Checkpoints + HRIS Wedge', sublabel: 'Playbook · Three Checkpoints', route: '/team/process/overview?topic=three-checkpoints' },
    };
  }
  if (selectedSymptoms.some(s => SYMPTOMS.timing.includes(s)) || selectedSymptoms.some(s => SYMPTOMS.fit.includes(s))) {
    return {
      type: 'Priority Fatality', checkpoint: 1,
      description: 'The problem was not urgent enough, or you solved the wrong problem. You failed Checkpoint 1 (Do They Need to Act?).',
      trainingLink: { label: 'Three Waves + Three Checkpoints', sublabel: 'Cold Call Playbook · Wave 1–2–3', route: '/enablement/cold-call-playbook' },
    };
  }
  return {
    type: 'Unknown Fatality', checkpoint: 1,
    description: 'Review your discovery process. The root cause is unclear.',
    trainingLink: { label: 'Playbook — Start Here', sublabel: 'Buyer’s Intent · Doctor vs. Date mindset', route: '/team/process/overview?topic=date-vs-doctor' },
  };
}

// ---- Reason display config ----

const REASON_LABELS: Record<string, string> = {
  competitor: 'Lost to Competitor',
  'no-decision': 'No Decision',
  budget: 'Budget / Price',
  timing: 'Timing',
  'champion-left': 'Champion Left',
  'internal-solution': 'Built Internally',
  other: 'Other',
};

const REASON_COLORS: Record<string, string> = {
  competitor: '#ef4444',
  'no-decision': '#f97316',
  budget: '#f59e0b',
  timing: '#eab308',
  'champion-left': '#d946ef',
  'internal-solution': '#8b5cf6',
  other: '#78716c',
};

const FATALITY_CONFIG: Record<string, { color: string; bg: string; ring: string; icon: React.ReactNode }> = {
  'Priority Fatality': { color: 'text-rose-700', bg: 'bg-rose-50', ring: 'border-rose-200', icon: <AlertTriangle className="w-3 h-3" /> },
  'Value / Competition Fatality': { color: 'text-purple-700', bg: 'bg-purple-50', ring: 'border-purple-200', icon: <Shield className="w-3 h-3" /> },
  'Trust Fatality': { color: 'text-amber-700', bg: 'bg-amber-50', ring: 'border-amber-200', icon: <Heart className="w-3 h-3" /> },
  'Unknown Fatality': { color: 'text-stone-600', bg: 'bg-stone-100', ring: 'border-stone-200', icon: <HelpCircle className="w-3 h-3" /> },
};

// ---- Segment presets ----

interface SegmentPreset {
  id: string;
  name: string;
  icon: string;
  category: string;
  filter: (s: DiscoverySession) => boolean;
}

const SEGMENT_PRESETS: SegmentPreset[] = [
  // All
  { id: 'all', name: 'All Closed Lost', icon: 'list', category: 'all', filter: () => true },
  // Autopsy Status
  { id: 'needs-autopsy', name: 'Needs Autopsy', icon: 'inbox', category: 'status', filter: s => !s.post_mortem_completed },
  { id: 'completed', name: 'Completed', icon: 'check', category: 'status', filter: s => s.post_mortem_completed === true },
  // Fatality Type
  { id: 'priority-fatality', name: 'Priority Fatality', icon: 'alert', category: 'fatality', filter: s => s.post_mortem_fatality === 'Priority Fatality' },
  { id: 'value-fatality', name: 'Value / Competition', icon: 'shield', category: 'fatality', filter: s => s.post_mortem_fatality === 'Value / Competition Fatality' },
  { id: 'trust-fatality', name: 'Trust Fatality', icon: 'heart', category: 'fatality', filter: s => s.post_mortem_fatality === 'Trust Fatality' },
  // Loss Reason
  { id: 'lost-competitor', name: 'Lost to Competitor', icon: 'shield', category: 'reason', filter: s => s.loss_reason?.primary === 'competitor' },
  { id: 'no-decision', name: 'No Decision', icon: 'clock', category: 'reason', filter: s => s.loss_reason?.primary === 'no-decision' },
  { id: 'budget', name: 'Budget / Price', icon: 'dollar', category: 'reason', filter: s => s.loss_reason?.primary === 'budget' },
  // Winback
  { id: 'winback', name: 'Winback Potential', icon: 'refresh', category: 'winback', filter: s => s.loss_reason?.winback_potential === true },
];

const SEGMENT_CATEGORIES = [
  { id: 'all', label: 'Overview' },
  { id: 'status', label: 'Autopsy Status' },
  { id: 'fatality', label: 'Fatality Type' },
  { id: 'reason', label: 'Loss Reason' },
  { id: 'winback', label: 'Winback' },
];

const SEGMENT_ICON_MAP: Record<string, React.ReactNode> = {
  list: <LayoutList className="w-3.5 h-3.5" />,
  inbox: <Inbox className="w-3.5 h-3.5" />,
  check: <CheckCircle2 className="w-3.5 h-3.5" />,
  alert: <AlertTriangle className="w-3.5 h-3.5" />,
  shield: <Shield className="w-3.5 h-3.5" />,
  heart: <Heart className="w-3.5 h-3.5" />,
  clock: <Clock className="w-3.5 h-3.5" />,
  dollar: <DollarSign className="w-3.5 h-3.5" />,
  refresh: <RefreshCw className="w-3.5 h-3.5" />,
};

// ============================================================
// Sub-Components
// ============================================================

// ---- StatCard ----
function StatCard({ label, value, icon, accent = 'stone' }: {
  label: string; value: string | number; icon: React.ReactNode; accent?: string;
}) {
  const accents: Record<string, string> = {
    stone: 'bg-stone-50 text-stone-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <CleanCard className="p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accents[accent] ?? accents.stone}`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-stone-800 leading-tight tabular-nums">{value}</p>
        <p className="text-[10px] font-medium text-stone-500">{label}</p>
      </div>
    </CleanCard>
  );
}

// ---- FilterDropdown ----
function FilterDropdown({ label, value, options, onChange, icon: Icon }: {
  label: string;
  value: string;
  options: { value: string; label: string; count?: number }[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const active = value !== 'all';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
          active
            ? 'bg-stone-900 text-white border-stone-900'
            : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
        }`}
      >
        {Icon && <span className="opacity-60">{Icon}</span>}
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 z-40 bg-white border border-stone-200 rounded-xl shadow-lg py-1 min-w-[180px] max-h-[300px] overflow-y-auto"
            >
              {options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors flex items-center justify-between ${
                    value === opt.value
                      ? 'bg-stone-100 text-stone-900 font-bold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.count !== undefined && (
                    <span className="text-[10px] text-stone-400 ml-2 tabular-nums">{opt.count}</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Badges ----
function StatusBadge({ completed }: { completed: boolean }) {
  return completed ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3 h-3" /> Complete
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
      <Inbox className="w-3 h-3" /> Pending
    </span>
  );
}

function FatalityBadge({ fatality }: { fatality?: string }) {
  if (!fatality) return <span className="text-[10px] text-stone-400">—</span>;
  const cfg = FATALITY_CONFIG[fatality] ?? FATALITY_CONFIG['Unknown Fatality'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.ring}`}>
      {cfg.icon} {fatality.replace(' Fatality', '')}
    </span>
  );
}

function ReasonBadge({ reason }: { reason?: string }) {
  if (!reason) return <span className="text-[10px] text-stone-400">—</span>;
  const color = REASON_COLORS[reason] ?? '#78716c';
  const label = REASON_LABELS[reason] ?? reason;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {label}
    </span>
  );
}

// ---- SortIcon ----
function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: 'asc' | 'desc' }) {
  if (field !== sortField) return <ArrowUpDown className="w-3 h-3 text-stone-300" />;
  return sortDir === 'asc'
    ? <ArrowUp className="w-3 h-3 text-stone-700" />
    : <ArrowDown className="w-3 h-3 text-stone-700" />;
}

// ============================================================
// Redemption Drawer
// ============================================================
function RedemptionDrawer({ deal, onClose, onSave }: {
  deal: DiscoverySession;
  onClose: () => void;
  onSave: (dealId: string, symptoms: string[], analysis: FatalityAnalysis) => void;
}) {
  const navigate = useNavigate();
  const isPending = !deal.post_mortem_completed;
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(deal.post_mortem_symptoms || []);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(SYMPTOMS)));

  // Reset symptoms when deal changes
  useEffect(() => {
    setSelectedSymptoms(deal.post_mortem_symptoms || []);
  }, [deal.id]);

  const analysis = useMemo(() => analyzeDealFatality(selectedSymptoms), [selectedSymptoms]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) { next.delete(cat); } else { next.add(cat); }
      return next;
    });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-[520px] max-w-full bg-white border-l border-stone-200 shadow-2xl z-50 flex flex-col"
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between p-5 border-b border-stone-100">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-stone-900 truncate">{deal.company_name}</h2>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-sm font-bold text-stone-700 tabular-nums">{fmtCurrency(deal.deal_value || 0)}</span>
              <span className="text-[10px] text-stone-400">{new Date(deal.created_at).toLocaleDateString()}</span>
              <StatusBadge completed={deal.post_mortem_completed || false} />
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Deal Info */}
          <div className="grid grid-cols-2 gap-3">
            {deal.loss_reason?.primary && (
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-stone-500 mb-1">Loss Reason</p>
                <ReasonBadge reason={deal.loss_reason.primary} />
              </div>
            )}
            {deal.loss_reason?.competitor_won && (
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-stone-500 mb-1">Competitor</p>
                <p className="text-sm font-semibold text-stone-800">{deal.loss_reason.competitor_won}</p>
              </div>
            )}
            {deal.industry && (
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-stone-500 mb-1">Industry</p>
                <p className="text-sm font-semibold text-stone-800">{deal.industry}</p>
              </div>
            )}
            {deal.company_size && (
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-stone-500 mb-1">Company Size</p>
                <p className="text-sm font-semibold text-stone-800">{deal.company_size}</p>
              </div>
            )}
            {deal.loss_reason?.winback_potential && (
              <div className="bg-emerald-50 rounded-lg p-3 col-span-2">
                <p className="text-[10px] font-bold text-emerald-600 mb-1">Winback Opportunity</p>
                <p className="text-sm font-semibold text-emerald-800">
                  {deal.loss_reason.winback_date
                    ? `Re-engage by ${new Date(deal.loss_reason.winback_date).toLocaleDateString()}`
                    : 'Flagged for future re-engagement'}
                </p>
              </div>
            )}
          </div>

          {deal.loss_reason?.notes && (
            <div className="bg-stone-50 rounded-lg p-3">
              <p className="text-[10px] font-bold text-stone-500 mb-1">Notes</p>
              <p className="text-xs text-stone-700 leading-relaxed">{deal.loss_reason.notes}</p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-stone-100" />

          {isPending ? (
            /* ---- AUTOPSY MODE ---- */
            <>
              <div className="bg-stone-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-bold text-white">Deal Autopsy</h3>
                </div>
                <p className="text-xs text-stone-400">Select the symptoms of the lost deal to identify the root cause fatality.</p>
              </div>

              {/* Symptom selector */}
              <div className="space-y-2">
                {Object.entries(SYMPTOMS).map(([category, items]) => {
                  const isExpanded = expandedCategories.has(category);
                  const selectedCount = items.filter(s => selectedSymptoms.includes(s)).length;
                  return (
                    <div key={category} className="border border-stone-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-3 hover:bg-stone-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-stone-400">{SYMPTOM_CATEGORY_ICONS[category]}</span>
                          <span className="text-xs font-bold text-stone-700">
                            {SYMPTOM_CATEGORY_LABELS[category]}
                          </span>
                          {selectedCount > 0 && (
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">
                              {selectedCount}
                            </span>
                          )}
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-1.5">
                              {items.map(symptom => (
                                <button
                                  key={symptom}
                                  onClick={() => toggleSymptom(symptom)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors border ${
                                    selectedSymptoms.includes(symptom)
                                      ? 'bg-rose-50 border-rose-200 text-rose-700 font-medium'
                                      : 'bg-stone-50 border-stone-100 text-stone-600 hover:bg-stone-100'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className={`mt-0.5 w-3 h-3 rounded border flex-shrink-0 ${
                                      selectedSymptoms.includes(symptom)
                                        ? 'bg-rose-500 border-rose-500'
                                        : 'bg-white border-stone-300'
                                    }`} />
                                    <span className="leading-tight">{symptom}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Live analysis */}
              <AnimatePresence mode="wait">
                {analysis ? (
                  <motion.div
                    key={analysis.type}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="border border-rose-200 rounded-xl overflow-hidden"
                  >
                    <div className="bg-rose-50 border-b border-rose-100 px-4 py-3 flex items-center gap-2.5">
                      <div className="bg-rose-100 p-1.5 rounded-full">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-900">{analysis.type}</h4>
                        <p className="text-[10px] text-rose-600 font-medium">Root Cause Identified</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-4 bg-white">
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 block mb-1">Missed Checkpoint</span>
                        <span className="inline-flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-bold text-stone-800">
                          Checkpoint {analysis.checkpoint}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 block mb-1">Diagnosis</span>
                        <p className="text-xs text-stone-700 leading-relaxed">{analysis.description}</p>
                      </div>
                      <div className="pt-3 border-t border-stone-100">
                        <span className="text-[10px] font-bold text-[#FF2A7F] block mb-2">Practice This Now</span>
                        <button
                          onClick={() => { onClose(); navigate(analysis.trainingLink.route); }}
                          className="w-full bg-gradient-to-r from-[#FF2A7F] to-[#c0006a] hover:from-[#e0246f] hover:to-[#a8005e] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm flex items-center justify-between group"
                        >
                          <div className="text-left">
                            <p className="font-bold text-[13px]">{analysis.trainingLink.label}</p>
                            <p className="text-[10px] text-white/70">{analysis.trainingLink.sublabel}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center bg-stone-50/50"
                  >
                    <FileText className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-stone-500">Select symptoms above to generate the analysis</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* ---- READ-ONLY COMPLETED MODE ---- */
            <>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">Autopsy Complete</h3>
                  <p className="text-xs text-emerald-700">This deal has been analyzed and categorized.</p>
                </div>
              </div>

              {deal.post_mortem_fatality && (
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="bg-stone-50 px-4 py-3 border-b border-stone-100">
                    <p className="text-[10px] font-bold text-stone-500">Fatality Classification</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <FatalityBadge fatality={deal.post_mortem_fatality} />
                    {deal.post_mortem_pathway && (() => {
                      // Map saved fatality back to a training route
                      const routeMap: Record<string, { label: string; route: string }> = {
                        'Trust Fatality': { label: 'Five Fatalities — Playbook', route: '/team/process/overview?topic=five-fatalities' },
                        'Value / Competition Fatality': { label: 'Three Checkpoints — Playbook', route: '/team/process/overview?topic=three-checkpoints' },
                        'Priority Fatality': { label: 'Three Waves — Cold Call Playbook', route: '/enablement/cold-call-playbook' },
                      };
                      const training = routeMap[deal.post_mortem_fatality ?? ''];
                      if (!training) return null;
                      return (
                        <div>
                          <p className="text-[10px] font-bold text-stone-500 mb-2">Training — Go Practice</p>
                          <button
                            onClick={() => { onClose(); navigate(training.route); }}
                            className="w-full flex items-center justify-between bg-gradient-to-r from-[#FF2A7F] to-[#c0006a] text-white font-bold py-2.5 px-4 rounded-xl text-[12px] group hover:from-[#e0246f] hover:to-[#a8005e] transition-all"
                          >
                            {training.label}
                            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {deal.post_mortem_symptoms && deal.post_mortem_symptoms.length > 0 && (
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="bg-stone-50 px-4 py-3 border-b border-stone-100">
                    <p className="text-[10px] font-bold text-stone-500">
                      Symptoms Identified ({deal.post_mortem_symptoms.length})
                    </p>
                  </div>
                  <div className="p-4 space-y-1.5">
                    {deal.post_mortem_symptoms.map(s => (
                      <div key={s} className="flex items-start gap-2 text-xs text-stone-700">
                        <div className="w-3 h-3 rounded bg-rose-500 border-rose-500 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer — save button for pending */}
        {isPending && analysis && (
          <div className="border-t border-stone-100 p-4">
            <button
              onClick={() => onSave(deal.id, selectedSymptoms, analysis)}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl shadow-sm transition-colors text-sm"
            >
              Complete Autopsy
            </button>
          </div>
        )}
      </motion.aside>
    </>
  );
}

// ============================================================
// Sort fields
// ============================================================
type SortField = 'company_name' | 'deal_value' | 'loss_reason' | 'competitor' | 'fatality' | 'status' | 'created_at';

function getSortValue(deal: DiscoverySession, field: SortField): string | number {
  switch (field) {
    case 'company_name': return deal.company_name.toLowerCase();
    case 'deal_value': return deal.deal_value ?? 0;
    case 'loss_reason': return deal.loss_reason?.primary ?? 'zzz';
    case 'competitor': return deal.loss_reason?.competitor_won ?? 'zzz';
    case 'fatality': return deal.post_mortem_fatality ?? 'zzz';
    case 'status': return deal.post_mortem_completed ? 1 : 0;
    case 'created_at': return deal.created_at;
    default: return '';
  }
}

// ============================================================
// Main Component
// ============================================================
export default function SalesRedemption() {
  const { effectiveUser, isAdmin, isImpersonating } = useAuth();

  // ---- State ----
  const [allDeals, setAllDeals] = useState<DiscoverySession[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Admin team view
  const isTeamView = isAdmin && !isImpersonating;
  const [repFilter, setRepFilter] = useState<string | null>(null); // null = whole team
  const [allTeamDeals, setAllTeamDeals] = useState<DiscoverySession[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFatality, setFilterFatality] = useState('all');
  const [filterReason, setFilterReason] = useState('all');

  // Sort
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer
  const [selectedDeal, setSelectedDeal] = useState<DiscoverySession | null>(null);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  // ---- Load Data ----
  const loadDeals = () => {
    const all = getAllDiscoverySessions();
    const allCL = all.filter(s => s.deal_stage === 'closed_lost');
    if (isTeamView) {
      setAllTeamDeals(allCL); // for dropdown counts
      setAllDeals(repFilter ? allCL.filter(s => s.rep_id === repFilter) : allCL);
    } else {
      setAllDeals(allCL.filter(s => s.rep_id === effectiveUser?.id));
    }
  };

  useEffect(() => {
    loadDeals();
  }, [effectiveUser?.id, repFilter, isTeamView]);

  // ---- Stats (computed from all deals, before any filtering) ----
  const stats = useMemo(() => {
    const totalRevenue = allDeals.reduce((sum, d) => sum + (d.deal_value ?? 0), 0);
    const pending = allDeals.filter(d => !d.post_mortem_completed).length;
    const completed = allDeals.filter(d => d.post_mortem_completed).length;

    // Top fatality
    const fatCounts: Record<string, number> = {};
    allDeals.forEach(d => {
      if (d.post_mortem_fatality) {
        fatCounts[d.post_mortem_fatality] = (fatCounts[d.post_mortem_fatality] ?? 0) + 1;
      }
    });
    const topFatality = Object.entries(fatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

    return { totalRevenue, total: allDeals.length, pending, completed, topFatality };
  }, [allDeals]);

  // ---- Segment counts ----
  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SEGMENT_PRESETS.forEach(seg => {
      counts[seg.id] = allDeals.filter(seg.filter).length;
    });
    return counts;
  }, [allDeals]);

  // ---- Filtered & sorted deals ----
  const filteredDeals = useMemo(() => {
    let deals = [...allDeals];

    // Apply active segment
    const seg = SEGMENT_PRESETS.find(s => s.id === activeSegmentId);
    if (seg) deals = deals.filter(seg.filter);

    // Apply dropdown filters
    if (filterStatus === 'pending') deals = deals.filter(d => !d.post_mortem_completed);
    else if (filterStatus === 'completed') deals = deals.filter(d => d.post_mortem_completed);

    if (filterFatality !== 'all') {
      deals = deals.filter(d => d.post_mortem_fatality === filterFatality);
    }

    if (filterReason !== 'all') {
      deals = deals.filter(d => d.loss_reason?.primary === filterReason);
    }

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      deals = deals.filter(d =>
        d.company_name.toLowerCase().includes(q) ||
        (d.loss_reason?.competitor_won ?? '').toLowerCase().includes(q) ||
        (d.loss_reason?.notes ?? '').toLowerCase().includes(q) ||
        (d.industry ?? '').toLowerCase().includes(q)
      );
    }

    // Sort
    deals.sort((a, b) => {
      const aVal = getSortValue(a, sortField);
      const bVal = getSortValue(b, sortField);
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return deals;
  }, [allDeals, activeSegmentId, filterStatus, filterFatality, filterReason, debouncedSearch, sortField, sortDir]);

  // ---- Pagination ----
  const totalPages = Math.ceil(filteredDeals.length / PAGE_SIZE);
  const paginatedDeals = useMemo(
    () => filteredDeals.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredDeals, currentPage]
  );

  // ---- Handlers ----
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const handleSegmentClick = (segId: string) => {
    setActiveSegmentId(segId);
    setFilterStatus('all');
    setFilterFatality('all');
    setFilterReason('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterFatality('all');
    setFilterReason('all');
    setRepFilter(null);
    setSearchQuery('');
    setDebouncedSearch('');
    setActiveSegmentId('all');
    setCurrentPage(1);
  };

  const handleSave = (dealId: string, symptoms: string[], analysis: FatalityAnalysis) => {
    updatePostMortemFields(dealId, {
      post_mortem_completed: true,
      post_mortem_fatality: analysis.type,
      post_mortem_symptoms: symptoms,
      post_mortem_pathway: analysis.academyModule.title,
    });
    loadDeals();
    // Update the drawer deal to show completed state
    const updated = getAllDiscoverySessions().find(s => s.id === dealId);
    if (updated) setSelectedDeal(updated);
  };

  const hasActiveFilters = filterStatus !== 'all' || filterFatality !== 'all' || filterReason !== 'all' || searchQuery.length > 0 || repFilter !== null;

  // ---- Filter options ----
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Needs Autopsy', count: stats.pending },
    { value: 'completed', label: 'Completed', count: stats.completed },
  ];

  const fatalityOptions = [
    { value: 'all', label: 'All Fatalities' },
    { value: 'Priority Fatality', label: 'Priority', count: allDeals.filter(d => d.post_mortem_fatality === 'Priority Fatality').length },
    { value: 'Value / Competition Fatality', label: 'Value / Competition', count: allDeals.filter(d => d.post_mortem_fatality === 'Value / Competition Fatality').length },
    { value: 'Trust Fatality', label: 'Trust', count: allDeals.filter(d => d.post_mortem_fatality === 'Trust Fatality').length },
    { value: 'Unknown Fatality', label: 'Unknown', count: allDeals.filter(d => d.post_mortem_fatality === 'Unknown Fatality').length },
  ];

  const reasonOptions = [
    { value: 'all', label: 'All Reasons' },
    ...Object.entries(REASON_LABELS).map(([val, label]) => ({
      value: val,
      label,
      count: allDeals.filter(d => d.loss_reason?.primary === val).length,
    })),
  ];

  // ---- Page numbers for pagination ----
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen flex bg-stone-50/50">
      {/* ---- Segment Sidebar ---- */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-r border-stone-200 bg-white overflow-hidden"
          >
            <div className="w-64 h-full flex flex-col">
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                <span className="text-[10px] font-bold text-stone-500">Segments</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-stone-100 rounded transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5 text-stone-400" />
                </button>
              </div>

              {/* Segment list */}
              <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-3">
                {SEGMENT_CATEGORIES.map(cat => {
                  const segs = SEGMENT_PRESETS.filter(s => s.category === cat.id);
                  if (segs.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <p className="text-[9px] font-bold text-stone-400 px-2 mb-1">{cat.label}</p>
                      {segs.map(seg => {
                        const isActive = activeSegmentId === seg.id;
                        const count = segmentCounts[seg.id] ?? 0;
                        return (
                          <button
                            key={seg.id}
                            onClick={() => handleSegmentClick(seg.id)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all mb-0.5 ${
                              isActive
                                ? 'bg-stone-900 text-white'
                                : 'text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className={isActive ? 'text-white/70' : 'text-stone-400'}>
                                {SEGMENT_ICON_MAP[seg.icon]}
                              </span>
                              {seg.name}
                            </span>
                            <span className={`text-[10px] tabular-nums ${isActive ? 'text-white/60' : 'text-stone-400'}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ---- Main Content ---- */}
      <div className="flex-1 min-w-0 overflow-auto">
        <CleanPage>
          {/* Toggle sidebar when collapsed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="mb-3 flex items-center gap-1.5 text-[11px] font-medium text-stone-500 hover:text-stone-700 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" /> Show Segments
            </button>
          )}

          {/* Header */}
          <CleanPageHeader
            icon={
              <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center">
                <ArchiveX size={18} className="text-white" />
              </div>
            }
            title="Sales Redemption"
            subtitle="Turn every loss into a lesson. Autopsy closed-lost deals to identify root cause fatalities."
            actions={
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                stats.pending === 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {stats.pending === 0 ? <CheckCircle2 size={14} /> : <Inbox size={14} />}
                {stats.pending === 0 ? 'All Autopsied' : `${stats.pending} Pending`}
              </div>
            }
          />

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Total Revenue Lost"
              value={fmtCurrency(stats.totalRevenue)}
              icon={<Skull className="w-4 h-4" />}
              accent="rose"
            />
            <StatCard
              label="Deals Lost"
              value={stats.total}
              icon={<ArchiveX className="w-4 h-4" />}
              accent="stone"
            />
            <StatCard
              label="Pending Autopsy"
              value={stats.pending}
              icon={<Inbox className="w-4 h-4" />}
              accent="amber"
            />
            <StatCard
              label="Top Fatality"
              value={stats.topFatality.replace(' Fatality', '')}
              icon={<Zap className="w-4 h-4" />}
              accent="purple"
            />
          </div>

          {/* Toolbar */}
          <CleanPageToolbar
            left={
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search companies, competitors, notes..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-stone-400 transition-colors"
                />
              </div>
            }
            right={
              <div className="flex items-center gap-1.5">
                {isTeamView && (
                  <FilterDropdown
                    label="Rep"
                    value={repFilter ?? 'all'}
                    options={[
                      { value: 'all', label: 'All Reps', count: allTeamDeals.length },
                      ...REP_PROFILES.map(r => ({
                        value: r.id,
                        label: r.full_name,
                        count: allTeamDeals.filter(d => d.rep_id === r.id).length,
                      })),
                    ]}
                    onChange={v => { setRepFilter(v === 'all' ? null : v); setCurrentPage(1); }}
                    icon={<Users className="w-3 h-3" />}
                  />
                )}
                <FilterDropdown
                  label="Status"
                  value={filterStatus}
                  options={statusOptions}
                  onChange={v => { setFilterStatus(v); setCurrentPage(1); }}
                  icon={<Eye className="w-3 h-3" />}
                />
                <FilterDropdown
                  label="Fatality"
                  value={filterFatality}
                  options={fatalityOptions}
                  onChange={v => { setFilterFatality(v); setCurrentPage(1); }}
                  icon={<AlertTriangle className="w-3 h-3" />}
                />
                <FilterDropdown
                  label="Reason"
                  value={filterReason}
                  options={reasonOptions}
                  onChange={v => { setFilterReason(v); setCurrentPage(1); }}
                  icon={<Shield className="w-3 h-3" />}
                />
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-stone-500 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            }
          />

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-stone-500">
              Showing <span className="font-bold text-stone-700">{paginatedDeals.length}</span> of{' '}
              <span className="font-bold text-stone-700">{filteredDeals.length}</span> deals
            </p>
          </div>

          {/* ---- THE TABLE ---- */}
          <CleanCard className="p-0 flex-1 flex flex-col overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <colgroup>
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/80">
                    {([
                      ['company_name', 'Company'],
                      ['deal_value', 'Value'],
                      ['loss_reason', 'Loss Reason'],
                      ['competitor', 'Competitor'],
                      ['fatality', 'Fatality'],
                      ['', 'Symptoms'],
                      ['status', 'Status'],
                      ['created_at', 'Date'],
                    ] as [string, string][]).map(([field, label]) => (
                      <th
                        key={label}
                        onClick={field ? () => handleSort(field as SortField) : undefined}
                        className={`text-left px-4 py-2.5 text-[10px] font-bold text-stone-500 whitespace-nowrap ${
                          field ? 'cursor-pointer hover:text-stone-700 select-none' : ''
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {label}
                          {field && <SortIcon field={field} sortField={sortField} sortDir={sortDir} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedDeals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center">
                        <Search className="w-8 h-8 text-stone-200 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-stone-600 mb-1">No closed-lost deals found</h3>
                        <p className="text-xs text-stone-400 mb-3">Try adjusting your filters or search query.</p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                          >
                            Clear all filters
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginatedDeals.map(deal => (
                      <tr
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        className={`border-b border-stone-100 hover:bg-stone-50/50 cursor-pointer transition-colors ${
                          !deal.post_mortem_completed ? 'border-l-2 border-l-amber-400' : ''
                        }`}
                      >
                        {/* Company */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {isTeamView && (() => {
                              const rep = REP_PROFILES.find(r => r.id === deal.rep_id);
                              return rep ? (
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                                  style={{ backgroundColor: rep.avatar_color }}
                                  title={rep.full_name}
                                >
                                  {rep.initials}
                                </div>
                              ) : null;
                            })()}
                            <div className="min-w-0">
                              <p className="font-bold text-stone-800 truncate">{deal.company_name}</p>
                              {deal.industry && (
                                <p className="text-[10px] text-stone-400 truncate">{deal.industry}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Value */}
                        <td className="px-4 py-2.5 font-bold text-stone-700 tabular-nums whitespace-nowrap">
                          {fmtCurrency(deal.deal_value || 0)}
                        </td>
                        {/* Loss Reason */}
                        <td className="px-4 py-2.5">
                          <ReasonBadge reason={deal.loss_reason?.primary} />
                        </td>
                        {/* Competitor */}
                        <td className="px-4 py-2.5 text-stone-600 truncate">
                          {deal.loss_reason?.competitor_won || <span className="text-stone-300">—</span>}
                        </td>
                        {/* Fatality */}
                        <td className="px-4 py-2.5">
                          <FatalityBadge fatality={deal.post_mortem_fatality} />
                        </td>
                        {/* Symptoms */}
                        <td className="px-4 py-2.5">
                          {deal.post_mortem_symptoms && deal.post_mortem_symptoms.length > 0 ? (
                            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                              {deal.post_mortem_symptoms.length} found
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-300">—</span>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-2.5">
                          <StatusBadge completed={deal.post_mortem_completed || false} />
                        </td>
                        {/* Date */}
                        <td className="px-4 py-2.5 text-stone-500 tabular-nums whitespace-nowrap">
                          {new Date(deal.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-white">
                <p className="text-[10px] text-stone-500 tabular-nums">
                  Page {currentPage} of {totalPages} · {filteredDeals.length} results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {pageNumbers.map(n => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-colors ${
                        n === currentPage
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </CleanCard>
        </CleanPage>
      </div>

      {/* ---- Detail Drawer ---- */}
      <AnimatePresence>
        {selectedDeal && (
          <RedemptionDrawer
            deal={selectedDeal}
            onClose={() => setSelectedDeal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
