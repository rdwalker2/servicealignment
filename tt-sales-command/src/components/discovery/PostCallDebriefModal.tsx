import React, { useState } from 'react';
import { X, ArrowRight, Calendar, Zap } from 'lucide-react';

interface PostCallDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  fieldsExtracted?: number;
  currentNextAction: string;
  currentNextMeeting: string | null;
  currentGutFeel?: 'strong' | 'mixed' | 'weak';
  onSave: (data: {
    gut_feel: 'strong' | 'mixed' | 'weak';
    gut_feel_note: string;
    next_action: string;
    next_meeting_date: string | null;
  }) => void;
}

type GutFeelOption = 'strong' | 'mixed' | 'weak';

const GUT_FEEL_OPTIONS: {
  value: GutFeelOption;
  emoji: string;
  label: string;
  description: string;
  selectedBg: string;
  selectedBorder: string;
  selectedText: string;
}[] = [
  {
    value: 'strong',
    emoji: '🟢',
    label: 'Strong',
    description: 'Bought in, clear next steps',
    selectedBg: 'bg-emerald-50',
    selectedBorder: 'border-emerald-300',
    selectedText: 'text-emerald-700',
  },
  {
    value: 'mixed',
    emoji: '🟡',
    label: 'Mixed',
    description: 'Some traction, need follow-up',
    selectedBg: 'bg-amber-50',
    selectedBorder: 'border-amber-300',
    selectedText: 'text-amber-700',
  },
  {
    value: 'weak',
    emoji: '🔴',
    label: 'Weak',
    description: 'Low energy, may not progress',
    selectedBg: 'bg-rose-50',
    selectedBorder: 'border-rose-300',
    selectedText: 'text-rose-700',
  },
];

export function PostCallDebriefModal({
  isOpen,
  onClose,
  companyName,
  fieldsExtracted,
  currentNextAction,
  currentNextMeeting,
  currentGutFeel,
  onSave,
}: PostCallDebriefModalProps) {
  const [gutFeel, setGutFeel] = useState<GutFeelOption | null>(currentGutFeel ?? null);
  const [gutFeelNote, setGutFeelNote] = useState('');
  const [nextAction, setNextAction] = useState(currentNextAction);
  const [nextMeetingDate, setNextMeetingDate] = useState(currentNextMeeting ?? '');

  if (!isOpen) return null;

  const canSave = gutFeel !== null;

  const handleSave = () => {
    if (!gutFeel) return;
    onSave({
      gut_feel: gutFeel,
      gut_feel_note: gutFeelNote,
      next_action: nextAction,
      next_meeting_date: nextMeetingDate || null,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-100">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                {fieldsExtracted && fieldsExtracted > 0 ? (
                  <h2 className="text-base font-bold text-zinc-900 leading-tight">
                    ✅ {fieldsExtracted} fields applied from your call with {companyName}
                  </h2>
                ) : (
                  <h2 className="text-base font-bold text-zinc-900 leading-tight">
                    Post-call debrief — {companyName}
                  </h2>
                )}
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Quick debrief — 30 seconds</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Section 1: Gut Feel */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-900">How did the call feel?</label>
              <div className="grid grid-cols-3 gap-2">
                {GUT_FEEL_OPTIONS.map((option) => {
                  const isSelected = gutFeel === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setGutFeel(option.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                        isSelected
                          ? `${option.selectedBg} ${option.selectedBorder} ${option.selectedText} shadow-sm`
                          : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className="text-xs font-bold">{option.label}</span>
                      <span className={`text-[10px] leading-tight ${
                        isSelected ? option.selectedText : 'text-zinc-400'
                      }`}>
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
              <textarea
                value={gutFeelNote}
                onChange={(e) => setGutFeelNote(e.target.value)}
                placeholder="Quick note on why..."
                rows={1}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all resize-none"
                style={{ overflow: 'hidden' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </div>

            {/* Section 2: Next Meeting */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                When is your next meeting?
              </label>
              <input
                type="date"
                value={nextMeetingDate}
                onChange={(e) => setNextMeetingDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 focus:outline-none focus:border-zinc-400 transition-all"
              />
            </div>

            {/* Section 3: Next Action */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                What's your next action?
              </label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g., Send ROI calculator, Schedule demo with VP..."
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 space-y-2">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Save & Close
            </button>
            <button
              onClick={onClose}
              className="w-full py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
