// ============================================================
// Process Championship — Gamified Leaderboard
// Points auto-calculated from the scoring engine. Zero manual entry.
// ============================================================
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Target, Zap, Crown, Award, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { REP_PROFILES } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { buildFullLeaderboard, buildMonthlyLeaderboard, type RepLeaderboard, type DealScore } from '../lib/leaderboard';

// ── Constants ──
const PODIUM_COLORS = ['#d6d3d1', '#e7e5e4', '#a8a29e'] as const;
const STAGE_COLORS: Record<string, string> = {
  d1: '#bae6fd', // sky-200
  d2: '#c4b5fd', // violet-300
  d3: '#d6d3d1', // stone-300
  d4: '#6ee7b7', // emerald-300
  closed: '#fecdd3', // rose-200
  activity: '#78716c', // stone
};

const repIds = REP_PROFILES.map(r => r.id);

// ── Helpers ──
function getRepProfile(repId: string) {
  return REP_PROFILES.find(r => r.id === repId);
}

function daysLeftInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

function daysLeftInQuarter(): number {
  const now = new Date();
  const qEnd = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 0);
  return Math.max(0, Math.ceil((qEnd.getTime() - now.getTime()) / 86_400_000));
}

function currentMonthLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function currentQuarterLabel(): string {
  const q = Math.ceil((new Date().getMonth() + 1) / 3);
  return `Q${q} ${new Date().getFullYear()}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Component ──
export default function Leaderboard() {
  const { effectiveUser } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'sprint' | 'championship'>('sprint');
  const [expandedRep, setExpandedRep] = useState<string | null>(null);

  const leaderboard = useMemo(() => {
    return view === 'sprint'
      ? buildMonthlyLeaderboard(repIds)
      : buildFullLeaderboard(repIds);
  }, [view]);

  const allBadges = useMemo(() => {
    const badgeMap: Record<string, { badge: typeof leaderboard[0]['badges'][0]; reps: string[] }> = {};
    leaderboard.forEach(rep => {
      rep.badges.forEach(b => {
        if (!badgeMap[b.id]) badgeMap[b.id] = { badge: b, reps: [] };
        if (b.earned) {
          badgeMap[b.id].badge = b; // Use earned version
          badgeMap[b.id].reps.push(rep.repId);
        }
      });
    });
    return Object.values(badgeMap);
  }, [leaderboard]);

  // Activity feed from all deal scores
  const activityFeed = useMemo(() => {
    const events: { repId: string; company: string; stage: string; points: number; maxStage: number; date: string }[] = [];
    leaderboard.forEach(rep => {
      rep.dealScores.forEach(deal => {
        if (deal.d1Points > 0) events.push({ repId: rep.repId, company: deal.companyName, stage: 'D1', points: deal.d1Points, maxStage: 20, date: deal.createdAt });
        if (deal.d2Points > 0) events.push({ repId: rep.repId, company: deal.companyName, stage: 'D2', points: deal.d2Points, maxStage: 20, date: deal.createdAt });
        if (deal.d3Points > 0) events.push({ repId: rep.repId, company: deal.companyName, stage: 'D3', points: deal.d3Points, maxStage: 15, date: deal.createdAt });
        if (deal.d4Points > 0) events.push({ repId: rep.repId, company: deal.companyName, stage: 'D4', points: deal.d4Points, maxStage: 20, date: deal.createdAt });
        if (deal.closedPoints > 0) events.push({ repId: rep.repId, company: deal.companyName, stage: 'Closed', points: deal.closedPoints, maxStage: 25, date: deal.createdAt });
      });
    });
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [leaderboard]);

  const isEmpty = leaderboard.every(r => r.dealsScored === 0 && r.totalActivityPoints === 0);

  // Find current user's score
  const currentUserScore = useMemo(() => {
    if (!effectiveUser) return null;
    return leaderboard.find(r => r.repId === effectiveUser.id) ?? null;
  }, [leaderboard, effectiveUser]);

  // ── Empty State ──
  if (isEmpty) {
    return (
      <div className="min-h-full bg-stone-50 text-stone-800 flex items-center justify-center relative">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white border border-stone-200/60 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-3">The Arena Awaits</h2>
          <p className="text-stone-500 mb-8">The race starts with your first Discovery Room session. Complete your first deal to earn points and climb the leaderboard.</p>
          <button onClick={() => navigate('/team/discovery')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 bg-stone-900 hover:bg-stone-800">
            <Target className="w-4 h-4" /> Start a Discovery Session
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-stone-50 text-stone-800 relative">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Per-user empty state: user has no scored deals yet */}
        {currentUserScore && currentUserScore.dealsScored === 0 && (
          <div className="mb-6 p-5 rounded-2xl border border-stone-200/60 bg-white text-center">
            <Trophy size={32} className="text-stone-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-700">Your score will appear here once you complete a Discovery Room session</p>
            <p className="text-xs text-stone-400 mt-1">Every BAP checkpoint you pass earns points. Perfect deal = 100 pts.</p>
            <button onClick={() => navigate('/team/discovery')} className="mt-3 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors">Launch First Session →</button>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            1. HERO BANNER
        ═══════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Trophy className="w-8 h-8 text-stone-700" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Process Championship</h1>
                <p className="text-stone-500 text-sm">
                  {view === 'sprint'
                    ? `${currentMonthLabel()} Sprint · ${daysLeftInMonth()} days left`
                    : `${currentQuarterLabel()} · Rolling 90 Days · ${daysLeftInQuarter()} days left`}
                </p>
              </div>
            </div>

            {/* Toggle */}
            <div className="flex rounded-xl bg-stone-100 border border-stone-200/60 p-1">
              <button
                onClick={() => setView('sprint')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  view === 'sprint' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />Monthly Sprint
              </button>
              <button
                onClick={() => setView('championship')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  view === 'championship' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Crown className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />90-Day Championship
              </button>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            2. PODIUM / STANDINGS
        ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {leaderboard.map((rep, rank) => {
            const profile = getRepProfile(rep.repId);
            if (!profile) return null;
            const isExpanded = expandedRep === rep.repId;
            const podiumColor = PODIUM_COLORS[rank] || '#78716c';
            const isFirst = rank === 0;

            return (
              <motion.div
                key={rep.repId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.1 }}
                className={`relative bg-white rounded-2xl border border-stone-200/60 transition-all cursor-pointer ${isFirst ? 'md:col-span-1' : ''} ${isExpanded ? 'ring-2 ring-stone-300' : ''}`}
                onClick={() => setExpandedRep(isExpanded ? null : rep.repId)}
              >
                {/* Rank badge */}
                <div
                  className="absolute -top-3 left-4 px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"
                  style={{ background: podiumColor, color: '#57534e' }}
                >
                  {rank === 0 && <Crown className="w-3 h-3" />}
                  #{rank + 1}
                </div>

                {/* Subtle glow for #1 */}
                {isFirst && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ boxShadow: `0 0 30px ${podiumColor}15` }}
                  />
                )}

                <div className="p-5 pt-6">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: profile.avatar_color }}
                    >
                      {profile.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-800 truncate">{profile.full_name}</p>
                      <p className="text-xs text-stone-400">{rep.dealsScored} deal{rep.dealsScored !== 1 ? 's' : ''} scored</p>
                    </div>
                    <div className="ml-auto text-stone-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Total Points */}
                  <div className="mb-4">
                    <motion.p
                      className="text-4xl font-black"
                      style={{ color: podiumColor }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {rep.totalPoints}
                    </motion.p>
                    <p className="text-xs text-stone-400 mt-0.5">total points</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-stone-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-stone-800">
                        {rep.avgPerDeal > 0 ? rep.avgPerDeal : '—'}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {rep.dealsScored < 3 ? 'Min 3 deals' : 'Avg/Deal'}
                      </p>
                    </div>
                    <div className="bg-stone-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-stone-800">{rep.perfectDeals}</p>
                      <p className="text-[10px] text-stone-400">
                        Perfect
                      </p>
                    </div>
                    <div className="bg-stone-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold" style={{ color: '#6ee7b7' }}>
                        <TrendingUp className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                        {rep.totalActivityPoints}
                      </p>
                      <p className="text-[10px] text-stone-400">Activity</p>
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex gap-1.5">
                    {rep.badges.map(badge => (
                      <span
                        key={badge.id}
                        className="text-sm"
                        title={`${badge.label}: ${badge.description}`}
                        style={{ opacity: badge.earned ? 1 : 0.25, filter: badge.earned ? 'none' : 'grayscale(1)' }}
                      >
                        {badge.emoji}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ─── Expanded Detail ─── */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-stone-200/60"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-5">
                        {/* Deal-by-Deal Breakdown */}
                        <h4 className="text-xs font-semibold text-stone-500 mb-3">Deal Breakdown</h4>
                        {rep.dealScores.length === 0 ? (
                          <p className="text-stone-400 text-sm">No scored deals yet</p>
                        ) : (
                          <div className="space-y-3">
                            {rep.dealScores.map(deal => (
                              <DealScoreCard key={deal.sessionId} deal={deal} />
                            ))}
                          </div>
                        )}

                        {/* Point Distribution Bar */}
                        <h4 className="text-xs font-semibold text-stone-500 mt-5 mb-3">Point Distribution</h4>
                        <PointDistributionBar rep={rep} />

                        {/* Activity Bonus List */}
                        {rep.weeklyBonuses.some(w => w.totalPoints > 0) && (
                          <>
                            <h4 className="text-xs font-semibold text-stone-500 mt-5 mb-3">Activity Bonuses</h4>
                            <div className="space-y-1.5">
                              {rep.weeklyBonuses.filter(w => w.totalPoints > 0).map((w, i) => (
                                <div key={i} className="flex items-center justify-between text-xs bg-stone-50 rounded-lg px-3 py-2">
                                  <span className="text-stone-500">Wk {new Date(w.weekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                  <div className="flex gap-2">
                                    {w.bonuses.map((b, j) => (
                                      <span key={j} className="text-stone-700">
                                        {b.label} <span className="text-stone-900 font-bold">+{b.points}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════
            4. BADGE SHOWCASE
        ═══════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-stone-800">
            <Award className="w-5 h-5 text-stone-600" /> Badge Showcase
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {allBadges.map(({ badge, reps }) => {
              const earned = reps.length > 0;
              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.03 }}
                  className={`relative bg-white rounded-xl border p-4 text-center transition-all ${
                    earned ? 'border-stone-300' : 'border-stone-200/60'
                  }`}
                >
                  <div className="text-3xl mb-2" style={{ filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.3 }}>
                    {earned ? badge.emoji : ''}
                  </div>
                  <p className={`text-xs font-bold mb-1 ${earned ? 'text-stone-800' : 'text-stone-400'}`}>{badge.label}</p>
                  <p className="text-[10px] text-stone-400 leading-tight">{badge.description}</p>
                  {earned && (
                    <div className="flex justify-center gap-1 mt-2">
                      {reps.map(rid => {
                        const rp = getRepProfile(rid);
                        return rp ? (
                          <div
                            key={rid}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                            style={{ background: rp.avatar_color }}
                            title={rp.full_name}
                          >
                            {rp.initials}
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            5. LIVE ACTIVITY FEED
        ═══════════════════════════════════════════ */}
        {activityFeed.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-stone-800">
              <Flame className="w-5 h-5" style={{ color: '#a8a29e' }} /> Live Activity
            </h2>
            <div className="bg-white rounded-xl border border-stone-200/60 divide-y divide-stone-100">
              {activityFeed.map((event, i) => {
                const rp = getRepProfile(event.repId);
                if (!rp) return null;
                return (
                  <motion.div
                    key={`${event.repId}-${event.company}-${event.stage}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: rp.avatar_color }}
                    >
                      {rp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-600 truncate">
                        <span className="font-semibold text-stone-800">{rp.initials}</span> scored{' '}
                        <span className="font-semibold text-stone-900">{event.points}/{event.maxStage}</span>{' '}
                        on <span className="font-medium text-stone-700">{event.stage}</span> for{' '}
                        <span className="text-stone-700">{event.company}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0">{timeAgo(event.date)}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

// ── Sub-components ──


const CP_CONFIG = [
  { cp: 1, label: 'CP1: Do They Need to Act?', questions: ['q1', 'q2', 'q3', 'q4'], maxScore: 10, color: '#a7f3d0' },
  { cp: 2, label: 'CP2: Do They Need Help?', questions: ['q5', 'q6', 'q7', 'q8'], maxScore: 10, color: '#bfdbfe' },
  { cp: 3, label: 'CP3: Are We the Best?', questions: ['q9', 'q10', 'q11'], maxScore: 7.5, color: '#c4b5fd' },
];

function DealScoreCard({ deal }: { deal: DealScore }) {
  const [expanded, setExpanded] = useState(false);

  // Group breakdown by checkpoint label
  const cp1Passed = deal.breakdown.find(b => b.label === 'Checkpoint 1 Passed')?.earned || false;
  const cp2Passed = deal.breakdown.find(b => b.label === 'Checkpoint 2 Passed')?.earned || false;
  const cp3Passed = deal.breakdown.find(b => b.label === 'Checkpoint 3 Passed')?.earned || false;
  const cpStatuses = [cp1Passed, cp2Passed, cp3Passed];

  const stageSegments = [
    { label: 'D1', pts: deal.d1Points, max: 20, color: STAGE_COLORS.d1 },
    { label: 'D2', pts: deal.d2Points, max: 20, color: STAGE_COLORS.d2 },
    { label: 'D3', pts: deal.d3Points, max: 15, color: STAGE_COLORS.d3 },
    { label: 'D4', pts: deal.d4Points, max: 20, color: STAGE_COLORS.d4 },
    { label: 'Won', pts: deal.closedPoints, max: 25, color: STAGE_COLORS.closed },
  ];

  return (
    <div
      className="rounded-xl border border-stone-200/60 bg-white overflow-hidden cursor-pointer transition-colors hover:border-stone-300"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-stone-800 text-sm truncate">{deal.companyName}</span>
            {deal.isPerfectDeal && <span title="Perfect Deal" className="w-2 h-2 rounded-full bg-stone-400 inline-block" />}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-black" style={{ color: deal.isPerfectDeal ? '#d6d3d1' : deal.totalPoints > 60 ? '#6ee7b7' : deal.totalPoints > 30 ? '#a8a29e' : '#78716c' }}>
              {deal.totalPoints}
            </span>
            <span className="text-[10px] text-stone-400 font-medium">/{deal.maxPossible}</span>
          </div>
        </div>

        {/* BAP Checkpoint badges — the 3-checkpoint backbone */}
        <div className="flex gap-2 mb-2.5">
          {CP_CONFIG.map((cp, i) => (
            <div
              key={cp.cp}
              className="flex-1 flex items-center gap-1.5 rounded-lg px-2 py-1.5"
              style={{
                background: cpStatuses[i] ? `${cp.color}12` : 'rgba(214,211,209,0.3)',
                border: `1px solid ${cpStatuses[i] ? `${cp.color}35` : 'rgba(214,211,209,0.4)'}`,
              }}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                style={{
                  background: cpStatuses[i] ? cp.color : 'rgba(214,211,209,0.5)',
                  color: cpStatuses[i] ? '#fff' : '#a8a29e',
                }}
              >
                {cpStatuses[i] ? '✓' : i + 1}
              </div>
              <span className="text-[9px] font-semibold truncate" style={{ color: cpStatuses[i] ? cp.color : '#a8a29e' }}>
                CP{cp.cp}
              </span>
            </div>
          ))}
        </div>

        {/* D1→D4 stage progress bar */}
        <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden">
          {stageSegments.map(seg => (
            <div
              key={seg.label}
              className="relative transition-all"
              style={{
                flex: seg.max,
                background: seg.pts > 0 ? seg.color : 'rgba(214,211,209,0.3)',
                opacity: seg.pts > 0 ? 1 : 0.3,
              }}
              title={`${seg.label}: ${seg.pts}/${seg.max}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {stageSegments.map(seg => (
            <span key={seg.label} className="text-[8px] font-bold" style={{ color: seg.pts > 0 ? seg.color : '#a8a29e', flex: seg.max, textAlign: 'center' }}>
              {seg.label}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded: criteria breakdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 border-t border-stone-200/60">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {deal.breakdown.map(item => (
                  <div key={item.label} className="flex items-center gap-1.5 py-0.5">
                    <span className="text-[10px]">{item.earned ? '●' : '○'}</span>
                    <span className={`text-[10px] ${item.earned ? 'text-stone-700' : 'text-stone-400'}`}>
                      {item.label}
                    </span>
                    <span className="ml-auto text-[9px] font-semibold" style={{ color: item.earned ? '#44403c' : '#a8a29e' }}>
                      {item.earned ? `+${item.points}` : '0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DealStageCell({ points, max, color }: { points: number; max: number; color: string }) {
  const earned = points > 0;
  return (
    <td className="py-2 px-1 text-center">
      <span
        className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold"
        style={{
          color: earned ? color : '#a8a29e',
          background: earned ? `${color}12` : 'transparent',
        }}
      >
        {points}/{max}
      </span>
    </td>
  );
}

function PointDistributionBar({ rep }: { rep: RepLeaderboard }) {
  const total = rep.totalPoints || 1;
  const segments = [
    { label: 'D1', points: rep.dealScores.reduce((s, d) => s + d.d1Points, 0), color: STAGE_COLORS.d1 },
    { label: 'D2', points: rep.dealScores.reduce((s, d) => s + d.d2Points, 0), color: STAGE_COLORS.d2 },
    { label: 'D3', points: rep.dealScores.reduce((s, d) => s + d.d3Points, 0), color: STAGE_COLORS.d3 },
    { label: 'D4', points: rep.dealScores.reduce((s, d) => s + d.d4Points, 0), color: STAGE_COLORS.d4 },
    { label: 'Won', points: rep.dealScores.reduce((s, d) => s + d.closedPoints, 0), color: STAGE_COLORS.closed },
    { label: 'Act', points: rep.totalActivityPoints, color: STAGE_COLORS.activity },
  ].filter(s => s.points > 0);

  return (
    <div>
      <div className="flex h-5 rounded-full overflow-hidden bg-stone-100">
        {segments.map(seg => (
          <motion.div
            key={seg.label}
            initial={{ width: 0 }}
            animate={{ width: `${(seg.points / total) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative group"
            style={{ background: seg.color }}
            title={`${seg.label}: ${seg.points} pts`}
          />
        ))}
      </div>
      <div className="flex gap-3 mt-2 flex-wrap">
        {segments.map(seg => (
          <span key={seg.label} className="flex items-center gap-1 text-[10px] text-stone-500">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: seg.color }} />
            {seg.label} {seg.points}
          </span>
        ))}
      </div>
    </div>
  );
}
