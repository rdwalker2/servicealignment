// ────────────────────────────────────────────────────────────────
// Design Tokens - The single source of truth for every visual decision.
// Change one value here, the entire platform updates.
// ────────────────────────────────────────────────────────────────

export const tokens = {
    brand: {
        primary: '#1c1917',
    },
    surface: {
        primary: 'bg-white',
        secondary: 'bg-stone-50',
        tertiary: 'bg-stone-100',
        invert: 'bg-stone-900 text-white',
        code: 'bg-stone-900 text-stone-100',
        glass: 'bg-white/70 backdrop-blur-xl',
    },
    border: {
        default: 'border border-stone-200/40',
        subtle: 'border border-stone-100',
        strong: 'border border-stone-300',
    },
    shadow: {
        xs: 'shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
        sm: 'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        md: 'shadow-[0_4px_12px_rgba(0,0,0,0.05)]',
        lg: 'shadow-xl',
        float: 'shadow-2xl shadow-stone-900/10',
    },
    radius: {
        sm: 'rounded-lg',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        full: 'rounded-full',
    },
    text: {
        primary: 'text-stone-900',
        secondary: 'text-stone-400',
        tertiary: 'text-stone-400',
        inverse: 'text-white',
    },
    focus: {
        ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        ringInvert:
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900',
    },
    hover: {
        lift: 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-stone-300',
        glow: 'hover:border-stone-300',
        tint: 'hover:bg-stone-50/40',
        none: '',
    },
    transition: {
        fast: 'transition-[color,background-color,border-color,opacity,transform] duration-[80ms] ease-[cubic-bezier(0.2,0,0,1)]',
        standard:
            'transition-[color,background-color,border-color,opacity,transform] duration-[150ms] ease-[cubic-bezier(0.2,0,0,1)]',
        slow: 'transition-[color,background-color,border-color,opacity,transform] duration-[220ms] ease-[cubic-bezier(0.2,0,0,1)]',
    },
    spring: {
        /** Snappy - buttons, toggles, small interactive elements */
        snappy: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.8 },
        /** Smooth - modals, panels, page transitions */
        smooth: { type: 'spring' as const, stiffness: 300, damping: 30, mass: 1 },
        /** Bouncy - celebration states, success animations */
        bouncy: { type: 'spring' as const, stiffness: 400, damping: 28, mass: 0.8 },
    },
} as const;

export { tokens as CleanTokens };
