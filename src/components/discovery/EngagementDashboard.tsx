// ============================================================
// EngagementDashboard.tsx — Prospect room engagement analytics
// Shows who viewed the room, what sections they spent time on,
// interaction events, scroll depth, and engagement alerts.
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Clock, TrendingUp, BarChart3, AlertTriangle,
  Activity, MousePointerClick, ArrowDown, ExternalLink,
  RefreshCw, Sparkles, Users, ChevronDown, ChevronUp,
} from 'lucide-react';
import { EngagementTracker, type RoomEngagementData, type SectionEngagement } from '../../lib/EngagementTracker';

interface EngagementDashboardProps {
  sessionId: string;
  companyName: string;
}

// ── Alerts ──

interface EngagementAlert {
  type: 'success' | 'warning' | 'danger' | 'info';
  icon: string;
  message: string;
}

function computeAlerts(data: RoomEngagementData | null): EngagementAlert[] {
  const alerts: EngagementAlert[] = [];
  if (!data) {
    alerts.push({ type: 'info', icon: '👀', message: "Room hasn't been opened yet. Share the link to start tracking engagement." });
    return alerts;
  }

  const lastActive = new Date(data.lastActiveAt);
  const hoursSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
  const sections = Object.values(data.sections);
  const totalTime = data.totalTimeSeconds;
  const sectionCount = sections.length;

  // Positive signals
  if (data.totalPageViews >= 3) {
    alerts.push({ type: 'success', icon: '🔥', message: `${data.totalPageViews} return visits — strong buying signal.` });
  } else if (data.totalPageViews === 2) {
    alerts.push({ type: 'success', icon: '✅', message: 'Prospect returned for a second visit.' });
  }

  if (totalTime > 300) {
    alerts.push({ type: 'success', icon: '⏱️', message: `${EngagementTracker.formatTime(totalTime)} total time — deep engagement.` });
  }

  // ROI section engagement
  const roiSection = data.sections['roi'];
  if (roiSection && roiSection.totalSeconds > 30) {
    alerts.push({ type: 'success', icon: '💰', message: `Spent ${EngagementTracker.formatTime(roiSection.totalSeconds)} on ROI Calculator — they're building their business case.` });
  }

  // MAP engagement
  const mapSection = data.sections['map'];
  if (mapSection && mapSection.totalSeconds > 20) {
    alerts.push({ type: 'success', icon: '🗺️', message: 'Engaged with Mutual Action Plan — signal of commitment.' });
  }

  // Warning signals
  if (hoursSinceActive > 168) { // 7 days
    alerts.push({ type: 'danger', icon: '🔴', message: `No activity in ${Math.floor(hoursSinceActive / 24)} days — engagement decaying.` });
  } else if (hoursSinceActive > 72) { // 3 days
    alerts.push({ type: 'warning', icon: '🟡', message: `Last active ${Math.floor(hoursSinceActive / 24)} days ago — consider re-engaging.` });
  }

  if (sectionCount <= 2 && totalTime > 30) {
    alerts.push({ type: 'warning', icon: '⚠️', message: `Only viewed ${sectionCount} section${sectionCount !== 1 ? 's' : ''} — they may not have scrolled through.` });
  }

  if (data.scrollDepth < 50 && totalTime > 60) {
    alerts.push({ type: 'warning', icon: '📜', message: `Scroll depth only ${data.scrollDepth}% — content below the fold wasn't seen.` });
  }

  // Competitive section check
  const compSection = data.sections['ats-kill'];
  if (compSection && compSection.totalSeconds > 60) {
    alerts.push({ type: 'info', icon: '⚔️', message: `Spent ${EngagementTracker.formatTime(compSection.totalSeconds)} on Competitive Analysis — they're comparing vendors.` });
  }

  return alerts;
}

// ── Section Bar Chart ──

function SectionBar({ section, maxSeconds }: { section: SectionEngagement; maxSeconds: number }) {
  const pct = maxSeconds > 0 ? (section.totalSeconds / maxSeconds) * 100 : 0;
  const barColor = section.totalSeconds > 60 ? '#10b981' : section.totalSeconds > 20 ? '#f59e0b' : '#94a3b8';

  return (
    <div className="flex items-center gap-3 group">
      <span className="text-[10px] font-medium text-stone-500 w-28 truncate shrink-0" title={section.label}>
        {section.label}
      </span>
      <div className="flex-1 h-5 bg-stone-100 rounded-md overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(pct, 2)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-md"
          style={{ backgroundColor: barColor }}
        />
        <span className="absolute right-2 top-0.5 text-[9px] font-bold text-stone-500">
          {EngagementTracker.formatTime(section.totalSeconds)}
        </span>
      </div>
      <span className="text-[9px] text-stone-400 w-8 text-right shrink-0">
        {section.viewCount}×
      </span>
    </div>
  );
}

// ── Event Timeline ──

