/**
 * Shared Pricing Computation Utilities
 * 
 * Extracted from BusinessCaseDocument.tsx and SolutionProposal.tsx
 * to eliminate duplicated pricing math. Both components now use this
 * single source of truth for all pricing calculations.
 */

import type { DiscoverySession, PricingAddOn, PricingDivision, PricingSetupType } from './discoveryDatabase';
import { findTier, lookupPrice } from '../data/rateCardData';

export interface PricingResult {
  /** Base price after rate card / manual override / fallback */
  computedDealValue: number;
  /** Whether this is a multi-entity (divisions/group) deal */
  isMultiEntity: boolean;
  /** Sum of all division prices (if multi-entity) */
  divisionTotal: number;
  /** The effective base: divisionTotal if multi-entity, otherwise computedDealValue */
  effectiveBase: number;
  /** Total of paid (included, not waived) add-ons */
  addOnsTotal: number;
  /** effectiveBase + addOnsTotal */
  subtotal: number;
  /** Dollar amount discounted */
  discountAmount: number;
  /** subtotal - discountAmount */
  annualTotal: number;
  /** annualTotal / 12 */
  monthlyTotal: number;
  /** ROI multiple: roiTotal / annualTotal */
  roiMultiple: number;
  /** Whether any add-ons are included */
  hasAddOns: boolean;
  /** Whether a discount is applied */
  hasDiscount: boolean;
  /** Whether this is a custom proposal (no pricing configured) */
  isCustomProposal: boolean;
  /** The rate card tier (if looked up) */
  tier: ReturnType<typeof findTier>;
  /** Formatted annual price string */
  annualPriceFormatted: string;
  /** Formatted monthly price string */
  monthlyPriceFormatted: string;

  // Pass-through config values (for rendering)
  pricingVertical: string;
  pricingEmployeeCount: number;
  pricingContractTerm: number;
  pricingDiscountPct: number;
  pricingAddOns: PricingAddOn[];
  pricingNotes: string;
  pricingPriceCapPct: number | undefined;
  pricingPromoFreeMonths: number | undefined;
  pricingPromoLabel: string;
  pricingSetupType: PricingSetupType;
  pricingDivisions: PricingDivision[];
  pricingPresentationStyle: 'single' | 'options';
  pricingPackages: any[];
  includedAddOns: PricingAddOn[];
  paidAddOns: PricingAddOn[];
  waivedAddOns: PricingAddOn[];
}

const formatMoney = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

/**
 * Compute all pricing values from a DiscoverySession.
 * Used by BusinessCaseDocument and SolutionProposal.
 */
