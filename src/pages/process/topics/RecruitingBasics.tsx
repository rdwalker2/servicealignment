import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';
import { Users, Filter, BarChart, Briefcase } from 'lucide-react';

export default function RecruitingBasics() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32 space-y-12">
      <DocHeader 
        title="Recruiting Basics" 
        subtitle="The terminology, metrics, and workflows you need to speak the language of TA." 
      />

      <DocSection title="The Language of Talent Acquisition">
        <p className="text-lg text-stone-700 leading-relaxed mb-4">
          To sell to Talent Acquisition (TA) leaders, you must sound like you belong in their world. If you refer to "candidates" as "leads" or "offers" as "closed won," you will immediately lose credibility.
        </p>
      </DocSection>

      <DocSection title="The Players (Who's Who)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-sky-700 flex items-center gap-2 mb-2"><Briefcase size={16}/> Hiring Manager (HM)</h4>
            <p className="text-sm text-stone-600">The person who actually needs the employee (e.g., the VP of Engineering). They are the ultimate decision-maker on the hire, but they are often terrible at recruiting. They want speed and quality.</p>
          </div>
          <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-indigo-700 flex items-center gap-2 mb-2"><Users size={16}/> Recruiter (TA Partner)</h4>
            <p className="text-sm text-stone-600">The project manager of the hire. They manage the HM's expectations, screen candidates, coordinate interviews, and negotiate the offer. They want efficiency and automation.</p>
          </div>
          <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-violet-700 flex items-center gap-2 mb-2"><Filter size={16}/> Sourcer</h4>
            <p className="text-sm text-stone-600">Common in larger companies. They focus exclusively on finding and engaging passive talent (the top of the funnel). They hand off interested candidates to the Recruiter.</p>
          </div>
          <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-rose-700 flex items-center gap-2 mb-2"><BarChart size={16}/> TA Leader / VP of TA</h4>
            <p className="text-sm text-stone-600">The strategic leader. They care about employer branding, reducing agency spend, improving Time-to-Fill, and aligning hiring with company revenue goals. Your primary buyer.</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Recruiting Funnel">
        <p className="mb-6 text-stone-600">Just like sales, recruiting is a funnel. You need to understand where a prospect's bottleneck is.</p>
        
        <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200 relative overflow-hidden">
          <div className="absolute left-12 top-0 bottom-0 w-1 bg-stone-200"></div>
          
          <div className="relative pl-12 space-y-8">
            <div>
              <div className="absolute left-10 w-5 h-5 rounded-full bg-sky-500 border-4 border-stone-50 -ml-2.5 mt-1"></div>
              <h5 className="font-bold text-stone-900 text-lg">1. Sourcing / Attraction</h5>
              <p className="text-sm text-stone-600 mt-1">Building the talent pool. Pain points here: low career site conversion, high agency reliance, weak employer brand.</p>
            </div>
            <div>
              <div className="absolute left-10 w-5 h-5 rounded-full bg-indigo-500 border-4 border-stone-50 -ml-2.5 mt-1"></div>
              <h5 className="font-bold text-stone-900 text-lg">2. Screening & Review</h5>
              <p className="text-sm text-stone-600 mt-1">Filtering the noise. Pain points here: manual resume parsing, unqualified applicants, recruiter burnout.</p>
            </div>
            <div>
              <div className="absolute left-10 w-5 h-5 rounded-full bg-violet-500 border-4 border-stone-50 -ml-2.5 mt-1"></div>
              <h5 className="font-bold text-stone-900 text-lg">3. Interviewing</h5>
              <p className="text-sm text-stone-600 mt-1">Evaluating the talent. Pain points here: scheduling nightmare, hiring managers not submitting feedback on time.</p>
            </div>
            <div>
              <div className="absolute left-10 w-5 h-5 rounded-full bg-emerald-500 border-4 border-stone-50 -ml-2.5 mt-1"></div>
              <h5 className="font-bold text-stone-900 text-lg">4. Offer & Onboarding</h5>
              <p className="text-sm text-stone-600 mt-1">Closing the deal. Pain points here: slow approval chains, clunky e-signature, disjointed IT handover.</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Holy Trinity of TA Metrics">
        <div className="space-y-6 mt-4">
          
          <div className="border border-sky-200 p-6 rounded-xl bg-gradient-to-r from-sky-50 to-white shadow-sm">
            <h4 className="font-bold text-sky-900 mb-1 text-lg">1. Time to Fill (Velocity)</h4>
            <p className="text-[14px] text-stone-700 mb-3">
              The number of days it takes from the requisition approval to the offer acceptance. This is the ultimate metric for TA speed.
            </p>
            <div className="bg-white p-3 rounded text-sm text-sky-900 italic border border-sky-100">
              <strong>How to use it:</strong> "If it takes you 45 days to fill a sales role, and their quota is $50k/month, every day a seat is empty costs the company $1,666."
            </div>
          </div>

          <div className="border border-emerald-200 p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-white shadow-sm">
            <h4 className="font-bold text-emerald-900 mb-1 text-lg">2. Cost Per Hire (Efficiency)</h4>
            <p className="text-[14px] text-stone-700 mb-3">
              Total recruiting costs divided by total hires. Heavily impacted by external agency fees (headhunters charge 15-25% of first-year salary).
            </p>
            <div className="bg-white p-3 rounded text-sm text-emerald-900 italic border border-emerald-100">
              <strong>How to use it:</strong> "You mentioned you hired 10 engineers through agencies last year. Assuming a $100k salary and 20% fee, you spent $200k on fees alone. Service Alignment's proactive sourcing cuts that in half."
            </div>
          </div>

          <div className="border border-violet-200 p-6 rounded-xl bg-gradient-to-r from-violet-50 to-white shadow-sm">
            <h4 className="font-bold text-violet-900 mb-1 text-lg">3. Quality of Hire (Impact)</h4>
            <p className="text-[14px] text-stone-700 mb-3">
              The hardest to measure. Usually evaluated by 90-day retention and first-year performance reviews.
            </p>
            <div className="bg-white p-3 rounded text-sm text-violet-900 italic border border-violet-100">
              <strong>How to use it:</strong> "When hiring managers rush the interview process because of scheduling chaos, they make bad hires. Our automated scheduling ensures a thorough, structured evaluation."
            </div>
          </div>

        </div>
      </DocSection>
    </div>
  );
}
