/* eslint-disable react-refresh/only-export-components */
import { motion } from 'framer-motion';
import type React from 'react';

export const CleanTimelineItem = ({
    title,
    description,
    timestamp,
    metadata,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    timestamp: string;
    status?: 'success' | 'warning' | 'error' | 'info';
    metadata?: React.ReactNode;
}) => {
    return (
        <div className="group relative pb-8 pl-8 last:pb-0">
            <div className="absolute left-0 top-0 h-full w-px bg-stone-100 group-last:h-4" />
            <div className="absolute left-[-4px] top-1.5 size-2 rounded-full border-2 border-white bg-stone-300 group-first:bg-stone-900" />

            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold tracking-tight text-stone-900">{title}</h5>
                    <span className="rail-mono">{timestamp}</span>
                </div>
                <p className="text-xs text-stone-400">{description}</p>
                {metadata && (
                    <div className="mt-2 rounded border border-stone-200/40 bg-stone-50 p-2 text-stone-400">
                        {metadata}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Badge ---

export const CleanBadge = ({
    children,
    variant = 'secondary',
    className = '',
}: {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'brand' | 'brandBlue';
    className?: string;
}) => {
    const variants = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border-amber-100',
        error: 'bg-rose-50 text-rose-700 border-rose-100',
        info: 'bg-sky-50 text-sky-700 border-sky-100',
        secondary: 'bg-stone-50 text-stone-600 border-stone-200/40',
        brand: 'bg-stone-900 text-white border-transparent',
        brandBlue: 'bg-brandBlue text-white border-transparent',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
};

// --- Status Components ---

export const CleanStatusDot = ({
    status,
    size = 'md',
    animated = false,
}: {
    status: 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
}) => {
    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
    };

    const statusColors = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        error: 'bg-rose-500',
        info: 'bg-sky-500',
    };

    return (
        <div className="relative inline-flex">
            <span
                className={`${sizeClasses[size]} ${statusColors[status]} rounded-full ${animated ? 'animate-pulse' : ''}`}
            />
        </div>
    );
};

// ────────────────────────────────────────────────────────────────
// Progress Bar
// ────────────────────────────────────────────────────────────────

export const CleanProgressBar = ({
    value,
    max = 100,
    variant = 'default',
    label,
    showPct = false,
    size = 'md',
    className = '',
}: {
    value: number;
    max?: number;
    variant?: 'default' | 'budget';
    label?: string;
    showPct?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) => {
    const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
    const heightMap = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

    const fillColor =
        variant === 'budget' ?
            pct > 90 ? 'bg-red-500'
            : pct > 70 ? 'bg-amber-500'
            : 'bg-stone-900'
        :   'bg-stone-900';

    return (
        <div className={className}>
            {(label || showPct) && (
                <div className="mb-2 flex items-center justify-between text-[10px] font-medium text-stone-400">
                    {label && <span>{label}</span>}
                    {showPct && <span>{Math.round(pct)}%</span>}
                </div>
            )}
            <div className={`${heightMap[size]} overflow-hidden rounded-full bg-stone-100`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
                    className={`h-full rounded-full ${fillColor}`}
                />
            </div>
        </div>
    );
};

// --- Loading ---

type SkeletonPreset = 'default' | 'stat-card' | 'table-row' | 'card' | 'page-header' | 'avatar';

export const CleanSkeleton = ({
    className = '',
    rows = 1,
    preset = 'default',
    count = 1,
}: {
    className?: string;
    rows?: number;
    preset?: SkeletonPreset;
    count?: number;
}) => {
    // Shimmer base class - uses CSS animation defined in index.css
    const shimmer =
        'bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100 bg-[length:200%_100%] animate-shimmer';

    // ── Preset renderers ──────────────────────────────────────
    if (preset === 'stat-card') {
        return (
            <div className={`space-y-4 rounded-2xl border border-stone-200/40 p-6 ${className}`}>
                <div className="flex items-center gap-2.5">
                    <div className={`${shimmer} size-10 rounded-xl`} />
                    <div className={`${shimmer} h-3 w-24 rounded`} />
                </div>
                <div className={`${shimmer} h-7 w-32 rounded`} />
                <div className={`${shimmer} h-3 w-20 rounded`} />
            </div>
        );
    }

    if (preset === 'table-row') {
        return (
            <div className={`space-y-0 ${className}`}>
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 border-b border-stone-50 px-6 py-4"
                        style={{ opacity: 1 - i * 0.08 }}
                    >
                        <div className={`${shimmer} h-4 w-40 rounded`} />
                        <div className={`${shimmer} h-4 w-24 rounded`} />
                        <div className={`${shimmer} ml-auto h-4 w-20 rounded`} />
                    </div>
                ))}
            </div>
        );
    }

    if (preset === 'card') {
        return (
            <div className={`space-y-4 rounded-2xl border border-stone-200/40 p-6 ${className}`}>
                <div className={`${shimmer} h-5 w-40 rounded`} />
                <div className="space-y-2">
                    <div className={`${shimmer} h-3 w-full rounded`} />
                    <div className={`${shimmer} h-3 w-3/4 rounded`} />
                </div>
            </div>
        );
    }

    if (preset === 'page-header') {
        return (
            <div className={`space-y-3 ${className}`}>
                <div className={`${shimmer} h-8 w-64 rounded`} />
                <div className={`${shimmer} h-4 w-96 rounded`} />
            </div>
        );
    }

    if (preset === 'avatar') {
        return <div className={`${shimmer} size-10 rounded-full ${className}`} />;
    }

    // ── Default: generic rows ─────────────────────────────────
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className={`${shimmer} h-8 w-full rounded-md`}
                    style={{ opacity: 1 - i * 0.15 }}
                />
            ))}
        </div>
    );
};
