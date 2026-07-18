import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';

export default function Meddpicc() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="MEDDPICC" 
        subtitle="The fundamental framework for qualifying and managing deals in the pipeline." 
      />

      <DocSection title="What is MEDDPICC?">
        <p>
          MEDDPICC is a B2B enterprise sales qualification framework used to identify the health of an opportunity. It is deeply integrated into our 4D sales process. A deal cannot progress through the pipeline safely without gathering this critical information.
        </p>
      </DocSection>

      <DocSection title="The MEDDPICC Elements">
        <div className="space-y-4 mt-2">
          
          <div className="border border-sky-200 p-4 rounded-lg bg-sky-50/30">
            <h4 className="font-bold text-sky-900 mb-1">M - Metrics</h4>
            <p className="text-[14px] text-sky-800">
              The quantifiable economic impact of the solution. How will we measure success? (e.g., reduce time-to-fill by 20%, save $50k in agency fees).
            </p>
          </div>

          <div className="border border-indigo-200 p-4 rounded-lg bg-indigo-50/30">
            <h4 className="font-bold text-indigo-900 mb-1">E - Economic Buyer</h4>
            <p className="text-[14px] text-indigo-800">
              The person with the overall authority to release funds and approve the purchase. Have we met them? Do they agree with the Metrics and Pain?
            </p>
          </div>

          <div className="border border-violet-200 p-4 rounded-lg bg-violet-50/30">
            <h4 className="font-bold text-violet-900 mb-1">D - Decision Criteria</h4>
            <p className="text-[14px] text-violet-800">
              The formal and informal criteria the buyer uses to evaluate different solutions (e.g., ease of use, integrations, security compliance). We must map our D3 (Demonstrate) to these criteria.
            </p>
          </div>

          <div className="border border-fuchsia-200 p-4 rounded-lg bg-fuchsia-50/30">
            <h4 className="font-bold text-fuchsia-900 mb-1">D - Decision Process</h4>
            <p className="text-[14px] text-fuchsia-800">
              The sequence of steps the buyer takes to arrive at a decision. Who needs to see the demo? When is the board meeting? What happens next?
            </p>
          </div>

          <div className="border border-rose-200 p-4 rounded-lg bg-rose-50/30">
            <h4 className="font-bold text-rose-900 mb-1">P - Paper Process</h4>
            <p className="text-[14px] text-rose-800">
              The legal, security, and procurement steps required to get the contract signed once the decision is made. Don't let this be a surprise in D4!
            </p>
          </div>

          <div className="border border-amber-200 p-4 rounded-lg bg-amber-50/30">
            <h4 className="font-bold text-amber-900 mb-1">I - Identify Pain</h4>
            <p className="text-[14px] text-amber-800">
              The actual business problems driving the need for a solution. Explored deeply during D1 (Discovery) and D2 (Diagnosis). No pain, no change.
            </p>
          </div>

          <div className="border border-emerald-200 p-4 rounded-lg bg-emerald-50/30">
            <h4 className="font-bold text-emerald-900 mb-1">C - Champion</h4>
            <p className="text-[14px] text-emerald-800">
              An internal stakeholder with power and influence who actively sells on our behalf when we are not in the room. They must have a personal win tied to our success.
            </p>
          </div>

          <div className="border border-slate-200 p-4 rounded-lg bg-slate-50/30">
            <h4 className="font-bold text-slate-900 mb-1">C - Competition</h4>
            <p className="text-[14px] text-slate-800">
              Any alternative solution the buyer is considering, including the status quo (doing nothing) or building internally. Know who you are up against.
            </p>
          </div>

        </div>
      </DocSection>

      <DocSection title="Alignment with 4D">
        <Callout type="rule" title="Pristine Integration">
          MEDDPICC does not replace the 4D process (Discovery, Diagnosis, Demonstrate, Decision). Rather, MEDDPICC is the checklist of information you extract while executing the 4D stages.
        </Callout>
      </DocSection>
    </div>
  );
}
