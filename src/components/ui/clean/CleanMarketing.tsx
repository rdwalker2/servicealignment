/* eslint-disable react-refresh/only-export-components */
import type React from 'react';
import { CleanHeading } from './CleanAnimation';
import { CleanCard } from './CleanCards';
import { CleanButton } from './CleanForms';
import { tokens } from './tokens';

// --- Empty State ---

export const CleanEmpty = ({
    icon,
    title,
    description,
    action,
    variant = 'centered',
    className = '',
}: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    variant?: 'centered' | 'banner' | 'inline';
    className?: string;
}) => {
    if (variant === 'banner') {
        return (
            <CleanCard
                variant="consumer"
                className={`flex flex-col items-center gap-6 md:flex-row md:gap-8 ${className}`}
            >
                {icon && (
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 md:size-20">
                        {icon}
                    </div>
                )}
                <div className="flex-1 space-y-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-stone-900">{title}</h3>
                    {description && <p className="text-base text-stone-400">{description}</p>}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </CleanCard>
        );
    }

    if (variant === 'inline') {
        return (
            <div
                className={`flex items-center justify-center gap-4 rounded-xl border border-dashed border-stone-200/40 bg-stone-50 p-6 text-center ${className}`}
            >
                {icon && <span className="text-stone-400">{icon}</span>}
                <div className="max-w-sm space-y-0.5">
                    <p className="font-semibold text-stone-700">{title}</p>
                    {description && <p className="text-xs text-stone-400">{description}</p>}
                </div>
                {action && <div className="ml-2">{action}</div>}
            </div>
        );
    }

    // Default centered variant
    return (
        <div
            className={`flex flex-col items-center justify-center px-4 py-16 text-center ${className}`}
        >
            {icon && (
                <div className="mb-6 flex size-16 items-center justify-center rounded-3xl border border-stone-200/40 bg-stone-50 text-stone-400">
                    {icon}
                </div>
            )}
            <h3 className="mb-2 text-xl font-bold text-stone-900">{title}</h3>
            {description && (
                <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-stone-400">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
};

// --- Public / Marketing Section Primitives ---

export const CleanSectionHeader = ({
    label,
    title,
    description,
    align = 'center',
    className = '',
}: {
    label?: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
    className?: string;
}) => (
    <div className={`${align === 'center' ? 'text-center' : ''} ${className}`}>
        {label && (
            <div
                className={`inline-flex items-center gap-2 px-3 py-1 ${tokens.radius.full} ${tokens.surface.secondary} ${tokens.border.default} ${tokens.text.secondary} mb-8 text-[10px] font-medium ${align === 'center' ? 'mx-auto' : ''}`}
            >
                {label}
            </div>
        )}
        <CleanHeading size="h2" weight="bold" className="mb-4">
            {title}
        </CleanHeading>
        {description && (
            <p
                className={`${tokens.text.secondary} leading-relaxed ${align === 'center' ? 'mx-auto max-w-xl' : 'max-w-2xl'}`}
            >
                {description}
            </p>
        )}
    </div>
);

export const CleanPublicSection = ({
    children,
    bg = 'white',
    className = '',
    id,
}: {
    children: React.ReactNode;
    bg?: 'white' | 'zinc' | 'invert';
    className?: string;
    id?: string;
}) => {
    const bgStyles = {
        white: 'bg-white border-b border-stone-200/40',
        zinc: 'bg-stone-50 border-b border-stone-200/40',
        invert: 'bg-stone-900 text-white',
    };

    return (
        <section id={id} className={`py-16 sm:py-24 ${bgStyles[bg]} ${className}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
        </section>
    );
};

export const CleanCTA = ({
    title,
    description,
    primaryLabel,
    primaryTo,
    secondaryLabel,
    secondaryTo,
    className = '',
}: {
    title: string;
    description?: string;
    primaryLabel: string;
    primaryTo: string;
    secondaryLabel?: string;
    secondaryTo?: string;
    className?: string;
}) => (
    <div className={`text-center ${className}`}>
        <CleanHeading size="h1" weight="black" className="mb-6">
            {title}
        </CleanHeading>
        {description && (
            <p className={`text-lg sm:text-xl ${tokens.text.secondary} mx-auto mb-10 max-w-2xl`}>
                {description}
            </p>
        )}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a href={primaryTo}>
                <CleanButton variant="primary" size="lg">
                    {primaryLabel}
                </CleanButton>
            </a>
            {secondaryLabel && secondaryTo && (
                <a href={secondaryTo}>
                    <CleanButton variant="secondary" size="lg">
                        {secondaryLabel}
                    </CleanButton>
                </a>
            )}
        </div>
    </div>
);
