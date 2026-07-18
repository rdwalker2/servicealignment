import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { Plus, Check } from 'lucide-react';
import { ALL_CASE_STUDIES, type CaseStudy } from './SocialProofGrid';
import type { DiscoverySession } from '../../lib/discoveryDatabase';

/* ------------------------------------------------------------------ */
/*  Pain → Case Study Feature Mapping                                  */
/*  Maps pain IDs to keywords found in case study metrics/features     */
/* ------------------------------------------------------------------ */

const PAIN_FEATURE_MAP: Record<string, { keywords: string[]; label: string }> = {
    'slow-time-to-hire':               { keywords: ['time-to-hire', 'time to hire', 'time-to-offer', 'downtime'],           label: 'Pain: Time-to-Hire' },
    'manual-screening':                { keywords: ['screening', 'ai co-pilot', 'co-pilot', 'sift through'],               label: 'Pain: Screening' },
    'outdated-career-site':            { keywords: ['career site', 'career page', 'careers page', 'careers via'],           label: 'Pain: Career Site' },
    'poor-candidate-experience':       { keywords: ['candidate experience', 'candidate satisfaction', 'personal'],          label: 'Pain: Candidate Exp' },
    'locked-out-managers':             { keywords: ['hiring manager', 'hm adoption', 'manager adoption', 'ownership'],      label: 'Pain: HM Adoption' },
    'no-pipeline-visibility':          { keywords: ['pipeline', 'reporting', 'analytics', 'visibility'],                    label: 'Pain: Pipeline Visibility' },
    'high-cost-per-hire':              { keywords: ['cost', 'roi', 'agency spend', 'agency fee', 'cost-effective'],          label: 'Pain: Cost-per-Hire' },
    'dead-nurture-pipeline':           { keywords: ['connect', 'nurture', 'crm', 'talent pool'],                            label: 'Pain: Talent Nurture' },
    'weak-talent-pools':               { keywords: ['talent pool', 'connect', 'crm', 'passive'],                            label: 'Pain: Talent Pools' },
    'compliance-bottlenecks':          { keywords: ['compliance', 'gdpr', 'anonymi', 'diversity'],                          label: 'Pain: Compliance' },
    'dei-reporting-gaps':              { keywords: ['diversity', 'anonymi', 'blind', 'dei'],                                label: 'Pain: DEI' },
    'inconsistent-interviews':         { keywords: ['interview kit', 'scorecard', 'structured', 'scoring'],                 label: 'Pain: Interviews' },
    'scorecard-friction':              { keywords: ['scorecard', 'rating', 'scoring', 'evaluation'],                        label: 'Pain: Scorecards' },
    'recruiter-burnout':               { keywords: ['automation', 'trigger', 'workflow', 'admin'],                          label: 'Pain: Recruiter Burnout' },
    'recruiter-admin-heavy':           { keywords: ['automation', 'trigger', 'workflow', 'admin'],                          label: 'Pain: Admin Overload' },
    'agency-spend':                    { keywords: ['agency', 'in-house', 'referral', 'direct application'],                label: 'Pain: Agency Spend' },
    'agency-to-in-house-transition':   { keywords: ['agency', 'in-house', 'direct application', 'sourcing'],                label: 'Pain: Agency→In-house' },
    'weak-referrals':                  { keywords: ['referral', 'employee referral'],                                       label: 'Pain: Referrals' },
    'multi-language-gaps':             { keywords: ['multi-language', 'multilingual', 'language', 'global'],                 label: 'Pain: Multi-Language' },
    'scheduling-chaos':                { keywords: ['schedul', 'calendar', 'coordination'],                                 label: 'Pain: Scheduling' },
    'hris-ats-rigidity':               { keywords: ['workflow', 'custom', 'rigid', 'single workflow'],                      label: 'Pain: Provider Rigidity' },
    'application-volume-explosion':    { keywords: ['volume', 'screening', 'applicant', 'application'],                     label: 'Pain: App Volume' },
    'fragmented-multi-brand':          { keywords: ['multi-brand', 'division', 'global', 'consolidat'],                     label: 'Pain: Multi-Brand' },
    'tool-sprawl-centralization':      { keywords: ['all-in-one', 'consolidat', 'centralize', 'single source'],             label: 'Pain: Tool Sprawl' },
    'vendor-support-gap':              { keywords: ['support', 'vendor', 'hypercare', 'dedicated'],                         label: 'Pain: Vendor Support' },
    'onboarding-gaps':                 { keywords: ['onboarding', 'pre-boarding', 'day 1'],                                 label: 'Pain: Onboarding' },
};

/* ------------------------------------------------------------------ */
/*  Provider name normalisation — match case study quotes to session Provider     */
/* ------------------------------------------------------------------ */

const ATS_ALIAS_MAP: Record<string, string[]> = {
    Greenhouse:      ['greenhouse'],
    Lever:           ['lever'],
    BambooHR:        ['bambooh', 'bamboo'],
    Workday:         ['workday'],
    iCIMS:           ['icims'],
    SmartRecruiters: ['smartrecruiters', 'smart recruiters'],
    Workable:        ['workable'],
    JazzHR:          ['jazzhr', 'jazz'],
    Paycor:          ['paycor'],
    Paycom:          ['paycom'],
    ADP:             ['adp'],
    Dayforce:        ['dayforce', 'ceridian'],
    Rippling:        ['rippling'],
    Jobvite:         ['jobvite'],
    SuccessFactors:  ['successfactors', 'success factors'],
};

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

interface ScoredStudy {
    study: CaseStudy;
    score: number;
    reasons: string[];
}

