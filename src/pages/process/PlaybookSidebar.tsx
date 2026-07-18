// ============================================================
// PlaybookSidebar.tsx — Left sidebar for the Playbook page
// Pattern: SalesRedemption.tsx collapsible sidebar
// ============================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, BookOpen, Waves,
  Compass, Brain, Stethoscope, Presentation, Handshake,
  Target, Users, Search, Flame, ShieldAlert,
  Clock, Scale, DollarSign, Trophy, FileCheck, Lightbulb,
  MessageSquare, Eye, ArrowRight, Zap, GitFork, ClipboardCheck,
  ScrollText, Mail, Ghost, Sprout, LayoutList,
  UserCircle, Briefcase, Settings2, Building2, TrendingUp,
} from 'lucide-react';

export interface PlaybookTopic {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}

export const PLAYBOOK_CATEGORIES = [
  { id: 'master', label: '⭐ Master Script' },
  { id: 'foundation', label: 'Foundation' },
  { id: 'prospecting', label: 'Prospecting' },
  { id: 'cadences', label: '📞 Cadences' },
  { id: 'outbound', label: '🚀 Outbound Engine' },
  { id: 'competitors', label: '⚔️ Competitors' },
  { id: 'd1', label: 'D1: Urgency Test' },
  { id: 'personas', label: 'Persona Insights' },
  { id: 'd2', label: 'D2: Gap Test' },
  { id: 'd3', label: 'D3: Solution' },
  { id: 'd4', label: 'D4: Close' },
  { id: 'industry', label: 'Industry Knowledge' },
  { id: 'operations', label: 'Operations & Tech' },
] as const;

export const PLAYBOOK_TOPICS: PlaybookTopic[] = [
  // Master Script
  { id: 'master-script', label: 'Full Script: D1→D4', icon: <ScrollText size={14} />, category: 'master' },

  // Foundation
  { id: 'overview', label: 'Core Paradigm', icon: <Compass size={14} />, category: 'foundation' },
  { id: 'funnel-math', label: 'Funnel Math', icon: <TrendingUp size={14} />, category: 'foundation' },
  { id: 'buyer-intent', label: 'Buyer\'s Intent', icon: <Brain size={14} />, category: 'foundation' },
  { id: 'push-vs-pull', label: 'Push vs Pull', icon: <ArrowRight size={14} />, category: 'foundation' },
  { id: 'date-vs-doctor', label: 'Date vs Doctor', icon: <Stethoscope size={14} />, category: 'foundation' },
  { id: 'five-fatalities', label: '5 Fatalities', icon: <ShieldAlert size={14} />, category: 'foundation' },
  { id: 'three-checkpoints', label: '3 Checkpoints', icon: <Target size={14} />, category: 'foundation' },
  { id: 'bap-framework', label: 'BAP Framework', icon: <FileCheck size={14} />, category: 'foundation' },
  { id: 'sales-stages', label: 'Sales Stages & MEDDPICC', icon: <ClipboardCheck size={14} />, category: 'foundation' },
  { id: 'meddpicc', label: 'MEDDPICC', icon: <Target size={14} />, category: 'foundation' },
  { id: 'unique-selling-points', label: '8 Core USPs', icon: <Trophy size={14} />, category: 'foundation' },
  { id: 'time-management', label: 'Time Management', icon: <Clock size={14} />, category: 'foundation' },

  // Prospecting
  { id: 'prospecting-overview', label: 'Three Waves', icon: <Waves size={14} />, category: 'prospecting' },
  { id: 'golden-minute', label: 'Golden Minute', icon: <MessageSquare size={14} />, category: 'prospecting' },
  { id: 'sourcing-icp', label: 'Ideal Customer Profile (ICP)', icon: <Target size={14} />, category: 'prospecting' },
  { id: 'icp-pains', label: 'ICP & Pains', icon: <ShieldAlert size={14} />, category: 'prospecting' },
  { id: 'sourcing-workshop', label: 'Sourcing Workshop', icon: <Search size={14} />, category: 'prospecting' },
  { id: 'call-trees', label: 'Call Trees', icon: <GitFork size={14} />, category: 'prospecting' },
  { id: 'hiring-stack-audit', label: 'Hiring Stack Audit', icon: <ClipboardCheck size={14} />, category: 'prospecting' },
  { id: 'proven-scripts', label: 'Proven Scripts', icon: <MessageSquare size={14} />, category: 'prospecting' },

  // Outbound Engine
  { id: 'outbound-cold-calling', label: 'Cold Calling 101', icon: <Search size={14} />, category: 'outbound' },
  { id: 'outbound-email', label: 'Email Best Practices', icon: <Mail size={14} />, category: 'outbound' },
  { id: 'outbound-linkedin', label: 'LinkedIn Strategy', icon: <UserCircle size={14} />, category: 'outbound' },

  // Competitors
  { id: 'comp-greenhouse', label: 'Greenhouse', icon: <ShieldAlert size={14} />, category: 'competitors' },
  { id: 'comp-lever', label: 'Lever', icon: <ShieldAlert size={14} />, category: 'competitors' },
  { id: 'comp-workable', label: 'Workable', icon: <ShieldAlert size={14} />, category: 'competitors' },

  // Cadences
  { id: 'cadence-strategy', label: 'Cadence Architecture', icon: <LayoutList size={14} />, category: 'cadences' },



  // D1: Urgency Test
  { id: 'd1-overview', label: 'D1 Overview', icon: <Search size={14} />, category: 'd1' },
  { id: 'prepco', label: 'PRePCo Framework', icon: <ClipboardCheck size={14} />, category: 'd1' },
  { id: 'inverted-pyramid', label: 'Inverted Pyramid', icon: <GitFork size={14} />, category: 'd1' },
  { id: 'axnot', label: 'AXNOT Framework', icon: <ShieldAlert size={14} />, category: 'd1' },
  { id: 'urgency-leadership', label: 'Taking Leadership', icon: <Zap size={14} />, category: 'd1' },
  { id: 'urgency-objective', label: 'Buyer\'s Objective', icon: <Target size={14} />, category: 'd1' },
  { id: 'urgency-decision-makers', label: 'Decision Makers', icon: <Users size={14} />, category: 'd1' },
  { id: 'urgency-current-reality', label: 'Current Reality', icon: <Eye size={14} />, category: 'd1' },
  { id: 'urgency-business-pain', label: 'Business Pain', icon: <Flame size={14} />, category: 'd1' },

  // Personas
  { id: 'sheet-vphr', label: 'Insight: VP HR / CHRO', icon: <UserCircle size={14} />, category: 'personas' },
  { id: 'sheet-ta-director', label: 'Insight: TA Director', icon: <Briefcase size={14} />, category: 'personas' },
  { id: 'sheet-people-ops', label: 'Insight: People Ops', icon: <Settings2 size={14} />, category: 'personas' },
  { id: 'sheet-smb', label: 'Insight: Office Mgr (SMB)', icon: <Building2 size={14} />, category: 'personas' },
  { id: 'sheet-finance', label: 'Insight: Finance / CFO', icon: <DollarSign size={14} />, category: 'personas' },

  // D2: Gap Test
  { id: 'd2-overview', label: 'D2 Overview', icon: <Stethoscope size={14} />, category: 'd2' },
  { id: 'gap-other-vendors', label: 'Other Vendors', icon: <Scale size={14} />, category: 'd2' },
  { id: 'gap-problem-diagnosis', label: 'Problem Diagnosis', icon: <Search size={14} />, category: 'd2' },
  { id: 'gap-buying-process', label: 'Buying Process', icon: <Clock size={14} />, category: 'd2' },
  { id: 'gap-budget-timeline', label: 'Budget & Timeline', icon: <DollarSign size={14} />, category: 'd2' },

  // D3: Solution
  { id: 'd3-overview', label: 'D3 Overview', icon: <Presentation size={14} />, category: 'd3' },
  { id: 'value-drivers', label: 'Value Drivers (M/T/R)', icon: <Trophy size={14} />, category: 'd3' },
  { id: 'fab-framework', label: 'FAB Framework', icon: <Lightbulb size={14} />, category: 'd3' },
  { id: 'solution-proven-results', label: 'Proven Results', icon: <Trophy size={14} />, category: 'd3' },
  { id: 'solution-clear-solution', label: 'Clear Solution', icon: <Lightbulb size={14} />, category: 'd3' },
  { id: 'solution-timeline-price', label: 'Timeline & Price', icon: <DollarSign size={14} />, category: 'd3' },

  // D4: Close
  { id: 'd4-overview', label: 'D4 Overview', icon: <Handshake size={14} />, category: 'd4' },
  { id: 'confirmation-close', label: 'Confirmation Close', icon: <MessageSquare size={14} />, category: 'd4' },
  { id: 'doa-proposals', label: 'DOA Proposals', icon: <ShieldAlert size={14} />, category: 'd4' },
  { id: 'bamfam', label: 'BAMFAM', icon: <Clock size={14} />, category: 'd4' },

  // Industry Knowledge
  { id: 'recruiting-basics', label: 'Recruiting Basics', icon: <BookOpen size={14} />, category: 'industry' },
  { id: 'customer-types', label: 'Customer Types', icon: <Building2 size={14} />, category: 'industry' },

  // Operations & Tech
  { id: 'sales-techstack', label: 'Sales Techstack', icon: <Settings2 size={14} />, category: 'operations' },
];

