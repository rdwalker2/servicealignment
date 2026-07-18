import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Copy, ChevronDown, ChevronUp, Sparkles, BookOpen } from 'lucide-react';
import { getGranolaApiKey, setGranolaApiKey, fetchRecentNotes } from '../../lib/granolaClient';
import { getOpenAIKey, setOpenAIKey, isAutoExtractEnabled, setAutoExtractEnabled } from '../../lib/granolaLLMExtractor';

const RECIPE_TEXT = `Analyze this meeting and extract the following in this exact format:

Q1 — Core Problem: [Yes/Maybe/No] — [evidence]
Q2 — Stakeholders: [Yes/Maybe/No] — [evidence]
Q3 — Cost of Indecision: [Yes/Maybe/No] — [evidence]
Q4 — Priority Level: [Yes/Maybe/No] — [evidence]
Q5 — Prior Solutions: [Yes/Maybe/No] — [evidence]
Q6 — Root Cause: [Yes/Maybe/No] — [evidence]
Q7 — External Help: [Yes/Maybe/No] — [evidence]
Q8 — Budget: [Yes/Maybe/No] — [evidence]
Q9 — Proof: [Yes/Maybe/No] — [evidence]
Q10 — Solution Map: [Yes/Maybe/No] — [evidence]
Q11 — Success Metrics: [Yes/Maybe/No] — [evidence]
Q12 — Confidence: [1-10]

M — Metrics: [how they'll measure success]
E — Economic Buyer: [who controls budget]
I — Identify Pain: [their pain in their own words]
D — Decision Criteria: [what they're evaluating against]
D — Decision Process: [steps to signed contract]
P — Paper Process: [procurement/legal steps]
C — Champion: [internal champion name + title]
C — Competition: [other vendors being evaluated]

MAP Action Items:
- Owner: [name] | Task: [action] | Date: [YYYY-MM-DD]`;

