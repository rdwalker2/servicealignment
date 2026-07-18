import { useState } from 'react';
import { ChevronDown, ChevronRight, Shield, Phone, Mail, FileText, Waves, BookOpen, Stethoscope } from 'lucide-react';


type EnablementTab = 'setting-the-meeting' | 'outreach-cadence' | 'discovery-sheets' | 'cold-call-playbook' | 'operational-playbooks' | 'pipeline-doctor';

interface DocsNavProps {
  activeTab: EnablementTab;
  onTabChange: (tab: EnablementTab) => void;
}

export function DocsNav({ activeTab, onTabChange }: DocsNavProps) {


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

      </div>
    </nav>
  );
}
