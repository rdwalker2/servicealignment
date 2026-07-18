// ============================================================
// Rep Performance Analytics — BAP checkpoint + question analysis
// ============================================================
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import {
  getAllDiscoverySessions,
  computeBAPAnswers,
  getCheckpointScore,
  BAP_QUESTIONS,
} from '../lib/discoveryDatabase';
import { useAuth, REP_PROFILES, REP_ID_TO_INITIALS } from '../contexts/AuthContext';
import { REP_SEED_DATA } from '../data/seedData';
import { LiveFunnelDashboard } from '../components/analytics/LiveFunnelDashboard';

// ── Helpers ──────────────────────────────────────────────────

function getBAPScore(session: ReturnType<typeof getAllDiscoverySessions>[number]): number {
  const answers = computeBAPAnswers(session);
  const c1 = getCheckpointScore(answers, 1);
  const c2 = getCheckpointScore(answers, 2);
  const c3 = getCheckpointScore(answers, 3);
  // max: CP1=10, CP2=10, CP3=7.5 → total 27.5
  const total = c1 + c2 + c3;
  return Math.round((total / 27.5) * 100);
}

function scoreColor(score: number): string {
  if (score >= 65) return 'text-emerald-600';
  if (score >= 35) return 'text-amber-600';
  return 'text-rose-600';
}

function scoreBg(score: number): string {
  if (score >= 65) return 'bg-emerald-500';
  if (score >= 35) return 'bg-amber-500';
  return 'bg-rose-500';
}

function scoreRingColor(score: number): string {
  if (score >= 65) return '#059669';
  if (score >= 35) return '#d97706';
  return '#e11d48';
}

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    discovery: 'Discovery',
    diagnosis: 'Diagnosis',
    demonstrate: 'Demonstrate',
    decision: 'Decision',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost',
  };
  return map[stage] ?? stage;
}

function stageBadgeClass(stage: string): string {
  if (stage === 'closed_won') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (stage === 'closed_lost') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (stage === 'signing') return 'bg-violet-50 text-violet-700 border-violet-200';
  if (stage === 'negotiating' || stage === 'contracting') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-stone-100 text-stone-500 border-stone-200';
}

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.35 } }),
};

// ── Radial Arc SVG ────────────────────────────────────────────

