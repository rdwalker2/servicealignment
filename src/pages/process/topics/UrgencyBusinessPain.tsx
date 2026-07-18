import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function UrgencyBusinessPain() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D1"
        title="Urgency Test: Business Pain & Disruption" 
        subtitle="Get to the realistic worst-case scenario, quantify the pain, and lock Checkpoint 1 with the 1–10 scale." 
      />

      <DocSection title="Why This Is the Most Important Question">
        <p>
          Every question in the Urgency Test has been building to this moment. We know the problem. We know the main characters. We know about their failed attempts. Now we can get clear on <strong>what will happen if they continue failing to solve this problem</strong>.
        </p>
        <p className="mt-3">
          That language creates the seamless transition. This eliminates any awkwardness because we are logically progressing to the next natural question. It's not a manipulation — it's the most logical next step in the conversation.
        </p>
      </DocSection>

      <DocSection title="The Consequences Question">
        <ScriptBlock label="Getting to Pain">{`
          "I want to understand from you so we can assess together the level of priority this needs to take in your organization.

          As far as you can see — realistically speaking — what's the worst thing that will happen if [repeat their specific problem] doesn't get solved?"
        `}</ScriptBlock>
        <p className="mt-4">
          Depending on your solution, you can also frame the question differently:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2 text-stone-700">
          <li>"What would happen if the issue isn't fixed correctly the first time?"</li>
          <li>"What would happen if you choose not to do anything at all?"</li>
          <li>"What's the cost of leaving this unsolved for another 6-12 months?"</li>
        </ul>
        <Callout type="warning" title="Realistic, Not Far-Fetched">
          We want the <strong>realistic</strong> worst-case scenario — not a far-fetched reality with a low probability of happening. Exaggerated consequences reduce credibility. Grounded, believable consequences drive action.
        </Callout>
      </DocSection>

      <DocSection title="Business Disruption Categories">
        <p className="mb-4">Listen for which category of disruption applies to their situation:</p>
        <div className="space-y-3">
          <div className="border-l-4 border-red-400 pl-4 py-3 bg-red-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Empty Seats = Lost Productivity</h4>
            <p className="text-sm text-stone-600">Unfilled roles costing $400+/day in lost output, teams stretched thin covering extra work, critical projects stalled, revenue-generating roles sitting empty.</p>
          </div>
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Recruiter Burnout & Time Drain</h4>
            <p className="text-sm text-stone-600">HR/recruiters spending 80% of time on admin — manual screening, scheduling, posting to multiple job boards — no time for strategic work, turnover in the HR team itself.</p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Candidate Experience Damage</h4>
            <p className="text-sm text-stone-600">Top candidates dropping off due to slow response (80% withdraw from communication delays), broken or ugly career page driving talent away, competitors hiring your candidates first.</p>
          </div>
          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Compliance & Employer Brand Risk</h4>
            <p className="text-sm text-stone-600">EEOC/OFCCP compliance gaps from manual tracking, negative Glassdoor reviews from poor candidate experience, data privacy risks from spreadsheets and email-based hiring.</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Probing for Depth">
        <Callout type="rule" title="PROBE AT LEAST 2-3 TIMES">
          The initial answer is rarely the full story. Your job is to go deeper. Use these techniques after their first response:
        </Callout>
        <div className="space-y-2 mt-4">
          <ScriptBlock label="Probing Techniques">{`
            "Tell me more about that..."

            "What did you mean when you said [X]?"

            Mirror: Repeat back something they said, then stop talking. Let them fill the silence.

            "You mentioned you'd have to re-forecast — what does that mean for the team?"
          `}</ScriptBlock>
        </div>
        <p className="mt-4 text-sm text-stone-600">
          <strong>Example flow:</strong> They say roles stay open too long → open roles mean existing team is overworked → overwork leads to burnout and turnover → turnover creates MORE open roles → the HR leader can't hit headcount targets → that jeopardizes the company's growth plan → ultimately the HR Director's credibility is at risk. <em>These are real answers you get when you probe effectively.</em>
        </p>
      </DocSection>

      <DocSection title="The 1–10 Priority Scale">
        <ScriptBlock label="The Scale Question">{`
          "Given all of that, on a scale of 1-10 — how would you rate this as a priority?

          10 being your top priority that needs to be solved very soon. 1 being not a priority and can be solved anytime in the future."
        `}</ScriptBlock>
        <p className="mt-4 font-medium text-stone-800">Now perform the gut check — does their rating match the pain they described?</p>
        <div className="space-y-3 mt-4">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">High Pain + Low Rating (e.g., says 7)</h4>
            <p className="text-[14px] text-stone-800 italic mt-2">
              "Oh wow — I thought that number was going to be much higher based on the expected outcomes you described. Can you tell me more?"
            </p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Low Pain + High Rating (e.g., says 9)</h4>
            <p className="text-[14px] text-stone-800 italic mt-2">
              "Wow — I was expecting this to be a lower priority based on the expected outcomes. Can you tell me more?"
            </p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Low Pain + Low Rating</h4>
            <p className="text-[14px] text-stone-800 italic mt-2">
              "So you said nothing significant will happen and it will be status quo — that's why you're rating this a 6.5. Can I ask then — why are you spending time researching solutions? Why are you looking to change anything?"
            </p>
            <p className="text-sm text-stone-600 mt-2">This ends one of two ways: you both align that this isn't something they need to solve (disqualify cleanly), or it cracks open something they've been withholding.</p>
          </div>
        </div>
        <Callout type="info" title="Why the Mismatch Matters">
          Most often, your prospects are confused. They don't know what they should be doing. This process helps them sort it out. Or, if they're withholding information, this technique unlocks it. Either way, you get alignment.
        </Callout>
      </DocSection>

      <DocSection title="Closing Checkpoint 1: The Summary & Lock">
        <p>
          After probing, share your screen and recap the information gathered. Walk through the story clearly and succinctly. Then ask: <strong>"What did we miss?"</strong>
        </p>
        <ScriptBlock label="Locking the Checkpoint">{`
          "So [Prospect Name], essentially — this is an urgent priority for you."
        `}</ScriptBlock>
        <Callout type="success" title="What Happens When You Do This Right">
          Prospects lean in. They read the story of their situation that you've captured. Common response: "This is a much clearer version than what's in my head." That clarity is what drives action. A confused mind cannot act — your job is to create crystal clarity so they can get out of their own way and solve the problems causing them pain.
        </Callout>
        <p className="mt-3 font-medium text-stone-800">
          Once Checkpoint 1 is locked, Discovery is done. You now move to Diagnosis (D2) — where we figure out the bigger problems and whether they can solve it with current resources or truly need outside help.
        </p>
      </DocSection>
    </div>
  );
}
