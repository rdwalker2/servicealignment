// ============================================================
// Clay Setup Panel — Admin-only configuration page for Daniel
// Shows the exact webhook URL, headers, and field mapping
// ============================================================
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, Zap, Database, ArrowRight, RefreshCw, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const WEBHOOK_URL = `${SUPABASE_URL}/rest/v1/clay_signals`;

// ── Copy button helper ──
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all bg-stone-100 text-stone-600 hover:bg-stone-200"
    >
      {copied ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} />}
      {copied ? 'Copied!' : (label || 'Copy')}
    </button>
  );
}

// ── Field mapping data ──
const FIELD_MAP = [
  { db: 'full_name', clay: 'Full Name', required: true, desc: 'Contact first + last name' },
  { db: 'email', clay: 'Email', required: true, desc: 'Contact email address' },
  { db: 'job_title', clay: 'Job Title', required: false, desc: 'Contact title / role' },
  { db: 'linkedin_url', clay: 'LinkedIn URL', required: false, desc: 'LinkedIn profile URL' },
  { db: 'phone', clay: 'Phone', required: false, desc: 'Direct phone number' },
  { db: 'company_name', clay: 'Company Name', required: true, desc: 'Account name' },
  { db: 'company_domain', clay: 'Company Domain', required: true, desc: 'Primary domain (e.g. acme.com)' },
  { db: 'company_location', clay: 'Location', required: false, desc: 'HQ city/state' },
  { db: 'employee_count', clay: 'Employee Count', required: false, desc: 'Company size (number)' },
  { db: 'open_roles', clay: 'Open Roles', required: false, desc: 'Active job postings count' },
  { db: 'current_ats', clay: 'Current ATS', required: false, desc: 'Current ATS vendor' },
  { db: 'signal_name', clay: 'Signal Name', required: true, desc: 'e.g. "Pricing Page Visit"' },
  { db: 'signal_source', clay: 'Signal Source', required: true, desc: 'rb2b | clay | linkedin | job_board' },
  { db: 'signal_score', clay: 'Signal Score', required: false, desc: 'Positive integer per signal (no fixed max — aggregated sums drive tier thresholds)' },
  { db: 'signal_description', clay: 'Signal Description', required: false, desc: 'Human-readable description' },
  { db: 'page_visited', clay: 'Page Visited', required: false, desc: 'URL of page visited' },
  { db: 'icp_tier', clay: 'ICP Tier', required: false, desc: 'hot | warm | watch' },
  { db: 'detected_at', clay: 'Detected At', required: false, desc: 'When signal was detected (ISO datetime)' },
  { db: 'assigned_rep_id', clay: 'Assigned Rep', required: false, desc: 'rep-jl | rep-ma | rep-th | admin-ryan' },
  { db: 'ai_research_brief', clay: 'AI Research Brief', required: false, desc: 'Claygent-generated summary' },
  // ── ISP Enrichment (from Clay's AI analysis) ──
  { db: 'account_intel', clay: 'Account Intel', required: false, desc: 'Array of up to 5 account intelligence bullets (TEXT[])' },
  { db: 'pain_points', clay: 'Pain Points', required: false, desc: 'Array of up to 4 pain point questions to explore (TEXT[])' },
  { db: 'recommended_approach', clay: 'Recommended Approach', required: false, desc: 'Array of up to 6 approach/positioning suggestions (TEXT[])' },
  { db: 'isp_explanation', clay: 'ISP Explanation', required: false, desc: 'AI-generated paragraph explaining the ISP score' },
  { db: 'isp_score', clay: 'ISP Score', required: false, desc: 'Composite Intent Signal Processing score (0-100)' },
  { db: 'g2_score', clay: 'G2 Score', required: false, desc: 'G2 employer review score' },
  { db: 'indeed_score', clay: 'Indeed Score', required: false, desc: 'Indeed employer review score' },
  { db: 'glassdoor_score', clay: 'Glassdoor Score', required: false, desc: 'Glassdoor employer review score' },
  { db: 'negative_reviews', clay: 'Negative Reviews', required: false, desc: 'AI analysis of negative employer reviews' },
  { db: 'signal_category', clay: 'Signal Category', required: false, desc: "e.g. 'Tech Stack & Change Readiness', 'Hiring Volume & Volatility'" },
  { db: 'hiring_signals', clay: 'Hiring Signals', required: false, desc: 'LinkedIn hiring signals detected' },
  // ── July Pilot & System Fields ──
  { db: 'sf_account_owner', clay: 'SF Account Owner', required: false, desc: 'Salesforce Account Owner Name' },
  { db: 'salesforce_account_id', clay: 'SF Account ID', required: false, desc: 'Salesforce Account ID' },
  { db: 'salesforce_contact_id', clay: 'SF Contact ID', required: false, desc: 'Salesforce Contact ID' },
  { db: 'contact_persona', clay: 'Contact Persona', required: false, desc: 'Clay AI classification (e.g. head_of_ta)' },
  { db: 'pages_visited_count', clay: 'Pages Visited Count', required: false, desc: 'Number of pages in web session' },
  { db: 'session_duration_seconds', clay: 'Session Duration', required: false, desc: 'Time on site in seconds' },
  { db: 'visited_pricing', clay: 'Visited Pricing', required: false, desc: 'Hit pricing page (boolean)' },
  { db: 'utm_source', clay: 'UTM Source', required: false, desc: 'Cadence attribution' },
  { db: 'utm_campaign', clay: 'UTM Campaign', required: false, desc: 'Campaign attribution' },
  { db: 'firmographic_tier', clay: 'Firmographic Tier', required: false, desc: 'ICP fit: tier_1, tier_2, tier_3' },
  { db: 'is_existing_customer', clay: 'Is Existing Customer', required: false, desc: 'Suppress from prospecting (boolean)' },
  { db: 'account_owner_email', clay: 'Account Owner Email', required: false, desc: 'Rep routing email' },
];

