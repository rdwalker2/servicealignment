import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ShieldCheck, Handshake,
  ListChecks, BarChart3, Trophy, ArrowRight, Clock,
  Users, GraduationCap,
} from 'lucide-react';

import {
  getSession,
  updateSessionAlignment,
  approveBlueprint,
  updateSessionFromGranola,
  type AlignmentChecks,
} from '../../lib/discoveryDatabase';
import { computePricing, computePackagePricing } from '../../lib/pricingUtils';
import type { PricingAddOn, PricingDivision, PricingSetupType } from '../../lib/discoveryDatabase';



// ── Pain → Feature highlight mapping ──

const PAIN_FEATURE_MAP: Record<string, string> = {
  'outdated-career-site': 'Career Site Builder (Drag & Drop)',
  'unmeasurable-brand-roi': 'Reporting & Analytics Dashboards',
  'dead-nurture-pipeline': 'Nurture Email Campaigns',
  'engineering-dependency': 'Career Site Builder (Drag & Drop)',
  'weak-talent-pools': 'Candidate CRM & Connect Talent Pools',
  'inconsistent-interviews': 'Interview Kits & Structured Scorecards',
  'poor-candidate-experience': 'Career Site Builder (Drag & Drop)',
  'screening-bottleneck': 'AI Co-pilot (Resume Summaries, Job Ad Drafting, Video Transcription)',
  'compliance-bottlenecks': 'GDPR Compliance & Data Protection',
  'locked-out-managers': 'Mobile App (iOS & Android)',
  'weak-referrals': 'Employee Referrals',
  'onboarding-gaps': 'Onboarding Module',
};



// ── Constants ──

const ALIGNMENT_ITEMS: {
  key: keyof AlignmentChecks;
  icon: typeof ListChecks;
  emoji: string;
  title: string;
  question: string;
  description: string;
}[] = [
  {
    key: 'problems_solutions',
    icon: ListChecks,
    emoji: '✅',
    title: 'Problems & Solutions',
    question: 'Are we aligned on the problems to be solved and how we solve them?',
    description: 'We\'ve mapped each of your pain points to a specific Service Alignment capability.',
  },
  {
    key: 'roi_sufficient',
    icon: BarChart3,
    emoji: '📊',
    title: 'ROI Sufficient',
    question: 'Are we aligned on the outcomes, and is the projected ROI sufficient?',
    description: 'The value projection justifies the investment and then some.',
  },
  {
    key: 'right_solution',
    icon: Trophy,
    emoji: '🏆',
    title: 'Right Solution',
    question: 'With alignment on all of that… are we the right solution?',
    description: 'This is the final confirmation that Service Alignment is the partner to move forward with.',
  },
];




// ── Props ──

interface Props {
  companyName: string;
  themeColor: string;
  sessionId?: string;
  session?: import('../../lib/discoveryDatabase').DiscoverySession;
  selectedPainIds?: string[];
  onApprove: () => void;
  problemStatement?: string;
  businessImpact?: string;
  urgencyReason?: string;
  costOfProblem?: string;
  dateToSolve?: string;
  priorityRating?: string;
}

// ── Component ──

