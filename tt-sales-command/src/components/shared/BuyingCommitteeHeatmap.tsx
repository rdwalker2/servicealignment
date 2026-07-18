import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { AccountView } from '../../data/signalBoardData';

interface PillarDef {
  id: string;
  name: string;
  regex: RegExp;
}

const PILLARS: PillarDef[] = [
  {
    id: 'dm',
    name: 'Decision Maker',
    regex: /(vp|vice president|chief|chro|head of (people|hr|human resources))/i,
  },
  {
    id: 'champ',
    name: 'Champion',
    regex: /(director|head).*talent|talent acquisition|ta\b|recruiting manager/i,
  },
  {
    id: 'user',
    name: 'End User',
    regex: /(recruiter|sourcer|talent (partner|specialist|advisor|coordinator))/i,
  },
  {
    id: 'tech',
    name: 'Tech / Ops',
    regex: /(cfo|finance|hris|it director|information tech|operations)/i,
  },
];

export default function BuyingCommitteeHeatmap({ account }: { account: AccountView }) {
  const assignedContactIds = new Set<string>();

  const pillarData = PILLARS.map(pillar => {
    const matches = account.contacts
      .filter(c => pillar.regex.test(c.title) && !assignedContactIds.has(c.email));
    const contact = matches[0];
    if (contact) assignedContactIds.add(contact.email);
    return { pillar, contact };
  });

  const coveredCount = pillarData.filter(p => p.contact).length;
  if (coveredCount === 0 && account.contacts.length <= 1) return null; // Nothing useful to show

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Key Contacts</h3>
        {account.contacts.length === 1 && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle size={10} /> Single-Threaded
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-1.5">
        {pillarData.map(({ pillar, contact }) => {
          if (contact) {
            return (
              <div key={pillar.id} className="relative px-2 py-2 rounded-lg border border-emerald-200/60 bg-emerald-50/20 flex flex-col items-center text-center">
                <CheckCircle2 size={10} className="text-emerald-400 absolute top-1 right-1" />
                <div className="text-[10px] font-semibold text-stone-800 line-clamp-1 mb-0.5" title={contact.name}>{contact.name}</div>
                <div className="text-[8px] font-medium text-stone-400 uppercase tracking-wide">
                  {pillar.name}
                </div>
              </div>
            );
          }

          return (
            <div key={pillar.id} className="px-2 py-2 rounded-lg border border-dashed border-stone-200 bg-stone-50/30 flex flex-col items-center text-center justify-center min-h-[48px]">
              <div className="text-[9px] font-medium text-stone-300">{pillar.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
