// ============================================================
// TeamDashboardView — The rollup manager dashboard
// ============================================================
import { useMemo, useState } from 'react';
import { useHistorical, type HistoricalMonth } from '../../hooks/useHistorical';
import { useGoalStore } from '../../lib/stores/goalStore';
import { REP_SEED_DATA } from '../../data/seedData';
import { REP_PROFILES } from '../../contexts/AuthContext';
import {
  getAllDiscoverySessions,
  computeBAPAnswers,
  getCheckpointScore,
  getCheckpointStatus,
  BAP_QUESTIONS,
} from '../../lib/discoveryDatabase';
import { Target } from 'lucide-react';
import type { MonthlyGoal } from '../../types';

function getCurrentQuarter() {
  const now = new Date();
  const month = now.getMonth(); // 0-based
  const currentQuarter = Math.floor(month / 3) + 1; // 1-4
  const nextQuarterFirstMonth = currentQuarter * 3; // 0-based: Q1→3, Q2→6, Q3→9, Q4→12
  const goalYear = nextQuarterFirstMonth >= 12 ? now.getFullYear() + 1 : now.getFullYear();
  const firstMonth = nextQuarterFirstMonth % 12;

  const months: string[] = [];
  const keys: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(goalYear, firstMonth + i, 1);
    months.push(d.toLocaleString('en-US', { month: 'long' }));
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
  }
  return { months, keys };
}
const { months: GOAL_MONTHS, keys: GOAL_MONTH_KEYS } = getCurrentQuarter();

// ── Helpers ────────────────────────────────────────────────────
function fmtVal(n: number, isCurrency?: boolean, isRate?: boolean): string {
  if (isRate) return n > 0 ? `${(n * 100).toFixed(1)}%` : '—';
  if (isCurrency) {
    if (n === 0) return '$0';
    if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return `$${n.toLocaleString()}`;
  }
  return n > 0 ? n.toLocaleString() : '0';
}

function MetricRow({ label, field, isCurrency, getTeamVal }: { label: string, field: string, isCurrency?: boolean, getTeamVal: (mk: string, field: keyof MonthlyGoal) => number }) {
  const total = GOAL_MONTH_KEYS.reduce((sum, mk) => sum + getTeamVal(mk, field as keyof MonthlyGoal), 0);
  return (
    <tr className="border-b border-stone-100 hover:bg-stone-50/50">
      <td className="py-2 px-3 text-[13px] text-stone-600">{label}</td>
      {GOAL_MONTH_KEYS.map((mk) => (
        <td key={mk} className="py-2 px-2 text-[13px] text-stone-700 text-right tabular-nums">
          {fmtVal(getTeamVal(mk, field as keyof MonthlyGoal), isCurrency)}
        </td>
      ))}
      <td className="py-2 px-3 text-[13px] font-semibold text-stone-800 text-right tabular-nums bg-stone-50/50">
        {fmtVal(total, isCurrency)}
      </td>
    </tr>
  );
}

function RepRow({ label, field, isCurrency, getRepVal }: { label: string, field: string, isCurrency?: boolean, getRepVal: (repId: string, field: string) => number }) {
  const total = REP_PROFILES.reduce((sum, rep) => sum + getRepVal(rep.id, field), 0);
  return (
    <tr className="border-b border-stone-100 hover:bg-stone-50/50">
      <td className="py-2 px-3 text-[13px] text-stone-600">{label}</td>
      {REP_PROFILES.map((rep) => (
        <td key={rep.id} className="py-2 px-2 text-[13px] text-stone-700 text-right tabular-nums">
          {fmtVal(getRepVal(rep.id, field), isCurrency)}
        </td>
      ))}
      <td className="py-2 px-3 text-[13px] font-semibold text-stone-800 text-right tabular-nums bg-stone-50/50">
        {fmtVal(total, isCurrency)}
      </td>
    </tr>
  );
}

