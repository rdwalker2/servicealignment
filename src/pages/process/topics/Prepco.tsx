import React from 'react';

export default function Prepco() {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-black text-stone-900 mb-2">PRePCo Framework</h1>
        <p className="text-[13px] text-stone-500">How to prepare for your discovery and demo calls effectively.</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded bg-stone-900 text-white flex items-center justify-center font-black text-lg shrink-0">P</div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Persona</h3>
            <p className="text-[13px] text-stone-600 mt-1">Who are we speaking with? What do they care about? Review the Persona Insights before the call.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded bg-stone-900 text-white flex items-center justify-center font-black text-lg shrink-0">Re</div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Reason</h3>
            <p className="text-[13px] text-stone-600 mt-1">Why are you having this call? What's in it for them? Connect the call to their business goals.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded bg-stone-900 text-white flex items-center justify-center font-black text-lg shrink-0">P</div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Plan</h3>
            <p className="text-[13px] text-stone-600 mt-1">What questions will you ask? What steps should you follow? Have your D1/D2 questions ready.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded bg-stone-900 text-white flex items-center justify-center font-black text-lg shrink-0">Co</div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Control</h3>
            <p className="text-[13px] text-stone-600 mt-1">How will you set up clear expectations and manage the call? (Use the AXNOT framework to set the agenda).</p>
          </div>
        </div>
      </div>
      
      <div className="bg-stone-50 border border-stone-200 p-4 rounded-lg mt-6">
        <h3 className="text-sm font-bold text-stone-900 mb-2">The 4 Killer Questions</h3>
        <p className="text-[13px] text-stone-600 mb-3">Both you and your prospect should leave the call with clear answers to:</p>
        <ul className="list-disc pl-5 text-[13px] text-stone-600 space-y-1">
          <li>Why now?</li>
          <li>Why us?</li>
          <li>Who else is involved?</li>
          <li>What happens if nothing changes?</li>
        </ul>
      </div>
    </div>
  );
}
