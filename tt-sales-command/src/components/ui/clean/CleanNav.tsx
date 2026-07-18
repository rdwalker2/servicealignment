/* eslint-disable react-refresh/only-export-components */
import { motion } from 'framer-motion';
import type React from 'react';
import { Fragment } from 'react';
import { cn } from '../../../lib/utils';

// ─── CleanPageTabs ───────────────────────────────────────────────────────────
// THE canonical tab bar for all pages/hubs. One style, one height, everywhere.
// - h-12 bar, 2px bottom-border indicator (spring-animated via Framer)
// - Icons optional. Counts optional.
// - Use `variant="muted"` for secondary/sub-tab rows (slightly smaller text)
//
// STANDARD:   <CleanPageTabs items={TABS} active={active} onChange={setActive} />
// SUB-LEVEL:  <CleanPageTabs items={SUB} active={sub} onChange={setSub} variant="muted" />

export interface CleanPageTabItem {
    id: string;
    label: string;
    icon?: React.ElementType;
    count?: number;
}

export const CleanPageTabs = <T extends string>({
    items,
    active,
    onChange,
    className,
    variant = 'default',
    layoutId = 'clean-page-tabs-indicator',
}: {
    items: CleanPageTabItem[];
    active: T;
    onChange: (id: T) => void;
    className?: string;
    variant?: 'default' | 'muted';
    layoutId?: string;
}) => (
    <div
        className={cn(
            'flex flex-nowrap items-center overflow-x-auto border-b border-stone-200/40 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            variant === 'default' ? 'h-12 gap-7' : 'h-10 gap-5',
            className,
        )}
        role="tablist"
    >
        {items.map((tab) => {
            const isActive = active === tab.id;
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onChange(tab.id as T)}
                    className={cn(
                        'group relative flex h-full shrink-0 items-center gap-1.5 whitespace-nowrap px-1 font-medium outline-none transition-colors',
                        variant === 'default' ? 'text-sm' : 'text-xs',
                        isActive ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600',
                    )}
                >
                    {Icon && (
                        <Icon
                            size={variant === 'default' ? 14 : 12}
                            className={
                                isActive ? 'text-stone-700' : (
                                    'text-stone-400 group-hover:text-stone-500'
                                )
                            }
                            aria-hidden="true"
                        />
                    )}
                    {tab.label}
                    {tab.count !== undefined && (
                        <span
                            className={cn(
                                'ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                                isActive ? 'bg-stone-100 text-stone-700' : 'bg-stone-50 text-stone-400',
                            )}
                        >
                            {tab.count}
                        </span>
                    )}
                    {isActive && (
                        <motion.div
                            layoutId={layoutId}
                            className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-t-[2px] bg-stone-900"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                    )}
                </button>
            );
        })}
    </div>
);

// ────────────────────────────────────────────────────────────────
// Filter Pill
// ────────────────────────────────────────────────────────────────

