import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStageVisibility, DEFAULT_VISIBILITY, type RoomVisibility } from '../../components/discovery/RoomSections';
import { CMSWorkspace } from '../../components/discovery/CMSWorkspace';
import { SmartRoomModal, type SmartRoomConfig } from '../../components/discovery/SmartRoomModal';
import { RoomReadinessModal } from '../../components/discovery/RoomReadinessScore';
import { PipelineBoard } from '../../components/discovery/PipelineBoard';
import { PipelineCalendar } from '../../components/discovery/PipelineCalendar';
import { PipelineTableView } from '../../components/discovery/PipelineTableView';
import {
  type DiscoverySession,
  type MeetingType,
  createDiscoverySession,
  getSessionsForRep,
  getAllDiscoverySessions,
  persistSession,
  updateSessionPains,
  updateSessionPersona,
  updateSessionATS,
  updateSessionIndustry,
  updateSessionCompanySize,
  updateSessionUseCase,
  computeBAPAnswers,
  getCheckpointScore,
  BAP_QUESTIONS,
  updateDealValue,
  compute4DFromBAP,
  addCustomMeeting,
  logDealMetric,
} from '../../lib/discoveryDatabase';
import { generateShareableUrl, copyToClipboard, type RoomConfig } from '../../lib/shareableRoom';
import { fmtCurrency } from '../../lib/format';
import {
  Share2, Check, Sparkles, ChevronRight, Plus,
  X, ArrowLeft, Zap, ChevronUp, ChevronDown, ChevronsUpDown,
  TrendingUp, Calendar, AlertTriangle, LogOut, Search, Settings, Eye, Users,
  LayoutGrid, List,
} from 'lucide-react';
import { useAuth, REP_PROFILES } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useSync } from '../../hooks/useSync';
import { useAutoSyncGranola } from '../../hooks/useAutoSyncGranola';
import { useGoogleCalendarSync } from '../../hooks/useGoogleCalendarSync';
import { GoogleCalendarSettingsDrawer } from '../../components/discovery/GoogleCalendarSettingsDrawer';
import { startGCalAuth, disconnectGCal, clearGCalCache } from '../../lib/googleCalendarClient';
import { scoreDeal } from '../../lib/leaderboard';
import { computeMethodologyScore } from '../../lib/methodologyScore';

// ── Helpers ──

