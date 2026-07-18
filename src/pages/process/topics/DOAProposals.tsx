import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function DOAProposals() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="D4"
        title="DOA Proposals — Dead on Arrival"
        subtitle="Proposals you are delivering that have no chance of converting. Learn why they fail and how to gate them."
      />

      <DocSection title="What Is a DOA Proposal?">
        <p>
          DOA proposals are proposals you deliver to prospects that have <strong>no chance of converting</strong> — they are essentially dead on arrival. These proposals are dead because the three checkpoints weren't crossed, and one of the five fatalities has already killed the deal — and you don't even know it.
        </p>
        <Callout type="warning" title="Why This Matters">
          Every DOA proposal wastes your time writing, presenting, and following up on a deal that was never going to close. This time could have been spent on qualified opportunities. DOA proposals are the #1 source of pipeline pollution.
        </Callout>
      </DocSection>

      <DocSection title="The 3 DOA Causes of Death">
        <div className="space-y-4 mt-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <h4 className="font-bold text-red-900 text-[15px]">DOA Cause #1: Wrong Timing</h4>
            <p className="text-[13px] text-red-800 mt-2">
              <strong>The opposite of Checkpoint 1:</strong> Do they need to take action?
            </p>
            <p className="text-[13px] text-stone-700 mt-2">
              This happens when we fail to help prospects get clear on the pain their problem is causing now or will cause in the future. Without clarity on consequences, they rationalize and justify:
            </p>
            <ul className="list-disc ml-6 mt-2 text-[13px] text-stone-600 space-y-1">
              <li>"It's not that big of a deal."</li>
              <li>"We'll deal with it later."</li>
              <li>"First-world problems."</li>
            </ul>
            <p className="text-[13px] text-stone-700 mt-2">
              This mindset leads to avoidance — pushing the issue further down the priority list, eventually ghosting you altogether.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <h4 className="font-bold text-red-900 text-[15px]">DOA Cause #2: No Need for New Help</h4>
            <p className="text-[13px] text-red-800 mt-2">
              <strong>The opposite of Checkpoint 2:</strong> Do they believe they need outside help?
            </p>
            <p className="text-[13px] text-stone-700 mt-2">
              This happens because of the <strong>Dunning-Kruger Effect</strong>: the unskilled person believes they are wise, while the wise person knows they are unskilled. If we fail to show that their existing resources are insufficient:
            </p>
            <ul className="list-disc ml-6 mt-2 text-[13px] text-stone-600 space-y-1">
              <li>They believe their internal team can handle it</li>
              <li>They think their current vendor is "good enough"</li>
              <li>They use your proposal as leverage to negotiate a better deal elsewhere</li>
            </ul>
            <p className="text-[13px] text-stone-700 mt-2">
              Your job is to diagnose the bigger issue and reveal blind spots they didn't know existed — forcing them to rely on outside expertise.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <h4 className="font-bold text-red-900 text-[15px]">DOA Cause #3: No Perceived Value in Your Offer</h4>
            <p className="text-[13px] text-red-800 mt-2">
              <strong>The opposite of Checkpoint 3:</strong> Who has the best solution?
            </p>
            <p className="text-[13px] text-stone-700 mt-2">
              If your diagnosis looks the same as every other competitor's, the prospect sees no reason to choose you. When every proposal looks identical, the prospect:
            </p>
            <ul className="list-disc ml-6 mt-2 text-[13px] text-stone-600 space-y-1">
              <li>Gets confused about what to do</li>
              <li>Decides not to act at all</li>
              <li>Defaults to price as the only differentiator</li>
            </ul>
            <p className="text-[13px] text-stone-700 mt-2">
              This is the <strong>worst position</strong> for you to be in. You must diagnose a bigger or different problem and clearly articulate why your company is uniquely positioned to solve it.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="🟦 Service Alignment DOA Examples — The Five Fatalities In Action">
        <p>Here's what each fatality looks like in a real Service Alignment deal — and exactly how to respond:</p>

        <div className="space-y-5 mt-4">
          <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-5">
            <h4 className="font-bold text-red-900 text-[15px]">💀 Fatality: Timing</h4>
            <p className="text-[13px] text-stone-700 mt-2 italic">
              Scenario: TA Manager says "We'll evaluate Provider options next year when our BambooHR contract is up."
            </p>
            <ScriptBlock label="TT Timing Recovery">
              {`"I completely understand — and I don't want to rush 
anything that doesn't make sense for your business.

Quick question though — how many roles are open right now?"

[They answer: "About 12"]

"OK — at $400-500 per day per open role, that's roughly 
$5,000-6,000 per DAY in unfilled role costs. Between 
now and next year, that's over $12,000 per MONTH — 
potentially $150K+ by the time you evaluate.

Is that a number you're comfortable absorbing while 
waiting for contract renewal timing?

And here's the thing — Service Alignment isn't locked to your 
BambooHR contract. BambooHR is your HRIS. We're your 
Provider. They integrate, they don't compete. You can start 
now without disrupting anything on the HR side.

Would it make sense to at least quantify what this 
costs you between now and next year?"`}
            </ScriptBlock>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-lg p-5">
            <h4 className="font-bold text-orange-900 text-[15px]">💀 Fatality: Competition</h4>
            <p className="text-[13px] text-stone-700 mt-2 italic">
              Scenario: They're evaluating Greenhouse and Lever alongside Service Alignment.
            </p>
            <ScriptBlock label="TT Competition Response">
              {`"That makes sense — doing your due diligence is smart. 
Can I ask what made you look at Greenhouse specifically?"

[Listen carefully to their answer]

"How important is the career site experience to you? 
Because that's where we differ most.

Greenhouse and Lever treat the career site as an 
afterthought — it's a bolted-on page that looks like 
every other job board. Service Alignment was BUILT around 
employer branding and the candidate experience.

Our career sites are fully branded, SEO-optimized, 
and convert 5.4x higher than industry average — because 
candidates actually want to apply.

The second difference is pricing. Greenhouse and Lever 
charge per seat. Add a hiring manager? That's another 
license. Service Alignment is flat-fee, unlimited users, 
unlimited jobs. Your entire team gets access from 
day one with no seat math.

What would it mean for you if every hiring manager 
across the business could access the system without 
worrying about license costs?"`}
            </ScriptBlock>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-5">
            <h4 className="font-bold text-yellow-900 text-[15px]">💀 Fatality: Price</h4>
            <p className="text-[13px] text-stone-700 mt-2 italic">
              Scenario: They say "$10K/year feels expensive for an Provider."
            </p>
            <ScriptBlock label="TT Price Objection Response">
              {`"I hear you — and I want to make sure the numbers 
make sense for your business. Let me ask this:

You told me you spent $45K on agency fees last year. 
If Service Alignment eliminates even HALF of that — that's 
$22,500 back. At $10K/year, the platform pays for 
itself 2x over just on agency reduction alone.

And that's before we factor in:
- Time savings from AI screening (3x recruiter capacity)
- Reduced time-to-hire (averaging 50%+ reduction)
- No per-seat charges as your team grows

So the real question isn't whether $10K is expensive — 
it's whether you'd rather keep spending $45K on agencies 
or invest $10K to not need them.

Is it the number itself, or is it more about budget 
timing? Because those are two very different 
conversations and I want to help with the right one."`}
            </ScriptBlock>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-400 rounded-r-lg p-5">
            <h4 className="font-bold text-purple-900 text-[15px]">💀 Fatality: Product Fit</h4>
            <p className="text-[13px] text-stone-700 mt-2 italic">
              Scenario: They say "We're a 2,000-person company — Service Alignment seems like it's for smaller businesses."
            </p>
            <ScriptBlock label="TT Product Fit Response">
              {`"That's a fair concern — and honestly, you're not 
the first person to wonder that. Let me share some 
context:

Savills has 15,000 employees across EMEA and runs 
their entire TA function on Service Alignment.

L'Occitane operates across 20 countries — different 
languages, different compliance requirements, different 
hiring cultures — all on one Service Alignment instance.

Motorpoint, Lotus Bakeries, Hôtel de Vin — these 
aren't startups. They chose Service Alignment because they 
needed enterprise capability without enterprise 
complexity and cost.

At 2,000 employees, you're actually in our sweet spot. 
Big enough to need real AI-powered automation, but not 
so bureaucratic that you need 18 months to implement.

What specific capability are you concerned might 
not scale? Let me address that directly."`}
            </ScriptBlock>
          </div>

          <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg p-5">
            <h4 className="font-bold text-indigo-900 text-[15px]">💀 Fatality: Champions</h4>
            <p className="text-[13px] text-stone-700 mt-2 italic">
              Scenario: HR Director loves Service Alignment but says "I need to convince our CFO and she won't take a demo."
            </p>
            <ScriptBlock label="TT Champion Enablement">
              {`"I completely understand — and honestly, the CFO 
shouldn't have to take a demo. That's not her job.

Here's what I'd like to do: Let's build the business 
case document together. I'll give you:

1. ROI Math — specific to YOUR numbers. Agency spend, 
   cost-per-vacant-role, time savings quantified in 
   dollars. Not generic — YOUR data.

2. Competitive Comparison — If she asks 'Why not 
   Greenhouse?' you'll have the answer ready.

3. Implementation Timeline — Live in 3 weeks, not 
   6 months. That matters to CFOs who hate long 
   implementation projects.

4. Customer Proof — Savills (15K employees), L'Occitane 
   (20 countries), Motorpoint (58% TTH reduction). 
   These are names that build credibility.

That way YOU become the expert presenting this 
internally. You're not selling Service Alignment — you're 
presenting a business case for solving a $[X]/year 
problem.

When is your next conversation with the CFO? Let's 
have this ready before then."`}
            </ScriptBlock>
          </div>
        </div>
      </DocSection>

      <DocSection title="How to Prevent DOA Proposals: The 3 Tests">
        <p>To stop these three causes of death, we use three tests mapped to the three checkpoints:</p>
        <div className="grid grid-cols-1 gap-3 mt-4 mb-4">
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-sm">CP1</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">The Urgency Test</h4>
              <p className="text-[13px] text-stone-600">Prevents the Timing Fatality. Run in D1 to confirm they need to take action. Priority rating must be 8+ and matched by real pain evidence.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center font-bold text-green-600 text-sm">CP2</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">The Gap Test</h4>
              <p className="text-[13px] text-stone-600">Prevents the No-Need-for-Help Fatality. Run in D2 to confirm their existing resources can't solve the bigger problem. Ability scale must show clear gap.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center font-bold text-amber-600 text-sm">CP3</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">The Solution Roadmap</h4>
              <p className="text-[13px] text-stone-600">Prevents the No-Perceived-Value Fatality. Run in D3 to ensure they see why your solution is uniquely positioned to solve their specific problems.</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="The CP3 Proposal Gate">
        <Callout type="rule" title="🚫 No Proposals Without CP3 — Non-Negotiable">
          Proposals are strictly gated. If fit, ROI, and trust haven't been established via all three checkpoints, the proposal does not go out. Period. You must use the Buyer's Action Plan to score readiness before advancing. This is the single most important rule in the entire system.
        </Callout>
        <p className="mt-3">
          Before sending any proposal, ask yourself these three questions:
        </p>
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mt-3">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-stone-400 mt-0.5">☐</span>
              <span className="text-sm"><strong>CP1:</strong> Have they confirmed this is an urgent priority with a rating of 8+ on the priority scale?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-stone-400 mt-0.5">☐</span>
              <span className="text-sm"><strong>CP2:</strong> Have they acknowledged their existing resources cannot solve the bigger problem and rated their need for outside help at 8+?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-stone-400 mt-0.5">☐</span>
              <span className="text-sm"><strong>CP3:</strong> Have they explicitly confirmed alignment on problems, solution, ROI, and fit through the 3 alignment checks?</span>
            </li>
          </ul>
        </div>
        <p className="mt-3 text-sm text-stone-600">
          If any box is unchecked, the proposal is DOA. Go back to the relevant checkpoint and get alignment before proceeding.
        </p>
      </DocSection>

      <DocSection title="🟦 TT Deal Health Diagnostic — Pre-Proposal Self-Assessment">
        <p>Before you hit send on ANY Service Alignment proposal, score yourself honestly on these questions:</p>
        <div className="mt-4 space-y-4">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-5">
            <h4 className="font-bold text-stone-800 text-[14px] mb-3">🔍 Pain Clarity</h4>
            <ul className="space-y-2 text-[13px] text-stone-700">
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Can you name their top 3 hiring pains in their own words — not yours?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Did THEY say "manual screening is killing us" or did YOU say "you probably struggle with manual screening"?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Have you quantified their pain in dollars? (Agency spend, cost-per-vacant-role, recruiter hours wasted)</span>
              </li>
            </ul>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-5">
            <h4 className="font-bold text-stone-800 text-[14px] mb-3">👤 Stakeholder Map</h4>
            <ul className="space-y-2 text-[13px] text-stone-700">
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Who signs the contract? Have you talked to them — or only their report?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Is there a CFO/Finance approval needed? If yes, does your champion have the business case document?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Do the hiring managers (end users) know this is happening? Their buy-in prevents post-sale adoption risk.</span>
              </li>
            </ul>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-5">
            <h4 className="font-bold text-stone-800 text-[14px] mb-3">⏱️ Timeline & Urgency</h4>
            <ul className="space-y-2 text-[13px] text-stone-700">
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Do they have a start date in mind — or are they "just exploring"?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Is there a forcing event? (Contract renewal, new hires starting, busy season approaching)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Have they acknowledged what happens if they do nothing for 3 more months?</span>
              </li>
            </ul>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-5">
            <h4 className="font-bold text-stone-800 text-[14px] mb-3">🏆 Competitive Position</h4>
            <ul className="space-y-2 text-[13px] text-stone-700">
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Do you know who else they're evaluating? Have you positioned TT's differentiators against them?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Is "do nothing" the real competitor — and have you quantified the cost of inaction?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-400 mt-0.5">☐</span>
                <span>Have they seen the career site demo and reacted with "our current site is nothing like that"?</span>
              </li>
            </ul>
          </div>
        </div>

        <Callout type="rule" title="Scoring: 10+ Checks = Green Light | 7-9 = Yellow | Under 7 = DOA">
          If you can't check 10 or more of these 12 boxes, your proposal is at risk. Go back and fill the gaps before sending. A DOA proposal doesn't just waste your time — it trains the prospect to see Provider vendors as interchangeable, making the next vendor's job easier.
        </Callout>
      </DocSection>

      <DocSection title="The Five Fatalities Connection">
        <p>
          Memorize the connection between checkpoints and fatalities. Every DOA proposal dies from one of these:
        </p>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-stone-100">
                <th className="text-left p-2 border border-stone-200 font-bold">Fatality</th>
                <th className="text-left p-2 border border-stone-200 font-bold">Prevented By</th>
                <th className="text-left p-2 border border-stone-200 font-bold">If Missed...</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-stone-200">Timing</td>
                <td className="p-2 border border-stone-200">CP1 — Urgency Test</td>
                <td className="p-2 border border-stone-200">They ghost you — not a priority</td>
              </tr>
              <tr className="bg-stone-50">
                <td className="p-2 border border-stone-200">Competition</td>
                <td className="p-2 border border-stone-200">CP2 — Gap Test</td>
                <td className="p-2 border border-stone-200">They stay with current vendor or do it themselves</td>
              </tr>
              <tr>
                <td className="p-2 border border-stone-200">Price</td>
                <td className="p-2 border border-stone-200">CP2 — Price Anchoring</td>
                <td className="p-2 border border-stone-200">Sticker shock — they think you're too expensive</td>
              </tr>
              <tr className="bg-stone-50">
                <td className="p-2 border border-stone-200">Trust</td>
                <td className="p-2 border border-stone-200">CP3 — Proven Results</td>
                <td className="p-2 border border-stone-200">They don't believe you can deliver</td>
              </tr>
              <tr>
                <td className="p-2 border border-stone-200">Product Fit</td>
                <td className="p-2 border border-stone-200">CP3 — Clear Solution</td>
                <td className="p-2 border border-stone-200">They're confused about what they'd actually get</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="The Bottom Line">
        <Callout type="success" title="Clean Pipeline = Accurate Projections = Better Results">
          Discover and disqualify is the best way to protect your time and keep your pipeline filled with opportunities that have a high likelihood of closing. Stop wasting time on deals that were never going to happen. Every DOA proposal you prevent is time you can spend on a deal that will close.
        </Callout>
      </DocSection>
    </div>
  );
}
