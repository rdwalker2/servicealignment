import React from 'react';
import { Info, AlertTriangle, ShieldAlert, CheckCircle2, Terminal } from 'lucide-react';

export function DocHeader({ title, subtitle, stage }: { title: string; subtitle?: string; stage?: string }) {
  return (
    <div className="mb-10 pb-6 border-b border-stone-200">
      {stage && (
        <span className="inline-flex items-center px-2 py-1 rounded bg-[#FF2A7F]/10 text-[#FF2A7F] text-[11px] font-bold tracking-wide uppercase mb-3">
          {stage}
        </span>
      )}
      <h1 className="text-3xl font-bold text-stone-900 tracking-tight leading-tight">{title}</h1>
      {subtitle && <p className="text-lg text-stone-500 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
}

export function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">{title}</h2>
      <div className="space-y-4 text-stone-600 leading-relaxed text-[15px]">
        {children}
      </div>
    </section>
  );
}

export function Callout({ type, title, children }: { type: 'info' | 'warning' | 'rule' | 'success'; title: string; children: React.ReactNode }) {
  const accentColors = {
    info: 'border-stone-300',
    warning: 'border-amber-400',
    rule: 'border-[#FF2A7F]',
    success: 'border-emerald-400',
  };

  const iconColors = {
    info: 'text-stone-400',
    warning: 'text-amber-400',
    rule: 'text-[#FF2A7F]/60',
    success: 'text-emerald-400',
  };

  const icons = {
    info: <Info size={14} className={`${iconColors[type]} mt-0.5 shrink-0`} />,
    warning: <AlertTriangle size={14} className={`${iconColors[type]} mt-0.5 shrink-0`} />,
    rule: <ShieldAlert size={14} className={`${iconColors[type]} mt-0.5 shrink-0`} />,
    success: <CheckCircle2 size={14} className={`${iconColors[type]} mt-0.5 shrink-0`} />,
  };

  return (
    <div className={`my-6 flex gap-3 pl-4 py-3 pr-3 border-l-[3px] ${accentColors[type]}`}>
      {icons[type]}
      <div>
        <h4 className="font-semibold text-[12px] uppercase tracking-wider mb-1 text-stone-400">{title}</h4>
        <div className="text-[14px] leading-relaxed text-stone-600">{children}</div>
      </div>
    </div>
  );
}

export function ScriptBlock({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="my-5 border-l-[3px] border-[#FF2A7F]/40 pl-5 py-4">
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2 block">
          {label}
        </span>
      )}
      <div className="font-mono text-[13px] leading-[1.75] text-stone-700 whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
}
