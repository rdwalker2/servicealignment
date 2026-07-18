import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function D3Overview() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="D3"
        title="D3: Demonstrate — Overview"
        subtitle="Show YOUR solution. Connect every screen directly back to the buyer's stated problems."
      />

      <DocSection title="The Gate Into D3">
        <p>
          You only reach D3 after clearing <strong>both checkpoints</strong>:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 mb-4">
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <h4 className="font-bold text-stone-900 text-[14px]">✅ Checkpoint 1 — Urgent Priority</h4>
            <p className="text-[13px] text-stone-600 mt-1">
              They need to take action. The pain is real, quantified, and acknowledged. The priority rating is high.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <h4 className="font-bold text-stone-900 text-[14px]">✅ Checkpoint 2 — Need Outside Help</h4>
            <p className="text-[13px] text-stone-600 mt-1">
              Their existing resources cannot solve the bigger problem. Their confidence in internal solutions is low and they've acknowledged it.
            </p>
          </div>
        </div>
        <Callout type="warning" title="If You Haven't Cleared Both Checkpoints">
          Do NOT move to D3. Going to demo without confirmed urgency and confirmed need for outside help means you're pitching to someone who hasn't decided to act or hasn't decided they need you. This is how you create DOA proposals.
        </Callout>
      </DocSection>

      <DocSection title="Objective: Not a Feature Tour">
        <p>
          The Demonstration stage is explicitly <em>not</em> a feature tour. If you are clicking through screens saying "and here you can do X," you are losing the deal.
        </p>
        <p className="mt-2">
          We need to talk to all the <strong>feature preachers</strong> out there. You LOVE your product and all that it does. And we love that you love your product. But that love is getting you in trouble. It's causing you to talk on and on and on about your solution. <strong>Stop.</strong>
        </p>
        <Callout type="info" title="The Confused Mind Cannot Act">
          Your prospects are NOT experts in solving the problems you help solve. They're getting confused by detailed demonstrations that completely lack context to the problems they need to solve. They don't care about features — they care about clearly understanding if you can solve their problems.
        </Callout>

        <Callout type="warning" title="🎯 Teamtailor Feature Trap Alert">
          Teamtailor has an incredible feature set — AI Copilot, career sites, referrals, nurture campaigns, analytics dashboards, and more. It's tempting to show ALL of it. Don't. A 45-minute feature tour of TT's platform overwhelms an HR Director who just wants to know: "Will this cut my time-to-hire in half?" Stay mapped to their diagnosed problems.
        </Callout>
      </DocSection>

      <DocSection title="The Why → How → When Framework">
        <p>
          Our buyer survey feedback and interviews revealed that effective solution presentations mimic the world of healthcare. Prospects need three things, delivered in this exact order:
        </p>
        <div className="grid grid-cols-1 gap-3 mt-4 mb-4">
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">1</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">WHY — Proven Results (Credentials)</h4>
              <p className="text-[13px] text-stone-600">Just like a doctor — do you have a history of solving the problems making them sick? Establish trust with aggregate social proof before anything else.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center font-bold text-green-600">2</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">HOW — Clear Solution (Treatment Plan)</h4>
              <p className="text-[13px] text-stone-600">How you will get them to health. Map your method directly to the diagnosed problems. Use the Rule of 3 — not a feature dump.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center font-bold text-amber-600">3</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">WHEN — Timeline & Price</h4>
              <p className="text-[13px] text-stone-600">When will milestones be hit? When will value be received? Then — and only then — present price, anchored to the ROI you've already established.</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="🟦 Teamtailor: WHY → HOW → WHEN Preview">
        <p>Here's what each section looks like when loaded with Teamtailor-specific content:</p>

        <div className="mt-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h4 className="font-bold text-blue-900 text-[15px]">WHY — Teamtailor's Proven Results</h4>
            <p className="text-[13px] text-blue-800 mt-2">
              This is your credentialing moment. Lead with aggregate proof, not a single case study.
            </p>
            <ScriptBlock label="TT Proven Results Talk Track">
              {`"Before I show you anything, let me share why companies 
like yours trust Teamtailor with their hiring.

We've processed over 6 million applications and our AI 
has screened more than 16 million candidates. That's not 
a beta — that's battle-tested at scale.

Companies using our platform see a 5.4x higher hire rate 
and 3x recruiter capacity — meaning your team hires 
5x more effectively without adding headcount.

Motorpoint — a company with similar hiring volume to yours — 
cut their time-to-hire by 58%. Lotus Bakeries went from 
55 days to 23. And Octavo achieved 100% hiring manager 
adoption, which means the tool actually gets used.

The question isn't whether this works. It's whether 
the problems you described to me are severe enough 
to warrant this kind of change."`}
            </ScriptBlock>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <h4 className="font-bold text-green-900 text-[15px]">HOW — Attract / Automate / Optimize</h4>
            <p className="text-[13px] text-green-800 mt-2">
              This is your Rule of 3 method. Three pillars, three key features each, all mapped to diagnosed pain.
            </p>
            <ScriptBlock label="TT Clear Solution Talk Track">
              {`"We solve this in three phases — and each one maps directly 
to the problems you told me about.

1. ATTRACT — Career Site + Employer Brand
   You told me candidates are dropping off because your 
   careers page feels like it was built in 2015. We replace 
   that with a conversion-optimized career site that reflects 
   your brand and makes applying take under 2 minutes.

2. AUTOMATE — AI Copilot + Smart Workflows
   You said your team spends 80% of their time on manual 
   screening. Our AI Copilot auto-screens, auto-ranks, and 
   auto-moves candidates through your pipeline — so your 
   recruiters focus on conversations, not admin.

3. OPTIMIZE — Analytics + Nurture CRM
   You mentioned you have no visibility into where 
   bottlenecks are. Our analytics dashboard gives you 
   real-time data on source effectiveness, time-per-stage, 
   and cost-per-hire. Plus, nurture campaigns keep past 
   applicants warm so you're not starting from zero 
   every time you open a role.

What questions do you have about any of those three?"`}
            </ScriptBlock>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h4 className="font-bold text-amber-900 text-[15px]">WHEN — Timeline, Milestones & Price</h4>
            <p className="text-[13px] text-amber-800 mt-2">
              Lock down the implementation path, then anchor price to ROI already established.
            </p>
            <ScriptBlock label="TT Timeline & Price Talk Track">
              {`"Here's how fast you'll see value:

Week 1: Your career site is live, branded, and accepting 
applications. Jobs are published. Your team is trained.

Week 2: AI Copilot is active — screening candidates, 
ranking applicants, automating stage progression. Your 
recruiters start getting time back immediately.

Week 3: Analytics are flowing. You'll see source data, 
stage velocity, and candidate pipeline health. Nurture 
campaigns are built for your talent pool.

You're fully live in under 45 days. That means if we 
start this month, you're hiring differently before 
the end of next month.

Now — pricing. Teamtailor is a flat annual fee based on 
your company size. No per-seat charges, unlimited users, 
unlimited jobs. Your dedicated CSM is included from day one.

Based on your [X] FTE count, your investment is $[X]/year.

You told me you spent $[Y] on agency fees last year. 
At this rate, Teamtailor pays for itself [X]x over — 
and that's before we factor in time savings and 
reduced time-to-hire.

What questions do you have about the timeline or the 
investment?"`}
            </ScriptBlock>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Rule of 3">
        <Callout type="rule" title="Structure Every Demo in 3s">
          3 sections of your general approach. 3 key bullets per section. This rule prevents rambling and forces you to prioritize only the most critical value drivers. If it's not in the top 3, it doesn't make the presentation.
        </Callout>
        <p className="mt-3">
          Do the work to outline the <strong>20% that will drive 80% of the value</strong>. If you're worried about detail-oriented prospects who want all the info, use this question periodically during your presentation:
        </p>
        <ScriptBlock label="Engagement Check">
          {`"What questions do you have?"

NOT "Do you have any questions?" (closed-ended)

"What questions do you have?" (open-ended)

Asking this throughout will identify where they want to go 
deep — and you can happily oblige.`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="The Three Sub-Topics of D3">
        <p>The Demonstration stage breaks down into three detailed topics:</p>
        <div className="mt-3 space-y-3">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <h4 className="font-bold text-stone-800">1. Proven Results</h4>
            <p className="text-sm text-stone-600">Aggregate social proof, battle-tested data, why your company exists in the market. Not single case studies — track record proof.</p>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <h4 className="font-bold text-stone-800">2. Clear Solution</h4>
            <p className="text-sm text-stone-600">Your method mapped to diagnosed problems. Pain-to-solution connection. Rule of 3 structure. Bear the burden of complexity — simplify relentlessly.</p>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <h4 className="font-bold text-stone-800">3. Timeline & Price</h4>
            <p className="text-sm text-stone-600">Delivery milestones, minimum standards of success, price presentation anchored to ROI. Then transition to the Confirmation Close.</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="🟦 What a Successful D3 Looks Like — Teamtailor Deal">
        <p>
          When D3 lands correctly in a Teamtailor deal, you've built an <strong>inevitable progression</strong> — each step makes the next one feel natural:
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-4 bg-white p-4 border-l-4 border-blue-400 rounded-r-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">1</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">Proven Results → They trust you</h4>
              <p className="text-[13px] text-stone-600">"If Motorpoint cut TTH by 58% and Lotus went from 55 to 23 days — and they had similar challenges to ours — maybe this actually works."</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 border-l-4 border-green-400 rounded-r-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-sm">2</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">Clear Solution → They understand how</h4>
              <p className="text-[13px] text-stone-600">"Attract fixes my career site. Automate kills the manual screening. Optimize gives me the data I've been begging for. I see how this maps to my three biggest problems."</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 border-l-4 border-amber-400 rounded-r-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">3</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">Timeline & Price → They see the path</h4>
              <p className="text-[13px] text-stone-600">"Live in 3 weeks, results in 45 days, and the cost is a fraction of what I'm spending on agencies. The math makes sense."</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 border-l-4 border-purple-400 rounded-r-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-sm">→</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">Confirmation Close → Decision feels inevitable</h4>
              <p className="text-[13px] text-stone-600">"At this point, the three alignment checks in D4 should feel like a formality — not a negotiation. If D3 was done right, they're already nodding before you ask."</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="Gating: Checkpoint 3 (Best-Fit Solution)">
        <Callout type="warning" title="Checkpoint 3 Requirements">
          Do they believe your solution is the best option and are they confident in choosing you? They must explicitly acknowledge the ROI and fit. This prevents <strong>Price</strong>, <strong>Trust</strong>, and <strong>Product Fit</strong> fatalities.
        </Callout>
        <p className="mt-3">
          If you have to "hard sell" in D4, it means you missed something in D3. The demonstration should be so tightly connected to their diagnosed problems that by the end, the decision feels inevitable — not pressured.
        </p>
        <ScriptBlock label="TT Checkpoint 3 Gut-Check">
          {`Before transitioning to D4, ask yourself:

✅ Did they react to the Motorpoint/Lotus data with 
   recognition — "That's exactly what we need"?

✅ Did they connect each Attract/Automate/Optimize pillar 
   to a specific pain THEY mentioned?

✅ Did they ask "When can we start?" or "What does 
   implementation look like?" (buying signal)

✅ Was their response to pricing relief, not shock?
   ("That's less than I expected" vs. silence)

If YES to all four → You're clear for D4.
If NO to any → Go back and address the gap before 
moving to the Confirmation Close.`}
        </ScriptBlock>
      </DocSection>
    </div>
  );
}