interface GranolaSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GranolaSettingsDrawer({ isOpen, onClose }: GranolaSettingsDrawerProps) {
  const [apiKey, setApiKeyValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // OpenAI state
  const [openaiKey, setOpenaiKeyValue] = useState('');
  const [autoExtract, setAutoExtractValue] = useState(true);
  const [openaiSaved, setOpenaiSaved] = useState(false);

  // Recipe state
  const [recipeExpanded, setRecipeExpanded] = useState(false);
  const [recipeCopied, setRecipeCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existingKey = getGranolaApiKey();
      if (existingKey) {
        setApiKeyValue(existingKey);
        setStatus('idle');
      }

      const existingOpenAIKey = getOpenAIKey();
      if (existingOpenAIKey) {
        setOpenaiKeyValue(existingOpenAIKey);
        setOpenaiSaved(true);
      } else {
        setOpenaiSaved(false);
      }

      setAutoExtractValue(isAutoExtractEnabled());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    if (!apiKey.trim()) {
      setStatus('error');
      setErrorMsg('API Key is required');
      return;
    }

    setStatus('testing');
    setGranolaApiKey(apiKey.trim());

    try {
      // Test the key by fetching recent notes
      await fetchRecentNotes(1);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to connect. Please check your API key.');
      // Keep the bad key in state but clear it from local storage so it doesn't cause hidden errors elsewhere
      localStorage.removeItem('granola_api_key');
    }
  };

  const handleSaveOpenAIKey = () => {
    if (openaiKey.trim()) {
      setOpenAIKey(openaiKey.trim());
      setOpenaiSaved(true);
      setTimeout(() => setOpenaiSaved(false), 2000);
    }
  };

  const handleAutoExtractToggle = () => {
    const next = !autoExtract;
    setAutoExtractValue(next);
    setAutoExtractEnabled(next);
  };

  const handleCopyRecipe = async () => {
    try {
      await navigator.clipboard.writeText(RECIPE_TEXT);
      setRecipeCopied(true);
      setTimeout(() => setRecipeCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = RECIPE_TEXT;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setRecipeCopied(true);
      setTimeout(() => setRecipeCopied(false), 2000);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] transition-opacity" 
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-[110] flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F05A28]/10 text-[#F05A28]">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Granola Integration</h2>
              <p className="text-sm text-stone-500">Connect your Granola AI account</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ── Section 1: Granola API Key ── */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-stone-900 mb-2">How to get your API Key</h3>
            <ol className="list-decimal list-inside text-sm text-stone-600 space-y-1.5">
              <li>Open your Granola Desktop app</li>
              <li>Go to <strong>Settings</strong> &gt; <strong>Connectors</strong></li>
              <li>Under <strong>API Keys</strong>, click "Create Key"</li>
              <li>Select the "Personal notes" scope</li>
              <li>Copy the key (starts with <code>grn_</code>) and paste it below</li>
            </ol>
            <a 
              href="https://docs.granola.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F05A28] mt-3 hover:underline"
            >
              Read Granola API Docs <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKeyValue(e.target.value);
                setStatus('idle');
              }}
              placeholder="grn_..."
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F05A28]/20 focus:border-[#F05A28] transition-all"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p>Connected successfully!</p>
            </div>
          )}

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs font-medium text-stone-400">AI-Powered Extraction</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* ── Section 2: OpenAI / AI Auto-Extract ── */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">AI Auto-Extract</h3>
                <p className="text-xs text-stone-500">OpenAI-powered transcript analysis</p>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Automatically extract BAP answers, MEDDPICC fields, and deal intelligence from Granola transcripts using AI.
            </p>

            {/* OpenAI API Key */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-stone-600">OpenAI API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => {
                    setOpenaiKeyValue(e.target.value);
                    setOpenaiSaved(false);
                  }}
                  onBlur={() => {
                    if (openaiKey.trim()) handleSaveOpenAIKey();
                  }}
                  placeholder="sk-..."
                  className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
                <button
                  onClick={handleSaveOpenAIKey}
                  disabled={!openaiKey.trim()}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                >
                  {openaiSaved ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                      Saved
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>

            {/* Auto-extract toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-600">Auto-extract from synced notes</label>
              <button
                onClick={handleAutoExtractToggle}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
 autoExtract ? 'bg-violet-600' : 'bg-stone-300'
 }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
 autoExtract ? 'translate-x-[18px]' : 'translate-x-[3px]'
 }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              Uses GPT-4o-mini (~$0.02-0.10 per call). Your key is stored locally.
            </p>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs font-medium text-stone-400">Granola Recipe</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* ── Section 3: Granola Recipe (Layer 2 Fallback) ── */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Granola Recipe (Free Tier)</h3>
                <p className="text-xs text-stone-500">Manual extraction fallback</p>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              If you don't have Granola API access, add this recipe to your Granola app. After each call, run it and paste the output into the platform.
            </p>

            {/* Expand / Copy controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRecipeExpanded(!recipeExpanded)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                {recipeExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Hide Recipe
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Show Recipe
                  </>
                )}
              </button>
              <button
                onClick={handleCopyRecipe}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                {recipeCopied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Recipe code block */}
            {recipeExpanded && (
              <div className="relative">
                <button
                  onClick={handleCopyRecipe}
                  className="absolute top-2 right-2 p-1.5 text-stone-500 hover:text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-md transition-colors"
                  title="Copy recipe"
                >
                  {recipeCopied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <pre className="bg-stone-900 text-stone-300 font-mono text-xs p-4 rounded-xl overflow-x-auto max-h-[320px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {RECIPE_TEXT}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 bg-stone-50/50">
          <button
            onClick={handleSaveAndTest}
            disabled={!apiKey.trim() || status === 'testing'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F05A28] hover:bg-[#D94E20] text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[#F05A28]/20"
          >
            {status === 'testing' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </>
            ) : (
              'Save & Test Connection'
            )}
          </button>
        </div>
      </div>
    </>
  );
}
