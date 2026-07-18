/* eslint-disable react-refresh/only-export-components */
import { motion } from 'framer-motion';
import type React from 'react';
import { forwardRef, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';

// --- Typography & Motion Primitives (World-Class CleanUI) ---

export const CleanHeading = ({
    children,
    size = 'h2',
    weight = 'bold',
    className = '',
    as,
    accent = false,
}: {
    children: React.ReactNode;
    size?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'label';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    /** If true, uses a slightly different font or style for accentuation */
    accent?: boolean;
}) => {
    const Component =
        as ||
        (size === 'display' ? 'h1'
        : size === 'label' ? 'p'
        : size);

    const sizes = {
        display: 'text-4xl md:text-5xl tracking-tighter leading-[1.05]',
        h1: 'text-2xl md:text-3xl tracking-tight leading-[1.1]',
        h2: 'text-xl md:text-2xl tracking-tight leading-[1.2]',
        h3: 'text-lg md:text-xl tracking-tight leading-[1.2]',
        h4: 'text-base tracking-tight leading-[1.3]',
        label: 'text-[10px] font-medium leading-none',
    };

    const weights = {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        black: 'font-bold',
    };

    return (
        <Component
            className={cn(
                'text-balance text-stone-900',
                accent && 'font-serif italic',
                sizes[size],
                weights[weight],
                className,
            )}
        >
            {children}
        </Component>
    );
};

export const CleanLabel = ({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <span
        className={`text-[10px] font-medium text-stone-400 ${className}`}
    >
        {children}
    </span>
);

export const CleanMotion = forwardRef<
    HTMLDivElement,
    {
        children: React.ReactNode;
        preset?: 'fade-up' | 'pop' | 'slide-right' | 'stagger-children';
        delay?: number;
        className?: string;
    }
>(({ children, preset = 'fade-up', delay = 0, className = '' }, ref) => {
    const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

    const variants: any = {
        'fade-up': {
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease, delay } },
        },
        pop: {
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease, delay } },
        },
        'slide-right': {
            hidden: { opacity: 0, x: -12 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease, delay } },
        },
        'stagger-children': {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: delay } },
        },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants[preset]}
            className={className}
        >
            {children}
        </motion.div>
    );
});
CleanMotion.displayName = 'CleanMotion';

export const Reveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * CleanMagnetic - A wrapper that pulls the element toward the cursor.
 * Used for primary buttons and high-intent icons (Pillar 4.87).
 */
export const CleanMagnetic = ({
    children,
    strength = 0.2,
    className = '',
}: {
    children: React.ReactNode;
    strength?: number;
    className?: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const middleX = left + width / 2;
        const middleY = top + height / 2;
        const x = (e.clientX - middleX) * strength;
        const y = (e.clientY - middleY) * strength;
        setPosition({ x, y });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.5 }}
            className={cn('inline-block', className)}
        >
            {children}
        </motion.div>
    );
};

/**
 * CleanSpotlight - Adds a cursor-following radial gradient glow.
 * Perfect for card backgrounds and bento cells.
 */
export const CleanSpotlight = ({
    children,
    color = 'rgba(24, 24, 27, 0.04)',
    radius = 300,
    className = '',
}: {
    children: React.ReactNode;
    color?: string;
    radius?: number;
    className?: string;
}) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setOpacity(1);
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={cn('group relative overflow-hidden', className)}
        >
            <div
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(${radius}px circle at ${mousePos.x}px ${mousePos.y}px, ${color}, transparent 80%)`,
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
};
