// ============================================================
// FatalityTally — Aggregated loss reason analysis
// Shows loss counts, competitor losses, and closed-lost deal log
// ============================================================
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Skull, Shield, AlertTriangle, Clock, UserMinus, Building2,
  HelpCircle, DollarSign, Trophy,
} from 'lucide-react';
import {
  buildFatalityTally, getTopCompetitorLosses, getClosedLostLog,
} from '../../lib/fatalityAnalysis';
import { fmtCurrency } from '../../lib/format';

interface FatalityTallyProps {
  repId?: string;
}

// Reason icons
const REASON_ICONS: Record<string, React.ReactNode> = {
  'competitor': <Shield className="w-4 h-4" />,
  'no-decision': <Clock className="w-4 h-4" />,
  'budget': <DollarSign className="w-4 h-4" />,
  'timing': <AlertTriangle className="w-4 h-4" />,
  'champion-left': <UserMinus className="w-4 h-4" />,
  'internal-solution': <Building2 className="w-4 h-4" />,
  'other': <HelpCircle className="w-4 h-4" />,
};

// Color gradient for loss reasons
const REASON_COLORS: Record<string, string> = {
  'competitor': '#ef4444',
  'no-decision': '#f97316',
  'budget': '#f59e0b',
  'timing': '#eab308',
  'champion-left': '#d946ef',
  'internal-solution': '#8b5cf6',
  'other': '#78716c',
};

export default function FatalityTally({ repId }: FatalityTallyProps) {
  const tally = useMemo(() => buildFatalityTally(repId), [repId]);
  const competitors = useMemo(() => getTopCompetitorLosses(repId), [repId]);
  const lostLog = useMemo(() => getClosedLostLog(repId), [repId]);

  const totalLost = tally.reduce((sum, t) => sum + t.count, 0);
  const totalRevenueLost = tally.reduce((sum, t) => sum + t.revenue, 0);

  // Empty state
  if (tally.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8 text-center">
        <Trophy className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-stone-700 mb-1">No closed-lost deals to analyze</h3>
        <p className="text-xs text-stone-400">Keep winning! 🏆</p>
      </div>
    );
  }

  // Chart data
  const chartData = tally.map((t) => ({
    name: t.label,
    count: t.count,
    revenue: t.revenue,
    color: REASON_COLORS[t.reason] ?? '#78716c',
  }));

  const compChartData = competitors.map((c) => ({
    name: c.competitor,
    count: c.count,
    revenue: c.totalRevenue,
  }));

  return (
    <div className="space-y-6">
      {/* Revenue Impact Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-100 rounded-xl p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Skull className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-red-700">Total Revenue Lost</p>
              <p className="text-xl font-bold text-red-900">{fmtCurrency(totalRevenueLost)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-red-600">{totalLost} deals lost</p>
          </div>
        </div>
      </motion.div>

      {/* Section 1: Fatality Summary Bar Chart */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-stone-700 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          Loss Reasons
        </h3>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#78716c' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#78716c' }} width={120} />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'count') return [value, 'Deals'];
                  return [fmtCurrency(value as number), 'Revenue'];
                }}
                contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: '#e7e5e4' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inline stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {tally.map((t) => (
            <div key={t.reason} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg">
              <span className="text-stone-400">{REASON_ICONS[t.reason]}</span>
              <div>
                <p className="text-xs font-bold text-stone-700">{t.label}</p>
                <p className="text-[10px] text-stone-500">
                  {t.count} deals · {fmtCurrency(t.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Top Competitors */}
      {compChartData.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-stone-700 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-400" />
            Top Competitors Winning Deals
          </h3>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compChartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#78716c' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#78716c' }} width={100} />
                <Tooltip
                  formatter={(value: any) => [value, 'Lost Deals']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: '#e7e5e4' }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Section 3: Closed Lost Log */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <Skull className="w-4 h-4 text-stone-400" />
            Closed Lost Log
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <th className="text-left px-4 py-2 font-bold text-stone-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-3 py-2 font-bold text-stone-500 uppercase tracking-wider">Reason</th>
                <th className="text-left px-3 py-2 font-bold text-stone-500 uppercase tracking-wider">Competitor</th>
                <th className="text-right px-3 py-2 font-bold text-stone-500 uppercase tracking-wider">Revenue</th>
                <th className="text-right px-4 py-2 font-bold text-stone-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {lostLog.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-stone-400">
                    No lost deals recorded
                  </td>
                </tr>
              ) : (
                lostLog.map((deal, i) => (
                  <tr key={i} className="border-b border-stone-50 hover:bg-stone-50/50">
                    <td className="px-4 py-2 font-medium text-stone-700">{deal.company}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          backgroundColor: `${REASON_COLORS[deal.reason] ?? '#78716c'}15`,
                          color: REASON_COLORS[deal.reason] ?? '#78716c',
                        }}
                      >
                        {REASON_ICONS[deal.reason]}
                        {deal.reasonLabel}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-stone-500">{deal.competitor ?? '—'}</td>
                    <td className="text-right px-3 py-2 font-bold text-stone-700 tabular-nums">
                      {fmtCurrency(deal.revenue)}
                    </td>
                    <td className="text-right px-4 py-2 text-stone-500 tabular-nums">{deal.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
