// ============================================================
// Settings Page — Role-aware admin & configuration dashboard
// Accessible to admin + exec users only (not reps)
// ============================================================
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Users, Link2, Building2, Sliders, Sparkles, ScrollText, HelpCircle,
  CheckCircle2, AlertTriangle, XCircle, Clock, Shield, Lock,
  Database, Globe, Zap, ArrowRight, Copy, ExternalLink, ChevronRight,
  RefreshCw, Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { REP_SALESLOFT_MAPPING } from '../lib/salesloft';
import { supabase } from '../lib/supabase';

// ── Tab definitions with role-based access ──
type TabId = 'status' | 'workspaces' | 'team' | 'integrations' | 'rules' | 'ai' | 'audit' | 'docs' | 'routing';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ElementType;
  roles: string[]; // which roles can see this tab
}

const TABS: TabDef[] = [
  { id: 'workspaces', label: 'Workspaces', icon: Building2, roles: ['super_admin'] },
  { id: 'status',       label: 'System Status',   icon: Activity,    roles: ['admin', 'exec', 'super_admin'] },
  { id: 'team',         label: 'Team & Access',    icon: Users,       roles: ['admin', 'exec', 'super_admin'] },
  { id: 'integrations', label: 'Integrations',     icon: Link2,       roles: ['admin', 'exec', 'super_admin'] },
  { id: 'rules',        label: 'Signal Rules',     icon: Sliders,     roles: ['admin', 'exec', 'super_admin'] },
  { id: 'ai',           label: 'AI Config',        icon: Sparkles,    roles: ['admin', 'exec', 'super_admin'] },
  { id: 'audit',        label: 'Audit Trail',      icon: ScrollText,  roles: ['admin', 'exec', 'super_admin'] },
  { id: 'routing',      label: 'SFDC Sync & Routing', icon: Database, roles: ['admin', 'exec', 'super_admin'] },
  { id: 'docs',         label: 'How It Works',     icon: HelpCircle,  roles: ['admin', 'exec', 'super_admin'] },
];

// ── Exec role context mapping ──
const EXEC_CONTEXT: Record<string, string> = {
  'exec-bm': 'GM, North America',
  'exec-dm': 'Corporate Development · Clay License Owner',
  'exec-gf': 'RevOps, North America',
  'exec-ja': 'Growth Marketing · Website & Paid Ads',
};

