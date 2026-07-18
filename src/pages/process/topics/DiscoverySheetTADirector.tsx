import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';

export default function DiscoverySheetTADirector() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="PERSONA INSIGHT"
        title="TA Director / Head of Recruiting"
        subtitle="Mid-Market/Enterprise. Owns the recruitment function, processes, and tools."
      />

      <DocSection title="Persona Context">
        <p>
          The TA Director is your primary champion. They are feeling the daily pain of an inefficient Provider
          more than anyone else. They are evaluated on metrics like Time to Hire, Cost per Hire, and 
          Quality of Hire. They want an Provider that makes their recruiters faster and makes the company
          look attractive to candidates.
        </p>
        <Callout type="info" title="The Play">
          TA Directors care deeply about automation, career sites, and reporting. Position Service Alignment as
          the tool that will turn their recruitment department into a modern, data-driven machine.
        </Callout>
      </DocSection>

      <DocSection title="Mapping to the BAP Questions">
        <p className="mb-4">Here is exactly what you should expect to hear from a TA Director when you run the Discovery Room BAP on a call:</p>
        
        <div className="space-y-4">
          <div className="border-l-4 border-sky-400 pl-4 py-3 bg-sky-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: What's the problem or goal?</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Current Provider is clunky and slow</li>
              <li>Candidates are dropping off due to long applications</li>
              <li>No visibility into metrics or bottlenecks</li>
              <li>Career page looks outdated</li>
            </ul>
          </div>

          <div className="border-l-4 border-sky-400 pl-4 py-3 bg-sky-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: Who else cares about this? (Stakeholders)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>VP of HR (Needs to sign off)</li>
              <li>Recruiters (End users, need buy-in)</li>
              <li>Hiring Managers (Need an easy interface)</li>
              <li>Marketing (Brand alignment)</li>
            </ul>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: What's the business impact? (Inaction Cost)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>High time-to-hire (vacant seats costing money)</li>
              <li>Recruiter burnout (manual data entry)</li>
              <li>Bad candidate experience hurting Glassdoor reviews</li>
              <li>Paying multiple point-solutions instead of an all-in-one</li>
            </ul>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Q: Why now? What's changed? (Urgency)</h4>
            <ul className="text-[13px] text-stone-600 space-y-1 list-disc list-inside ml-2">
              <li>Mandate to double headcount this year</li>
              <li>Current Provider contract expiring in 90 days</li>
              <li>Just got budget approved for recruitment marketing</li>
            </ul>
          </div>
        </div>
      </DocSection>
    </div>
  );
}
