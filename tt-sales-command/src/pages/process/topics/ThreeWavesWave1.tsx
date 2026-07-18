import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function ThreeWavesWave1() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="WAVE 1"
        title="Existing Problems & Goals"
        subtitle="The direct ask. Most will say no — that's expected. You still ask because 1 in 10 to 20 will say 'actually, yeah.'"
      />

      <DocSection title="The Dual-Track Ask">
        <p>
          Wave 1 is your foundational question. You've gotten to the point of contact — the facility manager, the HR director, the person who owns the process. Now ask about <strong>both dimensions</strong>:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="border border-rose-200 p-4 rounded-lg bg-rose-50/30">
            <h4 className="font-bold text-rose-900 mb-1 text-[14px]">🔴 Problems Track</h4>
            <p className="text-[13px] text-rose-800 italic">
              "Any existing problems you need help with?"
            </p>
          </div>
          <div className="border border-sky-200 p-4 rounded-lg bg-sky-50/30">
            <h4 className="font-bold text-sky-900 mb-1 text-[14px]">🔵 Goals Track</h4>
            <p className="text-[13px] text-sky-800 italic">
              "Any existing goals you haven't been able to achieve?"
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Universal Framework">
        <p>This framework works for <strong>any product or service</strong>. Adapt the subject matter but keep the dual-track structure identical:</p>

        <ScriptBlock label="Generic Framework">
{`"Do you have a couple of minutes to sit down and talk about [the asset/system/process]?
Any existing goals or problems you have?"`}
        </ScriptBlock>

        <Callout type="info" title="For Teamtailor">
          Replace [the asset/system/process] with: your hiring process, your recruiting stack, your ATS, your candidate experience, your career page. The dual-track structure (problems + goals) stays the same every time.
        </Callout>
      </DocSection>

      <DocSection title="Teamtailor-Specific Talk Track — By Persona">
        <p>Here's how Wave 1 sounds when selling Teamtailor's ATS, broken down by who you're calling:</p>

        <ScriptBlock label="Wave 1 — HR Director">
{`"Wanted to see if you're dealing with any hiring bottlenecks that are keeping you
from hitting your headcount goals — or if you have any big talent initiatives
coming up this quarter..."`}
        </ScriptBlock>

        <ScriptBlock label="Wave 1 — TA Manager">
{`"Wanted to see if your recruiting team is dealing with any bottlenecks slowing
down time-to-fill — or if you have any goals around improving your process or
candidate experience..."`}
        </ScriptBlock>

        <ScriptBlock label="Wave 1 — CEO / Founder (SMB)">
{`"Wanted to see if hiring is keeping you from growing as fast as you want to —
are there any open roles right now that are slowing your team down or holding
back a key initiative?"`}
        </ScriptBlock>

        <ScriptBlock label="Wave 1 — Ops / Office Manager">
{`"Wanted to see if you're dealing with any headaches around coordinating the
hiring process — like keeping track of candidates, getting feedback from
managers, or just keeping things organized when you're filling multiple roles..."`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Expected Response">
        <div className="flex gap-3 flex-wrap">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            ⚡ ~90% will say "Nope, we're good"
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            🎯 ~5-10% will say "Actually, yeah…"
          </span>
        </div>

        <Callout type="warning" title="We Already Know They'll Say No">
          If they had a problem, they probably would've already called somebody. If they had a goal they needed help with, they'd be working on it. We're gonna get maybe 1 out of 10 or 1 out of 20 to say "yeah, actually we do." The vast majority will say "Nope, I'm good." That's fine — we expect this. We have Wave 2 ready to go.
        </Callout>
      </DocSection>

      <DocSection title="If They Bite on Wave 1">
        <Callout type="success" title="Stop the Waves — You're In">
          If someone actually says "yeah, we do have something" — stop the wave framework immediately. You've found pain or a goal. Transition into a real conversation. Ask: "Tell me more about that…" Stay curious. Don't rush to pitch.
        </Callout>
      </DocSection>
    </div>
  );
}
