import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Users, Banknote, Target, Clock } from 'lucide-react';
import { updateSessionROI, getSession } from '../../lib/discoveryDatabase';

interface BusinessImpactCalculatorProps {
    companyName: string;
    themeColor?: string;
    sessionId?: string;
    roiQuotes?: Record<string, string>;
    enabledCategories?: {
      seatSavings?: boolean;
      agencySavings?: boolean;
      vacancySavings?: boolean;
      jobBoardSavings?: boolean;
      adminTimeSavings?: boolean;
      costOfIndecision?: boolean;
    };
}

export function BusinessImpactCalculator({ themeColor = '#10B981', sessionId, roiQuotes, enabledCategories }: BusinessImpactCalculatorProps) {
    const session = sessionId ? getSession(sessionId) : null;
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
    
    const initialInputs = {
        hiringManagers: session?.roi_inputs?.hiringManagers || session?.room_roi_open_reqs || 15,
        totalHires: session?.roi_inputs?.totalHires || 60,
        agencyHires: session?.roi_inputs?.agencyHires || 10,
        timeToHire: session?.roi_inputs?.timeToHire || session?.room_roi_time_to_fill || 30,
        legacyAtsSeatCost: session?.roi_inputs?.legacyAtsSeatCost ?? defaultAssumptions.legacyAtsSeatCost,
        avgAgencyFee: session?.roi_inputs?.avgAgencyFee ?? defaultAssumptions.avgAgencyFee,
        expectedOrganicShift: session?.roi_inputs?.expectedOrganicShift ?? defaultAssumptions.expectedOrganicShift,
        expectedTimeSavings: session?.roi_inputs?.expectedTimeSavings ?? defaultAssumptions.expectedTimeSavings,
        lostRevenuePerEmptyDay: session?.roi_inputs?.lostRevenuePerEmptyDay ?? defaultAssumptions.lostRevenuePerEmptyDay,
        annualJobBoardSpend: session?.roi_inputs?.annualJobBoardSpend ?? defaultAssumptions.annualJobBoardSpend,
        expectedJobBoardSavings: session?.roi_inputs?.expectedJobBoardSavings ?? defaultAssumptions.expectedJobBoardSavings,
        hrHourlyRate: session?.roi_inputs?.hrHourlyRate ?? defaultAssumptions.hrHourlyRate,
        hmHourlyRate: session?.roi_inputs?.hmHourlyRate ?? defaultAssumptions.hmHourlyRate,
        hrHoursSavedPerHire: session?.roi_inputs?.hrHoursSavedPerHire ?? defaultAssumptions.hrHoursSavedPerHire,
        hmHoursSavedPerHire: session?.roi_inputs?.hmHoursSavedPerHire ?? defaultAssumptions.hmHoursSavedPerHire
    };

    const [hiringManagers, setHiringManagers] = useState(initialInputs.hiringManagers);
    const [totalHires, setTotalHires] = useState(initialInputs.totalHires);
    const [agencyHires, setAgencyHires] = useState(initialInputs.agencyHires);
    const [timeToHire, setTimeToHire] = useState(initialInputs.timeToHire);

    // Hardcoded assumptions for the "Value Stack" ROI model (now driven by initialInputs but currently static in UI)
    const legacyAtsSeatCost = initialInputs.legacyAtsSeatCost;
    const avgAgencyFee = initialInputs.avgAgencyFee;
    const expectedOrganicShift = initialInputs.expectedOrganicShift;
    const expectedTimeSavings = initialInputs.expectedTimeSavings;
    const lostRevenuePerEmptyDay = initialInputs.lostRevenuePerEmptyDay;
    const annualJobBoardSpend = initialInputs.annualJobBoardSpend;
    const expectedJobBoardSavings = initialInputs.expectedJobBoardSavings;
    const hrHourlyRate = initialInputs.hrHourlyRate;
    const hmHourlyRate = initialInputs.hmHourlyRate;
    const hrHoursSavedPerHire = initialInputs.hrHoursSavedPerHire;
    const hmHoursSavedPerHire = initialInputs.hmHoursSavedPerHire;

    // Calculations
    const seatSavings = hiringManagers * legacyAtsSeatCost;
    const agencySavings = Math.round(agencyHires * expectedOrganicShift) * avgAgencyFee;
    const daysSaved = Math.round(timeToHire * expectedTimeSavings);
    const vacancySavings = totalHires * daysSaved * lostRevenuePerEmptyDay;
    const jobBoardSavings = annualJobBoardSpend * expectedJobBoardSavings;
    const adminTimeSavings = (totalHires * hrHoursSavedPerHire * hrHourlyRate) + 
                             (totalHires * hmHoursSavedPerHire * hmHourlyRate);

    // ── Cost of Indecision (prospect-facing, driven by rep config) ──
    const coi = session?.coi_config;
    const coiVacancyCost = (coi?.openRoles ?? 0) * ((coi?.avgSalary ?? 0) / 3);
    const coiAdminCost = (coi?.recruiterCount ?? 0) * (coi?.hoursWasted ?? 0) * ((coi?.recruiterSalary ?? 0) / 2080) * 52;
    const coiDropOffHires = Math.round((coi?.hiresPerYear ?? 0) * ((coi?.dropOffRate ?? 0) / 100));
    const coiDropOffCost = coiDropOffHires * ((coi?.currentTTF ?? 0) * ((coi?.avgSalary ?? 0) / 365) * 0.3);
    const coiAgencyCost = Math.round((coi?.hiresPerYear ?? 0) * 0.15) * (coi?.agencySpendPerHire ?? 0);
    const coiAnnualCost = Math.round(coiVacancyCost + coiAdminCost + coiDropOffCost + coiAgencyCost);
    const coiPerMonth = Math.round(coiAnnualCost / 12);
    const coiDaysSaved = (coi?.currentTTF ?? 0) - (coi?.projectedTTF ?? 0);
    
    const cats = {
      seatSavings: enabledCategories?.seatSavings !== false,
      agencySavings: enabledCategories?.agencySavings !== false,
      vacancySavings: enabledCategories?.vacancySavings !== false,
      jobBoardSavings: enabledCategories?.jobBoardSavings !== false,
      adminTimeSavings: enabledCategories?.adminTimeSavings !== false,
      costOfIndecision: enabledCategories?.costOfIndecision !== false,
    };

    const totalAnnualValue = 
      (cats.seatSavings ? seatSavings : 0) + 
      (cats.agencySavings ? agencySavings : 0) + 
      (cats.vacancySavings ? vacancySavings : 0) + 
      (cats.jobBoardSavings ? jobBoardSavings : 0) + 
      (cats.adminTimeSavings ? adminTimeSavings : 0) +
      (cats.costOfIndecision ? coiAnnualCost : 0);

    // Persist ROI data to the discovery session with a 500ms debounce
    useEffect(() => {
        if (!sessionId) return;

        const timer = setTimeout(() => {
            updateSessionROI(
                sessionId,
                { 
                    hiringManagers, 
                    totalHires, 
                    agencyHires, 
                    timeToHire,
                    legacyAtsSeatCost,
                    avgAgencyFee,
                    expectedOrganicShift,
                    expectedTimeSavings,
                    lostRevenuePerEmptyDay,
                    annualJobBoardSpend,
                    expectedJobBoardSavings,
                    hrHourlyRate,
                    hmHourlyRate,
                    hrHoursSavedPerHire,
                    hmHoursSavedPerHire
                },
                totalAnnualValue
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [sessionId, hiringManagers, totalHires, agencyHires, timeToHire, totalAnnualValue, legacyAtsSeatCost, avgAgencyFee, expectedOrganicShift, expectedTimeSavings, lostRevenuePerEmptyDay, annualJobBoardSpend, expectedJobBoardSavings, hrHourlyRate, hmHourlyRate, hrHoursSavedPerHire, hmHoursSavedPerHire]);

    // Investment: pull from session pricing if available, else fallback
    const sessionPrice = session?.pricing_base_price;
    const sessionAddOns = (session?.pricing_add_ons ?? []).filter((a: any) => a.included && !a.waived).reduce((sum: number, a: any) => sum + (a.price || 0), 0);
    const discountPct = session?.pricing_discount_pct ?? 0;
    const rawInvestment = (sessionPrice || 18000) + sessionAddOns;
    const ttInvestment = Math.round(rawInvestment * (1 - discountPct / 100));

    const roiMultiplier = (totalAnnualValue / ttInvestment).toFixed(1);
    const roiPercent = Math.round(((totalAnnualValue - ttInvestment) / ttInvestment) * 100);
    const paybackMonths = totalAnnualValue > 0 ? ((ttInvestment / totalAnnualValue) * 12).toFixed(1) : '—';

    return (
        <div className="w-full">
            <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Inputs */}
                <div className="lg:col-span-5 space-y-8">
                    <div>
                        <h3 className="mb-6 text-xl font-bold text-stone-900 flex items-center gap-2">
                            <Calculator className="text-stone-400" />
                            Current Baseline
                        </h3>
                        
                        {/* Slider 1: Hiring Managers */}
                        <div className="mb-6">
                            <div className="mb-2 flex justify-between">
                                <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
                                    <Users size={16} className="text-stone-400"/>
                                    Active Hiring Managers
                                </label>
                                <span className="font-bold text-stone-900">{hiringManagers}</span>
                            </div>
                            <input
                                type="range"
                                min="2"
                                max="100"
                                step="1"
                                value={hiringManagers}
                                onChange={(e) => setHiringManagers(Number(e.target.value))}
                                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-stone-900"
                                style={{ accentColor: themeColor }}
                            />
                            <p className="mt-2 text-xs text-stone-500">
                                Legacy software charges for every user. We don't.
                            </p>
                        </div>

                        {/* Slider 2: Total Hires */}
                        <div className="mb-6">
                            <div className="mb-2 flex justify-between">
                                <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
                                    <Target size={16} className="text-stone-400"/>
                                    Total Annual Hires
                                </label>
                                <span className="font-bold text-stone-900">{totalHires}</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="500"
                                step="5"
                                value={totalHires}
                                onChange={(e) => setTotalHires(Number(e.target.value))}
                                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200"
                                style={{ accentColor: themeColor }}
                            />
                            <p className="mt-2 text-xs text-stone-500">
                                Total roles filled across the entire business each year.
                            </p>
                        </div>

                        {/* Slider 3: Agency Hires */}
                        <div className="mb-6">
                            <div className="mb-2 flex justify-between">
                                <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
                                    <Banknote size={16} className="text-stone-400"/>
                                    Annual Agency Hires
                                </label>
                                <span className="font-bold text-stone-900">{agencyHires}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={agencyHires}
                                onChange={(e) => setAgencyHires(Number(e.target.value))}
                                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200"
                                style={{ accentColor: themeColor }}
                            />
                            <p className="mt-2 text-xs text-stone-500">
                                Hires made through expensive external recruiters.
                            </p>
                        </div>

                        {/* Slider 4: Time to Hire */}
                        <div>
                            <div className="mb-2 flex justify-between">
                                <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
                                    <Clock size={16} className="text-stone-400"/>
                                    Days to Fill an Empty Role
                                </label>
                                <span className="font-bold text-stone-900">{timeToHire} days</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="120"
                                step="1"
                                value={timeToHire}
                                onChange={(e) => setTimeToHire(Number(e.target.value))}
                                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200"
                                style={{ accentColor: themeColor }}
                            />
                            <p className="mt-2 text-xs text-stone-500">
                                How long a role sits empty, costing the business productivity.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Outputs */}
                <div className="lg:col-span-7">
                    <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
                        <h3 className="mb-6 text-sm font-bold text-stone-400">
                            The "Value Stack" Impact
                        </h3>

                        <div className="space-y-6">
                            {/* Value 1 */}
                            {cats.seatSavings && (
                              <>
                                <div className="flex items-center justify-between border-b border-stone-100 pb-6">
                                    <div>
                                        <h4 className="font-semibold text-stone-900">Software License Savings</h4>
                                        <p className="text-sm text-stone-500">Service Alignment is flat-fee. You save on every manager you add.</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-emerald-600">
                                            +${seatSavings.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {roiQuotes?.['tool-sprawl-centralization'] && (
                                  <div className="mt-1 mb-4 px-3 py-2 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg">
                                    <p className="text-xs text-amber-800 italic leading-relaxed">
                                      "{roiQuotes['tool-sprawl-centralization']}"
                                    </p>
                                    <span className="text-[10px] text-amber-600 font-medium mt-1 block">— Prospect</span>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Value 2 */}
                            {cats.agencySavings && (
                            <div className="flex items-center justify-between border-b border-stone-100 pb-6">
                                <div>
                                    <h4 className="font-semibold text-stone-900">Reduced Agency Fees</h4>
                                    <p className="text-sm text-stone-500">A modern career site attracts organic applicants, cutting agency costs.</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-emerald-600">
                                        +${agencySavings.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            )}

                            {/* Value 3 */}
                            {cats.vacancySavings && (
                            <div className="flex items-center justify-between border-b border-stone-100 pb-6">
                                <div>
                                    <h4 className="font-semibold text-stone-900">Empty Role Revenue Recovery</h4>
                                    <p className="text-sm text-stone-500">Filling {totalHires} roles {daysSaved} days faster recovers lost productivity.</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-emerald-600">
                                        +${vacancySavings.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            )}

                            {/* Value 4 */}
                            {cats.jobBoardSavings && (
                            <div className="flex items-center justify-between border-b border-stone-100 pb-6">
                                <div>
                                    <h4 className="font-semibold text-stone-900">Job Board Spend Efficiency</h4>
                                    <p className="text-sm text-stone-500">Centralized analytics reduces wasted spend by {expectedJobBoardSavings * 100}%.</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-emerald-600">
                                        +${jobBoardSavings.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            )}

                            {/* Value 5 */}
                            {cats.adminTimeSavings && (
                              <>
                                <div className="flex items-center justify-between border-b border-stone-100 pb-6">
                                    <div>
                                        <h4 className="font-semibold text-stone-900">HR & Admin Time Savings</h4>
                                        <p className="text-sm text-stone-500">Automated workflows save {hrHoursSavedPerHire}h/hire for HR and {hmHoursSavedPerHire}h/hire for Managers.</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-emerald-600">
                                            +${adminTimeSavings.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {roiQuotes?.['recruiter-admin-heavy'] && (
                                  <div className="mt-1 mb-4 px-3 py-2 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg">
                                    <p className="text-xs text-amber-800 italic leading-relaxed">
                                      "{roiQuotes['recruiter-admin-heavy']}"
                                    </p>
                                    <span className="text-[10px] text-amber-600 font-medium mt-1 block">— Prospect</span>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Value 6: Cost of Indecision */}
                            {cats.costOfIndecision && coiAnnualCost > 0 && (
                            <div className="flex items-center justify-between border-b border-red-100 pb-6">
                                <div>
                                    <h4 className="font-semibold text-stone-900">Cost of Indecision</h4>
                                    <p className="text-sm text-stone-500">
                                        Every month of delay costs ~${coiPerMonth.toLocaleString()}. 
                                        {coiDaysSaved > 0 && ` Service Alignment fills roles ${coiDaysSaved} days faster.`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-red-600">
                                        −${coiAnnualCost.toLocaleString()}
                                    </span>
                                    <p className="text-[10px] text-red-400 font-medium">cost of doing nothing</p>
                                </div>
                            </div>
                            )}

                            {/* Total Impact */}
                            <div className="pt-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h4 className="text-lg font-bold text-stone-900">Total Projected Value Creation</h4>
                                    <span className="text-3xl font-bold text-stone-900">
                                        ${totalAnnualValue.toLocaleString()}
                                    </span>
                                </div>
                                
                                <motion.div 
                                    className="mt-6 flex items-center gap-4 rounded-xl p-4"
                                    style={{ backgroundColor: `${themeColor}15` }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={roiMultiplier}
                                >
                                    <TrendingUp className="h-8 w-8" style={{ color: themeColor }} />
                                    <div>
                                        <div className="text-sm font-medium text-stone-700">Estimated ROI Multiplier</div>
                                        <div className="text-xl font-bold" style={{ color: themeColor }}>
                                            {roiMultiplier}x return on investment ({roiPercent}% ROI)
                                        </div>
                                        <div className="text-sm text-stone-500 mt-0.5">
                                            Payback period: <strong className="text-stone-700">{paybackMonths} months</strong> · Investment: <strong className="text-stone-700">${ttInvestment.toLocaleString()}</strong>/yr
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Cumulative delay timeline (inline, when CoI enabled) */}
                                {cats.costOfIndecision && coiAnnualCost > 0 && (
                                  <div className="mt-6 pt-4 border-t border-stone-100">
                                    <p className="text-xs font-bold text-stone-400 mb-3">Cumulative Cost of Delay</p>
                                    <div className="space-y-1.5">
                                      {[1, 3, 6, 12].map(m => {
                                        const cost = coiPerMonth * m;
                                        const widthPct = coiAnnualCost > 0 ? Math.min((cost / coiAnnualCost) * 100, 100) : 0;
                                        const isAtOrPast = (coi?.monthsSinceDiscussed ?? 0) >= m;
                                        return (
                                          <div key={m} className="flex items-center gap-2">
                                            <span className="text-[11px] font-medium text-stone-500 w-14 shrink-0 text-right">{m}mo</span>
                                            <div className="flex-1 relative h-6 rounded-md bg-stone-100 overflow-hidden">
                                              <motion.div
                                                className={`h-full rounded-md ${isAtOrPast ? 'bg-red-400' : 'bg-stone-300'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${widthPct}%` }}
                                                transition={{ duration: 0.5, delay: m * 0.03 }}
                                              />
                                              <span className="absolute inset-y-0 left-2 flex items-center text-[11px] font-bold text-stone-700">
                                                ${cost.toLocaleString()}
                                              </span>
                                              {m === (coi?.monthsSinceDiscussed ?? 0) && (
                                                <span className="absolute inset-y-0 right-2 flex items-center text-[9px] font-bold text-red-700">
                                                  ← you are here
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
