import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';

export default function DiscoverySheetSMB() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="PERSONA INSIGHT"
        title="SMB / Office Manager"
        subtitle="Small Business (Under 100 employees). Wears many hats, not a full-time recruiter."
      />

      <DocSection title="Persona Context">
        <p>
          The SMB buyer (often an Office Manager, Founders, or solo HR) is overwhelmed. They don't want 
          a complex system to manage; they want something that just works out of the box. They are 
          evaluating ease of use above all else.
        </p>
        <Callout type="info" title="The Play">
          Show them how Service Alignment can act as their "invisible recruiter". Focus on templates, 
          automated triggers, and the beautiful, ready-made career site.
        </Callout>
      </DocSection>

      <DocSection title="Mapping to the BAP Questions">
        <p className="mb-4">Here is exactly what you should expect to hear from an SMB buyer when you run the Discovery Room BAP on a call:</p>
        
        <div className="space-y-4">
          <div className="border-l-4 border-sky-400 pl-4 py-3 bg-sky-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: What's the problem or goal?</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Using an inbox full of emails and spreadsheets</li>
              <li>Forgetting to reply to candidates</li>
              <li>No career page, just a list on the website</li>
              <li>Don't have time to recruit properly</li>
            </ul>
          </div>

          <div className="border-l-4 border-sky-400 pl-4 py-3 bg-sky-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: Who else cares about this? (Stakeholders)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>CEO / Founder (Final approval)</li>
              <li>Hiring Managers (Will complain if it's hard to use)</li>
            </ul>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: What's the business impact? (Inaction Cost)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Losing good candidates because they replied too late</li>
              <li>Wasting 10+ hours a week on manual admin</li>
              <li>Looking unprofessional to top talent</li>
            </ul>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: Why now? What's changed? (Urgency)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Just got Series A funding and need to hire 20 people</li>
              <li>Founder told them to "fix recruiting"</li>
              <li>Things are falling through the cracks</li>
            </ul>
          </div>
        </div>
      </DocSection>
    </div>
  );
}
