// ============================================================
// Manager Dashboard — Team overview, funnel charts, goal editor
// ============================================================
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Target, ChevronDown, ChevronUp, Save, Sparkles, Check, Search, AlertCircle, AlertTriangle, PartyPopper, ArrowRight, Brain, TrendingDown } from 'lucide-react';
import { useAuth, REP_PROFILES } from '../contexts/AuthContext';
import { getMonthlyGoal, getWeeklyActualsForMonth, sumWeeklyActuals, getHistoricalData, setMonthlyGoal } from '../lib/database';
import { getPaceStatus, getPaceColor, getPaceLabel, fmtCurrency, fmtNum, avgMetricRows } from '../lib/calculations';
import { METRIC_LABELS, EMPTY_METRIC_ROW, ALL_METRICS, type MetricKey } from '../types';
import { getAllDiscoverySessions, type DiscoverySession } from '../lib/discoveryDatabase';
import { buildCoachingProfiles, type RepCoachingProfile } from '../lib/coachingIntelligence';
import { useNavigate } from 'react-router-dom';
import ConversionAnalysis from '../components/planning/ConversionAnalysis';
import FatalityTally from '../components/planning/FatalityTally';
import { GranolaAdminView } from '../components/discovery/GranolaAdminView';
import { FileText } from 'lucide-react';

const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const pctThrough = now.getDate() / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

// ---- Time Period Toggle ----
function TimePeriodToggle({
  period,
  setPeriod,
}: {
  period: 'week' | 'month' | 'quarter';
  setPeriod: (p: 'week' | 'month' | 'quarter') => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-stone-100 border border-stone-200/60 rounded-lg p-1">
      {(['week', 'month', 'quarter'] as const).map(p => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            period === p ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Quarter'}
        </button>
      ))}
    </div>
  );
}

// ---- Attention Item Type ----
interface AttentionItem {
  id: string;
  level: 'red' | 'amber' | 'green';
  icon: React.ReactNode;
  title: string;
  action: string;
  cta?: string;
  onAction?: () => void;
}

