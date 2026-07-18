// ============================================================
// RoomBuilder — Create Discovery Room Wizard
// /team/discovery/create
// Allows reps to generate a personalized prospect room link
// in under 15 seconds — no manual base64 work needed.
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  Download,
} from 'lucide-react';
import QRCode from 'qrcode';
import { encodeRoomToken } from '../../lib/shareableRoom';
import { copyToClipboard } from '../../lib/shareableRoom';
import { useToast } from '../../components/ui/Toast';

// ── Types ──────────────────────────────────────────────────────────────────

interface RoomConfig {
  company: string;
  contactName?: string;
  accent: string;
  showPricing: boolean;
  customMessage?: string;
}

// ── Token generation ───────────────────────────────────────────────────────

function generateToken(config: RoomConfig): string {
  const payload = {
    company: config.company,
    accent: config.accent,
    showPricing: config.showPricing,
    ...(config.customMessage ? { customMessage: config.customMessage } : {}),
  };
  // Use the existing shareableRoom utility which does proper base64url encoding
  return encodeRoomToken(payload);
}

function generateUrl(config: RoomConfig): string {
  const token = generateToken(config);
  return `https://service-alignment-workspace.vercel.app/prospector/${token}`;
}

// ── Color presets ──────────────────────────────────────────────────────────

interface ColorSwatch {
  name: string;
  hex: string;
}

const COLOR_SWATCHES: ColorSwatch[] = [
  { name: 'Onyx', hex: '#000000' },
  { name: 'Navy', hex: '#0F172A' },
  { name: 'Forest', hex: '#064E3B' },
  { name: 'Slate', hex: '#1E3A5F' },
  { name: 'Crimson', hex: '#991B1B' },
  { name: 'Violet', hex: '#4C1D95' },
  { name: 'Orange', hex: '#7C2D12' },
  { name: 'Stone', hex: '#1c1917' },
];

