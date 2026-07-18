import { useState } from 'react';
import { Calculator, TrendingUp, Target, ArrowRight, Zap } from 'lucide-react';
import { CleanCard } from '../ui/CleanUI';

interface PipelineMetrics {
  activities: number;
  connectRate: number; // %
  scheduleRate: number; // %
  showRate: number; // %
  proposalRate: number; // %
  closeRate: number; // %
  acv: number; // $
}

export function SalesMagicCalculator() {
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    activities: 1000,
    connectRate: 15,
    scheduleRate: 40,
    showRate: 75,
    proposalRate: 70,
    closeRate: 30,
    acv: 15000,
  });

  // Goal targets (+2% improvement on each step)
  const improvement = 2;
  const targetMetrics: PipelineMetrics = {
    ...metrics,
    connectRate: metrics.connectRate + improvement,
    scheduleRate: metrics.scheduleRate + improvement,
    showRate: metrics.showRate + improvement,
    proposalRate: metrics.proposalRate + improvement,
    closeRate: metrics.closeRate + improvement,
  };

  const calculateFunnel = (m: PipelineMetrics) => {
    const connects = m.activities * (m.connectRate / 100);
    const scheduled = connects * (m.scheduleRate / 100);
    const shown = scheduled * (m.showRate / 100);
    const proposals = shown * (m.proposalRate / 100);
    const closed = proposals * (m.closeRate / 100);
    const revenue = closed * m.acv;
    return { connects, scheduled, shown, proposals, closed, revenue };
  };

  const current = calculateFunnel(metrics);
  const target = calculateFunnel(targetMetrics);
  const revenueGap = target.revenue - current.revenue;

  const handleChange = (key: keyof PipelineMetrics, value: string) => {
    const num = parseFloat(value) || 0;
    setMetrics(prev => ({ ...prev, [key]: num }));
  };

  return (
    <div className="space-y-6">
      <CleanCard className="p-6 bg-stone-900 text-white border-stone-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              The "Sales Magic" Calculator
            </h3>
            <p className="text-sm text-stone-400 mt-1 max-w-2xl">
              This is the preamble to "Know Your Numbers". Input your historical baselines below. 
              See the compounding magic of just a <strong className="text-white">+2% improvement</strong> across your 90-day forward-looking pipeline.
            </p>
          </div>
        </div>
      </CleanCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Baseline Input Form */}
        <div className="lg:col-span-4 space-y-6">
          <CleanCard className="p-6 border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Historical Baselines
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Monthly Activities</label>
                <input 
                  type="number" 
                  value={metrics.activities}
                  onChange={(e) => handleChange('activities', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Connect Rate (%)</label>
                  <input 
                    type="number" 
                    value={metrics.connectRate}
                    onChange={(e) => handleChange('connectRate', e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Schedule Rate (%)</label>
                  <input 
                    type="number" 
                    value={metrics.scheduleRate}
                    onChange={(e) => handleChange('scheduleRate', e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Show Rate (%)</label>
                  <input 
                    type="number" 
                    value={metrics.showRate}
                    onChange={(e) => handleChange('showRate', e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Proposal Rate (%)</label>
                  <input 
                    type="number" 
                    value={metrics.proposalRate}
                    onChange={(e) => handleChange('proposalRate', e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Close Rate (%)</label>
                  <input 
                    type="number" 
                    value={metrics.closeRate}
                    onChange={(e) => handleChange('closeRate', e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Avg Deal Size ($)</label>
                  <input 
                    type="number" 
                    value={metrics.acv}
                    onChange={(e) => handleChange('acv', e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </CleanCard>
        </div>

        {/* The Compounding Magic Output */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Current Baseline Output */}
            <CleanCard className="p-6 border-stone-200 bg-stone-50">
              <h4 className="font-bold text-stone-500 text-sm mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Current Trajectory
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-stone-200 pb-2">
                  <span className="text-sm text-stone-600 font-medium">Closed Deals / Mo</span>
                  <span className="font-bold text-stone-900">{current.closed.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 block mb-1">Monthly Revenue</span>
                  <span className="text-3xl font-bold text-stone-900 tracking-tight">
                    ${current.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </CleanCard>

            {/* Target Trajectory Output */}
            <CleanCard className="p-6 border-emerald-200 bg-emerald-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-24 h-24 text-emerald-600" />
              </div>
              <h4 className="font-bold text-emerald-700 text-sm mb-4 flex items-center gap-2 relative z-10">
                <TrendingUp className="w-4 h-4" />
                +2% Skill Improvement
              </h4>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end border-b border-emerald-200 pb-2">
                  <span className="text-sm text-emerald-800 font-medium">Target Deals / Mo</span>
                  <span className="font-bold text-emerald-900">{target.closed.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 block mb-1">Target Revenue</span>
                  <span className="text-3xl font-bold text-emerald-900 tracking-tight">
                    ${target.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </CleanCard>
          </div>

          {/* The Gap & Call to Action */}
          <CleanCard className="p-6 border-primary/20 bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-primary block mb-1">The Cost of Stagnation</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary tracking-tight">
                    +${revenueGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-stone-600 font-medium">/ month left on the table.</span>
                </div>
                <p className="text-sm text-stone-700 mt-2 max-w-md leading-relaxed">
                  You don't need to work twice as hard to double your income. Small, compounding skill upgrades (+2%) across the 4D framework drive massive revenue growth.
                </p>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  Start Gap Training
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CleanCard>
        </div>

      </div>
    </div>
  );
}
