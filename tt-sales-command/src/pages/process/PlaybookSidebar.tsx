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
  ScrollText,
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
  { id: 'd1', label: 'D1: Urgency Test' },
  { id: 'd2', label: 'D2: Gap Test' },
  { id: 'd3', label: 'D3: Solution' },
  { id: 'd4', label: 'D4: Close' },
] as const;

export const PLAYBOOK_TOPICS: PlaybookTopic[] = [
  // Master Script
  { id: 'master-script', label: 'Full Script: D1→D4', icon: <ScrollText size={14} />, category: 'master' },

  // Foundation
  { id: 'overview', label: 'Core Paradigm', icon: <Compass size={14} />, category: 'foundation' },
  { id: 'buyer-intent', label: 'Buyer\'s Intent', icon: <Brain size={14} />, category: 'foundation' },
  { id: 'push-vs-pull', label: 'Push vs Pull', icon: <ArrowRight size={14} />, category: 'foundation' },
  { id: 'date-vs-doctor', label: 'Date vs Doctor', icon: <Stethoscope size={14} />, category: 'foundation' },
  { id: 'five-fatalities', label: '5 Fatalities', icon: <ShieldAlert size={14} />, category: 'foundation' },
  { id: 'three-checkpoints', label: '3 Checkpoints', icon: <Target size={14} />, category: 'foundation' },
  { id: 'bap-framework', label: 'BAP Framework', icon: <FileCheck size={14} />, category: 'foundation' },

  // Prospecting
  { id: 'prospecting-overview', label: 'Three Waves', icon: <Waves size={14} />, category: 'prospecting' },
  { id: 'wave1-existing', label: 'Wave 1: Existing', icon: <span className="text-[10px] font-black">①</span>, category: 'prospecting' },
  { id: 'wave2-future', label: 'Wave 2: Future', icon: <span className="text-[10px] font-black">②</span>, category: 'prospecting' },
  { id: 'wave3-unknown', label: 'Wave 3: Unknown', icon: <span className="text-[10px] font-black">③</span>, category: 'prospecting' },
  { id: 'call-trees', label: 'Call Trees', icon: <GitFork size={14} />, category: 'prospecting' },
  { id: 'hiring-stack-audit', label: 'Hiring Stack Audit', icon: <ClipboardCheck size={14} />, category: 'prospecting' },
  { id: 'proven-scripts', label: 'Proven Scripts', icon: <MessageSquare size={14} />, category: 'prospecting' },

  // D1: Urgency Test
  { id: 'd1-overview', label: 'D1 Overview', icon: <Search size={14} />, category: 'd1' },
  { id: 'urgency-leadership', label: 'Taking Leadership', icon: <Zap size={14} />, category: 'd1' },
  { id: 'urgency-objective', label: 'Buyer\'s Objective', icon: <Target size={14} />, category: 'd1' },
  { id: 'urgency-decision-makers', label: 'Decision Makers', icon: <Users size={14} />, category: 'd1' },
  { id: 'urgency-current-reality', label: 'Current Reality', icon: <Eye size={14} />, category: 'd1' },
  { id: 'urgency-business-pain', label: 'Business Pain', icon: <Flame size={14} />, category: 'd1' },

  // D2: Gap Test
  { id: 'd2-overview', label: 'D2 Overview', icon: <Stethoscope size={14} />, category: 'd2' },
  { id: 'gap-other-vendors', label: 'Other Vendors', icon: <Scale size={14} />, category: 'd2' },
  { id: 'gap-problem-diagnosis', label: 'Problem Diagnosis', icon: <Search size={14} />, category: 'd2' },
  { id: 'gap-buying-process', label: 'Buying Process', icon: <Clock size={14} />, category: 'd2' },
  { id: 'gap-budget-timeline', label: 'Budget & Timeline', icon: <DollarSign size={14} />, category: 'd2' },

  // D3: Solution
  { id: 'd3-overview', label: 'D3 Overview', icon: <Presentation size={14} />, category: 'd3' },
  { id: 'solution-proven-results', label: 'Proven Results', icon: <Trophy size={14} />, category: 'd3' },
  { id: 'solution-clear-solution', label: 'Clear Solution', icon: <Lightbulb size={14} />, category: 'd3' },
  { id: 'solution-timeline-price', label: 'Timeline & Price', icon: <DollarSign size={14} />, category: 'd3' },

  // D4: Close
  { id: 'd4-overview', label: 'D4 Overview', icon: <Handshake size={14} />, category: 'd4' },
  { id: 'confirmation-close', label: 'Confirmation Close', icon: <MessageSquare size={14} />, category: 'd4' },
  { id: 'doa-proposals', label: 'DOA Proposals', icon: <ShieldAlert size={14} />, category: 'd4' },
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
