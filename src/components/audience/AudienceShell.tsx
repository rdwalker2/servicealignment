import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowUpDown, ArrowDown, ArrowUp, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LayoutGrid,
} from 'lucide-react';
import { CleanPage, CleanPageHeader, CleanPageToolbar, CleanCard, CleanDrawer } from '../ui/CleanUI';
import type { AudienceConfig, AudienceSegment } from './audienceTypes';

// ─── Shared Sub-Components ──────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: React.ElementType; accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-stone-200/60 px-4 py-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent || 'bg-stone-100 text-stone-600'}`}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900 tabular-nums leading-none">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-[10px] font-medium text-stone-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function FilterDropdown({ value, options, onChange, icon: Icon, showCount }: {
  value: string;
  options: { value: string; label: string; count?: number }[];
  onChange: (val: string) => void;
  icon: React.ElementType;
  showCount?: boolean;
}) {
  const isActive = value !== 'all';
  return (
    <div className="relative">
      <div className={`flex items-center gap-1 px-2.5 py-[6px] rounded-lg border text-[11px] font-semibold cursor-pointer transition-all ${
        isActive
          ? 'bg-stone-900 text-white border-stone-900'
          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
      }`}>
        <Icon size={12} className={isActive ? 'text-stone-400' : 'text-stone-400'} />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-transparent outline-none cursor-pointer text-[11px] font-semibold pr-3"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}{showCount && opt.count !== undefined ? ` (${opt.count})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function SortIconEl({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ArrowUpDown size={10} className="text-stone-300 ml-0.5" />;
  return dir === 'desc'
    ? <ArrowDown size={10} className="text-stone-700 ml-0.5" />
    : <ArrowUp size={10} className="text-stone-700 ml-0.5" />;
}

// ─── AudienceShell ──────────────────────────────────────────────────────────

const PAGE_SIZE_DEFAULT = 50;

export default function AudienceShell<T>({ config }: { config: AudienceConfig<T> }) {
  const pageSize = config.pageSize || PAGE_SIZE_DEFAULT;

  // ── State ──
  const [activeSegmentId, setActiveSegmentId] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState(config.defaultSort.field);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(config.defaultSort.dir);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  // ── Segment application ──
  const applySegment = useCallback((seg: AudienceSegment) => {
    setActiveSegmentId(seg.id);
    setFilterValues({});
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  // ── Segment counts ──
  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const seg of config.segments) {
      if (seg.filter) {
        counts[seg.id] = config.data.filter(seg.filter).length;
      } else if (seg.filters) {
        let filtered = config.data;
        for (const [key, val] of Object.entries(seg.filters)) {
          filtered = filtered.filter((item: any) => item[key] === val);
        }
        counts[seg.id] = filtered.length;
      } else {
        counts[seg.id] = config.data.length;
      }
    }
    return counts;
  }, [config.data, config.segments]);

  // ── Active segment ──
  const activeSeg = config.segments.find(s => s.id === activeSegmentId) || config.segments[0];

  // ── Filtering ──
  const filteredData = useMemo(() => {
    let results = [...config.data];

    // Apply segment
    if (activeSeg?.filter) {
      results = results.filter(activeSeg.filter);
    } else if (activeSeg?.filters) {
      for (const [key, val] of Object.entries(activeSeg.filters)) {
        results = results.filter((item: any) => item[key] === val);
      }
    }

    // Apply search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(item => config.searchFn(item, q));
    }

    // Apply dropdown filters
    results = config.applyFilters(results, filterValues);

    return results;
  }, [config, searchQuery, filterValues, activeSeg]);

  // ── Sorting ──
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const cmp = config.sortFn(a, b, sortField);
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [filteredData, sortField, sortDir, config]);

  // ── Pagination ──
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // ── Handlers ──
  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setCurrentPage(1);
  }, [sortField]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setActiveSegmentId('custom');
  }, []);

  const activeFilterCount = Object.values(filterValues).filter(v => v !== 'all' && v !== '').length;

  const clearFilters = useCallback(() => {
    setFilterValues({});
    setSearchQuery('');
    setCurrentPage(1);
    setActiveSegmentId('all');
  }, []);

  // ── Computed ──
  const filters = useMemo(() => config.filters(config.data), [config]);
  const stats = useMemo(() => config.stats(config.data, filteredData), [config, filteredData]);
  const itemLabel = config.itemLabel || 'items';

  return (
    <div className="min-h-screen flex bg-stone-50/50">
      {/* ── Segment Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} shrink-0 border-r border-stone-200/60 bg-white flex flex-col transition-all duration-200 overflow-hidden`}>
        <div className="px-3 py-3 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-stone-900">Segments</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <ChevronsLeft size={14} />
          </button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {config.segmentCategories.map(cat => {
            const catSegments = config.segments.filter(s => (s.category || 'all') === cat.key);
            if (catSegments.length === 0) return null;
            return (
              <div key={cat.key} className={cat.label ? 'mt-3 first:mt-0' : ''}>
                {cat.label && (
                  <div className="px-2.5 pt-1 pb-1.5">
                    <span className="text-[9px] font-medium text-stone-400">{cat.label}</span>
                  </div>
                )}
                <div className="space-y-0.5">
                  {catSegments.map(seg => {
                    const isActive = activeSegmentId === seg.id;
                    const Icon = config.segmentIconMap[seg.icon] || LayoutGrid;
                    const count = segmentCounts[seg.id] ?? 0;
                    return (
                      <button
                        key={seg.id}
                        onClick={() => applySegment(seg)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          isActive
                            ? 'bg-stone-900 text-white'
                            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                        }`}
                      >
                        <Icon size={13} className={isActive ? 'text-stone-300' : 'text-stone-400'} />
                        <span className="flex-1 text-left truncate">{seg.name}</span>
                        <span className={`text-[10px] tabular-nums font-semibold shrink-0 ${isActive ? 'text-stone-400' : 'text-stone-400'}`}>
                          {count.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {config.sidebarFooter}
      </aside>

      {/* ── Main Content ── */}
      <CleanPage className="flex-1 flex flex-col overflow-auto p-4">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-20 bg-white border border-l-0 border-stone-200 rounded-r-lg px-1 py-3 hover:bg-stone-50 transition-colors"
          >
            <ChevronsRight size={14} className="text-stone-500" />
          </button>
        )}

        <CleanPageHeader title={config.title} />

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {stats.map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
          ))}
        </div>

        {/* Above-table slot (Flywheel, etc.) */}
        {config.aboveTable}

        {/* Toolbar */}
        <CleanPageToolbar
          left={
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder={config.searchPlaceholder || 'Search…'}
                className="w-full pl-9 pr-3 py-[7px] rounded-lg border border-stone-200 bg-white text-[12px] text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all"
              />
            </div>
          }
          right={
            <div className="flex flex-wrap items-center gap-2">
              {filters.map(f => (
                <FilterDropdown
                  key={f.key}
                  value={filterValues[f.key] || 'all'}
                  options={f.options}
                  onChange={(val) => handleFilterChange(f.key, val)}
                  icon={f.icon}
                  showCount={f.showCount}
                />
              ))}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-[6px] rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X size={11} />
                  Clear ({activeFilterCount})
                </button>
              )}
            </div>
          }
        />

        {/* Insight Bar */}
        {config.renderInsightBar && (
          <AnimatePresence>
            {activeSegmentId !== 'all' && config.renderInsightBar(activeSegmentId, config.segments, sortedData.length)}
          </AnimatePresence>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-medium text-stone-500">
            Showing <strong className="text-stone-900">{sortedData.length.toLocaleString()}</strong> of {config.data.length.toLocaleString()} {itemLabel}
            {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
          </div>
        </div>

        {/* Table */}
        <CleanCard className="p-0 flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {config.colWidths && (
                <colgroup>
                  {config.colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
                </colgroup>
              )}
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="bg-white border-b border-stone-200/40 text-[11px] font-medium text-stone-400">
                  {config.columns.map(col => (
                    <th
                      key={col.key}
                      className={`px-3 py-2.5 text-left ${col.sortable ? 'cursor-pointer select-none' : ''} ${col.hideBelow === 'md' ? 'hidden md:table-cell' : col.hideBelow === 'lg' ? 'hidden lg:table-cell' : col.hideBelow === 'xl' ? 'hidden xl:table-cell' : ''}`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && <SortIconEl active={sortField === col.key} dir={sortDir} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(item => (
                  <tr
                    key={config.getItemId(item)}
                    onClick={() => setSelectedItem(item)}
                    className={`group transition-colors cursor-pointer border-b border-stone-100/40 hover:bg-stone-50/40 ${config.rowClassName?.(item) || ''}`}
                  >
                    {config.columns.map(col => (
                      <td
                        key={col.key}
                        className={`px-3 py-2.5 ${col.hideBelow === 'md' ? 'hidden md:table-cell' : col.hideBelow === 'lg' ? 'hidden lg:table-cell' : col.hideBelow === 'xl' ? 'hidden xl:table-cell' : ''}`}
                      >
                        {col.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={config.columns.length} className="px-6 py-16 text-center">
                      <div className="text-stone-400 space-y-2">
                        <Search size={24} className="mx-auto text-stone-300" />
                        <p className="text-sm font-medium">No {itemLabel} found</p>
                        <p className="text-xs">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-stone-50/50">
              <div className="text-[11px] text-stone-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </CleanCard>
      </CleanPage>

      {/* ── Detail Drawer ── */}
      <CleanDrawer
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title=""
        width="lg"
      >
        {selectedItem && config.renderDrawer(selectedItem, () => setSelectedItem(null))}
      </CleanDrawer>
    </div>
  );
}
