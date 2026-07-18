import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function ConfirmationClose() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="D4"
        title="The Confirmation Close"
        subtitle="The most powerful part of the sales process. Confirm alignment. Get a YES or a definitive NO. Never accept a maybe."
      />

      <DocSection title="Why This Is the Most Powerful Part">
        <p>
          This is one of the shorter sections in the training, but it is easily <strong>the most important</strong>. The Confirmation Close is revolutionary because it fundamentally changes what you're doing at the end of a sales conversation.
        </p>
        <Callout type="info" title="The Paradigm Shift">
          We're NOT asking them if they want to buy our stuff. We're asking them if we are the <strong>right solution to solve their problems</strong>. If they're going to take action and choose an outside solution, whether or not we are the right outside solution is the only question to ask.
        </Callout>
        <p className="mt-3">
          You're focusing on <strong>confirming</strong> the key pieces of information that have <em>already been collected</em> throughout D1, D2, and D3 — and driving them to a clear YES or NO decision. No maybes.
        </p>
      </DocSection>

      <DocSection title="Pre-Close: Reinforce the Checkpoints">
        <p>Before moving to the 3 alignment checks, confirm the two checkpoints are still solid:</p>
        <ScriptBlock label="Checkpoint Reinforcement">
          {`[Still sharing your screen with their Buyer's Action Plan]

"Before we wrap up, let me confirm a couple things. 
Based on everything we've discussed..."

1. "You still believe this is an urgent priority to solve?"
   [Point to/circle their priority rating on screen]
   [Wait for verbal YES]

2. "And you're still aligned that your existing resources 
   are not sufficient — you need outside help?"
   [Point to/circle their ability scale rating on screen]
   [Wait for verbal YES]

"Great. Then let me ask you three final questions."`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="🟦 TT Pre-Close: Pain Reinforcement Before the 3 Checks">
        <p>
          Before jumping into the alignment checks, re-anchor them to the specific pain you diagnosed. This bridges D3 directly into D4.
        </p>
        <ScriptBlock label="TT Pre-Close Reinforcement">
          {`"Before we wrap up, let me make sure we're still 
aligned on everything we've covered.

Based on what you've shared with me:

Your team is spending roughly 80% of their time on 
manual screening. You have [X] open roles right now, 
each costing approximately $400-500 per day unfilled. 
Your current Provider was built for payroll processing, 
not recruiting — and your career site hasn't been 
updated in [X] years.

You rated this a [X] out of 10 priority, and you told 
me your team can't solve this on their own with 
existing resources.

Does all of that still track?"

[Wait for verbal YES — this grounds them in their 
OWN words before you ask the 3 closing checks]`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="The 3 Alignment Checks">
        <p>Three checkboxes on screen that drive them to a decision. Check each box visually as they confirm.</p>

        <div className="space-y-6 mt-4">
          <div className="bg-white border-2 border-stone-200 rounded-lg p-5">
            <h4 className="font-bold text-stone-900 text-[15px] flex items-center gap-2">
              <span className="w-6 h-6 border-2 border-stone-300 rounded flex items-center justify-center text-xs">☐</span>
              Check 1: Problems & Solution
            </h4>
            <ScriptBlock label="Alignment Check 1">
              {`"Are we still aligned on the problems needing to be solved, 
and are you clear on how we solve those?"

[If YES → Check the box on screen]
[If hesitation, pause, or "for the most part..." → STOP]

DO NOT move on. Dig in right then and there:
"What part are you unsure about? Let's get clear on that."`}
            </ScriptBlock>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
              <h5 className="font-bold text-blue-900 text-[13px]">🟦 TT Version — Check 1</h5>
              <ScriptBlock label="TT Alignment Check 1">
                {`"Are we still aligned that slow time-to-hire and manual 
screening are the core problems holding your team back — 
and you're clear on how our Attract, Automate, Optimize 
approach handles each one?

Attract fixes the candidate experience and career site.
Automate eliminates the manual screening bottleneck 
with AI Copilot.
Optimize gives you the data and nurture capability 
you've been missing.

Are we on the same page there?"`}
              </ScriptBlock>
            </div>
          </div>

          <div className="bg-white border-2 border-stone-200 rounded-lg p-5">
            <h4 className="font-bold text-stone-900 text-[15px] flex items-center gap-2">
              <span className="w-6 h-6 border-2 border-stone-300 rounded flex items-center justify-center text-xs">☐</span>
              Check 2: Outcomes & ROI
            </h4>
            <ScriptBlock label="Alignment Check 2">
              {`"Are we still aligned on the expected outcomes, and now 
that you know our pricing, is the ROI of [X]x sufficient?"

[If YES → Check the box on screen]
[If hesitation, pause, or "I think so..." → STOP]

DO NOT move on. Dig in right then and there:
"Where is the concern — is it the outcomes or the pricing?"`}
            </ScriptBlock>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
              <h5 className="font-bold text-blue-900 text-[13px]">🟦 TT Version — Check 2</h5>
              <ScriptBlock label="TT Alignment Check 2">
                {`"Now that you've seen the pricing — at $[X] per year — 
given that you're currently spending $[Y] on agency fees 
and your team is losing [Z] hours per week on manual 
processes...

At a projected ROI of [X]x based on agency fee reduction 
and time savings alone — is the return sufficient?

Does the math make sense for your business?"`}
              </ScriptBlock>
            </div>
          </div>

          <div className="bg-white border-2 border-stone-200 rounded-lg p-5">
            <h4 className="font-bold text-stone-900 text-[15px] flex items-center gap-2">
              <span className="w-6 h-6 border-2 border-stone-300 rounded flex items-center justify-center text-xs">☐</span>
              Check 3: Right Solution
            </h4>
            <ScriptBlock label="Alignment Check 3">
              {`"With alignment on all of that... the only question left 
to ask is — are we the right solution to solve your problems 
and get you to where you're wanting to go?"

[If YES → Check the final box on screen]
[If hesitation, pause, or "I think so..." → STOP]

DO NOT move on. Dig in:
"Ok, so we're aligned on the problems to be solved... 
what part of our solution is giving you pause?"`}
            </ScriptBlock>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
              <h5 className="font-bold text-blue-900 text-[13px]">🟦 TT Version — Check 3</h5>
              <ScriptBlock label="TT Alignment Check 3">
                {`"With alignment on all of that — is Service Alignment the 
right platform to get you from where you are today 
to where you want to be?

From a [X]-day time-to-fill to under 25 days...
From manual processes to an AI-powered hiring engine...
From an outdated career page to a branded experience 
that actually converts...

Are we the right solution to make that happen?"`}
              </ScriptBlock>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="Listening for Micro-Hesitations">
        <Callout type="rule" title="🚨 When You Hear Hesitation — STOP">
          At each check, any lingering confusion or doubt will surface. It might be in a <strong>pause</strong>, or a simple word or phrase like "for the most part," "I think so," or "kind of." When those arise, DO NOT move on. Dig in right then and there and work to regain alignment. Moving past hesitation is how you create maybes that kill your pipeline.
        </Callout>
      </DocSection>

      <DocSection title="🟦 TT Hesitation Handling — Provider-Specific Responses">
        <p>When you hear hesitation at each check, here's exactly how to dig in for a Service Alignment deal:</p>

        <div className="space-y-4 mt-4">
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-5">
            <h4 className="font-bold text-amber-900 text-[14px]">"For the most part" on Check 1</h4>
            <ScriptBlock label="Check 1 Hesitation — TT Response">
              {`THEY SAY: "For the most part, yeah..."

YOUR RESPONSE:
"OK — which part? Help me understand. Is it the career 
site piece that doesn't feel right? The AI automation? 
Or the analytics and nurture side?

Because each one maps to a specific problem you told 
me about, and I want to make sure we haven't lost 
alignment on any of them."

[Listen. Their answer tells you exactly which pillar 
of Attract/Automate/Optimize needs reinforcement.
Go back to that specific section of D3 and re-anchor.]`}
            </ScriptBlock>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-5">
            <h4 className="font-bold text-amber-900 text-[14px]">"I think so" on Check 2</h4>
            <ScriptBlock label="Check 2 Hesitation — TT Response">
              {`THEY SAY: "I think so... it seems like a good value."

YOUR RESPONSE:
"I want to make sure it's not just 'seems like' — I 
want you to feel confident. Is it the total annual 
investment that's giving you pause, or is it more 
about where the budget comes from?

Because if it's the number itself, let's revisit the 
math. You're spending $[Y] on agencies and $[Z] in 
vacancy costs. The ROI is [X]x — that's not theoretical, 
that's based on YOUR numbers.

But if it's about budget timing or getting approval, 
that's a different conversation and I can help with 
that too.

Which one is it?"`}
            </ScriptBlock>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-5">
            <h4 className="font-bold text-amber-900 text-[14px]">"Kind of" on Check 3</h4>
            <ScriptBlock label="Check 3 Hesitation — TT Response">
              {`THEY SAY: "Kind of... I think you're in the running."

YOUR RESPONSE:
"I appreciate the honesty. Help me understand what's 
giving you pause. Is it:

A) A feature gap — something you need that you're not 
   sure we can do?

B) A competitor comparison — you're weighing us against 
   another platform and aren't sure which way to go?

C) The transition itself — you're worried about migrating 
   from [current system] and what that disruption 
   looks like?

Because each of those has a very different answer, 
and I'd rather address it now than have it become a 
reason to delay."

[Their answer reveals the real fatality at play:
A = Product Fit → revisit D3 Clear Solution
B = Competition → position TT differentiators
C = Trust/Risk → revisit proven results + 
    implementation timeline]`}
            </ScriptBlock>
          </div>
        </div>
      </DocSection>

      <DocSection title="When They Say YES">
        <ScriptBlock label="After All 3 Boxes Are Checked">
          {`"We're really looking forward to being able to partner with 
you on this. Next steps from here are..."

[Accept payment over the phone, or outline the contract process]

CRITICAL: Never end the meeting by just sending them a payment 
link or contract without next steps. You will have transferred 
ALL of the power over to them.

Instead:
1. Clearly define what the next step is on THEIR end
2. Set the next time you are going to meet after that action
3. That becomes your "Closing Call"`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="🟦 TT Verbal Commit Close">
        <p>
          Once all three boxes are checked, here's the Service Alignment-specific transition to close:
        </p>
        <ScriptBlock label="TT Verbal Commit + Next Steps">
          {`[All 3 boxes checked on screen]

"That's exactly what I was hoping to hear. We're 
really looking forward to partnering with you on this.

Here's how the next 48 hours work:

1. I'll send over the agreement today — flat annual 
   fee of $[X], unlimited users, unlimited jobs, 
   dedicated CSM included. No surprises.

2. Once signed, your dedicated Customer Success Manager 
   [Name] reaches out within 24 hours to kick off 
   implementation.

3. Week 1: Career site live. Week 2: AI Copilot active. 
   Week 3: Analytics flowing. You're fully operational 
   in under 45 days.

Who on your side reviews and signs the agreement — is 
that you, or does it go to [CFO/Legal/Procurement]?"

[This question immediately surfaces any hidden approval 
steps. Better to know now than discover a 3-week 
procurement process after you've sent the contract.]

"Great. Can we schedule a 15-minute call for [2 days out] 
to make sure everything's moving? I don't want momentum 
to stall — you've got [X] open roles costing you money 
every day we wait."`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="When They Need Internal Approval">
        <ScriptBlock label="Handling the Internal Champion">
          {`[If they say: "I'm in, I just need to talk to my team"]

"Great. When are you going to be talking to the team?"

"We typically meet every Thursday."

"OK — we can either meet Thursday afternoon or Friday 
morning. Which works best for you?"

[Now you have:]
✅ Next action: Talk to the executive team
✅ Next meeting: Thursday afternoon or Friday morning
✅ Clear accountability and timeline`}
        </ScriptBlock>
        <Callout type="warning" title="Don't Let Your Champion Sell For You">
          Your main contact should NOT be the one trying to sell this solution internally. Always push to be in the room (or on the call) when the decision is being discussed. If you can't, ensure the Buyer's Action Plan summary is so clear that it does the selling for you.
        </Callout>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mt-4">
          <h4 className="font-bold text-blue-900 text-[14px]">🟦 TT Internal Approval — Arming Your Champion</h4>
          <ScriptBlock label="TT Champion Enablement">
            {`"I want to make sure you walk into that meeting feeling 
like the expert, not the messenger. Here's what I'll 
send you before Thursday:

1. A one-page business case with YOUR specific ROI 
   numbers — agency savings, vacancy cost reduction, 
   time-to-hire improvement

2. A 3-minute Loom video walkthrough of the career 
   site and AI Copilot — so the team can SEE it 
   without needing another demo

3. Customer references in your industry — so when they 
   ask 'who else uses this?' you have names ready

Is there anything specific you think [CFO/CEO name] 
will push back on? Let's prepare for that now so 
you're ready."`}
          </ScriptBlock>
        </div>
      </DocSection>

      <DocSection title="When They Hesitate or Say 'I Don't Know'">
        <ScriptBlock label="Handling Uncertainty">
          {`"Ok — so we're aligned on the problems to be solved. 
What part of our solution is giving you pause?"

[Listen carefully. The answer tells you which checkpoint 
wasn't fully cleared:]

• If about the problem → Go back to D1/D2 discovery
• If about the solution → Go back to D3 demo section  
• If about price → Revisit ROI calculation from D2
• If about trust → Revisit proven results from D3`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="The Complete Journey">
        <p>When D4 is done, you've completed the entire 4D process:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>D1: Discovery</strong> — Found the pain and established urgency</li>
          <li><strong>D2: Diagnosis</strong> — Identified the bigger problem and need for outside help</li>
          <li><strong>D3: Demonstrate</strong> — Showed how you solve it with proven results</li>
          <li><strong>D4: Decision</strong> — Drove them to a clear YES or NO</li>
        </ul>
        <Callout type="success" title="Trusted Advisor Complete">
          You've delivered a valuable Plan of Action and helped them get clear on what their next steps are to solve their problems. You've done so as a Trusted Advisor. Sales is a process to be valued — not a process prospects should be fighting against.
        </Callout>
      </DocSection>
    </div>
  );
}
