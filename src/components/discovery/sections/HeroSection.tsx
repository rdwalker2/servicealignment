// HeroSection — Extracted from RoomSections.tsx
// Renders the hero banner with company name, first pain, stakeholder greeting, and platform stats.

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export interface HeroSectionProps {
  companyName: string;
  brand: string;
  firstPain: { title: string; id: string; icon: React.ElementType; description: string } | null;
  extraPainCount: number;
  firstStakeholderName: string | null;
  stakeholders: { id: string; name: string; role: string }[];
  customMessage?: string;
  repName?: string;
  // ── Config overrides ──
  customHeadline?: string;
  customBadge?: string;
  showPlatformStats?: boolean;
}

export function HeroSection({
  companyName,
  brand,
  firstPain,
  extraPainCount,
  firstStakeholderName,
  stakeholders,
  customMessage,
  repName,
  customHeadline,
  customBadge,
  showPlatformStats = true,
}: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${brand}08 0%, white 100%)` }}>
      <div className="pointer-events-none absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ backgroundColor: `${brand}08` }} />
      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-20 pt-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
          style={{ borderColor: `${brand}30`, backgroundColor: `${brand}08` }}
        >
          <Sparkles size={14} style={{ color: brand }} />
          <span className="text-xs font-semibold" style={{ color: brand }}>{customBadge || 'Interactive Experience'}</span>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-6 text-sm font-bold uppercase tracking-[0.3em] opacity-80" style={{ color: brand }}>
          Prepared for {companyName}
        </motion.h2>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
          {customHeadline ? (
            <span dangerouslySetInnerHTML={{ __html: customHeadline.replace(companyName, `<span class="bg-clip-text text-transparent" style="background-image: linear-gradient(135deg, ${brand}, ${brand}aa)">${companyName}</span>`) }} />
          ) : firstPain ? (
            <>
              Solving{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${brand}, ${brand}aa)` }}>
                {firstPain.title}
              </span>
              {' '}for {companyName}
            </>
          ) : (
            <>
              Your Path to{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${brand}, ${brand}aa)` }}>
                Modern Talent Acquisition
              </span>
            </>
          )}
        </motion.h1>
        {extraPainCount > 0 && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-2 text-sm font-semibold" style={{ color: brand }}>
            + {extraPainCount} more {extraPainCount === 1 ? 'priority' : 'priorities'}
          </motion.p>
        )}
        {firstStakeholderName && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-4 text-base text-zinc-500">
            Built for <strong className="text-zinc-700">{firstStakeholderName}</strong> and the <strong className="text-zinc-700">{companyName}</strong> team
          </motion.p>
        )}
        {/* Stakeholder greeting */}
        {stakeholders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-4 flex flex-wrap justify-center gap-2">
            {stakeholders.map(s => {
              if (!s.name) return null;
              // Show title if available, otherwise show a prospect-safe role label
              const displayRole = s.title || prospectSafeRole(s.role);
              return (
                <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: `${brand}40`, backgroundColor: `${brand}08`, color: brand }}>
                  👋 {s.name}{displayRole ? ` · ${displayRole}` : ''}
                </span>
              );
            })}
          </motion.div>
        )}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-500">
          {customMessage || `This interactive blueprint maps out exactly how Service Alignment will solve your core hiring challenges and generate quantifiable ROI for ${companyName}.`}
        </motion.p>
        {repName && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 text-sm text-zinc-400">
            Prepared by <strong className="text-zinc-600">{repName}</strong>
          </motion.p>
        )}
        {/* Platform Stats */}
        {showPlatformStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {[
              { value: '845K+', label: 'Successful Hires' },
              { value: '200K+', label: 'Active Recruiters' },
              { value: '13,000+', label: 'Companies' },
              { value: '400+', label: 'Integrations' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl font-black text-zinc-900" style={{ color: i === 0 ? brand : undefined }}>
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-zinc-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
