// ════════════════════════════════════════════════════════════════
// Settings Tab — per-section accordion with rich configs
// Extracted from RepWorkspace.tsx
//
// NOTE: This component is currently unused (replaced by RoomBuilder)
// but preserved for reference / potential future use.
// ════════════════════════════════════════════════════════════════

import React, { useState, Fragment } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, X, Target, Eye, Sparkles,
  Check,
} from 'lucide-react';
import {
  type DiscoverySession,
  type MAPMilestone,
  computeHopePillars,
  computeCompetitorsEvaluating,
  computeInitialMAP,
  computeROICategorySelection,
} from '../../lib/discoveryDatabase';
import type { SectionKey } from './ControlDrawer';
import { SocialProofConfig, PlaybookConfig } from './ControlDrawer';
import { type RoomVisibility, SECTION_UNLOCK_STAGE, STAGE_SHORT_LABELS, isStageAtOrPast } from './RoomSections';
import { TT_PAINS } from './PainDiscoveryModule';
import { PricingConfigPanel } from './PricingConfigPanel';
import { DemoReactionsPanel } from './DemoReactionsPanel';
import { computeAutoRoomConfig } from '../../lib/autoRoomConfig';
import { getIndustryLabel } from '../../lib/customerProof';
import {
  ATS_OPTIONS,
} from '../../data/roomOptions';
import { DEMO_AREAS } from './FeatureWalkthrough';
import { PLAYBOOKS, PLAYBOOK_PAIN_MAP } from '../../data/playbooks';

import {
  RAIL_SECTIONS,
  ROI_CATEGORIES_LIST,
  SECTION_DESCRIPTIONS,
} from './repWorkspaceConstants';

// Area emoji map for the unified Demo Focus config (uses canonical DEMO_AREAS ids)
const AREA_EMOJI: Record<string, string> = {
  brand:     '🎨',
  ai:        '🤖',
  candidate: '💌',
  analytics: '📊',
  manager:   '👥',
  hiring:    '🛡️',
  programs:  '🚀',
};

// Build inverted pain→playbook map once
const PAIN_TO_PLAYBOOKS: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const [pbId, pains] of Object.entries(PLAYBOOK_PAIN_MAP)) {
    for (const painId of pains) {
      if (!map[painId]) map[painId] = [];
      map[painId].push(pbId);
    }
  }
  return map;
})();