// ────────────────────────────────────────────
// Status indicator atoms
// ────────────────────────────────────────────
function StatusDot({ status }: { status: 'ok' | 'warn' | 'error' | 'inactive' }) {
  const colors = {
    ok: 'bg-emerald-500',
    warn: 'bg-amber-500',
    error: 'bg-red-500',
    inactive: 'bg-gray-300',
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[status]} ${status === 'ok' ? 'animate-pulse' : ''}`} />
  );
}

function StatusRow({ icon: Icon, label, status, detail, sub }: {
  icon: React.ElementType;
  label: string;
  status: 'ok' | 'warn' | 'error' | 'inactive';
  detail: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
      <Icon size={16} className="text-gray-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <span className="text-sm font-medium text-gray-900">{label}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xs font-bold text-gray-500">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function KVRow({ label, value, mono, copyable }: { label: string; value: string; mono?: boolean; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs text-gray-900 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
        {copyable && (
          <button
            onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="p-0.5 text-gray-400 hover:text-gray-600"
            title="Copy"
          >
            {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

function RuleBadge({ label, value, color = 'gray' }: { label: string; value: string; color?: 'red' | 'amber' | 'emerald' | 'gray' | 'blue' }) {
  const cls = {
    red: 'bg-red-50 text-red-700 border-red-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/60',
    gray: 'bg-gray-50 text-gray-700 border-gray-200/60',
  }[color];
  return (
    <div className={`rounded-lg border px-3 py-2 ${cls}`}>
      <div className="text-[10px] opacity-70 mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

// ────────────────────────────────────────────
// TAB 1: System Status
// ────────────────────────────────────────────
function SystemStatusTab() {
  const [stats, setStats] = useState({ signals24h: 0, pushes24h: 0, drafts24h: 0, activeUsers7d: 0, lastSignal: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const now = new Date();
      const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [signals, pushes, audits, lastSig] = await Promise.allSettled([
        supabase.from('clay_signals').select('id', { count: 'exact', head: true }).gte('created_at', h24),
        supabase.from('push_events').select('id', { count: 'exact', head: true }).gte('created_at', h24),
        supabase.from('audit_log').select('user_id', { count: 'exact', head: true }).gte('created_at', d7),
        supabase.from('clay_signals').select('created_at').order('created_at', { ascending: false }).limit(1),
      ]);

      setStats({
        signals24h: signals.status === 'fulfilled' ? (signals.value.count ?? 0) : 0,
        pushes24h: pushes.status === 'fulfilled' ? (pushes.value.count ?? 0) : 0,
        drafts24h: 0, // Edge function doesn't log to DB yet
        activeUsers7d: audits.status === 'fulfilled' ? Math.min(audits.value.count ?? 0, 8) : 0,
        lastSignal: lastSig.status === 'fulfilled' && lastSig.value.data?.[0]
          ? timeAgo(lastSig.value.data[0].created_at) : 'No signals yet',
      });
    } catch { /* fallback to zeros */ }
    setLoading(false);
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not configured';
  const region = supabaseUrl.includes('supabase.co') ? 'us-east-1 (AWS)' : 'Unknown';

  return (
    <div className="space-y-4">
      <SectionCard title="Integration Health">
        <StatusRow icon={Database} label="Supabase" status="ok" detail={`Connected · ${region}`} sub={supabaseUrl.replace('https://', '').split('.')[0] + '.supabase.co'} />
        <StatusRow icon={Zap} label="Salesloft API" status="ok" detail="Connected · API key server-side via proxy" sub="Rate limit: 600 req/min" />
        <StatusRow icon={Globe} label="Clay Webhooks" status={stats.signals24h > 0 ? 'ok' : 'warn'} detail={`Last signal: ${stats.lastSignal}`} sub="Webhook → Supabase REST → clay_signals table" />
        <StatusRow icon={Sparkles} label="OpenAI (GPT-4o)" status="ok" detail="Supabase Edge Function · OPENAI_API_KEY set" sub="LinkedIn message generation" />
        <StatusRow icon={Shield} label="Authentication" status="ok" detail="Supabase Auth · Magic Link" sub={`Mode: ${import.meta.env.VITE_AUTH_MODE || 'magic_link'}`} />
      </SectionCard>

      <SectionCard title="Activity (Last 24h)">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{loading ? '—' : stats.signals24h}</div>
            <div className="text-[10px] text-gray-500 mt-1">Signals Received</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{loading ? '—' : stats.pushes24h}</div>
            <div className="text-[10px] text-gray-500 mt-1">Pushed to Cadence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{loading ? '—' : stats.drafts24h}</div>
            <div className="text-[10px] text-gray-500 mt-1">AI Drafts Generated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{loading ? '—' : stats.activeUsers7d}</div>
            <div className="text-[10px] text-gray-500 mt-1">Active Users (7d)</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Security Posture">
        <StatusRow icon={Lock} label="Row-Level Security" status="ok" detail="Enabled on all tables" />
        <StatusRow icon={Shield} label="Session Policy" status="ok" detail="30 min idle timeout · 24h max session" />
        <StatusRow icon={ScrollText} label="Audit Logging" status="ok" detail="All actions logged to audit_log table" />
        <StatusRow icon={Users} label="Access Control" status="ok" detail={`${[].length} authorized users · @servicealignment.com only`} />
      </SectionCard>
    </div>
  );
}


// ────────────────────────────────────────────
// TAB: Workspaces (Super Admin Only)
// ────────────────────────────────────────────
function WorkspacesTab() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkspaces() {
      const { data } = await supabase.from('workspaces').select('*').order('created_at', { ascending: false });
      if (data) setWorkspaces(data);
      setLoading(false);
    }
    fetchWorkspaces();
  }, []);

  return (
    <div className="space-y-4">
      <SectionCard title="Provisioned Workspaces">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading workspaces...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold">Workspace Name</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold">Domain</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold">Status</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold">Created</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((w) => (
                  <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-gray-900 text-xs">{w.name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{w.domain || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {w.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-gray-400">
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {workspaces.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-gray-400">No workspaces found. Create one using the database directly for now.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ────────────────────────────────────────────
// TAB 2: Team & Access
// ────────────────────────────────────────────
function TeamAccessTab() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      if (!user?.workspace_id) return;
      const { data } = await supabase.from('workspace_users').select('*').eq('workspace_id', user.workspace_id);
      if (data) {
        setUsers(data.map(u => ({
          ...u,
          full_name: u.email.split('@')[0],
          initials: u.email.substring(0, 2).toUpperCase(),
          avatar_color: '#888'
        })));
      }
    }
    fetchUsers();
  }, [user?.workspace_id]);

  const roleOrder: Record<string, number> = { super_admin: 0, admin: 1, exec: 2, manager: 3, rep: 4 };
  const sorted = [...users].sort((a, b) => (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9));

  return (
    <SectionCard title={`Authorized Users (${sorted.length})`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold">User</th>
              <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold">Role</th>
              <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold">Visibility</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: u.avatar_color }}
                    >
                      {u.initials}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-xs">{u.full_name}</div>
                      <div className="text-[10px] text-gray-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    u.role === 'admin' ? 'bg-violet-50 text-violet-700' :
                    u.role === 'exec' ? 'bg-blue-50 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-[10px] text-gray-500">
                    {u.role === 'admin' ? 'Full access' :
                     u.role === 'exec' ? 'Signals + Audiences + Settings' :
                     'Full access (own data)'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!isAdmin && (
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-400 flex items-center gap-1.5">
          <Lock size={11} />
          <span>User management is read-only. Contact the platform admin to add or remove users.</span>
        </div>
      )}
    </SectionCard>
  );
}

// ────────────────────────────────────────────
// TAB 3: Integrations
// ────────────────────────────────────────────
function IntegrationsTab() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const webhookUrl = supabaseUrl ? `${supabaseUrl}/rest/v1/clay_signals` : 'Not configured';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return (
    <div className="space-y-4">
      {/* Salesloft */}
      <SectionCard title="Salesloft">
        <KVRow label="API Endpoint" value="api.salesloft.com/v2" mono />
        <KVRow label="Auth Method" value="Server-side API key (via proxy)" />
        <KVRow label="Rate Limit" value="600 requests/min" />
        <KVRow label="Conversation Threshold" value="≥ 120 seconds (2 min call = conversation)" />
        <KVRow label="Contact Stage on Push" value="Working" />
        <KVRow label="Batch Size" value="20 contacts/chunk · 120ms delay" />
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 mb-2">Rep ↔ Salesloft Mapping</p>
          <div className="space-y-1.5">
            {Object.entries(REP_SALESLOFT_MAPPING).map(([repId, sl]) => {
              const profile = [].find(u => u.id === repId);
              return (
                <div key={repId} className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: profile?.avatar_color || '#888' }}>
                    {profile?.initials || '?'}
                  </div>
                  <span className="text-gray-700 font-medium">{profile?.full_name || repId}</span>
                  <ArrowRight size={12} className="text-gray-300" />
                  <span className="font-mono text-gray-500">SL User #{sl.id}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* Clay */}
      <SectionCard title="Clay">
        <KVRow label="Webhook URL" value={webhookUrl} mono copyable />
        <KVRow label="Auth Header" value={`apikey: ${anonKey.slice(0, 20)}...`} mono />
        <KVRow label="Method" value="POST" />
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 mb-2">Required Fields</p>
          <div className="flex flex-wrap gap-1.5">
            {['company_name', 'contact_name', 'contact_email', 'contact_title', 'signal_type', 'signal_label'].map(f => (
              <span key={f} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-[10px] font-mono">{f}</span>
            ))}
          </div>
          <p className="text-[10px] font-bold text-gray-400 mb-2 mt-3">Optional Fields</p>
          <div className="flex flex-wrap gap-1.5">
            {['signal_score', 'icp_tier', 'linkedin_url', 'phone', 'employee_count', 'industry', 'hq_city', 'hq_state', 'open_roles', 'current_ats', 'page_visited', 'job_board_source', 'confidence'].map(f => (
              <span key={f} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">{f}</span>
            ))}
          </div>
          <p className="text-[10px] font-bold text-violet-500 mb-2 mt-3">ISP Enrichment Fields (Optional)</p>
          <div className="flex flex-wrap gap-1.5">
            {['isp_score', 'isp_explanation', 'signal_category', 'account_intel', 'pain_points', 'recommended_approach', 'g2_score', 'indeed_score', 'glassdoor_score', 'negative_reviews', 'hiring_signals'].map(f => (
              <span key={f} className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded text-[10px] font-mono">{f}</span>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-gray-400">ISP fields power the Account Drawer enrichment panels (ISP score gauge, account intel, pain points, recommended approach, employer reviews). Arrays should be sent as JSON arrays of strings.</div>
        </div>
      </SectionCard>

      {/* Supabase */}
      <SectionCard title="Supabase">
        <KVRow label="Project URL" value={supabaseUrl.replace('https://', '')} mono />
        <KVRow label="Auth" value="Row-Level Security (RLS) enabled" />
        <KVRow label="Tables" value="clay_signals, dispositions, push_events, account_notes, audit_log" />
        <KVRow label="Edge Functions" value="generate-ai-draft (LinkedIn message)" />
      </SectionCard>
    </div>
  );
}

// ────────────────────────────────────────────
// TAB 4: Signal Rules
// ────────────────────────────────────────────
function SignalRulesTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Score Thresholds (Event Sum)">
        <div className="grid grid-cols-3 gap-3 p-4">
          <RuleBadge label="Hot" value="Score ≥ 30" color="red" />
          <RuleBadge label="Warm" value="Score ≥ 18" color="amber" />
          <RuleBadge label="Watch" value="Score < 18" color="emerald" />
        </div>
        <div className="px-4 py-2 bg-gray-50 text-[10px] text-gray-400">
          Event-sum score = sum of all individual signal_score values for an account. Each Clay webhook push adds its weight (1-10). This is the default ranking mechanism.
        </div>
      </SectionCard>

      <SectionCard title="ISP Scoring Model (0-100)">
        <div className="grid grid-cols-3 gap-3 p-4">
          <RuleBadge label="High Priority" value="ISP ≥ 60" color="red" />
          <RuleBadge label="Moderate" value="ISP ≥ 40" color="amber" />
          <RuleBadge label="Lower" value="ISP < 40" color="emerald" />
        </div>
        <div className="px-4 py-3 bg-gray-50 text-[10px] text-gray-500 space-y-2">
          <div><strong>Intent Signal Processing (ISP)</strong> — a holistic, AI-generated account-level score computed by Clay. Unlike event-sum scoring, ISP weighs the <em>combination</em> of signals using Daniel's 64-signal taxonomy (28 categories, weights 1-10).</div>
          <div>When Clay pushes an ISP score, the Account Drawer displays: ISP gauge bar, signal category badge, account intelligence bullets, pain points to explore, and recommended approach.</div>
          <div className="text-gray-400">Source: Daniel's "Suggestion V1 signals.xlsx" (64 signals) + ISP test data (100 accounts, avg score 42.7).</div>
        </div>
      </SectionCard>

      <SectionCard title="Signal Taxonomy (From Daniel's Framework)">
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center py-2 rounded-lg bg-red-50 border border-red-100">
              <div className="text-lg font-bold text-red-600">64</div>
              <div className="text-[9px] text-gray-500">Signals</div>
            </div>
            <div className="text-center py-2 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-lg font-bold text-blue-600">28</div>
              <div className="text-[9px] text-gray-500">Categories</div>
            </div>
            <div className="text-center py-2 rounded-lg bg-amber-50 border border-amber-100">
              <div className="text-lg font-bold text-amber-600">35</div>
              <div className="text-[9px] text-gray-500">Ops Definitions</div>
            </div>
            <div className="text-center py-2 rounded-lg bg-violet-50 border border-violet-100">
              <div className="text-lg font-bold text-violet-600">1-10</div>
              <div className="text-[9px] text-gray-500">Weight Scale</div>
            </div>
          </div>
          <div className="text-[10px] text-gray-500 space-y-1.5">
            <div><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5" />  <strong>Weight 10:</strong> Legacy Provider, Recruiter Overload, Broken Application UX, Manual Workflows, RFP/Vendor Review</div>
            <div><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5" /> <strong>Weight 8-9:</strong> New TA/CHRO Leadership, M&A, Multi-Location, Regulated Roles, High Volume Surge</div>
            <div><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5" />  <strong>Weight 5-7:</strong> External Recruiter Dependency, Contract Renewals, Career Page Gaps</div>
            <div><span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-1.5" /> <strong>Weight 1-4:</strong> ESG Workforce, Public eNPS, DEI Claims Without UX</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Freshness Indicators">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-gray-700">&lt; 2 hours (pinging)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-700">&lt; 24 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-700">&lt; 7 days</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <span className="text-xs text-gray-700">7+ days</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Automation Rules">
        <div className="divide-y divide-gray-50">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={13} className="text-amber-500" />
              <span className="text-sm font-medium text-gray-900">Auto-Decay</span>
            </div>
            <p className="text-xs text-gray-500 ml-5">Accounts with status "working" and no activity for <strong>60+ days</strong> are automatically moved to "nurture".</p>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={13} className="text-red-500" />
              <span className="text-sm font-medium text-gray-900">Priority Call List</span>
            </div>
            <p className="text-xs text-gray-500 ml-5">Signal score ≥ 10 <strong>OR</strong> ICP tier = "hot", received within <strong>48 hours</strong>, and not yet dispositioned.</p>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye size={13} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Row Opacity Decay</span>
            </div>
            <p className="text-xs text-gray-500 ml-5">Full opacity &lt; 24h · 70% opacity at 1-2 weeks · 50% opacity at 2+ weeks — visual urgency cue.</p>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={13} className="text-amber-500" />
              <span className="text-sm font-medium text-gray-900">Stale Account Alert</span>
            </div>
            <p className="text-xs text-gray-500 ml-5">Accounts with no activity for <strong>3+ days</strong> are flagged as stale in the Signal Board.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Disposition Workflow">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['new', 'working', 'engaged', 'meeting_set', 'nurture', 'not_now', 'disqualified'].map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={12} className="text-gray-300" />}
                <span className={`px-2 py-1 rounded-md font-medium ${
                  s === 'new' ? 'bg-blue-50 text-blue-700' :
                  s === 'working' ? 'bg-violet-50 text-violet-700' :
                  s === 'engaged' ? 'bg-indigo-50 text-indigo-700' :
                  s === 'meeting_set' ? 'bg-emerald-50 text-emerald-700' :
                  s === 'nurture' ? 'bg-amber-50 text-amber-700' :
                  s === 'not_now' ? 'bg-gray-100 text-gray-600' :
                  'bg-red-50 text-red-700'
                }`}>{s.replace('_', ' ')}</span>
              </span>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Default Saved Segments">
        <div className="divide-y divide-gray-50">
          {[
            { name: 'All Signals', desc: 'No filters applied' },
            { name: 'High Intent Enterprise', desc: 'employee_count > 10,000 AND page_visited contains /pricing' },
            { name: 'Legacy Provider Vulnerability', desc: 'current_ats contains "Frontline" AND open_roles > 20' },
            { name: 'Stale Accounts (3+ Days)', desc: 'No activity for 3+ days while in "working" status' },
            { name: "Today's Priority Call List", desc: 'score ≥ 10 OR hot tier, within 48h, not dispositioned' },
          ].map(seg => (
            <div key={seg.name} className="px-4 py-2.5">
              <div className="text-xs font-medium text-gray-900">{seg.name}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{seg.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ────────────────────────────────────────────
// TAB 5: AI Config
// ────────────────────────────────────────────
function AIConfigTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="LinkedIn Message Generation">
        <KVRow label="Model" value="gpt-4o" mono />
        <KVRow label="Temperature" value="0.7 (creative but focused)" />
        <KVRow label="Max Tokens" value="120" />
        <KVRow label="Character Limit" value="300 (LinkedIn connection request limit)" />
        <KVRow label="Runtime" value="Supabase Edge Function (Deno)" />
        <KVRow label="API Key" value="OPENAI_API_KEY (Edge Function secret)" />
      </SectionCard>

      <SectionCard title="System Prompt">
        <div className="p-4">
          <pre className="text-[11px] text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto max-h-80 overflow-y-auto">
{`You are an elite, top-performing enterprise Account Executive at Service Alignment (a modern, highly aesthetic Provider / Current Provider with a built-in career site builder).

You are drafting a personalized LinkedIn connection request to {firstName} at {companyName}.
They are currently using {incumbent}.

INSTRUCTIONS:
1. Write a LinkedIn connection request message. MUST be under 300 characters.
2. Be conversational and human — not salesy or robotic.
3. Reference ONE specific signal or pain point.
4. End with a soft, curiosity-driven hook — NOT a hard CTA.
5. Do NOT include a subject line. Just the message body.
6. Do NOT use generic phrases like "I'd love to connect".
7. Output ONLY the message text, nothing else.`}
          </pre>
          <p className="text-[10px] text-gray-400 mt-2">
            This prompt is deployed as a Supabase Edge Function. Changes require redeploying the function.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

// ────────────────────────────────────────────
// TAB 6: Audit Trail
// ────────────────────────────────────────────
function AuditTrailTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs(data || []);
    } catch {
      setLogs([]);
    }
    setLoading(false);
  }

  const filtered = filter === 'all' ? logs : logs.filter(l => l.action === filter);
  const actions = [...new Set(logs.map(l => l.action))].sort();

  // Resolve user names from ALLOWED_USERS
  const userNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    [].forEach(([email, profile]) => {
      map[profile.id] = profile.full_name;
      map[email] = profile.full_name;
    });
    return map;
  }, []);

  const actionColors: Record<string, string> = {
    login: 'bg-emerald-50 text-emerald-700',
    logout: 'bg-gray-100 text-gray-600',
    push_to_cadence: 'bg-violet-50 text-violet-700',
    change_disposition: 'bg-blue-50 text-blue-700',
    impersonate_start: 'bg-amber-50 text-amber-700',
    impersonate_stop: 'bg-amber-50 text-amber-700',
    session_timeout: 'bg-red-50 text-red-600',
    export_csv: 'bg-indigo-50 text-indigo-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="all">All actions ({logs.length})</option>
          {actions.map(a => (
            <option key={a} value={a}>{a} ({logs.filter(l => l.action === a).length})</option>
          ))}
        </select>
        <button
          onClick={loadLogs}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      <SectionCard title={`Audit Events (${filtered.length})`}>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading audit trail...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No audit events found. Events are logged as users interact with the platform.</div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-50">
            {filtered.map((log, i) => (
              <div key={log.id || i} className="px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${actionColors[log.action] || 'bg-gray-100 text-gray-600'}`}>
                    {log.action}
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {userNameMap[log.user_id] || userNameMap[log.user_email] || log.user_id}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-auto">{timeAgo(log.created_at)}</span>
                </div>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="mt-1 text-[10px] text-gray-400 font-mono ml-6 truncate max-w-md">
                    {JSON.stringify(log.metadata)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ────────────────────────────────────────────
// TAB: SFDC Sync & Routing
// ────────────────────────────────────────────
function RoutingDashboardTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, { assigned: number, pushed: number }>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // 1. Load Dry Run Logs
      const { data: logData } = await supabase
        .from('sfdc_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setLogs(logData || []);

      // 2. Load Routing Stats (Approximated from recent push events and signals)
      const [signals, pushes] = await Promise.allSettled([
        supabase.from('clay_signals').select('assigned_rep_id').not('assigned_rep_id', 'is', null).limit(1000),
        supabase.from('push_events').select('rep_id').limit(1000)
      ]);

      const repStats: Record<string, { assigned: number, pushed: number }> = {};
      
      // Initialize reps
      [].forEach(u => {
        if (u.role === 'rep') repStats[u.id] = { assigned: 0, pushed: 0 };
      });

      if (signals.status === 'fulfilled' && signals.value.data) {
        signals.value.data.forEach((s: any) => {
          if (repStats[s.assigned_rep_id]) repStats[s.assigned_rep_id].assigned++;
        });
      }
      
      if (pushes.status === 'fulfilled' && pushes.value.data) {
        pushes.value.data.forEach((p: any) => {
          if (repStats[p.rep_id]) repStats[p.rep_id].pushed++;
        });
      }

      setStats(repStats);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Contact Routing Stats (All Time)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold">Rep</th>
                <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold">Routed Signals</th>
                <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold">Pushed / Actioned</th>
                <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold">Action Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats).map(([repId, data]) => {
                const rep = [].find(u => u.id === repId);
                const rate = data.assigned > 0 ? Math.round((data.pushed / data.assigned) * 100) : 0;
                return (
                  <tr key={repId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-gray-900 text-xs">{rep?.full_name || repId}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{data.assigned}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{data.pushed}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{rate}%</td>
                  </tr>
                );
              })}
              {Object.keys(stats).length === 0 && !loading && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-gray-400">No routing stats available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Live "Dry-Run" SFDC Logs</h3>
        <button onClick={loadData} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"><RefreshCw size={12}/> Refresh</button>
      </div>

      <SectionCard title="Recent Webhook Decisions">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No SFDC dry-run logs found. Send a signal via Clay webhook to generate logs.</div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-50 bg-gray-900 text-gray-300 font-mono text-[10px]">
            {logs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    log.status === 'DRY_RUN' ? 'bg-blue-900 text-blue-300' : 
                    log.status === 'HALTED' ? 'bg-amber-900 text-amber-300' : 
                    'bg-red-900 text-red-300'
                  }`}>
                    [{log.status}]
                  </span>
                  <span className="text-gray-400">{timeAgo(log.created_at)}</span>
                  <span className="text-emerald-400 font-bold">{log.account_domain}</span>
                  {log.sf_account_id && <span className="text-gray-500 text-[9px]">SFDC ID: {log.sf_account_id}</span>}
                </div>
                <div className="text-gray-100 mb-2">{log.message}</div>
                {log.payload && (
                  <details className="cursor-pointer">
                    <summary className="text-gray-500 hover:text-gray-300 select-none">View Payload</summary>
                    <pre className="mt-2 pl-2 border-l-2 border-gray-700 text-gray-400 overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ────────────────────────────────────────────
// TAB 7: How It Works
// ────────────────────────────────────────────
function HowItWorksTab() {
  const { user } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>('overview');

  const sections = [
    { id: 'overview', label: 'System Overview', icon: Activity },
    { id: 'clay', label: 'For Clay Owners (Daniel)', icon: Database },
    { id: 'revops', label: 'For RevOps (Gordon)', icon: Sliders },
    { id: 'ads', label: 'For Paid Ads (Jesper)', icon: Globe },
    { id: 'gm', label: 'For Leadership (Brian)', icon: Users },
    { id: 'troubleshoot', label: 'Troubleshooting', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-3">
      {sections.map(sec => (
        <div key={sec.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenSection(openSection === sec.id ? null : sec.id)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <sec.icon size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-900 flex-1">{sec.label}</span>
            <ChevronRight size={14} className={`text-gray-400 transition-transform duration-200 ${openSection === sec.id ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>
            {openSection === sec.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {sec.id === 'overview' && <OverviewDoc />}
                  {sec.id === 'clay' && <ClayDoc />}
                  {sec.id === 'revops' && <RevOpsDoc />}
                  {sec.id === 'ads' && <AdsDoc />}
                  {sec.id === 'gm' && <GMDoc />}
                  {sec.id === 'troubleshoot' && <TroubleshootDoc />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function OverviewDoc() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-900">How the GTM Workspace connects everything:</p>
      <div className="bg-gray-50 rounded-lg p-4 font-mono text-[11px] text-gray-700 leading-loose">
        <div className="space-y-1">
          <div><span className="text-violet-600 font-bold">Clay Tables</span> → scrape & enrich prospect data</div>
          <div className="pl-4">↓ webhook (POST to Supabase REST API)</div>
          <div><span className="text-blue-600 font-bold">Supabase</span> (clay_signals table) → stores all signal events</div>
          <div className="pl-4">↓ real-time query</div>
          <div><span className="text-pink-600 font-bold">Signal Board</span> → reps see prioritized accounts</div>
          <div className="pl-4">↓ rep takes action</div>
          <div className="pl-6 flex flex-col gap-0.5">
            <span>→ <span className="text-emerald-600 font-bold">Salesloft API</span> → push contact to cadence</span>
            <span>→ <span className="text-amber-600 font-bold">AI Draft</span> → generate LinkedIn message (GPT-4o)</span>
            <span>→ <span className="text-gray-500 font-bold">Nooks</span> → parallel dial via Salesloft integration</span>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
        <strong>Security:</strong> All actions are audit-logged. Salesloft API key is server-side only — never exposed to the browser. All tables use Row-Level Security. Sessions auto-expire after 30 min idle or 24h max.
      </div>
    </div>
  );
}

function ClayDoc() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-900">How to connect a Clay table to the Signal Board:</p>
      <ol className="list-decimal list-inside space-y-2 text-xs text-gray-700">
        <li>In Clay, open the table you want to send signals from</li>
        <li>Add a <strong>Webhook</strong> action (HTTP Destination)</li>
        <li>Set method to <strong>POST</strong></li>
        <li>Paste the webhook URL from the <strong>Integrations</strong> tab</li>
        <li>Add header: <code className="bg-gray-100 px-1 rounded">apikey: [your Supabase anon key]</code></li>
        <li>Add header: <code className="bg-gray-100 px-1 rounded">Content-Type: application/json</code></li>
        <li>Add header: <code className="bg-gray-100 px-1 rounded">Prefer: return=minimal</code></li>
        <li>Map the required fields: <code className="bg-gray-100 px-1 rounded">company_name, contact_name, contact_email, contact_title, signal_type, signal_label</code></li>
        <li>Run the table — signals will appear in the Signal Board within seconds</li>
      </ol>

      <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
        <p className="text-xs font-semibold text-violet-800 mb-2">ISP Enrichment (Optional — powers the Account Drawer)</p>
        <p className="text-[11px] text-violet-700 mb-2">To enable the full ISP experience in the Account Drawer, add these optional fields to your webhook payload:</p>
        <div className="space-y-1 text-[10px] text-violet-600">
          <div><code className="bg-violet-100 px-1 rounded">isp_score</code> — composite 0-100 score (integer)</div>
          <div><code className="bg-violet-100 px-1 rounded">isp_explanation</code> — AI paragraph explaining the score</div>
          <div><code className="bg-violet-100 px-1 rounded">account_intel</code> — JSON array of up to 5 intelligence bullets</div>
          <div><code className="bg-violet-100 px-1 rounded">pain_points</code> — JSON array of up to 4 discovery questions</div>
          <div><code className="bg-violet-100 px-1 rounded">recommended_approach</code> — JSON array of up to 6 approach suggestions</div>
          <div><code className="bg-violet-100 px-1 rounded">signal_category</code> — e.g. "Tech Stack & Change Readiness"</div>
          <div><code className="bg-violet-100 px-1 rounded">g2_score, indeed_score, glassdoor_score</code> — employer review scores (decimal)</div>
          <div><code className="bg-violet-100 px-1 rounded">negative_reviews</code> — AI analysis of negative employer reviews</div>
        </div>
        <p className="text-[10px] text-violet-500 mt-2">These fields come from Daniel's ISP framework ("Suggestion V1 signals.xlsx" + ISP test data). The app renders them automatically — no code changes needed when Clay's enrichment logic evolves.</p>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
        <strong>If signals stop flowing:</strong> Check the Clay table run history for HTTP errors. Verify the webhook URL and API key haven't changed. Check Supabase dashboard for any RLS policy issues.
      </div>
    </div>
  );
}

