// PrioritiesSection — Extracted from RoomSections.tsx
// Renders the pain priority cards grid for the prospect room.

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { TT_PAINS } from '../PainDiscoveryModule';
import { SectionReveal, PREMIUM_EASE } from '../RoomSections';

export interface PrioritiesSectionProps {
  selectedPains: string[];
  companyName: string;
  brand: string;
  painQuotes?: Record<string, string>;  // pain ID → prospect's own words
}

export function PrioritiesSection({
  selectedPains,
  companyName,
  brand,
  painQuotes = {},
}: PrioritiesSectionProps) {
  return (
    <div>
      <SectionReveal type="fade-up" delay={1 * 0.08} className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Your Priorities</p>
          <h2 className="mb-4 text-3xl font-bold text-zinc-900 sm:text-4xl">
            What We're Solving for {companyName}
          </h2>
          <p className="mx-auto max-w-xl text-base text-zinc-500">
            Based on our conversations, these are the key challenges we'll address together.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {selectedPains.map((painId, i) => {
            const pain = TT_PAINS.find(p => p.id === painId);
            if (!pain) return null;
            const Icon = pain.icon;
            // Prefer prospect's own quote → fall back to hardcoded social proof verbatim
            const prospectQuote = painQuotes[painId];
            const displayQuote = prospectQuote || pain.verbatim;
            const isProspectQuote = !!prospectQuote;
            return (
              <motion.div
                key={painId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: PREMIUM_EASE }}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${brand}12` }}>
                    <Icon size={18} style={{ color: brand }} />
                  </div>
                </div>
                <h3 className="font-bold text-zinc-900 mb-2">{pain.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{pain.description}</p>
                {displayQuote && (
                  <div className={`mt-3 border-l-2 pl-3 ${isProspectQuote ? 'border-violet-300' : ''}`} style={!isProspectQuote ? { borderColor: `${brand}40` } : {}}>
                    {isProspectQuote && (
                      <div className="flex items-center gap-1 mb-1">
                        <Quote size={9} className="text-violet-400" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-violet-400">In your words</span>
                      </div>
                    )}
                    <p className={`text-xs italic leading-relaxed ${isProspectQuote ? 'text-violet-600 font-medium' : 'text-zinc-400'}`}>
                      {displayQuote}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </SectionReveal>
    </div>
  );
}
