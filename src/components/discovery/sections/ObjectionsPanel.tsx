// ObjectionsPanel — Read-only display of deal objections and demo reactions
// Renders structured intel from DiscoverySession for the prospect room.

import { Shield, Sparkles, AlertTriangle, CheckCircle, MessageCircle, HelpCircle } from 'lucide-react';
import type { DiscoverySession } from '../../../lib/discoveryDatabase';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  resolved: { label: 'Handled', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  open:     { label: 'Open',    bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  deferred: { label: 'Escalated', bg: 'bg-rose-50',  text: 'text-rose-700',    dot: 'bg-rose-500' },
};

const CATEGORY_LABELS: Record<string, string> = {
  price: 'Pricing',
  timing: 'Timing',
  competition: 'Competition',
  internal: 'Internal',
  technical: 'Technical',
  'change-mgmt': 'Change Mgmt',
  other: 'Other',
};

export default function ObjectionsPanel({ session }: { session: DiscoverySession }) {
  const reactions = session.demo_reactions;
  const objections = session.objections ?? [];
  const hasReactions = !!reactions;
  const hasObjections = objections.length > 0;

  return (
    <div className="space-y-8">
      {/* ─── Demo Intel ─── */}
      {hasReactions && (
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <Sparkles size={16} className="text-violet-500" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500">Demo Intel</h3>
          </div>

          {/* Aha Moment callout */}
          {reactions.aha_moment && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
              <Sparkles size={18} className="mt-0.5 shrink-0 text-amber-500" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Aha Moment</p>
                <p className="text-sm font-medium text-amber-900 leading-relaxed">{reactions.aha_moment}</p>
              </div>
            </div>
          )}

          {/* Positive reactions */}
          {reactions.positive_reactions.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-stone-400 flex items-center gap-1.5">
                <CheckCircle size={12} className="text-emerald-400" />
                Positive Reactions
              </p>
              <div className="flex flex-wrap gap-2">
                {reactions.positive_reactions.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Concerns */}
          {reactions.concerns.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-stone-400 flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-amber-400" />
                Concerns Raised
              </p>
              <div className="flex flex-wrap gap-2">
                {reactions.concerns.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Questions asked */}
          {reactions.questions_asked.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-stone-400 flex items-center gap-1.5">
                <HelpCircle size={12} className="text-blue-400" />
                Questions Asked
              </p>
              <ol className="space-y-1.5 pl-5 list-decimal">
                {reactions.questions_asked.map((q, i) => (
                  <li key={i} className="text-sm text-stone-600 leading-relaxed">{q}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* ─── Objections ─── */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100">
            <Shield size={16} className="text-stone-500" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500">Objections</h3>
          {hasObjections && (
            <span className="ml-auto text-xs font-medium text-stone-400">
              {objections.filter(o => o.status === 'resolved').length}/{objections.length} handled
            </span>
          )}
        </div>

        {hasObjections ? (
          <div className="space-y-3">
            {objections.map((obj) => {
              const cfg = STATUS_CONFIG[obj.status] ?? STATUS_CONFIG.open;
              return (
                <div
                  key={obj.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-4"
                >
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>

                    {/* Category tag */}
                    {obj.category && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                        {CATEGORY_LABELS[obj.category] ?? obj.category}
                      </span>
                    )}

                    {/* Raised by */}
                    {obj.raised_by && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-stone-400">
                        <MessageCircle size={10} />
                        {obj.raised_by}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-stone-800 leading-relaxed">{obj.text}</p>

                  {obj.response && (
                    <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">{obj.response}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-stone-400">No objections tracked yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
