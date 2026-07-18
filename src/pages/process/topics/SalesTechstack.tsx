import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';
import { Database, Mic, Mail, Link } from 'lucide-react';

export default function SalesTechstack() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32 space-y-12">
      <DocHeader 
        title="Sales Tech Stack & Hygiene" 
        subtitle="The tools we use to win, and how to use them without getting sloppy." 
      />

      <DocSection title="The Golden Rule of CRM Hygiene">
        <p className="text-lg text-stone-700 leading-relaxed mb-4">
          "If it's not in Salesforce, it didn't happen." This isn't just about management tracking you—it's about protecting your pipeline. A clean CRM prevents deals from slipping through the cracks and ensures smooth handoffs to Customer Success.
        </p>
      </DocSection>

      <DocSection title="1. Salesforce (System of Record)">
        <div className="bg-sky-50 border border-sky-200 p-6 rounded-2xl shadow-sm mb-4">
          <h4 className="font-bold text-sky-900 text-xl flex items-center gap-2 mb-4"><Database className="text-sky-500" /> Pipeline Management</h4>
          <ul className="list-disc pl-5 text-sm text-sky-800 space-y-4">
            <li>
              <strong>Next Steps (The Who, What, When):</strong> Every single open Opportunity MUST have a "Next Step" filled out with a date. 
              <div className="mt-3 bg-white border border-sky-100 p-4 rounded-lg shadow-sm">
                <h5 className="font-bold text-sky-900 mb-2">Pipeline Review Expectations</h5>
                <p className="text-stone-600 mb-2">For your 1:1s, managers expect your "Next Step" field to explicitly answer:</p>
                <ul className="list-disc pl-5 space-y-1 text-stone-700">
                  <li><strong>Who:</strong> Who are the next steps with? (Title and name)</li>
                  <li><strong>What:</strong> What are your next steps? Is it a scheduled next steps call on the calendar? Did they say it was ok to f/u with them on a certain date but wouldn't commit to a time? Do we owe them anything by a certain date/time? Do they owe us anything by a certain date/time?</li>
                  <li><strong>When:</strong> When is this next step due? (Date/Time)</li>
                </ul>
              </div>
            </li>
            <li><strong>Stage Movement:</strong> Do not advance a deal to "D3 (Demo)" unless you have completed a D1 Discovery call and confirmed their pain.</li>
            <li><strong>Close Dates:</strong> Keep your Close Dates accurate. If a deal is not closing this month, push it to next month before the Friday forecast call.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection title="2. Granola (Conversation Intelligence)">
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl shadow-sm mb-4">
          <h4 className="font-bold text-amber-900 text-xl flex items-center gap-2 mb-4"><Mic className="text-amber-500" /> Meeting Notes & Deal Sync</h4>
          <p className="text-sm text-amber-800 mb-3">
            We use <strong>Granola</strong> (not Gong or Chorus) as our AI notepad for all prospect meetings. Granola allows you to focus 100% on the prospect during the call while it transcribes and synthesizes the conversation.
          </p>
          <ul className="list-disc pl-5 text-sm text-amber-800 space-y-2">
            <li><strong>Auto-Sync:</strong> Ensure your Granola integration is connected so notes automatically sync to the Salesforce Opportunity.</li>
            <li><strong>Game Tape:</strong> Review your own Granola transcripts after a lost deal to identify where you missed the prospect's real pain.</li>
            <li><strong>MEDDPICC Check:</strong> Use Granola's AI chat to ask "Did I uncover the Economic Buyer on this call?"</li>
          </ul>
        </div>
      </DocSection>

      <DocSection title="3. Salesloft (System of Execution)">
        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-2xl shadow-sm mb-4">
          <h4 className="font-bold text-indigo-900 text-xl flex items-center gap-2 mb-4"><Mail className="text-indigo-500" /> Cadences & Outbound</h4>
          <ul className="list-disc pl-5 text-sm text-indigo-800 space-y-2">
            <li><strong>Personalization:</strong> Do not bulk enroll 100 prospects into a fully automated Salesloft cadence. You must customize the first email (the "20% personalization rule").</li>
            <li><strong>Call Tasks:</strong> Clear your overdue Salesloft call tasks daily. An email sequence is useless if you don't pick up the phone.</li>
            <li><strong>Bounces:</strong> If an email bounces, remove them from the cadence immediately to protect our domain reputation.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection title="4. LinkedIn Sales Navigator (Research)">
        <div className="bg-violet-50 border border-violet-200 p-6 rounded-2xl shadow-sm">
          <h4 className="font-bold text-violet-900 text-xl flex items-center gap-2 mb-4"><Link className="text-violet-500" /> Account Mapping</h4>
          <ul className="list-disc pl-5 text-sm text-violet-800 space-y-2">
            <li><strong>Account Lists:</strong> Build customized account lists for your territory and set alerts for trigger events (e.g., "New VP of HR hired").</li>
            <li><strong>Boolean Search:</strong> Use advanced boolean strings to find the exact decision-makers hidden beneath vague job titles.</li>
          </ul>
        </div>
      </DocSection>

    </div>
  );
}
