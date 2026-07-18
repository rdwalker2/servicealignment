import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function GapProblemDiagnosis() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D2"
        title="Gap Test: Problem Diagnosis" 
        subtitle="Reframe the surface problem into the bigger issue that aligns with your solution's special sauce." 
      />

      <DocSection title="What Is Problem Diagnosis?">
        <p>
          Problem Diagnosis is <strong>not</strong> what the prospect thinks is wrong. It's what <strong>you, as an expert</strong>, know is actually causing the issue — the bigger problem that must be solved.
        </p>
        <p className="mt-3">
          Your prospects are not experts in solving the problems you help to solve. They see surface-level symptoms. Your job is to diagnose the disease underneath — and that diagnosis should align with what makes your company different and better.
        </p>
        <Callout type="rule" title="The Core Principle">
          Great demos are set up by good diagnosis of bigger and more unique problems your company solves exceptionally. We get alignment on the problem, then we clearly connect the dots on how your solution solves it.
        </Callout>
      </DocSection>

      <DocSection title="Why This Step Matters">
        <p>When you <strong>don't</strong> establish the bigger problem needing to be solved, two things happen:</p>
        <ol className="list-decimal pl-5 space-y-3 mt-3 text-stone-700">
          <li>
            <strong>Increased confidence in existing resources:</strong> The prospect believes their current provider or internal team can solve the simple, surface-level problem. Why would they need you?
          </li>
          <li>
            <strong>Your solution looks overpriced:</strong> They see your solution as overbloated and too expensive because only a portion of it is needed to solve their perceived simple problem. But your solution has to solve more than that — getting them to their desired outcomes requires solving a much larger problem.
          </li>
        </ol>
      </DocSection>

      <DocSection title="The Confidence &amp; Cost Connection">
        <Callout type="info" title="Setting the Frame">
          Bigger problems require more complex solutions at a higher price. Your prospects know this intuitively. Use it:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>The more complex the problem → the <strong>less confidence</strong> they have in their existing resources</li>
            <li>The more complex the problem → the <strong>more they expect</strong> a solution to cost</li>
          </ul>
          This is the first part of the Price Objection Trinity.
        </Callout>
      </DocSection>

      <DocSection title="Bigger Problems → Higher Price: TT Examples">
        <p className="mb-4">Here's how reframing the problem creates price justification in a Service Alignment deal:</p>
        <div className="space-y-4">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <p className="font-semibold text-stone-800">Surface: {`"We need a new Provider"`}</p>
            <p className="text-sm text-stone-600 mt-1">Simple problem → expects a $5K/year solution</p>
            <p className="font-semibold text-stone-800 mt-3">Bigger Problem: {`"Your entire talent acquisition function is operating at 30% efficiency because your tools create manual work instead of eliminating it"`}</p>
            <p className="text-sm text-emerald-700 mt-1">Complex problem → justifies $30K+ investment in a platform that transforms recruiting capacity</p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <p className="font-semibold text-stone-800">Surface: {`"We need to post jobs faster"`}</p>
            <p className="text-sm text-stone-600 mt-1">Simple problem → expects a job board subscription</p>
            <p className="font-semibold text-stone-800 mt-3">Bigger Problem: {`"You have zero employer brand presence online, your career site converts at 2%, and 90% of qualified candidates never see your openings because you're only fishing in one pond"`}</p>
            <p className="text-sm text-emerald-700 mt-1">Complex problem → justifies a full recruitment marketing platform with branded career sites</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <p className="font-semibold text-stone-800">Surface: {`"We spend too much on agencies"`}</p>
            <p className="text-sm text-stone-600 mt-1">Simple problem → expects to just cut agency contracts</p>
            <p className="font-semibold text-stone-800 mt-3">{`Bigger Problem: "You're agency-dependent because your internal process can't source, screen, or move fast enough. Foot Asylum was paying agencies for 40%+ of hires — after Service Alignment, CRM-sourced candidates now make up 17.1% of hires and agency dependency dropped dramatically"`}</p>
            <p className="text-sm text-emerald-700 mt-1">Complex problem → justifies investing in a platform that builds internal sourcing capability</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Diagnostic Technique">
        <p className="mb-3">The diagnosis follows a two-part process:</p>
        
        <h4 className="font-bold text-stone-800 mt-4 mb-2">Part 1: Problem Discovery Questions</h4>
        <p>
          Before you can diagnose, you need to discover. Engage in problem discovery questions that go deeper than what the prospect has told you. These questions help you identify the real, bigger problem beneath the surface.
        </p>
        <ScriptBlock label="Example Discovery Questions">
          {`"Do you have a documented process for this?"
"Have you ever gotten real execution of it across the team?"
"At what percentage of execution do you think you've actually achieved?"
"What's happening in the gap between what the process says and what people actually do?"`}
        </ScriptBlock>

        <ScriptBlock label="TT-Specific Discovery Questions">
          {`"Walk me through what happens from the moment a role opens to the moment someone accepts an offer. I want to understand every step."

"What percentage of your hiring managers actually log into your Provider? Or are they working through email and Slack?"

"How many of your candidates apply on mobile vs desktop? Do you know?"

"When was the last time someone walked you through what your career page actually looks like on a phone?"

"If I pulled up your career site right now, would you be proud of it? Does it reflect your employer brand the way your corporate site reflects your customer brand?"

"How much time does your team spend per week just reading CVs and sorting applicants into yes/no/maybe piles?"`}
        </ScriptBlock>

        <h4 className="font-bold text-stone-800 mt-6 mb-2">Part 2: The Diagnostic Statement</h4>
        <p>
          Once you've identified the bigger problem, deliver the diagnosis. Reference others like them that you've helped — this establishes influence and credibility.
        </p>
        <ScriptBlock label="The Diagnosis Script">
          {`"So [Prospect Name], what I typically see with companies like yours... the bigger problem you're dealing with is [state the bigger problems you've identified].

Most [vendors/teams/companies] are trying to solve [surface problem], but the reason it keeps coming back is [root cause that aligns with your special sauce]."`}
        </ScriptBlock>

        <h4 className="font-bold text-stone-800 mt-6 mb-2">Service Alignment-Specific Diagnostic Statements</h4>
        <p className="mb-4">Use these reframes when you've identified the root cause. Each one connects the surface symptom to the bigger problem that Service Alignment uniquely solves.</p>

        <ScriptBlock label="Reframe: Process Can't Scale">
          {`"The bigger problem isn't that you have too many open roles — it's that your current process can't keep up with the volume. You're using a tool built for tracking compliance, not for engaging candidates.

When Motorpoint had this same issue, they weren't actually understaffed in recruiting — their tools were just creating 3x the admin work. Once they moved to Service Alignment, they cut time-to-hire by 58% without adding headcount.

The issue isn't your team's effort — it's the system they're working inside of."`}
        </ScriptBlock>

        <ScriptBlock label="Reframe: Recruiter Burnout">
          {`"What I'm hearing is a classic case of recruiter burnout masked as a hiring problem. Your team isn't slow — your tools are.

If your recruiters are spending 40+ hours a week reading CVs that an AI could screen in seconds, they're not recruiting — they're doing data entry. That's why you feel like you need to hire more recruiters, when really you need to multiply the ones you have.

Our AI Copilot has screened 16M+ candidates — that's the equivalent of giving each recruiter 3x their capacity back."`}
        </ScriptBlock>

        <ScriptBlock label="Reframe: Candidate Experience Gap">
          {`"Here's what most companies miss: the reason you're losing candidates isn't your offer or your salary — it's the 72 hours between when they apply and when they hear back. 80% of candidates withdraw when the process takes too long.

Your career site is the front door to your company for talent. If it's a generic job board embed on a WordPress page, you're already losing before the conversation starts.

Companies like L'Occitane, operating across 20 countries, use Service Alignment to make every career page feel like a premium brand experience. The result? Candidates actually want to apply — and they stay engaged through the process."`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="The Specialist vs. Generalist Positioning">
        <p className="mb-3">
          If you don't diagnose properly, you end up presenting a generic proposal. Every competitor says the same thing. The decision comes down to price or gut feel — and that's not where you want to compete.
        </p>
        <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg mt-4">
          <h4 className="font-bold text-stone-900 mb-2">The Shoulder Surgery Analogy</h4>
          <p className="text-sm text-stone-700">
            Imagine you need shoulder surgery. One doctor says: <em>{`"Yeah, we'll repair it."`}</em>
          </p>
          <p className="text-sm text-stone-700 mt-2">
            Meanwhile, a shoulder <strong>specialist</strong> says: <em>{`"Typically what I see in this situation is a tear here and there, but most surgeons don't fully repair the connective tissue. That's why patients end up with limited mobility after surgery. The way we do it ensures you have full range of motion in three months — just like before, if not better."`}</em>
          </p>
          <p className="text-sm text-stone-700 mt-2 font-medium">
            Who are you going to trust with your shoulder? The specialist.
          </p>
        </div>
        <p className="mt-4">
          Your job is to position yourself as the specialist. If you diagnose effectively, you train your prospects to think: <em>{`"If I don't choose them, there's a good chance this won't get done right."`}</em>
        </p>
      </DocSection>

      <DocSection title="TT Specialist Positioning">
        <p className="mb-4">At Service Alignment, your specialist positioning comes from three unique capabilities no HRIS Provider or legacy platform can match:</p>
        <div className="space-y-4">
          <div className="border-l-4 border-cyan-400 pl-4 py-3 bg-cyan-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">AI-Native Screening</h4>
            <p className="text-sm text-stone-700">
              {`We've processed 16M+ candidates through our AI Copilot. That's not a feature we bolted on — it's how the platform was built. When you diagnose their screening bottleneck, connect it to this: "No human team can read 500 CVs in the time our AI screens them. That's not a nice-to-have — it's the difference between hiring in 23 days vs 55 days, like Lotus Bakeries experienced."`}
            </p>
          </div>
          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Employer Brand Platform</h4>
            <p className="text-sm text-stone-700">
              Most Provider tools are back-office systems. Service Alignment is a candidate-facing platform. Your career site, your employer brand content, your application experience — it's all designed to convert visitors into applicants. That's our special sauce. Diagnose the career site gap and you create demand for what only TT delivers.
            </p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Hiring Manager Engagement</h4>
            <p className="text-sm text-stone-700">
              The #1 bottleneck in recruiting isn't sourcing — it's hiring manager feedback loops. Octavo achieved 100% hiring manager adoption because TT was designed for hiring managers, not just recruiters. When you diagnose the HM engagement gap, no competitor can match this story.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Aligning Diagnosis with Your Special Sauce">
        <p className="mb-3">
          Ask yourself and your leadership team these questions to find your diagnostic foundation:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-stone-700">
          <li>What do we do better than our competitors?</li>
          <li>What unique approach do we take that others don't?</li>
          <li>{`What's our "special procedure" that ensures better results?`}</li>
          <li>What is the common mistake that other vendors make?</li>
          <li>What do we know about this problem that our prospects don't?</li>
        </ul>
        <Callout type="success" title="The Payoff">
          Once you align the bigger problem with what your company uniquely solves, you will win more deals and avoid competing on price. Your diagnosis becomes the connective tissue between the prospect's pain and your proposal. Without it, your proposal is just another bid.
        </Callout>
      </DocSection>

      <DocSection title="What Happens Without Proper Diagnosis">
        <div className="space-y-3 mt-2">
          <div className="border-l-4 border-rose-400 pl-4 py-2 bg-rose-50/30 rounded-r-lg">
            <p className="font-semibold text-stone-800">Every proposal looks the same</p>
            <p className="text-sm text-stone-600 mt-1">When the diagnosis is the same, the proposals are the same. The prospect gets confused or defaults to price.</p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-2 bg-rose-50/30 rounded-r-lg">
            <p className="font-semibold text-stone-800">No perceived value in your offer (DOA Cause of Death #3)</p>
            <p className="text-sm text-stone-600 mt-1">The prospect sees no reason to choose you over the competition. They either don't act at all or go with the cheapest option.</p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-2 bg-rose-50/30 rounded-r-lg">
            <p className="font-semibold text-stone-800">Your solution looks overpriced</p>
            <p className="text-sm text-stone-600 mt-1">When the problem is simple, a complex solution looks expensive. When the problem is complex, a sophisticated solution looks justified.</p>
          </div>
        </div>
      </DocSection>
    </div>
  );
}