function ScoreArc({ score }: { score: number }) {
  const r = 52;
  const cx = 64;
  const cy = 64;
  const circumference = Math.PI * r; // half circle arc
  const progress = Math.min(score / 100, 1);
  const dashOffset = circumference * (1 - progress);
  const color = scoreRingColor(score);

  return (
    <svg width="128" height="80" viewBox="0 0 128 80" className="overflow-visible">
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#e7e5e4"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Progress */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function RepAnalytics() {
  const { user, effectiveUser, isManager } = useAuth();
  
  // Tab selection state
  const [activeTab, setActiveTab] = useState<'prospecting' | 'execution'>('prospecting');

  // Rep selection state (manager can switch; rep is fixed to self)
  const [selectedRepId, setSelectedRepId] = useState<string>(
    () => (isManager && !effectiveUser?.id?.startsWith('rep-')
      ? 'team_aggregate'
      : effectiveUser?.id ?? '')
  );

  const repProfile = useMemo(
    () => REP_PROFILES.find(r => r.id === selectedRepId) ?? null,
    [selectedRepId]
  );

  // All sessions for the selected rep (or all if team aggregate)
  const repSessions = useMemo(() => {
    const all = getAllDiscoverySessions();
    if (selectedRepId === 'team_aggregate') return all;
    return all.filter(s => s.rep_id === selectedRepId);
  }, [selectedRepId]);

  // Per-session BAP scores
  const sessionScores = useMemo(
    () => repSessions.map(s => ({ session: s, score: getBAPScore(s) })),
    [repSessions]
  );

  // ── Section 1: Distribution ───────────────────────────────
  const distribution = useMemo(() => {
    const healthy = sessionScores.filter(x => x.score >= 65).length;
    const atRisk = sessionScores.filter(x => x.score >= 35 && x.score < 65).length;
    const critical = sessionScores.filter(x => x.score < 35).length;
    const total = sessionScores.length;
    const avg = total > 0 ? Math.round(sessionScores.reduce((s, x) => s + x.score, 0) / total) : 0;
    return { healthy, atRisk, critical, total, avg };
  }, [sessionScores]);

  // ── Section 2: Checkpoint pass rates ─────────────────────
  // CP1 pass = score >= 7.5/10, CP2 pass = >= 7.5/10, CP3 pass = >= 5/7.5
  const checkpointData = useMemo(() => {
    const checkpoints = [
      { id: 1 as const, label: 'CP1 — Pain & Urgency', max: 10, passThreshold: 7 },
      { id: 2 as const, label: 'CP2 — Qualification', max: 10, passThreshold: 7 },
      { id: 3 as const, label: 'CP3 — Solution & Proof', max: 7.5, passThreshold: 5 },
    ];

    // Team averages (all reps)
    const allSessions = getAllDiscoverySessions();

    return checkpoints.map(cp => {
      // Rep pass rate
      const repPasses = repSessions.filter(s => {
        const answers = computeBAPAnswers(s);
        return getCheckpointScore(answers, cp.id) >= cp.passThreshold;
      }).length;
      const repPassRate = repSessions.length > 0 ? Math.round((repPasses / repSessions.length) * 100) : 0;

      // Team average pass rate across all reps
      const allPasses = allSessions.filter(s => {
        const answers = computeBAPAnswers(s);
        return getCheckpointScore(answers, cp.id) >= cp.passThreshold;
      }).length;
      const teamPassRate = allSessions.length > 0 ? Math.round((allPasses / allSessions.length) * 100) : 0;

      return { ...cp, repPassRate, teamPassRate, delta: repPassRate - teamPassRate };
    });
  }, [repSessions]);

  // ── Section 3: Question-level breakdown ───────────────────
  const questionData = useMemo(() => {
    const rows = BAP_QUESTIONS.map(q => {
      const answered = repSessions.filter(s => {
        const answers = computeBAPAnswers(s);
        return answers[q.id] === 'yes' || answers[q.id] === 'maybe';
      }).length;
      const rate = repSessions.length > 0 ? Math.round((answered / repSessions.length) * 100) : 0;
      return { q, answered, total: repSessions.length, rate };
    });

    // Mark 3 lowest as fix-this
    const sorted = [...rows].sort((a, b) => a.rate - b.rate);
    const fixIds = new Set(sorted.slice(0, 3).map(r => r.q.id));

    return rows.map(r => ({ ...r, fix: fixIds.has(r.q.id) }));
  }, [repSessions]);

  // ── Section 4: Last 10 deals ──────────────────────────────
  const recentDeals = useMemo(() => {
    return repSessions
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(s => {
        const score = getBAPScore(s);
        const days = daysSince(s.created_at);
        const status = s.blueprint_approved
          ? 'approved'
          : days > 14
          ? 'stale'
          : 'in_progress';
        return { session: s, score, days, status };
      });
  }, [repSessions]);

  // ── Team leaderboard ──────────────────────────────────────
  const teamLeaderboard = useMemo(() => {
    const allSessions = getAllDiscoverySessions();
    return REP_PROFILES.map(rep => {
      const sessions = allSessions.filter(s => s.rep_id === rep.id);
      const scores = sessions.map(getBAPScore);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { rep, avg, count: sessions.length };
    }).sort((a, b) => b.avg - a.avg);
  }, []);

  const repName = selectedRepId === 'team_aggregate' ? 'Team Aggregate' : (repProfile?.full_name ?? effectiveUser?.full_name ?? 'Rep');

  return (
    <div className="min-h-full bg-stone-50 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={SECTION_VARIANTS}
          className="flex items-start justify-between flex-wrap gap-4"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
                <BarChart2 size={17} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-stone-800 tracking-tight">Performance Analytics</h1>
            </div>
            <p className="text-sm text-stone-500 ml-10.5">
              {repName}
              {activeTab === 'execution' && ` · ${distribution.total} deals analyzed`}
            </p>
          </div>

          {/* Rep selector — managers only */}
          {isManager && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedRepId('team_aggregate')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedRepId === 'team_aggregate'
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200/60 text-stone-500 hover:border-stone-300 hover:text-stone-700'
                }`}
              >
                Team Aggregate
              </button>
              {REP_PROFILES.map(rep => (
                <button
                  key={rep.id}
                  onClick={() => setSelectedRepId(rep.id)}
                  title={rep.full_name}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    selectedRepId === rep.id
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200/60 text-stone-500 hover:border-stone-300 hover:text-stone-700'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                    style={{ backgroundColor: rep.avatar_color }}
                  >
                    {rep.initials}
                  </div>
                  {rep.full_name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Sub-Tabs ────────────────────────────────────────── */}
        <div className="flex items-center gap-6 border-b border-stone-200 mb-6">
          <button
            onClick={() => setActiveTab('prospecting')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'prospecting' ? 'text-[#FF2A7F]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Top of Funnel (Prospecting)
            {activeTab === 'prospecting' && (
              <motion.div layoutId="analyticTab" className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-[#FF2A7F]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('execution')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'execution' ? 'text-[#FF2A7F]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Pipeline Execution (BAP)
            {activeTab === 'execution' && (
              <motion.div layoutId="analyticTab" className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-[#FF2A7F]" />
            )}
          </button>
        </div>

        {/* ── Main grid ──────────────────────────────────────── */}
        <div className={`grid gap-6 ${isManager ? 'grid-cols-1 xl:grid-cols-[1fr_260px]' : 'grid-cols-1'}`}>
          <div className="space-y-6">

            {activeTab === 'execution' && (
              <>
                {/* ─ Section 1: BAP Score Distribution ─ */}
                <motion.section
                  custom={1}
                  initial="hidden"
                  animate="visible"
                  variants={SECTION_VARIANTS}
                >
                  <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                    BAP Score Distribution
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
                    {/* Healthy */}
                    <div className="bg-white border border-stone-200/60 shadow-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Healthy</span>
                      </div>
                      <div className="text-3xl font-bold text-stone-800">{distribution.healthy}</div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {distribution.total > 0
                          ? Math.round((distribution.healthy / distribution.total) * 100)
                          : 0}% of deals · score ≥65%
                      </div>
                    </div>

                    {/* At Risk */}
                    <div className="bg-white border border-stone-200/60 shadow-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-amber-600" />
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">At Risk</span>
                      </div>
                      <div className="text-3xl font-bold text-stone-800">{distribution.atRisk}</div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {distribution.total > 0
                          ? Math.round((distribution.atRisk / distribution.total) * 100)
                          : 0}% of deals · 35–64%
                      </div>
                    </div>

                    {/* Critical */}
                    <div className="bg-white border border-stone-200/60 shadow-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-rose-600" />
                        <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Critical</span>
                      </div>
                      <div className="text-3xl font-bold text-stone-800">{distribution.critical}</div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {distribution.total > 0
                          ? Math.round((distribution.critical / distribution.total) * 100)
                          : 0}% of deals · &lt;35%
                      </div>
                    </div>

                    {/* Average BAP arc */}
                    <div className="bg-white border border-stone-200/60 shadow-sm rounded-xl p-4 flex flex-col items-center justify-center min-w-[140px]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Avg BAP Score</p>
                      <div className="relative flex items-end justify-center">
                        <ScoreArc score={distribution.avg} />
                        <div className="absolute bottom-1 text-center">
                          <span className={`text-2xl font-bold ${scoreColor(distribution.avg)}`}>
                            {distribution.avg}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* ─ Section 2: Checkpoint Pass Rates ─ */}
                <motion.section
                  custom={2}
                  initial="hidden"
                  animate="visible"
                  variants={SECTION_VARIANTS}
                  className="bg-white border border-stone-200/60 shadow-sm rounded-xl p-5"
                >
                  <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                    Checkpoint Pass Rates
                  </h2>
                  <div className="space-y-4">
                    {checkpointData.map(cp => {
                      const barColor =
                        cp.repPassRate >= 70 ? 'bg-emerald-500' :
                        cp.repPassRate >= 40 ? 'bg-amber-500' :
                        'bg-rose-500';

                      return (
                        <div key={cp.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-stone-800">{cp.label}</span>
                            <div className="flex items-center gap-3">
                              {/* Delta vs team */}
                              <span className={`text-xs font-medium flex items-center gap-0.5 ${
                                cp.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {cp.delta >= 0
                                  ? <TrendingUp size={12} />
                                  : <TrendingDown size={12} />}
                                {cp.delta >= 0 ? '+' : ''}{cp.delta}% vs team
                              </span>
                              <span className={`text-sm font-bold ${
                                cp.repPassRate >= 70 ? 'text-emerald-600' :
                                cp.repPassRate >= 40 ? 'text-amber-600' : 'text-rose-600'
                              }`}>
                                {cp.repPassRate}%
                              </span>
                            </div>
                          </div>
                          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                              style={{ width: `${cp.repPassRate}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-stone-400">
                              Pass threshold: ≥{cp.passThreshold}/{cp.max} pts
                            </span>
                            <span className="text-[10px] text-stone-400">
                              Team avg: {cp.teamPassRate}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>

                {/* ─ Section 3: Question-Level Breakdown ─ */}
                <motion.section
                  custom={3}
                  initial="hidden"
                  animate="visible"
                  variants={SECTION_VARIANTS}
                  className="bg-white border border-stone-200/60 shadow-sm rounded-xl p-5"
                >
                  <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                    Question-Level Breakdown
                  </h2>

                  {/* Checkpoint group headers */}
                  {([1, 2, 3] as const).map(cp => {
                    const cpLabel = cp === 1 ? 'CP1 — Urgency Test' : cp === 2 ? 'CP2 — Gap Test' : 'CP3 — Solution Fit';
                    const cpQuestions = questionData.filter(r => r.q.checkpoint === cp);

                    return (
                      <div key={cp} className="mb-5 last:mb-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2.5">
                          {cpLabel}
                        </p>
                        <div className="space-y-3">
                          {cpQuestions.map((row, i) => {
                            const globalIdx = BAP_QUESTIONS.findIndex(q => q.id === row.q.id) + 1;
                            const barColor =
                              row.rate >= 70 ? 'bg-emerald-500' :
                              row.rate >= 40 ? 'bg-amber-500' :
                              'bg-rose-500';

                            return (
                              <div key={row.q.id} className="group">
                                <div className="flex items-center gap-3">
                                  {/* Q number */}
                                  <span className="text-[11px] font-mono text-stone-400 w-5 shrink-0">
                                    Q{globalIdx}
                                  </span>
                                  {/* Title */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-stone-800 truncate">
                                        {row.q.title}
                                      </span>
                                      {row.fix && (
                                        <span className="shrink-0 text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-full px-1.5 py-0.5 uppercase tracking-wide">
                                          Fix This
                                        </span>
                                      )}
                                    </div>
                                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                        style={{ width: `${row.rate}%` }}
                                      />
                                    </div>
                                  </div>
                                  {/* Stats */}
                                  <div className="text-right shrink-0 w-20">
                                    <div className={`text-xs font-bold ${
                                      row.rate >= 70 ? 'text-emerald-600' :
                                      row.rate >= 40 ? 'text-amber-600' : 'text-rose-600'
                                    }`}>
                                      {row.rate}%
                                    </div>
                                    <div className="text-[10px] text-stone-400">
                                      {row.answered}/{row.total}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </motion.section>

                {/* ─ Section 4: Deal Timeline ─ */}
                <motion.section
                  custom={4}
                  initial="hidden"
                  animate="visible"
                  variants={SECTION_VARIANTS}
                  className="bg-white border border-stone-200/60 shadow-sm rounded-xl p-5"
                >
                  <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                    Deal Timeline · Last 10 Deals
                  </h2>

                  {recentDeals.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 text-sm">
                      No deals found for this rep.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentDeals.map(({ session, score, days, status }) => (
                        <div
                          key={session.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors"
                        >
                          {/* Company */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-stone-800 truncate">
                              {session.company_name || 'Unnamed Deal'}
                            </div>
                            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                              <Clock size={10} />
                              {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                              <span className="text-stone-300">·</span>
                              {days}d in pipeline
                            </div>
                          </div>

                          {/* Stage badge */}
                          <span className={`text-[10px] font-semibold border rounded-md px-2 py-0.5 shrink-0 ${stageBadgeClass(session.deal_stage)}`}>
                            {stageLabel(session.deal_stage)}
                          </span>

                          {/* BAP score */}
                          <div className={`text-sm font-bold w-10 text-right shrink-0 ${scoreColor(score)}`}>
                            {score}%
                          </div>

                          {/* Status pill */}
                          {status === 'approved' && (
                            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 shrink-0 uppercase tracking-wide">
                              Blueprint ✓
                            </span>
                          )}
                          {status === 'stale' && (
                            <span className="text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-full px-2 py-0.5 shrink-0 uppercase tracking-wide">
                              Stale
                            </span>
                          )}
                          {status === 'in_progress' && (
                            <span className="text-[9px] font-bold bg-stone-100 text-stone-500 border border-stone-200 rounded-full px-2 py-0.5 shrink-0 uppercase tracking-wide">
                              In Progress
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.section>
              </>
            )}

            {activeTab === 'prospecting' && (
              /* ─ Section 1.5: Live Funnel Dashboard ─ */
              <motion.section
                custom={1.5}
                initial="hidden"
                animate="visible"
                variants={SECTION_VARIANTS}
              >
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 mt-2">
                  Live Prospecting Funnel
                </h2>
                <LiveFunnelDashboard repId={selectedRepId} isTeam={selectedRepId === 'team_aggregate'} />
              </motion.section>
            )}
          </div>

          {/* ── Right sidebar: Team Benchmark (manager only) ── */}
          {isManager && (
            <motion.aside
              custom={2}
              initial="hidden"
              animate="visible"
              variants={SECTION_VARIANTS}
              className="space-y-4"
            >
              <div className="bg-white border border-stone-200/60 shadow-sm rounded-xl p-5 sticky top-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                  Team Leaderboard
                </h2>
                <div className="space-y-3">
                  {teamLeaderboard.map((entry, rank) => (
                    <div
                      key={entry.rep.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer ${
                        entry.rep.id === selectedRepId
                          ? 'bg-stone-900 border border-stone-900'
                          : 'hover:bg-stone-50 border border-transparent'
                      }`}
                      onClick={() => setSelectedRepId(entry.rep.id)}
                    >
                      {/* Rank */}
                      <span className={`text-xs font-bold w-4 shrink-0 ${
                        entry.rep.id === selectedRepId ? 'text-stone-400' : 'text-stone-400'
                      }`}>
                        {rank + 1}
                      </span>
                      {/* Avatar */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                        style={{ backgroundColor: entry.rep.avatar_color }}
                      >
                        {entry.rep.initials}
                      </div>
                      {/* Name + deals */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-semibold truncate ${
                          entry.rep.id === selectedRepId ? 'text-white' : 'text-stone-800'
                        }`}>
                          {entry.rep.full_name}
                        </div>
                        <div className={`text-[10px] ${
                          entry.rep.id === selectedRepId ? 'text-stone-400' : 'text-stone-500'
                        }`}>
                          {entry.count} deal{entry.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {/* Avg BAP score */}
                      <div className="text-right shrink-0">
                        <div className={`text-sm font-bold ${
                          entry.rep.id === selectedRepId ? 'text-white' : scoreColor(entry.avg)
                        }`}>
                          {entry.avg}%
                        </div>
                        {/* Mini bar */}
                        <div className={`w-16 h-1 rounded-full overflow-hidden mt-0.5 ${
                          entry.rep.id === selectedRepId ? 'bg-stone-700' : 'bg-stone-100'
                        }`}>
                          <div
                            className={`h-full rounded-full ${scoreBg(entry.avg)}`}
                            style={{ width: `${entry.avg}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {teamLeaderboard.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-4">No rep data yet.</p>
                )}
              </div>
            </motion.aside>
          )}
        </div>
      </div>
    </div>
  );
}
