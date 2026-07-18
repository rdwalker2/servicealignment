import React from 'react';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ContactView, AccountView } from '../../data/signalBoardData';

interface PillarDef {
  id: string;
  name: string;
  regex: RegExp;
  searchTitle: string;
}

const PILLARS: PillarDef[] = [
  {
    id: 'dm',
    name: 'Decision Maker',
    regex: /(vp|vice president|chief|chro|head of (people|hr|human resources))/i,
    searchTitle: 'VP People OR CHRO OR Head of HR',
  },
  {
    id: 'champ',
    name: 'Champion',
    regex: /(director|head).*talent|talent acquisition|ta\b|recruiting manager/i,
    searchTitle: 'Director of Talent OR Head of Talent Acquisition',
  },
  {
    id: 'user',
    name: 'End User',
    regex: /(recruiter|sourcer|talent (partner|specialist|advisor|coordinator))/i,
    searchTitle: 'Recruiter OR Talent Sourcer',
  },
  {
    id: 'tech',
    name: 'Tech / Ops',
    regex: /(cfo|finance|hris|it director|information tech|operations)/i,
    searchTitle: 'HRIS OR HR Operations OR IT',
  },
];

export default function BuyingCommitteeHeatmap({ account }: { account: AccountView }) {
  const getLinkedInSearchUrl = (searchTitle: string) => {
    const query = `${account.companyName} ${searchTitle}`;
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
  };

  const getMatchedContacts = (pillar: PillarDef) => {
    return account.contacts.filter(c => pillar.regex.test(c.title));
  };

  const assignedContactIds = new Set<string>();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buying Committee Penetration</h3>
        {account.contacts.length === 1 && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle size={10} /> Single-Threaded
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {PILLARS.map(pillar => {
          // Find first unassigned contact that matches
          const matches = getMatchedContacts(pillar).filter(c => !assignedContactIds.has(c.email));
          const contact = matches[0];
          
          if (contact) {
            assignedContactIds.add(contact.email);
            const ini = contact.name.split(' ').map(n => n[0]).join('');
            const hasSignals = contact.signals.length > 0;
            
            return (
              <div key={pillar.id} className="relative p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/30 flex flex-col items-center text-center">
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold mb-2 shadow-sm relative" style={{ backgroundColor: contact.avatarColor }}>
                  {ini}
                  {hasSignals && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-violet-500 border border-white rounded-full" title="Active Signals" />
                  )}
                </div>
                <div className="text-[10px] font-bold text-slate-800 line-clamp-1 mb-0.5" title={contact.name}>{contact.name}</div>
                <div className="text-[8px] font-medium text-slate-500 uppercase tracking-wide bg-white px-1.5 py-0.5 rounded border border-slate-100 shadow-sm w-full truncate" title={contact.title}>
                  {pillar.name}
                </div>
              </div>
            );
          }

          // Missing State
          return (
            <div key={pillar.id} className="p-2.5 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center text-center justify-center min-h-[90px] group transition-colors hover:border-violet-300 hover:bg-violet-50/30">
              <div className="text-[9px] font-semibold text-slate-400 mb-2">{pillar.name}</div>
              <a 
                href={getLinkedInSearchUrl(pillar.searchTitle)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-[9px] font-semibold text-slate-500 shadow-sm hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all opacity-80 group-hover:opacity-100"
              >
                <Search size={10} /> Find
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
