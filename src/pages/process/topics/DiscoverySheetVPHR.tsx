import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';

export default function DiscoverySheetVPHR() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="PERSONA INSIGHT"
        title="VP of HR / CHRO"
        subtitle="Enterprise 500+ employees. Owns HR strategy, budget authority, and executive alignment."
      />

      <DocSection title="Persona Context">
        <p>
          The VP of HR or CHRO is a strategic buyer. They think in terms of programs, not features.
          Their priorities are employer brand, retention, workforce planning, and CEO alignment.
          They rarely evaluate tools themselves — they delegate to TA Directors or People Ops — but they
          hold the budget and final sign-off.
        </p>
        <Callout type="info" title="The Play">
          VPs of HR don't buy software. They fund strategic initiatives. Position Service Alignment as the
          infrastructure that makes their initiative possible — not as a product demo.
        </Callout>
      </DocSection>

      <DocSection title="Mapping to the BAP Questions">
        <p className="mb-4">Here is exactly what you should expect to hear from a VP of HR when you run the Discovery Room BAP on a call:</p>
        
        <div className="space-y-4">
          <div className="border-l-4 border-sky-400 pl-4 py-3 bg-sky-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: What's the problem or goal?</h4>
            <p className="text-[13px] text-stone-600 mb-2">They will typically answer with high-level strategic mandates:</p>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Scaling headcount fast</li>
              <li>CEO mandate to improve employer brand</li>
              <li>Consolidating tech stack post-merger</li>
              <li>Replacing an underperforming Provider</li>
            </ul>
          </div>

          <div className="border-l-4 border-sky-400 pl-4 py-3 bg-sky-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: Who else cares about this? (Stakeholders)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>CEO / COO (Strategic alignment)</li>
              <li>CFO (Budget approval)</li>
              <li>TA Director (Operational owner)</li>
              <li>Procurement & IT (Risk/Compliance)</li>
            </ul>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: What's the business impact? (Inaction Cost)</h4>
            <p className="text-[13px] text-stone-600 mb-2">VPs respond to board-level metrics. Frame the pain in these terms:</p>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Productivity loss on open roles</li>
              <li>Losing top candidates to competitors</li>
              <li>Managers escalating complaints to the CEO</li>
              <li>Massive agency fees eating budget</li>
            </ul>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: Why now? What's changed? (Urgency)</h4>
            <p className="text-[13px] text-stone-600 mb-2">Look for these triggering events to establish your timeline:</p>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>New CEO or leadership change</li>
              <li>Contract renewal coming up on current Provider</li>
              <li>Recent high-profile bad hire</li>
              <li>New funding round (need to scale)</li>
            </ul>
          </div>

          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: What other solutions are you considering?</h4>
            <p className="text-[13px] text-stone-600 mb-2">Enterprise buyers almost always have a shortlist:</p>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Greenhouse / Lever (Direct competitors)</li>
              <li>HRIS recruiting module (Workday, Dayforce)</li>
            </ul>
          </div>

          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: Is there budget allocated for this?</h4>
            <p className="text-[13px] text-stone-600 mb-2">They own the budget, but you still need to know its status:</p>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Yes, line item exists</li>
              <li>Yes, but earmarked elsewhere (need to reallocate)</li>
              <li>No, need to build business case for CFO</li>
              <li>"We'll find the money if it's right" (Warning: Weak commitment)</li>
            </ul>
          </div>
        </div>
      </DocSection>
    </div>
  );
}
