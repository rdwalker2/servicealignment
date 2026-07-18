// ============================================================
// PricingConfigPanel — FY26 Rate Card Config for ControlDrawer
// Compact inline panel: vertical, tier, price override,
// contract term, discount, add-ons, notes, and summary card.
// US / USD only.
// ============================================================

import { useState, useEffect } from 'react';
import { Building2, Users, Plus, Trash2, Edit3, Lock, Unlock, Tag, Layers, Grid3X3, Building } from 'lucide-react';
import { getTierOptions, lookupPrice, formatPrice, findTier, isProposalTier, ADD_ON_TEMPLATES } from '../../data/rateCardData';
import type { VerticalType } from '../../data/rateCardData';
import type { DiscoverySession, PricingAddOn, PricingDivision, PricingSetupType, PricingPresentationStyle, PricingPackage } from '../../lib/discoveryDatabase';
import { persistSession, computeDealValue } from '../../lib/discoveryDatabase';

// ── Shared style tokens (match ControlDrawer) ──

const selectClass = 'w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 transition-colors';
const microHeader = 'mb-1.5 block text-[10px] font-bold text-stone-400';
const inputClass = 'w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 transition-colors tabular-nums';

// ── Props ──

interface PricingConfigPanelProps {
  session: DiscoverySession;
  onSessionChange: (session: DiscoverySession) => void;
}

// ── Component ──

