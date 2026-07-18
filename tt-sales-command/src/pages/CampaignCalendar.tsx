import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Search, ArrowRight, PlayCircle, BarChart3, Users, FileText, Settings, Video, Phone, Mail, Building2, TrendingUp, AlertTriangle, Database, PlusCircle } from 'lucide-react';

const CAMPAIGNS = [
  { id: 1, name: 'ADP Displacement', date: 'June 2, 2026', status: 'live', type: 'Live campaign', color: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  { id: 2, name: 'Rippling Displacement', date: 'June 30, 2026', status: 'active', type: 'End of Q2 renewal cycles', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { id: 3, name: 'Dayforce Displacement', date: 'July 28, 2026', status: 'upcoming', type: 'Fall hiring preparation', color: 'bg-teal-100 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  { id: 4, name: 'HiBob Displacement', date: 'August 25, 2026', status: 'upcoming', type: 'Mid-market scaling focus', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { id: 5, name: 'School Districts', date: 'September 22, 2026', status: 'upcoming', type: 'ASPA Conference alignment', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { id: 6, name: 'BambooHR Displacement', date: 'October 20, 2026', status: 'upcoming', type: 'End of year strategic review', color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' }
];

const BACKLOG = [
  'Lever', 'Paylocity', 'No ATS', 'Apptegy Customers', 'Retailers', 'Five Guys Franchisees', '100 Miles Proximity'
];

const SLA_STEPS = [
  { days: -35, title: "Marketing Collateral", desc: "Explainer videos, screenshots & landing pages built.", icon: Video, color: "text-violet-600 bg-violet-100 border-violet-200", status: "completed" },
  { days: -21, title: "Cadence & Scripts", desc: "AE Tiger Team runs SFDC reports, drafts scripts.", icon: FileText, color: "text-blue-600 bg-blue-100 border-blue-200", status: "completed" },
  { days: -13, title: "SFDC Sync & Ads", desc: "RevOps adds accounts. Marketing builds ad list.", icon: Users, color: "text-teal-600 bg-teal-100 border-teal-200", status: "completed" },
  { days: -7, title: "Ads Live & Teardowns", desc: "Performance ads launch. Deal teardowns on wins.", icon: TrendingUp, color: "text-emerald-600 bg-emerald-100 border-emerald-200", status: "active" },
  { days: -1, title: "Upload Cadence", desc: "Final cadence uploaded & activated in Salesloft.", icon: Settings, color: "text-amber-600 bg-amber-100 border-amber-200", status: "upcoming" },
  { days: 0, title: "Go Live", desc: "First emails sent out (Tuesday-Thursday target).", icon: PlayCircle, color: "text-rose-600 bg-rose-100 border-rose-200", status: "upcoming", isGoLive: true },
];

export default function CampaignCalendar() {
  const [activeCampaignId, setActiveCampaignId] = useState(2); // Rippling
  
  const activeCampaign = CAMPAIGNS.find(c => c.id === activeCampaignId);
  
  return (
    <div className="h-full bg-stone-50 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">NA Campaign Tracker</h1>
              <p className="text-[13px] text-stone-500 font-medium flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Structure mirrors exactly the framework established by Marc & Chris
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-white border border-stone-200 text-stone-600 text-xs font-semibold rounded-lg shadow-sm">
              Managed by Jesper
            </span>
          </div>
        </div>

        {/* 4-Week Cadence Timeline */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <div>
              <h2 className="text-[15px] font-bold text-stone-900">4-Week Alignment Cycle</h2>
              <p className="text-xs text-stone-500 font-medium">Marketing and Sales aligned on target audiences every 4 weeks.</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {CAMPAIGNS.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => setActiveCampaignId(campaign.id)}
                  className={`text-left relative flex flex-col p-4 rounded-xl border transition-all duration-200 ${
                    activeCampaignId === campaign.id 
                      ? `ring-2 ring-blue-500 ring-offset-2 ${campaign.color} shadow-md` 
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 bg-white'
                  }`}
                >
                  {campaign.status === 'live' && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      LIVE
                    </div>
                  )}
                  {campaign.status === 'active' && (
                    <div className="absolute top-2 right-2 text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                      IN PROGRESS
                    </div>
                  )}
                  
                  <div className="text-[11px] font-bold text-stone-400 mb-1 flex items-center gap-1.5">
                    <CalendarIcon size={12} />
                    {campaign.date}
                  </div>
                  <h3 className={`text-[14px] font-bold mb-1 leading-tight ${activeCampaignId === campaign.id ? 'text-stone-900' : 'text-stone-700'}`}>
                    {campaign.name}
                  </h3>
                  <p className="text-[11px] font-medium text-stone-500 leading-snug mt-auto pt-2">
                    {campaign.type}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SLA Tracking Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-[15px] font-bold text-stone-900">35-Day Campaign Execution SLA</h2>
                  <p className="text-xs text-stone-500 font-medium">Tracking run-up for <strong className="text-stone-700">{activeCampaign?.name}</strong></p>
                </div>
                {activeCampaign?.status === 'active' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-500">T-7 Days to Launch</span>
                    <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col gap-3">
              {SLA_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${step.color} z-10 relative bg-white`}>
                        <Icon size={18} />
                      </div>
                      {index < SLA_STEPS.length - 1 && (
                        <div className={`w-0.5 h-full ${step.status === 'completed' ? 'bg-blue-200' : 'bg-stone-100'}`}></div>
                      )}
                    </div>
                    <div className={`flex-1 pt-1 pb-4 ${step.status === 'completed' ? 'opacity-70' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                            step.isGoLive ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-600'
                          }`}>
                            T{step.days === 0 ? '' : step.days}
                          </span>
                          <h4 className={`text-sm font-bold ${step.status === 'active' ? 'text-emerald-700' : 'text-stone-900'}`}>
                            {step.title}
                          </h4>
                        </div>
                        {step.status === 'completed' && <CheckCircle2 size={16} className="text-blue-500" />}
                        {step.status === 'active' && <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Current Phase</div>}
                      </div>
                      <p className="text-xs text-stone-500 font-medium pl-14 -ml-14">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backlog */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-5 border-b border-stone-100 bg-stone-50/50">
              <h2 className="text-[15px] font-bold text-stone-900">Backlog / Strategic Flex</h2>
              <p className="text-xs text-stone-500 font-medium">To be determined (TBD)</p>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-2 bg-stone-50/30">
              {BACKLOG.map((item, i) => (
                <div key={i} className="bg-white border border-stone-200 rounded-lg p-3 shadow-sm hover:border-stone-300 transition-colors flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                    <Database size={12} />
                  </div>
                  <span className="text-[13px] font-semibold text-stone-700">{item}</span>
                </div>
              ))}
              
              <button className="mt-2 w-full py-2.5 border border-dashed border-stone-300 rounded-lg text-[13px] font-semibold text-stone-500 hover:text-stone-700 hover:border-stone-400 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
                <PlusCircle size={14} /> Add Audience
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