export default function TeamDashboardView() {
  const getAllForMonth = useGoalStore((s) => s.getAllForMonth);

  // Aggregate goals across all reps
  const teamGoals = useMemo(() => {
    const agg: Record<string, MonthlyGoal> = {};
    for (const mk of GOAL_MONTH_KEYS) {
      const allReps = getAllForMonth(mk);
      agg[mk] = allReps.reduce(
        (acc, g) => {
          acc.dials += g.dials || 0;
          acc.connects += g.connects || 0;
          acc.emails_sent += g.emails_sent || 0;
          acc.email_conversations += g.email_conversations || 0;
          acc.linkedin_conversations += g.linkedin_conversations || 0;
          acc.linkedin_touches += g.linkedin_touches || 0;
          acc.conversations += g.conversations || 0;
          acc.discovery_set += g.discovery_set || 0;
          acc.discovery_held += g.discovery_held || 0;
          acc.disqualified += g.disqualified || 0;
          acc.demo_held += g.demo_held || 0;
          acc.proposal_sent += g.proposal_sent || 0;
          acc.closed_won += g.closed_won || 0;
          acc.closed_lost += g.closed_lost || 0;
          acc.revenue += g.revenue || 0;
          return acc;
        },
        {
          dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0,
          linkedin_touches: 0, discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0,
          proposal_sent: 0, closed_won: 0, closed_lost: 0, revenue: 0,
        } as unknown as MonthlyGoal
      );
    }
    return agg;
  }, [getAllForMonth]);

  // Aggregate per rep for the quarter
  const repAggregates = useMemo(() => {
    const agg: Record<string, Record<string, number>> = {};
    for (const rep of REP_PROFILES) {
      agg[rep.id] = {
        dials: 0, connects: 0, conversations: 0, email_conversations: 0, linkedin_conversations: 0, emails_sent: 0,
        linkedin_touches: 0, discovery_set: 0, discovery_held: 0, disqualified: 0, demo_held: 0,
        proposal_sent: 0, closed_won: 0, closed_lost: 0, revenue: 0,
      };
      for (const mk of GOAL_MONTH_KEYS) {
        const goal = useGoalStore.getState().goals[`${rep.id}_${mk}`];
        if (goal) {
          agg[rep.id].dials += goal.dials || 0;
          agg[rep.id].connects += goal.connects || 0;
          agg[rep.id].emails_sent += goal.emails_sent || 0;
          agg[rep.id].email_conversations += goal.email_conversations || 0;
          agg[rep.id].linkedin_conversations += goal.linkedin_conversations || 0;
          agg[rep.id].linkedin_touches += goal.linkedin_touches || 0;
          agg[rep.id].conversations += goal.conversations || 0;
          agg[rep.id].discovery_set += goal.discovery_set || 0;
          agg[rep.id].discovery_held += goal.discovery_held || 0;
          agg[rep.id].disqualified += goal.disqualified || 0;
          agg[rep.id].demo_held += goal.demo_held || 0;
          agg[rep.id].proposal_sent += goal.proposal_sent || 0;
          agg[rep.id].closed_won += goal.closed_won || 0;
          agg[rep.id].closed_lost += goal.closed_lost || 0;
          agg[rep.id].revenue += goal.revenue || 0;
        }
      }
    }
    return agg;
  }, []);

  const getTeamVal = (mk: string, field: keyof MonthlyGoal) => {
    return (teamGoals[mk]?.[field] as number) ?? 0;
  };

  const getRepVal = (repId: string, field: string) => {
    return repAggregates[repId]?.[field] ?? 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-stone-800">Team Dashboard — 90 Day Rollup</h2>
          <p className="text-[12px] text-stone-400 mt-0.5">Aggregated goals and actuals across all reps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── 90-DAY OUTBOUND SUMMARY ── */}
        <div className="bg-white border border-stone-200/60 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100">
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-blue-600">90-Day Outbound Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/30">
                  <th className="text-left py-2.5 px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Metric</th>
                  {GOAL_MONTHS.map(m => (
                    <th key={m} className="py-2.5 px-2 text-[10px] font-bold text-stone-400 text-right uppercase tracking-wider w-20">{m}</th>
                  ))}
                  <th className="py-2.5 px-3 text-[10px] font-bold text-stone-800 text-right uppercase tracking-wider bg-stone-50/50 w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                <MetricRow getTeamVal={getTeamVal} label="Dials" field="dials" />
                <MetricRow getTeamVal={getTeamVal} label="Phone Connects" field="connects" />
                <MetricRow getTeamVal={getTeamVal} label="Emails Sent" field="emails_sent" />
                <MetricRow getTeamVal={getTeamVal} label="Total Conversations" field="conversations" />
                <MetricRow getTeamVal={getTeamVal} label="Meetings Booked" field="discovery_set" />
                <MetricRow getTeamVal={getTeamVal} label="Discovery Held" field="discovery_held" />
                <MetricRow getTeamVal={getTeamVal} label="Demo Held" field="demo_held" />
                <MetricRow getTeamVal={getTeamVal} label="Proposal Sent" field="proposal_sent" />
                <MetricRow getTeamVal={getTeamVal} label="Closed Won" field="closed_won" />
                <MetricRow getTeamVal={getTeamVal} label="Revenue" field="revenue" isCurrency />
              </tbody>
            </table>
          </div>
        </div>

        {/* ── REP COMPARISON ── */}
        <div className="bg-white border border-stone-200/60 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100">
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-stone-800">Rep Comparison (90-Day Target)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/30">
                  <th className="text-left py-2.5 px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Metric</th>
                  {REP_PROFILES.map(rep => (
                    <th key={rep.id} className="py-2.5 px-2 text-[10px] font-bold text-stone-400 text-right uppercase tracking-wider w-20">{rep.initials}</th>
                  ))}
                  <th className="py-2.5 px-3 text-[10px] font-bold text-stone-800 text-right uppercase tracking-wider bg-stone-50/50 w-24">Team Total</th>
                </tr>
              </thead>
              <tbody>
                <RepRow getRepVal={getRepVal} label="Dials" field="dials" />
                <RepRow getRepVal={getRepVal} label="Phone Connects" field="connects" />
                <RepRow getRepVal={getRepVal} label="Emails Sent" field="emails_sent" />
                <RepRow getRepVal={getRepVal} label="Total Conversations" field="conversations" />
                <RepRow getRepVal={getRepVal} label="Meetings Booked" field="discovery_set" />
                <RepRow getRepVal={getRepVal} label="Closed Won" field="closed_won" />
                <RepRow getRepVal={getRepVal} label="Revenue" field="revenue" isCurrency />
              </tbody>
            </table>
          </div>
        </div>

        {/* ── TEAM BAP ADOPTION ── */}
        <TeamBAPAdoptionCard />

        {/* ── COACHING PRIORITY ── */}
        <CoachingPriorityCard />
      </div>
    </div>
  );
}

