import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CloudLightning, SearchX, Users2, 
  Megaphone, Magnet, RefreshCw, ArrowRight 
} from 'lucide-react';

export interface HopePillar {
  title: string;
  subtitle: string;
}

const DEFAULT_HOPE_PILLARS: HopePillar[] = [
  {
    title: 'Spray & Pray',
    subtitle: 'Relying heavily on job board postings and waiting for active candidates.',
  },
  {
    title: 'Cold Outreach',
    subtitle: 'High-volume, low-conversion InMail campaigns with no warmup.',
  },
  {
    title: 'Agency Reliance',
    subtitle: 'Paying 20%+ fees for external recruiters due to internal bottlenecks.',
  }
];

const HOPE_ICONS = [CloudLightning, SearchX, Users2];
const HOPE_COLORS = ['#ef4444', '#f97316', '#eab308'];

const DESIGN_PILLARS = [
  {
    title: 'Captivate',
    subtitle: 'Compelling Employer Brand that attracts top talent organically.',
    icon: Megaphone,
    color: '#ec4899', // pink (teamtailor brand)
  },
  {
    title: 'Capture',
    subtitle: 'Seamless, consumer-grade application process that prevents drop-off.',
    icon: Magnet,
    color: '#a855f7', // purple
  },
  {
    title: 'Convert',
    subtitle: 'Automated CRM nurturing that turns passive talent into hires.',
    icon: RefreshCw,
    color: '#3b82f6', // blue
  }
];

interface Props {
  customHopePillars?: HopePillar[];
  paradigmQuotes?: Record<string, string>;
}

export function ParadigmShift({ customHopePillars, paradigmQuotes }: Props = {}) {
  const [activeSide, setActiveSide] = useState<'hope' | 'design'>('hope');
  const quoteValues = paradigmQuotes ? Object.values(paradigmQuotes) : [];

  // Use custom pillars if provided and non-empty, else defaults
  const hopePillars = customHopePillars && customHopePillars.length > 0
    ? customHopePillars
    : DEFAULT_HOPE_PILLARS;

  const circleContainer = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto py-16 px-6">
      <div className="text-center mb-16">
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4"
        >
          The Paradigm Shift
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight"
        >
          Hope vs. Design
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto"
        >
          Stop relying on luck and unpredictable methods. Transition to a scalable, repeatable system that puts you in control.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
        
        {/* Left Side: HOPE */}
        <motion.div 
          className={`relative rounded-3xl p-8 transition-all duration-700 ${activeSide === 'hope' ? 'bg-zinc-100 ring-1 ring-zinc-300' : 'opacity-40 grayscale blur-[2px]'}`}
          onMouseEnter={() => setActiveSide('hope')}
        >
          <h3 className="text-2xl font-black text-zinc-400 mb-8 text-center uppercase tracking-widest">
            Hope
          </h3>
          <motion.div 
            variants={circleContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {hopePillars.map((pillar, i) => {
              const Icon = HOPE_ICONS[i % HOPE_ICONS.length];
              const color = HOPE_COLORS[i % HOPE_COLORS.length];
              return (
                <motion.div key={i} variants={itemAnim} className="flex gap-4 p-4 rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full shrink-0" style={{ backgroundColor: `${color}20`, color }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-lg">{pillar.title}</h4>
                    <p className="text-sm text-zinc-500 mt-1 leading-snug">{pillar.subtitle}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          
          <div className="mt-8 text-center border-t border-zinc-200 pt-6">
            <p className="text-sm font-bold text-red-500 uppercase tracking-wider">High Effort · Low Predictability</p>
          </div>

          {/* Prospect quote — Hope side */}
          {quoteValues[0] && (
            <div className="mt-3 px-3 py-2 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg">
              <p className="text-xs text-amber-800 italic leading-relaxed">
                "{quoteValues[0]}"
              </p>
              <span className="text-[10px] text-amber-600 font-medium mt-1 block">— Prospect</span>
            </div>
          )}
        </motion.div>

        {/* Center: Arrow */}
        <div className="hidden md:flex justify-center items-center">
          <motion.div 
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center shadow-xl z-10"
          >
            <ArrowRight size={28} className="text-white" />
          </motion.div>
        </div>

        {/* Right Side: DESIGN */}
        <motion.div 
          className={`relative rounded-3xl p-8 transition-all duration-700 ${activeSide === 'design' ? 'bg-zinc-900 shadow-2xl ring-2 ring-pink-500/50' : 'opacity-50 blur-[1px]'}`}
          onMouseEnter={() => setActiveSide('design')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-blue-500/5 rounded-3xl" />
          <h3 className="relative text-2xl font-black text-white mb-8 text-center uppercase tracking-widest">
            Design
          </h3>
          <motion.div 
            variants={circleContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative space-y-4"
          >
            {DESIGN_PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div key={i} variants={itemAnim} className="flex gap-4 p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: pillar.color, color: 'white' }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{pillar.title}</h4>
                    <p className="text-sm text-zinc-400 mt-1 leading-snug">{pillar.subtitle}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="relative mt-8 text-center border-t border-zinc-800 pt-6">
            <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Predictable · Scalable · Repeatable</p>
          </div>

          {/* Prospect quote — Design side */}
          {quoteValues[1] && (
            <div className="mt-3 px-3 py-2 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg">
              <p className="text-xs text-amber-800 italic leading-relaxed">
                "{quoteValues[1]}"
              </p>
              <span className="text-[10px] text-amber-600 font-medium mt-1 block">— Prospect</span>
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
}