const STAGE_CONFIG: Record<string, { label: string; color: string; short: string }> = {
  qualifying:    { label: 'Qualifying',    color: '#64748b', short: 'D1' },
  investigating: { label: 'Investigating', color: '#0ea5e9', short: 'D1' },
  evaluating:    { label: 'Evaluating',    color: '#8b5cf6', short: 'D2' },
  negotiating:   { label: 'Negotiating',   color: '#f59e0b', short: 'D3' },
  contracting:   { label: 'Contracting',   color: '#f97316', short: 'D3' },
  signing:       { label: 'Signing',       color: '#10b981', short: 'D4' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Deal Card Grid ──

function DealCardGrid({
  sessions,
  onSelect,
  onCreateNew,
  onCreateSmart,
  viewMode,
  onViewModeChange,
  repFilter,
  onRepFilterChange,
  showRepFilter,
}: {
  sessions: DiscoverySession[];
  onSelect: (s: DiscoverySession) => void;
  onCreateNew: (name: string) => void;
  onCreateSmart: () => void;
  viewMode: 'cards' | 'pipeline';
  onViewModeChange: (mode: 'cards' | 'pipeline') => void;
  repFilter: string | null;
  onRepFilterChange: (repId: string | null) => void;
  showRepFilter: boolean;
}) {
  const { user, effectiveUser, isManager, isAdmin, isImpersonating, logout } = useAuth();
  const [newName, setNewName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    onCreateNew(name);
    setNewName('');
    setShowInput(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayUser = isImpersonating ? effectiveUser : user;

  // Pipeline stats
  const stageCount = { qualifying: 0, investigating: 0, evaluating: 0, negotiating: 0, contracting: 0, signing: 0 };
  let totalScore = 0;
  sessions.forEach(s => {
    const key = s.deal_stage ?? 'qualifying';
    if (key in stageCount) stageCount[key as keyof typeof stageCount]++;;
    totalScore += scoreDeal(s).totalPoints;
  });
  const avgScore = sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0;

  // Filter sessions
  const filtered = sessions.filter(s => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!s.company_name.toLowerCase().includes(q)) return false;
    }
    if (stageFilter) {
      if ((s.deal_stage ?? 'qualifying') !== stageFilter) return false;
    }
    return true;
  });

  // Priority sort: needs attention first, then upcoming meetings, then by recency
  const sorted = [...filtered].sort((a, b) => {
    const needsA = !a.next_action && !a.next_meeting_date && (a.selected_pains?.length ?? 0) === 0;
    const needsB = !b.next_action && !b.next_meeting_date && (b.selected_pains?.length ?? 0) === 0;
    if (needsA !== needsB) return needsA ? -1 : 1;
    // Upcoming meetings first (soonest at top)
    const meetA = a.next_meeting_date ? new Date(a.next_meeting_date).getTime() : Infinity;
    const meetB = b.next_meeting_date ? new Date(b.next_meeting_date).getTime() : Infinity;
    if (meetA !== meetB) return meetA - meetB;
    // Most recently created
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ─── Top Bar ─── */}
      <header className="border-b border-stone-200/60 bg-stone-900">
        <div className="mx-auto flex h-12 items-center justify-between px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <img src="/lg.svg" alt="Teamtailor" className="h-4.5 w-auto object-contain brightness-0 invert" />
            <div className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/90">
              Command
            </div>
          </div>

          {/* Center: Quick nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Deals', path: '/team/discovery', active: true },
              { label: 'Team', path: '/team/scorecard', active: false },
              { label: 'Analytics', path: '/team/analytics', active: false },
              { label: 'Leaderboard', path: '/team/leaderboard', active: false },
            ].map(link => (
              <button
                key={link.path}
                onClick={() => { if (!link.active) navigate(link.path); }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  link.active
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: User */}
          <div className="flex items-center gap-3">
            {displayUser && (
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-1 ring-white/20"
                  style={{ backgroundColor: displayUser.avatar_color }}
                >
                  {displayUser.initials}
                </div>
                <div className="hidden sm:block">
                  <div className="text-[11px] font-semibold text-white/90 leading-tight">{displayUser.full_name}</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-wider">{isAdmin ? 'Admin' : displayUser.role}</div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Pipeline Summary Strip ─── */}
      <div className="border-b border-stone-200/60 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Stage funnel pills */}
            {([
              { key: 'qualifying', label: 'D1', color: '#64748b', count: stageCount.qualifying },
              { key: 'investigating', label: 'D1', color: '#0ea5e9', count: stageCount.investigating },
              { key: 'evaluating', label: 'D2', color: '#8b5cf6', count: stageCount.evaluating },
              { key: 'negotiating', label: 'D3', color: '#f59e0b', count: stageCount.negotiating },
              { key: 'contracting', label: 'D3', color: '#f97316', count: stageCount.contracting },
              { key: 'signing', label: 'D4', color: '#10b981', count: stageCount.signing },
            ] as const).map((s, i) => (
              <button
                key={s.key}
                onClick={() => setStageFilter(stageFilter === s.key ? null : s.key)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                  stageFilter === s.key
                    ? 'ring-2 shadow-sm'
                    : 'hover:bg-stone-50'
                }`}
                style={stageFilter === s.key ? { backgroundColor: s.color + '12', color: s.color } : {}}
              >
                {i > 0 && <ChevronRight size={10} className="text-stone-300 -ml-4 mr-0" />}
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-black"
                  style={{ backgroundColor: s.color }}
                >
                  {s.count}
                </div>
                <span className={stageFilter === s.key ? '' : 'text-stone-600'}>{s.label}</span>
              </button>
            ))}

            <div className="flex-1" />

            {/* Avg deal health */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Avg Health</span>
              <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                avgScore > 70 ? 'text-emerald-600 bg-emerald-50' : avgScore > 40 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
              }`}>
                <TrendingUp size={10} />
                {avgScore}%
              </div>
            </div>

            {/* Total deals */}
            <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Deals</span>
              <span className="text-sm font-bold text-stone-900">{sessions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Action row */}
        <div className="flex items-center justify-between mb-6">
          {/* Search + Rep Filter */}
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search deals…"
                className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200"
              />
            </div>
            {showRepFilter && (
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-stone-400" />
                <select
                  value={repFilter ?? '__all__'}
                  onChange={e => onRepFilterChange(e.target.value === '__all__' ? null : e.target.value)}
                  className="rounded-lg border border-stone-200 bg-white py-2 px-3 text-sm text-stone-700 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 cursor-pointer"
                >
                  <option value="__all__">Whole Team</option>
                  {REP_PROFILES.map(rep => (
                    <option key={rep.id} value={rep.id}>{rep.full_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Clear filter + New room */}
          <div className="flex items-center gap-2">
            {stageFilter && (
              <button
                onClick={() => setStageFilter(null)}
                className="flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-500 hover:bg-stone-50 transition-colors"
              >
                <X size={12} />
                Clear filter
              </button>
            )}
            {/* View toggle */}
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
              <button
                onClick={() => onViewModeChange('cards')}
                className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                  viewMode === 'cards' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => onViewModeChange('pipeline')}
                className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                  viewMode === 'pipeline' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                Pipeline
              </button>
            </div>
            <button
              onClick={() => onCreateSmart()}
              className="flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 transition-colors shadow-sm"
            >
              <Sparkles size={14} className="text-amber-400" />
              New Room
            </button>
          </div>
        </div>

        {/* Empty state */}
        {sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
              <Sparkles size={28} className="text-stone-400" />
            </div>
            <h2 className="mt-6 text-lg font-bold text-stone-900">Create your first Discovery Room</h2>
            <p className="mt-2 text-sm text-stone-500">Enter a company name to start building a buyer action plan.</p>
            <button
              onClick={() => onCreateSmart()}
              className="mt-6 flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-colors"
            >
              <Plus size={14} />
              New Discovery Room
            </button>
          </div>
        )}

        {/* ── New Room modal ── */}
        {showInput && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setShowInput(false); }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-stone-200 p-6">
              <h2 className="text-base font-bold text-stone-900 mb-1">New Discovery Room</h2>
              <p className="text-sm text-stone-500 mb-4">Enter the company name to start building their buyer action plan.</p>
              <form
                onSubmit={e => { e.preventDefault(); handleCreate(); }}
                className="flex flex-col gap-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Acme Corp, Stripe, Notion…"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowInput(false); setNewName(''); }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-stone-500 hover:bg-stone-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newName.trim()}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-stone-900 text-sm font-semibold text-white hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={13} className="text-amber-400" />
                    Create Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filtered empty */}
        {sessions.length > 0 && sorted.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-stone-500">No deals match your search{stageFilter ? ` in ${STAGE_CONFIG[stageFilter]?.label}` : ''}</p>
          </div>
        )}

        {/* Deal cards grid */}
        {sorted.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {sorted.map(s => {
              const score = scoreDeal(s);
              const stageKey = s.deal_stage ?? 'qualifying';
              const stage = STAGE_CONFIG[stageKey] || STAGE_CONFIG.qualifying;
              const painCount = s.selected_pains?.length ?? 0;
              const pct = score.totalPoints;

              // Single composite health: combines score + gut feel + stall detection
              const isStalled = !s.next_action && !s.next_meeting_date && painCount === 0;
              const gutPenalty = s.gut_feel === 'weak' ? -15 : s.gut_feel === 'mixed' ? -5 : 0;
              const healthScore = Math.max(0, Math.min(100, pct + gutPenalty - (isStalled ? 20 : 0)));
              const healthColor = healthScore > 65 ? '#10b981' : healthScore > 35 ? '#f59e0b' : '#ef4444';

              // Single contextual action line
              let actionLine: { icon: React.ReactNode; text: string; urgent?: boolean } | null = null;
              if (isStalled) {
                actionLine = { icon: <AlertTriangle size={11} className="text-amber-500 shrink-0" />, text: 'Needs attention', urgent: true };
              } else if (s.next_meeting_date) {
                const d = new Date(s.next_meeting_date);
                const isToday = d.toDateString() === new Date().toDateString();
                const isTomorrow = d.toDateString() === new Date(Date.now() + 86400000).toDateString();
                const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                actionLine = { icon: <Calendar size={11} className="text-stone-400 shrink-0" />, text: label, urgent: isToday };
              } else if (s.next_action) {
                actionLine = { icon: <Zap size={11} className="text-stone-400 shrink-0" />, text: s.next_action };
              }

              return (
                <motion.button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  className="text-left rounded-xl border border-stone-200/60 bg-white hover:border-stone-300/80 transition-all group relative overflow-hidden"
                >
                  {/* Health-colored left accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: healthColor }} />

                  <div className="pl-4 pr-4 py-3.5">
                    {/* Row 1: Company name + Stage + Value */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[14px] font-semibold text-stone-900 truncate group-hover:text-stone-700 transition-colors flex-1 min-w-0">
                        {s.company_name}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.deal_value > 0 && (
                          <span className="text-[12px] font-medium text-stone-500 tabular-nums">
                            {fmtCurrency(s.deal_value)}
                          </span>
                        )}
                        <div
                          className="rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white"
                          style={{ backgroundColor: stage.color }}
                        >
                          {stage.short}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Action line + time */}
                    <div className="flex items-center justify-between mt-2">
                      {actionLine ? (
                        <div className={`flex items-center gap-1.5 ${actionLine.urgent ? 'text-amber-600' : 'text-stone-500'}`}>
                          {actionLine.icon}
                          <span className={`text-[11px] truncate max-w-[220px] ${actionLine.urgent ? 'font-medium' : ''}`}>
                            {actionLine.text}
                          </span>
                        </div>
                      ) : (
                        <span />
                      )}
                      <span className="text-[10px] text-stone-400 shrink-0">{timeAgo(s.created_at)}</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Component ──

interface Props {
  companyId?: string;
  repId?: string;
}

export default function DiscoveryRoom({ companyId, repId }: Props) {
  const { effectiveUser, isAdmin, isImpersonating } = useAuth();
  const { toast } = useToast();
  const activeRepId = repId || effectiveUser?.id || null;

  // Admin (not impersonating) can see all deals or filter by rep
  const showRepFilter = isAdmin && !isImpersonating;
  const [repFilter, setRepFilter] = useState<string | null>(null); // null = whole team

  // Session state
  const [sessions, setSessions] = useState<DiscoverySession[]>([]);
  const [currentSession, setCurrentSession] = useState<DiscoverySession | null>(null);
  const [newCompanyName, setNewCompanyName] = useState('');

  // Room state (hydrated from session)
  const [selectedPains, setSelectedPains] = useState<string[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [selectedATS, setSelectedATS] = useState<string | null>(null);

  // Save indicator
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const flashSave = useCallback(() => {
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 300);
    setTimeout(() => setSaveStatus('idle'), 2500);
  }, []);

  // Share state
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Smart Room Modal state
  const [showSmartModal, setShowSmartModal] = useState(false);

  // Active tab state (lifted from RepWorkspace)
  const [activeTab, setActiveTab] = useState<'bap' | 'meddpicc' | 'settings' | 'analytics' | 'call'>('call'); // Default to Call tab for rep workflow

  // Pipeline view toggle: kanban (default) vs table vs calendar
  const [pipelineView, setPipelineView] = useState<'kanban' | 'table' | 'calendar'>('kanban');

  // Inline cell editing state for table view (unified for all editable columns)
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editingText, setEditingText] = useState('');

  // Table sorting state
  const [sortCol, setSortCol] = useState<string>('deal_value');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };
  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ChevronsUpDown size={10} className="text-stone-300 ml-0.5" />;
    return sortDir === 'asc'
      ? <ChevronUp size={10} className="text-stone-600 ml-0.5" />
      : <ChevronDown size={10} className="text-stone-600 ml-0.5" />;
  };

  // Room Readiness Modal state
  const [showReadinessModal, setShowReadinessModal] = useState(false);

  // Google Calendar integration
  const [showGCalSettings, setShowGCalSettings] = useState(false);
  const gcal = useGoogleCalendarSync();



  const brand = '#44403c'; // stone-700 as the accent
  const companyName = currentSession?.company_name ?? 'New Company';
  const sessionId = currentSession?.id ?? null;
  const stageKey = currentSession?.deal_stage ?? 'qualifying';
  const stage = STAGE_CONFIG[stageKey] || STAGE_CONFIG.qualifying;

  // Room section visibility — load from session if persisted, else default all-ON
  const [visibility, setVisibility] = useState<RoomVisibility>(() => {
    if (currentSession?.room_visibility) return { ...DEFAULT_VISIBILITY, ...currentSession.room_visibility } as RoomVisibility;
    return { ...DEFAULT_VISIBILITY };
  });

  // Wrap setVisibility to also persist to the session
  const handleVisibilityChange = useCallback((next: RoomVisibility) => {
    setVisibility(next);
    if (currentSession) {
      const updated = { ...currentSession, room_visibility: next } as any;
      persistSession(updated);
      setCurrentSession(updated);
    }
  }, [currentSession]);

  // Multiplayer Sync
  const { isConnected, broadcastState } = useSync(sessionId, (newState) => {
    setCurrentSession(newState);
  });

  // Auto-sync Granola notes
  useAutoSyncGranola(currentSession, () => {
    // When an auto-sync completes, refresh the local state to show the new notes
    if (activeRepId) {
      const all = getSessionsForRep(activeRepId);
      const updated = all.find(s => s.id === sessionId);
      if (updated) {
        setCurrentSession(updated);
        setSessions(all);
        broadcastState(updated);
      }
    }
  });

  // ── Load sessions on mount ──
  // Admin sees all deals (or filtered by rep); reps see only their own
  const effectiveRepFilter = showRepFilter ? repFilter : activeRepId;
  useEffect(() => {
    const loaded = effectiveRepFilter
      ? getSessionsForRep(effectiveRepFilter)
      : getAllDiscoverySessions();
    setSessions(loaded);

    // Only auto-select a session if navigated to a specific company (/team/discovery/:companyId)
    // Otherwise, stay on the pipeline grid view (currentSession = null)
    if (companyId && loaded.length > 0) {
      const match = loaded.find((s) => s.company_id === companyId || s.id === companyId);
      setCurrentSession(match ?? null);
    } else {
      setCurrentSession(null);
    }
  }, [effectiveRepFilter, companyId]);

  // ── Hydrate room state when session changes ──
  useEffect(() => {
    if (!currentSession) {
      setSelectedPains([]);
      setSelectedPersona(null);
      setSelectedATS(null);
      return;
    }
    setSelectedPains(currentSession.selected_pains ?? []);
    setSelectedPersona(currentSession.persona ?? null);
    setSelectedATS(currentSession.current_ats ?? null);
    // Load persisted visibility from session, merged with defaults for new keys
    if ((currentSession as any).room_visibility) {
      setVisibility({ ...DEFAULT_VISIBILITY, ...(currentSession as any).room_visibility });
    } else {
      setVisibility({ ...DEFAULT_VISIBILITY });
    }
  }, [currentSession?.id]); // eslint-disable-line react-hooks/exhaustive-deps




  // ── Handlers ──

  const refreshSessions = useCallback(() => {
    const loaded = effectiveRepFilter ? getSessionsForRep(effectiveRepFilter) : getAllDiscoverySessions();
    setSessions(loaded);
  }, [effectiveRepFilter]);

  const selectSession = useCallback((session: DiscoverySession) => {
    setCurrentSession(session);
  }, []);

  const handleCreateSession = useCallback(() => {
    const name = newCompanyName.trim();
    if (!name || !activeRepId) return;
    const session = createDiscoverySession(activeRepId, name, null);
    setNewCompanyName('');
    refreshSessions();
    setCurrentSession(session);
  }, [newCompanyName, activeRepId, refreshSessions]);

  const handlePainChange = useCallback(
    (pains: string[]) => {
      setSelectedPains(pains);
      if (sessionId && currentSession) {
        updateSessionPains(sessionId, pains);
        const updated = { ...currentSession, selected_pains: pains };
        setCurrentSession(updated);
        broadcastState(updated);
        flashSave();
      }
    },
    [sessionId, currentSession, broadcastState, flashSave],
  );

  const handlePersonaChange = useCallback(
    (personaId: string) => {
      setSelectedPersona(personaId);
      if (sessionId && currentSession) {
        updateSessionPersona(sessionId, personaId);
        const updated = { ...currentSession, persona: personaId };
        setCurrentSession(updated);
        broadcastState(updated);
        flashSave();
      }
    },
    [sessionId, currentSession, broadcastState, flashSave],
  );

  const handleATSChange = useCallback(
    (ats: string) => {
      setSelectedATS(ats);
      if (sessionId && currentSession) {
        updateSessionATS(sessionId, ats);
        const updated = { ...currentSession, current_ats: ats };
        setCurrentSession(updated);
        broadcastState(updated);
        flashSave();
      }
    },
    [sessionId, currentSession, broadcastState, flashSave],
  );

  const handleIndustryChange = useCallback(
    (industry: string) => {
      if (sessionId && currentSession) {
        const val = industry === 'none' ? null : industry;
        updateSessionIndustry(sessionId, val);
        const updated = { ...currentSession, industry: val };
        setCurrentSession(updated);
        broadcastState(updated);
        flashSave();
      }
    },
    [sessionId, currentSession, broadcastState, flashSave],
  );

  const handleCompanySizeChange = useCallback(
    (size: string) => {
      if (sessionId && currentSession) {
        const val = size === 'none' ? null : size;
        updateSessionCompanySize(sessionId, val);
        const updated = { ...currentSession, company_size: val };
        setCurrentSession(updated);
        broadcastState(updated);
        flashSave();
      }
    },
    [sessionId, currentSession, broadcastState, flashSave],
  );

  const handleUseCaseChange = useCallback(
    (useCase: string) => {
      if (sessionId && currentSession) {
        const val = useCase === 'none' ? null : useCase;
        updateSessionUseCase(sessionId, val);
        const updated = { ...currentSession, use_case: val };
        setCurrentSession(updated);
        broadcastState(updated);
        flashSave();
      }
    },
    [sessionId, currentSession, broadcastState, flashSave],
  );

  const handleGenerateShareLink = useCallback(async () => {
    const config: RoomConfig = {
      sessionId: currentSession?.id,
      company: companyName,
      companyId: currentSession?.company_id ?? undefined,
      repName: activeRepId ? activeRepId.replace('rep-', '').split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ') : undefined,
      pains: selectedPains.length > 0 ? selectedPains : undefined,
      persona: selectedPersona || undefined,
      ats: selectedATS || undefined,
      accent: brand,
      showPricing: true,
    };
    const url = generateShareableUrl(config);
    setShareUrl(url);
    // Open readiness modal instead of immediately copying
    setShowReadinessModal(true);
  }, [companyName, currentSession, selectedPains, selectedPersona, selectedATS, brand, activeRepId]);

  const handleCopyShareLink = useCallback(async () => {
    if (!shareUrl) return;
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      toast('Prospect link copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 3000);
    }
  }, [shareUrl, toast]);

  const handleSmartCreate = useCallback((config: SmartRoomConfig) => {
    if (!activeRepId) return;
    const session = createDiscoverySession(activeRepId, config.companyName, null);
    // Apply smart defaults from the modal
    if (config.persona) updateSessionPersona(session.id, config.persona);
    if (config.currentATS) updateSessionATS(session.id, config.currentATS);
    if (config.industry) updateSessionIndustry(session.id, config.industry);
    if (config.companySize) updateSessionCompanySize(session.id, config.companySize);
    if (config.selectedPains.length > 0) updateSessionPains(session.id, config.selectedPains);
    // Refresh with enriched session
    const enriched = {
      ...session,
      persona: config.persona,
      current_ats: config.currentATS,
      industry: config.industry,
      company_size: config.companySize,
      selected_pains: config.selectedPains,
    };
    refreshSessions();
    setCurrentSession(enriched);
    toast(`Room created for ${config.companyName}`, 'success');
  }, [activeRepId, refreshSessions, toast]);



  // ── Show Pipeline Board when no session is active ──
  if (!currentSession) {
    return (
      <>
        <div className="h-full flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
          <header className="shrink-0 border-b border-stone-200/40 bg-white">
            <div className="mx-auto flex h-10 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-stone-800">Pipeline</span>
                {showRepFilter && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <Users size={12} className="text-stone-400" />
                    <select
                      value={repFilter ?? '__all__'}
                      onChange={e => setRepFilter(e.target.value === '__all__' ? null : e.target.value)}
                      className="rounded-lg border border-stone-200 bg-stone-50 py-1 px-2 text-xs font-medium text-stone-700 focus:outline-none focus:border-stone-400 cursor-pointer appearance-none"
                    >
                      <option value="__all__">Whole Team</option>
                      {REP_PROFILES.map(rep => (
                        <option key={rep.id} value={rep.id}>{rep.full_name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Kanban | Table toggle */}
                <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setPipelineView('kanban')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                      pipelineView === 'kanban' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <LayoutGrid size={11} />
                    Kanban
                  </button>
                  <button
                    onClick={() => setPipelineView('table')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                      pipelineView === 'table' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <List size={11} />
                    Table
                  </button>
                  <button
                    onClick={() => setPipelineView('calendar')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                      pipelineView === 'calendar' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <Calendar size={11} />
                    Calendar
                  </button>
                </div>
                {pipelineView === 'calendar' && (
                  <button
                    onClick={() => setShowGCalSettings(true)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                      gcal.isConnected
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <Calendar size={11} />
                    {gcal.isConnected ? 'Google Calendar ✓' : 'Connect Google Calendar'}
                  </button>
                )}
                <button
                  onClick={() => setShowSmartModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                >
                  <Plus size={13} />
                  New Opp
                </button>
              </div>
            </div>
          </header>
          {pipelineView === 'kanban' ? (
            <PipelineBoard
              sessions={sessions}
              repId={activeRepId || ''}
              onSelect={(s) => { selectSession(s); }}
              onStageChange={(sessionId, newStage) => {
                const s = sessions.find(x => x.id === sessionId);
                if (s) {
                  const updated = { ...s, deal_stage: newStage };
                  persistSession(updated);
                  refreshSessions();
                }
              }}
              onOverride={(sessionId, cpNum, reason) => {
                const s = sessions.find(x => x.id === sessionId);
                if (s) {
                  const updated = {
                    ...s,
                    call_sheet_checkpoints: { ...(s.call_sheet_checkpoints || {}), [`checkpoint${cpNum}`]: true },
                    call_sheet_checkpoint_reasons: { ...(s.call_sheet_checkpoint_reasons || {}), [`checkpoint${cpNum}`]: reason },
                  };
                  persistSession(updated);
                  refreshSessions();
                }
              }}
              onSessionUpdate={(updated) => {
                persistSession(updated);
                refreshSessions();
              }}
            />
          ) : pipelineView === 'table' ? (
            <PipelineTableView
              sessions={sessions}
              isAdmin={showRepFilter}
              onSelect={selectSession}
              onSessionUpdate={(updated) => {
                persistSession(updated);
                refreshSessions();
              }}
            />
          ) : pipelineView === 'calendar' ? (
            <PipelineCalendar
              sessions={sessions}
              onSelect={selectSession}
              googleCalendarEvents={gcal.events}
              onReschedule={(sessionId, milestoneKey, newDate) => {
                const session = sessions.find(s => s.id === sessionId);
                if (!session || !session.milestones) return;
                const ms = session.milestones as Record<string, any>;
                const current = ms[milestoneKey];
                if (!current) return;
                const updated = {
                  ...session,
                  milestones: {
                    ...session.milestones,
                    [milestoneKey]: {
                      ...current,
                      ...(current.scheduled_date
                        ? { scheduled_date: newDate + 'T00:00:00' }
                        : { date: newDate + 'T00:00:00' }),
                    },
                  },
                };
                persistSession(updated);
                refreshSessions();
              }}
              onLogMeeting={(sessionId, date, type) => {
                // Create a custom meeting on the session (addCustomMeeting handles metric sync)
                const meetingId = `cal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                const typeLabel = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
                addCustomMeeting(sessionId, {
                  id: meetingId,
                  title: typeLabel,
                  type: type as MeetingType,
                  date: date + 'T00:00:00',
                  attendees: [],
                });
                refreshSessions();
                toast({ title: 'Meeting logged', description: `${typeLabel} added to calendar`, variant: 'success' });
              }}
              onMarkHeld={(sessionId, milestoneKey, date) => {
                const session = sessions.find(s => s.id === sessionId);
                if (!session || !session.milestones) return;
                const ms = session.milestones as Record<string, any>;
                const current = ms[milestoneKey];
                if (!current) return;
                // Map milestone key to the 'held' equivalent
                const heldKey = milestoneKey === 'discovery_set' ? 'discovery_held' : milestoneKey;
                const updated = {
                  ...session,
                  milestones: {
                    ...session.milestones,
                    [heldKey]: { ...current, date: date + 'T00:00:00' },
                    // Clear the 'set' milestone if we're marking discovery as held
                    ...(milestoneKey === 'discovery_set' ? { discovery_set: { ...current, date: current.date } } : {}),
                  },
                };
                persistSession(updated);
                // Explicitly log the metric
                if (session.rep_id) {
                  logDealMetric(session.rep_id, heldKey, date);
                }
                refreshSessions();
                toast({ title: 'Marked as held', description: `${session.company_name} meeting marked as held`, variant: 'success' });
              }}
            />
          ) : null}
        </div>
        <GoogleCalendarSettingsDrawer
          isOpen={showGCalSettings}
          onClose={() => setShowGCalSettings(false)}
          isConnected={gcal.isConnected}
          isSyncing={gcal.isSyncing}
          lastSync={gcal.lastSync}
          eventCount={gcal.events.length}
          onConnect={() => startGCalAuth()}
          onSync={() => gcal.sync()}
          onDisconnect={async () => { await disconnectGCal(); clearGCalCache(); gcal.refreshConnection(); }}
          onRefreshConnection={() => gcal.refreshConnection()}
        />
        <SmartRoomModal
          open={showSmartModal}
          onClose={() => setShowSmartModal(false)}
          onCreate={handleSmartCreate}
        />
      </>
    );
  }

  // ── Main Render — WYSIWYG Layout ──

  return (
    <div className="h-full flex flex-col bg-stone-50 overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ─── Header ─── */}
      <header className="shrink-0 z-50 border-b border-stone-200/60 bg-stone-900">
        <div className="mx-auto flex h-11 items-center justify-between px-4 gap-3">
          {/* Left: Back + Logo + Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSession(null)}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="All Deals"
            >
              <ArrowLeft size={14} />
            </button>
            <img src="/lg.svg" alt="Teamtailor" className="h-4 w-auto object-contain brightness-0 invert hidden sm:block" />
            <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />
            {/* CMS / MEDDPICC / Analytics tabs */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setActiveTab('bap')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'bap'
                    ? 'bg-white text-stone-900'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                CMS
              </button>
              <button
                onClick={() => setActiveTab('meddpicc')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'meddpicc'
                    ? 'bg-white text-stone-900'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                MEDDPICC
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'analytics'
                    ? 'bg-white text-stone-900'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Eye size={10} />
                Analytics
              </button>
            </div>
          </div>

          {/* Center: Company Name */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate max-w-[250px]">{companyName}</span>
            <div
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: stage.color }}
            >
              {stage.short}
            </div>
          </div>

          {/* Right: Save + Sync + Share + New */}
          <div className="flex items-center gap-1.5">
            {/* Save indicator */}
            <AnimatePresence>
              {saveStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    saveStatus === 'saving' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {saveStatus === 'saving' ? 'Saving…' : '✓ Saved'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sync indicator */}
            <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-stone-600'}`} title={isConnected ? 'Live sync active' : 'Offline'} />

            {/* Share button */}
            <button
              onClick={handleGenerateShareLink}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:bg-white/20"
              title="Generate prospect link"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* New Room button — opens Smart Room Modal */}
            <button
              onClick={() => setShowSmartModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30 transition-colors"
              title="Create new opportunity"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>

        </div>
      </header>

      {/* ─── Room Readiness Modal ─── */}
      {currentSession && shareUrl && (
        <RoomReadinessModal
          open={showReadinessModal}
          onClose={() => setShowReadinessModal(false)}
          session={currentSession}
          shareUrl={shareUrl}
          onCopyLink={handleCopyShareLink}
        />
      )}

      {/* ─── Main Content: Rep Command Center ─── */}
      {currentSession && (
        <div className="flex flex-col flex-1 min-h-0">
          <CMSWorkspace
            session={currentSession}
            visibility={visibility}
            onVisibilityChange={handleVisibilityChange}
            onSessionChange={(updated) => {
              persistSession(updated);
              setCurrentSession(updated);
              broadcastState(updated);
              flashSave();
            }}
            selectedPains={selectedPains}
            onPainChange={handlePainChange}
            selectedPersona={selectedPersona}
            onPersonaChange={handlePersonaChange}
            selectedATS={selectedATS}
            onATSChange={handleATSChange}
            onIndustryChange={handleIndustryChange}
            onCompanySizeChange={handleCompanySizeChange}
            onUseCaseChange={handleUseCaseChange}
            companyName={companyName}
            themeColor={brand}
            broadcastState={broadcastState}
            flashSave={flashSave}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      )}

      {/* Smart Room Modal (available from navbar New button) */}
      <SmartRoomModal
        open={showSmartModal}
        onClose={() => setShowSmartModal(false)}
        onCreate={handleSmartCreate}
      />

    </div>
  );
}
