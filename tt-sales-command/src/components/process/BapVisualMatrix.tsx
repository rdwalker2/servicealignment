import { useState } from 'react';
import { Check } from 'lucide-react';

type QuestionState = 'Y' | 'N' | null;

interface BapQuestionRowProps {
  id: string;
  label: string;
  question: string;
  value: QuestionState;
  onChange: (val: 'Y' | 'N') => void;
}

function BapQuestionRow({ label, question, value, onChange }: BapQuestionRowProps) {
  return (
    <div className="flex w-full mb-3 shadow-sm rounded-md overflow-hidden bg-white border border-stone-200">
      <div className="w-[140px] bg-[#1d2745] text-white flex items-center justify-center p-3 text-center text-[11px] font-bold tracking-widest uppercase leading-tight">
        {label}
      </div>
      <div className="flex-1 px-4 py-3 text-[#1d2745] text-[13px] font-semibold border-r border-stone-200 flex items-center">
        {question}
      </div>
      <div className="flex flex-col w-[36px]">
        <button 
          onClick={() => onChange('Y')}
          className={`flex-1 flex items-center justify-center text-[12px] font-black border-b border-stone-200 transition-colors ${value === 'Y' ? 'bg-[#e53935] text-white' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
        >
          Y
        </button>
        <button 
          onClick={() => onChange('N')}
          className={`flex-1 flex items-center justify-center text-[12px] font-black transition-colors ${value === 'N' ? 'bg-[#1d2745] text-white' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
        >
          N
        </button>
      </div>
    </div>
  );
}

interface CheckpointCardProps {
  num: number;
  title: string;
  score: number;
  maxScore: number;
  type?: 'gradient' | 'heck-yes';
}

function CheckpointCard({ num, title, score, maxScore, type = 'gradient' }: CheckpointCardProps) {
  const percentage = (score / maxScore) * 100;
  
  // Calculate indicator position (0% is bottom, 100% is top)
  const indicatorBottom = `${percentage}%`;

  return (
    <div className="w-[180px] border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col relative h-[240px]">
      <div className="bg-[#e53935] text-white flex items-center justify-center gap-1.5 py-2 px-3 mx-4 mt-4 rounded-full text-[10px] font-bold tracking-widest">
        <Check size={12} strokeWidth={3} />
        CHECKPOINT {num}
      </div>
      <div className="px-4 py-4 text-center text-[#1d2745] font-black text-[13px] leading-tight uppercase h-16 flex items-center justify-center">
        {title}
      </div>
      
      <div className="flex-1 flex px-6 pb-6 mt-2 relative">
        <div className="w-[18px] rounded-full bg-gradient-to-t from-[#e53935] via-[#ffb74d] to-[#81c784] relative">
          {/* Indicator caret */}
          <div 
            className="absolute -right-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-[#1d2745] transition-all duration-300"
            style={{ bottom: `calc(${indicatorBottom} - 6px)` }}
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-between pl-4 text-[#1d2745] text-[11px] font-bold py-2">
          {type === 'gradient' ? (
            <>
              <div>8-10 = YES</div>
              <div>5-7 = MAYBE</div>
              <div>1-4 = NO</div>
            </>
          ) : (
            <>
              <div className="mt-2">HECK YES</div>
              <div className="mb-2">NO</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BapVisualMatrix() {
  const [answers, setAnswers] = useState<Record<string, QuestionState>>({});

  const setAnswer = (id: string, val: 'Y' | 'N') => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const getScore = (ids: string[]) => {
    return ids.reduce((total, id) => {
      if (answers[id] === 'Y') return total + 2.5;
      return total;
    }, 0);
  };

  const cp1Score = getScore(['q1', 'q2', 'q3', 'q4']);
  const cp2Score = getScore(['q5', 'q6', 'q7', 'q8']);
  const cp3Score = getScore(['q9', 'q10', 'q11']); // Max 7.5

  return (
    <div className="w-full max-w-4xl font-sans mb-12">
      <h2 className="text-[#1d2745] text-4xl font-black tracking-tight mb-10 text-center">
        BUYER'S ACTION PLAN
      </h2>

      <div className="relative">
        {/* CP1 Block */}
        <div className="flex items-center gap-10 mb-8">
          <div className="flex-1 flex flex-col">
            <BapQuestionRow id="q1" label="Their Objective" question="What is the problem that has been identified?" value={answers['q1']} onChange={(v) => setAnswer('q1', v)} />
            <BapQuestionRow id="q2" label="Decision Makers" question="Who else cares about this?" value={answers['q2']} onChange={(v) => setAnswer('q2', v)} />
            <BapQuestionRow id="q3" label="Current Reality" question="Have they tried to solve this and failed?" value={answers['q3']} onChange={(v) => setAnswer('q3', v)} />
            <BapQuestionRow id="q4" label="Priority & Urgency" question="Are they clear on the worst possible outcome if not solved?" value={answers['q4']} onChange={(v) => setAnswer('q4', v)} />
          </div>
          
          {/* Connector lines (CSS only for visual representation) */}
          <div className="hidden md:flex items-center justify-center w-8 relative text-stone-300">
            <div className="absolute right-0 w-4 border-t-2 border-dashed border-stone-300"></div>
            <div className="absolute right-0 bottom-0 h-full border-r-2 border-dashed border-stone-300"></div>
            <div className="absolute top-1/2 -translate-y-1/2 right-[-20px] text-[18px]">▶</div>
          </div>

          <CheckpointCard num={1} title="Do they need to act?" score={cp1Score} maxScore={10} />
        </div>

        {/* CP2 Block */}
        <div className="flex items-center gap-10 mb-8">
          <div className="flex-1 flex flex-col">
            <BapQuestionRow id="q5" label="Other Providers" question="Are they currently using any providers you compete with?" value={answers['q5']} onChange={(v) => setAnswer('q5', v)} />
            <BapQuestionRow id="q6" label="Problem Diagnosis" question="Why haven't their existing resources been able to fix it?" value={answers['q6']} onChange={(v) => setAnswer('q6', v)} />
            <BapQuestionRow id="q7" label="Buying Process" question="Who is involved in the process of approving these purchases?" value={answers['q7']} onChange={(v) => setAnswer('q7', v)} />
            <BapQuestionRow id="q8" label="Budget & Timelines" question="Are they reactive or proactive buyers?" value={answers['q8']} onChange={(v) => setAnswer('q8', v)} />
          </div>
          
          <div className="hidden md:flex items-center justify-center w-8 relative text-stone-300">
            <div className="absolute right-0 w-4 border-t-2 border-dashed border-stone-300"></div>
            <div className="absolute right-0 bottom-0 h-full border-r-2 border-dashed border-stone-300"></div>
            <div className="absolute top-1/2 -translate-y-1/2 right-[-20px] text-[18px]">▶</div>
          </div>

          <CheckpointCard num={2} title="Do they need new/outside help?" score={cp2Score} maxScore={10} />
        </div>

        {/* CP3 Block */}
        <div className="flex items-center gap-10">
          <div className="flex-1 flex flex-col">
            <BapQuestionRow id="q9" label="Proven Results" question="Demonstrate we have a proven history of solving their problem." value={answers['q9']} onChange={(v) => setAnswer('q9', v)} />
            <BapQuestionRow id="q10" label="A Clear Solution" question="Be clear on how our solution will solve their problems." value={answers['q10']} onChange={(v) => setAnswer('q10', v)} />
            <BapQuestionRow id="q11" label="Delivery & Timelines" question="Align on key delivery milestones and deliverables." value={answers['q11']} onChange={(v) => setAnswer('q11', v)} />
          </div>
          
          <div className="hidden md:flex items-center justify-center w-8 relative text-stone-300">
            <div className="absolute right-0 w-4 border-t-2 border-dashed border-stone-300"></div>
            <div className="absolute right-0 bottom-0 h-full border-r-2 border-dashed border-stone-300"></div>
            <div className="absolute top-1/2 -translate-y-1/2 right-[-20px] text-[18px]">▶</div>
          </div>

          <CheckpointCard num={3} title="Do we have the best solution?" score={cp3Score} maxScore={7.5} type="heck-yes" />
        </div>

      </div>
      
      <div className="text-center text-[10px] font-bold tracking-widest text-stone-400 mt-12 uppercase">
        Copyright © 2025 FourtyFive LLC
      </div>
    </div>
  );
}