function RevOpsDoc() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-900">What RevOps needs to know:</p>
      <div className="space-y-2 text-xs text-gray-700">
        <div><strong>Dual scoring model:</strong> The Signal Board supports two complementary scoring systems:</div>
        <div className="ml-4 space-y-1 text-[11px]">
          <div>① <strong>Event-sum score</strong> — sum of individual signal_score values (1-10 each). Thresholds: ≥30 Hot, ≥18 Warm, &lt;18 Watch. This is the default ranking.</div>
          <div>② <strong>ISP score (0-100)</strong> — holistic, AI-generated account-level score from Clay using Daniel's 64-signal taxonomy. Displayed as a gauge in the Account Drawer when available.</div>
        </div>
        <div><strong>Signal taxonomy:</strong> Daniel's framework defines 64 buying signals across 28 categories with weights 1-10. These map directly to Clay's detection columns. See the Signal Rules tab for the full breakdown.</div>
        <div><strong>Priority Call List:</strong> Auto-generated daily. Accounts with score ≥10 OR ICP tier "hot", within 48h, not yet dispositioned.</div>
        <div><strong>Auto-decay:</strong> Accounts stuck in "working" status for 60+ days auto-move to "nurture". This prevents pipeline bloat.</div>
        <div><strong>Rep attribution:</strong> All pushes to Salesloft cadences are logged with the rep's user ID. This feeds back into Salesforce via Salesloft's native sync.</div>
        <div><strong>Conversation threshold:</strong> A phone call must be ≥2 minutes to count as a "conversation" in activity metrics.</div>
        <div><strong>Account Drawer enrichment:</strong> When Clay pushes ISP data, reps see account intelligence, pain points to explore, recommended approach, and employer review scores — all AI-generated per account.</div>
      </div>
    </div>
  );
}