const SMB_SIZES = ['1-50', '51-200'];

function scoreStudy(
    study: CaseStudy,
    selectedPains: string[],
    industry: string | null,
    companySize: string | null,
    currentATS: string | null,
): ScoredStudy {
    let score = 0;
    const reasons: string[] = [];
    const studyText = `${study.metric} ${study.quote} ${study.ttFeature} ${study.industry}`.toLowerCase();

    // 1. Industry match (3 pts)
    if (industry && industry !== 'none' && study.industries.includes(industry)) {
        score += 3;
        reasons.push('Industry Match');
    }

    // 2. Size match (2 pts) — smbFriendly matches ≤200 employees
    const isSMB = companySize && SMB_SIZES.includes(companySize);
    if (isSMB && study.smbFriendly) {
        score += 2;
        reasons.push('Size Match');
    } else if (!isSMB && companySize && companySize !== 'none' && !study.smbFriendly) {
        score += 2;
        reasons.push('Size Match');
    }

    // 3. Pain overlap (1 pt each)
    for (const painId of selectedPains) {
        const mapping = PAIN_FEATURE_MAP[painId];
        if (!mapping) continue;
        const hasMatch = mapping.keywords.some(kw => studyText.includes(kw));
        if (hasMatch) {
            score += 1;
            reasons.push(mapping.label);
        }
    }

    // 4. Provider migration match (2 pts)
    if (currentATS && currentATS !== 'None') {
        const aliases = ATS_ALIAS_MAP[currentATS] || [currentATS.toLowerCase()];
        const hasAtsMatch = aliases.some(alias => studyText.includes(alias));
        if (hasAtsMatch) {
            score += 2;
            reasons.push(`Provider: ${currentATS}`);
        }
    }

    return { study, score, reasons };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface CaseStudyMatcherProps {
    session: DiscoverySession;
    onStudyToggle: (studyName: string) => void;
}

export function CaseStudyMatcher({ session, onStudyToggle }: CaseStudyMatcherProps) {
    const rankedStudies = useMemo(() => {
        const scored = ALL_CASE_STUDIES.map(study =>
            scoreStudy(
                study,
                session.selected_pains,
                session.industry,
                session.company_size,
                session.current_ats,
            ),
        );

        return scored
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);
    }, [session.selected_pains, session.industry, session.company_size, session.current_ats]);

    const maxScore = rankedStudies.length > 0 ? rankedStudies[0].score : 1;
    const enabledNames = session.enabled_study_names ?? [];

    if (rankedStudies.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
        >
            {/* Header */}
            <div className="mx-auto max-w-4xl mb-6 flex items-center gap-3">
                <span className="text-lg">🎯</span>
                <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-0.5">
                        Recommended for this deal
                    </p>
                    <p className="text-sm text-stone-500">
                        Case studies matched to your prospect's pains, industry, and current Provider
                    </p>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">
                    {rankedStudies.length} matches
                </span>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto max-w-6xl">
                <AnimatePresence mode="popLayout">
                    {rankedStudies.map(({ study, score, reasons }, i) => {
                        const Icon = study.icon;
                        const isEnabled = enabledNames.includes(study.name);
                        const barPct = Math.round((score / maxScore) * 100);

                        return (
                            <motion.div
                                key={study.name}
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className={`relative flex flex-col rounded-xl border p-5 transition-all duration-200 ${
                                    isEnabled
                                        ? 'border-emerald-300 bg-emerald-50/40 shadow-md'
                                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                                }`}
                            >
                                {/* Top row: icon + name + industry */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                        isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'
                                    }`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-stone-900 truncate">{study.name}</h4>
                                        <p className="text-[10px] text-stone-400 truncate">{study.industry}</p>
                                    </div>
                                </div>

                                {/* Key metric */}
                                <div className="mb-3 rounded-lg bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700">
                                    {study.metric}
                                </div>

                                {/* Match reason tags */}
                                <div className="mb-3 flex flex-wrap gap-1.5">
                                    {reasons.map(reason => {
                                        const isIndustry = reason === 'Industry Match';
                                        const isSize = reason === 'Size Match';
                                        const isATS = reason.startsWith('Provider:');
                                        const isPain = reason.startsWith('Pain:');

                                        let cls = 'bg-stone-100 text-stone-600';
                                        if (isIndustry) cls = 'bg-sky-100 text-sky-700';
                                        else if (isSize) cls = 'bg-violet-100 text-violet-700';
                                        else if (isATS) cls = 'bg-amber-100 text-amber-700';
                                        else if (isPain) cls = 'bg-rose-50 text-rose-600';

                                        return (
                                            <span
                                                key={reason}
                                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${cls}`}
                                            >
                                                {reason}
                                            </span>
                                        );
                                    })}
                                </div>

                                {/* Relevance score bar */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-bold text-stone-400">Relevance</span>
                                        <span className="text-[9px] font-bold text-stone-500">{score} pts</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${barPct}%` }}
                                            transition={{ delay: i * 0.06 + 0.2, duration: 0.5, ease: 'easeOut' }}
                                            className={`h-full rounded-full ${
                                                barPct >= 80 ? 'bg-emerald-500'
                                                    : barPct >= 50 ? 'bg-sky-500'
                                                    : 'bg-stone-400'
                                            }`}
                                        />
                                    </div>
                                </div>

                                {/* Toggle button */}
                                <button
                                    onClick={() => onStudyToggle(study.name)}
                                    className={`mt-auto flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                                        isEnabled
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                                >
                                    {isEnabled ? (
                                        <>
                                            <Check size={13} />
                                            Added
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={13} />
                                            Add to Room
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default CaseStudyMatcher;
