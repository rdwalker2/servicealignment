// ============================================================
// MetricValue — Formatted number with optional trend indicator
// ============================================================
import { fmtCurrency, fmtNum, fmtPct } from '../../lib/calculations';

interface MetricValueProps {
  value: number;
  format?: 'number' | 'currency' | 'percent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  trend?: 'up' | 'down' | 'flat';
  className?: string;
}

const FORMATTERS = {
  number: fmtNum,
  currency: fmtCurrency,
  percent: fmtPct,
};

const SIZE_CLASSES = {
  sm: 'text-xs',
  md: 'text-[13px]',
  lg: 'text-sm',
  xl: 'text-2xl font-bold',
};

const TREND_ARROWS: Record<string, { char: string; color: string }> = {
  up: { char: '↑', color: 'text-emerald-600' },
  down: { char: '↓', color: 'text-red-500' },
  flat: { char: '→', color: 'text-stone-400' },
};

export function MetricValue({
  value,
  format = 'number',
  size = 'md',
  trend,
  className = '',
}: MetricValueProps) {
  const formatted = FORMATTERS[format](value);
  const sizeClass = SIZE_CLASSES[size];
  const isCurrency = format === 'currency';

  return (
    <span className={`font-medium tabular-nums ${sizeClass} ${isCurrency ? 'text-emerald-700' : 'text-stone-800'} ${className}`}>
      {formatted}
      {trend && (
        <span className={`ml-1 text-xs ${TREND_ARROWS[trend].color}`}>
          {TREND_ARROWS[trend].char}
        </span>
      )}
    </span>
  );
}
