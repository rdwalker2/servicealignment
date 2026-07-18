import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';
import { Clock, Calendar, Zap, Coffee, Phone, Inbox, CheckSquare, Target } from 'lucide-react';

export default function TimeManagement() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32 space-y-12">
      <DocHeader 
        title="AE Daily Rhythm & Calendar Architecture" 
        subtitle="How top performers structure their days to maximize revenue-generating activities." 
      />

      <DocSection title="The Problem with 'Wing It' Days">
        <p className="text-lg text-stone-700 leading-relaxed mb-4">
          The biggest difference between an AE hitting 80% and an AE hitting 150% is rarely raw talent—it's calendar architecture. If you wake up, open your laptop, and just "start answering emails," you are playing defense. Top performers play offense.
        </p>
      </DocSection>

      <DocSection title="The Ideal AE Daily Schedule">
        <p className="mb-6 text-stone-600">This is the blueprint used by President's Club winners. Adapt the exact times to your time zone, but protect the blocks with your life.</p>

        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-300 before:to-transparent">

          {/* Block 1 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-sky-100 text-sky-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Coffee size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-stone-200 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-stone-900">8:00 AM - 9:00 AM</h4>
                <span className="text-[10px] font-bold uppercase text-sky-500 bg-sky-50 px-2 py-0.5 rounded">Defense</span>
              </div>
              <h5 className="font-bold text-sky-800 text-sm mb-2">Admin, Inbox & Prep</h5>
              <ul className="text-xs text-stone-600 list-disc pl-4 space-y-1">
                <li>Clear inbox to zero (deal with fires).</li>
                <li>Review the daily meeting schedule.</li>
                <li>Final prep for today's D1/D3 calls (research, open tabs).</li>
                <li>Build/Load the calling list for the Golden Hours.</li>
              </ul>
            </div>
          </div>

          {/* Block 2 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-amber-100 text-amber-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Phone size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-stone-900">9:00 AM - 11:00 AM</h4>
                <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-100 px-2 py-0.5 rounded animate-pulse">Golden Hours</span>
              </div>
              <h5 className="font-bold text-amber-800 text-sm mb-2">High-Volume Prospecting</h5>
              <ul className="text-xs text-stone-700 list-disc pl-4 space-y-1">
                <li><strong>CRITICAL: Slack closed, email closed, phone on DND.</strong></li>
                <li>Hit the phones. Execute the 21-Day Cadence calls.</li>
                <li>This is your highest ROI activity of the day. Protect it fiercely.</li>
              </ul>
            </div>
          </div>

          {/* Block 3 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-100 text-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Target size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-stone-200 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-stone-900">11:00 AM - 3:00 PM</h4>
                <span className="text-[10px] font-bold uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">Offense</span>
              </div>
              <h5 className="font-bold text-indigo-800 text-sm mb-2">The Revenue Zone</h5>
              <ul className="text-xs text-stone-600 list-disc pl-4 space-y-1">
                <li>Run D1 Discovery Calls.</li>
                <li>Execute D3 Demos and D4 Closing calls.</li>
                <li>If you have gaps here, use them for hyper-personalized LinkedIn outreach or account mapping.</li>
              </ul>
            </div>
          </div>

          {/* Block 4 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-emerald-100 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <CheckSquare size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-stone-200 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-stone-900">3:00 PM - 5:00 PM</h4>
                <span className="text-[10px] font-bold uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">Follow-Up</span>
              </div>
              <h5 className="font-bold text-emerald-800 text-sm mb-2">Deal Velocity & Wrap Up</h5>
              <ul className="text-xs text-stone-600 list-disc pl-4 space-y-1">
                <li>Send meeting recaps, BAPs, and pricing proposals.</li>
                <li>Follow up on stalled deals.</li>
                <li>Clear inbox one last time.</li>
                <li>Update Salesforce (Pipeline Hygiene).</li>
              </ul>
            </div>
          </div>

        </div>
      </DocSection>

      <DocSection title="The Two Laws of Time Management">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl">
            <h4 className="font-bold text-rose-900 mb-2 flex items-center gap-2"><Zap size={18}/> Context Switching Kills</h4>
            <p className="text-sm text-rose-800">
              If you make 3 cold calls, then reply to a CS email, then build a proposal, you lose 20 minutes of focus between each task. Batch your work. Only do one type of task per block.
            </p>
          </div>
          <div className="bg-violet-50 border border-violet-200 p-5 rounded-xl">
            <h4 className="font-bold text-violet-900 mb-2 flex items-center gap-2"><Inbox size={18}/> Inbox is a To-Do List</h4>
            <p className="text-sm text-violet-800">
              Your inbox is a to-do list created for you by other people. Do not live in it. Check it at 8:00 AM, 12:00 PM, and 4:30 PM. Shut it down the rest of the day.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="How to Implement">
        <Callout type="rule" title="Color-Code Your Calendar">
          Literally block out these chunks on your Google/Outlook calendar and color code them.
          <ul className="mt-2 space-y-1 ml-4 text-sm font-mono">
            <li><span className="text-yellow-600">Yellow</span> = Golden Hours (Prospecting)</li>
            <li><span className="text-green-600">Green</span> = Live Customer Meetings</li>
            <li><span className="text-blue-600">Blue</span> = Admin / Emails</li>
          </ul>
        </Callout>
      </DocSection>

    </div>
  );
}