// ---- Coaching Intelligence Tab ----
function CoachingIntelligenceTab({ onStartImpersonation }: { onStartImpersonation: (repId: string) => void }) {
  const navigate = useNavigate();
  const profiles = useMemo(() => buildCoachingProfiles(), []);
  const highPriorityCount = profiles.filter(p => p.coachingPriority === 'high').length;

  const getBAPScoreColor = (score: number) => {
    if (score >= 65) return 'text-emerald-600';
    if (score >= 35) return 'text-stone-500';
    return 'text-rose-400';
  };

  const getPassRateColor = (rate: number) => {
    if (rate >= 0.65) return 'bg-emerald-400';
    if (rate >= 0.35) return 'bg-stone-400';
    return 'bg-rose-400';
  };

  const getPriorityBadge = (priority: RepCoachingProfile['coachingPriority']) => {
    if (priority === 'high') return 'bg-rose-50/50 text-rose-400 border border-rose-200/60';
    if (priority === 'medium') return 'bg-stone-50 text-stone-500 border border-stone-200';
    return 'bg-emerald-50/50 text-emerald-600 border border-emerald-200/60';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <Brain size={20} className="text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-800">Team Coaching Intelligence</h2>
          <p className="text-sm text-stone-400">Powered by BAP data across all active deals</p>
        </div>
      </div>

      {/* Priority Alert Banner */}
      {highPriorityCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-red-700">
            {highPriorityCount} rep{highPriorityCount !== 1 ? 's' : ''} need{highPriorityCount === 1 ? 's' : ''} immediate coaching attention
          </p>
        </motion.div>
      )}

      {/* Rep Cards Grid */}
      {profiles.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <TrendingDown size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-1 text-stone-500">No coaching data yet</p>
          <p className="text-sm">Rep deals will appear here once discovery sessions are created.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {profiles.map((profile, i) => (
            <motion.div
              key={profile.repId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-stone-200/60 rounded-2xl p-5"
            >
              {/* Header Row */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: profile.repColor }}
                >
                  {profile.repInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-stone-800">{profile.repName}</div>
                  <div className="text-xs text-stone-400">{profile.repInitials} · {profile.totalDeals} deal{profile.totalDeals !== 1 ? 's' : ''}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getPriorityBadge(profile.coachingPriority)}`}>
                  {profile.coachingPriority.toUpperCase()}
                </span>
                <div className="text-right ml-2">
                  <div className={`text-2xl font-bold tabular-nums ${getBAPScoreColor(profile.avgBAPScore)}`}>
                    {profile.avgBAPScore}
                  </div>
                  <div className="text-[10px] text-stone-400">BAP Score</div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Healthy', val: profile.healthyDeals, color: 'text-emerald-600', dotColor: 'bg-emerald-400' },
                  { label: 'At Risk', val: profile.atRiskDeals, color: 'text-stone-500', dotColor: 'bg-stone-400' },
                  { label: 'Critical', val: profile.criticalDeals, color: 'text-rose-400', dotColor: 'bg-rose-400' },
                ].map(stat => (
                  <div key={stat.label} className="bg-stone-50 rounded-xl p-2.5 text-center border border-stone-200/60">
                    <div className="flex justify-center mb-0.5"><span className={`w-1.5 h-1.5 rounded-full ${stat.dotColor}`}></span></div>
                    <div className={`text-lg font-bold tabular-nums ${stat.color}`}>{stat.val}</div>
                    <div className="text-[10px] text-stone-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Checkpoint Pass Rates */}
              <div className="space-y-2.5 mb-4">
                {[
                  { label: 'CP1 — Pain & Urgency', rate: profile.checkpointPassRates.cp1 },
                  { label: 'CP2 — Qualification', rate: profile.checkpointPassRates.cp2 },
                  { label: 'CP3 — Solution & Proof', rate: profile.checkpointPassRates.cp3 },
                ].map(cp => (
                  <div key={cp.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-500">{cp.label}</span>
                      <span className="text-stone-800 font-medium tabular-nums">{Math.round(cp.rate * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(cp.rate * 100)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08 + 0.2 }}
                        className={`h-full rounded-full ${getPassRateColor(cp.rate)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Gap Callout */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 mb-4">
                <p className="text-xs text-stone-600">
                  <span className="font-bold">Biggest Gap: </span>
                  {profile.topGap}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium ${profile.staleDealCount > 0 ? 'text-rose-400' : 'text-stone-400'}`}>
                  {profile.staleDealCount} stale deal{profile.staleDealCount !== 1 ? 's' : ''}
                </span>
                <span className="text-xs font-medium text-emerald-600">
                  {profile.recentWins} blueprint approval{profile.recentWins !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => {
                    onStartImpersonation(profile.repId);
                    navigate('/team/dashboard');
                  }}
                  className="ml-auto flex items-center gap-1 text-xs font-semibold text-stone-900 hover:text-stone-600 transition-colors"
                >
                  Start 1:1 <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ManagerDashboard() {
  const { user, startImpersonation } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'coaching' | 'funnel' | 'granola'>('overview');
  const [goalOpen, setGoalOpen] = useState(false);
  const goalMonthOptions = useMemo(() => {
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const nextQFirstMonth = currentQuarter * 3;
    const gYear = nextQFirstMonth >= 12 ? now.getFullYear() + 1 : now.getFullYear();
    const fMonth = nextQFirstMonth % 12;
    return [0, 1, 2].map(i => {
      const d = new Date(gYear, fMonth + i, 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`,
        label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
    });
  }, []);
  const [goalMonth, setGoalMonth] = useState(goalMonthOptions[0].key);
  const [goalRep, setGoalRep] = useState(REP_PROFILES[0]?.id || '');
  const [goalValues, setGoalValues] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  // Real Discovery Sessions
  const allSessions = useMemo(() => getAllDiscoverySessions(), []);

  // Rep data
  const repData = useMemo(() => {
    return REP_PROFILES.map(rep => {
      const goal = getMonthlyGoal(rep.id, currentMonth);
      const actuals = getWeeklyActualsForMonth(rep.id, now.getFullYear(), now.getMonth());
      const actual = sumWeeklyActuals(actuals);
      
      // Compute real discovery stats for this rep
      const repSessions = allSessions.filter(s => s.rep_id === rep.id);
      const activeRooms = repSessions.filter(s => s.deal_stage !== 'closed_won' && s.deal_stage !== 'closed_lost').length;
      const approvedRooms = repSessions.filter(s => s.deal_stage === 'decision' || s.deal_stage === 'closed_won').length;
      
      // Stalled deals (>7 days since creation, not closed)
      const stalledDeals = repSessions.filter(s => {
        if (s.deal_stage === 'closed_won' || s.deal_stage === 'closed_lost') return false;
        const daysSince = Math.floor((Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince > 7;
      });

      const goalRow = goal || EMPTY_METRIC_ROW;
      const revPct = goalRow.revenue > 0 ? actual.revenue / goalRow.revenue : 0;
      const pace = getPaceStatus(revPct, pctThrough);
      
      // Conversion bottlenecks
      let insight = null;
      if (actual.dials > 10) {
        const connRate = actual.dials > 0 ? actual.connects / actual.dials : 0;
        const meetRate = actual.connects > 0 ? actual.discovery_set / actual.connects : 0;
        const discConvRate = actual.discovery_held > 0 ? actual.demo_held / actual.discovery_held : 0;
        
        if (connRate < 0.05) {
          insight = { level: 'red' as const, title: 'Critically low connection rate', text: `Only ${(connRate * 100).toFixed(1)}% of dials connecting. Data/list quality is severely lacking.` };
        } else if (meetRate < 0.15 && actual.connects >= 5) {
          insight = { level: 'amber' as const, title: 'Meeting set rate is bottlenecking', text: `Only ${(meetRate * 100).toFixed(1)}% of connects yield meetings. Pitch execution needs coaching.` };
        } else if (discConvRate < 0.50 && actual.discovery_held >= 3) {
          insight = { level: 'amber' as const, title: 'Discovery conversion is leaking pipeline', text: `Only ${(discConvRate * 100).toFixed(1)}% of discoveries convert to demo. Qualification is weak.` };
        } else if (meetRate >= 0.25 && actual.connects >= 5) {
          insight = { level: 'green' as const, title: 'Elite meeting conversion', text: `Converting ${(meetRate * 100).toFixed(1)}% of connects to meetings. Have them share their cold call opener.` };
        }
      }

      return { rep, goal: goalRow, actual, revPct, pace, activeRooms, approvedRooms, stalledDeals, repSessions, insight };
    });
  }, [allSessions]);

  // Team Attention Items
  const attentionItems = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];

    // Red alerts: reps below 60% quota attainment
    repData.forEach(rd => {
      if (rd.revPct < 0.6 && rd.goal.revenue > 0) {
        const stalledCount = rd.stalledDeals.length;
        const suffix = stalledCount > 0 ? `, ${stalledCount} deal${stalledCount > 1 ? 's' : ''} stalled > 7 days` : '';
        items.push({
          id: `red-${rd.rep.id}`,
          level: 'red',
          icon: <AlertCircle size={14} className="text-red-500" />,
          title: `${rd.rep.full_name} — ${Math.round(rd.revPct * 100)}% to quota${suffix}`,
          action: 'Review pipeline and coach on activity',
          cta: 'View Scorecard',
          onAction: () => {
            startImpersonation(rd.rep.id);
            navigate('/team');
          },
        });
      }
    });

    // Amber alerts: team pipeline coverage below 3x
    const totalRevGoal = repData.reduce((sum, rd) => sum + rd.goal.revenue, 0);
    const totalPipeline = allSessions
      .filter(s => s.deal_stage !== 'closed_won' && s.deal_stage !== 'closed_lost')
      .reduce((sum, s) => sum + (s.deal_value || 0), 0);
    const teamCoverage = totalRevGoal > 0 ? totalPipeline / totalRevGoal : 0;
    if (teamCoverage < 3 && totalRevGoal > 0) {
      items.push({
        id: 'team-pipeline',
        level: 'amber',
        icon: <AlertTriangle size={14} className="text-amber-500" />,
        title: `Team pipeline coverage: ${teamCoverage.toFixed(1)}x (target: 3x)`,
        action: 'Push reps to add more top-of-funnel activity',
      });
    }

    // Amber: reps with stalled deals (if not already red)
    repData.forEach(rd => {
      if (rd.revPct >= 0.6 && rd.stalledDeals.length > 0) {
        items.push({
          id: `amber-stalled-${rd.rep.id}`,
          level: 'amber',
          icon: <AlertTriangle size={14} className="text-amber-500" />,
          title: `${rd.rep.full_name} — ${rd.stalledDeals.length} deal${rd.stalledDeals.length > 1 ? 's' : ''} stalled > 7 days`,
          action: 'Check in on deal progress',
          cta: 'View Scorecard',
          onAction: () => {
            startImpersonation(rd.rep.id);
            navigate('/team');
          },
        });
      }
    });

    // Conversion Bottlenecks (from insight)
    repData.forEach(rd => {
      if (rd.insight) {
        items.push({
          id: `insight-${rd.rep.id}`,
          level: rd.insight.level,
          icon: rd.insight.level === 'green' ? <Sparkles size={14} className="text-emerald-500" /> : <TrendingDown size={14} className={rd.insight.level === 'red' ? "text-red-500" : "text-amber-500"} />,
          title: `${rd.rep.full_name} — ${rd.insight.title}`,
          action: rd.insight.text,
          cta: 'View Scorecard',
          onAction: () => {
            startImpersonation(rd.rep.id);
            navigate('/team');
          },
        });
      }
    });

    // Green: recent wins (closed_won > 0)
    repData.forEach(rd => {
      if (rd.actual.closed_won > 0) {
        items.push({
          id: `green-${rd.rep.id}`,
          level: 'green',
          icon: <PartyPopper size={14} className="text-emerald-600" />,
          title: `${rd.rep.full_name} — ${rd.actual.closed_won} deal${rd.actual.closed_won > 1 ? 's' : ''} closed this month (${fmtCurrency(rd.actual.revenue)})`,
          action: 'Celebrate the win and share learnings with the team',
        });
      }
    });

    return items.slice(0, 5);
  }, [repData, allSessions, startImpersonation, navigate]);

  // Funnel chart data
  const activityData = useMemo(() => {
    const stages: { key: MetricKey; label: string }[] = [
      { key: 'dials', label: 'Dials' },
      { key: 'connects', label: 'Connects' },
      { key: 'conversations', label: 'Convos' },
      { key: 'emails_sent', label: 'Emails' },
    ];
    return stages.map(s => {
      const row: Record<string, string | number> = { stage: s.label };
      repData.forEach(rd => {
        row[rd.rep.initials] = (rd.actual as any)[s.key] || 0;
      });
      return row;
    });
  }, [repData]);

  const pipelineData = useMemo(() => {
    const stages: { key: MetricKey; label: string }[] = [
      { key: 'discovery_set', label: 'Disc Set' },
      { key: 'discovery_held', label: 'Disc Held' },
      { key: 'demo_held', label: 'Demo Held' },
      { key: 'proposal_sent', label: 'Proposal' },
      { key: 'closed_won', label: 'Won' },
    ];
    return stages.map(s => {
      const row: Record<string, string | number> = { stage: s.label };
      repData.forEach(rd => {
        row[rd.rep.initials] = (rd.actual as any)[s.key] || 0;
      });
      return row;
    });
  }, [repData]);

  // Goal editor
  const handleAutoFill = () => {
    const history = getHistoricalData(goalRep);
    if (!history.length) return;
    const avg = avgMetricRows(history);
    const vals: Record<string, number> = {};
    ALL_METRICS.forEach(k => { vals[k] = (avg as any)[k] || 0; });
    setGoalValues(vals);
  };

  const handleSaveGoal = () => {
    setMonthlyGoal({
      rep_id: goalRep,
      month: goalMonth,
      created_by: user?.id || '',
      dials: goalValues.dials || 0,
      connects: goalValues.connects || 0,
      conversations: goalValues.conversations || 0,
      emails_sent: goalValues.emails_sent || 0,
      email_conversations: goalValues.email_conversations || 0,
      linkedin_conversations: goalValues.linkedin_conversations || 0,
      linkedin_touches: goalValues.linkedin_touches || 0,
      discovery_set: goalValues.discovery_set || 0,
      discovery_held: goalValues.discovery_held || 0,
      demo_held: goalValues.demo_held || 0,
      proposal_sent: goalValues.proposal_sent || 0,
      closed_won: goalValues.closed_won || 0,
      revenue: goalValues.revenue || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Load existing goal when rep/month changes
  const loadGoalForEditor = (repId: string, month: string) => {
    const existing = getMonthlyGoal(repId, month);
    if (existing) {
      const vals: Record<string, number> = {};
      ALL_METRICS.forEach(k => { vals[k] = (existing as any)[k] || 0; });
      setGoalValues(vals);
    } else {
      setGoalValues({});
    }
  };

  const getPeriodLabel = () => {
    if (period === 'week') return 'This Week';
    if (period === 'month') return monthName;
    const q = Math.ceil((now.getMonth() + 1) / 3);
    return `Q${q} ${now.getFullYear()}`;
  };

  return (
    <div className="min-h-full bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Home</h1>
            <p className="text-stone-500 mt-1">{getPeriodLabel()} · {Math.round(pctThrough * 100)}% through month</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'overview' && (
              <TimePeriodToggle period={period} setPeriod={setPeriod} />
            )}
          </div>
        </motion.div>

        {/* ---- Tab Bar ---- */}
        <div className="flex items-center gap-1 bg-white border border-stone-200/60 rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Target size={15} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('coaching')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'coaching'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Brain size={15} />
            Coaching Intelligence
          </button>
          <button
            onClick={() => setActiveTab('funnel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'funnel'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Target size={15} />
            Funnel
          </button>
          <button
            onClick={() => setActiveTab('granola')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'granola'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText size={15} />
            Granola Admin
          </button>
        </div>

        {/* ---- Tab Content ---- */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {/* ---- Team Attention Banner ---- */}
              {attentionItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.5 }}
                  className="rounded-2xl border border-stone-200/60 bg-white p-5 mb-8"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle size={16} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-stone-800">Attention Needed</h3>
                  </div>
                  <div className="space-y-2">
                    {attentionItems.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 rounded-xl px-4 py-3 ${
                          item.level === 'red' ? 'bg-rose-50/50 border border-rose-200/60' :
                          item.level === 'amber' ? 'bg-stone-50 border border-stone-200' :
                          'bg-emerald-50/50 border border-emerald-200/60'
                        }`}
                      >
                        <span className="mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800">{item.title}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{item.action}</p>
                        </div>
                        {item.cta && item.onAction && (
                          <button
                            onClick={item.onAction}
                            className="ml-auto text-xs font-semibold text-stone-900 hover:text-stone-600 transition-colors whitespace-nowrap flex items-center gap-1"
                          >
                            {item.cta} <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Team Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {repData.map((rd, i) => (
                  <motion.div
                    key={rd.rep.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => {
                      startImpersonation(rd.rep.id);
                      navigate('/team');
                    }}
                    className="bg-white rounded-xl p-5 border border-stone-200/60 cursor-pointer group hover:ring-2 hover:ring-stone-300 transition-all duration-200"
                    style={{ borderLeftColor: rd.rep.avatar_color, borderLeftWidth: 4 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: rd.rep.avatar_color }}>
                        {rd.rep.initials}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-stone-800">{rd.rep.full_name}</div>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: getPaceColor(rd.pace) + '20', color: getPaceColor(rd.pace) }}>
                          {getPaceLabel(rd.pace)}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-stone-400 group-hover:text-stone-900 transition-colors flex items-center gap-1">
                        View Scorecard <ArrowRight size={12} />
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-500">Revenue</span>
                        <span className="text-stone-800">{fmtCurrency(rd.actual.revenue)} <span className="text-stone-400">/ {fmtCurrency(rd.goal.revenue)}</span></span>
                      </div>
                      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(rd.revPct * 100, 100)}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full rounded-full" style={{ backgroundColor: getPaceColor(rd.pace) }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: 'Active Rooms', val: rd.activeRooms },
                        { label: 'Approved', val: rd.approvedRooms },
                        { label: 'Won', val: rd.actual.closed_won },
                      ].map(s => (
                        <div key={s.label} className="bg-stone-50 rounded-lg p-2 border border-stone-200/60">
                          <div className="text-lg font-bold text-stone-800">{fmtNum(s.val)}</div>
                          <div className="text-[9px] text-stone-400">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Discovery Sessions */}
              {(() => {
                const sessions = allSessions.slice(0, 5);
                if (sessions.length === 0) return null;
                return (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="mb-8 bg-white rounded-xl p-6 border border-stone-200/60">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-stone-500 flex items-center gap-2">
                        <Search size={14} /> Recent Discovery Sessions
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {sessions.map((s: DiscoverySession) => {
                        const rep = REP_PROFILES.find(r => r.id === s.rep_id);
                        return (
                          <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-stone-50 border border-stone-200/60">
                            {rep && (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: rep.avatar_color }}>
                                {rep.initials}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-stone-800 truncate">{s.company_name}</div>
                              <div className="text-xs text-stone-400">
                                {s.selected_pains?.length || 0} pain{(s.selected_pains?.length || 0) !== 1 ? 's' : ''} identified · {s.roi_total > 0 ? `$${Math.round(s.roi_total).toLocaleString()} projected ROI` : 'No ROI calculated'}
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              s.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                              s.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                              'bg-stone-50 text-stone-600'
                            }`}>
                              {s.status === 'approved' ? 'Approved' : s.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                            <span className="text-xs text-stone-400">
                              {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Funnel Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-6 border border-stone-200/60">
                  <h3 className="text-sm font-semibold text-stone-500 mb-4">Activity {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Quarter'}</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={activityData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis dataKey="stage" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={{ stroke: '#d6d3d1' }} />
                      <YAxis tick={{ fill: '#78716c', fontSize: 12 }} axisLine={{ stroke: '#d6d3d1' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d6d3d1', borderRadius: 8, fontSize: 13 }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {REP_PROFILES.map(r => (
                        <Bar key={r.id} dataKey={r.initials} name={r.full_name} fill={r.avatar_color} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl p-6 border border-stone-200/60">
                  <h3 className="text-sm font-semibold text-stone-500 mb-4">Pipeline {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Quarter'}</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={pipelineData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis dataKey="stage" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={{ stroke: '#d6d3d1' }} />
                      <YAxis tick={{ fill: '#78716c', fontSize: 12 }} axisLine={{ stroke: '#d6d3d1' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d6d3d1', borderRadius: 8, fontSize: 13 }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {REP_PROFILES.map(r => (
                        <Bar key={r.id} dataKey={r.initials} name={r.full_name} fill={r.avatar_color} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </motion.div>
          ) : activeTab === 'coaching' ? (
            <motion.div key="coaching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <CoachingIntelligenceTab onStartImpersonation={startImpersonation} />
            </motion.div>
          ) : activeTab === 'funnel' ? (
            <motion.div key="funnel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <ConversionAnalysis />
              <div className="mt-8">
                <FatalityTally />
              </div>
            </motion.div>
          ) : activeTab === 'granola' ? (
            <motion.div key="granola" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <GranolaAdminView />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---- Funnel Tab ----
function FunnelTab({
  repData,
  pctThrough,
  onStartImpersonation,
}: {
  repData: { rep: typeof REP_PROFILES[0]; goal: any; actual: any; revPct: number; pace: any }[];
  pctThrough: number;
  onStartImpersonation: (repId: string) => void;
}) {
  const DISPLAY_METRICS: { key: MetricKey; label: string }[] = [
    { key: 'dials', label: 'Dials' },
    { key: 'connects', label: 'Connects' },
    { key: 'conversations', label: 'Convos' },
    { key: 'emails_sent', label: 'Emails' },
    { key: 'discovery_set', label: 'Disc Set' },
    { key: 'discovery_held', label: 'Disc Held' },
    { key: 'demo_held', label: 'Demo' },
    { key: 'proposal_sent', label: 'Proposal' },
    { key: 'closed_won', label: 'Won' },
    { key: 'revenue', label: 'Revenue' },
  ];

  const isCurrency = (k: MetricKey) => k === 'revenue';

  return (
    <div className="space-y-8">
      {/* All-Rep Metric Table */}
      <div className="bg-white rounded-xl border border-stone-200/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100">
          <h3 className="text-sm font-bold text-stone-700">Team Funnel Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <th className="text-left px-4 py-2.5 font-bold text-stone-500 w-36">Rep</th>
                {DISPLAY_METRICS.map(m => (
                  <th key={m.key} className="text-center px-2 py-2.5 font-bold text-stone-500">{m.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repData.map(rd => (
                <tr
                  key={rd.rep.id}
                  onClick={() => onStartImpersonation(rd.rep.id)}
                  className="border-b border-stone-50 hover:bg-stone-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: rd.rep.avatar_color }}>
                        {rd.rep.initials}
                      </div>
                      <span className="font-medium text-stone-700">{rd.rep.full_name}</span>
                    </div>
                  </td>
                  {DISPLAY_METRICS.map(m => {
                    const actual = rd.actual[m.key] ?? 0;
                    const goal = rd.goal[m.key] ?? 0;
                    const pct = goal > 0 ? actual / goal : 0;
                    const pace = getPaceStatus(pct, pctThrough);
                    const color = getPaceColor(pace);

                    return (
                      <td key={m.key} className="text-center px-2 py-2.5">
                        <div className="font-bold text-stone-800 tabular-nums">
                          {isCurrency(m.key) ? fmtCurrency(actual) : fmtNum(actual)}
                        </div>
                        <div className="text-[10px] text-stone-400 tabular-nums">
                          / {isCurrency(m.key) ? fmtCurrency(goal) : fmtNum(goal)}
                        </div>
                        {goal > 0 && (
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full mt-0.5"
                            style={{ backgroundColor: color }}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Fatality Tally */}
      <div>
        <h3 className="text-sm font-bold text-stone-700 mb-4">Team Loss Analysis</h3>
        <FatalityTally />
      </div>
    </div>
  );
}
