import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';

export default function DiscoverySheetPeopleOps() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="PERSONA INSIGHT"
        title="People Ops / HR Operations"
        subtitle="Mid-Market. Focuses on systems, data, onboarding, and compliance."
      />

      <DocSection title="Persona Context">
        <p>
          People Ops professionals are system architects. They care about integrations, data flow, 
          security, and the transition from "candidate" to "employee". They often evaluate the tech,
          even if the VP of HR makes the final decision.
        </p>
        <Callout type="info" title="The Play">
          Win them over with APIs, seamless HRIS integrations (like Workday, HiBob, BambooHR), 
          and compliance features (GDPR). If they feel Service Alignment will create manual work for them,
          they will block the deal.
        </Callout>
      </DocSection>

      <DocSection title="Mapping to the BAP Questions">
        <p className="mb-4">Here is exactly what you should expect to hear from People Ops when you run the Discovery Room BAP on a call:</p>
        
        <div className="space-y-4">
          <div className="border-l-4 border-sky-400 pl-4 py-3 bg-sky-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: What's the problem or goal?</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Manual data entry between Provider and HRIS</li>
              <li>Siloed systems causing compliance risks</li>
              <li>Poor reporting for the board/executive team</li>
              <li>Clunky onboarding process</li>
            </ul>
          </div>

          <div className="border-l-4 border-sky-400 pl-4 py-3 bg-sky-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: Who else cares about this? (Stakeholders)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>VP of HR (Budget)</li>
              <li>IT / Security (Compliance & SSO)</li>
              <li>Recruiting Team (End users)</li>
            </ul>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: What's the business impact? (Inaction Cost)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Compliance fines / GDPR risks</li>
              <li>Errors in payroll setup due to manual entry</li>
              <li>Low HR productivity</li>
            </ul>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: Why now? What's changed? (Urgency)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Just implemented a new HRIS and need an Provider that connects to it</li>
              <li>Failed an internal security audit</li>
              <li>Scaling too fast for spreadsheets</li>
            </ul>
          </div>
        </div>
      </DocSection>
    </div>
  );
}
