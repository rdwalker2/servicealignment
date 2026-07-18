import { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2, AlertCircle, Crosshair, MessageSquare,
  AlertTriangle, Copy, Check, ChevronDown, ChevronUp,
  DollarSign, Zap, Target, Search, ArrowLeft
} from 'lucide-react';
import type { Battlecard } from '../../data/battlecards';
import { BATTLECARDS } from '../../data/battlecards';
import { WikiCard } from '../../components/wiki/WikiCard';
import type { WikiFeature } from '../../data/productWiki';

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy script"
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
        copied
          ? 'bg-emerald-500 text-white'
          : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ── Trap Question Card ────────────────────────────────────────────────────────

function TrapCard({ question, painHighlighted }: { question: string; painHighlighted: string }) {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-stone-200 hover:border-pink-500/30 transition-all duration-300">
      <div className="relative p-6 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-7 h-7 rounded-lg bg-pink-50 flex items-center justify-center shrink-0 mt-0.5 border border-pink-100">
            <Target size={14} className="text-pink-500" />
          </div>
          <p className="text-stone-900 font-semibold leading-snug text-[15px]">"{question}"</p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-bold uppercase tracking-wider mb-3">
            <ChevronUp size={12} className="rotate-180" />
            Why this works
          </div>
          
          <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 text-stone-600 text-sm leading-relaxed">
            <span className="font-bold text-[#FF2A7F]">The Trap: </span>
            {painHighlighted}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Differentiator Row ────────────────────────────────────────────────────────

function DiffRow({ index, claim, proof, ttFeature }: { index: number; claim: string; proof: string; ttFeature: string }) {
  return (
    <div className="group flex gap-5 py-5 border-b border-stone-100 last:border-0 hover:bg-stone-50/50 px-3 -mx-3 rounded-lg transition-all duration-200">
      <div className="shrink-0 pt-0.5">
        <span className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center text-[11px] font-black text-stone-500 tabular-nums transition-colors">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <h4 className="font-bold text-stone-900 text-[14px]">{claim}</h4>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100/50 text-pink-600 text-[10px] font-bold border border-pink-200/50">
            <Zap size={9} /> {ttFeature}
          </span>
        </div>
        <p className="text-stone-600 text-[13px] leading-relaxed">{proof}</p>
      </div>
    </div>
  );
}

// ── Grid View ─────────────────────────────────────────────────────────────────

function CompetitorGrid({ onSelect }: { onSelect: (id: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = Array.from(new Set(BATTLECARDS.map(bc => bc.category)));
  
  const filtered = BATTLECARDS.filter(bc => {
    if (activeCategory !== 'all' && bc.category !== activeCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return bc.competitorName.toLowerCase().includes(query) || 
             bc.pricingIntelligence.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-stone-50 overflow-hidden">
      {/* Header & Search */}
      <div className="px-8 py-8 border-b border-stone-200 bg-white shrink-0">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-2">Competitor Intelligence</h1>
        <p className="text-stone-500 text-lg mb-6">Battlecards, pricing intel, and traps for our main competitors.</p>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-3xl">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search competitors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-stone-300 focus:bg-white transition-all"
            />
          </div>
          <div className="text-sm text-stone-400 font-semibold">{filtered.length} results</div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all ${
              activeCategory === 'all'
                ? 'bg-stone-800 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all ${
                activeCategory === cat
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-12 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(bc => {
            const mappedFeature: WikiFeature = {
              id: bc.id,
              title: bc.competitorName,
              subtitle: bc.pricingIntelligence,
              category: bc.category,
              status: 'verified',
              tags: [`Tier ${bc.tier}`, 'competitor'],
            };
            return (
              <WikiCard key={bc.id} feature={mappedFeature} onClick={() => onSelect(bc.id)} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Detail View ───────────────────────────────────────────────────────────────

function CompetitorDetail({ battlecard, onBack }: { battlecard: Battlecard; onBack: () => void }) {
  return (
    <div className="bg-stone-50 min-h-full">
      {/* Header */}
      <div className="pt-8 pb-4 px-8 relative">
        <div className="relative max-w-6xl mx-auto flex flex-col gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors w-fit text-sm font-semibold"
          >
            <ArrowLeft size={16} /> Back to Competitors
          </button>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white border border-stone-200 flex items-center justify-center shadow-sm shrink-0">
              <span className="text-stone-900 font-black text-3xl">{battlecard.logoText}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-xs font-bold text-stone-600 tracking-widest uppercase">
                  {battlecard.category}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-pink-50 border border-pink-100 text-xs font-bold text-pink-600 tracking-widest uppercase">
                  Tier {battlecard.tier}
                </span>
              </div>
              <h1 className="text-4xl font-black text-stone-900 tracking-tight">
                Winning Against <span className="text-[#FF2A7F]">{battlecard.competitorName}</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-8 relative z-10 space-y-6">
        
        {/* Row 1: The Bento Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Pricing Intel */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm col-span-1 lg:col-span-3">
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-500" /> Pricing Intelligence
            </h3>
            <p className="text-stone-700 text-sm leading-relaxed">{battlecard.pricingIntelligence}</p>
          </div>

          {/* When We Win */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm border-t-4 border-t-emerald-500">
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" /> When We Win
            </h3>
            <ul className="space-y-3">
              {battlecard.whenWeWin.map((win, i) => (
                <li key={i} className="flex gap-3 text-[13px] text-stone-700 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* When We Lose */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm border-t-4 border-t-rose-500">
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-500" /> When We Lose
            </h3>
            <ul className="space-y-3">
              {battlecard.whenWeLose.map((lose, i) => (
                <li key={i} className="flex gap-3 text-[13px] text-stone-700 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{lose}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Their Strengths */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm border-t-4 border-t-amber-500">
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" /> Their Strengths (Know Cold)
            </h3>
            <ul className="space-y-3">
              {battlecard.competitorStrengths.map((str, i) => (
                <li key={i} className="flex gap-3 text-[13px] text-stone-700 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Row 2: Trap Questions */}
        <div>
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
            <Target size={14} className="text-pink-500" /> Trap Questions (Discovery)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {battlecard.trapQuestions.map((trap, i) => (
              <TrapCard key={i} question={trap.question} painHighlighted={trap.painHighlighted} />
            ))}
          </div>
        </div>

        {/* Row 3: Differentiators */}
        <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Crosshair size={14} className="text-blue-500" /> Our Differentiators
          </h3>
          <div className="space-y-2">
            {battlecard.ourDifferentiators.map((diff, i) => (
              <DiffRow key={i} index={i} claim={diff.claim} proof={diff.proof} ttFeature={diff.ttFeature} />
            ))}
          </div>
        </div>

        {/* Row 4: Objections */}
        <div>
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
            <MessageSquare size={14} className="text-violet-500" /> Talk Tracks & Rebuttals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {battlecard.objections.map((obj, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <p className="font-bold text-stone-900 text-sm mb-4 leading-snug">"{obj.question}"</p>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 relative">
                  <p className="text-[13px] text-stone-600 leading-relaxed italic">
                    {obj.script}
                  </p>
                  <div className="absolute -bottom-2 -right-2">
                    <CopyButton text={obj.script} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────

export default function CompetitorWiki() {
  const [activeBattlecardId, setActiveBattlecardId] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto bg-stone-50">
      {activeBattlecardId ? (
        <CompetitorDetail 
          battlecard={BATTLECARDS.find(bc => bc.id === activeBattlecardId)!} 
          onBack={() => setActiveBattlecardId(null)} 
        />
      ) : (
        <CompetitorGrid onSelect={setActiveBattlecardId} />
      )}
    </div>
  );
}
