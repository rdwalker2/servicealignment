import React from 'react';
import type { WikiFeature } from '../../data/productWiki';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface WikiCardProps {
  feature: WikiFeature;
  onClick: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  automation: { bg: 'bg-indigo-100', text: 'text-indigo-600', label: 'Automation' },
  screening: { bg: 'bg-violet-100', text: 'text-violet-600', label: 'Screening & AI' },
  communication: { bg: 'bg-cyan-100', text: 'text-cyan-600', label: 'Communication' },
  scheduling: { bg: 'bg-amber-100', text: 'text-amber-600', label: 'Scheduling' },
  'career-site': { bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Career Site' },
  analytics: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Analytics' },
  integrations: { bg: 'bg-pink-100', text: 'text-pink-600', label: 'Integrations' },
  promotion: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Promotion' },
  onboarding: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Onboarding' },
  other: { bg: 'bg-stone-100', text: 'text-stone-600', label: 'Other' }
};

function StatusBadge({ status }: { status: WikiFeature['status'] }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
        <CheckCircle2 size={10} /> Verified
      </span>
    );
  }
  if (status === 'needs-review') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
        <AlertTriangle size={10} /> Needs Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-100">
      <XCircle size={10} /> Unverified
    </span>
  );
}

export function WikiCard({ feature, onClick }: WikiCardProps) {
  const cat = CATEGORY_COLORS[feature.category] || CATEGORY_COLORS.other;

  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer p-4 hover:border-stone-300"
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.bg} ${cat.text}`}>
          {cat.label}
        </span>
        <StatusBadge status={feature.status} />
      </div>

      <h3 className="text-sm font-semibold text-stone-900 mb-1 leading-tight group-hover:text-[#FF2A7F] transition-colors">
        {feature.title}
      </h3>
      
      <p className="text-xs text-stone-500 line-clamp-2 flex-1 mb-4">
        {feature.subtitle || feature.whatItDoes || ''}
      </p>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
        <div className="flex items-center gap-1 text-[10px] font-medium text-stone-400">
          <Clock size={11} />
          {feature.lastVerified ? new Date(feature.lastVerified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unverified'}
        </div>
        
        {feature.tags && feature.tags.length > 0 && (
          <div className="flex gap-1">
            {feature.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[9px] font-semibold">
                {tag}
              </span>
            ))}
            {feature.tags.length > 2 && (
              <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[9px] font-semibold">
                +{feature.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
