import { DocHeader, DocSection, Callout } from '../../components/process/DocComponents';

export default function D4Decision() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D4"
        title="Decision (Drive to Close)" 
        subtitle="The Confirmation Close: Verify alignment to secure a YES or a definitive NO." 
      />

      <DocSection title="Objective: The Confirmation Close">
        <p>
          By the time you reach D4, the selling is over. The Decision stage is purely about confirming alignment and navigating the administrative steps to a closed-won deal. 
        </p>
        <p>
          If you have to "hard sell" in D4, it means you missed a fatal flaw in D1, D2, or D3.
        </p>
      </DocSection>

      <DocSection title="Execution Workflow: The 5 Alignment Checks">
        <p>Before issuing a proposal or asking for signature, you must verify the following 5 checks with the buyer:</p>
        
        <div className="grid grid-cols-1 gap-3 mt-4 mb-8">
          <div className="flex items-center gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">1</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">Urgent Priority?</h4>
              <p className="text-[13px] text-stone-600">Is solving this problem still their top priority for this quarter?</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">2</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">Resources Insufficient?</h4>
              <p className="text-[13px] text-stone-600">Are they fully convinced they cannot solve this in-house?</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">3</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">Problems & Solutions Aligned?</h4>
              <p className="text-[13px] text-stone-600">Does your solution exactly match the gaps they outlined?</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">4</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">ROI Sufficient?</h4>
              <p className="text-[13px] text-stone-600">Does the business case justify the cost of the platform?</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">5</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">Ready to Move Forward?</h4>
              <p className="text-[13px] text-stone-600">Are all decision-makers aligned to sign?</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Proposal Rule">
        <Callout type="rule" title="No Proposals Without CP3">
          Proposals are strictly gated. If fit, ROI, and trust haven't been established via Checkpoint 3, the proposal does not go out. You must use the Buyer's Action Plan (BAP) to score readiness before advancing.
        </Callout>
      </DocSection>
    </div>
  );
}
