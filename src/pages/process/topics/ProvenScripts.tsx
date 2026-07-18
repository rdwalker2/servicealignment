import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function ProvenScripts() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="PROSPECTING"
        title="Proven Scripts & Call Intelligence"
        subtitle="Verbatim talk tracks pulled from transcribed Nooks calls that booked meetings. Study what actually converts — then use it."
      />

      <DocSection title="How to Use This Page">
        <p>
          The <strong>Three Waves</strong> pages teach you the framework. This page shows you <strong>what it sounds like in practice</strong> — real words from real calls by your teammates that actually set meetings.
        </p>
        <Callout type="info" title="Source Data">
          Extracted from 8,961 Nooks dials across the team. Primary sources: Nicolas Texier (35% booking rate, 5,936 dials), Chris Smith (HRIS wedge pioneer, 30+ transcribed calls), Anna Seethaler (ADP/Dayforce/Workday wedge), and Moe Aqel.
        </Callout>
      </DocSection>

      {/* --- NICOLAS TEXIER --- */}

      <DocSection title="Nicolas Texier's Full Opener — 35% Booking Rate">
        <Callout type="warning" title="Educational Pitch Exception">
          This script breaks "The Core Rule" (No Problem or Goal = No Meeting) because it ignores problem diagnosis. However, it is kept as an "Educational Pitch Exception" that works well for high-volume outreach in competitive markets where you just want to get on their radar.
        </Callout>
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/40 overflow-hidden mt-4">
          <div className="px-5 py-3 border-b border-emerald-100 bg-emerald-50">
            <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Nicolas Texier — 35% Booking Rate · 5,936 Dials</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Same script. Every. Single. Call. This consistency is what drives the rate.</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <ScriptBlock label="Step 1 — Intro">
{`"Hi [First Name], it's [Your Name] from Service Alignment, the applicant management
platform. Hope you're doing well."`}
            </ScriptBlock>
            <Callout type="info" title="Coaching Note">
              "Applicant management platform" not "Provider" — less triggering.
            </Callout>

            <ScriptBlock label="Step 2 — Validate Ownership">
{`"I wanted to make sure I have the right person — you handle the recruiting
tools and applicant management internally, correct?"`}
            </ScriptBlock>
            <Callout type="info" title="Coaching Note">
              Don't pitch a gatekeeper. Get the yes before you continue.
            </Callout>

            <ScriptBlock label="Step 3 — The Pitch (NEVER say 'demo')">
{`"The reason I'm reaching out is to show you the innovations in the HR space
during a short 15-20 minute call — no commitment. We've been the industry
leader for 13 years with 13,000+ clients. Just so you have the information
on hand whenever you want to compare."`}
            </ScriptBlock>
            <Callout type="info" title="Coaching Note">
              Key phrases: "innovations in the HR space" · "no commitment" · "so you have the information on hand" · "whenever you want to compare" — each word is intentional.
            </Callout>

            <ScriptBlock label="Step 4 — Binary Time Close">
{`"I have my calendar in front of me — do you have yours? Next week or the
week after? I can do [Tuesday] at [10] or [2] — what works better?"`}
            </ScriptBlock>
            <Callout type="info" title="Coaching Note">
              Two slots only. Never "when are you free?" Binary choice = faster decision.
            </Callout>
          </div>
        </div>
      </DocSection>

      <DocSection title="Nicolas's Show Rate Fix — 80% vs 50% Team Average">
        <p>Booking the meeting is only half the battle. <strong>Getting them to actually show up</strong> is the other half:</p>

        <ScriptBlock label="Send the Invite While on the Phone">
{`"Perfect — I'm going to send you the calendar invite right now. Can you
stay on for just 30 seconds while I pull that up? I want to make sure it
lands in your calendar before we hang up."`}
        </ScriptBlock>

        <Callout type="rule" title="This is Non-Negotiable">
          Send the calendar invite WHILE you're still on the phone. Have them accept it while you're still on. This single behavior accounts for the 30-point gap between Nicolas's show rate (80%) and the team average (50%).
        </Callout>

        <div className="grid grid-cols-3 gap-3 mt-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-center">
            <p className="text-[22px] font-black text-stone-900">80%</p>
            <p className="text-[12px] font-semibold text-stone-700">Nicolas Texier</p>
            <p className="text-[11px] font-bold mt-1 text-emerald-600">Sends invite on call</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-center">
            <p className="text-[22px] font-black text-stone-900">61%</p>
            <p className="text-[12px] font-semibold text-stone-700">Jack Luther</p>
            <p className="text-[11px] font-bold mt-1 text-amber-600">+11% vs target</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-center">
            <p className="text-[22px] font-black text-stone-900">50%</p>
            <p className="text-[12px] font-semibold text-stone-700">Team Average</p>
            <p className="text-[11px] font-bold mt-1 text-rose-600">Industry standard: 75-80%</p>
          </div>
        </div>
      </DocSection>

      {/* --- CHRIS SMITH HRIS WEDGE --- */}

      <DocSection title="Chris Smith's HRIS Wedge Plays">
        <p>The HRIS wedge exposes the gap between what their system does well (payroll, HR) and where it falls short (recruiting). Copy word-for-word — the softness of "a bit of an afterthought" is intentional.</p>

        <div className="rounded-xl border-2 border-blue-200 bg-blue-50/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-blue-100 bg-blue-50">
            <p className="text-[11px] font-black text-blue-800 uppercase tracking-widest">The HRIS Wedge — Core Script · Used on 30+ Calls</p>
          </div>
          <div className="px-5 py-4 space-y-4">
            <ScriptBlock label="ADP / Paycom / Paylocity Wedge">
{`"I hear [wonderful/phenomenal] things about [ADP/Paycom/Paylocity] from the
HR side of it. When it comes to the current provider side — I've
heard it can be seen as a bit of an afterthought. Just curious if that
resonates with you at all."`}
            </ScriptBlock>

            <ScriptBlock label="Workday Wedge">
{`"I've used Workday before from the employee side. I hear wonderful things
about it for time stamps, vacation, employee benefits. When it comes to
the recruiting side — I've heard it can be seen as a bit of an afterthought.
Do you feel that way at all?"`}
            </ScriptBlock>

            <ScriptBlock label="Dayforce / Ceridian Wedge">
{`"Typically I hear phenomenal things about Dayforce from the HRIS side.
Sometimes I hear when it comes to the current provider side — it
can be seen as a bit of an afterthought. Sometimes not the easiest system
to use. Just curious if that resonates with you at all."`}
            </ScriptBlock>

            <ScriptBlock label="Bridge + Reframe (after wedge lands)">
{`"So what companies do is use Service Alignment for the Provider — and once the
candidate gets hired, they kick right off into the HRIS as an employee.
We actually have a few customers using both. We have a direct
integration into [HRIS]. It takes 15-20 minutes to see how it works —
would it be worth a look?"`}
            </ScriptBlock>
          </div>
        </div>
      </DocSection>

      {/* --- REAL TRANSCRIPT EXCHANGES --- */}

      <DocSection title="Real Transcript Exchanges — What Converts">
        <p>These are <strong>real conversations</strong> from transcribed Nooks calls. Study the prospect's actual responses.</p>

        <div className="space-y-4 mt-2">
          {[
            {
              rep: 'Chris Smith',
              target: 'Kelsey — using Oracle',
              repLine: '"When it comes to the Provider side, it can be seen as a bit of an afterthought Kelsey. Just kind of curious if that resonates with you at all."',
              prospectLine: '"Yeah, it absolutely does. Our current provider sucks."',
              repFollow: null,
            },
            {
              rep: 'Chris Smith',
              target: 'Ryan — using Dayforce/Axiom',
              repLine: '"I hear really good things about Dayforce from an HRIS side. I hear when it comes to the current provider side, it can be seen as a bit of an afterthought."',
              prospectLine: '"I\'m not surprised to see you at all. Yeah, I would concur with that sentiment."',
              repFollow: null,
            },
            {
              rep: 'Chris Smith',
              target: 'Cody — using UltiPro',
              repLine: '"I hear wonderful things about UltiPro from the HR side of it. When it comes to the current provider side, I\'ve heard it can be seen as a bit of an afterthought. Just curious if that resonates with you at all."',
              prospectLine: '"A bit. It does the job, but it certainly doesn\'t have some of the functionality that dedicated Provider platforms would have."',
              repFollow: null,
            },
            {
              rep: 'Chris Smith',
              target: 'Joe — using Workday',
              repLine: '"I\'ve used Workday before just from like the employee side of it. And I hear wonderful things about it just for time stamps, for vacation, employee benefits. When it comes to the recruiting side, I\'ve heard it can be seen as a bit of an afterthought. Just kind of curious, do you feel that way at all?"',
              prospectLine: '"I think there\'s definitely some slight challenges with it."',
              repFollow: null,
            },
            {
              rep: 'Chris Smith',
              target: 'Matea — using SuccessFactors',
              repLine: '"We have a direct integration into the SuccessFactors portion. So when I talk to a lot of people, I often hear that when it comes to the Provider side of things that it can be seen as sometimes a bit of an afterthought. Just kind of wondering with SuccessFactors if you\'re finding that on your end at all."',
              prospectLine: '"We don\'t have a ton of integration... we don\'t have like integration with LinkedIn or Indeed directly."',
              repFollow: null,
            },
            {
              rep: 'Anna Seethaler',
              target: 'Ted — using ADP',
              repLine: '"I work with a lot of teams who also use ADP and they say that it\'s a good system overall but it\'s a bit lacking on the recruiting side, especially with searching and filtering for candidates, automation, reporting, and just creating a good candidate experience... Have you also noticed any limitations with ADP for recruiting?"',
              prospectLine: '"Horrendous."',
              repFollow: null,
            },
            {
              rep: 'Anna Seethaler',
              target: 'Prospect — using Workday',
              repLine: '"I guess I\'m curious to hear from you, like how has Workday recruiting been going?"',
              prospectLine: '"I mean, it\'s okay. I wouldn\'t say it\'s — it\'s middle of the road. It\'s not great, but it\'s not terrible."',
              repFollow: '"I know, like, I often hear that the reporting is a bit lacking. Do you run into that at all?" → "Yes."',
            },
            {
              rep: 'Anna Seethaler',
              target: 'Prospect — using Dayforce',
              repLine: '"I work with a lot of teams who just find that the Dayforce Provider isn\'t meeting their needs. So they move over to our system for recruiting... Have you had any conversations about the Provider not meeting your needs?"',
              prospectLine: '"It doesn\'t meet our needs, but we\'re not in the market to look for anything new right now."',
              repFollow: null,
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-stone-200 overflow-hidden">
              <div className="px-4 py-2 bg-stone-50 border-b border-stone-100 flex items-center gap-2">
                <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">{item.rep}</span>
                <span className="text-[10px] text-stone-400">→ {item.target}</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 text-[11px] font-bold mt-0.5 shrink-0 w-10">REP:</span>
                  <p className="text-[13px] text-stone-700 italic">{item.repLine}</p>
                </div>
                <div className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg">
                  <span className="text-emerald-500 text-[11px] font-bold mt-0.5 shrink-0 w-10">THEM:</span>
                  <p className="text-[13px] text-emerald-800 font-semibold">{item.prospectLine}</p>
                </div>
                {item.repFollow && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 text-[11px] font-bold mt-0.5 shrink-0 w-10">REP:</span>
                    <p className="text-[13px] text-stone-600 italic">{item.repFollow}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* --- MAGIC WAND --- */}

      <DocSection title="The Magic Wand Technique — Chris Smith">
        <p>When the wedge lands but they're not articulating specific pain, use the <strong>magic wand question</strong> to surface what they wish was different:</p>

        <ScriptBlock label="Magic Wand Question">
{`"What if you had a magic wand, what would you want to see with
[their system] — like what improvement would you like to see?"`}
        </ScriptBlock>

        <div className="rounded-lg border border-blue-200 overflow-hidden mt-2">
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Chris Smith → Prospect using UKG</span>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 text-[11px] font-bold mt-0.5 shrink-0 w-10">REP:</span>
              <p className="text-[13px] text-stone-700 italic">"What if you had a magic wand, what would you want to see with UKG — like what improvement would you like to see on the system?"</p>
            </div>
            <div className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg">
              <span className="text-emerald-500 text-[11px] font-bold mt-0.5 shrink-0 w-10">THEM:</span>
              <p className="text-[13px] text-emerald-800 font-semibold">"We need workflows with the system... we don't have a way to like create or start requisitions from a management perspective."</p>
            </div>
          </div>
        </div>

        <Callout type="info" title="Why This Works">
          The "magic wand" question bypasses defensiveness. They're not admitting a problem — they're describing a wish. But that wish IS the problem. Now you have ammunition for the meeting.
        </Callout>
      </DocSection>

      {/* --- RECOVERY TECHNIQUES --- */}

      <DocSection title="Recovery Techniques After 'No'">
        <p>Proven reframe techniques from transcribed calls showing how top reps recover after a hard "no."</p>

        <div className="space-y-3 mt-2">
          <div className="rounded-lg border border-blue-200 overflow-hidden">
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Chris Smith — The Soft Probe</span>
              <span className="text-[10px] text-stone-400 ml-2">After prospect says Dayforce "works quite well"</span>
            </div>
            <div className="p-4">
              <p className="text-[13px] text-stone-700 italic">"Is there anything that — maybe not a pain point — but something where if Dayforce could just do this one thing, it would make your life a little easier?"</p>
              <p className="text-[11px] text-stone-400 italic mt-2">Lowers the bar from "pain point" to "wish." Much easier for them to say yes to.</p>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 overflow-hidden">
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Chris Smith — The Future Seed</span>
              <span className="text-[10px] text-stone-400 ml-2">After "we're not in a position to make a change"</span>
            </div>
            <div className="p-4">
              <p className="text-[13px] text-stone-700 italic">"Most people I talked to say exactly what you say, hey, we're not in a position to make a change right now... Sometimes I show people Service Alignment and they call me back in like a year or two... Let's just say in a year from today, you are in a position to change — it's like, oh, I saw Service Alignment that actually looked pretty cool, solving A, B and C."</p>
              <p className="text-[11px] text-stone-400 italic mt-2">Validates their position, then plants a mental bookmark for the future. No pressure.</p>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 overflow-hidden">
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Chris Smith — Educational Reframe</span>
              <span className="text-[10px] text-stone-400 ml-2">After "we're okay"</span>
            </div>
            <div className="p-4">
              <p className="text-[13px] text-stone-700 italic">"If you're ever curious to see what else is in the market, especially from things like an AI perspective, ease of use, and employer branding — I show a little what Service Alignment looks like and just to really get some honest feedback on it. See if there's potentially anything we could do to complement current processes. If not, then well, it just solidifies how well your system is working for you compared to everybody else."</p>
              <p className="text-[11px] text-stone-400 italic mt-2">Two-outcome framing: either we help, or you confirm you're in great shape. No downside.</p>
            </div>
          </div>

          <div className="rounded-lg border border-violet-200 overflow-hidden">
            <div className="px-4 py-2 bg-violet-50 border-b border-violet-100">
              <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest">Anna Seethaler — Cost Savings Reframe</span>
              <span className="text-[10px] text-stone-400 ml-2">After "not in the market" (Dayforce prospect)</span>
            </div>
            <div className="p-4">
              <p className="text-[13px] text-stone-700 italic">"I actually have worked with a lot of teams who have found our Provider is more cost effective than the Dayforce Provider plus it offers a lot more functionality. So if it would be a cost savings and it would offer your team a lot more recruiting capability, would that be something worth looking into just for like a brief 15 minute intro call?"</p>
              <p className="text-[11px] text-stone-400 italic mt-2">Reframes from "switch" to "save money + get more." Hard to say no to saving money.</p>
            </div>
          </div>

          <div className="rounded-lg border border-violet-200 overflow-hidden">
            <div className="px-4 py-2 bg-violet-50 border-b border-violet-100">
              <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest">Anna Seethaler — 2027 Evaluation Framing</span>
              <span className="text-[10px] text-stone-400 ml-2">After "not until next year"</span>
            </div>
            <div className="p-4">
              <p className="text-[13px] text-stone-700 italic">"Most people I'm speaking with, they are doing evaluations now for a switch for 2027. So could it be worth just like a quick intro call so you can see if it's something you want to explore for next year?"</p>
              <p className="text-[11px] text-stone-400 italic mt-2">Social proof + removes urgency. Everyone else is doing evaluations now. You should too.</p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 overflow-hidden">
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Moe Aqel — Passive Education</span>
              <span className="text-[10px] text-stone-400 ml-2">After prospect says "not aggressively making a change"</span>
            </div>
            <div className="p-4">
              <p className="text-[13px] text-stone-700 italic">"We could keep this conversation like educational and keep it passive right now since you guys don't aggressively making a change. But that way you know what's out there. You could see Service Alignment, whether you like it or not."</p>
              <p className="text-[11px] text-stone-400 italic mt-2">Mirrors their language ("not aggressively") and removes all pressure. Pure education.</p>
            </div>
          </div>
        </div>
      </DocSection>

      {/* --- OBJECTION HANDLING --- */}

      <DocSection title="Objection → Response Playbook">
        <p>Real objection→response pairs from calls that led to meetings. Organized by persona.</p>

        <div className="space-y-3 mt-2">
          {[
            {
              persona: 'HR Director',
              objection: '"We don\'t have the budget for anything right now."',
              response: '"Totally get it. So when a key role stays open 45+ days, how does that affect your team\'s productivity and morale?"',
              note: 'Rhetorical — let them feel the cost of indecision.',
            },
            {
              persona: 'HR Director',
              objection: '"We\'re good. Everything\'s fine right now."',
              response: '"Have you ever had a strong candidate accept another offer because your process moved too slow?"',
              note: 'Yes/No rhetorical — most HR leaders have felt this.',
            },
            {
              persona: 'TA Manager',
              objection: '"We don\'t have the budget right now."',
              response: '"I get it. If your recruiters are spending a big chunk of their day on manual tasks instead of talking to candidates, does that hurt your fill rate?"',
              note: 'Connects time waste to business impact.',
            },
            {
              persona: 'TA Manager',
              objection: '"We\'re good. Everything\'s running fine."',
              response: '"Good to hear. Are your recruiters sourcing passive candidates, or mostly just screening inbound applicants?"',
              note: 'Reveals if they\'re truly proactive or reactive.',
            },
            {
              persona: 'CEO / Founder',
              objection: '"We don\'t have the budget."',
              response: '"Totally. What\'s it costing you to have that open role sit unfilled for another month — in lost revenue, team burnout, or customers waiting?"',
              note: 'Forces them to calculate the cost of indecision themselves.',
            },
            {
              persona: 'CEO / Founder',
              objection: '"We\'re fine. HR handles it."',
              response: '"Makes sense. Are they set up with the right tools to hire at the pace your business actually needs right now?"',
              note: 'Doesn\'t challenge delegation — questions whether they\'re equipped.',
            },
            {
              persona: 'Ops / Office Mgr',
              objection: '"We\'re good. We use spreadsheets / email."',
              response: '"Got it. Have you ever had a great candidate fall through the cracks because of slow follow-up or miscommunication between the hiring manager and you?"',
              note: 'Very relatable for coordinators.',
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-stone-200 overflow-hidden">
              <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{item.persona}</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 text-[12px] font-bold mt-0.5 shrink-0">THEM:</span>
                  <p className="text-[13px] text-stone-700 italic">{item.objection}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 text-[12px] font-bold mt-0.5 shrink-0">YOU:</span>
                  <p className="text-[13px] text-stone-800 font-medium">{item.response}</p>
                </div>
                <p className="text-[11px] text-stone-400 italic border-t border-stone-100 pt-2 mt-2">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* --- COLD CALL OBJECTIONS --- */}

      <DocSection title="Cold Call Objection Scripts">
        <ScriptBlock label={`"We're happy with what we have"`}>
{`"That's great. Out of curiosity — are you on the recruiting side or more HRIS
and payroll? Because sometimes when I hear 'happy,' the recruiter has a
totally different take than the HR manager. Which perspective are you coming
from?"`}
        </ScriptBlock>

        <ScriptBlock label={`"Not a good time, we just implemented something"`}>
{`"Completely get it — implementations are brutal. How long ago did you go
live? I ask because there's usually a 6-month window where teams realize
what the new system can't do. Just want to plant a flag in case that
happens."`}
        </ScriptBlock>

        <ScriptBlock label={`"We're not looking at this until next year"`}>
{`"Makes total sense. When you do get there — would it be more of a
rip-and-replace of everything, or are you thinking about separating the
HRIS from the Provider? That usually shapes which direction is the right move."`}
        </ScriptBlock>

        <ScriptBlock label={`"Send me an email"`}>
{`"Absolutely, I'll send it right now. While I have you — what's the one thing
you wish your current Provider did better? I'll make sure whatever I send is
actually relevant to you."`}
        </ScriptBlock>

        <ScriptBlock label={`"We use ADP / Paycom / BambooHR for everything"`}>
{`"Totally — and we work alongside those systems, not instead of them. Most
teams keep [HRIS] for payroll and HR records and just replace the recruiting
piece. We actually have a native integration. Would it be worth 20 minutes
to see what that looks like?"`}
        </ScriptBlock>

        <ScriptBlock label={`"We already evaluated you and went with someone else"`}>
{`"I appreciate you being straight with me. Just so I understand — was it a
feature gap, price, or timing that drove the decision? I want to make sure
if we reconnect down the road it's actually worth your time."`}
        </ScriptBlock>
      </DocSection>

      {/* --- PROVEN CLOSES --- */}

      <DocSection title="Proven Close Techniques — Chris Smith">
        <ScriptBlock label="Side-by-Side Comparison Close">
{`"I'd love to show you a little what Service Alignment looks like, especially from
the collaboration and the filtering resumes and just get your opinion on
it. Do you think we can complement some of your current processes?"`}
        </ScriptBlock>
        <Callout type="info" title="Coaching Note">
          "Get your opinion" + "complement" = no threat. They're just looking, not buying.
        </Callout>

        <ScriptBlock label="No-Pressure Two-Outcome Close">
{`"This isn't going to be something where I'm going to just immediately have
a call with you and then get a contract in front of you. Typically what I do
is I share my screen with you, show you what Service Alignment looks like. You could
look at me and say, this isn't going to work for me at all — and there
wouldn't even need to waste time to talk to a decision maker."`}
        </ScriptBlock>
        <Callout type="info" title="Coaching Note">
          Pre-disqualifies the pitch. "You can say no and we're done." Removes all fear of commitment.
        </Callout>

        <ScriptBlock label="20-Minute Educational Close">
{`"Would you maybe later this week or early next week have like 20 minutes?
I'll share my screen with you, show you Service Alignment looks like just to get
your feedback. If you think this could help with your headaches, we continue
the conversation. If not, we just part ways as friends."`}
        </ScriptBlock>
        <Callout type="info" title="Coaching Note">
          "Part ways as friends" — the easiest yes in cold calling. Zero risk, zero commitment.
        </Callout>
      </DocSection>

      {/* --- PER-PERSONA CLOSES --- */}

      <DocSection title="Per-Persona Meeting Closes">
        <ScriptBlock label="Close — HR Director">
{`"Why don't I put together a quick look at where your biggest hiring
bottlenecks are? 20 minutes — if it's not valuable, I'll be the first
to tell you. Deal?"`}
        </ScriptBlock>

        <ScriptBlock label="Close — TA Manager">
{`"Let me show you how TA teams at your scale are cutting time-to-fill
by 30%+. 20 minutes, very focused. I'll send a calendar invite — deal?"`}
        </ScriptBlock>

        <ScriptBlock label="Close — CEO / Founder (SMB)">
{`"Let me show you how companies your size are cutting time-to-hire in
half without adding headcount. Very quick, very specific to your
situation. I'll send a calendar invite."`}
        </ScriptBlock>

        <ScriptBlock label="Close — Ops / Office Manager">
{`"Why don't I show you how other companies your size keep the whole
process in one place — managers, candidates, feedback, all of it.
20 minutes, I'll show you your most chaotic role first. I'll send
a calendar invite."`}
        </ScriptBlock>
      </DocSection>

      {/* --- HRIS INTEGRATION REFERENCE --- */}

      <DocSection title="HRIS Integration Quick Reference">
        <p>Know which wedge angle to use based on their HRIS:</p>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b-2 border-stone-300">
                <th className="text-left py-2 px-3 font-bold text-stone-700">HRIS</th>
                <th className="text-left py-2 px-3 font-bold text-stone-700">Wedge Angle</th>
                <th className="text-center py-2 px-3 font-bold text-stone-700">Integration</th>
              </tr>
            </thead>
            <tbody className="text-stone-600">
              {[
                { hris: 'ADP Workforce Now', angle: 'ADP Marketplace partner — keep ADP for payroll, replace Provider', integration: '✅ Native' },
                { hris: 'Paylocity', angle: 'Provider is their biggest weak point. Keep payroll, replace Provider.', integration: '✅ API' },
                { hris: 'BambooHR', angle: 'Recruiting was acquired and never rebuilt. Keep HR — replace recruiting.', integration: '✅ API' },
                { hris: 'Rippling', angle: 'Excellent for HRIS/payroll. Provider is an add-on module, not their focus.', integration: '✅ API' },
                { hris: 'Gusto', angle: 'Payroll-first. Their Provider is basic. Easy integration with TT.', integration: '✅ Native' },
                { hris: 'Workday', angle: 'Enterprise HRIS. Provider is functional but clunky — "afterthought" resonates.', integration: '✅ API' },
                { hris: 'Dayforce / Ceridian', angle: 'HRIS-first with bolted-on Provider. Same wedge play applies.', integration: '✅ API' },
                { hris: 'UKG', angle: 'HRIS-first. Recruiting module is cumbersome. Use "cumbersome" not "afterthought."', integration: '✅ API' },
                { hris: 'isolved / Paycom / Paycor', angle: 'All HRIS-first platforms with bolted-on Provider.', integration: '✅ API' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="py-2 px-3 font-semibold text-stone-800">{row.hris}</td>
                  <td className="py-2 px-3">{row.angle}</td>
                  <td className="py-2 px-3 text-center">{row.integration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="Pain-Forward Alternative — Nicolas">
        <p>When the standard opener gets a quick brush-off, pivot immediately to specific pain points:</p>

        <ScriptBlock label="Pain-Forward Alternative">
{`"I hear you. Quick question before I let you go — are you dealing with
anything specific around time-to-hire, show rates, or getting hiring managers
to actually engage with candidates?"`}
        </ScriptBlock>
        <Callout type="info" title="Coaching Note">
          More specific = more likely to land. Tailor to what you know about their company size.
        </Callout>
      </DocSection>
    </div>
  );
}
