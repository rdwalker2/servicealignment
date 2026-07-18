// ── Audience Manager ──
// Admin-only component for creating audiences, importing CSVs, and exporting to Clay
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Upload, Download, Trash2, X, Check, Loader2, Users,
  Globe, Building2, ArrowRight, FileSpreadsheet, AlertCircle
} from 'lucide-react';
import {
  fetchAudienceSummaries, fetchAudienceSeeds, importAudienceSeeds,
  updateSeedStatus, deleteAudience, generateClayCSV, parseCSV,
  type AudienceSummary, type AudienceSeed
} from '../../lib/audienceDb';

export default function AudienceManager() {
  const [summaries, setSummaries] = useState<AudienceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  const [seeds, setSeeds] = useState<AudienceSeed[]>([]);
  const [loadingSeeds, setLoadingSeeds] = useState(false);

  const loadSummaries = useCallback(async () => {
    setLoading(true);
    const data = await fetchAudienceSummaries();
    setSummaries(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadSummaries(); }, [loadSummaries]);

  const handleSelectAudience = async (source: string) => {
    setSelectedAudience(source);
    setLoadingSeeds(true);
    const data = await fetchAudienceSeeds(source);
    setSeeds(data);
    setLoadingSeeds(false);
  };

  const handleExportForClay = (source: string) => {
    const audienceSeeds = seeds.length > 0 && seeds[0].audience_source === source
      ? seeds
      : [];
    if (audienceSeeds.length === 0) return;

    const csv = generateClayCSV(audienceSeeds);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audience-${source}-for-clay-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    // Mark as sent
    updateSeedStatus(source, 'sent_to_clay');
    loadSummaries();
  };

  const handleDeleteAudience = async (source: string) => {
    if (!confirm(`Delete the "${source}" audience? This removes the seed list only — enriched signals in the Signal Board are not affected.`)) return;
    await deleteAudience(source);
    setSelectedAudience(null);
    setSeeds([]);
    loadSummaries();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-stone-900">Audience Builder</h2>
          <p className="text-[11px] text-stone-400 mt-0.5">Build target account lists → Export to Clay for enrichment → Signals surface in Signal Board</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-[11px] font-semibold rounded-lg hover:bg-stone-800 transition-colors"
        >
          <Plus size={12} /> New Audience
        </button>
      </div>

      {/* Pipeline visual */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 rounded-lg border border-stone-100 text-[10px] text-stone-500">
        <span className="flex items-center gap-1 font-semibold text-stone-700"><FileSpreadsheet size={11} /> TheirStack CSV</span>
        <ArrowRight size={10} />
        <span className="flex items-center gap-1 font-semibold text-stone-700"><Upload size={11} /> Import Here</span>
        <ArrowRight size={10} />
        <span className="flex items-center gap-1 font-semibold text-stone-700"><Download size={11} /> Export to Clay</span>
        <ArrowRight size={10} />
        <span className="flex items-center gap-1 font-semibold text-stone-700"><Building2 size={11} /> Signal Board</span>
      </div>

      {/* Audience Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-stone-400"><Loader2 size={16} className="animate-spin" /></div>
      ) : summaries.length === 0 ? (
        <div className="text-center py-12">
          <Users size={24} className="mx-auto text-stone-300 mb-2" />
          <p className="text-[12px] text-stone-400">No audiences yet. Click "New Audience" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {summaries.map(s => (
            <div
              key={s.audience_source}
              onClick={() => handleSelectAudience(s.audience_source)}
              className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                selectedAudience === s.audience_source
                  ? 'border-stone-900 bg-stone-50 shadow-md'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold text-stone-900 capitalize">{s.audience_source}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                  s.pending === s.count ? 'bg-amber-100 text-amber-700' :
                  s.sent_to_clay > 0 && s.enriched === 0 ? 'bg-blue-100 text-blue-700' :
                  s.enriched > 0 ? 'bg-emerald-100 text-emerald-700' :
                  'bg-stone-100 text-stone-500'
                }`}>
                  {s.pending === s.count ? 'Ready' : s.enriched > 0 ? 'Enriched' : 'In Clay'}
                </span>
              </div>
              <div className="text-[20px] font-bold text-stone-900 mb-1">{s.count.toLocaleString()}</div>
              <div className="text-[10px] text-stone-400">accounts</div>
              <div className="flex items-center gap-3 mt-3 text-[9px] text-stone-400">
                <span>{s.pending} pending</span>
                <span>{s.sent_to_clay} in Clay</span>
                <span>{s.enriched} enriched</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Audience Detail */}
      <AnimatePresence>
        {selectedAudience && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-stone-200 rounded-xl bg-white">
              {/* Detail header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-bold text-stone-900 capitalize">{selectedAudience}</h3>
                  <span className="text-[10px] text-stone-400">{seeds.length} accounts</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExportForClay(selectedAudience)}
                    disabled={seeds.length === 0}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 text-white text-[10px] font-semibold rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-40"
                  >
                    <Download size={11} /> Export for Clay
                  </button>
                  <button
                    onClick={() => handleDeleteAudience(selectedAudience)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete audience"
                  >
                    <Trash2 size={12} />
                  </button>
                  <button
                    onClick={() => { setSelectedAudience(null); setSeeds([]); }}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Account list */}
              <div className="max-h-[300px] overflow-y-auto">
                {loadingSeeds ? (
                  <div className="flex items-center justify-center py-8"><Loader2 size={14} className="animate-spin text-stone-400" /></div>
                ) : (
                  <table className="w-full text-[11px]">
                    <thead className="sticky top-0 bg-stone-50 border-b border-stone-100">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold text-stone-500">Company</th>
                        <th className="text-left px-3 py-2 font-semibold text-stone-500">Domain</th>
                        <th className="text-left px-3 py-2 font-semibold text-stone-500">Location</th>
                        <th className="text-right px-3 py-2 font-semibold text-stone-500">Employees</th>
                        <th className="text-left px-3 py-2 font-semibold text-stone-500">Provider</th>
                        <th className="text-left px-3 py-2 font-semibold text-stone-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seeds.slice(0, 100).map(s => (
                        <tr key={s.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                          <td className="px-4 py-2 font-medium text-stone-800">{s.company_name}</td>
                          <td className="px-3 py-2 text-stone-500">{s.company_domain}</td>
                          <td className="px-3 py-2 text-stone-500">{s.company_location || '—'}</td>
                          <td className="px-3 py-2 text-right text-stone-500">{s.employee_count?.toLocaleString() || '—'}</td>
                          <td className="px-3 py-2 text-stone-500">{s.current_ats || '—'}</td>
                          <td className="px-3 py-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              s.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              s.status === 'sent_to_clay' ? 'bg-blue-100 text-blue-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>{s.status.replace('_', ' ')}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {seeds.length > 100 && (
                  <div className="text-center text-[10px] text-stone-400 py-2">Showing first 100 of {seeds.length} accounts</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Audience Modal */}
      <AnimatePresence>
        {showNewModal && (
          <NewAudienceModal
            onClose={() => setShowNewModal(false)}
            onCreated={() => { setShowNewModal(false); loadSummaries(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


// ── New Audience Modal ──
function NewAudienceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [market, setMarket] = useState('us');
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; duplicates: number } | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target?.result as string || '');
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!name.trim()) { setError('Audience name is required'); return; }
    if (!csvText.trim()) { setError('Upload a CSV file'); return; }

    setImporting(true);
    setError('');
    try {
      const audienceTag = name.trim().toLowerCase().replace(/\s+/g, '_');
      const rows = parseCSV(csvText, audienceTag, market);
      if (rows.length === 0) { setError('No valid rows found in CSV. Check that it has company_name or company_domain columns.'); setImporting(false); return; }
      const res = await importAudienceSeeds(rows);
      setResult(res);
      if (res.inserted > 0) {
        setTimeout(() => onCreated(), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-white rounded-xl shadow-2xl z-50 border border-stone-200"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="text-[14px] font-bold text-stone-900">New Audience</h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"><X size={14} /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Audience Name */}
          <div>
            <label className="text-[11px] font-semibold text-stone-600 block mb-1">Audience Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Rippling Displacement, ADP Migration"
              className="w-full px-3 py-2 text-[12px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 placeholder-stone-400"
            />
            {name && <div className="text-[9px] text-stone-400 mt-1">Tag: <code className="bg-stone-100 px-1 py-0.5 rounded">{name.trim().toLowerCase().replace(/\s+/g, '_')}</code></div>}
          </div>

          {/* Market */}
          <div>
            <label className="text-[11px] font-semibold text-stone-600 block mb-1">Market</label>
            <div className="flex gap-2">
              {([['us', '🇺🇸 United States'], ['ca', '🇨🇦 Canada']] as const).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setMarket(k)}
                  className={`flex-1 px-3 py-2 text-[11px] font-semibold rounded-lg border transition-all ${
                    market === k ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                  }`}
                >{l}</button>
              ))}
            </div>
          </div>

          {/* CSV Upload */}
          <div>
            <label className="text-[11px] font-semibold text-stone-600 block mb-1">Upload CSV</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-stone-200 rounded-lg p-6 text-center cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-all"
            >
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              {fileName ? (
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  <span className="text-[12px] font-semibold text-stone-800">{fileName}</span>
                  <Check size={14} className="text-emerald-500" />
                </div>
              ) : (
                <>
                  <Upload size={20} className="mx-auto text-stone-300 mb-2" />
                  <p className="text-[11px] text-stone-500">Drop a CSV from TheirStack or click to upload</p>
                  <p className="text-[9px] text-stone-400 mt-1">Accepts: company_name, domain, employees, ats, location, industry</p>
                </>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={12} className="text-red-500 shrink-0" />
              <span className="text-[11px] text-red-700">{error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Check size={12} className="text-emerald-500 shrink-0" />
              <span className="text-[11px] text-emerald-700">
                Imported {result.inserted} accounts{result.duplicates > 0 ? ` (${result.duplicates} duplicates skipped)` : ''}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-stone-100 bg-stone-50 rounded-b-xl">
          <button onClick={onClose} className="px-3 py-1.5 text-[11px] font-semibold text-stone-500 hover:text-stone-700 transition-colors">Cancel</button>
          <button
            onClick={handleImport}
            disabled={importing || !name.trim() || !csvText.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-stone-900 text-white text-[11px] font-semibold rounded-lg hover:bg-stone-800 disabled:opacity-40 transition-colors"
          >
            {importing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            {importing ? 'Importing...' : 'Import Audience'}
          </button>
        </div>
      </motion.div>
    </>
  );
}
