// ============================================================
// Design Tokens — Single source of truth for the warm stone theme
// ============================================================

export const tokens = {
  brand: {
    primary: '#1c1917',
    primaryHover: '#E6256F',
    primaryMuted: 'rgba(255, 42, 127, 0.08)',
  },
  surface: {
    page: 'bg-stone-50',
    card: 'bg-white border border-stone-200/60 shadow-sm rounded-xl',
    cardHover: 'hover:shadow-md hover:border-stone-300/60',
    inset: 'bg-stone-50 border border-stone-200/60 rounded-xl',
    overlay: 'bg-white/90 backdrop-blur-sm',
  },
  text: {
    primary: 'text-stone-800',
    secondary: 'text-stone-500',
    muted: 'text-stone-400',
    inverse: 'text-white',
  },
  typography: {
    heading: 'text-sm font-semibold text-stone-800',
    subheading: 'text-xs font-semibold text-stone-500 uppercase tracking-wide',
    body: 'text-[13px] text-stone-600',
    caption: 'text-xs text-stone-400',
    number: 'text-[13px] font-medium tabular-nums text-stone-800',
    currency: 'text-emerald-700 font-semibold tabular-nums',
  },
  input: {
    base: 'bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-300 focus:border-stone-300 transition-all',
    sm: 'px-2 py-1.5 text-[13px]',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  },
  status: {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-600',
  },
  table: {
    header: 'bg-stone-50 text-xs font-medium text-stone-500 uppercase tracking-wider',
    row: 'border-b border-stone-100',
    altRow: 'bg-stone-50/50',
    cell: 'px-3 py-2',
  },
  button: {
    primary: 'bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium transition-colors',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors',
    ghost: 'text-stone-500 hover:text-stone-700 transition-colors',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  },
  animation: {
    fast: { duration: 0.15, ease: 'easeOut' as const },
    normal: { duration: 0.25, ease: 'easeOut' as const },
    spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
} as const;
