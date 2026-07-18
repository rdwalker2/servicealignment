/* eslint-disable react-refresh/only-export-components */
import type React from 'react';
import { isValidElement } from 'react';
import { tokens } from './tokens';

// --- Cards ---

export const CleanStatCard = ({
    label,
    value,
    subLabel,
    icon: Icon,
    color = 'brand',
    proof,
    sparklineData,
    className = '',
    onClick,
}: {
    label: string;
    value: string | number;
    subLabel?: string;
    icon?: any;
    color?: 'brand' | 'brandBlue' | 'amber' | 'rose' | 'slate' | 'info' | 'sky';
    proof?: { verified: boolean; source: string };
    sparklineData?: number[];
    className?: string;
    onClick?: () => void;
}) => {
    const iconColors = {
        brand: 'text-stone-900 bg-stone-100 border-stone-200/40',
        brandBlue: 'text-sky-600 bg-sky-50 border-sky-100',
        info: 'text-blue-600 bg-blue-50 border-blue-100',
        sky: 'text-sky-600 bg-sky-50 border-sky-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
        slate: 'text-stone-600 bg-stone-50 border-stone-200/40',
    };

    const sparklineStrokeColors = {
        brand: '#18181b', // stone-900
        brandBlue: '#0284c7',
        info: '#2563eb',
        sky: '#0284c7',
        amber: '#d97706',
        rose: '#e11d48',
        slate: '#78716c',
    };

    const colorClass = iconColors[color as keyof typeof iconColors] || iconColors.brand;

    // Build sparkline SVG path
    const renderSparkline = (data: number[]) => {
        if (data.length < 2) return null;
        const w = 120;
        const h = 32;
        const pad = 2;
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const points = data.map((v, i) => ({
            x: pad + (i / (data.length - 1)) * (w - pad * 2),
            y: pad + (1 - (v - min) / range) * (h - pad * 2),
        }));
        const d = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
            .join(' ');
        const lastPt = points[points.length - 1]!;
        const firstPt = points[0]!;
        const gradientD = `${d} L ${lastPt.x.toFixed(1)} ${h} L ${firstPt.x.toFixed(1)} ${h} Z`;
        const strokeColor =
            sparklineStrokeColors[color as keyof typeof sparklineStrokeColors] ||
            sparklineStrokeColors.brand;
        return (
            <svg
                width={w}
                height={h}
                viewBox={`0 0 ${w} ${h}`}
                className="mt-3 opacity-60 transition-opacity group-hover:opacity-100"
            >
                <defs>
                    <linearGradient id={`spark-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={gradientD} fill={`url(#spark-grad-${color})`} />
                <path
                    d={d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx={lastPt.x} cy={lastPt.y} r="2" fill={strokeColor} />
            </svg>
        );
    };

    return (
        <div
            className={`group rounded-xl bg-white ${tokens.border.default} p-4 ${tokens.hover.glow} ${tokens.transition.standard} ${onClick ? 'cursor-pointer border-stone-200/40 hover:border-stone-300 active:scale-[0.98]' : ''} ${className}`}
            onClick={onClick}
            onKeyDown={
                onClick ?
                    (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onClick();
                        }
                    }
                :   undefined
            }
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {Icon && (
                        <div
                            className={`rounded-lg border p-1.5 ${colorClass} duration-[80ms] transition-transform group-hover:scale-105`}
                        >
                            {isValidElement(Icon) ?
                                Icon
                            : typeof Icon === 'function' || (Icon as any)?.$$typeof ?
                                <Icon size={14} strokeWidth={1.5} />
                            :   Icon}
                        </div>
                    )}
                    <span className="text-xs font-medium tracking-tight text-stone-400">
                        {label}
                    </span>
                </div>
                {proof && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600">
                        <div className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Live
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <div className="flex items-baseline gap-1 text-xl font-semibold tabular-nums tracking-tight text-stone-900">
                    {value}
                </div>
                {subLabel && (
                    <div className="flex items-center gap-2 text-[11px] font-medium text-stone-400">
                        {subLabel}
                    </div>
                )}
            </div>
            {sparklineData && sparklineData.length >= 2 && renderSparkline(sparklineData)}
        </div>
    );
};

export interface CleanCardProps extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'title' | 'children'
> {
    title?: React.ReactNode;
    children?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
    variant?: 'clean' | 'napkin' | 'consumer' | 'railway' | 'glass' | 'dark' | 'elevated';
    accent?: 'emerald' | 'indigo' | 'amber' | 'rose';
    noPadding?: boolean;
    dense?: boolean;
    hoverLift?: boolean;
    interactive?: boolean;
}

export const CleanCard = ({
    title,
    children,
    action,
    className = '',
    variant = 'clean',
    accent = 'emerald',
    noPadding = false,
    dense = false,
    hoverLift = false,
    interactive = false,
    ...props
}: CleanCardProps) => {
    const variantStyles = {
        clean: `${tokens.surface.primary} rounded-[var(--component-card-radius)] ${tokens.border.default}`,
        consumer: `${tokens.surface.primary} rounded-2xl border border-stone-200/40 relative overflow-hidden`,
        napkin: `bg-[#FDFCFB] border border-stone-200/40`,
        railway: `${tokens.surface.primary} rounded-[var(--component-card-radius)] ${tokens.border.default}`,
        glass: `${tokens.surface.glass} rounded-[var(--component-card-radius)] border border-white/50 ${tokens.shadow.md}`,
        dark: `${tokens.surface.invert} rounded-[var(--component-card-radius)] border border-stone-800 ${tokens.shadow.lg}`,
        elevated: `${tokens.surface.primary} rounded-[var(--component-card-radius)] border border-stone-200/40 ${tokens.shadow.lg}`,
    };

    const isHoverable = hoverLift || interactive;
    const hoverClass =
        isHoverable && variant !== 'railway' ?
            `${tokens.transition.standard} ${tokens.hover.lift} z-10`
        :   `${tokens.transition.standard} ${tokens.hover.glow}`;

    const interactiveClass = interactive ? 'cursor-pointer group' : '';

    const textColors = {
        title: variant === 'dark' ? 'text-white' : 'text-stone-900',
        body:
            variant === 'dark' ? 'text-stone-400'
            : variant === 'consumer' ? 'text-stone-500'
            : 'text-stone-400',
    };

    const accentColors = {
        emerald: 'bg-emerald-500',
        indigo: 'bg-indigo-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500',
    };

    // When noPadding is used WITH a title, apply padding only to the header row
    // so card content (tables, lists) can go edge-to-edge while the title stays properly inset.
    const hasHeader = !!(title || action);
    const outerPadding =
        noPadding ?
            '' // noPadding: never pad the outer div
        : dense ?
            'p-4' // dense: tighter internal padding
        :   'p-[var(--component-card-padding)]'; // normal: pad everything uniformly
    const headerPadding =
        noPadding && hasHeader ?
            dense ? 'px-4 pt-4'
            :   'px-[var(--component-card-padding)] pt-[var(--component-card-padding)]' // noPadding + header: inset the header row only
        :   ''; // normal: inherits outer padding

    return (
        <div
            className={`h-full ${outerPadding} ${variantStyles[variant]} ${hoverClass} ${interactiveClass} ${className}`}
            {...props}
        >
            {variant === 'consumer' && (
                <div className="pointer-events-none absolute right-0 top-0 p-8 opacity-[0.04] transition-opacity duration-700 group-hover:opacity-[0.08]">
                    <div
                        className={`size-64 rounded-full ${accentColors[accent]} -mr-32 -mt-32 blur-3xl`}
                    />
                </div>
            )}
            {hasHeader && (
                <div
                    className={`flex flex-wrap items-start justify-between gap-3 ${headerPadding} ${
                        dense ? 'mb-3'
                        : variant === 'consumer' ? 'mb-4'
                        : 'mb-3.5'
                    }`}
                >
                    {title && (
                        <div
                            className={`${textColors.title} ${variant === 'consumer' ? 'text-xl font-bold tracking-tight md:text-2xl' : 'text-base font-semibold tracking-tight'} flex items-center gap-2`}
                        >
                            {title}
                        </div>
                    )}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={`${textColors.body} relative`}>{children}</div>
        </div>
    );
};

export const CleanVerificationCard = ({
    title,
    status,
    icon,
    lastChecked,
    details,
    action,
}: {
    title: string;
    status: 'verified' | 'pending' | 'failed' | string;
    icon: React.ReactNode;
    lastChecked?: string;
    details?: string;
    action?: React.ReactNode;
}) => {
    const statusConfig = {
        verified: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-100',
            dot: 'bg-emerald-500',
        },
        pending: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-100',
            dot: 'bg-amber-500',
        },
        failed: {
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-100',
            dot: 'bg-rose-500',
        },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <div
            className={`flex h-full flex-col gap-4 rounded-xl border border-stone-200/40 bg-white p-4 transition-all duration-200 ease-out hover:border-stone-300`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className={`rounded-lg border border-stone-200/40 bg-stone-50 p-2 text-stone-400`}
                    >
                        {icon}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold tracking-tight text-stone-900">
                            {title}
                        </h4>
                        {lastChecked && (
                            <p className="mt-0.5 text-[10px] font-medium text-stone-400">
                                Checked {lastChecked}
                            </p>
                        )}
                    </div>
                </div>
                <div
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.bg} ${config.text} ${config.border}`}
                >
                    <div className={`size-1 rounded-full ${config.dot}`} />
                    {status}
                </div>
            </div>
            {details && <p className="text-xs leading-relaxed text-stone-400">{details}</p>}
            {action && <div className="mt-auto">{action}</div>}
        </div>
    );
};