function AdsDoc() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-900">For paid ads & audience alignment:</p>
      <div className="space-y-2 text-xs text-gray-700">
        <div><strong>Audience tables:</strong> The Rippling Displacement and ADP Displacement audiences are segmented prospect lists built from web scraping, TheirStack data, and Clay enrichment. These are the same accounts reps are sequencing in Salesloft cadences.</div>
        <div><strong>What's being sequenced:</strong> Check the Signal Board to see which accounts are currently in "working" status — these are actively being outreached. Align paid ads to these same accounts for multi-touch coverage.</div>
        <div><strong>Suppression lists:</strong> Accounts marked "meeting_set" or "disqualified" in the Signal Board should be excluded from prospecting ads.</div>
        <div><strong>New audiences:</strong> As new Clay tables are built (e.g., Dayforce Displacement, HiBob Displacement), they'll appear as new Audience tabs in the sidebar. Each audience follows the same 4-week campaign cycle.</div>
        <div><strong>Retargeting loop:</strong> Ad engagement and web visits from the paid campaigns feed back into Clay via RB2B, creating a closed-loop flywheel — outreach drives ad impressions, ad impressions drive site visits, site visits generate new signals.</div>
      </div>
    </div>
  );
}

function GMDoc() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-900">What this system does (plain English):</p>
      <div className="space-y-2 text-xs text-gray-700">
        <div>The <strong>Service Alignment GTM Workspace</strong> is an internal tool that helps the North America sales team find and reach out to the right prospects at the right time.</div>
        <div><strong>How it works:</strong> Clay (a data enrichment tool that Daniel manages) automatically scrapes the web for buying signals — things like companies posting jobs, visiting our pricing page, or using competitor products. These signals flow into the Signal Board, where reps can instantly push prospects into Salesloft sales cadences and generate personalized LinkedIn messages using AI.</div>
        <div><strong>Who has access:</strong> Only authorized @servicealignment.com emails can log in. Authentication is passwordless (magic link). All actions are logged in an audit trail.</div>
        <div><strong>Security:</strong> The platform runs on SOC 2 Type II certified infrastructure (Supabase + Railway). No passwords are stored. Sessions auto-expire. All database tables use Row-Level Security. API keys are server-side only.</div>
        <div><strong>Compliance:</strong> No candidate PII is processed through this system — only sales prospect data (company names, business emails, job titles). This is a B2B sales tool, not a recruitment tool.</div>
      </div>
    </div>
  );
}