const JSON_BODY_TEMPLATE = `{
  "full_name":          "{{Full Name}}",
  "email":              "{{Email}}",
  "job_title":          "{{Job Title}}",
  "company_name":       "{{Company Name}}",
  "company_domain":     "{{Company Domain}}",
  "company_location":   "{{Location}}",
  "employee_count":     {{Employee Count}},
  "open_roles":         {{Open Roles}},
  "current_ats":        "{{Current ATS}}",
  "signal_name":        "{{Signal Name}}",
  "signal_source":      "{{Signal Source}}",
  "signal_score":       {{Signal Score}},
  "signal_description": "{{Signal Description}}",
  "page_visited":       "{{Page Visited}}",
  "icp_tier":           "{{ICP Tier}}",
  "detected_at":        "{{Detected At}}",
  "assigned_rep_id":    "{{Assigned Rep}}",
  "ai_research_brief":  "{{AI Research Brief}}",

  // ISP Enrichment (optional)
  "account_intel":      ["{{Account Intel Bullet 1}}", "..."],
  "pain_points":        ["{{Pain Point 1}}", "..."],
  "recommended_approach":["{{Approach 1}}", "..."],
  "isp_explanation":    "{{ISP Explanation}}",
  "isp_score":          {{ISP Score}},
  "g2_score":           {{G2 Score}},
  "indeed_score":       {{Indeed Score}},
  "glassdoor_score":    {{Glassdoor Score}},
  "negative_reviews":   "{{Negative Reviews}}",
  "signal_category":    "{{Signal Category}}",
  "hiring_signals":     "{{Hiring Signals}}",

  // July Pilot & System Fields
  "sf_account_owner":         "{{SF Account Owner}}",
  "salesforce_account_id":    "{{SF Account ID}}",
  "salesforce_contact_id":    "{{SF Contact ID}}",
  "contact_persona":          "{{Contact Persona}}",
  "pages_visited_count":      {{Pages Visited Count}},
  "session_duration_seconds": {{Session Duration}},
  "visited_pricing":          {{Visited Pricing}},
  "utm_source":               "{{UTM Source}}",
  "utm_campaign":             "{{UTM Campaign}}",
  "firmographic_tier":        "{{Firmographic Tier}}",
  "is_existing_customer":     {{Is Existing Customer}},
  "account_owner_email":      "{{Account Owner Email}}"
}`;

