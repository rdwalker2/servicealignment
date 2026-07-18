import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { TT_PAINS } from './PainDiscoveryModule';
import { fmtCurrency } from '../../lib/calculations';

interface BusinessCaseViewProps {
  session: DiscoverySession | null;
  selectedPains: string[];
  themeColor: string;
  companyName: string;
  repName?: string;
  firstStakeholderName?: string;
}

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

export function BusinessCaseView({
  session,
  selectedPains,
  themeColor,
  companyName,
  repName,
  firstStakeholderName
}: BusinessCaseViewProps) {
  if (!session) return null;

  const pains = TT_PAINS.filter(p => selectedPains.includes(p.id));
  const roiTotal = session.roi_total || 0;
  const targetLaunch = session.implementation_timeline || 'TBD';
  const dealValue = session.deal_value || 0;

  // Calculate some simple derived metrics based on ROI total to make it look robust
  // If the total ROI is 0 (uncalculated), we'll show pending states
  const monthlyImpact = roiTotal > 0 ? roiTotal / 12 : 0;
  const paybackPeriod = roiTotal > 0 && dealValue > 0 ? Math.max(1, Math.round((dealValue / roiTotal) * 12)) : 0;
  const netROI = roiTotal > 0 && dealValue > 0 ? ((roiTotal - dealValue) / dealValue) * 100 : 0;

  return (
    <div className="w-full bg-stone-50/50 min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-6">
        
        {/* Header Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: PREMIUM_EASE }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-6" style={{ borderColor: `${themeColor}30`, backgroundColor: `${themeColor}08` }}>
            <ShieldCheck size={14} style={{ color: themeColor }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: themeColor }}>Executive Brief</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight mb-4">
            Business Case: <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>{companyName}</span>
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto">
            A high-level summary of the identified operational gaps, proposed solution, and projected financial impact of partnering with Teamtailor.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs font-semibold text-stone-400">
            {firstStakeholderName && <span>Prepared for: <span className="text-stone-700">{firstStakeholderName}</span></span>}
            {firstStakeholderName && repName && <span className="w-1 h-1 rounded-full bg-stone-300" />}
            {repName && <span>Prepared by: <span className="text-stone-700">{repName}</span></span>}
            <span className="w-1 h-1 rounded-full bg-stone-300" />
            <span>Date: <span className="text-stone-700">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
          </div>
        </motion.div>

        {/* 4-Quadrant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Quadrant 1: Identified Priorities (Pains) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: PREMIUM_EASE }}
            className="bg-white border border-stone-200/60 rounded-3xl p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}12` }}>
                <Target size={20} style={{ color: themeColor }} />
              </div>
              <h2 className="text-xl font-bold text-stone-800">Identified Gaps</h2>
            </div>
            
            {pains.length === 0 ? (
              <p className="text-sm text-stone-500 italic">No priorities identified yet.</p>
            ) : (
              <div className="space-y-5">
                {pains.slice(0, 3).map((pain, i) => (
                  <div key={pain.id} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <CheckCircle2 size={16} className="text-stone-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 mb-1">{pain.title}</h3>
                      <p className="text-xs text-stone-500 leading-relaxed">{pain.description.split('.')[0]}.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quadrant 2: Financial Impact (ROI) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: PREMIUM_EASE }}
            className="bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-lg relative overflow-hidden"
          >
            {/* Background flourish */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: themeColor }} />
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Financial Impact</h2>
            </div>
            
            <div className="relative z-10">
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Projected Annual Value</p>
                <div className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                  {roiTotal > 0 ? fmtCurrency(roiTotal) : 'Pending'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-stone-800 pt-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Est. Payback</p>
                  <p className="text-xl font-bold text-white">{paybackPeriod > 0 ? `${paybackPeriod} Mo` : '--'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Net ROI</p>
                  <p className="text-xl font-bold text-white">{netROI > 0 ? `${Math.round(netROI)}%` : '--'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quadrant 3: Implementation Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: PREMIUM_EASE }}
            className="bg-white border border-stone-200/60 rounded-3xl p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-100">
                <Calendar size={20} className="text-zinc-600" />
              </div>
              <h2 className="text-xl font-bold text-stone-800">Timeline to Value</h2>
            </div>

            <div className="flex items-center justify-between mb-8 pb-8 border-b border-stone-100">
              <div>
                <p className="text-xs font-semibold text-stone-400 mb-1">Target Launch</p>
                <p className="text-lg font-bold text-stone-900">{targetLaunch}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-stone-400 mb-1">Time to Live</p>
                <p className="text-lg font-bold text-emerald-600">~4 Weeks</p>
              </div>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
              {/* Very simplified timeline visual */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-zinc-300 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-zinc-50 border border-zinc-100 p-3 rounded-lg shadow-sm">
                  <h3 className="font-bold text-zinc-800 text-xs mb-1">Decision & Procurement</h3>
                  <p className="text-[10px] text-zinc-500">Contract execution and system provisioning.</p>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-zinc-300 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-zinc-50 border border-zinc-100 p-3 rounded-lg shadow-sm">
                  <h3 className="font-bold text-zinc-800 text-xs mb-1">Configuration</h3>
                  <p className="text-[10px] text-zinc-500">Career site build, data migration, and training.</p>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-emerald-500 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white border border-emerald-100 p-3 rounded-lg shadow-sm">
                  <h3 className="font-bold text-emerald-800 text-xs mb-1">Go Live</h3>
                  <p className="text-[10px] text-emerald-600">System launch and broad team rollout.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quadrant 4: Proposed Investment */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: PREMIUM_EASE }}
            className="bg-white border border-stone-200/60 rounded-3xl p-8 shadow-sm flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}12` }}>
                <Zap size={20} style={{ color: themeColor }} />
              </div>
              <h2 className="text-xl font-bold text-stone-800">Proposed Investment</h2>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center py-6">
              <p className="text-xs font-semibold text-stone-400 mb-2 uppercase tracking-widest">Annual Subscription</p>
              <p className="text-4xl font-bold text-stone-900 mb-2">
                {dealValue > 0 ? fmtCurrency(dealValue) : 'TBD'}
              </p>
              <p className="text-sm text-stone-500 mb-6">Billed annually. Includes unlimited users, career site, and support.</p>
              
              {dealValue > 0 && monthlyImpact > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <TrendingUp size={14} className="text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">
                    Expected to generate {Math.round(monthlyImpact / dealValue)}x return on investment
                  </span>
                </div>
              )}
            </div>
          </motion.div>

        </div>
        
        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-stone-400">
            This business case is based on data provided during discovery and conservative industry benchmarks.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