export function computePricing(session: DiscoverySession | null): PricingResult {
  if (!session) {
    return getEmptyPricingResult();
  }

  // Extract config values
  const pricingVertical = session.pricing_vertical || 'non-staffing';
  const pricingEmployeeCount = session.pricing_employee_count || 0;
  const pricingContractTerm = session.pricing_contract_term || 1;
  const pricingDiscountPct = session.pricing_discount_pct || 0;
  const pricingAddOns: PricingAddOn[] = session.pricing_add_ons ?? [];
  const pricingNotes = session.pricing_notes ?? '';
  const pricingPriceCapPct = session.pricing_price_cap_pct;
  const pricingPromoFreeMonths = session.pricing_promo_free_months;
  const pricingPromoLabel = session.pricing_promo_label ?? '';
  const pricingSetupType: PricingSetupType = session.pricing_setup_type ?? 'single';
  const pricingDivisions: PricingDivision[] = session.pricing_divisions ?? [];
  const pricingPresentationStyle = (session.pricing_presentation_style ?? 'single') as 'single' | 'options';
  const pricingPackages: any[] = session.pricing_packages ?? [];

  // Compute deal value: pricing_base_price → rate card lookup → deal_value fallback
  const computedDealValue = (() => {
    const bp = session.pricing_base_price || 0;
    if (bp > 0) return bp;
    if (pricingEmployeeCount > 0) {
      const rp = lookupPrice(pricingVertical, pricingEmployeeCount);
      if (rp > 0) return rp;
    }
    return session.deal_value || 0;
  })();

  // Multi-entity logic
  const isMultiEntity = pricingSetupType === 'divisions' || pricingSetupType === 'group';
  const divisionTotal = pricingDivisions.reduce((s, d) => s + d.price, 0);
  const effectiveBase = isMultiEntity ? divisionTotal : computedDealValue;

  // Add-ons
  const includedAddOns = pricingAddOns.filter(a => a.included);
  const paidAddOns = includedAddOns.filter(a => !a.waived && a.price > 0);
  const waivedAddOns = includedAddOns.filter(a => a.waived);
  const addOnsTotal = paidAddOns.reduce((s, a) => s + (a.price || 0), 0);

  // Totals
  const subtotal = effectiveBase + addOnsTotal;
  const discountAmount = Math.round(subtotal * (pricingDiscountPct / 100));
  const annualTotal = subtotal - discountAmount;
  const monthlyTotal = Math.round(annualTotal / 12);

  // ROI
  const roiTotal = session.roi_total || 0;
  const roiMultiple = annualTotal > 0 && roiTotal > 0 ? Math.round(roiTotal / annualTotal) : 0;

  // Flags
  const hasAddOns = pricingAddOns.some(a => a.included);
  const hasDiscount = pricingDiscountPct > 0;
  const isCustomProposal = computedDealValue === 0 && !hasAddOns && pricingEmployeeCount === 0;

  // Tier
  const tier = pricingEmployeeCount > 0 ? findTier(pricingVertical, pricingEmployeeCount) : null;

  // Formatted values
  const annualPriceFormatted = annualTotal > 0 ? formatMoney(annualTotal) : 'TBD';
  const monthlyPriceFormatted = monthlyTotal > 0 ? formatMoney(monthlyTotal) : 'TBD';

  return {
    computedDealValue,
    isMultiEntity,
    divisionTotal,
    effectiveBase,
    addOnsTotal,
    subtotal,
    discountAmount,
    annualTotal,
    monthlyTotal,
    roiMultiple,
    hasAddOns,
    hasDiscount,
    isCustomProposal,
    tier,
    annualPriceFormatted,
    monthlyPriceFormatted,
    pricingVertical,
    pricingEmployeeCount,
    pricingContractTerm,
    pricingDiscountPct,
    pricingAddOns,
    pricingNotes,
    pricingPriceCapPct,
    pricingPromoFreeMonths,
    pricingPromoLabel,
    pricingSetupType,
    pricingDivisions,
    pricingPresentationStyle,
    pricingPackages,
    includedAddOns,
    paidAddOns,
    waivedAddOns,
  };
}

/**
 * Compute pricing for a specific package (Good/Better/Best).
 */
export function computePackagePricing(
  effectiveBase: number,
  pricingAddOns: PricingAddOn[],
  packageAddonIds: string[],
  discountPct: number,
): { pkgAddOnsTotal: number; pkgSubtotal: number; pkgDiscount: number; pkgTotal: number } {
  const pkgAddOnsTotal = pricingAddOns
    .filter(a => packageAddonIds.includes(a.id))
    .reduce((sum, a) => sum + (a.waived ? 0 : a.price), 0);
  const pkgSubtotal = effectiveBase + pkgAddOnsTotal;
  const pkgDiscount = Math.round(pkgSubtotal * (discountPct / 100));
  const pkgTotal = pkgSubtotal - pkgDiscount;
  return { pkgAddOnsTotal, pkgSubtotal, pkgDiscount, pkgTotal };
}

function getEmptyPricingResult(): PricingResult {
  return {
    computedDealValue: 0,
    isMultiEntity: false,
    divisionTotal: 0,
    effectiveBase: 0,
    addOnsTotal: 0,
    subtotal: 0,
    discountAmount: 0,
    annualTotal: 0,
    monthlyTotal: 0,
    roiMultiple: 0,
    hasAddOns: false,
    hasDiscount: false,
    isCustomProposal: true,
    tier: null,
    annualPriceFormatted: 'TBD',
    monthlyPriceFormatted: 'TBD',
    pricingVertical: 'non-staffing',
    pricingEmployeeCount: 0,
    pricingContractTerm: 1,
    pricingDiscountPct: 0,
    pricingAddOns: [],
    pricingNotes: '',
    pricingPriceCapPct: undefined,
    pricingPromoFreeMonths: undefined,
    pricingPromoLabel: '',
    pricingSetupType: 'single',
    pricingDivisions: [],
    pricingPresentationStyle: 'single',
    pricingPackages: [],
    includedAddOns: [],
    paidAddOns: [],
    waivedAddOns: [],
  };
}