export function SettingsTab({
  session, onSessionChange, visibility, onToggleVisibility, selectedPains, onOpenPainModal,
  proofCandidates, industryCount,
}: {
  session: DiscoverySession; onSessionChange: (s: DiscoverySession) => void;
  visibility: RoomVisibility; onToggleVisibility: (key: SectionKey) => void;
  selectedPains: string[]; onOpenPainModal: () => void;
  proofCandidates: any[];
  industryCount: number;
}) {
  const currentStage = session.deal_stage ?? 'qualifying';
  const enabledCount = Object.values(visibility).filter(Boolean).length;
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (key: string) => setExpandedSection(prev => prev === key ? null : key);

  // MAP milestone helpers
  const milestones = session.mutual_action_plan ?? computeInitialMAP(session);
  const toggleMilestoneDone = (id: string) => onSessionChange({ ...session, mutual_action_plan: milestones.map(m => m.id === id ? { ...m, done: !m.done } : m) });
  const deleteMilestone = (id: string) => onSessionChange({ ...session, mutual_action_plan: milestones.filter(m => m.id !== id) });
  const addMilestone = () => { onSessionChange({ ...session, mutual_action_plan: [...milestones, { id: `m_${Date.now()}`, label: '', owner: '', dueDate: '', done: false }] }); setExpandedSection('map'); };
  const updateMilestone = (id: string, field: string, val: string) => onSessionChange({ ...session, mutual_action_plan: milestones.map(m => m.id === id ? { ...m, [field]: val } : m) });

  // Pillar helpers
  const togglePillar = (pillarId: string) => {
    const current = session.overridden_pillars ?? [];
    onSessionChange({ ...session, overridden_pillars: current.includes(pillarId) ? current.filter(p => p !== pillarId) : [...current, pillarId] });
  };

  // ROI category helpers
  const toggleROICategory = (catKey: string) => {
    const current = session.roi_enabled_categories ?? computeROICategorySelection(session);
    onSessionChange({ ...session, roi_enabled_categories: { ...current, [catKey]: !current[catKey] } });
  };

  const renderConfig = (key: SectionKey): React.ReactNode | null => {
    switch (key) {
      case 'pains':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-bold text-stone-700">{selectedPains.length} pain points selected</p><p className="text-[10px] text-stone-400 mt-0.5">These appear in the Priorities section of the room</p></div>
              <button onClick={onOpenPainModal} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white rounded-lg text-[10px] font-bold hover:bg-stone-700 transition-colors"><Target size={10} /> Manage Pains</button>
            </div>
            {selectedPains.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedPains.slice(0, 8).map(id => { const pain = TT_PAINS.find(p => p.id === id); return pain ? <span key={id} className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-[10px] font-semibold text-stone-600">{pain.title}</span> : null; })}
                {selectedPains.length > 8 && <span className="text-[10px] text-stone-400">+{selectedPains.length - 8} more</span>}
              </div>
            )}
          </div>
        );
      case 'paradigmShift': {
        const DEFAULT_HOPES = computeHopePillars(session);
        const customPillars: { title: string; subtitle: string }[] = (session as any).custom_hope_pillars ?? [];
        const pillars = customPillars.length > 0 ? customPillars : DEFAULT_HOPES;
        const isCustom = customPillars.length > 0;
        const isAutoGenerated = !isCustom && pillars !== DEFAULT_HOPES;

        const updatePillar = (index: number, field: 'title' | 'subtitle', value: string) => {
          const updated = pillars.map((p, i) => i === index ? { ...p, [field]: value } : { ...p });
          onSessionChange({ ...session, custom_hope_pillars: updated } as any);
        };

        const resetToDefaults = () => {
          const { custom_hope_pillars, ...rest } = session as any;
          onSessionChange(rest as any);
        };

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-700">"Hope" Side — Prospect's Current State</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Customize to mirror back the prospect's specific pain. The "Design" side stays static.</p>
              </div>
              {isCustom && (
                <button
                  onClick={resetToDefaults}
                  className="text-[10px] font-semibold text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2"
                >
                  Reset to Defaults
                </button>
              )}
            </div>

            {pillars.map((pillar, i) => (
              <div key={i} className="rounded-xl border border-stone-200 bg-stone-50/50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>{i + 1}</span>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={e => updatePillar(i, 'title', e.target.value)}
                    placeholder="Pillar title..."
                    className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200"
                  />
                </div>
                <textarea
                  value={pillar.subtitle}
                  onChange={e => updatePillar(i, 'subtitle', e.target.value)}
                  placeholder="Description of what this looks like today..."
                  rows={2}
                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-[11px] text-stone-600 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 resize-none leading-relaxed"
                />
              </div>
            ))}

            {!isCustom && (
              <p className="text-[9px] text-stone-400 italic text-center">
                {pillars[0]?.title === 'Spray & Pray' 
                  ? 'Using generic defaults. Fill out BAP notes (Q5/Q6/Q3) or edit above to customize.'
                  : 'Auto-generated from your call notes & BAP. Edit any field above to customize.'}
              </p>
            )}
          </div>
        );
      }

      case 'competitive': {
        // Parse existing evaluating competitors from session
        const evaluating: string[] = (session as any).competitors_evaluating ?? computeCompetitorsEvaluating(session);
        const currentAts = session.current_ats;
        const currentAtsLabel = ATS_OPTIONS.find(a => a.toLowerCase() === currentAts?.toLowerCase()) ?? currentAts;
        // Competitors available to select (exclude 'None', 'other', and the current Provider)
        const competitorChoices = ATS_OPTIONS.filter(a =>
          a !== 'None' && a !== 'other' && a.toLowerCase() !== currentAts?.toLowerCase()
        );

        const toggleEvaluating = (ats: string) => {
          const next = evaluating.includes(ats)
            ? evaluating.filter(a => a !== ats)
            : [...evaluating, ats];
          onSessionChange({ ...session, competitors_evaluating: next, competitors_count: next.length } as any);
        };

        return (
          <div className="space-y-4">
            {/* Competitor Comparison Sheet toggle */}
            <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
              <div><p className="text-xs font-bold text-stone-700">Competitor Comparison Sheet</p><p className="text-[10px] text-stone-400">Show a live Provider teardown vs their current provider</p></div>
              <button onClick={() => onSessionChange({ ...session, room_enable_kill_sheet: !session.room_enable_kill_sheet })} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${session.room_enable_kill_sheet ? 'bg-stone-800' : 'bg-stone-200'}`}>
                <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: session.room_enable_kill_sheet ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
              </button>
            </div>

            {/* Current Provider — pulled from session, read-only display */}
            <div>
              <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Current Provider</label>
              {currentAts && currentAts !== 'None' ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-bold text-white">
                    {currentAtsLabel}
                  </span>
                  <span className="text-[10px] text-stone-400">Set via Room Config → Priorities</span>
                </div>
              ) : (
                <p className="text-[10px] text-stone-400 italic">No Provider selected — set in Room Config → Priorities</p>
              )}
            </div>

            {/* Also Evaluating — multi-select chip picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[9px] font-bold text-stone-400">Also Evaluating</label>
                {evaluating.length > 0 && (
                  <span className="text-[9px] font-bold text-stone-500 tabular-nums">{evaluating.length} selected</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 rounded-lg border border-stone-100 bg-stone-50/50 p-2.5">
                {competitorChoices.map(ats => {
                  const isSelected = evaluating.includes(ats);
                  return (
                    <button
                      key={ats}
                      onClick={() => toggleEvaluating(ats)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-400 hover:text-stone-700'
                      }`}
                    >
                      {isSelected && <X size={9} strokeWidth={3} />}
                      {ats}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sentiment Score */}
            <div>
              <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Sentiment Score</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => onSessionChange({ ...session, sentiment_score: n === session.sentiment_score ? 0 : n })} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${(session.sentiment_score ?? 0) >= n ? 'bg-amber-400 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}>{n}★</button>
                ))}
              </div>
            </div>

            {/* Demo Reactions */}
            {(session.sentiment_score ?? 0) > 0 && (
              <DemoReactionsPanel
                reactions={session.demo_reactions}
                onChange={(reactions) => onSessionChange({ ...session, demo_reactions: reactions })}
              />
            )}
          </div>
        );
      }

      case 'solution': {
        const pinnedIds: string[] = session.overridden_pillars ?? [];
        const painSet = new Set(selectedPains);

        return (
          <div className="space-y-3">
            <p className="text-[10px] text-stone-500 leading-relaxed">
              Both the Solution walkthrough and Playbooks auto-derive from your selected pains.
              Pin specific focus areas to guarantee they appear as Pillars 1–3 in the demo.
            </p>

            <div className="space-y-2">
              {DEMO_AREAS.map(area => {
                const matchedPains = area.painIds.filter(id => painSet.has(id));
                const isPinned = pinnedIds.includes(area.id);
                const isAutoMatched = matchedPains.length > 0;

                // Playbooks that surface for this area's pains
                const areaPlaybooks = PLAYBOOKS.filter(pb => {
                  const pbPains = PLAYBOOK_PAIN_MAP[pb.id] ?? [];
                  return pbPains.some(pid => area.painIds.includes(pid) && painSet.has(pid));
                });

                const emoji = AREA_EMOJI[area.id] ?? '⚡';

                return (
                  <div
                    key={area.id}
                    className={`rounded-xl border transition-all ${
                      isPinned
                        ? 'border-stone-800 bg-stone-900'
                        : isAutoMatched
                        ? 'border-stone-200 bg-white'
                        : 'border-dashed border-stone-200 bg-stone-50/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <span className="text-base shrink-0">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-bold ${isPinned ? 'text-white' : 'text-stone-800'}`}>
                          {area.title}
                          {isAutoMatched && !isPinned && (
                            <span className="ml-2 text-[9px] font-semibold text-emerald-500">Auto ✓</span>
                          )}
                        </p>
                        {matchedPains.length > 0 && (
                          <p className={`text-[9px] mt-0.5 truncate ${isPinned ? 'text-stone-400' : 'text-stone-400'}`}>
                            {matchedPains.length} pain{matchedPains.length !== 1 ? 's' : ''} matched
                            {areaPlaybooks.length > 0 && ` · ${areaPlaybooks.length} playbook${areaPlaybooks.length !== 1 ? 's' : ''}`}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => togglePillar(area.id)}
                        className={`shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                          isPinned
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {isPinned ? 'Pinned ✓' : 'Pin'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {pinnedIds.length > 0 && (
              <button
                onClick={() => onSessionChange({ ...session, overridden_pillars: [] })}
                className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
              >
                Clear pins — revert to auto-match
              </button>
            )}
          </div>
        );
      }

      case 'playbooks':
        return <PlaybookConfig session={session} onSessionChange={onSessionChange} />;

      case 'socialProof': {
        const enabledIds = new Set(session.enabled_proof_customers || proofCandidates.slice(0, 6).map((c: any) => c.customer.id));
        const industryLabel = session.industry ? getIndustryLabel(session.industry) : '';

        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              {industryCount > 0 && (
                <div className="mb-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 px-4 py-3">
                  <p className="text-xs font-bold text-emerald-700">🎯 {industryCount} {industryLabel} companies already use Service Alignment</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Auto-curated from your customer database. Toggle customers below to customize what the prospect sees.</p>
                </div>
              )}

              <p className="text-[9px] font-bold text-stone-400 mb-3">Customer Social Proof ({enabledIds.size} selected)</p>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {proofCandidates.map((candidate: any) => {
                  const c = candidate.customer;
                  const enabled = enabledIds.has(c.id);
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all cursor-pointer ${
                        enabled
                          ? 'border-stone-200 bg-white hover:border-stone-300'
                          : 'border-dashed border-stone-200 bg-stone-50 opacity-50 hover:opacity-70'
                      }`}
                      onClick={() => {
                        const currentEnabled = new Set(session.enabled_proof_customers || proofCandidates.slice(0, 6).map((pc: any) => pc.customer.id));
                        if (currentEnabled.has(c.id)) {
                          currentEnabled.delete(c.id);
                        } else {
                          currentEnabled.add(c.id);
                        }
                        onSessionChange({ ...session, enabled_proof_customers: [...currentEnabled] });
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px]">{c.countryFlag}</span>
                          <p className="text-[11px] font-bold text-stone-700 truncate">{c.accountName}</p>
                          {c.npsScore !== null && c.npsScore >= 9 && (
                            <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">NPS {c.npsScore}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-stone-400">{c.industry}</span>
                          <span className="text-[9px] text-stone-300">·</span>
                          <span className="text-[9px] text-stone-400">{c.segment}</span>
                          {c.previousAts && (
                            <>
                              <span className="text-[9px] text-stone-300">·</span>
                              <span className="text-[9px] text-violet-500 font-medium">ex-{c.previousAts}</span>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {candidate.matchReasons.slice(0, 3).map((reason: string, i: number) => (
                            <span key={i} className="rounded bg-stone-100 px-1.5 py-0.5 text-[8px] text-stone-500">{reason}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${enabled ? 'bg-stone-800' : 'bg-stone-200'}`}
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        <motion.div
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                          animate={{ x: enabled ? 17 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {proofCandidates.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-xs text-stone-400">No matching customers found for this industry</p>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'roi':
        return (
          <div className="space-y-5">
            {/* ── Prospect Slider Defaults ── */}
            <div>
              <p className="text-[9px] font-bold text-stone-400 mb-1">Prospect Slider Defaults</p>
              <p className="text-[9px] text-stone-400 mb-3">Pre-set the sliders the prospect sees. They can still adjust.</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Hiring Managers</label><input type="number" min={1} max={200} value={session.room_roi_open_reqs ?? ''} onChange={e => onSessionChange({ ...session, room_roi_open_reqs: Number(e.target.value) })} placeholder="default: 15" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
                <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Annual Hires</label><input type="number" min={1} max={1000} value={session.roi_inputs?.totalHires ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), totalHires: v } }); }} placeholder="default: 60" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
                <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Agency Hires / Year</label><input type="number" min={0} max={200} value={session.roi_inputs?.agencyHires ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), agencyHires: v } }); }} placeholder="default: 10" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
                <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Time to Fill (days)</label><input type="number" min={1} max={180} value={session.room_roi_time_to_fill ?? ''} onChange={e => onSessionChange({ ...session, room_roi_time_to_fill: Number(e.target.value) })} placeholder="default: 30" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
              </div>
            </div>

            {/* ── Behind-the-Scenes Assumptions ── */}
            <details className="group">
              <summary className="text-[9px] font-bold text-stone-400 cursor-pointer hover:text-stone-600 transition-colors list-none flex items-center gap-1">
                <ChevronDown size={10} className="transition-transform group-open:rotate-180" />
                Assumption Overrides
              </summary>
              <p className="text-[9px] text-stone-400 mt-1 mb-2">Fine-tune the math behind each ROI category.</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Legacy Provider Seat Cost ($)</label><input type="number" min={0} value={session.roi_inputs?.legacyAtsSeatCost ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), legacyAtsSeatCost: v } }); }} placeholder="default: 1200" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
                <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Avg Agency Fee / Hire ($)</label><input type="number" min={0} value={session.roi_inputs?.avgAgencyFee ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), avgAgencyFee: v } }); }} placeholder="default: 15000" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
                <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Annual Job Board Spend ($)</label><input type="number" min={0} value={session.roi_inputs?.annualJobBoardSpend ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), annualJobBoardSpend: v } }); }} placeholder="default: 30000" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
                <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Lost Revenue / Empty Day ($)</label><input type="number" min={0} value={session.roi_inputs?.lostRevenuePerEmptyDay ?? ''} onChange={e => { const v = Number(e.target.value); onSessionChange({ ...session, roi_inputs: { ...(session.roi_inputs || {}), lostRevenuePerEmptyDay: v } }); }} placeholder="default: 400" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" /></div>
              </div>
              {/* CoI-specific assumptions (shown when Cost of Indecision is enabled) */}
              {(session.roi_enabled_categories?.costOfIndecision !== false) && (
                <>
                  <p className="text-[9px] font-bold text-stone-400 mt-4 mb-2">Cost of Indecision Inputs</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Open Roles', key: 'openRoles' as const, placeholder: '30' },
                      { label: 'Avg Salary ($)', key: 'avgSalary' as const, placeholder: '75000' },
                      { label: 'Annual Hires', key: 'hiresPerYear' as const, placeholder: '120' },
                      { label: 'TA Team Size', key: 'recruiterCount' as const, placeholder: '5' },
                      { label: 'Current TTF (days)', key: 'currentTTF' as const, placeholder: '52' },
                      { label: 'Projected TTF w/ TT', key: 'projectedTTF' as const, placeholder: '38' },
                      { label: 'Admin Hrs Lost/Wk', key: 'hoursWasted' as const, placeholder: '6' },
                      { label: 'Drop-off Rate (%)', key: 'dropOffRate' as const, placeholder: '22' },
                      { label: 'Agency $/Hire', key: 'agencySpendPerHire' as const, placeholder: '4200' },
                      { label: 'Recruiter Cost ($)', key: 'recruiterSalary' as const, placeholder: '95000' },
                      { label: 'Months Discussed', key: 'monthsSinceDiscussed' as const, placeholder: '3' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[8px] font-bold text-stone-400 mb-1 block">{f.label}</label>
                        <input type="number" min={0} value={session.coi_config?.[f.key] ?? ''} onChange={e => {
                          const v = Number(e.target.value);
                          const prev = session.coi_config;
                          onSessionChange({ ...session, coi_config: { 
                            enabled: true,
                            openRoles: prev?.openRoles ?? 30,
                            avgSalary: prev?.avgSalary ?? 75000,
                            recruiterCount: prev?.recruiterCount ?? 5,
                            recruiterSalary: prev?.recruiterSalary ?? 95000,
                            hoursWasted: prev?.hoursWasted ?? 6,
                            dropOffRate: prev?.dropOffRate ?? 22,
                            currentTTF: prev?.currentTTF ?? 52,
                            projectedTTF: prev?.projectedTTF ?? 38,
                            agencySpendPerHire: prev?.agencySpendPerHire ?? 4200,
                            hiresPerYear: prev?.hiresPerYear ?? 120,
                            monthsSinceDiscussed: prev?.monthsSinceDiscussed ?? 3,
                            [f.key]: v,
                          } });
                        }} placeholder={f.placeholder} className="w-full rounded-md border border-stone-200 bg-stone-50 px-2 py-1.5 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </details>

            {/* ── ROI Categories ── */}
            <div>
              <p className="text-[9px] font-bold text-stone-400 mb-2">Value Stack Categories</p>
              <div className="space-y-1.5">
                {(() => { const computedROI = computeROICategorySelection(session); return ROI_CATEGORIES_LIST.map(cat => { const enabled = computedROI[cat.key] ?? true; return (
                  <div key={cat.key} className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${enabled ? 'border-stone-200 bg-white' : 'border-dashed border-stone-200 bg-stone-50 opacity-60'}`}>
                    <div><p className="text-[11px] font-bold text-stone-700">{cat.label}</p><p className="text-[9px] text-stone-400">{cat.desc}</p></div>
                    <button onClick={() => toggleROICategory(cat.key)} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${enabled ? 'bg-stone-800' : 'bg-stone-200'}`}><motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: enabled ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} /></button>
                  </div>
                ); }); })()}
              </div>
            </div>

          </div>
        );

      case 'map': {
        // Pre-built milestone templates
        const SALES_CYCLE_TEMPLATE: MAPMilestone[] = [
          { id: `m_s1_${Date.now()}`, label: 'Intro Call — Establish mutual fit & align on goals', owner: 'Service Alignment', dueDate: '', done: false },
          { id: `m_s2_${Date.now()}`, label: 'Tailored Demo — Career site, pipeline, AI & automation', owner: 'Service Alignment', dueDate: '', done: false },
          { id: `m_s3_${Date.now()}`, label: 'Business Case Review — Finalize capabilities & desired outcomes', owner: session.company_name, dueDate: '', done: false },
          { id: `m_s4_${Date.now()}`, label: 'Commercial Proposal — Preview pricing, implementation steps & T&Cs', owner: 'Service Alignment', dueDate: '', done: false },
          { id: `m_s5_${Date.now()}`, label: 'Internal Stakeholder Review — Security, IT & leadership sign-off', owner: session.company_name, dueDate: '', done: false },
          { id: `m_s6_${Date.now()}`, label: 'Contract Sign Off — Finalize commercial terms & mutual agreement', owner: session.company_name, dueDate: '', done: false },
        ];

        const IMPLEMENTATION_TEMPLATE: MAPMilestone[] = [
          { id: `m_i1_${Date.now()}`, label: 'Implementation Kickoff — Meet CSM, align on timeline, success metrics & go-live date', owner: 'Service Alignment CSM', dueDate: '', done: false },
          { id: `m_i2_${Date.now()}`, label: 'Content Prep — Gather photos, videos, brand assets & copy for career site', owner: session.company_name, dueDate: '', done: false },
          { id: `m_i3_${Date.now()}`, label: 'Data Migration — Export from legacy Provider, map fields, import candidates & job history', owner: 'Service Alignment CSM', dueDate: '', done: false },
          { id: `m_i4_${Date.now()}`, label: 'Account Configuration — Departments, roles, locations, message templates & reject reasons', owner: 'Service Alignment CSM', dueDate: '', done: false },
          { id: `m_i5_${Date.now()}`, label: 'Data & Privacy Setup — GDPR templates, retention periods, consent & cookie policies', owner: session.company_name, dueDate: '', done: false },
          { id: `m_i6_${Date.now()}`, label: 'Career Site Build — Design branded career site, department & landing pages', owner: session.company_name, dueDate: '', done: false },
          { id: `m_i7_${Date.now()}`, label: 'Interview Kits & Job Templates — Scorecards, application forms & default workflows', owner: 'Service Alignment CSM', dueDate: '', done: false },
          { id: `m_i8_${Date.now()}`, label: 'Integrations Setup — HRIS, calendar, SSO, job boards, assessment & background check tools', owner: 'Service Alignment CSM', dueDate: '', done: false },
          { id: `m_i9_${Date.now()}`, label: 'Automations & Add-on Activation — Triggers, Nurture, Co-pilot, NPS, Smart Schedule', owner: 'Service Alignment CSM', dueDate: '', done: false },
          { id: `m_i10_${Date.now()}`, label: 'Recruiter Training — Job creation, pipeline management, candidate collaboration', owner: 'Service Alignment CSM', dueDate: '', done: false },
          { id: `m_i11_${Date.now()}`, label: 'Hiring Manager Training — Profile setup, candidate review, notes, interview feedback', owner: session.company_name, dueDate: '', done: false },
          { id: `m_i12_${Date.now()}`, label: 'UAT & Testing — Candidate flow, recruiter flow, domain verification, user invitations', owner: session.company_name, dueDate: '', done: false },
          { id: `m_i13_${Date.now()}`, label: 'Go-Live — Custom domain live, homepage linked, legacy Provider decommissioned', owner: session.company_name, dueDate: '', done: false },
          { id: `m_i14_${Date.now()}`, label: 'Launch Campaign — Internal comms (intranet) & external comms (LinkedIn, social, website)', owner: session.company_name, dueDate: '', done: false },
          { id: `m_i15_${Date.now()}`, label: 'Hypercare (2 weeks) — Dedicated CSM support, daily check-ins, workflow fine-tuning', owner: 'Service Alignment CSM', dueDate: '', done: false },
          { id: `m_i16_${Date.now()}`, label: '30-Day Success Review — Adoption metrics, ROI validation & optimization roadmap', owner: 'Service Alignment CSM', dueDate: '', done: false },
        ];

        const FULL_TEMPLATE: MAPMilestone[] = [...SALES_CYCLE_TEMPLATE.map((m, i) => ({ ...m, id: `m_f${i}_${Date.now()}` })), ...IMPLEMENTATION_TEMPLATE.map((m, i) => ({ ...m, id: `m_g${i}_${Date.now()}` }))];

        const applyTemplate = (template: MAPMilestone[]) => {
          onSessionChange({ ...session, mutual_action_plan: template });
          setExpandedSection('map');
        };

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
              <div><p className="text-xs font-bold text-stone-700">Show Mutual Action Plan timeline</p><p className="text-[10px] text-stone-400">Prospect sees shared milestones in their room</p></div>
              <button onClick={() => onSessionChange({ ...session, room_enable_map: !session.room_enable_map })} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${session.room_enable_map ? 'bg-stone-800' : 'bg-stone-200'}`}>
                <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: session.room_enable_map ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
              </button>
            </div>

            {/* Template buttons */}
            <div>
              <p className="text-[9px] font-bold text-stone-400 mb-2">Load Template</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => applyTemplate(SALES_CYCLE_TEMPLATE)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-stone-200 px-3 py-3 text-center hover:border-stone-400 hover:bg-stone-50 transition-all group"
                >
                  <span className="text-base">🤝</span>
                  <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-800">Sales Cycle</span>
                  <span className="text-[8px] text-stone-400">6 milestones</span>
                </button>
                <button
                  onClick={() => applyTemplate(IMPLEMENTATION_TEMPLATE)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-stone-200 px-3 py-3 text-center hover:border-stone-400 hover:bg-stone-50 transition-all group"
                >
                  <span className="text-base">🚀</span>
                  <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-800">Implementation</span>
                  <span className="text-[8px] text-stone-400">16 milestones</span>
                </button>
                <button
                  onClick={() => applyTemplate(FULL_TEMPLATE)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-stone-200 px-3 py-3 text-center hover:border-stone-400 hover:bg-stone-50 transition-all group"
                >
                  <span className="text-base">📋</span>
                  <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-800">Full Journey</span>
                  <span className="text-[8px] text-stone-400">22 milestones</span>
                </button>
              </div>
              {milestones.length > 0 && (
                <p className="text-[9px] text-amber-500 mt-1.5">⚠ Loading a template will replace current milestones</p>
              )}
            </div>

            {milestones.length > 0 && (
              <div className="space-y-2">
                {milestones.map(m => (
                  <div key={m.id} className="rounded-lg border border-stone-200 bg-white p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleMilestoneDone(m.id)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${m.done ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 hover:border-emerald-400'}`}>{m.done && <Check size={10} className="text-white" />}</button>
                      <input value={m.label} onChange={e => updateMilestone(m.id, 'label', e.target.value)} placeholder="Milestone label…" className={`flex-1 text-[11px] font-semibold bg-transparent focus:outline-none ${m.done ? 'line-through text-stone-400' : 'text-stone-700'}`} />
                      <button onClick={() => deleteMilestone(m.id)} className="shrink-0 text-stone-300 hover:text-rose-400 transition-colors"><X size={12} /></button>
                    </div>
                    <div className="flex items-center gap-2 pl-7">
                      <input value={m.owner} onChange={e => updateMilestone(m.id, 'owner', e.target.value)} placeholder="Owner" className="flex-1 rounded-md border border-stone-100 bg-stone-50 px-2 py-1 text-[10px] text-stone-600 focus:outline-none focus:border-stone-300" />
                      <input type="date" value={m.dueDate} onChange={e => updateMilestone(m.id, 'dueDate', e.target.value)} className="flex-1 rounded-md border border-stone-100 bg-stone-50 px-2 py-1 text-[10px] text-stone-600 focus:outline-none focus:border-stone-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={addMilestone} className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-stone-200 py-2.5 text-[10px] font-semibold text-stone-400 hover:border-stone-300 hover:text-stone-600 hover:bg-stone-50 transition-all">+ Add Milestone</button>
          </div>
        );
      }

      case 'pricing':
        return <PricingConfigPanel session={session} onSessionChange={onSessionChange} />;

      case 'proposal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Next Meeting Date</label><input type="date" value={session.next_meeting_date ?? ''} onChange={e => onSessionChange({ ...session, next_meeting_date: e.target.value })} className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors" /></div>
              <div><label className="text-[9px] font-bold text-stone-400 mb-1.5 block">Implementation Timeline</label><select value={session.implementation_timeline ?? ''} onChange={e => onSessionChange({ ...session, implementation_timeline: e.target.value })} className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"><option value="">— Select timeline —</option>{['ASAP (1–2 weeks)','Q3 2026','Q4 2026','Q1 2027','Q2 2027','H2 2027','2028','Flexible / TBD'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5">
              <div><p className="text-[11px] font-bold text-stone-700">Budget Confirmed</p><p className="text-[9px] text-stone-400">Has budget been allocated for this purchase?</p></div>
              <button onClick={() => onSessionChange({ ...session, budget_confirmed: !session.budget_confirmed })} className={`relative shrink-0 w-9 h-5 rounded-full transition-all duration-200 ${session.budget_confirmed ? 'bg-emerald-500' : 'bg-stone-200'}`}><motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: session.budget_confirmed ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} /></button>
            </div>
          </div>
        );

      case 'diagnosis':
        return (
          <div className="space-y-3">
            {/* Persona Reframe override */}
            <div>
              <label className="text-[9px] font-bold text-stone-400 mb-1.5 block">
                Persona Template
              </label>
              <p className="text-[10px] text-stone-400 mb-2 leading-relaxed">
                Which persona template to use as the default. Override with a custom statement below for a more tailored room.
              </p>
              <select
                value={(session as any).diagnosis_persona_override || ''}
                onChange={e => onSessionChange({ ...session, diagnosis_persona_override: e.target.value } as any)}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
              >
                <option value="">— Auto (from selected persona) —</option>
                <option value="vp-ta">VP of Talent Acquisition — Recruiter Capacity Gap</option>
                <option value="chro">CHRO / VP People — Competitive Speed Gap</option>
                <option value="dir-eb">Director of Employer Brand — Talent Brand Gap</option>
                <option value="hiring-manager">Hiring Managers — Manager Adoption Gap</option>
                <option value="cfo">CFO / Finance — Hidden Hiring Cost Crisis</option>
                <option value="recruiter">Recruiter / TA Specialist — Productivity Drain</option>
                <option value="procurement">Procurement — Vendor Risk Exposure</option>
                <option value="it-cio">IT / CIO — HR Tech Governance Gap</option>
                <option value="all">Leadership Team — Infrastructure Gap</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };


  return (
    <div className="flex-1 overflow-y-auto bg-stone-50/30">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-3">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-stone-800">Room Settings</h2>
            <p className="text-[11px] text-stone-400 mt-0.5">Customise every section of the prospect's Discovery Room.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-[10px] font-bold text-stone-600">
            <Eye size={10} />{enabledCount}/{RAIL_SECTIONS.length} on
          </span>
          <button
            onClick={() => {
              const result = computeAutoRoomConfig(session);
              // Apply visibility
              for (const [key, val] of Object.entries(result.visibility)) {
                if (visibility[key as SectionKey] !== val) {
                  onToggleVisibility(key as SectionKey);
                }
              }
              // Apply config updates
              if (Object.keys(result.configUpdates).length > 0) {
                onSessionChange({ ...session, ...result.configUpdates, room_visibility: result.visibility });
              } else {
                onSessionChange({ ...session, room_visibility: result.visibility });
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800 text-white px-3 py-1.5 text-[10px] font-bold hover:bg-stone-700 transition-colors"
          >
            <Sparkles size={10} />
            Auto-Configure
          </button>
        </div>

        {(() => {
          const STAGE_LABELS: Record<string, string> = {
            act1: 'Act 1 · What You Shared',
            act2: 'Act 2 · How We Solve It',
            act3: 'Act 3 · Your Path Forward',
          };
          let lastStage = '';

          return RAIL_SECTIONS.map(sec => {
            const isVisible = visibility[sec.key];
            const unlockStage = SECTION_UNLOCK_STAGE[sec.key];
            const unlockLabel = STAGE_SHORT_LABELS[unlockStage] ?? 'D1';
            const isLocked = !isStageAtOrPast(currentStage, unlockStage);
            const isExpanded = expandedSection === sec.key;
            const configContent = sec.hasConfig ? renderConfig(sec.key) : null;
            const hasConfig = sec.hasConfig && configContent !== null;
            const desc = SECTION_DESCRIPTIONS[sec.key] ?? '';

            // Stage group header
            let stageHeader: React.ReactNode = null;
            if (sec.stage !== lastStage) {
              lastStage = sec.stage;
              stageHeader = (
                <div className="flex items-center gap-2 mt-5 mb-2 first:mt-0">
                  <span className="text-[10px] font-bold text-stone-300">
                    {STAGE_LABELS[sec.stage] ?? sec.stage}
                  </span>
                  <div className="flex-1 h-px bg-stone-100" />
                </div>
              );
            }

            return (
              <Fragment key={sec.key}>
                {stageHeader}
                <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isLocked && !isVisible ? 'border-stone-100 bg-stone-50 opacity-40'
                  : isVisible ? 'border-stone-200 bg-white'
                  : 'border-stone-100 bg-stone-50/50'
                }`}>
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    {/* Toggle */}
                    <button onClick={() => onToggleVisibility(sec.key)}
                      className={`relative shrink-0 w-8 h-[18px] rounded-full transition-all duration-200 ${isVisible ? 'bg-stone-800' : 'bg-stone-200'}`}>
                      <motion.div className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm"
                        animate={{ x: isVisible ? 15 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                    </button>
                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold ${isVisible ? 'text-stone-800' : isLocked ? 'text-stone-300' : 'text-stone-400'}`}>
                        {sec.label}
                        {isLocked && <span className="ml-2 text-[9px] font-medium text-stone-300">Unlocks {unlockLabel}</span>}
                      </p>
                      {desc && <p className={`text-[9px] mt-0.5 ${isVisible ? 'text-stone-400' : 'text-stone-300'}`}>{desc}</p>}
                    </div>
                    {/* Config btn */}
                    {hasConfig && isVisible && (
                      <button onClick={() => toggleSection(sec.key)}
                        className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-stone-400 hover:text-stone-600 transition-colors">
                        Configure <ChevronDown size={10} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {isExpanded && hasConfig && isVisible && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <div className="px-5 pb-5 pt-3 border-t border-stone-100">
                          {configContent}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Fragment>
            );
          });
        })()}

        <div className="h-10" />
      </div>
    </div>
  );
}
