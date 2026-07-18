import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function UrgencyObjective() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D1"
        title="Urgency Test: Buyer's Objective" 
        subtitle="The first and most important question in the entire sales process — what brought them here?" 
      />

      <DocSection title="Why This Question Is Everything">
        <p>
          After setting the agenda and taking leadership position, it's time to start Discovery. The prospect scheduled and attended this meeting — <strong>spending their time and energy with a complete stranger</strong> — for a reason. That is a huge tell. It is perhaps the most important piece of information we need during the entire process.
        </p>
        <p className="mt-3">
          Think of it like poker — they've already shown their hand. So now, you proceed accordingly.
        </p>
        <Callout type="rule" title="The First Domino">
          This answer is the small domino that is going to fall and help us knock down all of the bigger dominoes as we lead up to pain awareness. You have to identify the problem or goal here — and do so succinctly, no matter how long and drawn out their answer is.
        </Callout>
      </DocSection>

      <DocSection title="The Four Reasons They're Here">
        <p className="mb-4">After analyzing thousands of sales calls, a clear trend emerges. Invariably, prospects schedule calls because:</p>
        <div className="space-y-3">
          <div className="border-l-4 border-rose-400 pl-4 py-2">
            <h4 className="font-bold text-stone-900">Reacting to a Current Problem</h4>
            <p className="text-[14px] text-stone-600">They're frustrated by something happening right now and need it fixed.</p>
          </div>
          <div className="border-l-4 border-amber-400 pl-4 py-2">
            <h4 className="font-bold text-stone-900">Avoiding a Near-Term Problem</h4>
            <p className="text-[14px] text-stone-600">They see something coming and want to get ahead of it before it hits.</p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-2">
            <h4 className="font-bold text-stone-900">Getting Ahead of a Long-Term Problem</h4>
            <p className="text-[14px] text-stone-600">They're planning proactively to prevent future issues from materializing.</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-2">
            <h4 className="font-bold text-stone-900">Achieving a Goal</h4>
            <p className="text-[14px] text-stone-600">They want to reach a specific outcome — but there's probably a problem getting in their way, or they would have achieved it already.</p>
          </div>
        </div>
        <p className="mt-4 text-stone-600 italic">
          Why else would they be looking for a solution? Solutions exist to solve problems — problems that are keeping people from achieving their goals or outcomes. This is buyer's intent in action.
        </p>
      </DocSection>

      <DocSection title="Persona-Specific Objectives You'll Hear">
        <p className="mb-4">When TT prospects answer this question, their objective reveals both their persona and their urgency level. Here are the most common objectives by persona — and how to anchor each one to measurable outcomes:</p>
        
        <div className="space-y-5">
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">HR Director: Process &amp; Capacity</h4>
            <div className="space-y-3">
              <div className="bg-white/60 rounded p-3">
                <p className="text-sm font-medium text-stone-800">"We need to reduce our time-to-fill from 45 days to under 25."</p>
                <p className="text-[13px] text-stone-500 mt-1"><strong>Anchor response:</strong> "That's a meaningful target. What's driving the 45-day timeline right now — is it the screening process, hiring manager bottlenecks, or something else?"</p>
                <p className="text-[12px] text-stone-400 mt-1 italic">Measurable outcome: Lotus Bakeries achieved exactly this — going from 55 days to 23 days average time-to-hire.</p>
              </div>
              <div className="bg-white/60 rounded p-3">
                <p className="text-sm font-medium text-stone-800">"I'm drowning in manual screening. I can't keep up with the volume of applicants."</p>
                <p className="text-[13px] text-stone-500 mt-1"><strong>Anchor response:</strong> "How many applications are you processing per open role right now? And how many of those are actually qualified?"</p>
                <p className="text-[12px] text-stone-400 mt-1 italic">Measurable outcome: AI screening can process what takes hours manually. With 16M+ candidates AI-screened on our platform, we see teams reclaim 3x recruiter capacity.</p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">CEO / Founder: Growth &amp; Speed</h4>
            <div className="space-y-3">
              <div className="bg-white/60 rounded p-3">
                <p className="text-sm font-medium text-stone-800">"We're opening 3 new locations and need to hire 50 people in 90 days."</p>
                <p className="text-[13px] text-stone-500 mt-1"><strong>Anchor response:</strong> "That's an aggressive timeline. What's your current run rate for hiring — how many people are you bringing on per month right now?"</p>
                <p className="text-[12px] text-stone-400 mt-1 italic">This reveals the gap between where they are and where they need to be. If they're hiring 5/month and need 50 in 90 days, that's a 3x capacity gap.</p>
              </div>
              <div className="bg-white/60 rounded p-3">
                <p className="text-sm font-medium text-stone-800">"We just raised our Series B and need to double headcount this year."</p>
                <p className="text-[13px] text-stone-500 mt-1"><strong>Anchor response:</strong> "Congratulations. How many people is that in real numbers? And does your current recruiting process have the capacity to handle that volume?"</p>
                <p className="text-[12px] text-stone-400 mt-1 italic">Scale-up mode is high urgency. They have capital and pressure from investors to deploy it into growth. Time is literally money.</p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">TA Manager: Professionalization &amp; Control</h4>
            <div className="space-y-3">
              <div className="bg-white/60 rounded p-3">
                <p className="text-sm font-medium text-stone-800">"We need to stop using agencies for 80% of our hires and build a direct pipeline."</p>
                <p className="text-[13px] text-stone-500 mt-1"><strong>Anchor response:</strong> "What's driving that decision — is it the cost, the quality of candidates, or losing control of the process?"</p>
                <p className="text-[12px] text-stone-400 mt-1 italic">Measurable outcome: Reducing agency dependency by even 50% at $15-25K per agency hire creates an immediate and dramatic ROI case.</p>
              </div>
              <div className="bg-white/60 rounded p-3">
                <p className="text-sm font-medium text-stone-800">"I was hired to professionalize our recruiting function. Right now it's held together with spreadsheets and email."</p>
                <p className="text-[13px] text-stone-500 mt-1"><strong>Anchor response:</strong> "You said you were hired to professionalize it — what does success look like for you in this role over the next 6-12 months? What would need to be true?"</p>
                <p className="text-[12px] text-stone-400 mt-1 italic">This connects the objective to personal stakes. Their career success depends on solving this. See the Taking Leadership topic for more on personal stakes.</p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Office / Ops Manager: Simplification</h4>
            <div className="space-y-3">
              <div className="bg-white/60 rounded p-3">
                <p className="text-sm font-medium text-stone-800">"I'm handling HR, recruiting, office management, and I need something that doesn't require a full-time recruiter to operate."</p>
                <p className="text-[13px] text-stone-500 mt-1"><strong>Anchor response:</strong> "It sounds like recruiting is one of many hats you wear. How much of your week is currently eaten up by hiring-related tasks?"</p>
                <p className="text-[12px] text-stone-400 mt-1 italic">The Ops Manager persona values simplicity above all. They need something that works out of the box without extensive configuration or training.</p>
              </div>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="Connecting Objectives to Measurable Outcomes">
        <p className="mb-3">Once you have their objective, your job is to transform their vague goal into something measurable. This anchors urgency because measurable gaps are harder to ignore:</p>
        <ScriptBlock label="The Measurement Anchor Technique">
          Step 1: Repeat their objective back in one sentence.
          → "So the core issue is you need to cut time-to-fill in half."

          Step 2: Ask for the current number.
          → "Where are you today? What's your average time-to-fill right now?"

          Step 3: Ask for the target number.
          → "And where do you need to be?"

          Step 4: Ask why the gap exists.
          → "What's creating that gap between 45 days and 25 days? Where is time getting lost in the process?"

          Step 5: Connect to consequences (previews the Consequences step).
          → "And every day a role sits open beyond that target, what does that cost the business?"
        </ScriptBlock>
        <Callout type="rule" title="Don't Re-Teach the Cost Math">
          The cost-of-inaction calculation ($400-500/day per unfilled role) is covered in the Five Fatalities topic. Here, your goal is to get THEM to quantify the gap using THEIR numbers. Let them arrive at the pain — don't tell them what to feel.
        </Callout>
      </DocSection>

      <DocSection title="The Primary Question">
        <p>
          After getting alignment and agreement on the agenda, move right into it. This creates critical continuity in the buyer's journey — the transition from marketing to sales.
        </p>
        <ScriptBlock label="The Objective Question">
          "When people take time to hop on these calls with me, there's usually a problem they're trying to solve or a goal they're trying to achieve. Which is it for you?"
        </ScriptBlock>
        <Callout type="info" title="Why Consistency Matters">
          When you ask this same question over and over, you'll start hearing common patterns in the answers. If you've had 30 meetings that month and hear the same types of answers repeatedly, you'll anticipate where prospects are coming from. This makes them feel understood — which is critical to building influence and being seen as someone who has solved this problem before.
        </Callout>
      </DocSection>

      <DocSection title="The Three Waves (When They Don't Answer)">
        <p className="mb-4">
          Sometimes prospects won't give you a clear problem or goal. They'll deflect with "I just wanted to learn more" or "I'm just gathering information." That's when you use the three waves:
        </p>

        <div className="space-y-4">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Wave 1: The Initial Question</h4>
            <ScriptBlock label="First Attempt">
              "Typically, when I meet with people like you, they either have a problem they're trying to solve or a goal they're trying to achieve. Which is it for you?"
            </ScriptBlock>
          </div>

          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Wave 2: Push a Little Further</h4>
            <p className="text-[14px] text-stone-600 mb-2">
              If they deflect, pause for a moment, give them a slight look of disbelief, and push:
            </p>
            <ScriptBlock label="Second Attempt">
              "Really? There's no problem you're trying to get ahead of? No goal you're trying to achieve with your [area of focus]?"
            </ScriptBlock>
            <p className="text-[13px] text-stone-500 mt-2">
              This should feel almost unbelievable — because if they're being good stewards of their business, they should be thinking about these things.
            </p>
          </div>

          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Wave 3: The Last Resort</h4>
            <p className="text-[14px] text-stone-600 mb-2">
              Some prospects still resist because they don't want to feel sold to. Go direct and specific:
            </p>
            <ScriptBlock label="Third Attempt">
              "Can I ask then — why are you spending time researching solutions? Why are you looking to change anything?"
            </ScriptBlock>
            <p className="text-[13px] text-stone-500 mt-2">
              This will either crack open something they've been withholding, or you'll both align that there isn't a real driver — in which case, you can choose to move forward however you wish.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="TT-Specific Wave 2 &amp; 3 Scripts">
        <p className="mb-3">When a hiring/recruiting prospect deflects, use industry-specific pushes that reference common pain points they'll immediately recognize:</p>
        <ScriptBlock label="TT Wave 2: Industry-Specific Push">
          "Really? So your hiring process is running perfectly? Your hiring managers are happy with the speed they're getting candidates? You're not spending anything on agencies? Candidates aren't dropping off midway through your process?"

          (Pick 2-3 that are most relevant based on what you know about their company size and industry.)
        </ScriptBlock>
        <ScriptBlock label="TT Wave 3: The Direct Ask">
          "Let me ask it this way — when you were researching ATS platforms and decided to book this call, what were you hoping to see or learn that you don't already have?"

          (This reframes from 'what's your problem' to 'what were you searching for' — which feels less vulnerable and usually gets an answer.)
        </ScriptBlock>
      </DocSection>

      <DocSection title="After You Get the Objective">
        <p>
          Once you have their problem or goal, repeat it back to them succinctly. No matter how long their answer was, you need to boil it down to a clear, concise statement. Then immediately connect to the next question — decision makers.
        </p>
        <ScriptBlock label="The Transition to Decision Makers">
          Prospect: [gives a long answer about hiring challenges, turnover, missing targets]

          You: "So if I'm hearing you correctly, the core issue is that you're spending too much time manually screening candidates and it's slowing down your ability to fill critical roles. Is that right?"

          Prospect: "Yeah, exactly."

          You: "Got it. So who is ultimately responsible for solving this issue? And who will be making the decision on how it gets solved?"
        </ScriptBlock>
        <Callout type="success" title="The Connection Principle">
          Every question must stay connected to their objective. Think of it as a Venn diagram — if the questions and the objective stay connected, the conversation flows seamlessly. The moment you disconnect, you sound like you're running down a checklist rather than leading a diagnostic conversation.
        </Callout>
        <div className="flex justify-center mt-6">
          <svg width="360" height="180" viewBox="0 0 360 180">
            <circle cx="130" cy="90" r="80" fill="rgba(59,130,246,0.12)" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="230" cy="90" r="80" fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="2" />
            <text x="90" y="85" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3b82f6">Your</text>
            <text x="90" y="102" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3b82f6">Questions</text>
            <text x="270" y="85" textAnchor="middle" fontSize="13" fontWeight="700" fill="#10b981">Their</text>
            <text x="270" y="102" textAnchor="middle" fontSize="13" fontWeight="700" fill="#10b981">Objective</text>
            <text x="180" y="88" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1e293b">Seamless</text>
            <text x="180" y="105" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1e293b">Flow</text>
          </svg>
        </div>
      </DocSection>

      <DocSection title="Adjusting for Complexity">
        <Callout type="info" title="Time Investment Scales with Deal Size">
          The amount of time each question should take depends on the complexity of your solution and ultimately the price. For low-dollar solutions, move through faster. For more complex solutions, prospect answers will be longer and probing will take more time. We actually see conversion go up when clients with more complex solutions extend their call times. Remember: prospects WANT to spend time with you if you are helping THEM achieve the outcomes THEY are trying to achieve.
        </Callout>
      </DocSection>
    </div>
  );
}