export function PricingConfigPanel({ session, onSessionChange }: PricingConfigPanelProps) {
  const vertical: VerticalType = session.pricing_vertical ?? 'non-staffing';
  const employeeCount = session.pricing_employee_count ?? 0;
  const basePrice = session.pricing_base_price ?? 0;
  const isOverride = session.pricing_override ?? false;
  const contractTerm = session.pricing_contract_term ?? 1;
  const discountPct = session.pricing_discount_pct ?? 0;
  const addOns: PricingAddOn[] = session.pricing_add_ons ?? [];
  const notes = session.pricing_notes ?? '';
  const priceCapPct = session.pricing_price_cap_pct;
  const promoFreeMonths = session.pricing_promo_free_months;
  const promoLabel = session.pricing_promo_label ?? '';

  const tiers = getTierOptions(vertical);
  const isCustom = employeeCount > 0 && isProposalTier(vertical, employeeCount);

  // Rate card lookup for the current selection
  const rateCardPrice = employeeCount > 0 ? lookupPrice(vertical, employeeCount) : 0;

  // Setup type & divisions
  const setupType: PricingSetupType = session.pricing_setup_type ?? 'single';
  const presentationStyle: PricingPresentationStyle = session.pricing_presentation_style ?? 'single';
  const packages: PricingPackage[] = session.pricing_packages ?? [];
  const divisions: PricingDivision[] = session.pricing_divisions ?? [];
  const isMultiEntity = setupType === 'divisions' || setupType === 'group';

  // Quick-add template panel toggle
  const [showTemplates, setShowTemplates] = useState(false);

  // Auto-compute deal_value whenever pricing fields change
  useEffect(() => {
    const computed = computeDealValue(session);
    if (computed !== session.deal_value) {
      onSessionChange({ ...session, deal_value: computed });
    }
  }, [session.pricing_base_price, session.pricing_contract_term, session.pricing_discount_pct, session.pricing_add_ons]);

  // ── Helpers ──

  const update = (patch: Partial<DiscoverySession>) => {
    const next = { ...session, ...patch };
    onSessionChange(next);
    persistSession(next);
  };

  const handleVertical = (v: VerticalType) => {
    update({
      pricing_vertical: v,
      // Reset tier because tiers differ between verticals
      pricing_employee_count: 0,
      pricing_base_price: 0,
      pricing_override: false,
    });
  };

  const handleTier = (minSize: number) => {
    const price = lookupPrice(vertical, minSize);
    const custom = isProposalTier(vertical, minSize);
    const finalPrice = custom ? basePrice : price;
    update({
      pricing_employee_count: minSize,
      pricing_base_price: finalPrice,
      pricing_override: custom ? true : isOverride,
      deal_value: finalPrice, // keep deal_value in sync for SolutionProposal
    });
  };

  const toggleOverride = () => {
    if (isOverride && !isCustom) {
      // Switching back to rate card — reset price
      update({
        pricing_override: false,
        pricing_base_price: rateCardPrice,
        deal_value: rateCardPrice,
      });
    } else {
      update({ pricing_override: true });
    }
  };

  const handlePriceChange = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    update({ pricing_base_price: num, deal_value: num });
  };

  const handleTerm = (t: 1 | 2 | 3) => {
    update({ pricing_contract_term: t });
  };

  const handleDiscount = (val: string) => {
    const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
    update({ pricing_discount_pct: num });
  };

  // ── Add-On CRUD ──

  const addAddOn = () => {
    const newItem: PricingAddOn = {
      id: `ao_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: '',
      price: 0,
      included: true,
    };
    update({ pricing_add_ons: [...addOns, newItem] });
  };

  const addFromTemplate = (template: typeof ADD_ON_TEMPLATES[number]) => {
    // Don't add if already exists
    if (addOns.some(a => a.name === template.name)) return;
    const newItem: PricingAddOn = {
      id: `ao_${template.id}_${Date.now()}`,
      name: template.name,
      price: template.defaultPrice,
      included: true,
    };
    update({ pricing_add_ons: [...addOns, newItem] });
  };

  const updateAddOn = (id: string, patch: Partial<PricingAddOn>) => {
    update({
      pricing_add_ons: addOns.map(a => (a.id === id ? { ...a, ...patch } : a)),
    });
  };

  const removeAddOn = (id: string) => {
    update({ pricing_add_ons: addOns.filter(a => a.id !== id) });
  };

  // ── Calculations ──

  const addOnTotal = addOns.filter(a => a.included).reduce((sum, a) => sum + (a.waived ? 0 : (a.price || 0)), 0);
  const divisionTotal = divisions.reduce((s, d) => s + d.price, 0);
  const effectiveBase = isMultiEntity ? divisionTotal : basePrice;
  const subtotal = effectiveBase + addOnTotal;
  const discountAmount = Math.round(subtotal * (discountPct / 100));
  const total = subtotal - discountAmount;
  const hasPricing = isMultiEntity ? divisions.length > 0 : employeeCount > 0;

  const termHints: Record<number, string> = { 1: '', 2: '−5% suggested', 3: '−10% suggested' };

  return (
    <div className="space-y-4">
      {/* ── Row 1: Vertical Toggle ── */}
      <div>
        <span className={microHeader}>Vertical</span>
        <div className="flex gap-1.5">
          {([
            { key: 'non-staffing' as VerticalType, label: 'Non-Staffing', icon: Building2 },
            { key: 'staffing' as VerticalType, label: 'Staffing', icon: Users },
          ]).map(v => {
            const Icon = v.icon;
            return (
              <button
                key={v.key}
                onClick={() => handleVertical(v.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
 vertical === v.key
 ? 'border-stone-800 bg-stone-800 text-white '
 : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700'
 }`}
              >
                <Icon size={13} />
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Row 1b: Setup Type Toggle ── */}
      <div>
        <span className={microHeader}>Setup Type</span>
        <div className="flex gap-1">
          {([
            { key: 'single' as PricingSetupType, label: 'Single', icon: Building2, hint: '1 platform' },
            { key: 'divisions' as PricingSetupType, label: 'Divisions', icon: Layers, hint: 'Sub-brands within 1 platform' },
            { key: 'group' as PricingSetupType, label: 'Group', icon: Grid3X3, hint: 'Multiple separate platforms' },
          ]).map(s => {
            const SIcon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => update({ pricing_setup_type: s.key, ...(s.key === 'single' ? { pricing_divisions: [] } : {}) })}
                title={s.hint}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition-all ${
 setupType === s.key
 ? 'border-stone-800 bg-stone-800 text-white '
 : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700'
 }`}
              >
                <SIcon size={12} />
                {s.label}
              </button>
            );
          })}
        </div>
        {isMultiEntity && (
          <p className="mt-1 text-[9px] text-stone-400 leading-snug">
            {setupType === 'divisions'
              ? 'Each division is priced by its own FTE count within one platform.'
              : 'Each platform is a fully separate Provider instance, priced individually.'}
          </p>
        )}
      </div>

      {/* ── Row 1c: Presentation Style Toggle ── */}
      <div>
        <span className={microHeader}>Presentation Style</span>
        <div className="flex gap-1.5">
          {([
            { key: 'single' as PricingPresentationStyle, label: 'Single Proposal' },
            { key: 'options' as PricingPresentationStyle, label: 'Package Options (Good/Better/Best)' },
          ]).map(s => (
            <button
              key={s.key}
              onClick={() => {
                const patch: Partial<DiscoverySession> = { pricing_presentation_style: s.key };
                // Initialize default packages if enabling options for the first time
                if (s.key === 'options' && packages.length === 0) {
                  patch.pricing_packages = [
                    { id: 'good', name: 'Core Platform', description: 'Everything you need to centralize hiring.', addon_ids: [] },
                    { id: 'better', name: 'Growth', description: 'Core Platform + Candidate CRM & Nurture.', addon_ids: addOns.length > 0 ? [addOns[0].id] : [] },
                    { id: 'best', name: 'Enterprise', description: 'Full suite with all add-ons.', addon_ids: addOns.map(a => a.id) }
                  ];
                }
                update(patch);
              }}
              className={`flex flex-1 items-center justify-center rounded-lg border px-3 py-2 text-[10px] font-semibold transition-all ${
 presentationStyle === s.key
 ? 'border-stone-800 bg-stone-800 text-white '
 : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700'
 }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Divisions/Platforms Rows (only for multi-entity) ── */}
      {isMultiEntity && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className={microHeader + ' mb-0'}>{setupType === 'divisions' ? 'Divisions' : 'Platforms'}</span>
            <button
              onClick={() => {
                const newDiv: PricingDivision = {
                  id: `div_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                  label: '',
                  employeeCount: 0,
                  price: 0,
                };
                update({ pricing_divisions: [...divisions, newDiv] });
              }}
              className="flex items-center gap-1 rounded-md border border-dashed border-stone-300 px-2 py-0.5 text-[9px] font-semibold text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors"
            >
              <Plus size={10} />
              Add {setupType === 'divisions' ? 'Division' : 'Platform'}
            </button>
          </div>
          {divisions.length === 0 && (
            <div className="rounded-lg border border-dashed border-stone-200 py-3 text-center text-[10px] text-stone-400">
              No {setupType === 'divisions' ? 'divisions' : 'platforms'} added yet
            </div>
          )}
          <div className="space-y-2">
            {divisions.map((div, idx) => (
              <div key={div.id} className="rounded-lg border border-stone-200 bg-stone-50/50 p-2 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-stone-400 shrink-0 w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    value={div.label}
                    onChange={e => {
                      const updated = divisions.map(d => d.id === div.id ? { ...d, label: e.target.value } : d);
                      update({ pricing_divisions: updated });
                    }}
                    placeholder={setupType === 'divisions' ? 'Division name…' : 'Platform name…'}
                    className={`${inputClass} flex-1 py-1 text-[10px]`}
                  />
                  <button
                    onClick={() => update({ pricing_divisions: divisions.filter(d => d.id !== div.id) })}
                    className="text-stone-300 hover:text-rose-500 transition-colors p-0.5"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex-1">
                    <select
                      value={div.employeeCount}
                      onChange={e => {
                        const fte = parseInt(e.target.value, 10);
                        const price = lookupPrice(vertical, fte);
                        const updated = divisions.map(d => d.id === div.id ? { ...d, employeeCount: fte, price: isProposalTier(vertical, fte) ? d.price : price } : d);
                        update({ pricing_divisions: updated });
                      }}
                      className={`${selectClass} py-1 text-[10px]`}
                    >
                      <option value={0}>FTE tier…</option>
                      {tiers.map(t => (
                        <option key={t.value} value={t.value}>
                          {t.label} — {t.price > 0 ? `${formatPrice(t.price)}/yr` : 'POA'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24 shrink-0">
                    <input
                      type="text"
                      value={div.price > 0 ? formatPrice(div.price) : ''}
                      onChange={e => {
                        const num = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
                        const updated = divisions.map(d => d.id === div.id ? { ...d, price: num } : d);
                        update({ pricing_divisions: updated });
                      }}
                      placeholder="$0"
                      className={`${inputClass} py-1 text-[10px] text-right tabular-nums`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {divisions.length > 0 && (
            <div className="mt-1.5 flex justify-between rounded-lg bg-stone-100 px-3 py-1.5 text-[10px] font-bold text-stone-600">
              <span>{divisions.length} {setupType === 'divisions' ? 'division' : 'platform'}{divisions.length !== 1 ? 's' : ''} · {divisions.reduce((s, d) => s + d.employeeCount, 0).toLocaleString()} total FTE</span>
              <span>{formatPrice(divisions.reduce((s, d) => s + d.price, 0))}/yr</span>
            </div>
          )}
        </div>
      )}

      {/* ── Row 2: Company Size / Tier Dropdown (single setup only) ── */}
      {!isMultiEntity && (
      <div>
        <span className={microHeader}>Company Size (Employees)</span>
        <select
          value={employeeCount}
          onChange={e => handleTier(parseInt(e.target.value, 10))}
          className={selectClass}
        >
          <option value={0}>Select tier…</option>
          {tiers.map(t => (
            <option key={t.value} value={t.value}>
              {t.label} — {t.price > 0 ? `${formatPrice(t.price)}/yr` : 'Custom Proposal'}
            </option>
          ))}
        </select>
      </div>
      )}

      {/* ── Row 3: Price Display + Override ── */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className={microHeader + ' mb-0'}>Base Price (USD)</span>
          <div className="flex items-center gap-1.5">
            {/* Badge */}
            {isOverride || isCustom ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-bold text-amber-600 border border-amber-200">
                <Edit3 size={8} />
                Override
              </span>
            ) : employeeCount > 0 ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-bold text-emerald-600 border border-emerald-200">
                <Tag size={8} />
                Rate Card
              </span>
            ) : null}

            {/* Lock/Unlock toggle */}
            {!isCustom && employeeCount > 0 && (
              <button
                onClick={toggleOverride}
                className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
 isOverride
 ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
 : 'bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600'
 }`}
                title={isOverride ? 'Lock to rate card price' : 'Unlock to override price'}
              >
                {isOverride ? <Unlock size={11} /> : <Lock size={11} />}
              </button>
            )}
          </div>
        </div>

        {/* Price input/display */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">
            $
          </span>
          <input
            type="text"
            value={basePrice > 0 ? basePrice.toLocaleString() : ''}
            onChange={e => handlePriceChange(e.target.value)}
            readOnly={!isOverride && !isCustom}
            placeholder={isCustom ? 'Enter custom price…' : '0'}
            className={`${inputClass} pl-7 pr-12 text-right text-sm font-bold ${
 isOverride || isCustom
 ? 'border-amber-300 bg-amber-50/50 text-amber-800'
 : 'bg-stone-50 text-stone-800'
 } ${!isOverride && !isCustom ? 'cursor-default' : ''}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-stone-400">
            /yr
          </span>
        </div>

        {/* Rate card reference when overridden */}
        {isOverride && !isCustom && rateCardPrice > 0 && (
          <p className="mt-1 text-[9px] text-stone-400">
            Rate card: {formatPrice(rateCardPrice)}/yr
          </p>
        )}
      </div>

      {/* ── Row 4: Contract Term ── */}
      <div>
        <span className={microHeader}>Contract Term</span>
        <div className="flex gap-1.5">
          {([1, 2, 3] as const).map(t => (
            <button
              key={t}
              onClick={() => handleTerm(t)}
              className={`flex flex-1 flex-col items-center rounded-lg border px-2 py-2 transition-all ${
 contractTerm === t
 ? 'border-stone-800 bg-stone-800 text-white '
 : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700'
 }`}
            >
              <span className="text-xs font-bold">{t} Year{t > 1 ? 's' : ''}</span>
              {termHints[t] && (
                <span className={`text-[8px] font-medium ${contractTerm === t ? 'text-stone-400' : 'text-stone-400'}`}>
                  {termHints[t]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Row 5: Discount ── */}
      <div>
        <span className={microHeader}>Discount</span>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={discountPct || ''}
              onChange={e => handleDiscount(e.target.value)}
              placeholder="0"
              className={`${inputClass} pr-8`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400">%</span>
          </div>
          {discountPct > 0 && subtotal > 0 && (
            <span className="shrink-0 text-[10px] font-semibold text-rose-500 tabular-nums">
              −{formatPrice(discountAmount)}
            </span>
          )}
        </div>
      </div>

      {/* ── Row 6: Add-Ons ── */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className={microHeader + ' mb-0'}>Add-Ons</span>
          <span className="text-[9px] font-medium text-stone-400 tabular-nums">
            {addOns.filter(a => a.included).length} item{addOns.filter(a => a.included).length !== 1 ? 's' : ''}
          </span>
        </div>

        {addOns.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {addOns.map(addon => (
              <div
                key={addon.id}
                className={`flex items-center gap-1.5 rounded-lg border p-1.5 transition-all ${
 addon.included
 ? 'border-stone-200 bg-white'
 : 'border-stone-100 bg-stone-50 opacity-60'
 }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => updateAddOn(addon.id, { included: !addon.included })}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
 addon.included
 ? 'border-emerald-500 bg-emerald-500'
 : 'border-stone-300 bg-white'
 }`}
                >
                  {addon.included && (
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Name */}
                <input
                  type="text"
                  value={addon.name}
                  onChange={e => updateAddOn(addon.id, { name: e.target.value })}
                  placeholder="Item name…"
                  className="min-w-0 flex-1 rounded border-0 bg-transparent px-1 py-0.5 text-[11px] font-medium text-stone-700 placeholder:text-stone-300 focus:outline-none"
                />

                {/* Price */}
                <div className="relative w-20 shrink-0">
                  {addon.included && addon.waived ? (
                    <div className="flex items-center gap-1 w-full py-0.5 pr-1.5">
                      <span className="text-[9px] line-through text-stone-400 tabular-nums">${addon.price > 0 ? addon.price.toLocaleString() : '0'}</span>
                      <span className="text-[9px] font-bold text-emerald-600">Included</span>
                    </div>
                  ) : (
                    <>
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-stone-400">
                        $
                      </span>
                      <input
                        type="text"
                        value={addon.price > 0 ? addon.price.toLocaleString() : ''}
                        onChange={e => {
                          const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
                          updateAddOn(addon.id, { price: v });
                        }}
                        placeholder="0"
                        className="w-full rounded border border-stone-200 bg-stone-50 py-0.5 pl-5 pr-1.5 text-right text-[10px] font-semibold text-stone-700 tabular-nums focus:outline-none focus:border-stone-400"
                      />
                    </>
                  )}
                </div>

                {/* Waive toggle (only for included add-ons) */}
                {addon.included && (
                  <button
                    onClick={() => updateAddOn(addon.id, { waived: !addon.waived })}
                    className={`flex shrink-0 items-center justify-center rounded px-1.5 py-0.5 text-[8px] font-bold transition-colors ${
 addon.waived
 ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
 : 'bg-stone-100 text-stone-400 border border-stone-200 hover:bg-stone-200 hover:text-stone-600'
 }`}
                    title={addon.waived ? 'Un-waive this add-on' : 'Waive (include at $0)'}
                  >
                    {addon.waived ? 'Waived' : 'Waive'}
                  </button>
                )}

                {/* Delete */}
                <button
                  onClick={() => removeAddOn(addon.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-stone-300 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quick-add from templates */}
        {showTemplates && (
          <div className="mb-2 rounded-lg border border-stone-200 bg-stone-50/80 p-2 space-y-1">
            <p className="text-[9px] font-bold text-stone-400 mb-1">Quick Add</p>
            {ADD_ON_TEMPLATES.filter(t => !addOns.some(a => a.name === t.name)).map(template => (
              <button
                key={template.id}
                onClick={() => addFromTemplate(template)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-white transition-colors"
              >
                <div>
                  <p className="text-[11px] font-semibold text-stone-700">{template.name}</p>
                  <p className="text-[9px] text-stone-400">{template.description}</p>
                </div>
                <span className="text-[10px] font-bold text-stone-500 tabular-nums">{formatPrice(template.defaultPrice)}/yr</span>
              </button>
            ))}
            {ADD_ON_TEMPLATES.filter(t => !addOns.some(a => a.name === t.name)).length === 0 && (
              <p className="text-[10px] text-stone-400 italic py-1">All templates added</p>
            )}
          </div>
        )}

        <div className="flex gap-1.5">
          <button
            onClick={addAddOn}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-dashed border-stone-200 py-1.5 text-[10px] font-semibold text-stone-400 hover:border-stone-300 hover:text-stone-600 transition-colors"
          >
            <Plus size={11} />
            Custom Item
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-[10px] font-semibold transition-colors ${
 showTemplates
 ? 'border-stone-800 bg-stone-800 text-white'
 : 'border-dashed border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600'
 }`}
          >
            <Tag size={11} />
            Templates
          </button>
        </div>
      </div>

      {/* ── Row 7: Pricing Notes ── */}
      <div>
        <span className={microHeader}>Pricing Notes</span>
        <textarea
          value={notes}
          onChange={e => update({ pricing_notes: e.target.value })}
          placeholder="Notes shown to the prospect…"
          rows={2}
          className={`${inputClass} resize-none leading-relaxed`}
        />
      </div>

      {/* ── Row 8: Contract Terms ── */}
      <div>
        <span className={microHeader}>Contract Terms</span>
        <div className="space-y-2">
          {/* Price Escalation Cap */}
          <div>
            <label className="mb-1 block text-[9px] font-semibold text-stone-400">
              Price Escalation Cap
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={priceCapPct ?? ''}
                  onChange={e => {
                    const val = e.target.value === '' ? undefined : Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                    update({ pricing_price_cap_pct: val });
                  }}
                  placeholder="e.g. 3"
                  className={`${inputClass} pr-16`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-medium text-stone-400">% annual max</span>
              </div>
            </div>
          </div>

          {/* Promotional Offer */}
          <div>
            <label className="mb-1 block text-[9px] font-semibold text-stone-400">
              Promotional Offer
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={promoLabel}
                onChange={e => update({ pricing_promo_label: e.target.value || undefined })}
                placeholder="Label (e.g. Nonprofit Bonus)"
                className={`${inputClass} flex-1`}
              />
              <div className="relative w-24 shrink-0">
                <input
                  type="number"
                  min={0}
                  max={24}
                  step={1}
                  value={promoFreeMonths ?? ''}
                  onChange={e => {
                    const val = e.target.value === '' ? undefined : Math.min(24, Math.max(0, parseInt(e.target.value, 10) || 0));
                    update({ pricing_promo_free_months: val });
                  }}
                  placeholder="0"
                  className={`${inputClass} pr-16`}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-medium text-stone-400">months</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary Card ── */}
      {hasPricing && (
        <div className="rounded-xl border border-stone-200 bg-stone-900 p-3 text-white">
          <div className="mb-2 text-[9px] font-bold text-stone-400">
            Pricing Summary{isMultiEntity ? ` — ${setupType === 'divisions' ? 'Divisions' : 'Group'}` : ''}
          </div>

          <div className="space-y-1 text-xs tabular-nums">
            {/* Division breakdown (multi-entity) */}
            {isMultiEntity ? (
              <>
                {divisions.map(div => (
                  <div key={div.id} className="flex justify-between">
                    <span className="text-stone-400 truncate max-w-[60%]">{div.label || 'Unnamed'} ({div.employeeCount > 0 ? `${div.employeeCount.toLocaleString()} FTE` : '—'})</span>
                    <span className="font-semibold">{div.price > 0 ? `${formatPrice(div.price)}/yr` : '—'}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-stone-700 pt-1">
                  <span className="text-stone-400">Platform Subtotal</span>
                  <span className="font-semibold">{formatPrice(divisionTotal)}/yr</span>
                </div>
              </>
            ) : (
              /* Single base */
              <div className="flex justify-between">
                <span className="text-stone-400">Base</span>
                <span className="font-semibold">{formatPrice(basePrice)}/yr</span>
              </div>
            )}

            {/* Add-Ons */}
            {addOnTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-stone-400">Add-Ons</span>
                <span className="font-semibold text-emerald-400">+{formatPrice(addOnTotal)}</span>
              </div>
            )}

            {/* Discount */}
            {discountPct > 0 && (
              <div className="flex justify-between">
                <span className="text-stone-400">Discount ({discountPct}%)</span>
                <span className="font-semibold text-rose-400">−{formatPrice(discountAmount)}</span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-stone-700 my-1" />

            {/* Total */}
            <div className="flex justify-between">
              <span className="font-bold text-white">Total</span>
              <span className="text-sm font-bold text-white">{formatPrice(total)}/yr</span>
            </div>

            {/* Contract term TCV */}
            {contractTerm > 1 && (
              <div className="flex justify-between pt-0.5">
                <span className="text-stone-500 text-[10px]">{contractTerm}-year value</span>
                <span className="text-[10px] font-semibold text-stone-400">
                  {formatPrice(total * contractTerm)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
