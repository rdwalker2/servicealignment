import React from 'react';
import { Info, AlertTriangle, ShieldAlert, CheckCircle2, MessageSquareText } from 'lucide-react';

export function DocHeader({ title, subtitle, stage }: { title: string; subtitle?: string; stage?: string }) {
  return (
    <div className="mb-12 pb-8 border-b border-stone-200/60">
      {stage && (
        <div className="inline-block px-3 py-1 rounded bg-stone-100 text-stone-500 border border-stone-200 text-[10px] font-bold tracking-[0.2em] uppercase mb-5">
          {stage}
        </div>
      )}
      <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-stone-900 pb-1">
        {title}
      </h1>
      {subtitle && <p className="text-lg text-stone-500 mt-3 font-medium max-w-3xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="text-2xl font-bold text-stone-800 mb-6 border-b border-stone-100 pb-3">
        {title}
      </h2>
      <div className="space-y-5 text-stone-700 leading-relaxed text-[15px]">
        {children}
      </div>
    </section>
  );
}

export function Callout({ type, title, children }: { type: 'info' | 'warning' | 'rule' | 'success'; title: string; children: React.ReactNode }) {
  const accentColors = {
    info: 'border-stone-300',
    warning: 'border-amber-300',
    rule: 'border-stone-800',
    success: 'border-emerald-300',
  };

  const iconColors = {
    info: 'text-stone-400',
    warning: 'text-amber-500',
    rule: 'text-stone-800',
    success: 'text-emerald-500',
  };

  const icons = {
    info: <Info size={16} className={`${iconColors[type]} mt-0.5 shrink-0`} />,
    warning: <AlertTriangle size={16} className={`${iconColors[type]} mt-0.5 shrink-0`} />,
    rule: <ShieldAlert size={16} className={`${iconColors[type]} mt-0.5 shrink-0`} />,
    success: <CheckCircle2 size={16} className={`${iconColors[type]} mt-0.5 shrink-0`} />,
  };

  return (
    <div className={`my-8 flex gap-4 p-5 rounded-lg bg-stone-50 border-l-[3px] border-y border-r border-y-stone-100 border-r-stone-100 ${accentColors[type]}`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div>
        <h4 className="font-bold text-[11px] text-stone-800 uppercase tracking-widest mb-1.5">{title}</h4>
        <div className="text-[14px] leading-relaxed text-stone-600">{children}</div>
      </div>
    </div>
  );
}

export function ScriptBlock({ label, children }: { label?: string; children: React.ReactNode }) {
  const content = typeof children === 'string'
    ? children.split('\n').map(l => l.trim()).filter(Boolean).join('\n\n')
    : children;

  return (
    <div className="my-4 pl-4 border-l-[3px] border-stone-300 py-0.5">
      {label && (
        <div className="flex items-center gap-2 mb-2">
          <MessageSquareText size={14} className="text-stone-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
            {label}
          </span>
        </div>
      )}
      <div className="text-[15px] leading-relaxed text-stone-800 whitespace-pre-wrap font-medium">
        {content}
      </div>
    </div>
  );
}