export default function SolutionProposal({
  companyName,
  themeColor = '#1c1917',
  sessionId,
  session: sessionProp,
  selectedPainIds = [],
  onApprove,
  problemStatement,
  businessImpact,
  urgencyReason,
  costOfProblem,
  dateToSolve,
  priorityRating,
}: Props) {
  const [roiTotal, setRoiTotal] = useState(0);
  const [checks, setChecks] = useState<AlignmentChecks>({ urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false });
  const [commitments, setCommitments] = useState<import('../../lib/discoveryDatabase').MutualCommitments>({ executive_sponsor: false, dedicated_admin: false, training_completion: false });
  const [approved, setApproved] = useState(false);

  // Load the session: prefer the passed prop, fall back to fetching by ID
  const [fetchedSession, setFetchedSession] = useState<import('../../lib/discoveryDatabase').DiscoverySession | null>(null);
  useEffect(() => {
    if (sessionProp) return; // don't fetch if session was passed as prop
    if (!sessionId) return;
    const s = getSession(sessionId);
    if (s) setFetchedSession(s);
  }, [sessionId, sessionProp]);

  const liveSession = sessionProp || fetchedSession;

  // Load non-pricing fields from session
  useEffect(() => {
    if (!liveSession) return;
    setRoiTotal(liveSession.roi_total);
    const next = liveSession.alignment_checks ?? { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false };
    // Auto-derive the reinforcement checks from scales
    if (liveSession.priority_self_rating && liveSession.priority_self_rating >= 7) {
      next.urgent_priority = true;
    }
    if (liveSession.ability_self_rating && liveSession.ability_self_rating >= 7) {
      next.resources_insufficient = true;
    }
    setChecks(next);
    setCommitments(liveSession.mutual_commitments ?? { executive_sponsor: false, dedicated_admin: false, training_completion: false });
    setApproved(liveSession.blueprint_approved);
  }, [liveSession]);

  // ── Compute all pricing from the shared utility ──
  const pricing = computePricing(liveSession ?? null);
  const {
    computedDealValue, isMultiEntity, divisionTotal, effectiveBase,
    addOnsTotal, subtotal, discountAmount, annualTotal,
    hasAddOns, hasDiscount, isCustomProposal, tier,
    pricingContractTerm, pricingDiscountPct, pricingAddOns, pricingNotes,
    pricingPriceCapPct, pricingPromoFreeMonths, pricingPromoLabel,
    pricingSetupType, pricingDivisions, pricingPresentationStyle, pricingPackages,
  } = pricing;

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  useEffect(() => {
    if (liveSession?.selected_pricing_package_id) {
      setSelectedPackageId(liveSession.selected_pricing_package_id);
    } else if (pricingPackages.length > 0 && !selectedPackageId) {
      setSelectedPackageId(pricingPackages[1]?.id ?? null);
    }
  }, [liveSession, pricingPackages, selectedPackageId]);

  const currencySymbol = '$';

  // Derive the unique pain-matched features for this prospect
  const painMatchedFeatures = Array.from(
    new Set(selectedPainIds.map(id => PAIN_FEATURE_MAP[id]).filter(Boolean))
  );

  const allChecked = checks.problems_solutions && checks.roi_sufficient && checks.right_solution;
  const allCommitmentsChecked = Object.values(commitments).every(Boolean);
  const hasCustomStandards = (liveSession?.custom_minimum_standards?.length ?? 0) > 0;
  const allCustomStandardsChecked = hasCustomStandards
    ? liveSession!.custom_minimum_standards!.every(s => s.checked)
    : true;
  const canApprove = allChecked && (hasCustomStandards ? allCustomStandardsChecked : allCommitmentsChecked);

  const handleCheck = useCallback((key: keyof AlignmentChecks, value: boolean) => {
    const next = { ...checks, [key]: value };
    setChecks(next);
    if (sessionId) updateSessionAlignment(sessionId, next, commitments);
  }, [checks, commitments, sessionId]);

  const handleCommitmentCheck = useCallback((key: keyof import('../../lib/discoveryDatabase').MutualCommitments, value: boolean) => {
    const next = { ...commitments, [key]: value };
    setCommitments(next);
    if (sessionId) updateSessionAlignment(sessionId, checks, next);
  }, [commitments, checks, sessionId]);

  const handleApprove = useCallback(() => {
    if (sessionId) {
      updateSessionAlignment(sessionId, checks, commitments);
      approveBlueprint(sessionId);
    }
    setApproved(true);
    onApprove();
  }, [sessionId, checks, onApprove]);



  const cardReveal = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="w-full">



      {/* ──────────────────────────────────────────────────── */}
      {/* SECTION 1: Your Investment                          */}
      {/* ──────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={cardReveal} transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold tracking-[0.15em] text-stone-400">
            Your Investment
          </p>
          <h2 className="mb-4 text-3xl font-bold text-stone-900">
            Simple, Transparent Pricing
          </h2>
          {roiTotal > 0 && (
            <p className="mx-auto max-w-2xl text-stone-500">
              Based on your ROI projection of{' '}
              <span className="font-bold text-stone-900">
                ${roiTotal.toLocaleString()}
              </span>
              , your investment is…
            </p>
          )}
        </div>

        {pricingPresentationStyle === 'options' && pricingPackages.length > 0 ? (
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {pricingPackages.map((pkg, idx) => {
              const isSelected = selectedPackageId === pkg.id;
              const isPopular = idx === 1; // Center package is usually 'Better'
              
              const { pkgTotal } = computePackagePricing(effectiveBase, pricingAddOns, pkg.addon_ids, pricingDiscountPct);

              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    setSelectedPackageId(pkg.id);
                    if (sessionId) {
                      updateSessionFromGranola(sessionId, { selected_pricing_package_id: pkg.id });
                    }
                  }}
                  className={`relative cursor-pointer overflow-hidden rounded-3xl p-8 transition-all duration-300 ${
 isSelected
 ? 'bg-stone-900 text-white shadow-2xl ring-2 ring-[#0ea5e9]'
 : 'bg-white text-stone-900 shadow hover:shadow-xl'
 }`}
                  style={isSelected ? { transform: 'translateY(-8px)' } : {}}
                >
                  {isPopular && (
                    <div className="absolute left-0 right-0 top-0 bg-[#0ea5e9] py-1.5 text-center text-[10px] font-bold text-white">
                      Recommended
                    </div>
                  )}
                  <div className={`mb-6 ${isPopular ? 'mt-4' : ''}`}>
                    <h3 className="mb-2 text-xl font-bold">{pkg.name}</h3>
                    <p className={`text-sm ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                      {pkg.description}
                    </p>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{currencySymbol}{pkgTotal.toLocaleString()}</span>
                      <span className={`text-sm font-medium ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>/ year</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className={`text-[10px] font-bold ${isSelected ? 'text-stone-500' : 'text-stone-400'}`}>
                      Includes
                    </p>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${isSelected ? 'text-[#0ea5e9]' : 'text-[#0ea5e9]'}`} />
                        <span className={`font-semibold ${isSelected ? 'text-white' : 'text-stone-900'}`}>Service Alignment Core Platform</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${isSelected ? 'text-[#0ea5e9]' : 'text-[#0ea5e9]'}`} />
                        <span className={isSelected ? 'text-stone-300' : 'text-stone-600'}>Unlimited users & jobs</span>
                      </li>
                      {pkg.addon_ids.map(addonId => {
                        const addon = pricingAddOns.find(a => a.id === addonId);
                        if (!addon) return null;
                        return (
                          <li key={addonId} className="flex items-start gap-3">
                            <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${isSelected ? 'text-[#0ea5e9]' : 'text-[#0ea5e9]'}`} />
                            <span className={isSelected ? 'text-stone-300' : 'text-stone-600'}>{addon.name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <button
                      className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
 isSelected
 ? 'bg-[#0ea5e9] text-white hover:bg-[#0284c7]'
 : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
 }`}
                    >
                      {isSelected ? 'Selected' : 'Select Package'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-stone-900 text-white shadow-2xl">
          <div className="p-8">
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-xl font-bold">Service Alignment Platform</h3>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: `${themeColor}30`, color: themeColor }}
              >
                All-in-One
              </span>
            </div>
            <p className="mb-6 text-sm text-stone-400">
              Unlimited users, unlimited support. No per-seat fees, ever.
            </p>
            {isCustomProposal && !isMultiEntity ? (
              <div className="mb-8">
                <span className="text-3xl font-bold text-white">Custom Proposal</span>
                <p className="text-sm text-stone-400 mt-1">Enterprise pricing tailored to your organization</p>
              </div>
            ) : isMultiEntity ? (
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{currencySymbol}{divisionTotal.toLocaleString()}</span>
                  <span className="text-sm font-medium text-stone-400">/ year</span>
                </div>
                <p className="text-sm text-stone-400 mt-1">
                  {pricingDivisions.length} {pricingSetupType === 'divisions' ? 'division' : 'platform'}{pricingDivisions.length !== 1 ? 's' : ''} · {pricingDivisions.reduce((s, d) => s + d.employeeCount, 0).toLocaleString()} total FTE · USD
                  {pricingContractTerm > 1 && ` · ${pricingContractTerm}-Year Term`}
                </p>
                {/* Per-division breakdown */}
                <div className="mt-4 space-y-1.5 border-t border-stone-700 pt-3">
                  <p className="text-[10px] font-bold text-stone-500 mb-2">
                    {pricingSetupType === 'divisions' ? 'Division' : 'Platform'} Breakdown
                  </p>
                  {pricingDivisions.map(div => (
                    <div key={div.id} className="flex items-center justify-between text-sm">
                      <span className="text-stone-400">{div.label || 'Unnamed'} <span className="text-stone-600">({div.employeeCount > 0 ? `${div.employeeCount.toLocaleString()} FTE` : '—'})</span></span>
                      <span className="font-semibold text-stone-300">{div.price > 0 ? `${currencySymbol}${div.price.toLocaleString()}/yr` : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{currencySymbol}{computedDealValue.toLocaleString()}</span>
                  <span className="text-sm font-medium text-stone-400">/ year</span>
                </div>
                {tier && (
                  <p className="text-sm text-stone-400 mt-1">
                    {tier.label} employees · USD
                    {pricingContractTerm > 1 && ` · ${pricingContractTerm}-Year Term`}
                  </p>
                )}
              </div>
            )}

            {/* Pain-anchored features: only show what matters to this prospect */}
            {painMatchedFeatures.length > 0 && (
              <ul className="space-y-2.5 text-sm font-medium text-stone-300">
                {painMatchedFeatures.map(feat => (
                  <li key={feat} className="flex items-start gap-3">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: themeColor }}
                    />
                    <span className="font-bold text-white">{feat}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className={`text-sm text-stone-400 ${painMatchedFeatures.length > 0 ? 'mt-4 pt-3 border-t border-stone-700' : ''}`}>
              Plus full platform access — unlimited users, jobs & career sites
            </p>

            {/* Add-Ons */}
            {hasAddOns && (
              <div className="mt-6 pt-4 border-t border-stone-700">
                <p className="text-xs font-bold text-stone-400 mb-3">Add-Ons</p>
                <div className="space-y-2">
                  {pricingAddOns.filter(a => a.included).map(addon => (
                    <div key={addon.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-sm text-stone-300">{addon.name}</span>
                      </div>
                      {addon.waived ? (
                        <span className="text-sm font-semibold text-emerald-400">Included</span>
                      ) : (
                        <span className="text-sm font-semibold text-stone-300">{currencySymbol}{addon.price.toLocaleString()}/yr</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investment Summary — always show when pricing is configured */}
            {(computedDealValue > 0 || hasAddOns || hasDiscount) && (
              <div className="mt-6 pt-4 border-t border-stone-700">
                <p className="text-xs font-bold text-stone-400 mb-3">Investment Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-stone-400">
                    <span>Platform Base</span>
                    <span>{currencySymbol}{computedDealValue.toLocaleString()}</span>
                  </div>
                  {hasAddOns && (
                    <div className="flex justify-between text-stone-400">
                      <span>Add-Ons</span>
                      <span>+{currencySymbol}{addOnsTotal.toLocaleString()}</span>
                    </div>
                  )}
                  {hasDiscount && (
                    <div className="flex justify-between text-emerald-400">
                      <span>{pricingContractTerm > 1 ? `${pricingContractTerm}-Year Discount` : 'Discount'} ({pricingDiscountPct}%)</span>
                      <span>-{currencySymbol}{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-stone-700 flex justify-between text-white font-bold text-base">
                    <span>Year 1 Investment</span>
                    <span>{currencySymbol}{annualTotal.toLocaleString()}</span>
                  </div>

                  {/* Year 2+ Ongoing (same total minus any first-year-only promos) */}
                  {computedDealValue > 0 && (
                    <div className="flex justify-between text-stone-400 text-sm pt-1">
                      <span>Year 2+ Ongoing</span>
                      <span>{currencySymbol}{annualTotal.toLocaleString()}/yr</span>
                    </div>
                  )}

                  {/* Contract Terms */}
                  {(pricingPriceCapPct != null || (pricingPromoFreeMonths != null && pricingPromoFreeMonths > 0)) && (
                    <div className="pt-2 mt-2 border-t border-stone-700 space-y-1.5">
                      {pricingPriceCapPct != null && (
                        <div className="flex items-center gap-2 text-sm text-emerald-400">
                          <span>✓</span>
                          <span>{pricingPriceCapPct}% Annual Price Cap</span>
                        </div>
                      )}
                      {pricingPromoFreeMonths != null && pricingPromoFreeMonths > 0 && (
                        <div className="flex items-center gap-2 text-sm text-emerald-400">
                          <span>✓</span>
                          <span>{pricingPromoLabel || 'Promo'}: {pricingPromoFreeMonths} free month{pricingPromoFreeMonths !== 1 ? 's' : ''} added</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Notes */}
            {pricingNotes && (
              <div className="mt-4 p-3 rounded-lg bg-stone-800/50 border border-stone-700">
                <p className="text-xs italic text-stone-400">{pricingNotes}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 bg-black/20 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm font-medium text-stone-300">
              <ShieldCheck size={18} className="text-stone-500" />
              Dedicated implementation + data migration included
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-stone-300">
              <Clock size={18} className="text-stone-500" />
              Live in under 45 days
            </div>
          </div>

          {/* What's Included at No Extra Cost */}
          <div className="rounded-b-3xl border-t border-stone-800 bg-stone-950 px-8 py-6">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <h4 className="text-sm font-bold text-white">What's Included at No Extra Cost</h4>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                'Implementation, Hypercare & Training (Dedicated CSM)',
                'Future Product Updates (every 6-8 weeks)',
                'Unlimited Users, Jobs & Career Sites',
                'Weekly Training Webinars',
                'Live 24-Hour Chat Support (Mon-Fri, <2 min response)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-stone-400">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        )}
      </motion.section>



      {/* ──────────────────────────────────────────────────── */}
      {/* SECTION 2: Checkpoint Reinforcement                 */}
      {/* ──────────────────────────────────────────────────── */}
      {(liveSession?.priority_self_rating || liveSession?.ability_self_rating) && (
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={cardReveal} transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <div className="mx-auto max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority Scale */}
              {liveSession?.priority_self_rating && (
                <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-rose-50 to-white p-6 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-3">Your Priority Rating</p>
                  <div className="relative mx-auto mb-4" style={{ width: 80, height: 80 }}>
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#f5f5f4" strokeWidth="6" />
                      <circle
                        cx="40" cy="40" r="34" fill="none"
                        stroke={liveSession.priority_self_rating >= 8 ? '#ef4444' : liveSession.priority_self_rating >= 5 ? '#f59e0b' : '#a3a3a3'}
                        strokeWidth="6"
                        strokeDasharray={`${(liveSession.priority_self_rating / 10) * 213.6} 213.6`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-stone-900">{liveSession.priority_self_rating}</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-stone-700">
                    {liveSession.priority_self_rating >= 8 ? 'Urgent Priority' : liveSession.priority_self_rating >= 5 ? 'Moderate Priority' : 'Low Priority'}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">You rated this a {liveSession.priority_self_rating}/10 priority</p>
                </div>
              )}
              {/* Ability Scale */}
              {liveSession?.ability_self_rating && (
                <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-sky-50 to-white p-6 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-3">Need for Outside Help</p>
                  <div className="relative mx-auto mb-4" style={{ width: 80, height: 80 }}>
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#f5f5f4" strokeWidth="6" />
                      <circle
                        cx="40" cy="40" r="34" fill="none"
                        stroke={liveSession.ability_self_rating >= 8 ? '#0ea5e9' : liveSession.ability_self_rating >= 5 ? '#f59e0b' : '#a3a3a3'}
                        strokeWidth="6"
                        strokeDasharray={`${(liveSession.ability_self_rating / 10) * 213.6} 213.6`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-stone-900">{liveSession.ability_self_rating}</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-stone-700">
                    {liveSession.ability_self_rating >= 8 ? 'Need Outside Help' : liveSession.ability_self_rating >= 5 ? 'Could Use Help' : 'Can Handle Internally'}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">You rated your need at {liveSession.ability_self_rating}/10</p>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* ──────────────────────────────────────────────────── */}
      {/* SECTION 3: The Confirmation Close                   */}
      {/* ──────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={cardReveal} transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-16"
      >
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold tracking-[0.15em] text-stone-400">
            The Confirmation Close
          </p>
          <h2 className="mb-4 text-3xl font-bold text-stone-900">
            Confirmation Close
          </h2>
          <p className="mx-auto max-w-2xl text-stone-500">
            Three questions to confirm we're fully aligned on the problem, the solution, and the path forward.
          </p>
        </div>

        <div className="mx-auto max-w-2xl space-y-4">
          {ALIGNMENT_ITEMS.map((item, i) => {
            const checked = checks[item.key];
            const Icon = item.icon;
            return (
              <motion.label
                key={item.key}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileTap={!approved ? { scale: 0.98 } : undefined}
                className={`flex cursor-pointer items-start gap-5 rounded-2xl border bg-white p-5 transition-all ${
 checked
 ? 'border-transparent shadow-md ring-2'
 : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
 } ${approved ? 'pointer-events-none opacity-60' : ''}`}
                style={{ '--tw-ring-color': checked ? themeColor : 'transparent' } as React.CSSProperties}
              >
                {/* Custom checkbox */}
                <motion.div
                  className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-colors"
                  style={{
                    borderColor: checked ? themeColor : '#d4d4d8',
                    backgroundColor: checked ? themeColor : 'transparent',
                  }}
                  animate={checked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {checked && <CheckCircle2 size={14} className="text-white" />}
                </motion.div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => handleCheck(item.key, e.target.checked)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <h4 className="font-bold text-stone-900">{item.title}</h4>
                  </div>
                  <p className="mb-1 text-sm text-stone-700">{item.question}</p>
                  <p className="text-xs text-stone-400">{item.description}</p>
                </div>
                <Icon
                  size={20}
                  className="mt-1 flex-shrink-0"
                  style={{ color: checked ? themeColor : '#d4d4d8' }}
                />
              </motion.label>
            );
          })}
        </div>

        {/* Minimum Standards of Success */}
        {(liveSession?.custom_minimum_standards?.length ?? 0) > 0 && (
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="mb-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-2">Minimum Standards of Success</p>
              <p className="text-sm text-stone-500">For our partnership to deliver results, we both commit to these standards.</p>
            </div>
            <div className="space-y-3">
              {liveSession!.custom_minimum_standards!.map((standard, i) => (
                <motion.label
                  key={standard.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border bg-white p-4 transition-all ${
                    standard.checked
                      ? 'border-emerald-200 bg-emerald-50/50 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300'
                  } ${approved ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <motion.div
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors"
                    style={{
                      borderColor: standard.checked ? '#10b981' : '#d4d4d8',
                      backgroundColor: standard.checked ? '#10b981' : 'transparent',
                    }}
                    animate={standard.checked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {standard.checked && <CheckCircle2 size={12} className="text-white" />}
                  </motion.div>
                  <input
                    type="checkbox"
                    checked={standard.checked}
                    onChange={(e) => {
                      if (!liveSession?.custom_minimum_standards) return;
                      const updated = liveSession.custom_minimum_standards.map(s =>
                        s.id === standard.id ? { ...s, checked: e.target.checked } : s
                      );
                      if (sessionId) {
                        updateSessionFromGranola(sessionId, { custom_minimum_standards: updated });
                      }
                    }}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-stone-700">{standard.label}</span>
                </motion.label>
              ))}
            </div>
          </div>
        )}

        {/* Approve CTA / Success */}
        <div className="mx-auto mt-8 max-w-2xl">
          <AnimatePresence mode="wait">
            {approved ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 rounded-2xl px-8 py-6 text-center"
                style={{ backgroundColor: '#10B98115' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                >
                  <CheckCircle2 size={36} className="text-emerald-500" />
                </motion.div>
                <h4 className="text-lg font-bold text-stone-900">Blueprint Approved</h4>
                <p className="text-sm text-stone-500">
                  {companyName} is aligned. Complete the next steps below to keep momentum.
                </p>
              </motion.div>
            ) : (
              <motion.button
                key="cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                disabled={!canApprove}
                onClick={handleApprove}
                className="flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-5 text-lg font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-30"
                style={{
                  backgroundColor: canApprove ? '#10B981' : '#a1a1aa',
                  boxShadow: canApprove ? '0 0 30px 4px rgba(16,185,129,0.35)' : 'none',
                }}
                whileHover={canApprove ? { scale: 1.02 } : undefined}
                whileTap={canApprove ? { scale: 0.98 } : undefined}
              >
                <Handshake size={22} />
                Approve Blueprint
                <ArrowRight size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.section>


    </div>
  );
}
