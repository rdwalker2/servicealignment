import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ALL_CASE_STUDIES } from './SocialProofGrid';
import { supabase } from '../../lib/supabase';

/* ── Typography styles cycled across logo slots for visual variety ── */
const LOGO_STYLES = [
  'font-serif tracking-[0.25em] text-xl font-light',
  'font-serif italic text-2xl font-medium',
  'font-serif tracking-[0.3em] text-lg font-bold',
  'font-sans font-black italic tracking-tighter text-2xl uppercase',
  'font-sans font-bold tracking-tight text-xl uppercase',
  'font-serif tracking-[0.2em] text-xl font-semibold',
];

interface LogoBarProps {
  enabledStudyNames?: string[];
  selectedIndustry?: string | null;
  enabledProofCustomers?: string[];
}

export function LogoBar({ enabledStudyNames, selectedIndustry, enabledProofCustomers }: LogoBarProps) {
  // Async customer logos from Supabase
  const [customerLogos, setCustomerLogos] = useState<{ name: string; style: string }[]>([]);

  useEffect(() => {
    if (!enabledProofCustomers || enabledProofCustomers.length === 0) {
      setCustomerLogos([]);
      return;
    }
    supabase.from('customers').select('id, account_name').in('id', enabledProofCustomers).then(({ data }) => {
      if (data && data.length >= 3) {
        setCustomerLogos(data.slice(0, 6).map((r: any, i: number) => ({
          name: r.account_name,
          style: LOGO_STYLES[i % LOGO_STYLES.length],
        })));
      }
    });
  }, [enabledProofCustomers]);

  const logos = useMemo(() => {
    // Use async-loaded customer logos if available
    if (customerLogos.length >= 3) return customerLogos;

    // ── Fallback: case study logos ──
    const pool =
      enabledStudyNames && enabledStudyNames.length > 0
        ? ALL_CASE_STUDIES.filter((s) => enabledStudyNames.includes(s.name))
        : ALL_CASE_STUDIES;

    const ind = selectedIndustry && selectedIndustry !== 'none' ? selectedIndustry : null;

    let ordered: typeof pool;
    if (ind) {
      const matched = pool.filter((s) => s.industries.includes(ind));
      const rest = pool.filter((s) => !matched.includes(s));
      ordered = [...matched, ...rest];
    } else {
      const smb = pool.filter((s) => s.smbFriendly);
      const ent = pool.filter((s) => !s.smbFriendly);
      ordered = [...smb, ...ent];
    }

    return ordered.slice(0, 6).map((study, i) => ({
      name: study.name,
      style: LOGO_STYLES[i % LOGO_STYLES.length],
    }));
  }, [enabledStudyNames, selectedIndustry, customerLogos]);

  if (logos.length === 0) return null;

  return (
    <div className="w-full border-b border-zinc-100 bg-white py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-60 grayscale transition-all hover:grayscale-0">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`text-zinc-800 ${logo.style}`}
            >
              {logo.name}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use `LogoBar` instead — kept for backwards compatibility */
export const HospitalityLogos = LogoBar;
