/* eslint-disable react-refresh/only-export-components */
import { motion } from 'framer-motion';
import type React from 'react';
import { cn } from '../../../lib/utils';
import { CleanMagnetic } from './CleanAnimation';
import { tokens } from './tokens';

// --- Form Elements ---

export const CleanInput = ({
    label,
    className = '',
    icon,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; icon?: React.ReactNode }) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && <label className="text-xs font-medium text-stone-400">{label}</label>}
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    {icon}
                </div>
            )}
            <input
                {...props}
                className={`w-full py-2.5 ${tokens.surface.primary} ${tokens.border.default} ${tokens.radius.sm} text-sm ${tokens.focus.ring} ${tokens.transition.fast} placeholder:text-stone-300 ${icon ? 'pl-9 pr-4' : 'px-4'}`}
            />
        </div>
    </div>
);

export const CleanSelect = ({
    label,
    options,
    className = '',
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    options: { value: string; label: string }[];
}) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && <label className="text-xs font-medium text-stone-400">{label}</label>}
        <select
            {...props}
            className={`w-full px-4 py-2.5 ${tokens.surface.primary} ${tokens.border.default} ${tokens.radius.sm} text-sm ${tokens.focus.ring} ${tokens.transition.fast} appearance-none`}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

export const CleanTextArea = ({
    label,
    className = '',
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && <label className="text-xs font-medium text-stone-400">{label}</label>}
        <textarea
            {...props}
            className={`w-full px-4 py-2.5 ${tokens.surface.primary} ${tokens.border.default} ${tokens.radius.sm} text-sm ${tokens.focus.ring} ${tokens.transition.fast} min-h-[100px] placeholder:text-stone-300`}
        />
    </div>
);

export const CleanCheckbox = ({
    label,
    description,
    className = '',
    checked,
    onChange,
    disabled = false,
}: {
    label: string;
    description?: string;
    className?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}) => (
    <label
        className={`group flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
            checked ?
                'border-stone-800 bg-stone-900 text-white'
            :   'border-stone-200/40 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50/40'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
    >
        <div className="pt-0.5">
            <input
                type="checkbox"
                className="hidden"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div
                className={`flex size-4 items-center justify-center rounded border transition-all ${
                    checked ? 'border-white bg-white text-stone-900' : 'border-stone-200/40 bg-stone-50'
                }`}
            >
                {checked && (
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="size-3"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </div>
        </div>
        <div className="space-y-0.5">
            <p className="text-[13px] font-semibold leading-none">{label}</p>
            {description && (
                <p
                    className={`text-[11px] leading-relaxed ${checked ? 'text-stone-400' : 'text-stone-400'}`}
                >
                    {description}
                </p>
            )}
        </div>
    </label>
);

// --- Button ---

export interface CleanButtonProps extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'brand' | 'brandBlue';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    shape?: 'default' | 'square';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    stopPropagation?: boolean;
    magnetic?: boolean;
}

export const InlineSpinner = ({ className }: { className?: string }) => (
    <svg
        className={cn('animate-spin', className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        ></circle>
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
    </svg>
);

export const CleanButton = ({
    children,
    variant = 'secondary',
    size = 'sm',
    shape = 'default',
    className = '',
    isLoading,
    disabled,
    leftIcon,
    rightIcon,
    magnetic,
    ...props
}: CleanButtonProps) => {
    // We use a CSS spinner that scales perfectly with the font size of the button

    const baseStyle = `group inline-flex items-center justify-center gap-2 rounded-xl ${tokens.transition.fast} font-medium disabled:opacity-50 disabled:cursor-not-allowed ${tokens.focus.ring}`;

    const sizes = {
        xs: shape === 'square' ? 'size-6 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        sm: shape === 'square' ? 'size-6 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        md: shape === 'square' ? 'size-8 text-xs' : 'px-3.5 py-1.5 text-xs',
        lg: shape === 'square' ? 'size-10 text-sm' : 'px-5 py-2.5 text-sm',
    };

    const variants = {
        primary:
            'bg-stone-900 hover:bg-stone-800 text-white shadow-lg shadow-black/5 hover:shadow-black/10 hover:-translate-y-[1px]',
        secondary:
            'bg-white text-stone-900 hover:border-stone-300 border border-stone-200/40 shadow-sm shadow-stone-200/50 hover:shadow-md hover:-translate-y-[1px]',
        outline:
            'bg-transparent text-stone-700 border border-stone-200/40 hover:bg-stone-50/40 shadow-sm hover:shadow-md hover:-translate-y-[1px]',
        ghost: 'bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900',
        destructive: 'bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800',
        brand: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-[1px]',
        brandBlue:
            'bg-brandBlue hover:bg-brandBlue-600 text-white shadow-lg shadow-brandBlue-600/20 hover:shadow-brandBlue-600/30 hover:-translate-y-[1px]',
    };

    const isLight = variant === 'secondary' || variant === 'ghost' || variant === 'outline';
    const loaderColor = isLight ? 'text-stone-400' : 'text-white/90';

    const button = (
        <motion.button
            className={cn(baseStyle, sizes[size], variants[variant], className)}
            disabled={disabled || isLoading}
            whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
            transition={tokens.spring.snappy}
            {...props}
        >
            {isLoading && <InlineSpinner className={loaderColor} />}
            {!isLoading && leftIcon}
            {children}
            {!isLoading && rightIcon && (
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {rightIcon}
                </span>
            )}
        </motion.button>
    );

    if (magnetic || variant === 'primary') {
        return <CleanMagnetic strength={0.15}>{button}</CleanMagnetic>;
    }

    return button;
};

// ────────────────────────────────────────────────────────────────
// Toggle Switch
// ────────────────────────────────────────────────────────────────

export const CleanToggle = ({
    checked,
    onChange,
    disabled = false,
    size = 'md',
    label,
    description,
    className = '',
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md';
    label?: string;
    description?: string;
    className?: string;
}) => {
    const trackSize = size === 'sm' ? 'h-4 w-7' : 'h-5 w-9';
    const knobSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    const translate = size === 'sm' ? 'translate-x-3' : 'translate-x-4';

    const toggle = (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex ${trackSize} shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/10 focus-visible:ring-offset-2 ${
                checked ? 'bg-stone-900' : 'bg-stone-200'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
        >
            <motion.span
                layout
                transition={tokens.spring.snappy}
                className={`inline-block ${knobSize} rounded-full bg-white shadow-sm ${
                    checked ? translate : 'translate-x-0.5'
                }`}
            />
        </button>
    );

    if (!label) return toggle;

    return (
        <label
            className={`flex items-start gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
            <div className="pt-0.5">{toggle}</div>
            <div className="space-y-0.5">
                <p className="text-sm font-semibold tracking-tight text-stone-900">{label}</p>
                {description && (
                    <p className="text-xs leading-relaxed text-stone-400">{description}</p>
                )}
            </div>
        </label>
    );
};

// ────────────────────────────────────────────────────────────────
// Search Input
// ────────────────────────────────────────────────────────────────

export const CleanSearchInput = ({
    value,
    onChange,
    onKeyDown,
    placeholder = 'Search…',
    className = '',
}: {
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
}) => (
    <div className={`relative ${className}`}>
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
            </svg>
        </div>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={`w-full rounded-lg border border-stone-200/40 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-300 ${tokens.focus.ring} ${tokens.transition.fast}`}
        />
        {value && (
            <button
                type="button"
                onClick={() => onChange('')}
                className="absolute inset-y-0 right-3 flex items-center text-stone-300 transition-colors hover:text-stone-500"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>
        )}
    </div>
);
