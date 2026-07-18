// ============================================================
// CSHandoffPanel — CS Handoff Readiness Capture Panel
// Collapsible accordion capturing all fields CS needs on Day 1
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft, ChevronDown, CheckCircle2, Circle, AlertCircle,
  Server, Globe, Building2, Database, Puzzle, Rocket,
  GraduationCap, Mail, Target, Shield, Sparkles, Info, ClipboardList,
} from 'lucide-react';
import type { DiscoverySession, HandoffFieldKey } from '../../lib/discoveryDatabase';
import { computeHandoffReadiness } from '../../lib/discoveryDatabase';

// ── Types ──

interface CSHandoffPanelProps {
  session: DiscoverySession;
  themeColor: string;
  onUpdate: (fields: Partial<Pick<DiscoverySession, HandoffFieldKey>>) => void;
}

// ── Shared Styles ──

const inputClass =
  'w-full bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3 text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all';

const selectClass =
  'w-full bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3 text-stone-800 text-sm focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all appearance-none cursor-pointer';

const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5';

const hintClass = 'mt-1 flex items-center gap-1 text-[11px] text-stone-400';

// ── Reusable Inputs ──

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/60 cursor-pointer hover:bg-stone-100 transition-colors">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0 ${
          checked ? 'bg-stone-900' : 'bg-stone-300'
        }`}
        style={{ width: 40, height: 22 }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-[18px]' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

function SegmentedControl({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            value === opt.value
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ChipSelect({ selected, onChange, options }: { selected: string[]; onChange: (v: string[]) => void; options: string[] }) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
            selected.includes(opt)
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200/60 hover:border-stone-400 hover:bg-stone-50'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function NumberInput({ value, onChange, placeholder, suffix }: { value: number; onChange: (v: number) => void; placeholder: string; suffix?: string }) {
  return (
    <div className="relative">
      <input
        type="number"
        min="0"
        value={value || ''}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        placeholder={placeholder}
        className={inputClass}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

// ── Section Definitions ──

interface SectionDef {
  id: string;
  icon: typeof Server;
  title: string;
  sectionKey: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'tech', icon: Server, title: 'Technical Environment', sectionKey: 'tech' },
  { id: 'brand', icon: Globe, title: 'Career Site & Brand', sectionKey: 'brand' },
  { id: 'org', icon: Building2, title: 'Org Structure', sectionKey: 'org' },
  { id: 'data', icon: Database, title: 'Data Migration', sectionKey: 'data' },
  { id: 'integrations', icon: Puzzle, title: 'Integrations', sectionKey: 'integrations' },
  { id: 'training', icon: GraduationCap, title: 'Training & Go-Live', sectionKey: 'training' },
  { id: 'contacts', icon: Mail, title: 'Contacts', sectionKey: 'contacts' },
  { id: 'kpis', icon: Target, title: 'Success KPIs', sectionKey: 'kpis' },
  { id: 'compliance', icon: Shield, title: 'Compliance & Privacy', sectionKey: 'compliance' },
  { id: 'prework', icon: ClipboardList, title: 'Prospect Pre-Work', sectionKey: 'prework' },
];

// ── ATS Label Map ──

const ATS_LABELS: Record<string, string> = {
  greenhouse: 'Greenhouse', ashby: 'Ashby', bamboohr: 'BambooHR', lever: 'Lever',
  workday: 'Workday', icims: 'iCIMS', smartrecruiters: 'SmartRecruiters',
  workable: 'Workable', jazzhr: 'JazzHR', paycor: 'Paycor', other: 'Other',
};

// ── Main Component ──

export function CSHandoffPanel({ session, themeColor, onUpdate }: CSHandoffPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const readiness = useMemo(() => computeHandoffReadiness(session), [session]);

  const toggleSection = useCallback((id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const getSectionStatus = useCallback((key: string) => {
    const sec = readiness.sections[key];
    if (!sec) return 'empty';
    if (sec.filled >= sec.total) return 'complete';
    if (sec.filled > 0) return 'partial';
    return 'empty';
  }, [readiness]);

  // Render section content based on section id
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'tech':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>HRIS System</label>
              <select
                value={session.handoff_current_hris}
                onChange={e => onUpdate({ handoff_current_hris: e.target.value })}
                className={selectClass}
              >
                <option value="">Select HRIS…</option>
                {['Workday', 'BambooHR', 'SAP SuccessFactors', 'ADP', 'Paylocity', 'Paycom', 'UKG', 'Other', 'None'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Calendar System</label>
              <select
                value={session.handoff_calendar_system}
                onChange={e => onUpdate({ handoff_calendar_system: e.target.value })}
                className={selectClass}
              >
                <option value="">Select calendar…</option>
                {['Google Calendar', 'Microsoft Outlook', 'Office 365', 'Other'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>SSO Provider</label>
              <select
                value={session.handoff_sso_provider}
                onChange={e => onUpdate({ handoff_sso_provider: e.target.value })}
                className={selectClass}
              >
                <option value="">Select SSO…</option>
                {['Okta', 'Azure AD', 'OneLogin', 'Google Workspace', 'Other', 'None'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <Toggle
              checked={session.handoff_sso_required}
              onChange={v => onUpdate({ handoff_sso_required: v })}
              label="SSO Required for Login?"
            />
            <Toggle
              checked={session.handoff_infosec_review_required}
              onChange={v => onUpdate({ handoff_infosec_review_required: v })}
              label="InfoSec / Security Review Required?"
            />
          </div>
        );

      case 'brand':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Current Career Site URL</label>
              <input
                type="url"
                value={session.handoff_current_career_site_url}
                onChange={e => onUpdate({ handoff_current_career_site_url: e.target.value })}
                placeholder="https://careers.acme.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Custom Domain Needed</label>
              <input
                type="text"
                value={session.handoff_custom_domain}
                onChange={e => onUpdate({ handoff_custom_domain: e.target.value })}
                placeholder="careers.acme.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Employer Brand Maturity</label>
              <SegmentedControl
                value={session.handoff_brand_maturity}
                onChange={v => onUpdate({ handoff_brand_maturity: v as any })}
                options={[
                  { label: 'None', value: 'none' },
                  { label: 'Basic', value: 'basic' },
                  { label: 'Advanced', value: 'advanced' },
                ]}
              />
            </div>
          </div>
        );

      case 'org':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Departments</label>
                <NumberInput
                  value={session.handoff_department_count}
                  onChange={v => onUpdate({ handoff_department_count: v })}
                  placeholder="# of departments"
                />
              </div>
              <div>
                <label className={labelClass}>Locations</label>
                <NumberInput
                  value={session.handoff_location_count}
                  onChange={v => onUpdate({ handoff_location_count: v })}
                  placeholder="# of locations"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Hiring Managers</label>
                <NumberInput
                  value={session.handoff_active_hiring_managers}
                  onChange={v => onUpdate({ handoff_active_hiring_managers: v })}
                  placeholder="# of HMs"
                />
                {session.roi_inputs?.hiringManagers > 0 && (
                  <p className={hintClass}>
                    <Info size={10} />
                    Based on ROI: {session.roi_inputs.hiringManagers} HMs
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Recruiters</label>
                <NumberInput
                  value={session.handoff_active_recruiters}
                  onChange={v => onUpdate({ handoff_active_recruiters: v })}
                  placeholder="# of recruiters"
                />
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-4">
            {session.current_ats && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 border border-sky-200/60">
                <Sparkles size={12} className="text-sky-600" />
                <span className="text-xs font-semibold text-sky-700">
                  Migrating from: {ATS_LABELS[session.current_ats] || session.current_ats}
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Active Jobs</label>
                <NumberInput
                  value={session.handoff_active_jobs_count}
                  onChange={v => onUpdate({ handoff_active_jobs_count: v })}
                  placeholder="# of open jobs"
                />
              </div>
              <div>
                <label className={labelClass}>Candidate Count (est.)</label>
                <NumberInput
                  value={session.handoff_candidate_count_estimate}
                  onChange={v => onUpdate({ handoff_candidate_count_estimate: v })}
                  placeholder="# of candidates"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Migration Notes</label>
              <textarea
                value={session.handoff_data_migration_notes}
                onChange={e => onUpdate({ handoff_data_migration_notes: e.target.value })}
                placeholder="Custom fields, data format preferences, historical data needs…"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Job Boards</label>
              <ChipSelect
                selected={session.handoff_job_boards}
                onChange={v => onUpdate({ handoff_job_boards: v })}
                options={['Indeed', 'LinkedIn', 'Glassdoor', 'ZipRecruiter', 'Monster', 'CareerBuilder', 'Other']}
              />
            </div>
            <div>
              <label className={labelClass}>HRIS Integration</label>
              <input
                type="text"
                value={session.handoff_hris_integration}
                onChange={e => onUpdate({ handoff_hris_integration: e.target.value })}
                placeholder="Which HRIS to integrate with?"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Other Integrations</label>
              <ChipSelect
                selected={session.handoff_other_integrations}
                onChange={v => onUpdate({ handoff_other_integrations: v })}
                options={['Slack', 'Microsoft Teams', 'Zapier', 'Background Check', 'Assessment Tools', 'Other']}
              />
            </div>
          </div>
        );

      case 'training':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Users to Train</label>
              <NumberInput
                value={session.handoff_users_to_train}
                onChange={v => onUpdate({ handoff_users_to_train: v })}
                placeholder="Total users"
              />
            </div>
            <div>
              <label className={labelClass}>Preferred Format</label>
              <SegmentedControl
                value={session.handoff_training_format}
                onChange={v => onUpdate({ handoff_training_format: v as any })}
                options={[
                  { label: 'Live 1:1', value: 'live' },
                  { label: 'Webinar', value: 'webinar' },
                  { label: 'Self-Serve', value: 'self-serve' },
                ]}
              />
            </div>
            <div>
              <label className={labelClass}>Launch Type</label>
              <SegmentedControl
                value={session.handoff_launch_type}
                onChange={v => onUpdate({ handoff_launch_type: v as any })}
                options={[
                  { label: 'Phased', value: 'phased' },
                  { label: 'Big Bang', value: 'big-bang' },
                ]}
              />
            </div>
            <div>
              <label className={labelClass}>Training & Go-Live Notes</label>
              <textarea
                value={session.handoff_training_notes}
                onChange={e => onUpdate({ handoff_training_notes: e.target.value })}
                placeholder="Key users to train first, recruiter vs HM breakdown, launch plan, migration dependencies…"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Primary Contact Email</label>
              <input
                type="email"
                value={session.handoff_primary_contact_email}
                onChange={e => onUpdate({ handoff_primary_contact_email: e.target.value })}
                placeholder="project.lead@acme.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>IT / Security Contact Email</label>
              <input
                type="email"
                value={session.handoff_it_contact_email}
                onChange={e => onUpdate({ handoff_it_contact_email: e.target.value })}
                placeholder="it.admin@acme.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Preferred Communication Channel</label>
              <SegmentedControl
                value={session.handoff_preferred_comm_channel}
                onChange={v => onUpdate({ handoff_preferred_comm_channel: v as any })}
                options={[
                  { label: 'Email', value: 'email' },
                  { label: 'Slack', value: 'slack' },
                  { label: 'Teams', value: 'teams' },
                ]}
              />
            </div>
          </div>
        );

      case 'kpis':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Target Time-to-Hire</label>
                <NumberInput
                  value={session.handoff_target_time_to_hire}
                  onChange={v => onUpdate({ handoff_target_time_to_hire: v })}
                  placeholder="Days"
                  suffix="days"
                />
                {session.roi_inputs?.timeToHire > 0 && (
                  <p className={hintClass}>
                    <Info size={10} />
                    Current: {session.roi_inputs.timeToHire}d
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Target Cost-per-Hire</label>
                <NumberInput
                  value={session.handoff_target_cost_per_hire}
                  onChange={v => onUpdate({ handoff_target_cost_per_hire: v })}
                  placeholder="$"
                  suffix="$"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>HM Adoption Target</label>
                <NumberInput
                  value={session.handoff_target_adoption_rate}
                  onChange={v => onUpdate({ handoff_target_adoption_rate: v })}
                  placeholder="%"
                  suffix="%"
                />
              </div>
              <div>
                <label className={labelClass}>90-Day Review Date</label>
                <input
                  type="date"
                  value={session.handoff_success_review_date}
                  onChange={e => onUpdate({ handoff_success_review_date: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-4">
            <Toggle
              checked={session.handoff_gdpr_applicable}
              onChange={v => onUpdate({ handoff_gdpr_applicable: v })}
              label="GDPR Applicable?"
            />
            <div>
              <label className={labelClass}>Data Retention Period</label>
              <NumberInput
                value={session.handoff_data_retention_months}
                onChange={v => onUpdate({ handoff_data_retention_months: v })}
                placeholder="Months"
                suffix="months"
              />
            </div>
            <Toggle
              checked={session.handoff_dpa_required}
              onChange={v => onUpdate({ handoff_dpa_required: v })}
              label="DPA (Data Processing Agreement) Required?"
            />
            <div>
              <label className={labelClass}>Compliance Notes</label>
              <textarea
                value={session.handoff_compliance_notes}
                onChange={e => onUpdate({ handoff_compliance_notes: e.target.value })}
                placeholder="SOC2, ISO 27001, specific privacy requirements, cookie policy needs…"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        );

      case 'prework':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200/60">
              <Info size={12} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">
                Track items the prospect committed to preparing before implementation kickoff.
              </span>
            </div>
            <div>
              <label className={labelClass}>Pre-Work Checklist</label>
              <ChipSelect
                selected={session.handoff_prework_items || []}
                onChange={v => onUpdate({ handoff_prework_items: v } as any)}
                options={['Department List', 'User List', 'Brand Assets', 'Logo Files', 'Open Roles Data', 'Candidate Export', 'IT Security Docs', 'Legal Review', 'Other']}
              />
            </div>
            <div>
              <label className={labelClass}>Pre-Work Notes</label>
              <textarea
                value={(session as any).handoff_prework_notes || ''}
                onChange={e => onUpdate({ handoff_prework_notes: e.target.value } as any)}
                placeholder="Specific deliverables, deadlines, who is responsible on the prospect side…"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Progress color based on score
  const progressColor = readiness.score >= 80 ? '#10b981' : readiness.score >= 40 ? '#f59e0b' : themeColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-16 rounded-2xl border border-stone-200/60 bg-white shadow-sm overflow-hidden"
    >
      {/* ── Main Header (always visible) ── */}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center gap-4 p-5 hover:bg-stone-50/50 transition-colors text-left"
      >
        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${themeColor}12` }}
        >
          <ArrowRightLeft size={18} style={{ color: themeColor }} />
        </div>

        {/* Title + progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-sm font-bold text-stone-900">CS Handoff Readiness</h3>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: readiness.score >= 80 ? '#10b98115' : readiness.score >= 40 ? '#f59e0b15' : `${themeColor}12`,
                color: progressColor,
              }}
            >
              {readiness.score}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: progressColor }}
                initial={{ width: 0 }}
                animate={{ width: `${readiness.score}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[11px] font-medium text-stone-400 shrink-0">
              {readiness.filled}/{readiness.total} fields
            </span>
          </div>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-stone-400" />
        </motion.div>
      </button>

      {/* ── Expandable Content ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 px-5 pb-5 pt-3">
              <p className="text-xs text-stone-400 mb-4">
                Fill in what you know during the sales cycle — CS will thank you on Day 1. Fields auto-save.
              </p>

              {/* Section Accordions */}
              <div className="space-y-2">
                {SECTIONS.map((sec, i) => {
                  const Icon = sec.icon;
                  const status = getSectionStatus(sec.sectionKey);
                  const isSecOpen = openSections.has(sec.id);
                  const sectionData = readiness.sections[sec.sectionKey];

                  return (
                    <div
                      key={sec.id}
                      className={`rounded-xl border transition-all ${
                        isSecOpen ? 'border-stone-300 shadow-sm' : 'border-stone-200/60'
                      }`}
                    >
                      {/* Section Header */}
                      <button
                        type="button"
                        onClick={() => toggleSection(sec.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50/50 transition-colors text-left rounded-xl"
                      >
                        <Icon
                          size={15}
                          className={status === 'complete' ? 'text-emerald-500' : 'text-stone-400'}
                        />
                        <span className="flex-1 text-sm font-semibold text-stone-800">{sec.title}</span>

                        {/* Status indicator */}
                        {status === 'complete' ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : status === 'partial' ? (
                          <div className="flex items-center gap-1.5">
                            <AlertCircle size={12} className="text-amber-400" />
                            <span className="text-[10px] font-medium text-amber-500">
                              {sectionData?.filled}/{sectionData?.total}
                            </span>
                          </div>
                        ) : (
                          <Circle size={14} className="text-stone-300" />
                        )}

                        <motion.div
                          animate={{ rotate: isSecOpen ? 180 : 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <ChevronDown size={14} className="text-stone-400" />
                        </motion.div>
                      </button>

                      {/* Section Content */}
                      <AnimatePresence>
                        {isSecOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1 border-t border-stone-100">
                              {renderSection(sec.id)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
