import { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, AlertCircle, Settings2 } from 'lucide-react';
import type { DiscoverySession, ROIInputs } from '../../lib/discoveryDatabase';
import { updateSessionROI } from '../../lib/discoveryDatabase';

interface ROIBuilderProps {
  session: DiscoverySession;
  onChange: () => void;
}

export function ROIBuilder({ session, onChange }: ROIBuilderProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const defaultAssumptions = {
    legacyAtsSeatCost: 1200,
    avgAgencyFee: 15000,
    expectedOrganicShift: 0.25,
    expectedTimeSavings: 0.40,
    lostRevenuePerEmptyDay: 400,
    annualJobBoardSpend: 30000,
    expectedJobBoardSavings: 0.20,
    hrHourlyRate: 40,
    hmHourlyRate: 60,
    hrHoursSavedPerHire: 3,
    hmHoursSavedPerHire: 1.5
  };

  const inputs = {
    hiringManagers: session.roi_inputs?.hiringManagers || 15,
    totalHires: session.roi_inputs?.totalHires || 60,
    agencyHires: session.roi_inputs?.agencyHires || 10,
    timeToHire: session.roi_inputs?.timeToHire || 30,
    legacyAtsSeatCost: session.roi_inputs?.legacyAtsSeatCost ?? defaultAssumptions.legacyAtsSeatCost,
    avgAgencyFee: session.roi_inputs?.avgAgencyFee ?? defaultAssumptions.avgAgencyFee,
    expectedOrganicShift: session.roi_inputs?.expectedOrganicShift ?? defaultAssumptions.expectedOrganicShift,
    expectedTimeSavings: session.roi_inputs?.expectedTimeSavings ?? defaultAssumptions.expectedTimeSavings,
    lostRevenuePerEmptyDay: session.roi_inputs?.lostRevenuePerEmptyDay ?? defaultAssumptions.lostRevenuePerEmptyDay,
    annualJobBoardSpend: session.roi_inputs?.annualJobBoardSpend ?? defaultAssumptions.annualJobBoardSpend,
    expectedJobBoardSavings: session.roi_inputs?.expectedJobBoardSavings ?? defaultAssumptions.expectedJobBoardSavings,
    hrHourlyRate: session.roi_inputs?.hrHourlyRate ?? defaultAssumptions.hrHourlyRate,
    hmHourlyRate: session.roi_inputs?.hmHourlyRate ?? defaultAssumptions.hmHourlyRate,
    hrHoursSavedPerHire: session.roi_inputs?.hrHoursSavedPerHire ?? defaultAssumptions.hrHoursSavedPerHire,
    hmHoursSavedPerHire: session.roi_inputs?.hmHoursSavedPerHire ?? defaultAssumptions.hmHoursSavedPerHire
  };

  const updateField = (field: keyof ROIInputs, value: number) => {
    const nextInputs = { ...inputs, [field]: value || 0 };
    
    // Recalculate Total
    const seatSavings = nextInputs.hiringManagers * nextInputs.legacyAtsSeatCost;
    const agencySavings = Math.round(nextInputs.agencyHires * nextInputs.expectedOrganicShift) * nextInputs.avgAgencyFee;
    const daysSaved = Math.round(nextInputs.timeToHire * nextInputs.expectedTimeSavings);
    const vacancySavings = nextInputs.totalHires * daysSaved * nextInputs.lostRevenuePerEmptyDay;
    const jobBoardSavings = nextInputs.annualJobBoardSpend * nextInputs.expectedJobBoardSavings;
    const adminTimeSavings = (nextInputs.totalHires * nextInputs.hrHoursSavedPerHire * nextInputs.hrHourlyRate) + 
                             (nextInputs.totalHires * nextInputs.hmHoursSavedPerHire * nextInputs.hmHourlyRate);
    
    const totalAnnualValue = seatSavings + agencySavings + vacancySavings + jobBoardSavings + adminTimeSavings;

    updateSessionROI(session.id, nextInputs, totalAnnualValue);
    onChange();
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm mb-6 overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="w-full p-4 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${session.roi_total > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>
            <Calculator className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-stone-900">ROI & Business Case Builder</h4>
            <p className="text-xs text-stone-500">
              {session.roi_total > 0 
                ? `Projected Value: $${session.roi_total.toLocaleString()}` 
                : 'Configure back-of-napkin math'}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
      </button>

      {expanded && (
        <div className="p-5 border-t border-stone-200">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              These variables sync live to the prospect's Discovery Room. Dial in the exact math based on their reality to build an irrefutable business case.
            </p>
          </div>

          {/* Price Trinity — Step 2: Price Anchoring */}
          <div className="rounded-lg border border-orange-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🔺</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Price Trinity — Step 2: Price Anchoring</span>
            </div>
            <p className="text-[11px] font-medium text-amber-900 mb-2 leading-relaxed">
              Stack savings until you hit <span className="font-bold">5-10x ROI</span> against your price. Start with the biggest line item. If one category doesn't get there, add another.
            </p>
            <div className="rounded-md bg-white/70 border border-amber-200 px-3 py-2">
              <p className="text-[10px] font-bold text-amber-800 mb-1">💬 Say This After Calculating:</p>
              <p className="text-[10px] italic text-amber-700 leading-relaxed">
                "Based on the ROI of roughly ${'{'}value{'}'} over 6 months, what would you typically invest to create that kind of outcome?"
              </p>
              <p className="text-[9px] text-amber-600 mt-1.5">
                If they say "I don't know": <span className="font-semibold">"What ROI multiple do you expect — 3x, 5x, 20x?"</span> Back into their budget range.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Active Hiring Managers</label>
              <input 
                type="number"
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                value={inputs.hiringManagers || ''}
                onChange={e => updateField('hiringManagers', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Annual Hires</label>
              <input 
                type="number"
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                value={inputs.totalHires || ''}
                onChange={e => updateField('totalHires', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Annual Agency Hires</label>
              <input 
                type="number"
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                value={inputs.agencyHires || ''}
                onChange={e => updateField('agencyHires', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Avg Time to Hire (Days)</label>
              <input 
                type="number"
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                value={inputs.timeToHire || ''}
                onChange={e => updateField('timeToHire', parseInt(e.target.value))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Annual Job Board Spend ($)</label>
              <input 
                type="number"
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                value={inputs.annualJobBoardSpend || ''}
                onChange={e => updateField('annualJobBoardSpend', parseInt(e.target.value))}
              />
            </div>
          </div>

          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors mb-4 uppercase tracking-widest"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Underlying Assumptions
          </button>

          {showAdvanced && (
            <div className="p-4 rounded-lg border border-stone-200 bg-stone-50 grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <p className="text-[10px] text-stone-500 mb-3">Adjust the baseline formulas used by the Value Stack model.</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Legacy ATS Seat Cost ($/yr)</label>
                <input 
                  type="number"
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                  value={inputs.legacyAtsSeatCost || ''}
                  onChange={e => updateField('legacyAtsSeatCost', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Avg Agency Fee ($)</label>
                <input 
                  type="number"
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                  value={inputs.avgAgencyFee || ''}
                  onChange={e => updateField('avgAgencyFee', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Agency Reliance Shift (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                  value={inputs.expectedOrganicShift || ''}
                  onChange={e => updateField('expectedOrganicShift', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Expected Time Savings (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                  value={inputs.expectedTimeSavings || ''}
                  onChange={e => updateField('expectedTimeSavings', parseFloat(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Lost Revenue per Empty Chair / Day ($)</label>
                <input 
                  type="number"
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                  value={inputs.lostRevenuePerEmptyDay || ''}
                  onChange={e => updateField('lostRevenuePerEmptyDay', parseInt(e.target.value))}
                />
              </div>
              <div className="col-span-2 mt-4">
                <h5 className="text-[10px] font-bold text-stone-900 uppercase tracking-widest border-b border-stone-200 pb-2 mb-3">Job Board Spend Efficiency</h5>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Expected Job Board Spend Reduction (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                  value={inputs.expectedJobBoardSavings || ''}
                  onChange={e => updateField('expectedJobBoardSavings', parseFloat(e.target.value))}
                />
              </div>
              <div className="col-span-2 mt-4">
                <h5 className="text-[10px] font-bold text-stone-900 uppercase tracking-widest border-b border-stone-200 pb-2 mb-3">Admin Time Savings</h5>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">HR Hourly Rate ($/hr)</label>
                <input 
                  type="number"
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                  value={inputs.hrHourlyRate || ''}
                  onChange={e => updateField('hrHourlyRate', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">HM Hourly Rate ($/hr)</label>
                <input 
                  type="number"
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                  value={inputs.hmHourlyRate || ''}
                  onChange={e => updateField('hmHourlyRate', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">HR Hours Saved / Hire</label>
                <input 
                  type="number"
                  step="0.5"
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                  value={inputs.hrHoursSavedPerHire || ''}
                  onChange={e => updateField('hrHoursSavedPerHire', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">HM Hours Saved / Hire</label>
                <input 
                  type="number"
                  step="0.5"
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none"
                  value={inputs.hmHoursSavedPerHire || ''}
                  onChange={e => updateField('hmHoursSavedPerHire', parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
