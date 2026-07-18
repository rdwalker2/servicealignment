/* eslint-disable react-refresh/only-export-components */
import { Dialog } from '@headlessui/react';
import {
    Arrow as TooltipArrow,
    Content as TooltipContent,
    Portal as TooltipPortal,
    Provider as TooltipProvider,
    Root as TooltipRoot,
    Trigger as TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../lib/utils';
import { tokens } from './tokens';

// ─── CleanDrawer ─────────────────────────────────────────────────────────────
// Platform-standard slide-in drawer. Always anchors right.
// Use for: row detail, secondary config, activity logs, contextual help.
// Do NOT use for: primary workflows, multi-step wizards, global settings.
//
// Width tokens:
//   sm  → 384px  - simple record detail, activity log
//   md  → 448px  - standard detail + actions (default)
//   lg  → 512px  - rich detail with sub-tables
//   xl  → 672px  - complex review workflows (grant approval)

const DRAWER_WIDTHS = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
};

export const CleanDrawer = ({
    open,
    onClose,
    title,
    subtitle,
    icon,
    footer,
    width = 'md',
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: React.ReactNode;
    footer?: React.ReactNode;
    width?: 'sm' | 'md' | 'lg' | 'xl';
    children?: React.ReactNode;
}) => {
    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="drawer-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        key="drawer-panel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                        className={cn(
                            'fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl',
                            DRAWER_WIDTHS[width],
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-stone-200/40 px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                                {icon && (
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200/40 bg-stone-50 text-stone-400">
                                        {icon}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h2 className="truncate text-sm font-semibold text-stone-900">
                                        {title}
                                    </h2>
                                    {subtitle && (
                                        <p className="mt-0.5 truncate text-[11px] text-stone-400">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="ml-3 flex-shrink-0 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                            >
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    className="h-4 w-4"
                                >
                                    <path
                                        d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                                        fill="currentColor"
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Body - scrollable */}
                        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>

                        {/* Sticky Footer (optional) */}
                        {footer && (
                            <div className="shrink-0 border-t border-stone-200/40 bg-white px-5 py-4">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

// --- Modal ---

export interface CleanModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const CleanModal = ({ isOpen, onClose, title, children, footer }: CleanModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog
                    as="div"
                    className="relative z-[100]"
                    onClose={onClose}
                    open={isOpen}
                    static
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
                    />

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={tokens.spring.smooth}
                            >
                                <Dialog.Panel className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-stone-200/40 bg-white text-left align-middle shadow-2xl shadow-black/10">
                                    <div className="flex shrink-0 items-center justify-between border-b border-stone-200/40 bg-stone-50/50 p-6">
                                        <Dialog.Title
                                            as="h2"
                                            className="text-lg font-medium tracking-tight text-stone-900"
                                        >
                                            {title}
                                        </Dialog.Title>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className={`p-1 hover:bg-stone-200 ${tokens.radius.sm} ${tokens.transition.fast} text-stone-400 hover:text-stone-600 ${tokens.focus.ring}`}
                                        >
                                            <svg
                                                className="size-5"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M15 5L5 15M5 5L15 15"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="custom-scrollbar min-h-0 shrink overflow-y-auto">
                                        <div className="p-6">{children}</div>
                                    </div>
                                    {footer && (
                                        <div className="flex shrink-0 justify-end gap-3 border-t border-stone-200/40 bg-stone-50/50 p-6">
                                            {footer}
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </motion.div>
                        </div>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export const CleanTooltip = ({
    content,
    children,
    className = '',
    side = 'top',
    delayDuration = 200,
    asChild = true,
}: {
    content: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    delayDuration?: number;
    asChild?: boolean;
}) => {
    // Use the already-imported Radix Tooltip (import at file top)
    // NOTE: require() crashes in production builds - Vite strips CJS shims

    return (
        <TooltipProvider delayDuration={delayDuration}>
            <TooltipRoot>
                <TooltipTrigger asChild={asChild}>
                    {asChild ? children : <span>{children}</span>}
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent
                        side={side}
                        sideOffset={6}
                        className={`z-50 rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className}`}
                    >
                        {content}
                        <TooltipArrow className="fill-stone-900" width={8} height={4} />
                    </TooltipContent>
                </TooltipPortal>
            </TooltipRoot>
        </TooltipProvider>
    );
};