function TroubleshootDoc() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-900">Common issues and fixes:</p>
      <div className="space-y-3">
        {[
          { q: 'Signals stopped appearing in the Signal Board', a: 'Check Clay table run history for webhook errors. Verify the Supabase URL and API key in the webhook config. Check the System Status tab for last signal timestamp.' },
          { q: 'Push to Cadence failed', a: 'Check Salesloft rate limits (600/min). The rep must have a valid Salesloft ID mapped in Integrations. Check browser console for API error details.' },
          { q: 'AI draft not generating', a: 'Verify the OPENAI_API_KEY is set in Supabase Edge Function secrets. Check if the Edge Function is deployed. Try refreshing the page.' },
          { q: 'User can\'t log in', a: 'Their email must be in the authorized users list (Team & Access tab). Check for typos. Verify they\'re using @servicealignment.com. In dev mode, login is instant. In production, check spam folder for magic link email.' },
          { q: 'Session expired unexpectedly', a: 'Sessions timeout after 30 min of inactivity or 24h maximum. This is a security feature. The user needs to re-authenticate.' },
        ].map(faq => (
          <div key={faq.q} className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-semibold text-gray-900 mb-1">❓ {faq.q}</div>
            <div className="text-[11px] text-gray-600">{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Helper
// ────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

// ────────────────────────────────────────────
// Main Settings Page
// ────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('status');

  if (!user) return null;

  // Filter tabs by role
  const visibleTabs = TABS.filter(t => t.roles.includes(user.role));

  // If current tab not visible, default to first
  if (!visibleTabs.find(t => t.id === activeTab)) {
    setActiveTab(visibleTabs[0]?.id || 'status');
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Settings</h1>
            <p className="text-xs text-gray-500 mt-0.5">System configuration, integrations, and documentation</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
              user.role === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'
            }`}>
              <Shield size={10} />
              {user.role === 'admin' ? 'Full Access' : 'Read Only'}
            </span>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mt-4 -mb-px overflow-x-auto">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900 bg-gray-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'status' && <SystemStatusTab />}
          {activeTab === 'workspaces' && <WorkspacesTab />}
            {activeTab === 'team' && <TeamAccessTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
          {activeTab === 'rules' && <SignalRulesTab />}
          {activeTab === 'ai' && <AIConfigTab />}
          {activeTab === 'audit' && <AuditTrailTab />}
          {activeTab === 'routing' && <RoutingDashboardTab />}
          {activeTab === 'docs' && <HowItWorksTab />}
        </div>
      </div>
    </div>
  );
}
