/* eslint-disable react-refresh/only-export-components */
import { motion } from 'framer-motion';
import type React from 'react';
import { useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { CleanHeading } from './CleanAnimation';
import { tokens } from './tokens';

// --- Layout ---

export const CleanSurface = ({
    children,
    level = 1,
    className = '',
}: {
    children: React.ReactNode;
    level?: 0 | 1 | 2 | 3 | 'invert';
    className?: string;
}) => {
    const levelStyles = {
        0: 'bg-white shadow-sm border border-stone-200/50',
        1: 'glass-panel',
        2: 'bg-stone-100/50 backdrop-blur-sm border border-stone-200/40',
        3: 'bg-stone-200 text-stone-800',
        invert: 'bg-stone-900 text-white shadow-xl',
    };

    return <div className={`rounded-2xl ${levelStyles[level]} ${className}`}>{children}</div>;
};

export const CleanPage = ({
    children,
    className = '',
    dense = false,
    noPadding = false,
}: {
    children: React.ReactNode;
    className?: string;
    dense?: boolean;
    noPadding?: boolean;
}) => (
    <div
        className={cn(
            'mx-auto w-full max-w-screen-2xl',
            noPadding ? '' : 'p-4 md:p-6 lg:p-8',
            dense ? 'space-y-3 md:space-y-4' : 'space-y-4 md:space-y-5',
            className,
        )}
    >
        {children}
    </div>
);

export const CleanGrid = ({
    children,
    columns = 3,
    gap = 6,
    className = '',
    dense = false,
    items,
}: {
    children: React.ReactNode;
    /** Number of columns at full desktop width (1–6). Stacks responsively on smaller screens. */
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Gap between grid items (Tailwind spacing scale: 2–8). Default 6. */
    gap?: 2 | 3 | 4 | 5 | 6 | 8;
    className?: string;
    /** Use CSS Grid dense packing (useful for mixed-size cards) */
    dense?: boolean;
    /** Vertical alignment of items: 'start' | 'center' | 'end' | 'stretch' */
    items?: 'start' | 'center' | 'end' | 'stretch';
}) => {
    // ── Static class maps (Tailwind-safe - no dynamic interpolation) ──
    const colsMap: Record<number, string> = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
        6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    };
    const gapMap: Record<number, string> = {
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
    };
    const itemsMap: Record<string, string> = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
    };
    return (
        <div
            className={cn(
                'grid w-full',
                colsMap[columns] || colsMap[3],
                gapMap[gap] || gapMap[6],
                dense && 'grid-flow-dense',
                items && itemsMap[items],
                className,
            )}
        >
            {children}
        </div>
    );
};

