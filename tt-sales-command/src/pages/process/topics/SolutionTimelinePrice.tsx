import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function SolutionTimelinePrice() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="D3"
        title="Timeline, Delivery & Price"
        subtitle="Confidence before cost. Align milestones, set minimum standards of success, then present price anchored to ROI."
      />

      <DocSection title="Delivery Timelines — Put Their Mind in the Future">
        <p>
          Now that they have confidence in your historical ability to create results, and they can clearly connect the dots between the problems to be solved and how your solution addresses them — it's time to break down <strong>delivery timelines</strong> and when they can expect to achieve certain benchmarks of value.
        </p>
        <p className="mt-2">
          It is incredibly powerful to put your prospect's mind <strong>into the future</strong> — a future partnering with you where they are achieving the success they desire.
        </p>
        <Callout type="warning" title="In the Absence of Information, People Make Up Their Own">
          We do NOT want our prospects creating their own version of how we will deliver. If their assumptions don't match reality, they become frustrated for no reason. We're building long-term clients, not just making sales — a poor experience means they won't become a repeat customer.
        </Callout>
      </DocSection>

      <DocSection title="What to Communicate in Timelines">
        <p>Keep this simple. Your timeline section needs to answer three questions:</p>
        <div className="grid grid-cols-1 gap-3 mt-4 mb-4">
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">1</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">How do we fulfill our service, and why does it benefit them?</h4>
              <p className="text-[13px] text-stone-600">What do we do? Why do we do it that way? How does this approach benefit them? Set clear expectations from start to finish.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">2</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">What value does the prospect receive, and when?</h4>
              <p className="text-[13px] text-stone-600">Key points of value throughout the process. When should they expect to see results? Small moments of confirmation build confidence.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 border border-stone-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">3</div>
            <div>
              <h4 className="font-bold text-stone-900 text-[14px]">What is expected from them?</h4>
              <p className="text-[13px] text-stone-600">The "Minimum Standards of Success" — what they need to do on their end. This creates push-pull and shared ownership of outcomes.</p>
            </div>
          </div>
        </div>

        <ScriptBlock label="Teamtailor Implementation Timeline Talk Track">
          {`"Here's what it looks like working with us:

WEEK 1: Implementation Kickoff
You meet your dedicated CSM. We align on your timeline, 
success metrics, and a go-live date. We start content 
prep — gathering your photos, brand assets, and copy 
for your career site.

WEEK 2: Build & Configure
We handle data migration from your current system, set up 
your departments, roles, locations, and workflows. Your 
career site gets built with your branding. Interview kits 
and job templates go in.

WEEK 3: Train & Launch
Recruiter training, hiring manager training, UAT testing, 
then go-live. Your custom domain goes live, your old system 
gets decommissioned, and we run a launch campaign.

AFTER GO-LIVE: Hypercare
2 weeks of daily check-ins with your CSM. Then a 30-day 
success review to validate adoption metrics and ROI.

Total time from signature to live: under 45 days.
Most companies are fully operational in 3 weeks."`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Minimum Standards of Success (Push-Pull)">
        <p>
          After getting them excited about the solution, play a little <strong>hard to get</strong>. This isn't too good to be true — they will have to meet their end of the bargain.
        </p>
        <ScriptBlock label="Minimum Standards Talk Track — Teamtailor">
          {`"Now, I want to be upfront with you — this works really well,
but it's not magic. Based on the thousands of companies we've
taken through this, we know what it takes on BOTH sides to
create success.

On your end, here's what we'd need:
  1. A dedicated point of contact for implementation
  2. Your job descriptions and any existing candidate data
  3. 2-3 hours of your team's time for training

These are easy, but they're non-negotiable if you want
the results we talked about. The companies that see
100% hiring manager adoption and 58% time-to-hire
reductions are the ones that invest those first 3 weeks.
Fair enough?"`}
        </ScriptBlock>
        <Callout type="info" title="Why This Works">
          Going back to your proven results — you've done this so many times, you've gotten so many people to this outcome, that you know what it takes on both sides to create success. This builds credibility while creating healthy accountability.
        </Callout>
      </DocSection>

      <DocSection title="Transitioning to Price">
        <p>
          After presenting timelines and minimum standards, wrap up the demo section with this critical technique:
        </p>
        <ScriptBlock label="Pre-Price Technique">
          {`"What questions do you have about how we effectively 
solve your problems?"

[Let them ask, answer it, then say:]

"Great question. What OTHER questions do you have?"

[Shut up. Sit in the silence. Do NOT break the silence.]

[Keep asking until they ask:]

"Well... how much does it cost?"

THAT is your signal. Their mind is working on how to 
move forward. Now you can present price.`}
        </ScriptBlock>
        <Callout type="warning" title="What If They DON'T Ask About Price?">
          You still move on to price — but this is typically an indication they aren't likely to close. Their mind isn't working on how to move forward. Note this signal and adjust your approach accordingly.
        </Callout>
      </DocSection>

      <DocSection title="Presenting Price with Confidence">
        <Callout type="rule" title="Your Pricing HAS TO BE Simple">
          Stop with all the complex pricing models. If THEY want to give you money, YOU need to make it easy to understand how much and when. Complex pricing creates confusion, and the confused mind cannot act.
        </Callout>
        <p className="mt-3">
          Remember the Price Objections Trinity you built in D2:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 mb-4">
          <div className="bg-white border border-stone-200 rounded-lg p-3 text-center">
            <div className="font-bold text-stone-800 text-sm">Bigger Problems</div>
            <p className="text-xs text-stone-500 mt-1">Require more complex solutions at a higher price</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-3 text-center">
            <div className="font-bold text-stone-800 text-sm">Price Anchoring</div>
            <p className="text-xs text-stone-500 mt-1">ROI anchors expectations to a larger number</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-3 text-center">
            <div className="font-bold text-stone-800 text-sm">Price Sensitivity</div>
            <p className="text-xs text-stone-500 mt-1">Budget range already established — no surprises</p>
          </div>
        </div>
        <p>
          If you did D2 correctly, your prospect already has a general expectation of cost before they ever see your number. Price objections should be minimal because you've guided their expectations throughout the entire process.
        </p>
      </DocSection>

      {/* ═══════════════════════════════════════════
          NEW: Teamtailor Pricing Breakdown
          ═══════════════════════════════════════════ */}

      <DocSection title="How Teamtailor Pricing Actually Works">
        <Callout type="info" title="Flat-Rate, All-Inclusive, No Per-Seat Fees">
          This is your biggest differentiator vs. every HRIS ATS module and most competitors. Teamtailor is <strong>one flat annual fee</strong> — unlimited users, unlimited jobs, unlimited career sites. No per-seat charges for hiring managers. No usage-based AI fees. No surprises at renewal.
        </Callout>

        <h4 className="font-bold text-stone-900 mt-6 mb-2 text-[15px]">The Rate Card — Priced by FTE Count</h4>
        <p className="text-[13px] text-stone-600 mb-3">
          Pricing is based on total <strong>full-time employee (FTE) count</strong> — not seats, not active users, not the number of jobs posted. This means the price stays predictable as they scale hiring without worrying about per-seat charges adding up.
        </p>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-left px-3 py-2 font-bold text-stone-700 border-b border-stone-200">FTE Band</th>
                <th className="text-right px-3 py-2 font-bold text-stone-700 border-b border-stone-200">Non-Staffing</th>
                <th className="text-right px-3 py-2 font-bold text-stone-700 border-b border-stone-200">Staffing</th>
                <th className="text-right px-3 py-2 font-bold text-stone-700 border-b border-stone-200">$/mo equiv.</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1-5', '$1,250', '$2,800', '~$104'],
                ['6-25', '$3,025', '$3,200', '~$252'],
                ['26-50', '$4,125', '$3,600', '~$344'],
                ['51-75', '$6,000', '$4,100', '~$500'],
                ['76-100', '$8,000', '$4,600', '~$667'],
                ['101-150', '$9,000', '$5,100', '~$750'],
                ['151-250', '$10,500', '$5,600', '~$875'],
                ['251-400', '$12,000', '$6,100', '~$1,000'],
                ['401-600', '$13,000', '$6,600', '~$1,083'],
                ['601-800', '$15,000', '$7,100', '~$1,250'],
                ['801-1,000', '$19,000', '$7,500', '~$1,583'],
                ['1,001-1,500', '$23,000', 'Custom', '~$1,917'],
                ['1,501-2,000', '$28,000', '—', '~$2,333'],
                ['2,001-3,000', '$33,000', '—', '~$2,750'],
                ['3,001-5,000', '$40-50K', '—', 'Custom'],
                ['5,000+', 'Custom/POA', '—', 'Custom'],
              ].map(([band, ns, st, mo], idx) => (
                <tr key={band} className={idx % 2 === 0 ? '' : 'bg-stone-50/50'}>
                  <td className="px-3 py-1.5 font-semibold text-stone-800 border-b border-stone-100">{band}</td>
                  <td className="px-3 py-1.5 text-right text-stone-700 border-b border-stone-100">{ns}</td>
                  <td className="px-3 py-1.5 text-right text-stone-500 border-b border-stone-100">{st}</td>
                  <td className="px-3 py-1.5 text-right text-stone-400 border-b border-stone-100">{mo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ScriptBlock label="How to Say It — Standard (Single Entity)">
          {`"Our pricing is straightforward. It's a flat annual fee — 
no per-seat charges, no per-user limits. Everyone on your 
team can use it.

For a company your size — [X] employees — the investment 
is $[X] per year. That breaks down to $[X/12] per month.

That includes the full platform: career site builder, 
AI Copilot, unlimited jobs, unlimited users, GDPR 
compliance, and a dedicated CSM for implementation.

Are you clear on the pricing?"`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Multi-Entity Pricing — Divisions & Groups">
        <p>
          For larger or more complex organizations, Teamtailor offers two multi-entity setups. These are configured in the CMS before presenting:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏢</span>
              <h4 className="font-bold text-stone-900 text-[14px]">Divisions</h4>
            </div>
            <p className="text-[12px] text-stone-600 leading-relaxed">
              Sub-brands within <strong>one platform</strong>. Each division has its own career site, branding, and pipeline — but shares one ATS instance. Each division is priced by its own FTE count.
            </p>
            <div className="mt-3 bg-stone-50 rounded-lg p-3 text-[11px] text-stone-500">
              <strong className="text-stone-700">Example:</strong> A hospitality group with 3 hotel brands. One ATS, three career sites, three pipelines. Priced as: Brand A (200 FTE) + Brand B (150 FTE) + Brand C (100 FTE).
            </div>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌐</span>
              <h4 className="font-bold text-stone-900 text-[14px]">Groups</h4>
            </div>
            <p className="text-[12px] text-stone-600 leading-relaxed">
              Multiple <strong>fully separate ATS instances</strong>. Each platform is completely independent — separate databases, separate users, separate everything. Priced individually.
            </p>
            <div className="mt-3 bg-stone-50 rounded-lg p-3 text-[11px] text-stone-500">
              <strong className="text-stone-700">Example:</strong> A PE-backed holding company with 5 portfolio companies. Each needs its own ATS. Priced as 5 separate platforms by FTE.
            </div>
          </div>
        </div>

        <ScriptBlock label="How to Say It — Multi-Entity">
          {`"Because you have [X] brands/entities, here's how 
we structure this:

Each [division/platform] gets its own career site, its 
own branding, its own candidate pipeline. 

[DIVISIONS:] They all live under one ATS instance, so your 
corporate team can see everything centrally while each 
brand operates independently.

[GROUPS:] Each one is a fully separate platform — separate 
databases, separate users. This is important for [data 
privacy/acquisition independence/etc.].

Let me walk you through the breakdown:
  • [Brand A] — [X] employees → $[Y]/yr
  • [Brand B] — [X] employees → $[Y]/yr
  • [Brand C] — [X] employees → $[Y]/yr

Total investment: $[combined]/yr for the entire group.
That's $[monthly] per month across all entities.

And the same deal — unlimited users, unlimited jobs, 
each brand gets their own career site and pipeline."`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Add-Ons — Only When They Need Them">
        <p>
          Add-ons are the modules that sit on top of the core platform. <strong>Don't lead with these</strong> — only present add-ons that directly map to a pain they've already told you about.
        </p>
        <Callout type="warning" title="Don't Dump the Menu">
          Listing every add-on creates the exact confusion the training warns against. Only show what maps to their pain points. If they didn't mention onboarding gaps, don't pitch the onboarding module.
        </Callout>

        <div className="mt-4 space-y-2 mb-4">
          <h4 className="font-bold text-stone-800 text-[13px]">Common Add-Ons by Pain Point</h4>
          {[
            { pain: 'Screening bottleneck / manual process', addon: 'AI Copilot', note: 'Included in core — highlight it, don\'t charge extra' },
            { pain: 'Onboarding gaps / new hire drop-off', addon: 'Onboarding Module ($2,500/yr)', note: 'Pre-boarding workflows + e-signing' },
            { pain: 'Hard to coordinate interviews', addon: 'Enterprise Calendar ($1,400/yr)', note: 'Advanced Exchange/Google Workspace sync' },
            { pain: 'Headcount planning / budget approvals', addon: 'Requisition Flow ($1,400/yr)', note: 'Approval chains before a req opens' },
            { pain: 'Candidate communication / texting', addon: 'SMS Messaging ($100-$600/yr)', note: '1K-10K messages; volume discounts' },
            { pain: 'Compliance / audit trail requirements', addon: 'Audit Log ($720/yr)', note: '30 days free; extended history at $60/mo' },
            { pain: 'BI / data warehouse integration', addon: 'BI Connection ($1,700/yr)', note: 'External analytics platform feed' },
          ].map(({ pain, addon, note }) => (
            <div key={pain} className="flex items-start gap-3 bg-white border border-stone-200 rounded-lg p-3">
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5">PAIN</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-stone-800">{pain}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">→ <strong className="text-stone-700">{addon}</strong> — {note}</p>
              </div>
            </div>
          ))}
        </div>

        <ScriptBlock label="How to Say It — Add-Ons">
          {`"Now remember — the core platform includes everything 
we just walked through. Unlimited users, AI Copilot, 
career site builder, the works.

You mentioned [specific pain]. For that, there's a module 
called [add-on name] — it's $[X] per year on top of the 
platform fee. That gives you [specific capability].

[If waiving as a deal sweetener:]
"Actually — since you're committing to a [X]-year term, 
I can include [add-on] at no extra cost. It's normally 
$[X]/yr but I'll waive it."

[If they already have too many add-ons:]
"Let me simplify this. I'll bundle [add-on A] and [add-on B] 
into a package deal. Instead of $[X+Y], I'll do $[lower 
number]. That keeps it clean."

Are you clear on what's included and what the add-ons cover?"`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Good / Better / Best Packaging">
        <p>
          For deals where you want to give the prospect a sense of choice (and anchor to a higher number), use the <strong>three-package</strong> presentation style. This is configured in the CMS under Pricing → Presentation Style → "Package Options."
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 mb-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
            <div className="text-[10px] font-bold text-stone-400 tracking-wider mb-2">GOOD</div>
            <h4 className="font-bold text-stone-900 text-[14px]">Core Platform</h4>
            <p className="text-[11px] text-stone-500 mt-1 mb-3">Everything you need to centralize hiring.</p>
            <div className="text-lg font-bold text-stone-900">$[base]/yr</div>
            <div className="text-[10px] text-stone-400 mt-1">Base platform</div>
          </div>
          <div className="bg-stone-900 text-white border-2 border-sky-400 rounded-xl p-4 text-center relative">
            <div className="absolute -top-2.5 left-0 right-0">
              <span className="bg-sky-500 text-white text-[9px] font-bold px-3 py-0.5 rounded-full">RECOMMENDED</span>
            </div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider mb-2 mt-1">BETTER</div>
            <h4 className="font-bold text-[14px]">Growth</h4>
            <p className="text-[11px] text-stone-400 mt-1 mb-3">Core + Candidate CRM & Nurture.</p>
            <div className="text-lg font-bold">$[base + addons]/yr</div>
            <div className="text-[10px] text-stone-400 mt-1">Most popular</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
            <div className="text-[10px] font-bold text-stone-400 tracking-wider mb-2">BEST</div>
            <h4 className="font-bold text-stone-900 text-[14px]">Enterprise</h4>
            <p className="text-[11px] text-stone-500 mt-1 mb-3">Full suite with all add-ons.</p>
            <div className="text-lg font-bold text-stone-900">$[full]/yr</div>
            <div className="text-[10px] text-stone-400 mt-1">Everything included</div>
          </div>
        </div>

        <Callout type="info" title="Psychology of Three Options">
          Most prospects pick the middle option. The "Good" package makes the platform feel accessible. The "Best" package anchors them to a higher number, making "Better" feel like a deal. This is classic price anchoring from the Trinity.
        </Callout>

        <ScriptBlock label="How to Say It — Packages">
          {`"I've put together three options for you. 

The first is our Core Platform — that's everything we 
just walked through. Career site, AI, unlimited users. 
That's $[X]/yr.

The second — and this is what I'd recommend based on 
what you told me about [reference their pain] — is our 
Growth package. That adds [specific add-ons that map to 
their pains]. That's $[Y]/yr.

The third is our Enterprise package — that's everything 
we offer, all add-ons included. $[Z]/yr. Most companies 
your size end up somewhere between options 2 and 3.

Which of these feels like the best fit for where you 
are right now?"`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="The ROI Anchor — Make Price Feel Small">
        <Callout type="rule" title="Always Present Price in Context of Cost-of-Inaction">
          Never present a number in isolation. The number only has meaning relative to what they're already spending — or losing — by NOT solving the problem.
        </Callout>
        <p className="mt-3">
          By this point you should have <strong>two anchors</strong> from earlier discovery:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 mb-4">
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="text-[10px] font-bold text-rose-500 mb-1">FROM D1 (Urgency)</div>
            <h4 className="font-bold text-stone-900 text-[13px]">Cost of Problem</h4>
            <p className="text-[12px] text-stone-600 mt-1">What they told you they're losing — vacancy costs, recruiter time drain, agency fees, candidate drop-off revenue impact.</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="text-[10px] font-bold text-emerald-500 mb-1">FROM D3 (Solution)</div>
            <h4 className="font-bold text-stone-900 text-[13px]">ROI Projection</h4>
            <p className="text-[12px] text-stone-600 mt-1">The calculated value from the ROI builder — agency fee reduction, time savings, faster time-to-hire, eliminated ATS seat costs.</p>
          </div>
        </div>

        <ScriptBlock label="The Complete Price Presentation — With ROI Anchor">
          {`"Now remember — you told me you have [X] open roles, 
and we talked about how each unfilled seat costs roughly 
$400-500 per day. That means you're spending roughly 
$[X,000] per month on vacancy costs alone.

Your ROI projection shows $[roi_total] in annual value — 
that's from [list top 2-3 categories: agency fee reduction, 
time savings, faster time-to-hire].

Your investment in Teamtailor is $[annual_total] per year. 
That's $[monthly] per month.

So the system pays for itself in [X weeks] just on the 
time savings. After that, it's saving you money every 
single month. That's a [X]x return on investment.

The price you see is the price you pay — no usage-based 
AI fees, no per-seat charges for hiring managers, no 
surprises when it's time to renew.

Are you clear on the pricing and how it breaks down?"`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Contract Term & Sweeteners">
        <p>
          Use contract terms and promotional offers as levers — not defaults. These create urgency and reward commitment:
        </p>
        <div className="space-y-2 mt-3 mb-4">
          {[
            { term: '1-Year Term', discount: 'Standard pricing', when: 'Default. No mention of multi-year unless they ask or you need to close.' },
            { term: '2-Year Term', discount: '~5% discount', when: 'When they need budget predictability. "If you lock in 2 years, I can take 5% off the annual — and cap your price escalation."' },
            { term: '3-Year Term', discount: '~10% discount', when: 'Enterprise deals. PE-backed companies that want cost certainty across a portfolio.' },
            { term: 'Price Escalation Cap', discount: 'X% max annual increase', when: 'When they worry about renewal surprises. "Your price can\'t increase more than X% per year, period."' },
            { term: 'Promotional Offer', discount: 'X free months', when: 'End-of-quarter urgency. "If we get this signed by [date], I can add [X] free months onto the contract."' },
          ].map(({ term, discount, when }) => (
            <div key={term} className="bg-white border border-stone-200 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-[12px] text-stone-900">{term}</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{discount}</span>
              </div>
              <p className="text-[11px] text-stone-500">{when}</p>
            </div>
          ))}
        </div>
        <Callout type="warning" title="Don't Lead with Discounts">
          Discounting too early signals that your price is negotiable. Only bring up multi-year terms or promotions AFTER they've seen the price and confirmed they understand the value. Discounts are closers, not openers.
        </Callout>
      </DocSection>

      <DocSection title="After Price: DO NOT STOP">
        <Callout type="rule" title="Critical: You Do NOT Stop at Price">
          Ask if they are clear on your pricing, then scroll to the next section — the Confirmation Close. This is where your verbal commits and closing rate dramatically improve. Price is a waypoint, not a destination.
        </Callout>
        <ScriptBlock label="Price Transition Talk Track">
          {`[After presenting pricing]

"Are you clear on the pricing and how it breaks down?"

[Wait for confirmation]

"Great. Let me walk you through the last section here..."

[Scroll directly to the Confirmation Close / Alignment Checklist]`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Handling Price Objections — In the Moment">
        <p>
          If you built the Trinity correctly, price objections should be rare. But when they happen:
        </p>
        <div className="space-y-3 mt-3">
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">OBJECTION</span>
              <h4 className="font-bold text-stone-900 text-[13px]">"I need to think about it"</h4>
            </div>
            <ScriptBlock label="Response">
              {`"Can I ask — what specifically do you need to think 
through? Is it the fit, the price, or the timing? 

Because if it's fit — we can address that right now.
If it's price — let's talk about the ROI math.
If it's timing — let's find the right date and work 
backward from there."`}
            </ScriptBlock>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">OBJECTION</span>
              <h4 className="font-bold text-stone-900 text-[13px]">"It's too expensive"</h4>
            </div>
            <ScriptBlock label="Response — Cost of Inaction">
              {`"Let me ask this — what's the cost of NOT solving this? 

You told me you have [X] open roles at roughly $400-500/day 
each. That's $[X,000] per month in vacancy costs. 

Teamtailor is $[X]/year. So the system pays for itself 
in [X weeks]. After that, it's saving you money every 
single month.

Is it the total number that's the concern, or is it more 
about the budget timing?"`}
            </ScriptBlock>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">OBJECTION</span>
              <h4 className="font-bold text-stone-900 text-[13px]">"We already pay for an ATS through our HRIS"</h4>
            </div>
            <ScriptBlock label="Response — HRIS Wedge">
              {`"That's actually the most common thing I hear. And here's 
what I've found — the companies paying for an ATS through 
their HRIS are usually getting about 20% of the capability 
they need.

The HRIS is great for employee records, benefits, payroll. 
But their recruiting module? It's a checkbox feature, not 
a purpose-built recruiting engine.

Your team told me they're struggling with [reference their 
specific pains]. Those are the exact gaps that a bolted-on 
ATS module can't solve.

The question isn't 'are we paying more?' — it's 'are we 
losing MORE by using a tool that wasn't built for recruiting?'"`}
            </ScriptBlock>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">OBJECTION</span>
              <h4 className="font-bold text-stone-900 text-[13px]">"Can you do better on price?"</h4>
            </div>
            <ScriptBlock label="Response — Value, Not Discount">
              {`"I appreciate you asking. Let me ask you this first — 
are you aligned that this is the right solution for [pain]?

[If yes:] Then the question is really about making the 
investment work for your budget. A couple options:

  1. We could look at a [2/3]-year term — that typically 
     unlocks a [5-10]% reduction.
  2. I can adjust which add-ons are included vs. optional.
  3. If timing is the issue, I might be able to add [X] 
     free months to ease the first-year budget impact.

Which of those would be most helpful for your situation?

[If not sure about fit:] Then let's not negotiate price 
yet — let's get clear on whether this is the right solution 
first. Price doesn't matter if it's not the right fit."`}
            </ScriptBlock>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Pricing Presentation Checklist">
        <p>Before you present price on any call, confirm you have all of these:</p>
        <div className="mt-3 space-y-1.5 mb-2">
          {[
            ['D1', 'Cost of problem established', 'They told you what this is costing them — you can reference it.'],
            ['D2', 'Bigger problem diagnosed', 'The problem is complex enough to justify a sophisticated solution.'],
            ['D2', 'Budget range discovered', 'You asked about how they budget for this, so no sticker shock.'],
            ['D2', 'ROI anchored to a bigger number', 'The ROI projection has been calculated and they\'ve seen it.'],
            ['D3', 'Solution clearly mapped to pains', 'They understand WHAT you do and HOW it solves their problems.'],
            ['D3', 'Timeline and implementation clear', 'They know WHEN they\'ll see value and WHAT it takes to get there.'],
            ['D3', 'Minimum standards set', 'They\'ve committed to their side of the bargain.'],
            ['D3', 'Pre-price technique used', '"What OTHER questions do you have?" until THEY ask about price.'],
          ].map(([stage, item, detail]) => (
            <div key={item} className="flex items-start gap-2 bg-white border border-stone-200 rounded-lg p-2.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${stage === 'D1' ? 'bg-rose-50 text-rose-600' : stage === 'D2' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{stage}</span>
              <div>
                <p className="text-[12px] font-semibold text-stone-800">{item}</p>
                <p className="text-[11px] text-stone-500">{detail}</p>
              </div>
            </div>
          ))}
        </div>
        <Callout type="rule" title="If You're Missing Any of These, You're Presenting Price Too Early">
          Go back and fill the gaps before showing the number. A premature price presentation is the #1 cause of "I need to think about it" responses.
        </Callout>
      </DocSection>
    </div>
  );
}
