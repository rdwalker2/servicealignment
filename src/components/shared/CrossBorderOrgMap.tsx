import React from 'react';
import { ArrowDownRight, Globe, AlertTriangle, Users, Target, Network } from 'lucide-react';
import type { GlobalExpansionMatch, OrgContact, DecisionStructure } from '../../data/globalExpansionData';

function ContactNode({ contact, isGlobal }: { contact: OrgContact; isGlobal: boolean }) {
  const ini = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2);
  
  return (
    <div className={`p-2.5 rounded-lg border flex flex-col items-center text-center w-full shadow-sm bg-white ${isGlobal ? 'border-emerald-200 shadow-emerald-100' : 'border-indigo-200 shadow-indigo-100'}`}>
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold mb-1.5"
        style={{ backgroundColor: contact.avatarColor }}
      >
        {ini}
      </div>
      <div className="text-[11px] font-bold text-stone-900 truncate w-full" title={contact.name}>{contact.name}</div>
      <div className="text-[9px] font-medium text-stone-500 truncate w-full mt-0.5 uppercase tracking-wide bg-stone-50 px-1 py-[2px] rounded border border-stone-100" title={contact.title}>
        {contact.title}
      </div>
    </div>
  );
}

export default function CrossBorderOrgMap({ match }: { match: GlobalExpansionMatch }) {
  // Decision Badge
  let badgeColor = 'bg-stone-100 text-stone-600 border-stone-200';
  let badgeIcon = <AlertTriangle size={12} />;
  let decisionDesc = 'Decision making structure is currently unknown. Recommend multi-threading both HQ and US.';
  
  if (match.decisionStructure === 'Centralized') {
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    badgeIcon = <Globe size={12} />;
    decisionDesc = 'HQ drives procurement. Sell the global expansion vision to the Parent HQ to mandate US adoption.';
  } else if (match.decisionStructure === 'Localized') {
    badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    badgeIcon = <Target size={12} />;
    decisionDesc = 'US team holds their own budget. Sell directly to the US Target using the Parent HQ as a reference.';
  } else if (match.decisionStructure === 'Hybrid') {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    badgeIcon = <Users size={12} />;
    decisionDesc = 'US requires HQ approval, but drives evaluation. Multi-thread both simultaneously.';
  }

  return (
    <div className="rounded-xl border border-stone-200/60 p-4 bg-stone-50/50">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200/60">
        <div className="flex items-center gap-1.5">
          <Network size={14} className="text-stone-400" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Cross-Border Org Map</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${badgeColor}`}>
          {badgeIcon}
          {match.decisionStructure} Buying
        </div>
      </div>
      
      <p className="text-[11px] text-stone-500 mb-5 italic">{decisionDesc}</p>
      
      {/* Visual Map */}
      <div className="relative">
        {/* Global Level */}
        <div className="mb-6 relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[16px]">{match.rowCountryFlag}</span>
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Global HQ Sponsors</div>
          </div>
          
          {match.globalSponsors.length > 0 ? (
            <div className={`grid gap-2 ${match.globalSponsors.length === 1 ? 'grid-cols-1 w-1/2 mx-auto' : 'grid-cols-2'}`}>
              {match.globalSponsors.map((contact, i) => (
                <ContactNode key={i} contact={contact} isGlobal={true} />
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 text-[10px] font-medium bg-white">
              No Global Sponsors Identified
            </div>
          )}
        </div>

        {/* Connection Line */}
        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-0">
          <div className="w-[1px] h-10 bg-stone-200"></div>
          <ArrowDownRight size={14} className="text-stone-300 absolute bg-stone-50" />
        </div>

        {/* Local Level */}
        <div className="relative mt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[16px]">🇺🇸</span>
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">US Local Champions</div>
          </div>
          
          {match.localChampions.length > 0 ? (
            <div className={`grid gap-2 ${match.localChampions.length === 1 ? 'grid-cols-1 w-1/2 mx-auto' : 'grid-cols-2'}`}>
              {match.localChampions.map((contact, i) => (
                <ContactNode key={i} contact={contact} isGlobal={false} />
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 text-[10px] font-medium bg-white">
              No US Champions Identified
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
