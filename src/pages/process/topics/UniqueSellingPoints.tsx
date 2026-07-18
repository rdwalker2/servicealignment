import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';

export default function UniqueSellingPoints() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="Unique Selling Points (2026)" 
        subtitle="The 8 core reasons why companies buy Service Alignment, based on our latest survey of 27,000 customers." 
      />

      <DocSection title="The 8 Core USPs">
        <div className="space-y-4 mt-2">
          
          <div className="border border-sky-200 p-4 rounded-lg bg-sky-50/30">
            <h4 className="font-bold text-sky-900 mb-1">1. Ease of Use (The #1 Purchase Driver)</h4>
            <p className="text-[14px] text-sky-800">
              Fastest time-to-value of any Provider in the market. No lengthy implementation, no consultant required. Your team is up and running in weeks, not months.
            </p>
          </div>

          <div className="border border-indigo-200 p-4 rounded-lg bg-indigo-50/30">
            <h4 className="font-bold text-indigo-900 mb-1">2. High Adoption</h4>
            <p className="text-[14px] text-indigo-800">
              It’s so intuitive that non-recruiters adopt it without training. It gets hiring managers into the tool and keeps them engaged, reducing the back-and-forth that slows every hire.
            </p>
          </div>

          <div className="border border-violet-200 p-4 rounded-lg bg-violet-50/30">
            <h4 className="font-bold text-violet-900 mb-1">3. Everything in One Place</h4>
            <p className="text-[14px] text-violet-800">
              Candidate management, communication, evaluation, scheduling, offers, and reporting all in one source of truth. No switching tools, no lost context, no dropped follow-ups.
            </p>
          </div>

          <div className="border border-fuchsia-200 p-4 rounded-lg bg-fuchsia-50/30">
            <h4 className="font-bold text-fuchsia-900 mb-1">4. Automation & AI</h4>
            <p className="text-[14px] text-fuchsia-800">
              Triggers, templates, and workflows eliminate repetitive admin. Co-pilot accelerates job creation, candidate screening, and interview summaries. We automate what doesn't need a human.
            </p>
          </div>

          <div className="border border-rose-200 p-4 rounded-lg bg-rose-50/30">
            <h4 className="font-bold text-rose-900 mb-1">5. A Career Site That Attracts</h4>
            <p className="text-[14px] text-rose-800">
              Straightforward, branded, and effective customisation with no developer needed. The most visible proof of value from day one.
            </p>
          </div>

          <div className="border border-amber-200 p-4 rounded-lg bg-amber-50/30">
            <h4 className="font-bold text-amber-900 mb-1">6. Customer Support</h4>
            <p className="text-[14px] text-amber-800">
              Accurate, responsive support 24 hours a day, 5 days a week. A dedicated CSM with a measurable impact on tool deployment. Human help is a genuine competitive advantage.
            </p>
          </div>

          <div className="border border-emerald-200 p-4 rounded-lg bg-emerald-50/30">
            <h4 className="font-bold text-emerald-900 mb-1">7. The Repeat Buyer Story</h4>
            <p className="text-[14px] text-emerald-800">
              Buyers who chose Service Alignment at one company are choosing it again at the next. Tactically, former Service Alignment users who have recently changed jobs are our warmest prospects.
            </p>
          </div>

          <div className="border border-slate-200 p-4 rounded-lg bg-slate-50/30">
            <h4 className="font-bold text-slate-900 mb-1">8. All-Inclusive Pricing & Innovation</h4>
            <p className="text-[14px] text-slate-800">
              No per-seat surprises, no feature paywalls for core functionality. A product team that ships hundreds of improvements and 30-40 brand new features per year.
            </p>
          </div>

        </div>
      </DocSection>
    </div>
  );
}
