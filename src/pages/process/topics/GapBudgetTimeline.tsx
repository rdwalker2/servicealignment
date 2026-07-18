import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function GapBudgetTimeline() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="D2"
        title="Budget &amp; Timeline Qualification"
        subtitle="Align budget expectations and timelines to create natural urgency — not artificial pressure."
      />

      <DocSection title="Why Budget &amp; Timeline Come Last in the Gap Test">
        <p>
          Budget and timeline are the <strong>4th and final step</strong> of the Gap Test. By this point you have already:
        </p>
        <ol className="list-decimal ml-6 mt-2 space-y-1">
          <li>Identified whether they have an existing vendor and why that vendor hasn't solved the problem</li>
          <li>Diagnosed the bigger problem that aligns with your differentiator</li>
          <li>Understood their buying process and who approves purchases</li>
        </ol>
        <p className="mt-3">
          Only <em>now</em> does asking about budget feel natural — like a doctor asking about insurance after diagnosing the condition, not before.
        </p>
      </DocSection>

      <DocSection title="Step 1: Do They Normally Budget for This?">
        <p>This is a two-part question:</p>
        <ul className="list-disc ml-6 mt-2 space-y-2">
          <li><strong>How do they normally budget for these issues?</strong> Do they allocate a set budget, or only handle things when they come up?</li>
          <li><strong>Do they want to be more proactive moving forward?</strong> Just because they are reactive today doesn't mean they want to stay that way.</li>
        </ul>
        <Callout type="info" title="You're Not Asking 'How Much Can I Charge You?'">
          You're understanding how they handle money so you can align your approach to their buying behavior. If they want to be proactive, position yourself as the trusted advisor to help them manage needs more efficiently long-term.
        </Callout>
        <ScriptBlock label="Budget Discovery Talk Track">
          {`"So [prospect name], when issues like this come up — the empty seats,
the time your team spends manually screening, the candidates you're
losing to slow processes — how do you all normally budget for
solving them?

Do you have a set allocation for recruiting technology, or is it
more of a 'handle it when it becomes a problem' situation?"

[Wait for answer]

"Got it. And moving forward, would you prefer to have a system
in place that handles this proactively — or are you comfortable
continuing to figure it out each time a role opens?"`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="The TT Cost of Inaction Calculator">
        <p className="mb-4">
          Before talking about TT's price, quantify what they're spending today on the broken process. This reframes the budget conversation from {`"how much does TT cost"`} to {`"how much is doing nothing costing you."`}
        </p>
        <div className="space-y-4">
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Agency Spend</h4>
            <p className="text-sm text-stone-700">{`Typical agency fee = 15-20% of first-year salary. At £40K average salary, that's £6-8K per hire. If they're using agencies for 30+ hires/year, that's £180-240K just in agency fees.`}</p>
          </div>
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Recruiter Time Waste</h4>
            <p className="text-sm text-stone-700">{`If a recruiter spends 40+ hours/week manually screening CVs, that's the equivalent of a full FTE doing data entry. At £35-45K salary, that's the cost of a person doing work an AI could do in seconds.`}</p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Cost of Vacancy</h4>
            <p className="text-sm text-stone-700">{`Industry benchmark: cost of an empty seat = 2-3x daily salary. A £50K role costs £200-300/day to leave unfilled. If average TTH is 45 days vs 23 days (Lotus Bakeries result), that's 22 extra days × £200 = £4,400 per hire wasted.`}</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Bad Hire Cost</h4>
            <p className="text-sm text-stone-700">{`CIPD estimates a bad hire costs 3x annual salary when you factor in recruitment, training, lost productivity, and re-hiring. AI screening with a 5.4x higher hire rate dramatically reduces this risk.`}</p>
          </div>
        </div>

        <ScriptBlock label="Cost of Inaction Talk Track">
          {`"Before we talk about what Service Alignment costs, let me ask you — what's the current process costing you?

You mentioned you're using agencies for about 30 hires a year. At 15-20% of salary, that's probably £200K+ per year in agency fees alone.

On top of that, your recruiters are spending 40 hours a week screening CVs — that's basically paying someone a full salary to do work that AI handles in seconds.

And then there's the cost of empty seats. If your average time-to-hire is 45 days and we could get that to 23 days — like we did for Lotus Bakeries — that's 22 fewer days per role where you're paying for a seat nobody's sitting in.

When you add it all up, the question isn't whether you can afford Service Alignment. The question is whether you can afford to keep going without it."`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="TT Budget Framing by Persona">
        <p className="mb-4">Different personas care about different budget angles. Match your framing to who you're talking to:</p>
        <div className="space-y-4">
          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">CEO / CFO / Founder</h4>
            <p className="text-sm text-stone-700 mb-2">They care about ROI and bottom-line impact.</p>
            <ScriptBlock label="CEO/CFO Budget Frame">
              {`"For a company your size hiring 50-80 people a year, most of my customers are investing between £15-30K annually in Service Alignment. Compare that to what you're spending on agencies alone — typically £150-200K — and you're looking at a 5-10x return in year one just from reduced agency dependency.

That doesn't even account for the productivity gains from AI screening or the revenue impact of filling roles faster."`}
            </ScriptBlock>
          </div>
          <div className="border-l-4 border-cyan-400 pl-4 py-3 bg-cyan-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">HR Director / TA Manager</h4>
            <p className="text-sm text-stone-700 mb-2">They care about capacity and team impact.</p>
            <ScriptBlock label="HR Director Budget Frame">
              {`"The way I'd think about this is: Service Alignment isn't a cost — it's giving your team capacity back. Companies like Motorpoint saw their recruiters handle 3x the volume without adding headcount. That's the equivalent of hiring 2-3 more recruiters without the salary cost.

What would your team be able to accomplish if they had 40 hours a week back from manual screening?"`}
            </ScriptBlock>
          </div>
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Office / Ops Manager</h4>
            <p className="text-sm text-stone-700 mb-2">They care about simplicity and time savings.</p>
            <ScriptBlock label="Ops Manager Budget Frame">
              {`"I know recruiting isn't your full-time job — you're wearing 10 hats. The value of Service Alignment for someone in your role is that it takes recruiting off your plate without needing to hire someone for it.

The AI screens candidates, the career site attracts them, and hiring managers can self-serve on interview scheduling. You go from spending 15 hours a week on recruiting admin to 2-3 hours."`}
            </ScriptBlock>
          </div>
        </div>
      </DocSection>

      <DocSection title="Step 2: When Do They Want the Work Completed?">
        <p>
          Shift focus to timelines. This is where natural urgency is created — not by pressuring them, but by working backward from <em>their</em> deadlines.
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-2">
          <li>When would they like this work to be done?</li>
          <li>{`If they say "as soon as possible" — what does that`} <em>really</em> mean?</li>
          <li>Do they have a hard deadline (before a hiring surge, before fiscal year-end, before a contract renewal, before a new HR leader starts)?</li>
        </ul>
        <p className="mt-3">
          Once you get a clear answer, <strong>work backward</strong>:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>How long will the work take?</li>
          <li>How soon is your team available?</li>
          <li>What's the latest they can sign the contract for your team to meet their deadline?</li>
        </ul>
        <ScriptBlock label="Timeline Alignment Talk Track">
          {`"When would you ideally like to have this up and running?"

[Wait for answer — probe if vague]

"OK, so if the goal is to be live before your next hiring push,
and implementation typically takes about 3 weeks to do it right,
we would need to have the contract signed by [date] to get
your team onboarded in time.

Does that timeline work for you?"`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="TT Natural Deadline Triggers">
        <p className="mb-4">These are the most common timeline triggers in Service Alignment deals. Listen for them and use them to create natural urgency:</p>
        <div className="space-y-3">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">📅 Seasonal Hiring Surge</h4>
            <p className="text-sm text-stone-600">{`"If you need to hire 20 people for summer, and implementation takes 3 weeks, we need to sign by [date] to have you live in time."`}</p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">📊 Fiscal Year-End / Budget Cycle</h4>
            <p className="text-sm text-stone-600">{`"If this needs to come out of this year's budget, when does your fiscal year end? We should get the contract signed before that date to lock in the spend."`}</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">🔄 Current Provider Contract Renewal</h4>
            <p className="text-sm text-stone-600">{`"When does your contract with [current vendor] renew? If there's an auto-renewal clause, we need to give notice by [date]. Let's make sure you don't get locked in for another year."`}</p>
          </div>
          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">👤 New Leadership Starting</h4>
            <p className="text-sm text-stone-600">{`"You mentioned your new VP of HR starts in September. Would you rather have the system live and running when they arrive, or wait for them to start the evaluation from scratch?"`}</p>
          </div>
        </div>
        <ScriptBlock label="Turning Triggers into Deadlines">
          {`"You mentioned your busiest hiring period starts in September and your current Greenhouse contract renews in August. That gives us a natural window:

If we sign by mid-July, implementation takes 3 weeks, your team is trained and live by early August, and you can give Greenhouse notice before the auto-renewal kicks in.

That way you're not paying for two systems, and you're live before the hiring surge. Does that timeline feel realistic?"`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Step 3: Creating a Natural Signing Deadline">
        <Callout type="rule" title="💰 Money Loves Speed · ⏳ Time Kills All Deals">
          These two principles drive everything in this section. If you don't understand their process and timeline, you can't align your strategy to help them approve and move forward quickly.
        </Callout>
        <p className="mt-3">
          Once you've gathered timeline details, you set a clear, justified deadline:
        </p>
        <ScriptBlock label="Deadline Setting Talk Track">
          {`"Based on everything we've discussed, we would need to have 
the contract signed by Friday so we can get you in our backlog 
and have the work completed by the end of the month."

[If they stall, follow up with:]

"I know you mentioned wanting this done by the end of the month, 
and we talked about signing by Friday. It's Friday afternoon — 
where are we at with this?"

[If you've identified their buying process:]

"Has this been sent to the board yet?"
"Has finance reviewed it?"`}
        </ScriptBlock>
        <p className="mt-3">
          Notice: you're not chasing them for a signature. You're reminding them of <strong>their own goals</strong> and the timeline <em>they</em> set. Every stakeholder stays aligned on why they need to act fast — to meet their own deadline, not yours.
        </p>
      </DocSection>

      <DocSection title="Why This Shrinks Your Time to Close">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className="bg-white border border-stone-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-stone-800">Faster</div>
            <p className="text-sm text-stone-600 mt-1">Close deals in days, not weeks</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-stone-800">Higher</div>
            <p className="text-sm text-stone-600 mt-1">Conversion rates from aligned urgency</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-stone-800">Fewer</div>
            <p className="text-sm text-stone-600 mt-1">Deals stalling or falling through</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Checkpoint 2 Summary">
        <p>By the end of the Gap Test, you should have clarity on:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>✅ Whether this is an urgent priority (Checkpoint 1 — already established)</li>
          <li>✅ Whether they need new or outside help</li>
          <li>✅ How they make buying decisions</li>
          <li>✅ What their budget and timeline look like</li>
        </ul>
        <Callout type="success" title="Gate Check: Ready for D3?">
          With both checkpoints passed, you are now ready for the Solution Roadmap — where you demonstrate your solution and drive them to a decision. If budget or timeline doesn't align, discover and disqualify. Keep your pipeline clean.
        </Callout>
      </DocSection>
    </div>
  );
}
