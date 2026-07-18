import React from 'react';
import { Swords, CheckCircle2, ShieldAlert, Zap, Quote, ExternalLink } from 'lucide-react';
import { COMPETITOR_TALK_TRACKS } from '../../data/competitorTalkTracks';

interface Props {
  selectedATS: string | null;
}

export function CompetitorBattlecardTab({ selectedATS }: Props) {
  if (!selectedATS || selectedATS === 'none' || selectedATS === 'unknown' || selectedATS === 'other') {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-zinc-500">
        <Swords size={32} className="mb-3 text-zinc-300" />
        <h3 className="mb-1 text-xs font-bold text-zinc-700">No Competitor Selected</h3>
        <p className="text-[10px] leading-relaxed">
          Select an incumbent Provider in the D1 section (Current Solution) to unlock live battlecards and trap questions.
        </p>
      </div>
    );
  }

  const track = COMPETITOR_TALK_TRACKS[selectedATS];

  if (!track) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-zinc-500">
        <ShieldAlert size={32} className="mb-3 text-zinc-300" />
        <h3 className="mb-1 text-xs font-bold text-zinc-700">No Playbook Available</h3>
        <p className="text-[10px] leading-relaxed">
          We don't have a standardized battlecard for <strong>{selectedATS}</strong> yet. 
          Focus on general pains like cost-per-hire and manual screening.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-100 text-rose-600">
            <Swords size={12} />
          </div>
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-800">
            vs. {selectedATS}
          </h2>
        </div>
        <p className="text-[11px] font-medium text-rose-700 italic border-l-2 border-rose-300 pl-2 mt-2">
          {track.displacementAngle}
        </p>
      </div>

      {/* Discovery Questions (Traps) */}
      <section>
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
          <Zap size={11} className="text-amber-500" /> Trap Questions
        </h3>
        <div className="space-y-2">
          {track.discoveryQuestions.map((q, idx) => (
            <div key={idx} className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm hover:border-amber-300 transition-colors">
              <p className="text-[11px] font-semibold text-zinc-800 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Objections & Rebuttals */}
      <section>
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
          <ShieldAlert size={11} className="text-emerald-500" /> Landmines & Rebuttals
        </h3>
        <div className="space-y-3">
          {track.objections.map((obj, idx) => (
            <div key={idx} className="rounded-lg border border-emerald-100 bg-emerald-50/30 overflow-hidden">
              <div className="bg-white px-3 py-2 border-b border-emerald-100">
                <p className="text-[11px] font-bold text-zinc-700">" {obj.objection} "</p>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-[10px] leading-relaxed text-emerald-800 font-medium">
                  <span className="font-bold uppercase tracking-wider text-emerald-600 mr-1 text-[9px]">Rebuttal:</span> 
                  {obj.rebuttal}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Name Drop */}
      <section>
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
          <Quote size={11} className="text-blue-500" /> The Name Drop
        </h3>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-[11px] font-medium leading-relaxed text-blue-900 italic">
            "{track.nameDrop}"
          </p>
        </div>
      </section>
    </div>
  );
}
