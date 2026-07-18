/* eslint-disable react-refresh/only-export-components */
import { useState, useMemo } from 'react';
import { FileText, Search, BookOpen, ChevronRight, Activity, AlertTriangle } from 'lucide-react';
import { CleanCard } from '../ui/CleanUI';

const SYMPTOMS = {
  timing: [
    'Ghosted, delayed indefinitely',
    'No clear next steps',
    'Not a priority right now'
  ],
  competition: [
    'Went with another vendor',
    'Decided to solve it internally',
    'We can do this ourselves'
  ],
  price: [
    "It's too expensive",
    'No budget allocated',
    'Negotiations stalled on cost'
  ],
  fit: [
    "This isn't exactly what we need",
    'They saw another solution as a better fit',
    'We need more customization'
  ],
  trust: [
    'Hesitation on credibility',
    'Doubts about implementation',
    "We're not sure this will work for us"
  ]
};


interface FatalityAnalysis {
  type: string;
  checkpoint: number;
  description: string;
  academyModule: {
    id: string;
    title: string;
    duration: string;
  };
}

export function analyzeDealFatality(selectedSymptoms: string[]): FatalityAnalysis | null {
  if (selectedSymptoms.length === 0) return null;

  // Check Trust first (usually late stage)
  if (selectedSymptoms.some(s => SYMPTOMS.trust.includes(s))) {
    return {
      type: 'Trust Fatality',
      checkpoint: 3,
      description: 'The buyer did not believe you could deliver the outcome. You failed Checkpoint 3 (Are We the Best Solution?).',
      academyModule: { id: 'm-trust-301', title: 'Building Bulletproof Credibility', duration: '4 min' }
    };
  }

  // Check Competition / Price
  if (selectedSymptoms.some(s => SYMPTOMS.competition.includes(s)) || selectedSymptoms.some(s => SYMPTOMS.price.includes(s))) {
    return {
      type: 'Value / Competition Fatality',
      checkpoint: 2,
      description: 'The buyer did not see enough unique value to justify the cost or change. You failed Checkpoint 2 (Do They Need Outside Help?).',
      academyModule: { id: 'm-value-201', title: 'Creating the Capability Gap', duration: '5 min' }
    };
  }

  // Check Timing / Fit
  if (selectedSymptoms.some(s => SYMPTOMS.timing.includes(s)) || selectedSymptoms.some(s => SYMPTOMS.fit.includes(s))) {
    return {
      type: 'Priority Fatality',
      checkpoint: 1,
      description: 'The problem was not urgent enough, or you solved the wrong problem. You failed Checkpoint 1 (Do They Need to Act?).',
      academyModule: { id: 'm-discovery-101', title: 'Finding the Real Pain', duration: '6 min' }
    };
  }

  return {
    type: 'Unknown Fatality',
    checkpoint: 1,
    description: 'Review your discovery process. The root cause is unclear.',
    academyModule: { id: 'm-discovery-101', title: 'Back to Basics: Discovery', duration: '6 min' }
  };
}

import type { DiscoverySession } from '../../lib/discoveryDatabase';

export interface DealPostMortemProps {
  session?: DiscoverySession;
  onSave?: (symptoms: string[], analysis: FatalityAnalysis) => void;
}

export function DealPostMortem({ session, onSave }: DealPostMortemProps) {
  const [dealName, setDealName] = useState(session?.company_name || '');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(session?.post_mortem_symptoms || []);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const analysis = useMemo(() => analyzeDealFatality(selectedSymptoms), [selectedSymptoms]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <CleanCard className="p-6 bg-zinc-900 text-white border-zinc-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              Deal Autopsy & Post-Mortem
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Select the symptoms of the lost deal to identify the root cause Fatality and trigger your next learning module.
            </p>
          </div>
            {session ? (
              <div className="w-full sm:w-64 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2">
                {session.company_name}
              </div>
            ) : (
              <div className="w-full sm:w-64 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Deal Name or URL..."
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            )}
        </div>
      </CleanCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Symptoms Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wider mb-2">Identify Symptoms</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(SYMPTOMS).map(([category, items]) => (
              <CleanCard key={category} className="p-4 bg-white border-zinc-200">
                <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 capitalize">
                  {category} Symptoms
                </h5>
                <div className="space-y-2">
                  {items.map(symptom => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border ${
                        selectedSymptoms.includes(symptom)
                          ? 'bg-rose-50 border-rose-200 text-rose-700 font-medium'
                          : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 w-3 h-3 rounded border flex-shrink-0 ${
                          selectedSymptoms.includes(symptom) 
                            ? 'bg-rose-500 border-rose-500' 
                            : 'bg-white border-zinc-300'
                        }`} />
                        <span className="leading-tight">{symptom}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CleanCard>
            ))}
          </div>
        </div>

        {/* Fatality Analysis */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            {analysis ? (
              <CleanCard className="p-0 overflow-hidden border-rose-200 shadow-md">
                <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center gap-3">
                  <div className="bg-rose-100 p-2 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-900">{analysis.type}</h4>
                    <p className="text-xs text-rose-700 font-medium">Root Cause Identified</p>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Missed Checkpoint</span>
                    <div className="inline-flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-800">
                      Checkpoint {analysis.checkpoint}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Diagnosis</span>
                    <p className="text-sm text-zinc-700 leading-relaxed">
                      {analysis.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-100">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-2">Required Training</span>
                    <div className="group block bg-emerald-50 border border-emerald-100 rounded-xl p-4 transition-colors hover:bg-emerald-100 cursor-pointer">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-5 h-5 text-emerald-600 mt-0.5" />
                          <div>
                            <h5 className="text-sm font-bold text-emerald-900 mb-0.5 group-hover:underline">
                              {analysis.academyModule.title}
                            </h5>
                            <p className="text-xs text-emerald-700 font-medium">
                              {analysis.academyModule.duration} lesson
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                  </div>

                  {onSave && (
                    <div className="pt-4 border-t border-zinc-100">
                      <button
                        onClick={() => onSave(selectedSymptoms, analysis)}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg shadow-sm transition-colors text-sm"
                      >
                        Save Autopsy & Update Inbox
                      </button>
                    </div>
                  )}
                </div>
              </CleanCard>
            ) : (
              <CleanCard className="p-6 border-dashed border-2 border-zinc-200 bg-zinc-50 text-center flex flex-col items-center justify-center min-h-[300px]">
                <FileText className="w-8 h-8 text-zinc-300 mb-3" />
                <h4 className="font-bold text-zinc-700 mb-1">Awaiting Autopsy</h4>
                <p className="text-sm text-zinc-500 max-w-[200px] leading-relaxed">
                  Select the symptoms of the lost deal to generate the root cause analysis.
                </p>
              </CleanCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
