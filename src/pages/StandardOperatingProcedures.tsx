import { useState } from 'react';
import { ClipboardList, CheckSquare, Square, AlertTriangle, PlayCircle } from 'lucide-react';
import { CleanPage, CleanCard, CleanPageHeader } from '../components/ui/CleanUI';
import { CHECKLISTS, type SOPChecklist } from '../data/sops';

export default function StandardOperatingProcedures() {
  const [activeChecklist, setActiveChecklist] = useState<SOPChecklist>(CHECKLISTS[0]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const progress = Math.round((checkedItems.size / activeChecklist.steps.length) * 100);

  return (
    <CleanPage>
      <CleanPageHeader 
        title="Standard Operating Procedures" 
        subtitle="The Lifecycle Business Model. Execute every service call perfectly to ensure safety, quality, and profitability."
      />

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Col: Checklist Menu */}
        <div className="w-full lg:w-1/3 space-y-4">
          <h3 className="text-[12px] font-bold text-stone-400 uppercase tracking-widest mb-2 px-1">Service Lifecycle Checklists</h3>
          <div className="space-y-2">
            {CHECKLISTS.map((list) => (
              <button
                key={list.id}
                onClick={() => {
                  setActiveChecklist(list);
                  setCheckedItems(new Set()); // Reset checks when switching
                }}
                className={`w-full flex flex-col items-start p-4 rounded-xl border transition-all text-left ${
                  activeChecklist.id === list.id 
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md scale-[1.02]' 
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList size={16} className={activeChecklist.id === list.id ? 'text-emerald-200' : 'text-stone-400'} />
                  <span className={`font-bold text-[14px] ${activeChecklist.id === list.id ? 'text-white' : 'text-stone-800'}`}>
                    {list.title}
                  </span>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full mt-2 ${
                  activeChecklist.id === list.id ? 'bg-emerald-700 text-emerald-100' : 'bg-stone-100 text-stone-500'
                }`}>
                  {list.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Interactive Checklist */}
        <div className="w-full lg:w-2/3">
          <CleanCard className="h-full flex flex-col p-8">
            
            <div className="mb-8 border-b border-stone-100 pb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-stone-900">{activeChecklist.title}</h2>
                <span className="text-[14px] font-bold text-emerald-600">{progress}% Complete</span>
              </div>
              <p className="text-[14px] text-stone-500">{activeChecklist.description}</p>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-stone-100 rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {activeChecklist.steps.map((step) => {
                const isChecked = checkedItems.has(step.id);
                return (
                  <div 
                    key={step.id}
                    onClick={() => toggleCheck(step.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      isChecked 
                        ? 'bg-emerald-50/50 border-emerald-100' 
                        : 'bg-white border-stone-200 hover:border-emerald-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isChecked ? (
                        <CheckSquare size={20} className="text-emerald-500" />
                      ) : (
                        <Square size={20} className="text-stone-300" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`text-[14px] font-medium leading-snug transition-colors ${
                        isChecked ? 'text-stone-400 line-through' : 'text-stone-800'
                      }`}>
                        {step.task}
                      </p>
                    </div>

                    {step.isCritical && !isChecked && (
                      <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider">
                        <AlertTriangle size={12} /> Critical
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {progress === 100 && (
              <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                <PlayCircle size={24} className="text-emerald-600" />
                <span className="text-[16px] font-bold text-emerald-800">Checklist Complete. Ready for next phase.</span>
              </div>
            )}

          </CleanCard>
        </div>

      </div>
    </CleanPage>
  );
}
