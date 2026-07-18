import React from 'react';
import { DollarSign, Clock, ShieldAlert } from 'lucide-react';

export default function ValueDrivers() {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-black text-stone-900 mb-2">Money, Time, & Risk</h1>
        <p className="text-[13px] text-stone-500">Companies are constantly under pressure to reduce costs, save time, and minimise risk—three strategic priorities that drive urgency, budget, and buying decisions. Our solution helps customers improve all three.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5">
          <h2 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-500" /> Money (Revenue & Profitability)
          </h2>
          <ul className="space-y-2 text-[13px] text-emerald-800 list-disc pl-5">
            <li>Lower cost-per-hire and dependency on external recruiters/agencies.</li>
            <li>Monitor ROI on promoted channels.</li>
            <li>Improve recruiter productivity without increasing headcount.</li>
            <li>Increase offer acceptance rates to secure top talent faster.</li>
            <li>Reduce early employee turnover and the cost of rehiring.</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
          <h2 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" /> Time (Operational Efficiency)
          </h2>
          <ul className="space-y-2 text-[13px] text-blue-800 list-disc pl-5">
            <li>Reduce time-to-hire across the recruitment process.</li>
            <li>Automate repetitive and manual recruiting tasks.</li>
            <li>Improve collaboration efficiency between recruiters and hiring managers.</li>
            <li>Keep talent engaged. Speed up candidate screening, interviews scheduling, and response time.</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-5">
          <h2 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-500" /> Risk (Compliance & Security)
          </h2>
          <ul className="space-y-2 text-[13px] text-amber-800 list-disc pl-5">
            <li>Improve data management compliance and protect sensitive candidate information.</li>
            <li>Standardize interviews and evaluations to reduce bias and inconsistent hiring decisions.</li>
            <li>Improve auditability and transparency across the hiring process.</li>
            <li>Strengthen employer brand and reduce reputational risk through better candidate experiences.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
