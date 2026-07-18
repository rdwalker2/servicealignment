// ============================================================
// Card — Reusable card container with warm stone theme
// ============================================================
import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Use inset/muted background instead of white */
  inset?: boolean;
  /** Enable hover shadow effect */
  hoverable?: boolean;
  /** Animate entrance */
  animate?: boolean;
}

const PADDING = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', padding = 'md', inset, hoverable, animate, ...props }, ref) => {
    const base = inset
      ? 'bg-stone-50 border border-stone-200/60 rounded-xl'
      : 'bg-white border border-stone-200/60 shadow-sm rounded-xl';

    const hover = hoverable ? 'hover:shadow-md hover:border-stone-300/60 transition-shadow' : '';
    const pad = PADDING[padding];
    const classes = `${base} ${hover} ${pad} ${className}`.trim();

    if (animate) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={classes}
          {...(props as HTMLMotionProps<'div'>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
