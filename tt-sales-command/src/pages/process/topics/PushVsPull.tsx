import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function PushVsPull() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="Push vs. Pull Psychology" 
        subtitle="Why your willingness to walk away is the most powerful tool in your arsenal." 
      />

      <DocSection title="The Fundamental Principle">
        <p>
          Anytime you try to <strong>pull</strong> someone toward you, their natural psychological reaction is to <strong>push</strong> you away. This happens the vast majority of the time. Likewise, if someone is trying to pull you toward them, your instinct is to push away to create space.
        </p>
        <p className="mt-3">
          This isn't a sales trick — it's fundamental human psychology. And most salespeople are working directly against it.
        </p>
        <Callout type="rule" title="The Push-Pull Law">
          Your ability to discover and disqualify — to push prospects away — naturally causes them to pull you toward them. That's what you want.
        </Callout>
      </DocSection>

      <DocSection title="What Most Reps Do Wrong">
        <p>
          Most salespeople try to court their prospects, pulling them in at every opportunity. "Let me show you this feature!" "We have the best solution!" "Let me send you a proposal!" This constant pulling creates an immediate reaction for the prospect to push away.
        </p>
        <p className="mt-3">
          <strong>We create our own problems</strong> by the way we run our process — or by the lack of process altogether — which results in a flawed sales journey and experience.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">❌ Pulling (Courting)</h4>
            <ul className="text-[14px] text-stone-600 space-y-1">
              <li>• "Let me tell you why we're amazing"</li>
              <li>• Chasing prospects who go dark</li>
              <li>• Pitching before diagnosing</li>
              <li>• Refusing to let any deal go</li>
              <li>• Urgency tactics about your pricing</li>
            </ul>
            <p className="text-[13px] text-rose-600 mt-2 font-medium">Result: Prospect pushes you away</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">✅ Pushing (Qualifying)</h4>
            <ul className="text-[14px] text-stone-600 space-y-1">
              <li>• "Is this really a priority right now?"</li>
              <li>• Disqualifying bad-fit prospects</li>
              <li>• Diagnosing before prescribing</li>
              <li>• Walking away from weak deals</li>
              <li>• Honest assessment of their situation</li>
            </ul>
            <p className="text-[13px] text-emerald-600 mt-2 font-medium">Result: Prospect pulls you in</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Discover & Disqualify Across the Three Checkpoints">
        <p>
          When we talk about discovering and disqualifying across the three checkpoints, understand that you're actually helping yourself by pushing prospects away. The outcome is always positive:
        </p>
        <div className="space-y-3 mt-4">
          <div className="border-l-4 border-amber-400 pl-4 py-2">
            <h4 className="font-bold text-stone-900">Outcome A: Clean Pipeline</h4>
            <p className="text-[14px] text-stone-600">If they truly don't qualify, you've saved yourself weeks of wasted effort. Your pipeline stays accurate and your projections become reliable.</p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-2">
            <h4 className="font-bold text-stone-900">Outcome B: Prospect Opens Up</h4>
            <p className="text-[14px] text-stone-600">The push makes them pull — they share the real information they were originally withholding because they didn't want to be sold to.</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Why Prospects Withhold Information">
        <p>
          A lot of times, prospects are in pain, but they don't want to tell you because they're afraid of being sold to or manipulated. The typical seller's approach — pulling, courting, pitching — validates this fear.
        </p>
        <p className="mt-3">
          But when you keep them at bay and qualify against the checkpoints, something shifts. They realize you're not trying to sell them — you're trying to help them figure out if there's even a problem worth solving.
        </p>
        <ScriptBlock label="The Push-Away That Pulls Them In">
          "Hey, to be honest, based on what you've told me so far, this doesn't seem like it's causing a big enough problem to prioritize right now. Should we just check in again in 30 or 60 days and see if this has gotten worse?"
        </ScriptBlock>
        <Callout type="success" title="What Happens Next">
          This approach is far more likely to get them to open up and say: "Actually, here's what's really going on..." and give you the real information. The willingness to walk away is what earns you the right to stay.
        </Callout>
      </DocSection>

      <DocSection title="Push vs. Pull in Action: Selling Teamtailor">
        <p>Here's exactly how push-pull psychology works in a real Teamtailor conversation:</p>

        <ScriptBlock label="The TT Push Script">
{"Based on what you've told me, it sounds like your current system is handling things okay. I don't want to waste your time — should we just check back in next quarter?"}
        </ScriptBlock>

        <Callout type="success" title="What Prospects Actually Say When Pushed Away">
          When you push, they pull. Here are real responses from TT prospects:
        </Callout>

        <div className="space-y-3 mt-2">
          <div className="border-l-4 border-emerald-400 pl-4 py-2 bg-emerald-50/30 rounded-r-lg">
            <p className="text-[14px] text-stone-700 italic">"Actually, we ARE losing candidates because our career page looks terrible on mobile..."</p>
            <p className="text-[12px] text-stone-500 mt-1">→ Opens the door to: Career site conversion, employer brand, mobile experience</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-2 bg-emerald-50/30 rounded-r-lg">
            <p className="text-[14px] text-stone-700 italic">"Well, our hiring managers never actually log into the ATS..."</p>
            <p className="text-[12px] text-stone-500 mt-1">→ Opens the door to: HM adoption, collaborative hiring, Octavo's 100% adoption story</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-2 bg-emerald-50/30 rounded-r-lg">
            <p className="text-[14px] text-stone-700 italic">"Honestly, we're spending $50K a year on agencies and our CEO is frustrated..."</p>
            <p className="text-[12px] text-stone-500 mt-1">→ Opens the door to: ROI math, agency dependency, direct sourcing with TT</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Push-Pull in Objection Handling">
        <p>The most powerful application of push-pull is when a prospect says <strong>"we're all set."</strong> Instead of fighting it, use it:</p>

        <ScriptBlock label="The 'All Set' Counter-Push">
{"That's great to hear. Most companies I talk to who are all set usually have three things dialed in:\n\n1. A career page that converts well on mobile\n2. Hiring managers who actually use the ATS daily\n3. They've eliminated agency dependency\n\nIs that where you are?"}
        </ScriptBlock>

        <Callout type="info" title="Why This Works">
          If they hesitate on ANY of those three, you've created a pull. You didn't argue. You didn't pitch. You simply described what "all set" actually looks like — and let them self-assess. Most prospects realize they're NOT all set when confronted with the specifics.
        </Callout>
      </DocSection>

      <DocSection title="The Pipeline Effect">
        <p>
          One of the biggest issues impacting your lead generation is a mismanaged pipeline. When you refuse to disqualify, you create a lack of clarity about where you sit against your quota. This reduces the urgency to prospect, which means fewer connections during peak time.
        </p>
        <Callout type="warning" title="The Hidden Cost of Pulling">
          Every hour you spend chasing an unqualified prospect is an hour you're NOT spending finding the next great-fit buyer. Push-pull psychology isn't just about converting the deal in front of you — it's about protecting your entire quarter.
        </Callout>
        <p className="mt-3">
          We often do ourselves a disservice by running a flawed or nonexistent process. If we clean this up, you'll see unbelievable improvements in your results, your prospects' reactions, and their overall engagement with you.
        </p>
      </DocSection>
    </div>
  );
}
