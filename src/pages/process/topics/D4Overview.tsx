import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function D4Overview() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="D4"
        title="D4: Decision — Overview"
        subtitle="Drive to close. The Confirmation Close: verify alignment to secure a YES or a definitive NO."
      />

      <DocSection title="The Selling Is Over">
        <p>
          By the time you reach D4, the selling is <strong>done</strong>. The Decision stage is purely about confirming alignment and navigating the administrative steps to a closed-won deal.
        </p>
        <Callout type="warning" title="If You Have to 'Hard Sell' in D4...">
          ...it means you missed a fatal flaw in D1, D2, or D3. Go back and find it. D4 is not where you convince anyone — it's where you confirm what you've already built.
        </Callout>
      </DocSection>

      <DocSection title="Why D4 Exists: The 'Maybe' Problem">
        <p>
          <strong>"Maybe" is killing too many of your deals.</strong> Money loves speed.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-green-700">Yes</div>
            <p className="text-sm text-green-600 mt-1">is fine</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-red-700">No</div>
            <p className="text-sm text-red-600 mt-1">is fine</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-amber-700">Maybe</div>
            <p className="text-sm text-amber-600 mt-1">is NOT fine</p>
          </div>
        </div>
        <p>
          Maybes at the end of the sales process are one of the most damaging occurrences to your pipeline. Maybes extend time. And <strong>time is never your friend in sales</strong>. The more time that passes:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>The more time they have to lose connection to the emotion they feel</li>
          <li>The more likely they get distracted by a lesser problem</li>
          <li>The higher the chance they choose the wrong solution</li>
        </ul>

        <Callout type="info" title="🟦 Service Alignment Reality: 'Maybes' in Provider Deals">
          Provider purchases are especially vulnerable to "maybe" because the pain is chronic, not acute. Recruiters have lived with a bad system for years — another month doesn't feel catastrophic. But every month of "maybe" costs them: at $400-500/day per open role, a company with 10 open positions bleeds $80-100K while they deliberate. Your job is to make the cost of inaction tangible.
        </Callout>
      </DocSection>

      <DocSection title="The Confirmation Close">
        <p>
          This is quite possibly the <strong>most powerful part</strong> of our sales process. We call it the Confirmation Close because you are focusing on confirming the key pieces of information that <em>have already been collected</em> — not introducing new arguments or making a pitch.
        </p>
        <Callout type="info" title="Revolutionary Approach">
          We're not asking them if they want to buy our stuff. We're asking them if we are the right solution to solve their problems. If they're going to take action and choose an outside solution, whether or not we are the right outside solution is the only question to ask.
        </Callout>
      </DocSection>

      <DocSection title="The 3 Alignment Checks">
        <p>Before issuing a proposal or asking for a signature, confirm alignment on these three questions:</p>
        <div className="grid grid-cols-1 gap-3 mt-4 mb-4">
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">☐</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">Check 1: Problems & Solution Aligned?</h4>
              <p className="text-[13px] text-stone-600">Are we still aligned on the problems needing to be solved, and are you clear on how we solve those?</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">☐</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">Check 2: Outcomes & ROI Sufficient?</h4>
              <p className="text-[13px] text-stone-600">Are we still aligned on the expected outcomes, and now that you know our pricing, is the ROI sufficient?</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">☐</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">Check 3: Right Solution to Move Forward?</h4>
              <p className="text-[13px] text-stone-600">With alignment on all of that — are we the right solution to solve your problems and get you to where you're wanting to go?</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="🟦 TT-Specific Alignment Check Talk Tracks">
        <p>Here's exactly what each check sounds like in a Service Alignment deal:</p>
        <div className="space-y-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h4 className="font-bold text-blue-900 text-[14px]">Check 1 — Problems + Solution</h4>
            <ScriptBlock label="TT Alignment Check 1">
              {`"Are we aligned that manual screening and a [X]-day 
time-to-fill are the core problems holding your team back — 
and you're clear on how our Attract, Automate, Optimize 
approach handles each one?

Attract fixes the career site and candidate experience.
Automate eliminates the manual screening bottleneck.
Optimize gives you the analytics you've been missing.

Are we still on the same page there?"

[If YES → Check the box]
[If hesitation → "Which piece? Is it the career site, 
the AI automation, or the analytics?"]`}
            </ScriptBlock>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <h4 className="font-bold text-green-900 text-[14px]">Check 2 — Outcomes + ROI</h4>
            <ScriptBlock label="TT Alignment Check 2">
              {`"Now that you've seen the pricing — at $[X]/year — 
given that you're currently spending $[Y] on agency fees 
and your team is losing [Z] hours per week to manual 
processes...

Is the [X]x ROI sufficient? Does the math make sense 
for your business?"

[If YES → Check the box]
[If hesitation → "Is it the total annual investment, 
or is it more about where the budget comes from? 
Because those are two very different conversations."]`}
            </ScriptBlock>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h4 className="font-bold text-amber-900 text-[14px]">Check 3 — Right Solution</h4>
            <ScriptBlock label="TT Alignment Check 3">
              {`"With alignment on all of that — is Service Alignment the 
right Provider to get you from where you are today to where 
you're wanting to go?

From a [X]-day time-to-fill to under 25 days...
From manual processes to an AI-powered hiring engine...
From an outdated career page to a branded experience 
that converts...

Are we the right platform to make that happen?"

[If YES → Check the final box]
[If hesitation → "What's giving you pause — is it a 
feature gap, a competitor comparison, or something 
about the transition from your current system?"]`}
            </ScriptBlock>
          </div>
        </div>
      </DocSection>

      <DocSection title="🟦 TT DOA Risk Assessment — Pre-D4 Gut Check">
        <p>Before entering D4, score your deal against these Service Alignment-specific risk factors:</p>
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mt-3">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-red-500 font-bold mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-bold text-stone-800">Timing Risk</p>
                <p className="text-[13px] text-stone-600">Did they say "We'll evaluate this next quarter"? Have you quantified the cost of waiting? (e.g., "10 open roles × $450/day = $135K by next quarter")</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500 font-bold mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-bold text-stone-800">Competition Risk</p>
                <p className="text-[13px] text-stone-600">Are they also evaluating Greenhouse, Lever, or Workable? Did you establish TT's career site + employer brand as the unique differentiator?</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500 font-bold mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-bold text-stone-800">Champion Risk</p>
                <p className="text-[13px] text-stone-600">Is the HR Director bought in but the CFO/CEO hasn't been involved? Do you need the CMS Business Case Document to arm your champion?</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500 font-bold mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-bold text-stone-800">Price Risk</p>
                <p className="text-[13px] text-stone-600">Did they react to pricing with silence or "let me think about it"? Did you anchor to agency spend and cost-per-vacant-role before showing the number?</p>
              </div>
            </div>
          </div>
        </div>
        <Callout type="warning" title="Any Risk Factor Unresolved = DOA Proposal">
          If any of these risk factors are unresolved, you are NOT ready for D4. Go back and address them before transitioning to the Confirmation Close. A "maybe" in D4 is always a signal that D3 wasn't complete.
        </Callout>
      </DocSection>

      <DocSection title="🟦 The CMS Business Case Document Connection">
        <p>
          For multi-stakeholder deals — especially when your champion needs to sell internally to a CFO, CEO, or board — the <strong>CMS Business Case Document</strong> is your secret weapon in D4.
        </p>
        <ScriptBlock label="Arming Your Champion">
          {`When your HR Director says: "I love this, but I need to 
get approval from [CFO/CEO/Board]..."

YOUR RESPONSE:
"I completely understand — and I want to make sure you 
walk in there feeling like the expert, not the messenger.

Let's build the business case together. I'll provide:

1. ROI Math — Agency savings, time-to-hire reduction, 
   cost-per-vacant-role analysis specific to YOUR numbers

2. Competitive Comparison — Why Service Alignment vs. the 
   alternatives they might ask about

3. Implementation Timeline — Live in 3 weeks, value 
   milestones at week 1, 2, and 3

4. Customer Proof — Companies like Savills (15K employees), 
   L'Occitane (20 countries), Motorpoint (58% TTH reduction)

That way YOU become the expert presenting this internally. 
When would you need this ready by?"`}
        </ScriptBlock>
        <Callout type="info" title="Why This Matters">
          The CMS Business Case Document bridges the gap between your champion's enthusiasm and the decision-maker's need for data. Without it, your champion walks into a budget meeting saying "I liked the demo" — which doesn't close deals. With it, they walk in with a CFO-ready business case that does the selling for you.
        </Callout>
      </DocSection>

      <DocSection title="The D4 Sub-Topics">
        <p>The Decision stage breaks down into these detailed topics:</p>
        <div className="mt-3 space-y-3">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <h4 className="font-bold text-stone-800">1. The Confirmation Close</h4>
            <p className="text-sm text-stone-600">The detailed 3-check alignment process, how to listen for micro-hesitations, and what to do when you get a YES or a NO. The most powerful closing technique in the system.</p>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <h4 className="font-bold text-stone-800">2. DOA Proposals</h4>
            <p className="text-sm text-stone-600">Dead-on-arrival proposals — why proposals fail, proposal gating rules, and the CP3 requirement. Never send a proposal without clearing all three checkpoints.</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The No-Proposal Rule">
        <Callout type="rule" title="No Proposals Without CP3">
          Proposals are strictly gated. If fit, ROI, and trust haven't been established via Checkpoint 3, the proposal does not go out. You must use the Buyer's Action Plan (BAP) to score readiness before advancing. Sending proposals without CP3 creates DOA deals that waste your time and pollute your pipeline.
        </Callout>
      </DocSection>

      <DocSection title="What Success Looks Like in D4">
        <p>When D4 is done right, here's what you've accomplished across the entire 4D process:</p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-white border border-stone-200 rounded-lg p-3 text-center">
            <div className="font-bold text-stone-700 text-sm">D1: Discovery</div>
            <p className="text-xs text-stone-500">Found the pain</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-3 text-center">
            <div className="font-bold text-stone-700 text-sm">D2: Diagnosis</div>
            <p className="text-xs text-stone-500">Identified the real problem</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-3 text-center">
            <div className="font-bold text-stone-700 text-sm">D3: Demonstrate</div>
            <p className="text-xs text-stone-500">Showed how you solve it</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-3 text-center">
            <div className="font-bold text-stone-700 text-sm">D4: Decision</div>
            <p className="text-xs text-stone-500">Drove to a clear YES or NO</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mt-4">
          <h4 className="font-bold text-blue-900 text-[14px]">🟦 What D4 Success Looks Like — Service Alignment Deal</h4>
          <ul className="mt-2 space-y-2 text-[13px] text-blue-800">
            <li>✅ Three alignment checks passed with clear verbal "yes" on each</li>
            <li>✅ Pricing anchored to agency spend — reaction was relief, not shock</li>
            <li>✅ Next steps defined: contract review date, implementation kick-off target</li>
            <li>✅ If multi-stakeholder: CMS Business Case Document delivered to champion with a follow-up call scheduled</li>
            <li>✅ Verbal commit secured: "Service Alignment is the right platform to get us where we need to go"</li>
          </ul>
        </div>

        <p className="mt-4">
          You've delivered a valuable Plan of Action and helped them get clear on their next steps to solve their problems — as a <strong>Trusted Advisor</strong>. Sales is a process to be valued, not a process prospects should be fighting against.
        </p>
      </DocSection>
    </div>
  );
}
