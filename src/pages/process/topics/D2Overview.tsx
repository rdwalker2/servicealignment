import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function D2Overview() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D2"
        title="D2 Diagnosis Overview" 
        subtitle="Reframe surface-level symptoms into urgent business problems. Be the doctor, not the vendor." 
      />

      <DocSection title="The Transition from D1 to D2">
        <p>
          We've crossed Checkpoint 1 — the prospect has firmly and clearly established they need to take action. Discovery is done. But that's not all that's needed.
        </p>
        <Callout type="rule" title="The Critical Distinction">
          Emotion drives us to <strong>want</strong> to take action. Logic justifies <strong>what</strong> action to take. Just because they're ready to act doesn't mean they're going to buy something. That's only one of three options.
        </Callout>
      </DocSection>

      <DocSection title="The Prospect's Three Choices">
        <p className="mb-4">After acknowledging their pain, prospects will choose one of three paths:</p>
        <div className="space-y-3">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">1. Take Action On Their Own</h4>
            <p className="text-sm text-stone-600">{`"We're going to put this on hold and handle it internally." They tell you they'll figure it out themselves.`}</p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">2. Stay With Their Existing Vendor</h4>
            <p className="text-sm text-stone-600">They go back to the provider they already have — even if that provider hasn't solved the problem yet.</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">3. Choose a New Solution</h4>
            <p className="text-sm text-stone-600">They actually select a new vendor or partner. This is the only option that results in a sale for you.</p>
          </div>
        </div>
        <p className="mt-4 font-medium text-stone-800">
          Choosing a new solution is only <strong>1 of 3 options</strong>. This is where countless deals die — you may have gotten pain, they're ready to solve it, but then they don't choose you.
        </p>
      </DocSection>

      <DocSection title="The Purpose of D2: The Gap Test">
        <p>
          The Gap Test is the second section of the Buyer's Action Plan, addressing <strong>Checkpoint 2: Do they need new or outside help?</strong>
        </p>
        <p className="mt-3">
          The goal of Diagnosis is to take the symptom they gave you in D1 and connect it to a bigger business gap. You are the doctor diagnosing the disease, not just treating the symptom.
        </p>
        <Callout type="info" title="Confidence &amp; Cost Framework">
          The decision on whether a prospect believes they need outside help comes down to two factors:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Confidence:</strong> What is their confidence level in their internal resources? In their existing vendor? Is it low enough to choose differently?</li>
            <li><strong>Cost:</strong> What is the cost of using internal resources? Of staying with their existing vendor? Can they effectively fund a new solution?</li>
          </ul>
        </Callout>
        <p className="mt-3">
          Once your prospect thinks you're too expensive or thinks they don't need you — there's very little chance of coming back from that. It's most likely game over. We have to guide them through these decisions proactively.
        </p>
      </DocSection>

      <DocSection title="The Four Gap Test Objectives">
        <ol className="list-decimal pl-5 space-y-3 mt-3 font-medium text-stone-700">
          <li><strong>Other Vendors / Current Resources:</strong> Evaluate their existing solutions and expose the gap in their current approach.</li>
          <li><strong>Problem Diagnosis:</strong> Reframe the problem. Diagnose the bigger issue that aligns with your solution's special sauce.</li>
          <li><strong>Buying Process:</strong> Understand who's involved in approving purchases, what their decision-making process looks like, and timeline expectations.</li>
          <li><strong>Budget &amp; Timeline:</strong> Determine how they budget for solutions and when they need this solved. Create natural deadlines.</li>
        </ol>
        <Callout type="info" title="Playbook, Not Script">
          These are objectives you need to cover to get clear answers. We've laid them out in a logical order, but adapt your approach based on the conversation. This is a playbook, not a script.
        </Callout>
      </DocSection>

      <DocSection title="The TT Gap Test Flow">
        <p className="mb-4">Here's what each Gap Test objective sounds like in a Service Alignment deal. Use these as your mental model going into D2:</p>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">1. Other Vendors</h4>
            <p className="text-sm text-stone-700 italic">{`"What Provider are you using today? Greenhouse? ADP's recruiting module? Spreadsheets and email? Help me understand what's working and what's not."`}</p>
          </div>
          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">2. Problem Diagnosis</h4>
            <p className="text-sm text-stone-700 italic">{`"The real issue isn't that you need a new Provider — it's that your current process can't scale. You're using a system built for compliance, not candidate engagement. That's why time-to-hire keeps climbing even though your team is working harder."`}</p>
          </div>
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">3. Buying Process</h4>
            <p className="text-sm text-stone-700 italic">{`"Who else needs to be involved in this decision? Will IT need to review SSO and security? Does this go through procurement? And given you're handling candidate data — will Legal need to sign off on a DPA for GDPR?"`}</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">4. Budget and Timeline</h4>
            <p className="text-sm text-stone-700 italic">{`"What are you spending today on job boards, agencies, and recruiter time? Most companies I talk to are shocked when they actually add it up — it's usually $300K-500K+ per year on a process that's not working. Service Alignment is a fraction of that."`}</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Execution Workflow">
        <p>Follow this sequence when diagnosing the problem:</p>
        <ol className="list-decimal pl-5 space-y-2 mb-6 mt-3 font-medium text-stone-700">
          <li><strong>Listen to the symptom</strong> — what they think the problem is</li>
          <li><strong>Acknowledge it</strong> — validate their experience</li>
          <li><strong>Deliver the bigger problem</strong> (Reframe) — what you know is actually causing it</li>
          <li><strong>Ask a Reveal Question</strong> — open their eyes to the gap</li>
          <li><strong>Pause</strong> — let them fill the silence</li>
          <li><strong>Frame the demo</strong> around this specific gap</li>
        </ol>

        <ScriptBlock label="The Reframe Script">
          {`"I hear that your recruiting process is slow (Symptom). 
          
But typically when we see that, the real issue is that hiring managers are completely disconnected from the Provider, meaning your talent team is doing double the admin work (Bigger Problem). 
          
How much time is your team spending just chasing down feedback?" (Reveal Question)`}
        </ScriptBlock>

        <ScriptBlock label="TT Reframe: Career Site Conversion">
          {`"You mentioned you're not getting enough qualified applicants (Symptom).

But the bigger issue is that your career page is losing 70% of visitors before they even apply. It's not branded, it's not mobile-optimized, and it doesn't tell candidates why they should work for you. You're spending money driving traffic to a page that repels the people you're trying to attract (Bigger Problem).

If I pulled up your career site right now on my phone — would you be proud of what I see?" (Reveal Question)`}
        </ScriptBlock>

        <ScriptBlock label="TT Reframe: AI Screening">
          {`"You said your recruiters are overwhelmed with the volume of applicants (Symptom).

But the real problem is that your team is spending 40+ hours a week reading CVs that an AI could screen in seconds. That's not recruiting — that's data entry. And while they're buried in unqualified applications, the good candidates are accepting offers elsewhere (Bigger Problem).

Our AI Copilot has screened over 16 million candidates. How many hours per week is your team spending just sorting through applications?" (Reveal Question)`}
        </ScriptBlock>

        <ScriptBlock label="TT Reframe: Agency Dependency">
          {`"You mentioned you want to reduce agency spend (Symptom).

But the reason you're dependent on agencies isn't because your team can't recruit — it's because your tools can't source, screen, and move fast enough. Agencies fill the gap your process creates. Until you fix the process, cutting agencies just means roles stay open longer (Bigger Problem).

Foot Asylum had the same challenge — now 17.1% of their hires come from their own CRM-sourced candidates. What would it mean for your budget if you could source even 20% of hires internally?" (Reveal Question)`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="What a Successful D2 Sounds Like at TT">
        <p className="mb-4">You know your D2 is landing when the prospect starts making these admissions on their own:</p>
        <ScriptBlock label="Prospect Admissions You Want to Hear">
          {`"We've been using [ADP/BambooHR] but honestly it's really just an employee database with a recruiting module bolted on."

"Our hiring managers never log into the Provider — they just email the recruiter and it creates a bottleneck."

"We're paying agencies $15-20K per hire because we can't source fast enough on our own."

"I don't even know what our career page looks like on mobile."

"We spend more time on admin than we do actually talking to candidates."`}
        </ScriptBlock>

        <ScriptBlock label="Your Response When You Hear This">
          {`"That's exactly what we hear from companies in your situation. And look — it's not a reflection on your team. It's a reflection on the tools.

Companies like Motorpoint were in the same spot — their recruiters were buried in admin, hiring managers were disconnected, and time-to-hire was climbing. Once they moved to a purpose-built platform, they cut time-to-hire by 58% without adding a single recruiter.

Based on what you're telling me, I think we're looking at a similar opportunity here. Let me show you exactly how that would work for your team."`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="The Halftime Check">
        <Callout type="rule" title="MANDATORY PAUSE">
          There is a mandatory pause between D2 and D3. Reps must evaluate CP1 and CP2 with their manager. If either fails, the deal goes back to D1 or is lost. You do not advance to D3. <strong>You cannot save a deal at D3 that was lost at D1.</strong>
        </Callout>
      </DocSection>

      <DocSection title="Gating: Checkpoint 2 Requirements">
        <Callout type="warning" title="Checkpoint 2 Must Be Passed">
          Do they agree that new or external resources are needed? The prospect must admit their internal efforts or current vendor have failed. This prevents the <strong>Competition</strong> and <strong>Price</strong> fatalities from killing the deal downstream.
        </Callout>
        <p className="mt-3">
          If they don't believe they need outside help, pitching your solution is a waste of time. They'll either handle it internally or use your proposal as leverage to negotiate with their existing provider.
        </p>
      </DocSection>
    </div>
  );
}
