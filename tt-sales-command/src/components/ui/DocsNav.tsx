import { useState } from 'react';
import { ChevronDown, ChevronRight, Shield, Phone, Mail, FileText, Waves, BookOpen, Stethoscope } from 'lucide-react';
import { BATTLECARDS } from '../../data/battlecards';

type EnablementTab = 'battlecards' | 'setting-the-meeting' | 'outreach-cadence' | 'discovery-sheets' | 'cold-call-playbook' | 'rep-workbook' | 'operational-playbooks' | 'pipeline-doctor';

interface DocsNavProps {
  activeTab: EnablementTab;
  activeBattlecardId: string;
  onTabChange: (tab: EnablementTab) => void;
  onBattlecardChange: (id: string) => void;
}

function winRateColor(rate: number) {
  if (rate >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-500', label: 'High' };
  if (rate >= 65) return { bg: 'bg-amber-500', text: 'text-amber-500', label: 'Med' };
  return { bg: 'bg-rose-500', text: 'text-rose-500', label: 'Low' };
}

export function DocsNav({ activeTab, activeBattlecardId, onTabChange, onBattlecardChange }: DocsNavProps) {
  const [battlecardsOpen, setBattlecardsOpen] = useState(true);

  return (
    <nav className="h-full flex flex-col bg-white border-r border-stone-200/60 overflow-y-auto" style={{ width: 224, minWidth: 224 }}>

      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#FF2A7F] to-[#c0006a] flex items-center justify-center shadow-sm">
            <Shield size={12} className="text-white" />
          </div>
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Enablement</span>
        </div>
        <p className="text-[10px] text-stone-400 ml-8">Sales Intelligence Hub</p>
      </div>

      <div className="flex-1 py-3 px-2 space-y-0.5">

        {/* ── SECTION LABEL: DIAGNOSE ── */}
        <p className="px-2.5 pt-1 pb-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Diagnose</p>

        {/* Pipeline Doctor */}
        <button
          onClick={() => onTabChange('pipeline-doctor')}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all group ${
            activeTab === 'pipeline-doctor'
              ? 'bg-[#FF2A7F]/8 text-stone-900'
              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
          }`}
        >
          <Stethoscope size={13} className={activeTab === 'pipeline-doctor' ? 'text-[#FF2A7F]' : 'text-stone-400 group-hover:text-stone-600'} />
          <span className="flex-1 text-left">Pipeline Doctor</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">1 critical</span>
        </button>

        {/* ── DIVIDER ── */}
        <div className="border-t border-stone-100 my-2 mx-2" />

        {/* ── SECTION LABEL: PLAYBOOKS ── */}
        <p className="px-2.5 pt-1 pb-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Playbooks</p>

        {/* Cold Call Playbook */}
        <button
          onClick={() => onTabChange('cold-call-playbook')}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all group ${
            activeTab === 'cold-call-playbook'
              ? 'bg-[#FF2A7F]/8 text-stone-900'
              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
          }`}
        >
          <Waves size={13} className={activeTab === 'cold-call-playbook' ? 'text-[#FF2A7F]' : 'text-stone-400 group-hover:text-stone-600'} />
          <span className="flex-1 text-left">Cold Call Playbook</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">3 Waves</span>
        </button>

        {/* Operational Playbooks */}
        <button
          onClick={() => onTabChange('operational-playbooks')}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all group ${
            activeTab === 'operational-playbooks'
              ? 'bg-[#FF2A7F]/8 text-stone-900'
              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
          }`}
        >
          <BookOpen size={13} className={activeTab === 'operational-playbooks' ? 'text-[#FF2A7F]' : 'text-stone-400 group-hover:text-stone-600'} />
          <span className="flex-1 text-left">Solution Workflows</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600">New</span>
        </button>

        {/* Rep Workbook */}
        <button
          onClick={() => onTabChange('rep-workbook')}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all group ${
            activeTab === 'rep-workbook'
              ? 'bg-[#FF2A7F]/8 text-stone-900'
              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
          }`}
        >
          <BookOpen size={13} className={activeTab === 'rep-workbook' ? 'text-[#FF2A7F]' : 'text-stone-400 group-hover:text-stone-600'} />
          <span className="flex-1 text-left">Rep Workbook</span>
        </button>

        {/* ── DIVIDER ── */}
        <div className="border-t border-stone-100 my-2 mx-2" />

        {/* ── SECTION LABEL: COMPETITIVE ── */}
        <p className="px-2.5 pb-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Competitive</p>

        {/* ── BATTLECARDS SECTION ── */}
        <button
          onClick={() => { setBattlecardsOpen(o => !o); onTabChange('battlecards'); }}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all group ${
            activeTab === 'battlecards'
              ? 'bg-[#FF2A7F]/8 text-stone-900'
              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
          }`}
        >
          <Shield size={13} className={activeTab === 'battlecards' ? 'text-[#FF2A7F]' : 'text-stone-400 group-hover:text-stone-600'} />
          <span className="flex-1 text-left">Battlecards</span>
          <span className="text-[10px] font-medium text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">
            {BATTLECARDS.length}
          </span>
          {battlecardsOpen
            ? <ChevronDown size={12} className="text-stone-400 shrink-0" />
            : <ChevronRight size={12} className="text-stone-400 shrink-0" />
          }
        </button>

        {/* Competitor list */}
        {battlecardsOpen && (
          <div className="ml-2 pl-3 border-l border-stone-150 space-y-0.5 py-1">
            {BATTLECARDS.map(bc => {
              const isActive = activeTab === 'battlecards' && activeBattlecardId === bc.id;
              const wr = winRateColor(bc.winRate);
              return (
                <button
                  key={bc.id}
                  onClick={() => { onTabChange('battlecards'); onBattlecardChange(bc.id); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-all group ${
                    isActive
                      ? 'bg-[#FF2A7F]/8 text-stone-900 font-semibold'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                  }`}
                >
                  {/* Left accent bar */}
                  <span className={`w-0.5 h-4 rounded-full shrink-0 transition-all ${isActive ? 'bg-[#FF2A7F]' : 'bg-transparent group-hover:bg-stone-300'}`} />

                  {/* Logo badge */}
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                    isActive ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                  }`}>
                    {bc.logoText.length > 2 ? bc.logoText[0] : bc.logoText}
                  </span>

                  <span className="flex-1 text-left truncate">{bc.competitorName}</span>

                  {/* Win rate dot */}
                  <span className={`flex items-center gap-1 text-[10px] font-semibold tabular-nums shrink-0 ${wr.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${wr.bg}`} />
                    {bc.winRate}%
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Divider ── */}
        <div className="border-t border-stone-100 my-2 mx-2" />

        {/* ── SECTION LABEL: PROCESS ── */}
        <p className="px-2.5 pb-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Process</p>

        {/* ── OTHER ENABLEMENT SECTIONS ── */}
        {([
          { id: 'setting-the-meeting' as EnablementTab, label: 'Setting Meetings', icon: Phone },
          { id: 'outreach-cadence' as EnablementTab, label: 'Outreach Cadence', icon: Mail },
          { id: 'discovery-sheets' as EnablementTab, label: 'Discovery Sheets', icon: FileText },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all group ${
              activeTab === id
                ? 'bg-[#FF2A7F]/8 text-stone-900'
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
            }`}
          >
            <Icon size={13} className={activeTab === id ? 'text-[#FF2A7F]' : 'text-stone-400 group-hover:text-stone-600'} />
            <span className="flex-1 text-left">{label}</span>
          </button>
        ))}

        {/* ── Divider ── */}
        <div className="border-t border-stone-100 my-2 mx-2" />

        {/* ── Win rate legend ── */}
        <div className="px-2.5 py-2">
          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">Win Rate Key</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] text-stone-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> 80%+ — Low threat
            </div>
            <div className="flex items-center gap-2 text-[10px] text-stone-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" /> 65–79% — Med threat
            </div>
            <div className="flex items-center gap-2 text-[10px] text-stone-500">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" /> &lt;65% — High threat
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
