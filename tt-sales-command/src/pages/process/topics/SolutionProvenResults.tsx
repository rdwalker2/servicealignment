import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function SolutionProvenResults() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="D3"
        title="Proven Results — Establish Credentials"
        subtitle="Before prospects care about your solution, they need to believe you can deliver results."
      />

      <DocSection title="Why Proven Results Come First">
        <p>
          The first step in any solution presentation is establishing <strong>WHY they should be listening to you</strong>. Just like a doctor — would you care if they have a history and track record of solving the problems making you sick? Your prospect's business is sick. This is no different.
        </p>
        <p className="mt-2">
          If they believe you have the credentials, then they will be able to <strong>pay more attention</strong> to your treatment plan (your solution). Without trust, even the best demo falls flat.
        </p>
        <Callout type="info" title="The Best Predictor of the Future Is the Past">
          By quantifying your past successes, you create confidence that you will be able to do it for this prospect in the future. This is the foundation of Checkpoint 3.
        </Callout>
      </DocSection>

      <DocSection title="The Three Elements — Teamtailor Specific">
        <p>Your credentials section should include these three components:</p>
        <div className="grid grid-cols-1 gap-4 mt-4 mb-4">

          {/* Element 1: Why Your Company Exists */}
          <div className="bg-white p-5 border border-stone-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">1</div>
              <h4 className="font-bold text-stone-900 text-[14px]">Why Teamtailor Exists</h4>
            </div>
            <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
              <p className="text-[13px] text-stone-700 leading-relaxed">
                Most ATS platforms were built for <strong>operations teams</strong> — tracking compliance, managing workflows, checking boxes. Teamtailor was built because recruiting is a <strong>candidate-facing function</strong>. Your career page, your employer brand, your candidate experience — that's what determines whether top talent applies or bounces. Every other ATS treats the candidate experience as an afterthought. We built the entire platform around it.
              </p>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">The Market Gap</p>
              <p className="text-[12px] text-stone-600">
                40% of our deals involve replacing an HRIS vendor's ATS module (ADP, Paycom, Workday, UKG) — systems where recruiting was literally an afterthought bolted onto payroll. The other 40%+ are teams drowning in manual processes with no real system at all.
              </p>
            </div>
          </div>

          {/* Element 2: What Success Looks Like */}
          <div className="bg-white p-5 border border-stone-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">2</div>
              <h4 className="font-bold text-stone-900 text-[14px]">What Success Looks Like for Most Clients</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-emerald-600 font-bold text-[14px] mt-0.5">↓</span>
                <div>
                  <p className="text-[13px] font-bold text-stone-800">Time-to-hire drops dramatically</p>
                  <p className="text-[12px] text-stone-500">Lotus: 55 → 23 days. Motorpoint: 58% reduction. AI screening means recruiters spend time talking to qualified people, not reading resumes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-emerald-600 font-bold text-[14px] mt-0.5">↑</span>
                <div>
                  <p className="text-[13px] font-bold text-stone-800">Recruiter capacity multiplies</p>
                  <p className="text-[12px] text-stone-500">3x capacity increase for recruiters using AI Copilot. Manual screening, scheduling, and communication become automated — recruiters recruit instead of doing admin.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-emerald-600 font-bold text-[14px] mt-0.5">↑</span>
                <div>
                  <p className="text-[13px] font-bold text-stone-800">Hiring manager adoption actually happens</p>
                  <p className="text-[12px] text-stone-500">Octavo: 100% hiring manager adoption. The system is intuitive enough that managers actually use it — no more chasing them for feedback via email.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-emerald-600 font-bold text-[14px] mt-0.5">↓</span>
                <div>
                  <p className="text-[13px] font-bold text-stone-800">Agency/headhunter spend drops or disappears</p>
                  <p className="text-[12px] text-stone-500">Teams that build their own talent pools through Connect see 17%+ of hires come from their CRM (Foot Asylum: 17.1%). Direct sourcing replaces agency fees.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Element 3: Battle-Tested Results */}
          <div className="bg-white p-5 border border-stone-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">3</div>
              <h4 className="font-bold text-stone-900 text-[14px]">Battle-Tested Improvement Results</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-stone-900 rounded-lg text-white">
                <p className="text-[22px] font-black">6M+</p>
                <p className="text-[11px] text-stone-400">Applications analyzed</p>
              </div>
              <div className="text-center p-3 bg-stone-900 rounded-lg text-white">
                <p className="text-[22px] font-black">16M+</p>
                <p className="text-[11px] text-stone-400">Candidates screened by AI</p>
              </div>
              <div className="text-center p-3 bg-stone-900 rounded-lg text-white">
                <p className="text-[22px] font-black">5.4×</p>
                <p className="text-[11px] text-stone-400">More likely to hire AI-screened candidates</p>
              </div>
              <div className="text-center p-3 bg-stone-900 rounded-lg text-white">
                <p className="text-[22px] font-black">0.03%</p>
                <p className="text-[11px] text-stone-400">AI screening criteria change rate (accuracy)</p>
              </div>
              <div className="text-center p-3 bg-stone-900 rounded-lg text-white">
                <p className="text-[22px] font-black">3×</p>
                <p className="text-[11px] text-stone-400">Recruiter capacity increase with AI</p>
              </div>
              <div className="text-center p-3 bg-stone-900 rounded-lg text-white">
                <p className="text-[22px] font-black">0.74%</p>
                <p className="text-[11px] text-stone-400">Average application-to-hire rate</p>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 italic mt-3 text-center">Source: Teamtailor platform data — Ed Kennaway's customer data deck</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Named Customer References — By Use Case">
        <p className="text-[13px] text-stone-500 mb-3">Match the reference to the prospect's situation. Don't just name-drop — connect the reference to their specific pain.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b-2 border-stone-200">
                <th className="text-left py-2 px-3 text-stone-500 font-bold">Customer</th>
                <th className="text-left py-2 px-3 text-stone-500 font-bold">Metric</th>
                <th className="text-left py-2 px-3 text-stone-500 font-bold">Use When</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 font-semibold text-stone-800">Motorpoint</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">58% TTH reduction</td>
                <td className="py-2 px-3 text-stone-600">Prospect complains about slow hiring or open roles sitting too long</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 font-semibold text-stone-800">Lotus</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">55 → 23 day TTH</td>
                <td className="py-2 px-3 text-stone-600">Prospect has specific time-to-hire targets or wants concrete numbers</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 font-semibold text-stone-800">Octavo</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">100% HM adoption</td>
                <td className="py-2 px-3 text-stone-600">Prospect's hiring managers won't use their current ATS</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 font-semibold text-stone-800">Foot Asylum</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">17.1% CRM hires</td>
                <td className="py-2 px-3 text-stone-600">Prospect paying agency/headhunter fees — show direct sourcing ROI</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 font-semibold text-stone-800">Savills</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">15K employees, global</td>
                <td className="py-2 px-3 text-stone-600">Enterprise prospect worried about scale — proves TT handles large orgs</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 font-semibold text-stone-800">L'Occitane</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">20 countries, bi-weekly QBRs</td>
                <td className="py-2 px-3 text-stone-600">Multi-location or international prospect — proves global support</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-stone-800">Hôtel de Vin / Malmaison</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">ePloy → TT migration</td>
                <td className="py-2 px-3 text-stone-600">Prospect on ePloy or legacy ATS — direct migration reference</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout type="info" title="The Ed Kennaway Technique">
          Ed doesn't just name-drop references — he <strong>matches the reference to the prospect's exact pain</strong>. If they're worried about hiring manager adoption, he says "Octavo achieved 100% adoption." If they're bleeding agency fees, he says "Foot Asylum now gets 17% of hires from their own talent pool." The reference IS the proof that this specific problem gets solved.
        </Callout>
      </DocSection>

      <DocSection title="Use Aggregate Social Proof — Not Single Case Studies">
        <Callout type="rule" title="Critical Rule: Lead with Aggregate, Then Name-Drop">
          Don't start with "Let me tell you about one customer." Start with aggregate data that shows a <strong>pattern of success</strong>, THEN drop 1-2 named references that match their situation. Aggregate builds credibility. The named reference makes it personal.
        </Callout>
        <p className="mt-3">
          Think about your own purchasing behavior:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>When you buy on Amazon, what do you check first? <strong>Reviews & ratings</strong> — highest reviews, best stars</li>
          <li>When you buy a car, what do you look at? <strong>Dependability, safety ratings, customer feedback</strong></li>
        </ul>
        <p className="mt-3">
          People need to see proof that <em>many others</em> have succeeded before they make a buying decision. One testimonial isn't enough — it needs to feel like a pattern.
        </p>
      </DocSection>

      <DocSection title="The Cost of Inaction Data">
        <p className="text-[13px] text-stone-500 mb-3">Use these stats to quantify what doing nothing costs them — Ed Kennaway's most effective technique:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
            <p className="text-[22px] font-black text-rose-700">£408/day</p>
            <p className="text-[12px] text-stone-600 mt-1">Cost per unfilled vacancy (Ed's go-to stat). <em>"Every day that seat is empty costs you £408. That's £12,000 a month."</em></p>
          </div>
          <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
            <p className="text-[22px] font-black text-rose-700">80%</p>
            <p className="text-[12px] text-stone-600 mt-1">Of candidates withdraw due to communication delays. <em>"If you're not responding within 48 hours, 8 out of 10 candidates have already moved on."</em></p>
          </div>
          <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
            <p className="text-[22px] font-black text-rose-700">0.74%</p>
            <p className="text-[12px] text-stone-600 mt-1">Average application-to-hire rate. <em>"For every 100 people who apply, less than 1 gets hired. The question is — are you screening 99 people manually?"</em></p>
          </div>
          <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
            <p className="text-[22px] font-black text-rose-700">3×</p>
            <p className="text-[12px] text-stone-600 mt-1">Asking "What happens if you do nothing?" yields a 3× higher win rate. <em>"What happens to your team if these roles stay open another 90 days?"</em></p>
          </div>
        </div>
      </DocSection>

      <DocSection title="How to Present Proven Results — Teamtailor Talk Track">
        <ScriptBlock label="Proven Results Talk Track">
          {`"Before I walk you through how we'd solve this, I want to
make sure you understand why we're in a position to help.

Teamtailor was built because most ATS platforms were designed
for operations — tracking compliance, managing workflows. But
recruiting is a candidate-facing function. Your career page,
your employer brand, how fast you respond — that's what
determines whether top talent applies or bounces.

We've had over 16 million candidates screened through our AI,
and what the data shows is that AI-screened candidates are
5.4 times more likely to get hired. Our recruiters see a 3x
capacity increase because they stop reading resumes and start
talking to qualified people.

Companies like Motorpoint cut their time-to-hire by 58%.
Lotus went from 55 days to 23. Octavo hit 100% hiring manager
adoption — meaning managers actually use the system.

So when I walk you through how this would work for you,
I want you to know this isn't theoretical — it's what we
see across thousands of companies doing exactly what
you're trying to do.

What questions do you have before we jump in?"`}
        </ScriptBlock>

        <Callout type="success" title="Adapt to Their Pain">
          Don't read this script verbatim — <strong>swap in the references that match their situation</strong>. If they're drowning in manual screening, lead with the 5.4x AI stat. If they're losing candidates, lead with the 80% withdrawal stat. If they're paying agencies, lead with Foot Asylum's 17.1% CRM hire rate. The framework stays the same — the data points flex.
        </Callout>
      </DocSection>

      <DocSection title="Pay Attention to Your Prospect">
        <p>
          As you start implementing this, <strong>watch your prospects</strong> when you're presenting it. You'll see if it's grabbing their attention or not. It'll be clear — you'll see if it's drawing them in.
        </p>
        <p className="mt-2">
          If it's not, optimize. Ask what's most important to them when choosing a service provider <em>while you're in this section</em>. Gather feedback and use it to dial this in to create the most engaging presentation introduction your prospects have ever seen.
        </p>
        <Callout type="success" title="When This Works">
          Prospects immediately start nodding their head in agreement. You understand what they're going through — and because of that, their trust in your ability to get them where they want to go starts to go up. Now they're ready to hear your treatment plan.
        </Callout>
      </DocSection>
    </div>
  );
}
