// ============================================================
// StatusBadge — Green / Yellow / Red pill indicator
// ============================================================

interface StatusBadgeProps {
  /** Value as a ratio (0–1). ≥0.9 = green, ≥0.5 = yellow, <0.5 = red */
  value: number;
  /** Custom labels (defaults to Green/Yellow/Red) */
  labels?: { good: string; ok: string; bad: string };
  /** Size variant */
  size?: 'sm' | 'md';
}

function getStatusConfig(value: number, labels?: StatusBadgeProps['labels']) {
  if (value >= 0.9) return {
    classes: 'bg-emerald-50 text-emerald-700',
    label: labels?.good ?? 'Green',
  };
  if (value >= 0.5) return {
    classes: 'bg-amber-50 text-amber-700',
    label: labels?.ok ?? 'Yellow',
  };
  return {
    classes: 'bg-red-50 text-red-600',
    label: labels?.bad ?? 'Red',
  };
}

export function StatusBadge({ value, labels, size = 'sm' }: StatusBadgeProps) {
  const { classes, label } = getStatusConfig(value, labels);
  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${classes} ${sizeClasses}`}>
      {label}
    </span>
  );
}
