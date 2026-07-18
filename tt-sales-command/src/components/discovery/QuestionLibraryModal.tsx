import React, { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { QUESTION_LIBRARY, type LibraryQuestion } from '../../data/questionLibrary';

interface QuestionLibraryModalProps {
  onClose: () => void;
  onSelect: (questionId: string) => void;
  phaseLabel: string; // e.g. "D1 · Discovery"
  phase: 'd1' | 'd2' | 'd3' | 'd4';
}

export function QuestionLibraryModal({ onClose, onSelect, phaseLabel, phase }: QuestionLibraryModalProps) {
  const [search, setSearch] = useState('');

  const filtered = QUESTION_LIBRARY.filter(q => 
    q.phase === phase &&
    (q.question.toLowerCase().includes(search.toLowerCase()) || 
     q.category.toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = filtered.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, LibraryQuestion[]>);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Add Question to {phaseLabel}</h2>
            <p className="text-xs text-zinc-500 font-medium">Select a highly-effective question from the library</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by keyword or category..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(grouped).map(([category, questions]) => (
            <div key={category}>
              <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-3">{category}</h3>
              <div className="space-y-2">
                {questions.map(q => (
                  <button
                    key={q.id}
                    onClick={() => onSelect(q.id)}
                    className="w-full text-left p-3 rounded-xl border border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.15)] transition-all group relative"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <Plus size={14} strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-800 leading-snug pr-8">{q.question}</p>
                        {q.coaching && (
                          <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{q.coaching}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm font-medium text-zinc-500">No questions found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
