import React from 'react';
import { CleanModal } from '../ui/CleanUI';
import { Filter, Save, Trash2, Plus } from 'lucide-react';
import type { FilterCondition } from '../../hooks/useSignalFilters';

const FIELD_GROUPS = [
  { label: 'Contact', fields: [
    { value: 'job_title', label: 'Job Title' },
    { value: 'full_name', label: 'Name' },
    { value: 'email', label: 'Email' },
  ]},
  { label: 'Company', fields: [
    { value: 'company_name', label: 'Company Name' },
    { value: 'company_location', label: 'Location' },
    { value: 'employee_count', label: 'Employee Count' },
    { value: 'open_roles', label: 'Open Roles' },
    { value: 'current_ats', label: 'Current ATS' },
  ]},
  { label: 'Activity', fields: [
    { value: 'signal_name', label: 'Signal Name' },
    { value: 'signal_source', label: 'Signal Source' },
    { value: 'signal_score', label: 'Score' },
    { value: 'page_visited', label: 'Page Visited' },
    { value: 'icp_tier', label: 'ICP Tier' },
  ]},
];

const OPERATOR_OPTIONS: { value: FilterCondition['operator']; label: string }[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'lt', label: 'Less Than' },
];

export interface AdvancedSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSavingSegment: boolean;
  setIsSavingSegment: (val: boolean) => void;
  segmentNameDraft: string;
  setSegmentNameDraft: (val: string) => void;
  handleSaveAsSegment: () => void;
  handleApplyFilters: () => void;
  draftQuery: FilterCondition[];
  handleUpdateCondition: (id: string, updates: Partial<FilterCondition>) => void;
  handleRemoveCondition: (id: string) => void;
  handleAddCondition: () => void;
}

export function AdvancedSegmentModal({
  isOpen,
  onClose,
  isSavingSegment,
  setIsSavingSegment,
  segmentNameDraft,
  setSegmentNameDraft,
  handleSaveAsSegment,
  handleApplyFilters,
  draftQuery,
  handleUpdateCondition,
  handleRemoveCondition,
  handleAddCondition,
}: AdvancedSegmentModalProps) {
  return (
    <CleanModal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Filters"
      footer={
        <>
          {isSavingSegment ? (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={segmentNameDraft}
                onChange={e => setSegmentNameDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveAsSegment(); if (e.key === 'Escape') { setIsSavingSegment(false); setSegmentNameDraft(''); } }}
                placeholder="Segment name..."
                autoFocus
                className="flex-1 px-3 py-2 rounded-lg border border-violet-300 bg-white text-[12px] text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
              <button
                onClick={() => { setIsSavingSegment(false); setSegmentNameDraft(''); }}
                className="px-3 py-2 rounded-lg text-[12px] font-semibold text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsSegment}
                disabled={!segmentNameDraft.trim()}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={12} /> Save
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsSavingSegment(true)}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200/60 transition-all flex items-center gap-1.5"
              >
                <Save size={12} /> Save as Segment
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white bg-stone-900 hover:bg-stone-800 shadow-sm transition-all flex items-center gap-1.5"
              >
                <Filter size={12} /> Apply Filters
              </button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-3">
        {draftQuery.length === 0 && (
          <div className="text-center py-8">
            <Filter size={24} className="mx-auto text-stone-300 mb-2" />
            <p className="text-[13px] text-stone-500 font-medium">No conditions yet</p>
            <p className="text-[11px] text-stone-400 mt-1">Add conditions to filter your signal data</p>
          </div>
        )}
        {draftQuery.map((cond, idx) => (
          <React.Fragment key={cond.id}>
            {idx > 0 && (
              <div className="flex items-center justify-center py-0.5">
                <button
                  onClick={() => handleUpdateCondition(cond.id, { logic: cond.logic === 'or' ? 'and' : 'or' })}
                  className={`px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                    cond.logic === 'or'
                      ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                      : 'bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600'
                  }`}
                >
                  {cond.logic === 'or' ? 'OR' : 'AND'}
                </button>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-stone-50/80 border border-stone-200/60">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-stone-400 w-4 shrink-0">{idx + 1}</span>
                  <select
                    value={cond.field}
                    onChange={e => handleUpdateCondition(cond.id, { field: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-200/60 bg-white text-[11px] font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all appearance-none cursor-pointer"
                  >
                    {FIELD_GROUPS.map(group => (
                      <optgroup key={group.label} label={group.label}>
                        {group.fields.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <select
                    value={cond.operator}
                    onChange={e => handleUpdateCondition(cond.id, { operator: e.target.value as FilterCondition['operator'] })}
                    className="w-32 px-2.5 py-1.5 rounded-lg border border-stone-200/60 bg-white text-[11px] font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all appearance-none cursor-pointer"
                  >
                    {OPERATOR_OPTIONS.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pl-6">
                  <input
                    type="text"
                    value={cond.value}
                    onChange={e => handleUpdateCondition(cond.id, { value: e.target.value })}
                    placeholder="Enter value..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-200/60 bg-white text-[11px] text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={() => handleRemoveCondition(cond.id)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all mt-0.5"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </React.Fragment>
        ))}
        <button
          onClick={handleAddCondition}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[11px] font-semibold text-violet-700 border border-dashed border-violet-300/60 bg-violet-50/30 hover:bg-violet-50 hover:border-violet-300 transition-all"
        >
          <Plus size={12} /> Add Condition
        </button>
      </div>
    </CleanModal>
  );
}