export const CleanFilterPill = ({
    label,
    active = false,
    onClick,
    count,
    icon,
    className = '',
}: {
    label: string;
    active?: boolean;
    onClick?: () => void;
    count?: number;
    icon?: React.ReactNode;
    className?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
            active ?
                'border-stone-900 bg-stone-900 text-white shadow-sm'
            :   'border-stone-200/40 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50/40'
        } ${className}`}
    >
        {icon && <span className={active ? 'text-white/80' : 'text-stone-400'}>{icon}</span>}
        {label}
        {count !== undefined && (
            <span
                className={`ml-0.5 text-[10px] font-bold ${active ? 'text-white/60' : 'text-stone-400'}`}
            >
                {count}
            </span>
        )}
    </button>
);

// ────────────────────────────────────────────────────────────────
// Stepper (Multi-step wizard navigation)
// ────────────────────────────────────────────────────────────────

export const CleanStepper = ({
    steps,
    activeStep,
    onStepClick,
    orientation = 'vertical',
    className = '',
}: {
    steps: { label: string; description?: string }[];
    activeStep: number;
    onStepClick?: (index: number) => void;
    orientation?: 'vertical' | 'horizontal';
    className?: string;
}) => {
    if (orientation === 'horizontal') {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                {steps.map((step, i) => {
                    const isActive = i === activeStep;
                    const isComplete = i < activeStep;
                    return (
                        <Fragment key={step.label}>
                            <button
                                type="button"
                                onClick={() => onStepClick?.(i)}
                                disabled={!onStepClick}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                    isActive ? 'bg-stone-900 text-white shadow-sm'
                                    : isComplete ? 'bg-stone-100 text-stone-900'
                                    : 'text-stone-400'
                                } ${onStepClick ? 'cursor-pointer hover:bg-stone-100' : 'cursor-default'}`}
                            >
                                <span
                                    className={`flex size-6 items-center justify-center rounded-full border text-xs font-bold ${
                                        isActive ? 'border-white bg-white text-stone-900'
                                        : isComplete ? 'border-stone-900 bg-stone-900 text-white'
                                        : 'border-stone-300 text-stone-400'
                                    }`}
                                >
                                    {isComplete ? '✓' : i + 1}
                                </span>
                                {step.label}
                            </button>
                            {i < steps.length - 1 && (
                                <div
                                    className={`h-px flex-1 ${isComplete ? 'bg-stone-900' : 'bg-stone-200'}`}
                                />
                            )}
                        </Fragment>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={`space-y-1 ${className}`}>
            {steps.map((step, i) => {
                const isActive = i === activeStep;
                const isComplete = i < activeStep;
                return (
                    <button
                        key={step.label}
                        type="button"
                        onClick={() => onStepClick?.(i)}
                        disabled={!onStepClick}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                            isActive ?
                                'border border-stone-200/40 bg-white shadow-sm'
                            :   'hover:bg-stone-50/40'
                        } ${onStepClick ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                        <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                                isActive ? 'border-stone-900 bg-stone-900 text-white'
                                : isComplete ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                : 'border-stone-200/40 bg-stone-50 text-stone-400'
                            }`}
                        >
                            {isComplete ? '✓' : i + 1}
                        </span>
                        <div>
                            <p
                                className={`text-sm font-semibold ${isActive ? 'text-stone-900' : 'text-stone-400'}`}
                            >
                                {step.label}
                            </p>
                            {step.description && (
                                <p className="mt-0.5 text-xs text-stone-400">{step.description}</p>
                            )}
                        </div>
                        {isActive && (
                            <div className="ml-auto size-1.5 rounded-full bg-emerald-500" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

// ────────────────────────────────────────────────────────────────
// Amount Picker (Donation/Budget preset selector)
// ────────────────────────────────────────────────────────────────

export const CleanAmountPicker = ({
    amounts,
    selected,
    onSelect,
    currency = '$',
    allowCustom = false,
    customValue,
    onCustomChange,
    className = '',
}: {
    amounts: number[];
    selected: number | null;
    onSelect: (amount: number | null) => void;
    currency?: string;
    allowCustom?: boolean;
    customValue?: string;
    onCustomChange?: (value: string) => void;
    className?: string;
}) => {
    const isCustomActive = allowCustom && selected === null && customValue;

    return (
        <div className={`grid grid-cols-3 gap-2 ${className}`}>
            {amounts.map((amount) => (
                <button
                    key={amount}
                    type="button"
                    onClick={() => onSelect(amount)}
                    className={`rounded-lg border py-3 text-sm font-semibold transition-all duration-150 ${
                        selected === amount ?
                            'border-stone-900 bg-stone-900 text-white shadow-sm'
                        :   'border-stone-200/40 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100'
                    }`}
                >
                    {currency}
                    {amount.toLocaleString()}
                </button>
            ))}
            {allowCustom && (
                <div className={`relative col-span-3 ${isCustomActive ? '' : ''}`}>
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-stone-400">
                        {currency}
                    </span>
                    <input
                        type="number"
                        placeholder="Custom amount"
                        value={customValue || ''}
                        onChange={(e) => {
                            onSelect(null);
                            onCustomChange?.(e.target.value);
                        }}
                        onFocus={() => onSelect(null)}
                        className={`w-full rounded-lg border bg-white py-3 pl-7 pr-4 text-sm font-semibold text-stone-900 transition-all placeholder:text-stone-300 ${
                            isCustomActive ?
                                'border-stone-900 ring-1 ring-stone-900'
                            :   'border-stone-200/40'
                        } outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900`}
                    />
                </div>
            )}
        </div>
    );
};

// --- Segment Control (Pill-based Tabs) ---

export interface CleanSegmentItem<T extends string> {
    id: T;
    label: string;
    icon?: React.ElementType;
    badge?: string;
}

export interface CleanSegmentControlProps<T extends string> {
    items: readonly CleanSegmentItem<T>[];
    activeId: T;
    onChange: (id: T) => void;
    className?: string;
    rightElement?: React.ReactNode;
}

export const CleanSegmentControl = <T extends string>({
    items,
    activeId,
    onChange,
    className,
    rightElement,
}: CleanSegmentControlProps<T>) => {
    return (
        <div
            className={cn(
                'mb-6 flex min-h-12 items-center justify-between border-b border-stone-200/40',
                className,
            )}
        >
            <div className="flex h-12 flex-1 flex-nowrap items-center gap-6 overflow-x-auto [scrollbar-width:none] md:gap-8 [&::-webkit-scrollbar]:hidden">
                {items.map((tab) => {
                    const isActive = activeId === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                'group relative flex h-full shrink-0 items-center justify-center gap-2 px-1 text-xs font-medium outline-none transition-colors',
                                isActive ? 'text-stone-800' : 'text-stone-400 hover:text-stone-600',
                            )}
                            aria-selected={isActive}
                            role="tab"
                        >
                            {Icon && (
                                <Icon
                                    size={13}
                                    className={cn(
                                        isActive ? 'text-stone-800' : (
                                            'text-stone-400 group-hover:text-stone-500'
                                        ),
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                            <span className="hidden sm:inline">{tab.label}</span>
                            {!tab.icon && <span className="sm:hidden">{tab.label}</span>}
                            {tab.badge && (
                                <span
                                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                                        isActive ?
                                            'bg-stone-100 text-stone-700'
                                        :   'bg-stone-100/50 text-stone-400'
                                    }`}
                                >
                                    {tab.badge}
                                </span>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="clean-micro-tabs-indicator-global"
                                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-t-[2px] bg-stone-800"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
            {rightElement && (
                <div className="flex shrink-0 items-center pb-2 pl-4">{rightElement}</div>
            )}
        </div>
    );
};
