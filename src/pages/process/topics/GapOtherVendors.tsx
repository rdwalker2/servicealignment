import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function GapOtherVendors() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D2"
        title="Gap Test: Other Vendors" 
        subtitle="Evaluate their existing solutions, expose the gap, and create momentum for change." 
      />

      <DocSection title="The Purpose">
        <p>
          We've determined through the Urgency Test that this problem is big enough that they have to take action. But the fastest way for them to take action is to either fix it themselves or use the resources they already have.
        </p>
        <p className="mt-3">
          So we need to figure out: <strong>is there an actual gap in their current solution?</strong> If there's no real gap, they'll just keep using their current provider — and your deal dies.
        </p>
        <Callout type="info" title="This Is Gap Test Step 1">
          The Gap Test addresses Checkpoint 2: Do they need new or outside help? This is the first of four objectives in this section.
        </Callout>
      </DocSection>

      <DocSection title="Step 1: Identify Their Current Provider">
        <p>The first thing we need to figure out:</p>
        <ScriptBlock label="The Opening Question">
          {`"Are you currently using another [vendor/provider/solution] for this? Or have you been handling this internally?"`}
        </ScriptBlock>
        <p className="mt-3">
          If <strong>yes</strong>, we need to find out why their current provider hasn't been able to fully solve the issue. We're not saying their provider is bad — we're simply asking a logical question:
        </p>
        <ScriptBlock label="Exposing the Gap">
          {`"You've been using them — why do you think this issue hasn't been fully resolved yet?"`}
        </ScriptBlock>
        <p className="mt-3 text-sm text-stone-600">
          This question forces them to <strong>verbalize any doubts they already have</strong> about their existing provider. Once they say the issue out loud, you can drill deeper into why it hasn't been fixed.
        </p>
      </DocSection>

      <DocSection title="Competitor-Specific Wedge Scripts">
        <p className="mb-4">
          Once you know what they're using, deploy the right wedge. Each competitor category has a specific gap you can expose. These are read-verbatim talk tracks:
        </p>

        <ScriptBlock label="Wedge: Greenhouse / Lever / Ashby">
          {`"You've been using Greenhouse for a while now — so help me understand, why is time-to-hire still over 40 days? What is it about their platform that's not getting you there?

Typically what I see is that Greenhouse is great at tracking applicants through stages, but it was never designed to actually attract candidates or automate the top of your funnel. You're still manually posting jobs, manually screening CVs, and manually scheduling interviews. Sound familiar?

The gap isn't in the tracking — it's in everything that happens before someone enters your pipeline. That's where companies like Motorpoint found they were losing 58% of their time."`}
        </ScriptBlock>

        <ScriptBlock label="Wedge: HRIS Provider (ADP / Paycom / BambooHR)">
          {`"You're using ADP's recruiting module — when you evaluate it against a purpose-built Provider, what gaps have you noticed? Most companies I talk to find it handles about 20% of what they actually need for recruiting.

Here's the thing — ADP built that module for compliance. It's designed to get an employee into the HRIS once they're hired. But everything before that moment — sourcing, engaging, screening, interview scheduling — that's where the gaps are. That's the 80% you're doing manually.

I'm not saying ADP is bad. It's great at payroll and compliance. But asking it to also be your recruiting engine is like asking your accountant to run your marketing."`}
        </ScriptBlock>

        <ScriptBlock label="Wedge: No Provider / Spreadsheets / Email">
          {`"You've been managing this with spreadsheets and email — at what point did that stop scaling? What's the first thing that broke?

Usually what I hear is that it worked fine at 20-30 hires a year. But once you cross 50, the cracks show fast — you lose track of candidates, hiring managers don't know what's happening, and good people accept other offers because you took too long to respond.

At your current volume, every day without a centralized system means candidates are falling through the cracks. And the ones you lose are usually the best ones — because they have options."`}
        </ScriptBlock>

        <ScriptBlock label="Wedge: Indeed / LinkedIn Only (No Provider)">
          {`"You're posting directly on job boards — what percentage of applicants are actually qualified? Most companies I talk to say it's under 10%.

The problem with job-board-only recruiting is volume without quality. You're drowning in applications but starving for good candidates. Without AI screening and a branded career site, you're manually sorting through hundreds of unqualified applicants per role.

Companies using Service Alignment's AI Copilot see a 5.4x higher hire rate from screened candidates — because the AI does in seconds what takes your team hours."`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Step 2: Make the Gap Obvious">
        <Callout type="rule" title="The Insanity Principle">
          {`"The definition of insanity is doing the same thing over and over again and expecting different results." If their provider hasn't solved the issue, going back to them would be irrational. Help the prospect see this clearly.`}
        </Callout>
        <p className="mt-4">
          But we have to be thorough. There's a powerful psychological tendency at play: <strong>people stick with the devil they know rather than risk trying something new.</strong>
        </p>
        <p className="mt-3">
          Even if their current provider isn't great, the prospect at least understands their flaws and has learned to work around them. Switching means risking unknown issues they can't predict. We have to overcome that hesitation.
        </p>
      </DocSection>

      <DocSection title="Step 3: Position Yourself as the Better Solution">
        <p>Once they've admitted their current approach hasn't been effective, you now have the opening to:</p>
        <ul className="list-disc pl-5 space-y-2 mt-3 text-stone-700">
          <li>Show how your approach is fundamentally different</li>
          <li>Explain how you provide a more effective and lasting solution</li>
          <li>Contrast your solution against the provider who hasn't fixed the issue</li>
        </ul>
        <p className="mt-3">
          This makes it much easier for them to justify choosing you — not because you talked badly about their vendor, but because the gap became undeniable.
        </p>
      </DocSection>

      <DocSection title="Competitive Wedge Matrix">
        <p className="mb-4">Quick reference: match the competitor to your wedge question and TT differentiator.</p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-stone-100">
                <th className="border border-stone-300 px-3 py-2 text-left font-semibold">Competitor</th>
                <th className="border border-stone-300 px-3 py-2 text-left font-semibold">Their Weakness</th>
                <th className="border border-stone-300 px-3 py-2 text-left font-semibold">Your Question</th>
                <th className="border border-stone-300 px-3 py-2 text-left font-semibold">TT Differentiator</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-stone-300 px-3 py-2 font-medium">Greenhouse</td>
                <td className="border border-stone-300 px-3 py-2">No sourcing, no AI screening, no career site builder</td>
                <td className="border border-stone-300 px-3 py-2 italic">{`"Why is TTH still over 40 days?"`}</td>
                <td className="border border-stone-300 px-3 py-2">AI Copilot screens 16M+ candidates, 5.4x hire rate</td>
              </tr>
              <tr className="bg-stone-50">
                <td className="border border-stone-300 px-3 py-2 font-medium">Lever</td>
                <td className="border border-stone-300 px-3 py-2">Expensive, limited automation, weak career pages</td>
                <td className="border border-stone-300 px-3 py-2 italic">{`"What's your cost-per-hire with Lever?"`}</td>
                <td className="border border-stone-300 px-3 py-2">All-in-one at lower TCO — Motorpoint cut TTH 58%</td>
              </tr>
              <tr>
                <td className="border border-stone-300 px-3 py-2 font-medium">ADP / Paycom</td>
                <td className="border border-stone-300 px-3 py-2">Provider module built for compliance, not recruiting</td>
                <td className="border border-stone-300 px-3 py-2 italic">{`"What % of recruiting needs does ADP handle?"`}</td>
                <td className="border border-stone-300 px-3 py-2">Purpose-built Provider with full recruitment marketing</td>
              </tr>
              <tr className="bg-stone-50">
                <td className="border border-stone-300 px-3 py-2 font-medium">BambooHR</td>
                <td className="border border-stone-300 px-3 py-2">Basic Provider, no AI, no employer branding tools</td>
                <td className="border border-stone-300 px-3 py-2 italic">{`"How many qualified applicants per role?"`}</td>
                <td className="border border-stone-300 px-3 py-2">Branded career sites + AI screening = quality pipeline</td>
              </tr>
              <tr>
                <td className="border border-stone-300 px-3 py-2 font-medium">No Provider</td>
                <td className="border border-stone-300 px-3 py-2">{`Can't scale past 50 hires/year, lose candidate data`}</td>
                <td className="border border-stone-300 px-3 py-2 italic">{`"When did spreadsheets stop working?"`}</td>
                <td className="border border-stone-300 px-3 py-2">Centralized pipeline, automated workflows, mobile apply</td>
              </tr>
              <tr className="bg-stone-50">
                <td className="border border-stone-300 px-3 py-2 font-medium">Indeed / LI Only</td>
                <td className="border border-stone-300 px-3 py-2">{`Volume without quality, <10% qualified`}</td>
                <td className="border border-stone-300 px-3 py-2 italic">{`"What % of applicants are actually qualified?"`}</td>
                <td className="border border-stone-300 px-3 py-2">Career site captures passive traffic, AI filters quality</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="Handling: 'We Like Our Current Vendor'">
        <p>
          If they tell you their current provider is doing a great job — don't try to force them to switch. Instead:
        </p>
        <ScriptBlock label="The Logical Pushback">
          {`"If your current [vendor] is doing a great job, why are you looking at other solutions or taking the time to meet with me?"`}
        </ScriptBlock>
        <p className="mt-4">This reveals one of two things:</p>
        <div className="space-y-3 mt-3">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">1. Compliance / Multiple Bids Required</h4>
            <p className="text-sm text-stone-600">They just need multiple proposals for internal policy. Now you know your chances are lower and can decide whether to continue investing time.</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">2. Hidden Concerns They Haven't Admitted</h4>
            <p className="text-sm text-stone-600">They actually have doubts about their current provider but haven't verbalized them yet. This question cracks that open and gives you room to dig deeper.</p>
          </div>
        </div>
        <Callout type="warning" title="Pipeline Reality Check">
          This isn't about converting everyone. It's about cleaning your pipeline so you're only spending time on winnable deals. If they genuinely just need a comparison bid, that's good information — don't waste time on a deal that was never yours to win.
        </Callout>
      </DocSection>

      <DocSection title="The HRIS Wedge Play">
        <p className="mb-4">
          This is one of the highest-conversion competitive plays because the gap is obvious once you name it. Use it whenever the prospect mentions ADP, Paycom, BambooHR, Workday Recruiting, UKG, or any HRIS vendor's built-in recruiting module.
        </p>
        <ScriptBlock label="The HRIS Wedge Talk Track">
          {`"Here's what I see with companies using [ADP/Paycom/BambooHR] for recruiting: the Provider module was designed to get a new employee into the system once they're hired. It handles compliance — I-9s, onboarding paperwork, payroll setup. But that's the last 5% of recruiting.

The other 95% — attracting candidates, building a career site that converts, screening applications with AI, coordinating interviews with hiring managers, nurturing your talent pool — that's where purpose-built platforms like Service Alignment live.

Your HRIS is great at what it does. But asking it to also be your recruiting engine is like asking your accountant to run your marketing. They're both important — they're just different jobs."`}
        </ScriptBlock>
        <Callout type="info" title="When to Use the HRIS Wedge">
          Deploy this play the moment you hear ADP, Paycom, BambooHR, Workday Recruiting, UKG, or any HRIS with a bundled Provider module. The 5%/95% framing instantly reframes their tool as insufficient without badmouthing it.
        </Callout>
      </DocSection>

      <DocSection title="The Wedge Framework">
        <p>
          We're not badmouthing competitors. We're connecting dots for our prospects using their own words:
        </p>
        <ScriptBlock label="Connecting the Dots">
          {`"So you mentioned [Vendor X] has been handling this for the past [time period], but [specific problem] is still happening. If they could have solved this, they would have by now. 

That doesn't mean they're bad at what they do — but it does raise the question: is their approach actually designed to solve the problem you're dealing with?"`}
        </ScriptBlock>
        <p className="mt-3 text-sm text-stone-600">
          This is the wedge. You're using their own words and situation to help them see the gap. The prospect is the one drawing the conclusion — you're just facilitating the realization.
        </p>

        <ScriptBlock label="TT-Specific: Connecting the Dots">
          {`"So you mentioned BambooHR has been handling your recruiting for the past two years, but you're still averaging 45 days to fill a role and your hiring managers aren't using the system. If BambooHR could have solved this, they would have by now.

That doesn't mean BambooHR is bad — it's a great HRIS. But it raises the question: is a tool designed for employee management actually equipped to solve a recruiting problem?

Companies like Lotus Bakeries asked the same question and went from 55 days to 23 days time-to-hire after switching to a purpose-built recruiting platform."`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="What This Sets Up">
        <p>
          The vendor evaluation pairs directly with the next step: <strong>Problem Diagnosis</strong>. Once you've exposed the gap in their current approach, you reframe the problem to show them what's <em>actually</em> causing the issue — and that reframe aligns with your solution's unique strengths.
        </p>
        <Callout type="success" title="The Sequence">
          Their vendor's failure + your bigger problem diagnosis = compelling reason to choose you. Neither piece works without the other.
        </Callout>
      </DocSection>
    </div>
  );
}
