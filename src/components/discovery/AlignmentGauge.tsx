// ============================================================
// AlignmentGauge — Shared alignment/rating visualization
// Supports 3 variants: bar, circle, level
// Used across BCD, SolutionProposal, and ProblemCanvas
// ============================================================

import React from 'react';

// ── Types ──

export interface AlignmentGaugeProps {
  value: number; // 0-10
  label: string;
  variant?: 'bar' | 'circle' | 'level';
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ── Color Logic ──

function getValueColor(value: number): string {
  if (value <= 4) return '#ef4444'; // red
  if (value <= 7) return '#f59e0b'; // amber
  return '#10b981';                 // green
}

function getValueLabel(value: number): string {
  if (value <= 4) return 'Low';
  if (value <= 7) return 'Moderate';
  return 'High';
}

// ── Size Configs ──

const BAR_SIZES = {
  sm: { height: 6, fontSize: '0.78rem', labelSize: '0.72rem', padding: '16px 20px' },
  md: { height: 8, fontSize: '0.95rem', labelSize: '0.82rem', padding: '24px 28px' },
  lg: { height: 10, fontSize: '1.1rem', labelSize: '0.88rem', padding: '28px 32px' },
};

const CIRCLE_SIZES = {
  sm: { svgSize: 60, radius: 24, strokeWidth: 4, fontSize: '0.85rem', labelSize: '0.65rem' },
  md: { svgSize: 80, radius: 34, strokeWidth: 6, fontSize: '1.1rem', labelSize: '0.72rem' },
  lg: { svgSize: 100, radius: 42, strokeWidth: 7, fontSize: '1.3rem', labelSize: '0.78rem' },
};

const LEVEL_SIZES = {
  sm: { pillHeight: '24px', fontSize: '9px', labelSize: '9px' },
  md: { pillHeight: '28px', fontSize: '10px', labelSize: '10px' },
  lg: { pillHeight: '32px', fontSize: '11px', labelSize: '11px' },
};

// ── Bar Variant ──
// Horizontal progress bar with value display (used in BCD Alignment Checklist)

function BarGauge({ value, label, accentColor, size = 'md' }: AlignmentGaugeProps) {
  const color = accentColor || getValueColor(value);
  const s = BAR_SIZES[size];
  const pct = Math.min(Math.max(value, 0), 10) * 10;

  return (
    <div style={{
      padding: s.padding,
      background: 'var(--color-bg-subtle, #fafaf9)',
      borderRadius: 'var(--radius-md, 12px)',
      border: '1px solid var(--color-border-light, #e7e5e4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: s.labelSize, fontWeight: 700, color: 'var(--color-text-primary, #1c1917)', margin: 0 }}>
          {label}
        </span>
        <span style={{ fontSize: s.fontSize, fontWeight: 800, color }}>
          {value}/10
        </span>
      </div>
      <div style={{
        height: s.height,
        background: 'var(--color-border-light, #e7e5e4)',
        borderRadius: 100,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 100,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

// ── Circle Variant ──
// SVG circular gauge (used in SolutionProposal checkpoint reinforcement)

function CircleGauge({ value, label, accentColor, size = 'md' }: AlignmentGaugeProps) {
  const color = accentColor || getValueColor(value);
  const s = CIRCLE_SIZES[size];
  const circumference = 2 * Math.PI * s.radius;
  const pct = Math.min(Math.max(value, 0), 10) / 10;
  const dashArray = `${pct * circumference} ${circumference}`;
  const center = s.svgSize / 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg
        width={s.svgSize}
        height={s.svgSize}
        viewBox={`0 0 ${s.svgSize} ${s.svgSize}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={s.radius}
          fill="none"
          stroke="#f5f5f4"
          strokeWidth={s.strokeWidth}
        />
        {/* Value arc */}
        <circle
          cx={center}
          cy={center}
          r={s.radius}
          fill="none"
          stroke={color}
          strokeWidth={s.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      {/* Center value text — overlaid */}
      <div style={{
        marginTop: -(s.svgSize * 0.65),
        marginBottom: s.svgSize * 0.15,
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ fontSize: s.fontSize, fontWeight: 800, color, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.55rem', color: 'var(--color-text-muted, #a8a29e)', fontWeight: 600, marginTop: 1 }}>
          /10
        </div>
      </div>
      {/* Label */}
      <span style={{
        fontSize: s.labelSize,
        fontWeight: 700,
        color: 'var(--color-text-secondary, #78716c)',
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Level Variant ──
// Segmented pill gauge (used in ProblemCanvas sidebar)

const DEFAULT_LEVELS = [
  { text: 'Low', color: '#a1a1aa' },
  { text: 'Moderate', color: '#f59e0b' },
  { text: 'High', color: '#ef4444' },
];

function LevelGauge({ value, label, size = 'md' }: AlignmentGaugeProps) {
  const s = LEVEL_SIZES[size];

  // Map 0-10 to level index: 0-4 = 0 (Low), 5-7 = 1 (Moderate), 8-10 = 2 (High)
  const activeLevel = value >= 8 ? 2 : value >= 5 ? 1 : 0;

  return (
    <div>
      <span style={{
        display: 'block',
        fontSize: s.labelSize,
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        color: '#a1a1aa',
        marginBottom: 8,
      }}>
        {label}
      </span>
      <div style={{
        display: 'flex',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 100,
        border: '1px solid #e4e4e7',
        backgroundColor: '#fafafa',
        padding: 4,
      }}>
        {DEFAULT_LEVELS.map((level, i) => {
          const isActive = i === activeLevel;
          return (
            <div
              key={level.text}
              style={{
                flex: 1,
                textAlign: 'center' as const,
                padding: `6px 0`,
                fontSize: s.fontSize,
                fontWeight: 700,
                borderRadius: 100,
                transition: 'all 0.2s ease',
                color: isActive ? '#ffffff' : '#a1a1aa',
                backgroundColor: isActive ? level.color : 'transparent',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {level.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ──

export function AlignmentGauge(props: AlignmentGaugeProps) {
  const { variant = 'bar' } = props;

  switch (variant) {
    case 'circle':
      return <CircleGauge {...props} />;
    case 'level':
      return <LevelGauge {...props} />;
    case 'bar':
    default:
      return <BarGauge {...props} />;
  }
}

// Also export sub-components for direct use if needed
export { getValueColor, getValueLabel };

export default AlignmentGauge;
