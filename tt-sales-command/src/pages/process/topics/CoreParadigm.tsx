import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';

export default function CoreParadigm() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="Methodology Architecture" 
        subtitle="The blueprint for shifting from a generic feature-vendor to a Trusted Advisor." 
      />

      <DocSection title="The Core Paradigm">
        <p>
          The Teamtailor 4D framework is designed to re-align the seller with the buyer's intent. The fundamental flaw in most sales processes is the "1.5D Trap"—doing a superficial discovery call and immediately jumping into a generic feature demo, resulting in ghosting and "crickets".
        </p>
        <p>
          Instead of pushing features, our goal is to <strong>diagnose business problems</strong>. Your willingness to disqualify a deal is your ultimate source of authority.
        </p>
      </DocSection>

      <DocSection title="The 4D Framework">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="border border-sky-200 p-4 rounded-lg bg-sky-50/30">
            <h4 className="font-bold text-sky-900 mb-1">D1 — Discovery</h4>
            <p className="text-[13px] text-sky-800">Find the Pain. Be the detective—qualify the problem, not the prospect. Uncover the trigger, blast radius, and cost of inaction.</p>
          </div>
          <div className="border border-violet-200 p-4 rounded-lg bg-violet-50/30">
            <h4 className="font-bold text-violet-900 mb-1">D2 — Diagnosis</h4>
            <p className="text-[13px] text-violet-800">Be the Doctor. Reframe the problem, expose the gap in their current approach, and build the case for external help.</p>
          </div>
          <div className="border border-amber-200 p-4 rounded-lg bg-amber-50/30">
            <h4 className="font-bold text-amber-900 mb-1">D3 — Demonstrate</h4>
            <p className="text-[13px] text-amber-800">Show YOUR Solution. Not a feature tour—a pain-to-solution mapping using the Rule of 3: Why → How → When.</p>
          </div>
          <div className="border border-emerald-200 p-4 rounded-lg bg-emerald-50/30">
            <h4 className="font-bold text-emerald-900 mb-1">D4 — Decision</h4>
            <p className="text-[13px] text-emerald-800">Drive to Close. The Confirmation Close—get explicit YES or NO. No proposals without CP3 clearance.</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The 1.5D Trap">
        <Callout type="warning" title="What Most Reps Do">
          Most sales processes collapse into 1.5 dimensions: a surface-level discovery call (half of D1) followed by a generic feature demo (half of D3). This skips D2 entirely and produces "zombie deals" that ghost after the demo.
        </Callout>
        <p>
          The 4D framework ensures you spend adequate time in each phase. The checkpoints prevent premature advancement. If you find yourself scheduling a demo after one discovery call, you are in the 1.5D trap.
        </p>
      </DocSection>

      <DocSection title="Progression Pathways">
        <Callout type="rule" title="No Proposals Without CP3">
          Proposals are strictly gated. If fit, ROI, and trust haven't been established via Checkpoint 3, the proposal does not go out. You must use the Buyer's Action Plan (BAP) to score readiness before advancing.
        </Callout>
      </DocSection>
    </div>
  );
}
