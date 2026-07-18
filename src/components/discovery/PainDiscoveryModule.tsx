import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Brain, Target, Zap, CheckCircle2, ChevronDown } from 'lucide-react';
import type { DiscoverySession, Stakeholder } from '../../lib/discoveryDatabase';
import { StakeholderMapping } from './StakeholderMapping';
import {
    PERSONAS, ATS_OPTIONS, ATS_PAIN_MAP, ATS_MATURITY_MAP,
    INDUSTRIES, INDUSTRY_PAIN_MAP, COMPANY_SIZES, USE_CASES,
    TT_PAINS,
    type ATSOption, type PersonaId, type PainCategory,
} from '../../data/painData';

// Re-export types and data that other components depend on
export type { PersonaId, PainCategory, ATSOption };
export { PERSONAS, TT_PAINS, PAIN_CATEGORIES } from '../../data/painData';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface PainDiscoveryModuleProps {
    session?: DiscoverySession;
    onStakeholderChange?: (stakeholders: Stakeholder[]) => void;
    companyName: string;
    themeColor?: string;
    onChange: (selectedIds: string[]) => void;
    onPersonaChange?: (personaId: string) => void;
    onATSChange?: (ats: string) => void;
    onIndustryChange?: (industry: string) => void;
    onCompanySizeChange?: (size: string) => void;
    onUseCaseChange?: (useCase: string) => void;
    externalSelectedIds: string[];
    initialATS?: string;
}

/* ------------------------------------------------------------------ */
/*  Provider Deal Play Badge                                                */
/* ------------------------------------------------------------------ */

function ATSDealPlayBadge({ ats }: { ats: string }) {
    if (ats === 'None' || !ATS_MATURITY_MAP[ats]) return null;
    const maturity = ATS_MATURITY_MAP[ats];
    const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        amber: 'bg-amber-50 border-amber-200 text-amber-700',
        orange: 'bg-orange-50 border-orange-200 text-orange-700',
        purple: 'bg-purple-50 border-purple-200 text-purple-700',
        rose: 'bg-rose-50 border-rose-200 text-rose-700',
        zinc: 'bg-stone-50 border-stone-200 text-stone-600',
    };
    const cls = colorMap[maturity.color] || colorMap.stone;
    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 mx-auto max-w-lg rounded-xl border px-4 py-2.5 text-center ${cls}`}
        >
            <span className="text-[10px] font-bold opacity-70 mr-2">Play:</span>
            <span className="text-xs font-bold mr-3">{maturity.play}</span>
            <span className="text-[11px] opacity-80">{maturity.context}</span>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Provider Dropdown Selector                                              */
/* ------------------------------------------------------------------ */

function ATSDropdown({
    selectedATS,
    themeColor,
    onSelect,
}: {
    selectedATS: ATSOption;
    themeColor: string;
    onSelect: (ats: ATSOption) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="mb-6 flex items-center justify-center gap-3">
            <span className="text-sm font-medium text-stone-500">Current Provider:</span>
            <div className="relative" ref={ref}>
                <button
                    onClick={() => setOpen(prev => !prev)}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:border-stone-300 hover:shadow-md"
                    style={selectedATS !== 'None' ? { borderColor: themeColor, color: themeColor } : {}}
                >
                    {selectedATS === 'None' ? 'Select Provider…' : selectedATS}
                    <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-1/2 z-50 mt-2 w-52 -translate-x-1/2 rounded-xl border border-stone-200 bg-white py-1 shadow-xl"
                        >
                            {ATS_OPTIONS.map(ats => (
                                <button
                                    key={ats}
                                    onClick={() => { onSelect(ats); setOpen(false); }}
                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
 selectedATS === ats
 ? 'font-semibold text-stone-900 bg-stone-50'
 : 'text-stone-600 hover:bg-stone-50'
 }`}
                                >
                                    {ats}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Context Selectors (Industry / Size / Use Case)                     */
/* ------------------------------------------------------------------ */

