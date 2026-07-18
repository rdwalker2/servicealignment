import { useState } from 'react';
import { Briefcase, HardHat, Headphones, Wrench, PenTool as Tool, CheckCircle2, Target, DollarSign, Sun, Moon } from 'lucide-react';
import { CleanPage, CleanCard, CleanPageHeader } from '../components/ui/CleanUI';
import { ROLES, type Role } from '../data/roles';

const ICONS: Record<string, any> = {
  Briefcase,
  HardHat,
  Headphones,
  Wrench,
  Tool
};

export default function RolesAndKPIs() {
  const [activeRole, setActiveRole] = useState<Role>(ROLES[0]);

  return (
    <CleanPage>
      <CleanPageHeader 
        title="Roles & KPIs" 
        subtitle="The operational structure of a highly profitable Service Division. Define the deliverables and hold the team accountable."
      />

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Col: Role Selector */}
        <div className="w-full lg:w-1/3 space-y-4">
          <h3 className="text-[12px] font-bold text-stone-400 uppercase tracking-widest mb-2 px-1">Select Role</h3>
          <div className="space-y-2">
            {ROLES.map((role) => {
              const Icon = ICONS[role.icon] || Briefcase;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                    activeRole.id === role.id 
                      ? 'border-blue-600 bg-blue-600 text-white shadow-md scale-[1.02]' 
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activeRole.id === role.id ? 'bg-blue-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    <Icon size={20} />
                  </div>
                  <span className="font-bold text-[15px]">{role.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Col: Role Details */}
        <div className="w-full lg:w-2/3">
          <CleanCard className="h-full flex flex-col p-8">
            
            <div className="mb-8">
              <h2 className="text-2xl font-black text-stone-900 mb-3">{activeRole.title}</h2>
              <p className="text-[15px] text-stone-600 leading-relaxed max-w-2xl">
                {activeRole.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Deliverables */}
              <div>
                <h3 className="text-[12px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Target size={14} className="text-emerald-500" />
                  Primary Deliverables
                </h3>
                <div className="space-y-4">
                  {activeRole.deliverables.map((del, idx) => (
                    <div key={idx} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                      <h4 className="text-[13px] font-bold text-stone-800 mb-1">{del.label}</h4>
                      <p className="text-[12px] text-stone-500 leading-relaxed">{del.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bonus Structure */}
              <div>
                <h3 className="text-[12px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <DollarSign size={14} className="text-amber-500" />
                  Bonus Structure
                </h3>
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                  <p className="text-[13px] text-amber-900 leading-relaxed font-medium">
                    {activeRole.bonusStructure}
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Routine */}
            <div className="border-t border-stone-100 pt-8 mt-auto">
              <h3 className="text-[12px] font-bold text-stone-400 uppercase tracking-widest mb-6">Daily Routine</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[13px] font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <Sun size={14} className="text-orange-500" /> Morning (AM)
                  </h4>
                  <ul className="space-y-3">
                    {activeRole.dailyRoutine.morning.map((task, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[13px] text-stone-600">
                        <CheckCircle2 size={14} className="text-stone-300 shrink-0 mt-0.5" />
                        <span className="leading-snug">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[13px] font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <Moon size={14} className="text-indigo-500" /> Afternoon (PM)
                  </h4>
                  <ul className="space-y-3">
                    {activeRole.dailyRoutine.afternoon.map((task, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[13px] text-stone-600">
                        <CheckCircle2 size={14} className="text-stone-300 shrink-0 mt-0.5" />
                        <span className="leading-snug">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

          </CleanCard>
        </div>

      </div>
    </CleanPage>
  );
}
