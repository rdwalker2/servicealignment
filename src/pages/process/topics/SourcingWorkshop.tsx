import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';
import { Search, Users, Code, Link, Mail, Target, MessageCircle } from 'lucide-react';

export default function SourcingWorkshop() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32 space-y-12">
      <DocHeader 
        title="Sourcing Workshop" 
        subtitle="Advanced tactics for building a proactive, high-quality talent pipeline." 
      />

      <DocSection title="The Proactive Shift">
        <p className="text-lg text-stone-700 leading-relaxed mb-4">
          Relying solely on inbound applications (Post & Pray) is no longer a viable talent strategy. To hire top performers, you must proactively hunt them where they live. 
        </p>
        <p className="text-stone-600">
          This workshop covers advanced sourcing frameworks. Sourcing is a numbers game, but it's a <strong>targeted</strong> numbers game. High-quality boolean searches combined with hyper-personalized outreach will always beat mass-messaging.
        </p>
      </DocSection>

      <DocSection title="1. Advanced Boolean & X-Ray Search">
        <p className="mb-4 text-stone-600">Stop relying entirely on LinkedIn's basic search filters. Master Boolean logic to unearth hidden candidates across the web.</p>
        
        <div className="space-y-6">
          <div className="bg-stone-900 rounded-xl p-6 text-stone-300 font-mono text-sm shadow-xl">
            <div className="flex items-center gap-2 text-stone-500 mb-4 pb-4 border-b border-stone-800">
              <Code size={16} /> <span className="uppercase tracking-widest font-bold text-[10px]">The Operators</span>
            </div>
            <ul className="space-y-3">
              <li><strong className="text-[#FF2A7F]">AND</strong> : Narrows search (must include both). E.g., <span className="text-sky-300">Developer AND React</span></li>
              <li><strong className="text-[#FF2A7F]">OR</strong> : Broadens search (either/or). E.g., <span className="text-sky-300">(Developer OR Engineer)</span></li>
              <li><strong className="text-[#FF2A7F]">NOT / -</strong> : Excludes terms. E.g., <span className="text-sky-300">-Manager -Director</span></li>
              <li><strong className="text-[#FF2A7F]">" "</strong> : Exact phrase match. E.g., <span className="text-sky-300">"Customer Success"</span></li>
              <li><strong className="text-[#FF2A7F]">( )</strong> : Groups logic. E.g., <span className="text-sky-300">(React OR Vue) AND (Senior OR Lead)</span></li>
            </ul>
          </div>

          <div className="border border-indigo-200 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <Link className="text-indigo-500" size={24} />
              <h4 className="font-bold text-indigo-900 text-lg">X-Ray Searching (Google Dorking)</h4>
            </div>
            <p className="text-sm text-stone-600 mb-4 leading-relaxed">
              LinkedIn restricts search results unless you pay for expensive Recruiter seats. Use Google to bypass this by searching LinkedIn's public directory.
            </p>
            <div className="bg-white border border-indigo-100 p-4 rounded-xl shadow-sm space-y-3">
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Formula</span>
                <p className="font-mono text-sm text-indigo-900 mt-1">site:linkedin.com/in [Job Title] [Location] [Skills] -intitle:"profiles" -inurl:"dir"</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Real Example</span>
                <p className="font-mono text-sm text-indigo-900 mt-1">site:linkedin.com/in ("Frontend Developer" OR "Software Engineer") "London" "React" -intitle:"profiles"</p>
              </div>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="2. The 'Connect' Pool Advantage">
        <div className="flex gap-6 items-start">
          <div className="w-16 h-16 bg-[#FF2A7F]/10 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="text-[#FF2A7F]" size={32} />
          </div>
          <div>
            <h4 className="font-bold text-xl text-stone-900 mb-2">Mine Your Existing Provider First</h4>
            <p className="text-stone-600 leading-relaxed mb-4">
              The highest converting passive candidates are those who already know your employer brand. Before sourcing externally, run searches against your Service Alignment "Connect" pool and past silver-medalists.
            </p>
            <ul className="list-disc pl-5 text-sm text-stone-600 space-y-2">
              <li><strong>Silver Medalists:</strong> Candidates who made it to the final round for a previous role but weren't hired.</li>
              <li><strong>Connect Subscribers:</strong> People who joined your talent network via the Career Site but haven't applied to a specific job yet.</li>
              <li><strong>Alumni:</strong> Former employees who left on good terms.</li>
            </ul>
          </div>
        </div>
      </DocSection>

      <DocSection title="3. Outreach & Messaging Architecture">
        <p className="mb-6 text-stone-600">You found them. Now you have to get them to reply. Use the <strong>RRCA Framework</strong> for cold outreach.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-stone-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <h5 className="font-bold text-emerald-700 flex items-center gap-2 mb-2"><Target size={16}/> 1. Relevance</h5>
            <p className="text-sm text-stone-600 leading-relaxed">Why are you reaching out to <em>them specifically</em>? Mention a mutual connection, a project on their Github, or a recent article they posted.</p>
          </div>
          <div className="border border-stone-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <h5 className="font-bold text-amber-700 flex items-center gap-2 mb-2"><Linkedin size={16}/> 2. Reward (WIIFM)</h5>
            <p className="text-sm text-stone-600 leading-relaxed">What's in it for them? Highlight the tech stack, the impact of the role, or the company growth trajectory. Do not just list requirements.</p>
          </div>
          <div className="border border-stone-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <h5 className="font-bold text-sky-700 flex items-center gap-2 mb-2"><Mail size={16}/> 3. Credibility</h5>
            <p className="text-sm text-stone-600 leading-relaxed">Briefly state why your company is a great place to work (e.g., recent funding, industry awards, culture).</p>
          </div>
          <div className="border border-stone-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <h5 className="font-bold text-rose-700 flex items-center gap-2 mb-2"><MessageCircle size={16}/> 4. Action (Soft CTA)</h5>
            <p className="text-sm text-stone-600 leading-relaxed">Never ask for a resume or an interview. Ask for a low-friction conversation. "Are you open to a brief chat?"</p>
          </div>
        </div>

        <div className="mt-8 bg-stone-50 border-l-4 border-[#FF2A7F] p-6 rounded-r-xl">
          <h4 className="font-bold text-stone-900 mb-2">Example Template (Software Engineer)</h4>
          <p className="text-sm text-stone-700 italic leading-relaxed">
            "Hi [Name],<br/><br/>
            I loved your recent post on [Topic]—it really resonated with how our engineering team approaches scaling our microservices.<br/><br/>
            We're currently building out a new squad focused on [Exciting Project], utilizing [Tech Stack]. Given your background at [Current Company], I think you'd bring a lot of valuable perspective to the team.<br/><br/>
            Are you open to a brief, casual chat to see if there's any alignment for the future?"
          </p>
        </div>
      </DocSection>

      <DocSection title="Pro Tips">
        <Callout type="tip" title="Follow Up (The Money is in the Follow-Up)">
          A single message is rarely enough. Top candidates are busy. Plan a 3-touch cadence over two weeks:
          <br/>1. Initial Outreach (Day 1)
          <br/>2. Value-add follow-up (e.g., sharing a blog post about your engineering culture) (Day 4)
          <br/>3. The Break-up / Final attempt (Day 10)
        </Callout>
      </DocSection>
    </div>
  );
}