// ── Team BAP Adoption Card ─────────────────────────────────────

const BAP_CP_MAX: Record<1 | 2 | 3, number> = { 1: 10, 2: 10, 3: 7.5 };

interface RepBAPMetrics {
  repId: string;
  initials: string;
  fullName: string;
  dealCount: number;
  adoptionPct: number;
  cpRates: Record<1 | 2 | 3, number>;
}

// Shared hook so both BAP Adoption and Coaching Priority cards
// consume the same computed metrics without duplicating logic.
function useRepBAPMetrics() {
  return useMemo(() => {
    const allSessions = getAllDiscoverySessions().filter(s => s.status === 'in_progress');

    // Group by rep_id
    const byRep: Record<string, typeof allSessions> = {};
    for (const s of allSessions) {
      if (!s.rep_id) continue;
      if (!byRep[s.rep_id]) byRep[s.rep_id] = [];
      byRep[s.rep_id].push(s);
    }

    const repMetrics: RepBAPMetrics[] = REP_PROFILES.map(rep => {
      const sessions = byRep[rep.id] || [];
      const totalQuestions = BAP_QUESTIONS.length;

      // Per-deal answered counts
      const dealMetrics = sessions.map(session => {
        const answers = computeBAPAnswers(session);
        const answeredCount = BAP_QUESTIONS.filter(q => {
          const a = answers[q.id];
          return a === 'yes' || a === 'no' || a === 'maybe';
        }).length;
        return { answers, answeredCount };
      });

      // Overall adoption %
      const adoptionPct = sessions.length > 0
        ? Math.round(dealMetrics.reduce((sum, d) => sum + (d.answeredCount / totalQuestions), 0) / sessions.length * 100)
        : 0;

      // CP pass rates
      const cpRates = ([1, 2, 3] as const).reduce((acc, cp) => {
        acc[cp] = sessions.length > 0
          ? Math.round(dealMetrics.filter(d => {
              const score = getCheckpointScore(d.answers, cp);
              const status = getCheckpointStatus(score, BAP_CP_MAX[cp]);
              return status.passed;
            }).length / sessions.length * 100)
          : 0;
        return acc;
      }, {} as Record<1 | 2 | 3, number>);

      return {
        repId: rep.id,
        initials: rep.initials,
        fullName: rep.full_name,
        dealCount: sessions.length,
        adoptionPct,
        cpRates,
      };
    });

    // Team totals
    const totalDeals = repMetrics.reduce((s, r) => s + r.dealCount, 0);
    const teamAdoption = repMetrics.length > 0
      ? Math.round(repMetrics.reduce((s, r) => s + r.adoptionPct * r.dealCount, 0) / Math.max(totalDeals, 1))
      : 0;
    const teamCpRates = ([1, 2, 3] as const).reduce((acc, cp) => {
      acc[cp] = repMetrics.length > 0
        ? Math.round(repMetrics.reduce((s, r) => s + r.cpRates[cp] * r.dealCount, 0) / Math.max(totalDeals, 1))
        : 0;
      return acc;
    }, {} as Record<1 | 2 | 3, number>);

    return {
      repMetrics,
      teamMetrics: { dealCount: totalDeals, adoptionPct: teamAdoption, cpRates: teamCpRates },
    };
  }, []);
}

