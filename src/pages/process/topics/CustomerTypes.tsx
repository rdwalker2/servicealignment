import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';
import { Building, Building2, Landmark, Rocket, ShieldAlert, Zap } from 'lucide-react';

export default function CustomerTypes() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32 space-y-12">
      <DocHeader 
        title="Customer Segments & Personas" 
        subtitle="How to identify, position, and win across different company sizes." 
      />

      <DocSection title="The Service Alignment Sweet Spot">
        <p className="text-lg text-stone-700 leading-relaxed mb-4">
          Service Alignment serves companies from 50 to 5,000 employees. However, how you sell to a 50-person startup is fundamentally different from how you sell to a 3,000-person enterprise. Understanding these segments dictates your discovery strategy.
        </p>
      </DocSection>

      <DocSection title="Segment 1: SMB (50 - 200 Employees)">
        <div className="bg-sky-50 border border-sky-200 p-6 rounded-2xl relative shadow-sm">
          <div className="absolute top-6 right-6 text-sky-200"><Building size={48} /></div>
          
          <h4 className="font-bold text-sky-900 text-xl mb-4 flex items-center gap-2">
            <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs uppercase tracking-wider">SMB</span>
            The Builders
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h5 className="font-bold text-sky-900 mb-2">Current State</h5>
              <ul className="list-disc pl-5 text-sm text-sky-800 space-y-1">
                <li>Using spreadsheets or a very cheap/free Provider (e.g., Workable free tier).</li>
                <li>HR Manager does everything (payroll, benefits, AND recruiting).</li>
                <li>No dedicated employer brand.</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-sky-900 mb-2">The Value Play</h5>
              <ul className="list-disc pl-5 text-sm text-sky-800 space-y-1">
                <li><strong>Time Savings:</strong> They are drowning in admin. Sell them automation.</li>
                <li><strong>Out-of-the-Box Branding:</strong> Sell the Career Site builder as an instant upgrade to their company image.</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 bg-white p-4 rounded-xl border border-sky-100">
            <h5 className="font-bold text-sky-700 flex items-center gap-2 mb-2"><Zap size={16}/> The Golden Question</h5>
            <p className="text-sm text-stone-600 italic">"As the sole HR person, how many hours a week are you spending just copying and pasting candidate data from emails into spreadsheets?"</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Segment 2: Mid-Market (200 - 1,000 Employees)">
        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-2xl relative shadow-sm">
          <div className="absolute top-6 right-6 text-indigo-200"><Building2 size={48} /></div>
          
          <h4 className="font-bold text-indigo-900 text-xl mb-4 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs uppercase tracking-wider">Mid-Market</span>
            The Scalers
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h5 className="font-bold text-indigo-900 mb-2">Current State</h5>
              <ul className="list-disc pl-5 text-sm text-indigo-800 space-y-1">
                <li>Using a legacy or mid-tier Provider (e.g., BambooHR, JazzHR, Lever).</li>
                <li>Have a dedicated TA team (2-5 recruiters).</li>
                <li>Struggling with candidate experience and sourcing passive talent.</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-indigo-900 mb-2">The Value Play</h5>
              <ul className="list-disc pl-5 text-sm text-indigo-800 space-y-1">
                <li><strong>Candidate Conversion:</strong> Sell the Connect pools and proactive sourcing features.</li>
                <li><strong>Manager Collaboration:</strong> Show how easy it is for Hiring Managers to review candidates on mobile.</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 bg-white p-4 rounded-xl border border-indigo-100">
            <h5 className="font-bold text-indigo-700 flex items-center gap-2 mb-2"><Zap size={16}/> The Golden Question</h5>
            <p className="text-sm text-stone-600 italic">"When a candidate lands on your current career site, what happens if they aren't ready to apply today? How are you capturing that traffic?"</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Segment 3: Enterprise (1,000 - 5,000+ Employees)">
        <div className="bg-violet-50 border border-violet-200 p-6 rounded-2xl relative shadow-sm">
          <div className="absolute top-6 right-6 text-violet-200"><Landmark size={48} /></div>
          
          <h4 className="font-bold text-violet-900 text-xl mb-4 flex items-center gap-2">
            <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs uppercase tracking-wider">Enterprise</span>
            The Transformers
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h5 className="font-bold text-violet-900 mb-2">Current State</h5>
              <ul className="list-disc pl-5 text-sm text-violet-800 space-y-1">
                <li>Using a monolith HRIS module for recruiting (Workday, Oracle, SAP).</li>
                <li>Huge agency spend because the internal system is too clunky to source with.</li>
                <li>Complex approval chains and compliance requirements (SSO, strict permissions).</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-violet-900 mb-2">The Value Play</h5>
              <ul className="list-disc pl-5 text-sm text-violet-800 space-y-1">
                <li><strong>Best-of-Breed:</strong> Sell Service Alignment as the agile front-end (TA system of engagement) that integrates perfectly into their rigid back-end (HRIS system of record).</li>
                <li><strong>Agency Reduction:</strong> Sell Copilot and Connect pools to reduce external recruiter fees.</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 bg-white p-4 rounded-xl border border-violet-100">
            <h5 className="font-bold text-violet-700 flex items-center gap-2 mb-2"><Zap size={16}/> The Golden Question</h5>
            <p className="text-sm text-stone-600 italic">"I know you use Workday as your system of record, which is great for payroll. But how are your recruiters actually finding and engaging passive talent day-to-day?"</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Competitor Trap Alerts">
        <Callout type="warning" title="Don't fight the HRIS in Enterprise">
          Never tell an Enterprise they should rip out Workday or SuccessFactors. You will lose. Instead, position Service Alignment as the "Recruiting Engine" that sits <em>on top</em> of their HRIS. 
          We handle the candidate experience (Career Site) and recruiter experience (Provider), then we automatically push the hired candidate data into their HRIS for payroll.
        </Callout>
      </DocSection>
    </div>
  );
}