// ── Step indicator ─────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${
              i + 1 === current
                ? 'bg-stone-900 text-white shadow-sm'
                : i + 1 < current
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-stone-100 text-stone-400 border border-stone-200/60'
            }`}
          >
            {i + 1 < current ? <Check size={12} /> : i + 1}
          </div>
          <span
            className={`text-xs font-semibold tracking-wide uppercase ${
              i + 1 === current ? 'text-stone-800' : i + 1 < current ? 'text-emerald-600' : 'text-stone-400'
            }`}
          >
            {i === 0 ? 'Prospect Details' : 'Preview & Copy'}
          </span>
          {i < total - 1 && (
            <div className={`w-12 h-px transition-colors ${i + 1 < current ? 'bg-emerald-300' : 'bg-stone-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Input styles ───────────────────────────────────────────────────────────

const inputClass =
  'w-full bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all duration-200 text-sm';

const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2';

// ── Step 1 — Prospect Details ──────────────────────────────────────────────

interface Step1Props {
  config: RoomConfig;
  onChange: (updates: Partial<RoomConfig>) => void;
  onNext: () => void;
}

function Step1({ config, onChange, onNext }: Step1Props) {
  const isValid = config.company.trim().length > 0;

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Company Name */}
      <div>
        <label className={labelClass}>
          Company Name <span className="text-stone-900">*</span>
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="Acme Corporation"
          value={config.company}
          onChange={(e) => onChange({ company: e.target.value })}
          autoFocus
        />
      </div>

      {/* Primary Contact */}
      <div>
        <label className={labelClass}>Primary Contact Name</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Emily Chen"
          value={config.contactName ?? ''}
          onChange={(e) => onChange({ contactName: e.target.value })}
        />
        <p className="mt-1.5 text-xs text-stone-400">Optional — used to personalize the room greeting</p>
      </div>

      {/* Brand Color */}
      <div>
        <label className={labelClass}>Brand Color</label>
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          {COLOR_SWATCHES.map((swatch) => {
            const isSelected = config.accent === swatch.hex;
            return (
              <button
                key={swatch.hex}
                type="button"
                title={swatch.name}
                onClick={() => onChange({ accent: swatch.hex })}
                className={`w-8 h-8 rounded-full transition-all duration-200 focus:outline-none ${
                  isSelected ? 'ring-2 ring-stone-900 ring-offset-2 ring-offset-white scale-110' : 'hover:scale-105 ring-1 ring-stone-200'
                }`}
                style={{ backgroundColor: swatch.hex }}
              />
            );
          })}
        </div>
        {/* Custom hex */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border border-stone-200/60 shrink-0 transition-colors"
            style={{ backgroundColor: config.accent }}
          />
          <input
            type="text"
            className={`${inputClass} font-mono text-xs`}
            placeholder="#1c1917"
            value={config.accent}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                onChange({ accent: val });
              }
            }}
            maxLength={7}
          />
        </div>
      </div>

      {/* Show Pricing toggle */}
      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200/60">
        <div>
          <p className="text-sm font-semibold text-stone-800">Show Pricing</p>
          <p className="text-xs text-stone-400 mt-0.5">Display the solution proposal & pricing section</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ showPricing: !config.showPricing })}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-300 ${
            config.showPricing ? 'bg-stone-900' : 'bg-stone-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              config.showPricing ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Custom Message */}
      <div>
        <label className={labelClass}>Custom Message</label>
        <textarea
          className={`${inputClass} resize-none h-28 leading-relaxed`}
          placeholder={`Hi ${config.company || '[Company]'} team — I built this specifically for you based on our conversation...`}
          value={config.customMessage ?? ''}
          onChange={(e) => onChange({ customMessage: e.target.value })}
        />
        <p className="mt-1.5 text-xs text-stone-400">Shown as the hero description in the prospect room</p>
      </div>

      {/* Next Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3.5 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Preview Room Link
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Step 2 — Preview & Copy ────────────────────────────────────────────────

interface Step2Props {
  config: RoomConfig;
  onBack: () => void;
}

function Step2({ config, onBack }: Step2Props) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const url = generateUrl(config);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render QR code to canvas whenever URL changes
  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, url, {
        width: 120,
        margin: 2,
        color: { dark: '#1c1917', light: '#fafaf9' },
      });
    }
  }, [url]);

  const handleDownloadQR = useCallback(() => {
    if (!qrCanvasRef.current) return;
    const dataUrl = qrCanvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${config.company || 'room'}-qr.png`;
    link.href = dataUrl;
    link.click();
  }, [config.company]);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      toast('Room link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url, toast]);

  const handleOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Pick a contrasting text color for the preview card
  const isLightColor = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 128;
  };

  const accentIsValid = /^#[0-9A-Fa-f]{6}$/.test(config.accent);
  const safeAccent = accentIsValid ? config.accent : '#1c1917';
  const textOnAccent = isLightColor(safeAccent) ? '#111827' : '#ffffff';

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Preview card */}
      <div>
        <p className={labelClass}>Room Preview</p>
        <div
          className="rounded-2xl overflow-hidden border border-stone-200/60 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${safeAccent}ee, ${safeAccent}aa)` }}
        >
          {/* Mock header bar */}
          <div className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: `${safeAccent}30` }}>
            <div className="flex items-center gap-3">
              <div className="w-20 h-3.5 rounded-full bg-white/30" />
              <div className="w-px h-4 opacity-30 bg-white" />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: textOnAccent, opacity: 0.9 }}>
                Discovery Room
              </span>
            </div>
            <div className="flex items-center gap-2">
              {config.showPricing && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded border"
                  style={{ color: textOnAccent, borderColor: `${textOnAccent}30`, backgroundColor: `${textOnAccent}15`, opacity: 0.8 }}
                >
                  Pricing On
                </span>
              )}
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Mock hero content */}
          <div className="px-5 py-6 text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 mb-4 text-xs font-semibold"
              style={{ borderColor: `${textOnAccent}30`, backgroundColor: `${textOnAccent}15`, color: textOnAccent, opacity: 0.85 }}
            >
              <Sparkles size={11} />
              Interactive Experience
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: textOnAccent, opacity: 0.7 }}>
              Prepared for {config.company}
            </p>
            <h3 className="text-base font-bold leading-snug mb-2" style={{ color: textOnAccent }}>
              Your Path to Modern Commercial Roofing Services
            </h3>
            {config.contactName && (
              <p className="text-xs" style={{ color: textOnAccent, opacity: 0.65 }}>
                Attention: {config.contactName}
              </p>
            )}
          </div>

          {/* Brand color strip */}
          <div className="px-5 py-2.5 flex items-center gap-2 border-t" style={{ borderColor: `${textOnAccent}15`, backgroundColor: `${textOnAccent}08` }}>
            <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: safeAccent, borderColor: `${textOnAccent}30` }} />
            <span className="text-[10px] font-mono" style={{ color: textOnAccent, opacity: 0.6 }}>
              Brand: {safeAccent}
            </span>
          </div>
        </div>
      </div>

      {/* Generated URL */}
      <div>
        <p className={labelClass}>Generated Link</p>
        <div className="relative">
          <code className="block w-full bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3.5 pr-12 text-xs font-mono text-emerald-700 break-all leading-relaxed">
            {url}
          </code>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200/60">
        <div className="flex flex-col items-center justify-center shrink-0">
          <canvas
            ref={qrCanvasRef}
            className="rounded-xl"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-stone-800">QR Code</p>
          <p className="text-xs text-stone-400">Scan to open the room on mobile</p>
          <button
            type="button"
            onClick={handleDownloadQR}
            className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <Download size={12} />
            Download QR
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl px-6 py-3.5 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <Check size={16} />
                Link Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <Copy size={16} />
                Copy Link
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          type="button"
          onClick={handleOpen}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border border-stone-200/60 hover:border-stone-300 text-stone-800 font-semibold rounded-xl px-6 py-3.5 transition-all duration-200"
        >
          <ExternalLink size={16} />
          Open Room
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-stone-400 hover:text-stone-700 text-sm font-medium py-2 transition-colors"
        >
          ← Back to edit details
        </button>
      </div>
    </motion.div>
  );
}

