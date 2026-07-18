// ============================================================
// SectionHeader — Consistent section heading pattern
// ============================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  /** Right-side action slot */
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, icon: Icon, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={15} className="text-stone-400 shrink-0" />}
        <div>
          <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
          {subtitle && (
            <p className="text-[13px] text-stone-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
