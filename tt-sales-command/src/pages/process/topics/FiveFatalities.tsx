import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';

export default function FiveFatalities() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="The 5 Fatalities" 
        subtitle="The only five reasons a deal ever dies — and how the 4D methodology prevents each one." 
      />

      <DocSection title="Overview">
        <p>
          Every lost deal can be traced back to one of five root causes. The entire 4D methodology is engineered to proactively neutralize these "deal-killers" before they strike. Your job is to identify which fatality is most likely and address it during the appropriate checkpoint.
        </p>
      </DocSection>

      <DocSection title="The 5 Fatalities">
        <div className="space-y-4 mt-4">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">1. Timing</h4>
            <p className="text-[14px] text-stone-600 mb-2">The prospect chooses to wait. "Let's revisit next quarter." "We're not ready yet."</p>
            <p className="text-[13px] text-stone-500"><strong>Root Cause:</strong> Failure to establish urgency in D1. The prospect doesn't feel the cost of inaction.</p>
            <p className="text-[13px] text-stone-500"><strong>Prevented By:</strong> Checkpoint 1 (Urgency Test)</p>
            <p className="text-[13px] text-[#FF2A7F] mt-2 italic"><strong>TT Example:</strong> "We'll look at this next quarter." → At $400/day per open role × 10 roles = $120K lost per quarter of delay. Quantify the cost of waiting — make inaction more expensive than action.</p>
          </div>

          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">2. Competition</h4>
            <p className="text-[14px] text-stone-600 mb-2">The prospect goes with another vendor, does it themselves, or stays with incumbent.</p>
            <p className="text-[13px] text-stone-500"><strong>Root Cause:</strong> Failure to expose the gap in their current resources during D2. They think they can fix it internally.</p>
            <p className="text-[13px] text-stone-500"><strong>Prevented By:</strong> Checkpoint 2 (Gap Test)</p>
            <p className="text-[13px] text-[#FF2A7F] mt-2 italic"><strong>TT Example:</strong> They choose Greenhouse over TT. Why? Usually because Greenhouse was already in their shortlist from a Google search. Prevention: Position TT FIRST as the category leader in career sites + employer brand. 6M+ applications processed, 16M+ AI-screened candidates, 5.4x hire rate.</p>
          </div>

          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">3. Price</h4>
            <p className="text-[14px] text-stone-600 mb-2">The prospect perceives the solution as too expensive. "We can't justify that spend."</p>
            <p className="text-[13px] text-stone-500"><strong>Root Cause:</strong> Missing ROI justification. The problem wasn't made big enough to warrant the investment.</p>
            <p className="text-[13px] text-stone-500"><strong>Prevented By:</strong> Checkpoints 1 & 2 (Problem size) + Checkpoint 3 (Solution fit)</p>
            <p className="text-[13px] text-[#FF2A7F] mt-2 italic"><strong>TT Example:</strong> $10K/yr for TT vs $45K/yr in agency fees. If you built the ROI anchor in D2, this never happens. The question isn't "can we afford TT?" — it's "can we afford NOT to have TT?"</p>
          </div>

          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">4. Trust / Champions</h4>
            <p className="text-[14px] text-stone-600 mb-2">The prospect lacks confidence in the rep or the company. "We want to think about it."</p>
            <p className="text-[13px] text-stone-500"><strong>Root Cause:</strong> Acting as a feature-vendor instead of a Trusted Advisor. The prospect doesn't believe you understand their problem.</p>
            <p className="text-[13px] text-stone-500"><strong>Prevented By:</strong> The entire 4D process (doctor's visit mindset)</p>
            <p className="text-[13px] text-[#FF2A7F] mt-2 italic"><strong>TT Example:</strong> HR Director loves TT but can't get CFO to engage → Build the Business Case Document. Give them the ammunition: ROI math, competitive comparison, implementation timeline, and customer references from Savills (15K employees) and L'Occitane (20 countries).</p>
          </div>

          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">5. Product Fit</h4>
            <p className="text-[14px] text-stone-600 mb-2">The prospect doesn't believe the solution meets their specific needs.</p>
            <p className="text-[13px] text-stone-500"><strong>Root Cause:</strong> Generic demo instead of a targeted pain-to-solution demonstration. The prospect saw features, not their solution.</p>
            <p className="text-[13px] text-stone-500"><strong>Prevented By:</strong> Checkpoint 3 (Solution Test) + Pain-to-Demo Matrix in D3</p>
            <p className="text-[13px] text-[#FF2A7F] mt-2 italic"><strong>TT Example:</strong> They need enterprise-grade → Reference Savills (15K FTE), L'Occitane (20 countries). They need simple → Reference Octavo Partnership (SMB, 100% adoption in 2 weeks). Always match the proof to the prospect's profile.</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Fatality Diagnosis Matrix">
        <Callout type="info" title="How to Use This">
          After every lost deal, identify which fatality killed it. Over time, patterns emerge — if you're losing 60% of deals to Timing, your D1 discovery needs work. If Competition is the killer, focus on D2 gap exposure.
        </Callout>
      </DocSection>

      <DocSection title="Fatality Prevention Checklist">
        <p>Use this checklist at each stage to proactively prevent fatalities before they strike:</p>
        <div className="space-y-3 mt-4">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">D1 — Discovery (Prevents: Timing)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1">
              <li>☐ Quantified cost of inaction ($400/day × open roles × days)</li>
              <li>☐ Identified CEO/exec pressure on hiring speed</li>
              <li>☐ Confirmed this is a NOW priority, not "next quarter"</li>
              <li>☐ Established consequences of NOT solving (lost candidates, revenue impact)</li>
            </ul>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">D2 — Diagnosis (Prevents: Competition + Price)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1">
              <li>☐ Exposed HRIS ATS limitations (built for payroll, not recruiting)</li>
              <li>☐ Built ROI anchor: TT cost vs agency spend vs cost-per-hire</li>
              <li>☐ Positioned TT as category leader before Greenhouse/Lever enter conversation</li>
              <li>☐ Confirmed they agree internal resources are insufficient</li>
            </ul>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">D3 — Demonstration (Prevents: Product Fit + Trust)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1">
              <li>☐ Demo mapped to their specific pains (not a feature tour)</li>
              <li>☐ Matched customer reference to their profile (size, industry, complexity)</li>
              <li>☐ Showed Motorpoint (58% TTH↓), Lotus (55→23 days), or Octavo (100% adoption)</li>
              <li>☐ Confirmed "this solves our problem" before moving to proposal</li>
            </ul>
          </div>
          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">D4 — Decision (Prevents: Champions)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1">
              <li>☐ Champion has Business Case Document with ROI math</li>
              <li>☐ All decision-makers identified and engaged (not just HR Director)</li>
              <li>☐ Competitive comparison prepared (TT vs Greenhouse/Lever/Ashby)</li>
              <li>☐ Implementation timeline shared to remove "complexity" objection</li>
            </ul>
          </div>
        </div>
      </DocSection>
    </div>
  );
}
