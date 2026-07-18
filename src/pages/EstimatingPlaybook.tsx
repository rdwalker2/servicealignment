import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Clock, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { CleanPage, CleanCard, CleanPageHeader } from '../components/ui/CleanUI';
import { PROJECT_TYPES, ESTIMATING_METHODS, DEFECT_PRICING } from '../data/estimatingPlaybook';

export default function EstimatingPlaybook() {
  const [activeTab, setActiveTab] = useState<'baselines' | 'methods' | 'pricing'>('baselines');

  return (
    <CleanPage>
      <CleanPageHeader 
        title="Estimating & Upsells" 
        subtitle="Maximizing Service Revenue. Master the estimating process and drive the $2,000/week onsite upsell goal."
      />

      {/* Nav Tabs */}
      <div className="flex gap-2 mb-8 border-b border-stone-200 pb-px">
        <button 
          onClick={() => setActiveTab('baselines')}
          className={`pb-3 px-2 text-[14px] font-bold border-b-2 transition-colors ${
            activeTab === 'baselines' ? 'border-blue-600 text-blue-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Project Baselines
        </button>
        <button 
          onClick={() => setActiveTab('methods')}
          className={`pb-3 px-2 text-[14px] font-bold border-b-2 transition-colors ${
            activeTab === 'methods' ? 'border-amber-500 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Estimating 101
        </button>
        <button 
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 px-2 text-[14px] font-bold border-b-2 transition-colors ${
            activeTab === 'pricing' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Base Pricing (TPO)
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* TAB 1: Project Baselines */}
        {activeTab === 'baselines' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-xl text-white">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-blue-900 mb-1">The $2,000 Weekly Upsell Goal</h3>
                  <p className="text-[14px] text-blue-800/80 max-w-3xl leading-relaxed">
                    Every service truck should aim to generate $2,000 a week in preventative onsite upsells. 
                    Act as if it were your roof: Discover opportunities, build trust, and prevent costly future repairs for the client.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {PROJECT_TYPES.map((project) => (
                <CleanCard key={project.id} className="p-6 flex flex-col h-full hover:border-blue-300 transition-colors">
                  <h4 className="text-[16px] font-black text-stone-900 mb-3">{project.name}</h4>
                  <p className="text-[13px] text-stone-600 leading-relaxed mb-6 flex-1">
                    {project.description}
                  </p>
                  
                  <div className="space-y-3 pt-4 border-t border-stone-100 mt-auto">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-stone-500 font-medium flex items-center gap-1.5"><DollarSign size={14}/> Approx Cost</span>
                      <span className="font-bold text-stone-800">{project.approxCost}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-stone-500 font-medium flex items-center gap-1.5"><Clock size={14}/> Time to Value</span>
                      <span className="font-bold text-stone-800">{project.timeToValue}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-stone-500 font-medium flex items-center gap-1.5"><AlertCircle size={14}/> Client Awareness</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        project.clientAwareness === 'Aware' ? 'bg-stone-100 text-stone-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {project.clientAwareness}
                      </span>
                    </div>
                  </div>
                </CleanCard>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Estimating Methods */}
        {activeTab === 'methods' && (
          <div className="max-w-4xl space-y-6">
            {ESTIMATING_METHODS.map((method) => (
              <CleanCard key={method.id} className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-amber-100 text-amber-700 rounded-xl mt-1">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-stone-900 mb-2">{method.title}</h3>
                    <p className="text-[15px] text-stone-600 leading-relaxed">{method.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-16">
                  <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                    <h4 className="text-[12px] font-bold text-emerald-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> PROS
                    </h4>
                    <p className="text-[13px] text-emerald-900/80 leading-relaxed">{method.pros}</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
                    <h4 className="text-[12px] font-bold text-rose-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <AlertCircle size={14} /> CONS
                    </h4>
                    <p className="text-[13px] text-rose-900/80 leading-relaxed">{method.cons}</p>
                  </div>
                </div>
              </CleanCard>
            ))}
          </div>
        )}

        {/* TAB 3: Base Pricing */}
        {activeTab === 'pricing' && (
          <div className="max-w-4xl">
            <CleanCard className="overflow-hidden border border-stone-200">
              <div className="bg-stone-50 border-b border-stone-200 p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-[16px] font-black text-stone-900">Standardized Defect Pricing</h3>
                  <p className="text-[13px] text-stone-500 mt-1">Base unit prices for common TPO repairs (Material + Labor).</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200 shadow-sm text-stone-400">
                  <DollarSign size={20} />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-white">
                      <th className="px-6 py-4 text-[12px] font-bold text-stone-400 uppercase tracking-wider">Roof Type</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-stone-400 uppercase tracking-wider">Problem</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-stone-400 uppercase tracking-wider text-right">Price</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-stone-400 uppercase tracking-wider w-24">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {DEFECT_PRICING.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-stone-100 text-stone-600 text-[11px] font-bold tracking-wide">
                            {item.roofType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[14px] font-medium text-stone-800">
                          {item.problem}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-bold text-emerald-700 text-right">
                          {item.price}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-stone-500 font-medium">
                          / {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CleanCard>
          </div>
        )}

      </div>
    </CleanPage>
  );
}
