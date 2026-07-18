import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';

export default function SalesStages() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="Sales Stages & Exit Criteria (2026)" 
        subtitle="Clear milestones mapping our 4D Process, MEDDPICC intel, and Salesforce Pipeline Stages." 
      />

      <DocSection title="Overview">
        <p>
          To maintain an accurate pipeline and forecast, every deal must meet specific exit criteria before moving to the next stage. This directly aligns with our 4D sales process and ensures we capture the right MEDDPICC intelligence at the right time.
        </p>
      </DocSection>

      <DocSection title="0. Qualifying (D1: Discovery)">
        <Callout type="info" title="Key Question: Is there a pain we can solve with a motivated buyer?">
          <strong>Exit Criteria:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Initial Meeting (Disco / Demo) completed</li>
            <li>Next step set within 60 days</li>
            <li>Calendar invite accepted</li>
            <li>Partner engaged (where relevant)</li>
          </ul>
          
          <div className="mt-4 pt-4 border-t border-blue-200/50">
            <strong>MEDDPICC Intel Required:</strong>
            <ul className="list-none mt-2 flex flex-wrap gap-2">
              <li className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Metrics</li>
              <li className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Identify Pain</li>
              <li className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Champion</li>
            </ul>
          </div>
        </Callout>
      </DocSection>

      <DocSection title="1. Investigating (D2: Diagnosis)">
        <Callout type="info" title="Key Question: Is this a meaningful problem for the business?">
          <strong>Exit Criteria:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Tailored demo completed</li>
            <li>Technical validation completed</li>
            <li>Key stakeholders identified & engaged</li>
          </ul>
          
          <div className="mt-4 pt-4 border-t border-blue-200/50">
            <strong>MEDDPICC Intel Required:</strong>
            <ul className="list-none mt-2 flex flex-wrap gap-2">
              <li className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Economic Buyer</li>
              <li className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Decision Criteria</li>
              <li className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Competition</li>
              <li className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Compelling Event</li>
            </ul>
          </div>
        </Callout>
      </DocSection>

      <DocSection title="2. Evaluating (D3: Demo)">
        <Callout type="info" title="Key Question: Are we the best partner to solve this problem?">
          <strong>Exit Criteria:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Commercial proposal presented & validated</li>
            <li>Clear understanding of paper process</li>
            <li>Custom implementation call completed (if required)</li>
          </ul>
          
          <div className="mt-4 pt-4 border-t border-blue-200/50">
            <strong>MEDDPICC Intel Required:</strong>
            <ul className="list-none mt-2 flex flex-wrap gap-2">
              <li className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Decision Process</li>
              <li className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Paper Process</li>
            </ul>
          </div>
        </Callout>
      </DocSection>

      <DocSection title="3. Negotiating (D4: Decision)">
        <Callout type="info" title="Key Question: Can we agree to commercial terms?">
          <strong>Exit Criteria:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Commercial terms agreed</li>
            <li>Verbal on vendor of choice</li>
            <li>CSM requested on #lookingforsuccess</li>
          </ul>
          
          <div className="mt-4 pt-4 border-t border-blue-200/50">
            <strong>MEDDPICC Intel Required:</strong>
            <ul className="list-none mt-2 flex flex-wrap gap-2">
              <li className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold">MEDDPICC Fully Qualified</li>
            </ul>
          </div>
        </Callout>
      </DocSection>

      <DocSection title="4. Contracting (D4: Decision)">
        <Callout type="info" title="Key Question: Can we agree to legal terms and pass security evaluations?">
          <strong>Exit Criteria:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Written confirmation on vendor of choice</li>
            <li>Legal alignment</li>
            <li>Infosec approval</li>
            <li>Signatory known & engaged</li>
          </ul>
          
          <div className="mt-4 pt-4 border-t border-blue-200/50">
            <strong>MEDDPICC Intel Required:</strong>
            <ul className="list-none mt-2 flex flex-wrap gap-2">
              <li className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold">MEDDPICC Fully Qualified</li>
            </ul>
          </div>
        </Callout>
      </DocSection>

      <DocSection title="5. Signing (D4: Decision)">
        <Callout type="info" title="Key Question: Will they become a customer?">
          <strong>Exit Criteria:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Contract signature</li>
            <li>Confirmed go-live date</li>
          </ul>
          
          <div className="mt-4 pt-4 border-t border-blue-200/50">
            <strong>MEDDPICC Intel Required:</strong>
            <ul className="list-none mt-2 flex flex-wrap gap-2">
              <li className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold">MEDDPICC Fully Qualified</li>
            </ul>
          </div>
        </Callout>
      </DocSection>

    </div>
  );
}
