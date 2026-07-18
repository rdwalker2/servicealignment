import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface ROIConfigPanelProps {
  enabledCategories: Record<string, boolean>;
  onToggleCategory: (key: string) => void;
  assumptions: Record<string, number>;
  onUpdateAssumption: (key: string, value: number) => void;
}

const CATEGORY_META: { key: string; label: string; formula: string }[] = [
  { key: 'seatSavings', label: 'Software License Savings', formula: 'Hiring Managers × Legacy Seat Cost' },
  { key: 'agencySavings', label: 'Reduced Agency Fees', formula: 'Agency Hires × Organic Shift % × Avg Fee' },
  { key: 'vacancySavings', label: 'Empty Role Revenue Recovery', formula: 'Total Hires × Days Saved × Daily Vacancy Cost' },
  { key: 'jobBoardSavings', label: 'Job Board Spend Efficiency', formula: 'Annual Job Board Spend × Savings %' },
  { key: 'adminTimeSavings', label: 'HR & Admin Time Savings', formula: '(HR Hours + HM Hours) × Hires × Hourly Rate' },
];

const ASSUMPTION_META: { key: string; label: string; prefix?: string; suffix?: string }[] = [
  { key: 'legacyAtsSeatCost', label: 'Legacy ATS Seat Cost', prefix: '$' },
  { key: 'avgAgencyFee', label: 'Avg Agency Fee', prefix: '$' },
  { key: 'expectedOrganicShift', label: 'Organic Shift', suffix: '%' },
  { key: 'expectedTimeSavings', label: 'Time Savings', suffix: '%' },
  { key: 'lostRevenuePerEmptyDay', label: 'Daily Vacancy Cost', prefix: '$' },
  { key: 'annualJobBoardSpend', label: 'Annual Job Board Spend', prefix: '$' },
  { key: 'expectedJobBoardSavings', label: 'Job Board Savings', suffix: '%' },
  { key: 'hrHourlyRate', label: 'HR Hourly Rate', prefix: '$' },
  { key: 'hmHourlyRate', label: 'HM Hourly Rate', prefix: '$' },
];

export function ROIConfigPanel({ enabledCategories, onToggleCategory, assumptions, onUpdateAssumption }: ROIConfigPanelProps) {
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-sm mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Settings size={18} className="text-stone-400" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500">
          ROI Configuration
        </h3>
      </div>

      {/* Category Toggles */}
      <div className="space-y-3 mb-5">
        {CATEGORY_META.map(({ key, label, formula }) => {
          const enabled = enabledCategories[key] !== false;
          return (
            <div
              key={key}
              className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 transition-colors hover:border-stone-300"
            >
              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => onToggleCategory(key)}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                style={{ backgroundColor: enabled ? '#10B981' : '#d4d4d8' }}
              >
                <span
                  className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200"
                  style={{ transform: enabled ? 'translateX(22px)' : 'translateX(4px)' }}
                />
              </button>

              {/* Labels */}
              <div className="min-w-0 flex-1">
                <span className={`text-sm font-semibold ${enabled ? 'text-stone-900' : 'text-stone-400 line-through'}`}>
                  {label}
                </span>
                <span className="ml-2 text-xs text-stone-400 hidden sm:inline">{formula}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assumptions Collapsible */}
      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setAssumptionsOpen(!assumptionsOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <span>Hidden Assumptions</span>
          {assumptionsOpen ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
        </button>

        {assumptionsOpen && (
          <div className="border-t border-stone-100 px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ASSUMPTION_META.map(({ key, label, prefix, suffix }) => {
              const rawValue = assumptions[key] ?? 0;
              // For percentage fields stored as decimals (0.25 → 25)
              const isPercentField = suffix === '%';
              const displayValue = isPercentField ? Math.round(rawValue * 100) : rawValue;

              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-stone-500" htmlFor={`assumption-${key}`}>
                    {label}
                  </label>
                  <div className="flex items-center rounded-md border border-stone-200 bg-stone-50 overflow-hidden focus-within:ring-2 focus-within:ring-stone-300 focus-within:border-stone-300 transition-all">
                    {prefix && (
                      <span className="px-2 text-xs text-stone-400 select-none">{prefix}</span>
                    )}
                    <input
                      id={`assumption-${key}`}
                      type="number"
                      value={displayValue}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateAssumption(key, isPercentField ? val / 100 : val);
                      }}
                      className="w-full bg-transparent px-2 py-1.5 text-sm text-stone-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    {suffix && (
                      <span className="px-2 text-xs text-stone-400 select-none">{suffix}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