// ── Main RoomBuilder Page ──────────────────────────────────────────────────

const DEFAULT_CONFIG: RoomConfig = {
  company: '',
  contactName: '',
  accent: '#1c1917',
  showPricing: true,
  customMessage: '',
};

export default function RoomBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [config, setConfig] = useState<RoomConfig>(DEFAULT_CONFIG);

  const handleChange = useCallback((updates: Partial<RoomConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(() => {
    if (config.company.trim()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [config.company]);

  const handleBack = useCallback(() => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Keyboard shortcut: Enter on step 1 advances
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.metaKey && step === 1) {
        handleNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, handleNext]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <div className="relative z-10 mx-auto max-w-xl px-4 py-10 sm:py-14">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate('/team/discovery')}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 mb-8 transition-colors group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Discovery Room
        </button>

        {/* Header */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-stone-100 px-3.5 py-1.5 mb-5"
          >
            <Sparkles size={13} className="text-stone-600" />
            <span className="text-xs font-semibold text-stone-700">Room Builder</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 mb-2 leading-tight">
            Create a Discovery Room
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            Generate a personalized prospect room link in under 15 seconds.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} total={2} />

        {/* Step label */}
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
            Step {step} of 2
          </p>
        </div>

        {/* Step card */}
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 sm:p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <Step1 key="step1" config={config} onChange={handleChange} onNext={handleNext} />
            ) : (
              <Step2 key="step2" config={config} onBack={handleBack} />
            )}
          </AnimatePresence>
        </div>

        {/* Footer tip */}
        <p className="mt-6 text-center text-[11px] text-stone-400">
          {step === 1
            ? 'Press ⌘↵ to jump to preview'
            : 'The link encodes all room settings — no database needed'}
        </p>
      </div>
    </div>
  );
}
