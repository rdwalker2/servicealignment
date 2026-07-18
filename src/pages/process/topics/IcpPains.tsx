import React from 'react';

export default function IcpPains() {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-black text-stone-900 mb-2">Ideal Customer Profile (ICP) & Pains</h1>
        <p className="text-[13px] text-stone-500">How to position against different baseline scenarios.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-stone-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
            <span className="text-red-500">⚠️</span> No Provider (Spreadsheets & Email)
          </h2>
          <ul className="space-y-2 text-[13px] text-stone-600 list-disc pl-5">
            <li>Candidates slip through the cracks = missed hires</li>
            <li>Manual process slows everything down = longer time-to-hire</li>
            <li>No hiring data (reports) = no data-driven decision making</li>
            <li>Poor candidate experience = talent drops off</li>
          </ul>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
            <span className="text-orange-500">🏛️</span> Legacy Provider (Lever, Workday)
          </h2>
          <ul className="space-y-2 text-[13px] text-stone-600 list-disc pl-5">
            <li>Rigid workflows = slower hiring</li>
            <li>Clunky or complex UX = low team adoption</li>
            <li>Outdated candidate journey = risk of talent drop off</li>
            <li>Weak customer support = Bottlenecks remain</li>
          </ul>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
            <span className="text-blue-500">🛠️</span> All-in-one tool (BambooHR, Factorial)
          </h2>
          <ul className="space-y-2 text-[13px] text-stone-600 list-disc pl-5">
            <li>Basic tools/features = difficult to scale recruitment</li>
            <li>Weak innovation = competitors move faster</li>
            <li>Limited analytics = bottlenecks stay hidden</li>
            <li>Side systems emerge = process fragmentation</li>
          </ul>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
            <span className="text-purple-500">🤝</span> Comparable Provider (Ashby, Recruitee)
          </h2>
          <ul className="space-y-2 text-[13px] text-stone-600 list-disc pl-5">
            <li>Provider optimizes process, not attraction = weaker hiring impact</li>
            <li>Candidate experience is secondary = lower conversion rates</li>
            <li>Efficiency improves, not hiring outcomes = limited leverage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