function EventTimeline({ events }: { events: RoomEngagementData['events'] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? events : events.slice(-5);

  if (events.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-bold text-stone-400 flex items-center gap-1.5">
          <Activity size={10} />
          Activity Timeline
        </h4>
        {events.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[9px] font-medium text-stone-400 hover:text-stone-600 flex items-center gap-0.5"
          >
            {expanded ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
            {expanded ? 'Collapse' : `Show all ${events.length}`}
          </button>
        )}
      </div>
      <div className="space-y-1">
        {shown.map((event, i) => {
          const time = new Date(event.timestamp);
          const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          const dateStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <div key={i} className="flex items-center gap-2 py-1">
              <span className="text-[9px] text-stone-300 w-16 shrink-0 text-right">{dateStr} {timeStr}</span>
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
 event.type === 'page_view' ? 'bg-blue-400' :
 event.type === 'interaction' ? 'bg-emerald-400' :
 event.type === 'section_view' ? 'bg-violet-400' :
 'bg-stone-300'
 }`} />
              <span className="text-[10px] text-stone-600 truncate">{event.detail || event.type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ──

export function EngagementDashboard({ sessionId, companyName }: EngagementDashboardProps) {
  const [data, setData] = useState<RoomEngagementData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Poll Supabase for engagement data every 10 seconds (localStorage fallback)
  useEffect(() => {
    const fetchEngagement = async () => {
      const result = await EngagementTracker.readFromSupabase(sessionId);
      if (result) {
        setData(result);
      } else {
        // Fallback to localStorage for same-browser testing
        const local = EngagementTracker.findBySessionId(sessionId);
        if (local) setData(local);
      }
    };
    fetchEngagement();
    const interval = setInterval(fetchEngagement, 10_000);
    return () => clearInterval(interval);
  }, [sessionId, refreshKey]);

  const alerts = useMemo(() => computeAlerts(data), [data]);
  const sections = useMemo(() =>
    data ? Object.values(data.sections).sort((a, b) => b.totalSeconds - a.totalSeconds) : []
  , [data]);
  const maxSeconds = sections.length > 0 ? sections[0].totalSeconds : 1;

  const handleRefresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50/30">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Eye size={16} className="text-blue-500" />
              Room Analytics
            </h2>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Track how {companyName} engages with their Discovery Room.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-bold text-stone-500 hover:bg-stone-50 transition-colors"
          >
            <RefreshCw size={10} />
            Refresh
          </button>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            icon={<Eye size={14} />}
            label="Page Views"
            value={data ? String(data.totalPageViews) : '0'}
            color="blue"
            detail={data ? `First: ${new Date(data.firstVisitAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Not yet viewed'}
          />
          <MetricCard
            icon={<Clock size={14} />}
            label="Total Time"
            value={data ? EngagementTracker.formatTime(data.totalTimeSeconds) : '0s'}
            color="emerald"
            detail={data ? EngagementTracker.timeSinceActive(data) : 'Never'}
          />
          <MetricCard
            icon={<BarChart3 size={14} />}
            label="Sections Viewed"
            value={data ? `${Object.keys(data.sections).length}` : '0'}
            color="violet"
            detail={data ? `of 14 total` : 'None'}
          />
          <MetricCard
            icon={<ArrowDown size={14} />}
            label="Scroll Depth"
            value={data ? `${data.scrollDepth}%` : '0%'}
            color="amber"
            detail={data && data.scrollDepth >= 80 ? 'Full coverage' : data && data.scrollDepth >= 50 ? 'Partial' : 'Shallow'}
          />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-stone-400 flex items-center gap-1.5">
              <Sparkles size={10} />
              Engagement Signals
            </h3>
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 rounded-xl px-4 py-2.5 border ${
 alert.type === 'success' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-700' :
 alert.type === 'warning' ? 'bg-amber-50/70 border-amber-200 text-amber-700' :
 alert.type === 'danger' ? 'bg-red-50/70 border-red-200 text-red-700' :
 'bg-blue-50/70 border-blue-200 text-blue-700'
 }`}
              >
                <span className="text-sm shrink-0 mt-0.5">{alert.icon}</span>
                <p className="text-[11px] font-medium leading-snug">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Section Engagement Breakdown */}
        {sections.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h3 className="text-[11px] font-bold text-stone-700 mb-4 flex items-center gap-1.5">
              <BarChart3 size={12} className="text-violet-500" />
              Section-by-Section Breakdown
            </h3>
            <div className="space-y-2">
              {sections.map(sec => (
                <SectionBar key={sec.sectionId} section={sec} maxSeconds={maxSeconds} />
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-100">
              <span className="flex items-center gap-1 text-[9px] text-stone-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> &gt;1 min
              </span>
              <span className="flex items-center gap-1 text-[9px] text-stone-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 20s–1 min
              </span>
              <span className="flex items-center gap-1 text-[9px] text-stone-400">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> &lt;20s
              </span>
              <span className="text-[9px] text-stone-300 ml-auto">×  = view count</span>
            </div>
          </div>
        )}

        {/* Visit Timeline (if we have data) */}
        {data && data.events.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <EventTimeline events={data.events} />
          </div>
        )}

        {/* Empty state */}
        {!data && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
              <Eye size={20} className="text-stone-400" />
            </div>
            <h3 className="text-sm font-bold text-stone-700 mb-1">No Analytics Yet</h3>
            <p className="text-[11px] text-stone-400 mb-4 max-w-xs mx-auto">
              Share the Discovery Room link with {companyName}. Once they open it, you'll see real-time engagement data here.
            </p>
            <div className="flex items-center justify-center gap-4 text-[10px] text-stone-400">
              <span className="flex items-center gap-1"><Eye size={10} /> Page views</span>
              <span className="flex items-center gap-1"><Clock size={10} /> Time on page</span>
              <span className="flex items-center gap-1"><BarChart3 size={10} /> Section breakdown</span>
              <span className="flex items-center gap-1"><Activity size={10} /> Activity timeline</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Metric Card ──

function MetricCard({
  icon, label, value, color, detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'emerald' | 'violet' | 'amber';
  detail: string;
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    violet: 'bg-violet-50 text-violet-600 border-violet-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <div className={`rounded-xl border p-3 ${colors[color]}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[9px] font-bold opacity-70">{label}</span>
      </div>
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="text-[9px] mt-1 opacity-60">{detail}</p>
    </div>
  );
}