interface Props {
  activeTopic: string;
  onTopicChange: (topicId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function PlaybookSidebar({ activeTopic, onTopicChange, isOpen, onToggle }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 border-r border-stone-200 bg-white overflow-hidden"
        >
          <div className="w-60 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-stone-500" />
                <span className="text-[13px] font-bold text-stone-800">Playbook</span>
              </div>
              <button
                onClick={onToggle}
                className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
            </div>

            {/* Topic list */}
            <div className="flex-1 overflow-y-auto py-2">
              {PLAYBOOK_CATEGORIES.map(cat => {
                const topics = PLAYBOOK_TOPICS.filter(t => t.category === cat.id);
                return (
                  <div key={cat.id} className="mb-1">
                    <div className="px-4 py-1.5">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                        {cat.label}
                      </span>
                    </div>
                    {topics.map(topic => {
                      const isActive = activeTopic === topic.id;
                      return (
                        <button
                          key={topic.id}
                          onClick={() => onTopicChange(topic.id)}
                          className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-left text-[12px] font-medium transition-all ${
                            isActive
                              ? 'bg-stone-900 text-white'
                              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                          }`}
                        >
                          <span className={isActive ? 'text-white/70' : 'text-stone-400'}>
                            {topic.icon}
                          </span>
                          <span className="truncate">{topic.label}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Attribution footer */}
            <div className="flex-shrink-0 px-4 py-3 border-t border-stone-100">
              <p className="text-[9px] text-stone-300 leading-relaxed">
                Framework IP &copy; <a href="https://www.amazon.com/Buyer-Centric-Selling-Annoying-Prospects-Tactics/dp/B0CK3M5GWV" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-400 transition-colors">David Bonney</a> · <span className="italic">Buyer-Centric Selling</span>
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
