// ============================================================
// SegmentControl — Warm stone tab/toggle control
// ============================================================
import { motion } from 'framer-motion';

interface SegmentOption<T extends string> {
  key: T;
  label: string;
  icon?: React.ElementType;
}

interface SegmentControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Unique layout ID for framer-motion (prevents conflicts with multiple controls) */
  layoutId?: string;
  size?: 'sm' | 'md';
}

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  layoutId = 'segment',
  size = 'sm',
}: SegmentControlProps<T>) {
  const sizeClasses = size === 'sm'
    ? 'px-3 py-1.5 text-xs'
    : 'px-4 py-2 text-sm';

  return (
    <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5 w-fit">
      {options.map(opt => {
        const isActive = value === opt.key;
        const Icon = opt.icon;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`relative flex items-center gap-1.5 rounded-md font-medium transition-colors ${sizeClasses} ${
              isActive
                ? 'text-stone-800'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {Icon && <Icon size={12} />}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
