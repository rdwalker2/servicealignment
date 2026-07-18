import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function ThreeWavesWave2() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="WAVE 2"
        title="Future Problems & Goals"
        subtitle="They said no to Wave 1. Now act slightly surprised and shift the timeframe forward. This is where the pause happens."
      />

      <DocSection title="The Surprise Pivot">
        <p>
          They said "Nope, we're good." Most reps give up here. <strong>Not us.</strong> Now we act <em>slightly</em> surprised — not dramatically, not sarcastically — and shift the conversation from <strong>current state</strong> to <strong>future state</strong>.
        </p>
        <Callout type="warning" title="Subtle Act — Not Genuine Surprise">
          The surprise in Wave 2 is a <strong>subtle act</strong>. If you sound truly caught off guard, you lose authority and trust. You're a professional who's done this hundreds of times — you expected something different based on your experience, and you're gently expressing that. Think "curious disbelief" not "shock."
        </Callout>
      </DocSection>

      <DocSection title="The Dual-Track Shift">
        <p>Same two dimensions — problems and goals — but now we're asking about the <strong>future</strong>:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="border border-rose-200 p-4 rounded-lg bg-rose-50/30">
            <h4 className="font-bold text-rose-900 mb-1 text-[14px]">🔴 Future Problems</h4>
            <p className="text-[13px] text-rose-800 italic">
              "Any future problems you're worried about?"
            </p>
          </div>
          <div className="border border-sky-200 p-4 rounded-lg bg-sky-50/30">
            <h4 className="font-bold text-sky-900 mb-1 text-[14px]">🔵 Long-Term Goals</h4>
            <p className="text-[13px] text-sky-800 italic">
              "Any long-term goals you're trying to achieve?"
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Universal Framework">
        <ScriptBlock label="Generic Framework">
{`"Really? So there aren't any future problems you're worried about
with [the asset/system/process], or long-term goals you're trying
to achieve with it?"`}
        </ScriptBlock>

        <Callout type="info" title="The Key Word: 'Really?'">
          The word "Really?" is doing heavy lifting. Said with genuine curiosity, it signals that their answer surprises you based on what you see across the market. This forces them to reconsider rather than reflexively brush you off.
        </Callout>
      </DocSection>

      <DocSection title="Teamtailor-Specific Talk Track — By Persona">
        <p>Here's how Wave 2 sounds after they've brushed off your Wave 1. Each is tuned to the persona you're calling:</p>

        <ScriptBlock label="Wave 2 — Standard ATS (Any Persona)">
{`"Really? So you're not running into anything around show rates being lower
than you'd like, or hiring managers not reviewing candidates quickly enough?
Because those are the two things I hear about most from teams your size."`}
        </ScriptBlock>
        <p className="text-[12px] text-stone-500 italic">Two specific pain points → forces them to actually think about it rather than just reflexively say "we're good."</p>

        <ScriptBlock label="Wave 2 — Competitive Angle (when you know their ATS)">
{`"Interesting. So you're on [Competitor] and you're not finding the candidate
experience — like the career page or mobile apply flow — to be a bottleneck?
Most teams I work with on [Competitor] eventually hit a wall there."`}
        </ScriptBlock>
        <p className="text-[12px] text-stone-500 italic">Name the competitor if you know it. Specificity creates credibility.</p>

        <ScriptBlock label="Wave 2 — Future Risk (CEO / Growth Companies)">
{`"Got it. No concerns about scaling the hiring process as you grow, or getting
better data on where candidates are dropping off in the funnel? That's where
I usually see teams realize they need something more purpose-built."`}
        </ScriptBlock>
        <p className="text-[12px] text-stone-500 italic">"As you grow" plants the seed even if they're not growing today.</p>
      </DocSection>

      <DocSection title="The Pause Is Gold">
        <p>
          This is where you start to hear them go: <em>"Um… I'm not sure."</em> That <strong>pause</strong> — that's because they're not used to getting that second wave. They're not trained on how to respond to it.
        </p>
        <div className="mt-4 p-5 bg-violet-50 rounded-lg border border-violet-200">
          <p className="text-[13px] font-bold text-violet-900 mb-3">What the Pause Means</p>
          <div className="space-y-2 text-[14px] text-violet-800">
            <p>• They already answered "no" once — now they have to think harder</p>
            <p>• Their initial response was a reflex, not a decision</p>
            <p>• They're actually considering it for the first time in the conversation</p>
            <p>• <strong>2-3 more prospects will open up here</strong> compared to Wave 1 alone</p>
          </div>
        </div>

        <Callout type="success" title="If They Open Up">
          The moment you hear hesitation or a real concern surface — stop the waves. You're now in a discovery conversation. Ask "Tell me more about that…" and stay curious. Don't rush to pitch.
        </Callout>
      </DocSection>

      <DocSection title="Cumulative Impact">
        <p>Let's say you call 20 prospects:</p>
        <div className="mt-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <div className="space-y-2 text-[14px]">
            <div className="flex items-center gap-3">
              <span className="w-20 text-right font-bold text-blue-600">Wave 1:</span>
              <span>~1 person bites (existing problem/goal)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-right font-bold text-violet-600">Wave 2:</span>
              <span>~2-3 more open up (future concerns/goals)</span>
            </div>
            <div className="flex items-center gap-3 border-t border-stone-200 pt-2 mt-2">
              <span className="w-20 text-right font-bold text-stone-800">Running:</span>
              <span><strong>3-4 out of 20</strong> — but we still have Wave 3 for the rest</span>
            </div>
          </div>
        </div>
      </DocSection>
    </div>
  );
}