export default function ClaySetupPanel({ onClose }: { onClose: () => void }) {
  const [signalCount, setSignalCount] = useState<number | null>(null);
  const [lastSignalAt, setLastSignalAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    async function check() {
      setLoading(true);
      const { count } = await supabase
        .from('clay_signals')
        .select('*', { count: 'exact', head: true });
      setSignalCount(count ?? 0);

      const { data } = await supabase
        .from('clay_signals')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setLastSignalAt(data[0].created_at);
      }
      setLoading(false);
    }
    check();
  }, []);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center pt-12 overflow-y-auto pb-12"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl w-[680px] max-w-[95vw]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-stone-900">Clay → Signal Board Setup</h2>
                <p className="text-[11px] text-stone-500">One-time configuration for Daniel</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Connection Status */}
          <div className="mt-4 flex items-center gap-4 p-3 rounded-xl bg-stone-50 border border-stone-100">
            <div className="flex items-center gap-2">
              <Database size={13} className="text-stone-400" />
              <span className="text-[11px] text-stone-600">Supabase</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-emerald-600 font-medium">Connected</span>
            </div>
            <div className="w-px h-4 bg-stone-200" />
            <div className="flex items-center gap-2 text-[11px] text-stone-500">
              <span>{loading ? '...' : `${signalCount?.toLocaleString()} signals`}</span>
              {lastSignalAt && (
                <>
                  <span>·</span>
                  <span>Last received: {timeAgo(lastSignalAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

          {/* Step 1 */}
          <div
            className={`rounded-xl border transition-colors ${activeStep === 1 ? 'border-violet-200 bg-violet-50/30' : 'border-stone-100 bg-white'}`}
          >
            <button
              onClick={() => setActiveStep(activeStep === 1 ? 0 : 1)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${activeStep === 1 ? 'bg-violet-600 text-white' : 'bg-stone-200 text-stone-500'}`}>1</div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-stone-900">Add HTTP API Column in Clay</div>
                <div className="text-[11px] text-stone-500">Point it at the Signal Board webhook endpoint</div>
              </div>
            </button>
            {activeStep === 1 && (
              <div className="px-4 pb-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Method</label>
                    <CopyButton text="POST" />
                  </div>
                  <div className="font-mono text-[12px] bg-stone-900 text-emerald-400 px-3 py-2 rounded-lg">POST</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">URL</label>
                    <CopyButton text={WEBHOOK_URL} />
                  </div>
                  <div className="font-mono text-[11px] bg-stone-900 text-amber-300 px-3 py-2 rounded-lg break-all">{WEBHOOK_URL}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Headers</label>
                    <CopyButton text={`apikey: ${SUPABASE_ANON_KEY}\nAuthorization: Bearer ${SUPABASE_ANON_KEY}\nContent-Type: application/json\nPrefer: return=minimal`} label="Copy All" />
                  </div>
                  <div className="font-mono text-[10px] bg-stone-900 text-stone-300 px-3 py-2.5 rounded-lg space-y-1">
                    <div><span className="text-sky-400">apikey:</span> <span className="text-stone-500">{SUPABASE_ANON_KEY.substring(0, 30)}...</span></div>
                    <div><span className="text-sky-400">Authorization:</span> Bearer <span className="text-stone-500">{SUPABASE_ANON_KEY.substring(0, 20)}...</span></div>
                    <div><span className="text-sky-400">Content-Type:</span> application/json</div>
                    <div><span className="text-sky-400">Prefer:</span> return=minimal</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div
            className={`rounded-xl border transition-colors ${activeStep === 2 ? 'border-violet-200 bg-violet-50/30' : 'border-stone-100 bg-white'}`}
          >
            <button
              onClick={() => setActiveStep(activeStep === 2 ? 0 : 2)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${activeStep === 2 ? 'bg-violet-600 text-white' : 'bg-stone-200 text-stone-500'}`}>2</div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-stone-900">Map Your Clay Columns</div>
                <div className="text-[11px] text-stone-500">Set the JSON body template with your column variables</div>
              </div>
            </button>
            {activeStep === 2 && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">JSON Body Template</label>
                  <CopyButton text={JSON_BODY_TEMPLATE} label="Copy JSON" />
                </div>
                <div className="font-mono text-[10px] bg-stone-900 text-stone-300 px-3 py-3 rounded-lg whitespace-pre overflow-x-auto max-h-[240px]">
                  {JSON_BODY_TEMPLATE}
                </div>
                <div className="text-[10px] text-stone-500 flex items-center gap-1">
                  <span className="text-amber-500">⚠</span> Replace <code className="bg-stone-100 px-1 rounded text-[9px]">{`{{Column Name}}`}</code> with your actual Clay column variable names
                </div>
              </div>
            )}
          </div>

          {/* Step 3 - Field Reference */}
          <div
            className={`rounded-xl border transition-colors ${activeStep === 3 ? 'border-violet-200 bg-violet-50/30' : 'border-stone-100 bg-white'}`}
          >
            <button
              onClick={() => setActiveStep(activeStep === 3 ? 0 : 3)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${activeStep === 3 ? 'bg-violet-600 text-white' : 'bg-stone-200 text-stone-500'}`}>3</div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-stone-900">Field Reference</div>
                <div className="text-[11px] text-stone-500">{FIELD_MAP.filter(f => f.required).length} required, {FIELD_MAP.filter(f => !f.required).length} optional fields</div>
              </div>
            </button>
            {activeStep === 3 && (
              <div className="px-4 pb-4">
                <div className="rounded-lg border border-stone-200 overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-stone-50 text-[9px] font-bold uppercase tracking-wider text-stone-400">
                        <th className="px-3 py-2 text-left">DB Field</th>
                        <th className="px-3 py-2 text-left">Clay Column</th>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-center w-12">Req</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FIELD_MAP.map((f, i) => (
                        <tr key={f.db} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}`}>
                          <td className="px-3 py-1.5 font-mono text-violet-700">{f.db}</td>
                          <td className="px-3 py-1.5 text-stone-700">{f.clay}</td>
                          <td className="px-3 py-1.5 text-stone-500">{f.desc}</td>
                          <td className="px-3 py-1.5 text-center">
                            {f.required ? <span className="text-rose-500 font-bold">✓</span> : <span className="text-stone-300">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Step 4 - Rep IDs */}
          <div
            className={`rounded-xl border transition-colors ${activeStep === 4 ? 'border-violet-200 bg-violet-50/30' : 'border-stone-100 bg-white'}`}
          >
            <button
              onClick={() => setActiveStep(activeStep === 4 ? 0 : 4)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${activeStep === 4 ? 'bg-violet-600 text-white' : 'bg-stone-200 text-stone-500'}`}>4</div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-stone-900">Rep Assignment IDs</div>
                <div className="text-[11px] text-stone-500">Use these exact IDs in the assigned_rep_id field</div>
              </div>
            </button>
            {activeStep === 4 && (
              <div className="px-4 pb-4">
                <div className="rounded-lg border border-stone-200 overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-stone-50 text-[9px] font-bold uppercase tracking-wider text-stone-400">
                        <th className="px-3 py-2 text-left">Rep</th>
                        <th className="px-3 py-2 text-left">ID Value</th>
                        <th className="px-3 py-2 text-left">Outreach Tool</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-stone-100">
                        <td className="px-3 py-2 text-stone-700">Ryan Walker</td>
                        <td className="px-3 py-2 font-mono text-violet-700">admin-ryan</td>
                        <td className="px-3 py-2 text-stone-500">Instantly → Aimfox</td>
                      </tr>
                      <tr className="border-t border-stone-100 bg-stone-50/50">
                        <td className="px-3 py-2 text-stone-700">Jack Luther</td>
                        <td className="px-3 py-2 font-mono text-violet-700">rep-jl</td>
                        <td className="px-3 py-2 text-stone-500">Salesloft → Nooks</td>
                      </tr>
                      <tr className="border-t border-stone-100">
                        <td className="px-3 py-2 text-stone-700">Moe Aqel</td>
                        <td className="px-3 py-2 font-mono text-violet-700">rep-ma</td>
                        <td className="px-3 py-2 text-stone-500">Salesloft → Nooks</td>
                      </tr>
                      <tr className="border-t border-stone-100 bg-stone-50/50">
                        <td className="px-3 py-2 text-stone-700">Tyler Hanson</td>
                        <td className="px-3 py-2 font-mono text-violet-700">rep-th</td>
                        <td className="px-3 py-2 text-stone-500">Salesloft → Nooks</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-stone-400">
            <RefreshCw size={10} />
            Data flows in real-time once configured
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white text-[12px] font-semibold rounded-lg hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
