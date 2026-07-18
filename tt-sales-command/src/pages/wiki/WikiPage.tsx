import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { WikiFeature } from '../../data/productWiki';
import { WikiCard } from '../../components/wiki/WikiCard';
import { WikiDetailDrawer } from '../../components/wiki/WikiDetailDrawer';

interface WikiPageProps {
  title: string;
  data: WikiFeature[];
}

export function WikiPage({ title, data }: WikiPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState<WikiFeature | null>(null);

  // Extract unique categories from data
  const categories = useMemo(() => {
    const cats = new Set(data.map(f => f.category || 'other'));
    return ['all', ...Array.from(cats)];
  }, [data]);

  const CATEGORY_LABELS: Record<string, string> = {
    all: 'All',
    automation: 'Automation',
    screening: 'Screening & AI',
    communication: 'Communication',
    scheduling: 'Scheduling',
    'career-site': 'Career Site',
    analytics: 'Analytics',
    integrations: 'Integrations',
    promotion: 'Promotion',
    onboarding: 'Onboarding',
    other: 'Other'
  };

  const filteredFeatures = useMemo(() => {
    return data.filter(f => {
      if (activeCategory !== 'all' && (f.category || 'other') !== activeCategory) return false;
      if (activeStatus !== 'all' && f.status !== activeStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const hay = [
          f.title, f.subtitle, f.category,
          ...(f.tags || []),
          f.whatItDoes, f.howItWorks,
          f.implementationNotes
        ].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [data, activeCategory, activeStatus, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: data.length,
      verified: data.filter(f => f.status === 'verified').length,
      review: data.filter(f => f.status === 'needs-review').length,
      unverified: data.filter(f => f.status === 'unverified').length
    };
  }, [data]);

  return (
    <div className="h-full flex flex-col bg-stone-50 overflow-hidden relative">
      <WikiDetailDrawer 
        feature={selectedFeature} 
        isOpen={!!selectedFeature} 
        onClose={() => setSelectedFeature(null)} 
      />

      {/* Header */}
      <div className="shrink-0 px-6 py-8 pb-4">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">{title}</h1>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder="Search features, tags, categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2A7F]/20 focus:border-[#FF2A7F] transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">
              {filteredFeatures.length} results
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-12">
        {filteredFeatures.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 bg-white border border-stone-200 border-dashed rounded-xl">
            <span className="text-4xl mb-3">🔍</span>
            <h3 className="text-sm font-bold text-stone-900 mb-1">No features found</h3>
            <p className="text-xs text-stone-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFeatures.map(f => (
              <WikiCard key={f.id} feature={f} onClick={() => setSelectedFeature(f)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
