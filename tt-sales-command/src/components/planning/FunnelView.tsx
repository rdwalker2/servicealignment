// ============================================================
// FunnelView — Funnel tab content for the rep view
// Shows ConversionAnalysis + FatalityTally + Strategic Improvement Plan
// ============================================================
import { useState } from 'react';
import { Target, Zap, ArrowRight, Sparkles, BarChart3, Lightbulb } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCycle } from '../../hooks/useCycle';
import ConversionAnalysis from './ConversionAnalysis';
import FatalityTally from './FatalityTally';
import StrategicImprovementPlan from './StrategicImprovementPlan';

export default function FunnelView() {
  const { effectiveUser } = useAuth();
  const repId = effectiveUser?.id ?? '';
  const { activeCycle } = useCycle(repId);

  const [section, setSection] = useState<'conversions' | 'losses' | 'playbook'>('conversions');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Active Plan Banner */}
      {activeCycle ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">90-Day Plan Active</p>
              <p className="text-xs text-emerald-600">
                {activeCycle.focus_area ? `Focus: ${activeCycle.focus_area}` : 'Plan is running'}
                {' · '}Started {new Date(activeCycle.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/team/tracker" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors">
              Weekly Tracker <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">No Active Plan</p>
              <p className="text-xs text-amber-600">Set your 90-day improvement plan to start tracking your funnel.</p>
            </div>
          </div>
          <a
            href="/team/goal-wizard"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
          >
            <Zap className="w-3.5 h-3.5" /> Sales Plan
          </a>
        </div>
      )}

      {/* Section Toggle */}
      <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-1 w-fit">
        <button
          onClick={() => setSection('conversions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            section === 'conversions'
              ? 'bg-stone-800 text-white'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" /> Conversion Analysis
        </button>
        <button
          onClick={() => setSection('losses')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            section === 'losses'
              ? 'bg-stone-800 text-white'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Target className="w-3.5 h-3.5" /> Loss Analysis
        </button>
        <button
          onClick={() => setSection('playbook')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            section === 'playbook'
              ? 'bg-stone-800 text-white'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" /> My Playbook
        </button>
      </div>

      {/* Content */}
      {section === 'conversions' ? (
        <ConversionAnalysis repId={repId} />
      ) : section === 'losses' ? (
        <FatalityTally repId={repId} />
      ) : (
        <StrategicImprovementPlan
          repId={repId}
          focusArea={activeCycle?.focus_area}
        />
      )}
    </div>
  );
}
