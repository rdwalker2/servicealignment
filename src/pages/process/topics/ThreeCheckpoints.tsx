import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function ThreeCheckpoints() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="The 3 Checkpoints" 
        subtitle="Sequential qualification gates that prevent zombie deals from cluttering your pipeline." 
      />

      <DocSection title="How Checkpoints Work">
        <p>
          Checkpoints are strict, sequential qualification gates. A deal must "pay the toll" to pass through. If a deal fails any checkpoint, it must be <strong>disqualified or nurtured</strong> — it cannot advance. This prevents zombie deals from consuming your time and polluting your pipeline.
        </p>
        <p>
          Each checkpoint maps to specific fatalities it prevents. If you skip a checkpoint, the corresponding fatality will kill the deal later — often after you've invested significant time.
        </p>
      </DocSection>

      <DocSection title="Checkpoint 1: The Urgency Test">
        <Callout type="info" title="CP1 — Need & Urgency">
          <strong>Question:</strong> Do they really need to take action to solve this problem <em>now</em>?<br/>
          <strong>Criteria:</strong> The prospect explicitly acknowledges severe pain and the consequences of inaction.<br/>
          <strong>Prevents:</strong> Timing and Competition fatalities.<br/>
          <strong>Gate:</strong> D1 → D2 transition
        </Callout>
        <p>
          If a prospect says "It would be nice to have" or "We're exploring options for next year," they have NOT passed CP1. You must either build more urgency or disqualify.
        </p>
        <ScriptBlock label="✅ CP1 PASS — What Urgency Sounds Like">
{"\"We have 15 open roles, we're losing candidates to slow processes, and my CEO is asking me why we can't hire fast enough.\"\n\nThe problem has to be urgent enough that NOT solving it has consequences. This prospect has volume pressure, candidate loss, and executive visibility — that's CP1."}
        </ScriptBlock>
        <ScriptBlock label="❌ CP1 FAIL — What 'Nice to Have' Sounds Like">
{"\"It'd be nice to have a better career page.\"\n\nThat's NOT CP1. 'Nice to have' = no urgency = no deal. There are no consequences for inaction. Either build urgency by quantifying the cost ($400/day per open role × their open roles) or nurture until pain intensifies."}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Checkpoint 2: The Gap Test">
        <Callout type="info" title="CP2 — Solution & Resources">
          <strong>Question:</strong> Do they agree that new or external resources are needed?<br/>
          <strong>Criteria:</strong> The prospect admits their internal efforts, status quo, or current vendor have failed, making external help mandatory.<br/>
          <strong>Prevents:</strong> Competition and Price fatalities.<br/>
          <strong>Gate:</strong> D2 → D3 transition
        </Callout>
        <p>
          If the prospect still believes they can solve the problem internally or with their current vendor, they have NOT passed CP2. You must expose the gap before demonstrating your solution.
        </p>
        <ScriptBlock label="The HRIS Wedge — Exposing CP2">
{"When they say \"We'll just keep using the Provider module in our HRIS\" — CP2 fails.\n\nThe wedge: their HRIS was built for payroll and benefits, not for attracting and engaging candidates. A purpose-built Provider is a different category of tool.\n\nBambooHR, ADP, Paycom — these are fantastic for payroll, benefits administration, and employee records. But recruiting is a completely different workflow: career sites, candidate engagement, AI screening, collaborative hiring, analytics.\n\nUntil they see that gap, they won't move."}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Checkpoint 3: The Solution Test">
        <Callout type="info" title="CP3 — Best-Fit Solution">
          <strong>Question:</strong> Do they believe your solution is the best option and are they confident in choosing you?<br/>
          <strong>Criteria:</strong> The prospect acknowledges the ROI and fit of the product during the Demonstration phase.<br/>
          <strong>Prevents:</strong> Price, Trust, and Product Fit fatalities.<br/>
          <strong>Gate:</strong> D3 → D4 transition (proposal authorization)
        </Callout>
        <Callout type="rule" title="No Proposals Without CP3">
          Proposals are strictly gated behind CP3. If fit, ROI, and trust haven't been established, the proposal does not go out. This is the most violated rule in sales.
        </Callout>
        <p>
          This is where <strong>Proven Results</strong> and <strong>Clear Solution</strong> do the heavy lifting. When prospects see companies like them getting real results, CP3 clicks:
        </p>
        <div className="space-y-2 mt-3">
          <div className="border-l-4 border-emerald-400 pl-4 py-2 bg-emerald-50/30 rounded-r-lg">
            <p className="text-[14px] text-stone-700"><strong>Motorpoint</strong> — Cut time-to-hire by <strong>58%</strong></p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-2 bg-emerald-50/30 rounded-r-lg">
            <p className="text-[14px] text-stone-700"><strong>Lotus</strong> — Went from <strong>55 days to 23 days</strong> time-to-hire</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-2 bg-emerald-50/30 rounded-r-lg">
            <p className="text-[14px] text-stone-700"><strong>Octavo Partnership</strong> — Achieved <strong>100% hiring manager adoption</strong></p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-2 bg-emerald-50/30 rounded-r-lg">
            <p className="text-[14px] text-stone-700"><strong>Foot Asylum</strong> — <strong>17.1% of hires</strong> from CRM nurture campaigns</p>
          </div>
        </div>
        <Callout type="success" title="Match the Proof to the Prospect">
          Enterprise prospect worried about scale? → Savills (15K employees). International complexity? → L'Occitane (20 countries). SMB wanting simplicity? → Octavo (100% adoption in 2 weeks). Always match the reference to their profile.
        </Callout>
      </DocSection>

      <DocSection title="Checkpoint Quick Reference">
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-stone-100">
                <th className="text-left p-3 font-bold text-stone-700 border border-stone-200">Checkpoint</th>
                <th className="text-left p-3 font-bold text-stone-700 border border-stone-200">✅ Pass (What It Sounds Like)</th>
                <th className="text-left p-3 font-bold text-stone-700 border border-stone-200">❌ Fail (What It Sounds Like)</th>
                <th className="text-left p-3 font-bold text-stone-700 border border-stone-200">What To Do If Fail</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-stone-200 font-semibold text-stone-800">CP1 — Urgency</td>
                <td className="p-3 border border-stone-200 text-emerald-700">"We have 15 open roles and my CEO is asking why we can't hire fast enough."</td>
                <td className="p-3 border border-stone-200 text-rose-700">"It'd be nice to improve our career page someday."</td>
                <td className="p-3 border border-stone-200 text-stone-600">Quantify cost of inaction: $400/day per open role × number of roles = quarterly cost of waiting.</td>
              </tr>
              <tr className="bg-stone-50">
                <td className="p-3 border border-stone-200 font-semibold text-stone-800">CP2 — Gap</td>
                <td className="p-3 border border-stone-200 text-emerald-700">"Our HRIS Provider module just isn't cutting it for what we need."</td>
                <td className="p-3 border border-stone-200 text-rose-700">"We'll just keep using BambooHR / ADP for recruiting."</td>
                <td className="p-3 border border-stone-200 text-stone-600">Expose the wedge: HRIS was built for payroll, not candidate engagement. Ask about career site conversion, HM adoption, and screening automation.</td>
              </tr>
              <tr>
                <td className="p-3 border border-stone-200 font-semibold text-stone-800">CP3 — Solution</td>
                <td className="p-3 border border-stone-200 text-emerald-700">"This looks like exactly what we need. How fast can we go live?"</td>
                <td className="p-3 border border-stone-200 text-rose-700">"Looks interesting, let me think about it."</td>
                <td className="p-3 border border-stone-200 text-stone-600">Deploy proof: Motorpoint (58% TTH↓), Lotus (55→23 days), Octavo (100% HM adoption). Match reference to their company profile.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>
    </div>
  );
}