function TeamBAPAdoptionCard() {
  const { repMetrics, teamMetrics } = useRepBAPMetrics();

  const pctColor = (pct: number) => pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="bg-white border border-stone-200/60 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2">
        <Target size={14} className="text-violet-500" />
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-violet-600">
          Team Process Adoption — BAP Compliance
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/30">
              <th className="text-left py-2.5 px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Rep</th>
              <th className="py-2.5 px-2 text-[10px] font-bold text-stone-400 text-right uppercase tracking-wider w-16">Deals</th>
              <th className="py-2.5 px-2 text-[10px] font-bold text-stone-400 text-right uppercase tracking-wider w-20">Adoption</th>
              <th className="py-2.5 px-2 text-[10px] font-bold text-stone-400 text-right uppercase tracking-wider w-16">CP1</th>
              <th className="py-2.5 px-2 text-[10px] font-bold text-stone-400 text-right uppercase tracking-wider w-16">CP2</th>
              <th className="py-2.5 px-2 text-[10px] font-bold text-stone-400 text-right uppercase tracking-wider w-16">CP3</th>
            </tr>
          </thead>
          <tbody>
            {repMetrics.map(rep => (
              <tr key={rep.repId} className="border-b border-stone-100 hover:bg-stone-50/50">
                <td className="py-2 px-3 text-[13px] text-stone-700 font-medium">{rep.initials}</td>
                <td className="py-2 px-2 text-[13px] text-stone-600 text-right tabular-nums">{rep.dealCount}</td>
                <td className={`py-2 px-2 text-[13px] font-semibold text-right tabular-nums ${pctColor(rep.adoptionPct)}`}>
                  {rep.adoptionPct}%
                </td>
                <td className={`py-2 px-2 text-[13px] text-right tabular-nums ${pctColor(rep.cpRates[1])}`}>
                  {rep.cpRates[1]}%
                </td>
                <td className={`py-2 px-2 text-[13px] text-right tabular-nums ${pctColor(rep.cpRates[2])}`}>
                  {rep.cpRates[2]}%
                </td>
                <td className={`py-2 px-2 text-[13px] text-right tabular-nums ${pctColor(rep.cpRates[3])}`}>
                  {rep.cpRates[3]}%
                </td>
              </tr>
            ))}
            {/* Team total row */}
            <tr className="bg-stone-50/50 border-t border-stone-200">
              <td className="py-2 px-3 text-[13px] font-bold text-stone-800">Team</td>
              <td className="py-2 px-2 text-[13px] font-bold text-stone-800 text-right tabular-nums">{teamMetrics.dealCount}</td>
              <td className={`py-2 px-2 text-[13px] font-bold text-right tabular-nums ${pctColor(teamMetrics.adoptionPct)}`}>
                {teamMetrics.adoptionPct}%
              </td>
              <td className={`py-2 px-2 text-[13px] font-bold text-right tabular-nums ${pctColor(teamMetrics.cpRates[1])}`}>
                {teamMetrics.cpRates[1]}%
              </td>
              <td className={`py-2 px-2 text-[13px] font-bold text-right tabular-nums ${pctColor(teamMetrics.cpRates[2])}`}>
                {teamMetrics.cpRates[2]}%
              </td>
              <td className={`py-2 px-2 text-[13px] font-bold text-right tabular-nums ${pctColor(teamMetrics.cpRates[3])}`}>
                {teamMetrics.cpRates[3]}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Coaching Priority Card ─────────────────────────────────────

const COACHING_TIPS: Record<1 | 2 | 3, string> = {
  1: 'Focus on pain discovery. Help this rep ask better questions about cost of inaction and urgency.',
  2: 'Work on capability gap analysis. Practice asking Q5-Q7 to prove they need outside help.',
  3: 'Solution mapping needs work. Drill competitive positioning and ROI articulation.',
};

const CP_LABELS: Record<1 | 2 | 3, string> = {
  1: 'CP1 — Pain Discovery',
  2: 'CP2 — Capability Gap',
  3: 'CP3 — Solution Mapping',
};

function CoachingPriorityCard() {
  const { repMetrics } = useRepBAPMetrics();

  const ranked = useMemo(() => {
    return repMetrics
      .map(rep => {
        // Identify weakest checkpoint
        let weakestCP: 1 | 2 | 3 = 1;
        let weakestRate = rep.cpRates[1];
        for (const cp of [2, 3] as const) {
          if (rep.cpRates[cp] < weakestRate) {
            weakestRate = rep.cpRates[cp];
            weakestCP = cp;
          }
        }
        return { ...rep, weakestCP, weakestRate };
      })
      .filter(rep => rep.dealCount > 0) // Only rank reps with deals
      .sort((a, b) => a.weakestRate - b.weakestRate);
  }, [repMetrics]);

  const urgencyBadge = (pct: number) => {
    if (pct < 40)
      return <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">Critical</span>;
    if (pct <= 70)
      return <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Medium</span>;
    return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">On Track</span>;
  };

  return (
    <div className="bg-white border border-stone-200/60 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2">
        <Target size={14} className="text-violet-500" />
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-violet-600">
          🎯 Coaching Priority This Week
        </h3>
      </div>
      <div className="overflow-x-auto">
        {ranked.length === 0 ? (
          <p className="px-4 py-6 text-[13px] text-stone-400 text-center">No active deals to analyze.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/30">
                <th className="py-2.5 px-3 text-[10px] font-bold text-stone-400 text-center uppercase tracking-wider w-10">#</th>
                <th className="text-left py-2.5 px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Rep</th>
                <th className="text-left py-2.5 px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Focus Area</th>
                <th className="text-left py-2.5 px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Coaching Tip</th>
                <th className="py-2.5 px-2 text-[10px] font-bold text-stone-400 text-center uppercase tracking-wider w-20">Urgency</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((rep, idx) => (
                <tr key={rep.repId} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="py-2 px-3 text-[13px] text-stone-400 text-center tabular-nums">{idx + 1}</td>
                  <td className="py-2 px-3 text-[13px] text-stone-700 font-medium whitespace-nowrap">{rep.fullName}</td>
                  <td className="py-2 px-2 text-[13px] text-stone-600 whitespace-nowrap">
                    {CP_LABELS[rep.weakestCP]} <span className="text-stone-400">({rep.weakestRate}%)</span>
                  </td>
                  <td className="py-2 px-2 text-[12px] text-stone-500 max-w-xs">{COACHING_TIPS[rep.weakestCP]}</td>
                  <td className="py-2 px-2 text-center">{urgencyBadge(rep.weakestRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