function ContextSelectors({
    selectedIndustry,
    selectedSize,
    selectedUseCase,
    themeColor,
    onIndustryChange,
    onSizeChange,
    onUseCaseChange,
}: {
    selectedIndustry: string;
    selectedSize: string;
    selectedUseCase: string;
    themeColor: string;
    onIndustryChange: (v: string) => void;
    onSizeChange: (v: string) => void;
    onUseCaseChange: (v: string) => void;
}) {
    return (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <select
                value={selectedIndustry}
                onChange={(e) => onIndustryChange(e.target.value)}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none pr-8 cursor-pointer"
                style={selectedIndustry !== 'none' ? { borderColor: themeColor, color: themeColor } : {}}
            >
                {INDUSTRIES.map(ind => <option key={ind.id} value={ind.id}>{ind.label}</option>)}
            </select>
            <select
                value={selectedSize}
                onChange={(e) => onSizeChange(e.target.value)}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none pr-8 cursor-pointer"
                style={selectedSize !== 'none' ? { borderColor: themeColor, color: themeColor } : {}}
            >
                {COMPANY_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select
                value={selectedUseCase}
                onChange={(e) => onUseCaseChange(e.target.value)}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none pr-8 cursor-pointer"
                style={selectedUseCase !== 'none' ? { borderColor: themeColor, color: themeColor } : {}}
            >
                {USE_CASES.map(uc => <option key={uc.id} value={uc.id}>{uc.label}</option>)}
            </select>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Persona Tab Bar                                                    */
/* ------------------------------------------------------------------ */

function PersonaTabBar({
    tabs,
    selectedId,
    themeColor,
    label,
    onSelect,
}: {
    tabs: { id: string; label: string; personaId: string }[];
    selectedId: string;
    themeColor: string;
    label: string;
    onSelect: (id: string) => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-xs font-bold text-stone-400 mb-3">{label}</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onSelect(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
 selectedId === tab.id
 ? 'bg-stone-900 text-white shadow-md'
 : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
 }`}
                        style={selectedId === tab.id ? { backgroundColor: themeColor } : {}}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Quick Capture Mode                                                 */
/* ------------------------------------------------------------------ */

function QuickCaptureList({
    pains,
    selectedIds,
    onToggle,
    search,
    onSearchChange,
}: {
    pains: typeof TT_PAINS;
    selectedIds: string[];
    onToggle: (id: string) => void;
    search: string;
    onSearchChange: (v: string) => void;
}) {
    const filtered = pains.filter(p => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.ttFeature.toLowerCase().includes(q);
    });

    return (
        <div>
            <div className="mb-4 relative">
                <input
                    type="text"
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Type to filter pains... (e.g. 'career site', 'mobile', 'screening')"
                    autoFocus
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 pl-10 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <Brain size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
            <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-stone-200 bg-white divide-y divide-stone-100">
                {filtered.map(pain => {
                    const isSelected = selectedIds.includes(pain.id);
                    const Icon = pain.icon;
                    return (
                        <button
                            key={pain.id}
                            onClick={() => onToggle(pain.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
 isSelected ? 'bg-emerald-50' : 'hover:bg-stone-50'
 }`}
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
 isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-stone-300'
 }`}>
                                {isSelected && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <Icon size={16} className={isSelected ? 'text-emerald-600' : 'text-stone-400'} />
                            <div className="flex-1 min-w-0">
                                <span className={`text-sm font-semibold ${isSelected ? 'text-emerald-800' : 'text-stone-800'}`}>
                                    {pain.title}
                                </span>
                                <span className="ml-2 text-[10px] font-bold text-stone-400">
                                    {pain.ttFeature}
                                </span>
                                {isSelected && pain.verbatim && (
                                    <p className="mt-1 text-xs italic text-amber-700 truncate">
                                        💬 {pain.verbatim.slice(0, 100)}{pain.verbatim.length > 100 ? '…' : ''}
                                    </p>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Pain Card Grid                                                     */
/* ------------------------------------------------------------------ */

function PainCardGrid({
    pains,
    selectedIds,
    highlightedIds,
    selectedATS,
    themeColor,
    stakeholders,
    onToggle,
    activePersonaId,
}: {
    pains: typeof TT_PAINS;
    selectedIds: string[];
    highlightedIds: string[];
    selectedATS: string;
    themeColor: string;
    stakeholders: Stakeholder[];
    onToggle: (id: string) => void;
    activePersonaId: string;
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" key={activePersonaId}>
            <AnimatePresence mode="popLayout">
                {pains.map((pain, index) => {
                    const isSelected = selectedIds.includes(pain.id);
                    const isHighlighted = highlightedIds.includes(pain.id);
                    const Icon = pain.icon;

                    return (
                        <motion.button
                            key={pain.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onToggle(pain.id)}
                            className={`group relative flex flex-col items-start rounded-2xl border p-6 text-left transition-all duration-300 ${
 isSelected
 ? 'border-transparent bg-white shadow-xl ring-2'
 : 'border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white hover:shadow-[0_0_20px_rgba(0,0,0,0.08)]'
 }`}
                            style={{ '--tw-ring-color': isSelected ? themeColor : 'transparent' } as React.CSSProperties}
                        >
                            {/* Icon + Check */}
                            <div className="mb-4 flex w-full items-start justify-between">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
 isSelected ? 'text-white' : 'bg-stone-200 text-stone-600 group-hover:bg-stone-100'
 }`}
                                    style={{ backgroundColor: isSelected ? themeColor : undefined }}
                                >
                                    <Icon size={24} className="transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                <div
                                    className={`transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                                    style={{ color: isSelected ? themeColor : '#a1a1aa' }}
                                >
                                    <CheckCircle2 size={24} />
                                </div>
                            </div>

                            {/* Badges Row */}
                            <div className="mb-2 flex items-center gap-2 flex-wrap">
                                {stakeholders.filter(s => s.persona_id === pain.persona).length > 0 ? (
                                    stakeholders.filter(s => s.persona_id === pain.persona).map(s => (
                                        <span key={s.id} className="rounded bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                                            {s.name || s.role}
                                        </span>
                                    ))
                                ) : (
                                    <span className="rounded bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                                        {PERSONAS.find(p => p.id === pain.persona)?.label}
                                    </span>
                                )}
                                <span
                                    className="rounded px-2 py-0.5 text-[10px] font-bold text-white"
                                    style={{ backgroundColor: isSelected ? themeColor : '#a1a1aa' }}
                                >
                                    {pain.ttFeature}
                                </span>
                                {isHighlighted && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="inline-flex items-center gap-1 rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700"
                                    >
                                        🔥 Common with {selectedATS}
                                    </motion.span>
                                )}
                            </div>

                            <h3 className="mb-2 text-lg font-semibold text-stone-900">{pain.title}</h3>
                            <p className="text-sm leading-relaxed text-stone-500">{pain.description}</p>

                            {/* Verbatim quote from real prospect calls */}
                            {isSelected && pain.verbatim && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full rounded-lg bg-amber-50 border border-amber-200/60 px-3 py-2.5"
                                >
                                    <p className="text-xs font-bold text-amber-600/70 mb-1">💬 Real Prospect Quote</p>
                                    <p className="text-[13px] leading-relaxed text-amber-900 italic font-medium">{pain.verbatim}</p>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function PainDiscoveryModule({
    session,
    onStakeholderChange,
    companyName,
    themeColor = '#10B981',
    onChange,
    onPersonaChange,
    onATSChange,
    onIndustryChange,
    onCompanySizeChange,
    onUseCaseChange,
    externalSelectedIds,
    initialATS,
}: PainDiscoveryModuleProps) {
    const [selectedPersona, setSelectedPersona] = useState<string>('all');
    const [selectedATS, setSelectedATS] = useState<ATSOption>((initialATS as ATSOption) || 'None');
    const [selectedIndustry, setSelectedIndustry] = useState('none');
    const [selectedSize, setSelectedSize] = useState('none');
    const [selectedUseCase, setSelectedUseCase] = useState('none');
    const [quickCapture, setQuickCapture] = useState(false);
    const [quickSearch, setQuickSearch] = useState('');

    const stakeholders = session?.stakeholders || [];

    // Dynamic tabs based on stakeholders, or default to static personas if none
    const tabs = stakeholders.length > 0
        ? stakeholders.map(s => ({
            id: s.id,
            label: `${s.name || 'Unnamed'} (${s.role})`,
            personaId: s.persona_id || 'all'
          }))
        : PERSONAS.map(p => ({ ...p, personaId: p.id }));

    useEffect(() => {
        if (stakeholders.length > 0 && !tabs.find(t => t.id === selectedPersona)) {
            setSelectedPersona(tabs[0].id);
        } else if (stakeholders.length === 0 && !tabs.find(t => t.id === selectedPersona)) {
            setSelectedPersona('all');
        }
    }, [stakeholders.length, selectedPersona, tabs]);

    const activeTab = tabs.find(t => t.id === selectedPersona) || tabs[0];
    const activePersonaId = activeTab?.personaId || 'all';

    const handlePersonaChange = (id: string) => {
        setSelectedPersona(id);
        const tab = tabs.find(t => t.id === id);
        if (tab) onPersonaChange?.(tab.personaId);
    };

    const handleATSChange = (ats: ATSOption) => {
        setSelectedATS(ats);
        onATSChange?.(ats);
    };

    const togglePain = (id: string) => {
        if (externalSelectedIds.includes(id)) {
            onChange(externalSelectedIds.filter(p => p !== id));
        } else {
            onChange([...externalSelectedIds, id]);
        }
    };

    const displayedPains =
        activePersonaId === 'all'
            ? TT_PAINS
            : TT_PAINS.filter(p => p.persona === activePersonaId || (p as any).personaTabs?.includes(activePersonaId));

    const highlightedPainIds = [
        ...(selectedATS !== 'None' ? (ATS_PAIN_MAP[selectedATS] ?? []) : []),
        ...(selectedIndustry !== 'none' ? (INDUSTRY_PAIN_MAP[selectedIndustry] ?? []) : []),
    ];
    const uniqueHighlights = [...new Set(highlightedPainIds)];

    return (
        <div className="w-full">
            <div className="mb-10 text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-stone-100 p-3 text-stone-500">
                    <Target size={24} />
                </div>
                <h2 className="mb-3 text-3xl font-bold text-stone-900">
                    Executive Objectives for {companyName}
                </h2>
                <p className="mx-auto max-w-2xl text-stone-500 mb-8">
                    Select the key operational bottlenecks you are prioritizing this quarter. Each maps directly to a specific Service Alignment capability.
                </p>

                {session && onStakeholderChange && (
                    <StakeholderMapping session={session} onChange={onStakeholderChange} />
                )}

                <ATSDropdown
                    selectedATS={selectedATS}
                    themeColor={themeColor}
                    onSelect={handleATSChange}
                />

                <ATSDealPlayBadge ats={selectedATS} />

                <ContextSelectors
                    selectedIndustry={selectedIndustry}
                    selectedSize={selectedSize}
                    selectedUseCase={selectedUseCase}
                    themeColor={themeColor}
                    onIndustryChange={(v) => { setSelectedIndustry(v); onIndustryChange?.(v); }}
                    onSizeChange={(v) => { setSelectedSize(v); onCompanySizeChange?.(v); }}
                    onUseCaseChange={(v) => { setSelectedUseCase(v); onUseCaseChange?.(v); }}
                />

                <PersonaTabBar
                    tabs={tabs}
                    selectedId={selectedPersona}
                    themeColor={themeColor}
                    label={stakeholders.length > 0 ? 'View Pains By Stakeholder' : 'Or Explore By Persona'}
                    onSelect={handlePersonaChange}
                />
            </div>

            {/* Quick Capture Toggle */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setQuickCapture(v => !v); setQuickSearch(''); }}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
 quickCapture
 ? 'bg-emerald-600 text-white shadow-md'
 : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
 }`}
                    >
                        <Zap size={14} />
                        {quickCapture ? 'Quick Capture ON' : 'Quick Capture'}
                    </button>
                    {quickCapture && (
                        <span className="text-xs text-stone-400">
                            Type to filter • Click to select • Fast mode for live calls
                        </span>
                    )}
                </div>
                <span className="text-sm font-medium text-stone-400">
                    {externalSelectedIds.length} selected
                </span>
            </div>

            {quickCapture ? (
                <QuickCaptureList
                    pains={displayedPains}
                    selectedIds={externalSelectedIds}
                    onToggle={togglePain}
                    search={quickSearch}
                    onSearchChange={setQuickSearch}
                />
            ) : (
                <PainCardGrid
                    pains={displayedPains}
                    selectedIds={externalSelectedIds}
                    highlightedIds={uniqueHighlights}
                    selectedATS={selectedATS}
                    themeColor={themeColor}
                    stakeholders={stakeholders}
                    onToggle={togglePain}
                    activePersonaId={activePersonaId}
                />
            )}
        </div>
    );
}

export default PainDiscoveryModule;
