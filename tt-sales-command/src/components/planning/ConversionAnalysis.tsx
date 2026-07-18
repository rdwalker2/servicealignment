// ============================================================
// ConversionAnalysis — Visual funnel conversion rate analysis
// Shows waterfall, trends, and bottleneck identification
// ============================================================
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid, AreaChart, Area, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useHistorical } from '../../hooks/useHistorical';
import {
  computeMonthlyConversions, identifyBottlenecks,
  computeConversionTrend,
} from '../../lib/conversionAnalysis';
import { avgMetricRows, safeDiv } from '../../lib/math';
import { fmtPct } from '../../lib/format';
import { FUNNEL_CONVERSION_PAIRS, type MetricRow } from '../../types';

interface ConversionAnalysisProps {
  repId: string;
  showTeamComparison?: boolean;
}

// Color palette for conversion pairs
const PAIR_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444',
];

function getConversionColor(actual: number, benchmark: number): string {
  if (actual >= benchmark) return '#10b981'; // emerald
  if (actual >= benchmark * 0.8) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export default function ConversionAnalysis({ repId }: ConversionAnalysisProps) {
  const { editable } = useHistorical(repId);

  // Current month's data (last entry with non-zero data, or last 3 months avg)
  const recent = useMemo(() => {
    const last3 = editable.slice(-3);
    return avgMetricRows(last3 as MetricRow[]);
  }, [editable]);

  // Current conversion rates
  const currentRates = useMemo(
    () => computeMonthlyConversions(recent),
    [recent],
  );

  // Gaps/bottlenecks
  const gaps = useMemo(() => identifyBottlenecks(recent), [recent]);

  // Trend data (last 6 months)
  const trend = useMemo(() => {
    const last6 = editable.slice(-6);
    return computeConversionTrend(last6);
  }, [editable]);

  // Waterfall chart data
  const waterfallData = useMemo(
    () =>
      FUNNEL_CONVERSION_PAIRS.map((pair) => ({
        name: pair.label.split(' → ').pop() ?? pair.label,
        fullLabel: pair.label,
        rate: (currentRates[pair.label] ?? 0) * 100,
        benchmark: pair.benchmark * 100,
        color: getConversionColor(currentRates[pair.label] ?? 0, pair.benchmark),
      })),
    [currentRates],
  );

  // Trend chart data
  const trendData = useMemo(() => {
    // Only show top 3 pairs by gap
    const topPairs = gaps.slice(0, 3).map((g) => g.pair.label);
    if (topPairs.length === 0) {
      // Show first 3 pairs if no gaps
      topPairs.push(...FUNNEL_CONVERSION_PAIRS.slice(0, 3).map((p) => p.label));
    }

    return trend.map((snapshot) => {
      const row: Record<string, string | number> = { month: snapshot.month.substring(5, 7) };
      for (const label of topPairs) {
        row[label] = Math.round((snapshot.rates[label] ?? 0) * 100);
      }
      return row;
    });
  }, [trend, gaps]);

  const trendKeys = useMemo(() => {
    const topPairs = gaps.slice(0, 3).map((g) => g.pair.label);
    if (topPairs.length === 0) {
      return FUNNEL_CONVERSION_PAIRS.slice(0, 3).map((p) => p.label);
    }
    return topPairs;
  }, [gaps]);

  return (
    <div className="space-y-6">
      {/* Section 1: Conversion Waterfall */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-stone-700 mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          Conversion Waterfall
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          Each bar shows your conversion rate at each funnel stage. Benchmark shown as dashed line.
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#78716c' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#78716c' }} width={80} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Rate']}
                contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e7e5e4' }}
              />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={20}>
                {waterfallData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inline benchmark labels */}
        <div className="flex flex-wrap gap-3 mt-3">
          {waterfallData.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-stone-500">{d.name}:</span>
              <span className="font-bold" style={{ color: d.color }}>{d.rate.toFixed(1)}%</span>
              <span className="text-stone-400">/ {d.benchmark.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Conversion Trend */}
      {trendData.length > 1 && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-stone-700 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            6-Month Trend
          </h3>
          <p className="text-xs text-stone-400 mb-4">
            Tracking your most important conversion rates over time.
          </p>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#78716c' }} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#78716c' }} />
                <Tooltip
                  formatter={(value: any, name: string) => [`${value}%`, name]}
                  contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: '#e7e5e4' }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {trendKeys.map((key, i) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={PAIR_COLORS[i]}
                    fill={PAIR_COLORS[i]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Section 3: Bottleneck Card */}
      {gaps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-100 rounded-xl p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Your #1 Bottleneck: {gaps[0].pair.label}
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-amber-700">
                  Your Rate: <strong>{fmtPct(gaps[0].actual)}</strong>
                </span>
                <span className="text-xs text-amber-500">→</span>
                <span className="text-xs text-amber-700">
                  Benchmark: <strong>{fmtPct(gaps[0].benchmark)}</strong>
                </span>
                <span className="text-xs text-amber-500">→</span>
                <span className="text-xs font-bold text-red-600">
                  Gap: {fmtPct(gaps[0].gap)}
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-2 leading-relaxed">
                {gaps[0].impact}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
