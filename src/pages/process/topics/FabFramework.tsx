import React from 'react';

export default function FabFramework() {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-black text-stone-900 mb-2">FAB Framework</h1>
        <p className="text-[13px] text-stone-500">A simple and powerful formula to connect features with pains, key for value selling.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 p-4 rounded-lg">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">What</div>
          <h3 className="text-lg font-black text-stone-900">Feature</h3>
          <p className="text-[12px] text-stone-500 mt-2">Product Description<br/>(Relevant for Recruiter/TA)</p>
        </div>
        <div className="bg-white border border-stone-200 p-4 rounded-lg">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">How</div>
          <h3 className="text-lg font-black text-stone-900">Advantage</h3>
          <p className="text-[12px] text-stone-500 mt-2">Process Improvement<br/>(Relevant for Champion)</p>
        </div>
        <div className="bg-white border border-stone-200 p-4 rounded-lg">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Why</div>
          <h3 className="text-lg font-black text-stone-900">Benefit</h3>
          <p className="text-[12px] text-stone-500 mt-2">Business Value<br/>(Relevant for Economic Buyer)</p>
        </div>
      </div>

      <h3 className="text-sm font-bold text-stone-900 mt-6 mb-3">Examples in Action</h3>
      
      <div className="space-y-4">
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-stone-50 px-4 py-2 border-b border-stone-200">
            <span className="text-[13px] font-bold text-stone-800">Example 1: Candidate Card</span>
          </div>
          <div className="p-4 space-y-3 text-[13px]">
            <div>
              <span className="font-bold text-stone-900 mr-2">Feature (What):</span>
              <span className="text-stone-600">Centralized, all-in-one profile "hub" that brings together a candidate's resume, communication history, and team feedback into a single view.</span>
            </div>
            <div>
              <span className="font-bold text-stone-900 mr-2">Advantage (How):</span>
              <span className="text-stone-600">Recruiters immediately see the most relevant candidate information for the role, which keeps hiring teams aligned and reduces time spent digging through profiles.</span>
            </div>
            <div>
              <span className="font-bold text-stone-900 mr-2">Benefit (Why):</span>
              <span className="text-stone-600">Help reduce time-to-hire and ensure top candidates aren't lost during the evaluation process.</span>
            </div>
          </div>
        </div>

        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-stone-50 px-4 py-2 border-b border-stone-200">
            <span className="text-[13px] font-bold text-stone-800">Example 2: Job Offer Module</span>
          </div>
          <div className="p-4 space-y-3 text-[13px]">
            <div>
              <span className="font-bold text-stone-900 mr-2">Feature (What):</span>
              <span className="text-stone-600">Digital tool to create, customize, and send professional job offers directly to candidates within Service Alignment.</span>
            </div>
            <div>
              <span className="font-bold text-stone-900 mr-2">Advantage (How):</span>
              <span className="text-stone-600">Hiring teams can quickly generate consistent offers using templates, reducing manual work and minimising the risk of missing important details.</span>
            </div>
            <div>
              <span className="font-bold text-stone-900 mr-2">Benefit (Why):</span>
              <span className="text-stone-600">A smoother offer process helps secure candidate commitments faster and reduces the risk of losing top candidates during the final stage.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