export const CleanPageHeader = ({
    title,
    subtitle,
    action, // Legacy single action
    actions = [], // Golden Actions group
    breadcrumbs,
    icon,
    isShadowMode,
    className = '',
    variant = 'default',
}: {
    title: string;
    subtitle?: React.ReactNode;
    action?: React.ReactNode;
    actions?: React.ReactNode | React.ReactNode[];
    breadcrumbs?: React.ReactNode;
    icon?: React.ReactNode;
    isShadowMode?: boolean;
    className?: string;
    variant?: 'default' | 'hero';
}) => {
    // Auto-set document title for SEO + tab orientation
    useEffect(() => {
        const prev = document.title;
        document.title = `${title} | Teamtailor`;
        return () => {
            document.title = prev;
        };
    }, [title]);

    // Consolidate actions for backward compatibility
    const actionsArray =
        Array.isArray(actions) ? actions
        : actions ? [actions]
        : [];
    const allActions = [...(action ? [action] : []), ...actionsArray];

    if (variant === 'hero') {
        const brand = tokens.brand.primary;
        return (
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn('relative z-50 overflow-hidden rounded-2xl border mb-6', className)}
                style={{ background: `linear-gradient(135deg, ${brand}08, ${brand}03)`, borderColor: `${brand}30` }}
            >
                <div className="px-8 py-10 flex flex-col items-center text-center">
                    {icon && <div className="mb-4">{icon}</div>}
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mb-3">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-lg text-stone-400 max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                    {allActions.length > 0 && (
                        <div className="flex items-center gap-3 mt-6">
                            {allActions.map((act, i) => (
                                <div key={i}>{act}</div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.header>
        );
    }

    return (
        <div className={cn('mb-6 flex flex-col gap-2 relative overflow-hidden rounded-2xl glass-panel p-6', className)}>
            {/* Golden Breadcrumbs Integration */}
            {breadcrumbs && <div className="flex items-center gap-2 mb-2">{breadcrumbs}</div>}

            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center relative z-10">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h1 className="flex items-center gap-2.5 text-2xl font-bold leading-tight tracking-tight text-stone-900">
                            {icon && <span className="text-pink-500 drop-shadow-sm">{icon}</span>}
                            {title}
                        </h1>
                        {isShadowMode && (
                            <div className="flex animate-pulse items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                                </span>
                                Shadow Mode Active
                            </div>
                        )}
                    </div>
                    {subtitle && (
                        <div className="text-sm font-medium leading-relaxed text-stone-500 max-w-2xl">
                            {subtitle}
                        </div>
                    )}
                </div>

                {allActions.length > 0 && (
                    <div className="flex shrink-0 items-center gap-3">
                        {allActions.map((act, i) => (
                            <div key={i}>{act}</div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Decorative background flare */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};

// ─── CleanPageToolbar ───────────────────────────────────────────────────────
// Standard toolbar row that sits immediately beneath CleanPageHeader.
// Layout:  [left: search / filters]    [right: secondary action buttons]
//          [tabs row - spans full width, below the bar]
//
// Usage:
//   <CleanPageToolbar
//     left={<CleanInput placeholder="Search..." />}
//     right={<CleanButton>Export</CleanButton>}
//     tabs={<MyTabRow />}
//   />

export const CleanPageToolbar = ({
    left,
    right,
    tabs,
    className = '',
}: {
    left?: React.ReactNode;
    right?: React.ReactNode;
    tabs?: React.ReactNode;
    className?: string;
}) => (
    <div className={cn('mb-4 flex flex-col gap-3', className)}>
        {/* Search / actions row */}
        {(left || right) && (
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">{left}</div>
                {right && <div className="flex flex-shrink-0 items-center gap-2">{right}</div>}
            </div>
        )}
        {/* Tab row */}
        {tabs && <div>{tabs}</div>}
    </div>
);

export const CleanSection: React.FC<{
    title: string | React.ReactNode;
    description?: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    noMargin?: boolean;
}> = ({ title, description, icon, children, className, noMargin = false }) => (
    <div className={cn('flex flex-col', !noMargin && 'mb-6', className)}>
        <div className="mb-3 flex flex-none items-start gap-2.5 md:items-center">
            {icon && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200/40 bg-stone-50 text-stone-400">
                    {icon}
                </div>
            )}
            <div>
                <CleanHeading size="h3" weight="bold">
                    {title}
                </CleanHeading>
                {description && (
                    <p className="mt-0.5 max-w-3xl text-pretty text-xs leading-relaxed text-stone-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
    </div>
);

// --- Bento Grid (Editorial Dashboards) ---

export const CleanBentoGrid = ({
    children,
    preset = 'dashboard-hero',
    gap = 6,
    className = '',
}: {
    children: React.ReactNode;
    /** Preset layout configuration for different dashboard archetypes. */
    preset?: 'dashboard-hero' | 'dashboard-wide' | 'dashboard-sidebar' | 'dashboard-balanced';
    /** Gap between grid items (Tailwind spacing scale: 2–8). Default 6. */
    gap?: 2 | 3 | 4 | 5 | 6 | 8;
    className?: string;
}) => {
    const colsMap: Record<string, string> = {
        'dashboard-hero': 'grid-cols-1 md:grid-cols-3',
        'dashboard-wide': 'grid-cols-1 md:grid-cols-3',
        'dashboard-sidebar': 'grid-cols-1 md:grid-cols-3',
        'dashboard-balanced': 'grid-cols-1 md:grid-cols-2',
    };

    const gapMap: Record<number, string> = {
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
    };

    return (
        <div
            className={[
                'grid',
                colsMap[preset] || colsMap['dashboard-hero'],
                gapMap[gap] || gapMap[6],
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {children}
        </div>
    );
};

export const CleanBentoCell = ({
    children,
    area,
    span,
    minHeight,
    className = '',
}: {
    children: React.ReactNode;
    /** Semantic area name for auto-spanning logic. */
    area?: 'stats' | 'main' | 'sidebar' | 'pulse' | 'feed' | 'intel' | 'footer' | 'left' | 'right';
    /** Manual column span (1-4) at desktop width. */
    span?: 1 | 2 | 3 | 4;
    /** Optional minimum height. */
    minHeight?: string;
    /** Additional classes. */
    className?: string;
}) => {
    const areaMap: Record<string, string> = {
        stats: 'md:col-span-full',
        pulse: 'md:col-span-full',
        footer: 'md:col-span-full',
        main: 'md:col-span-2',
        feed: 'md:col-span-2',
        sidebar: 'md:col-span-1',
        intel: 'md:col-span-1',
        left: 'md:col-span-1',
        right: 'md:col-span-1',
    };

    const spanMap: Record<number, string> = {
        1: 'md:col-span-1',
        2: 'md:col-span-2',
        3: 'md:col-span-3',
        4: 'md:col-span-4',
    };

    const gridClass =
        area ? areaMap[area]
        : span ? spanMap[span]
        : '';

    return (
        <div
            className={[gridClass, className].filter(Boolean).join(' ')}
            style={minHeight ? { minHeight } : {}}
        >
            {children}
        </div>
    );
};
