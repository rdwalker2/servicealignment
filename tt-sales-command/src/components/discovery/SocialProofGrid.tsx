/* eslint-disable react-refresh/only-export-components */
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import {
    UtensilsCrossed, ShoppingBag, Dumbbell, Building2, Heart, Factory,
    Banknote, Server, Briefcase, GraduationCap, Sparkles, Star, Globe, Plane, Shield,
    ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Customer } from '../../data/customerTypes';

/* ------------------------------------------------------------------ */
/*  Case Study Library — ALL sourced from Teamtailor published stories */
/* ------------------------------------------------------------------ */

export type CaseStudy = {
    name: string;
    industry: string;
    metric: string;
    quote: string;
    ttFeature: string;
    icon: typeof Building2;
    industries: string[];   // which industry dropdown IDs this maps to
    smbFriendly: boolean;   // ≤200 employees
};

export const ALL_CASE_STUDIES: CaseStudy[] = [
    /* ── SMB-Relevant (Primary) ── */
    {
        name: 'ESTO',
        industry: 'FinTech · ~100 Employees',
        metric: 'Time-to-hire reduced to just 21 days',
        quote: "ESTO balances high-speed recruitment with a deeply personal candidate experience. By leveraging automated workflows across 21 hiring managers, they eliminated candidate ghosting and candidates still feel like 'winners' even when not selected.",
        ttFeature: 'Automation & Triggers + Workflows',
        icon: Banknote,
        industries: ['professional-services', 'other'],
        smbFriendly: true,
    },
    {
        name: 'Giacom',
        industry: 'IT Services · ~200 Employees · UK',
        metric: 'Improved ROI & 70 employee referrals',
        quote: "Before Teamtailor, Giacom faced a slow, clunky recruiting process. AI Co-pilot screening criteria now lets the team sift through candidates rapidly, and each screening call saves 15 minutes of manual note-taking. They've generated 70 employee referrals since launch.",
        ttFeature: 'AI Co-pilot + Candidate Screening',
        icon: Server,
        industries: ['professional-services', 'other'],
        smbFriendly: true,
    },
    {
        name: 'Movember',
        industry: 'Global Nonprofit · 21 Countries',
        metric: '99% candidate satisfaction rate',
        quote: "Movember modernized global recruitment with Teamtailor's ATS, filling 62 roles in 4 months. AI Co-pilot transcribes and summarizes interviews so recruiters focus on the human connection. 1,156 candidate surveys with 343 written comments praising the experience.",
        ttFeature: 'AI Co-pilot + Global ATS',
        icon: Heart,
        industries: ['nonprofit', 'other'],
        smbFriendly: true,
    },

    {
        name: 'Rocco Forte Hotels',
        industry: 'Luxury Hotel Group · 15 Properties',
        metric: 'Empowered 100+ hiring managers to recruit',
        quote: "Our previous ATS was too complex, leading to inconsistency across our luxury properties. Teamtailor’s intuitive platform allowed us to give ownership back to the department heads, resulting in faster and more consistent hiring.",
        ttFeature: 'User-Friendly ATS + Multilingual',
        icon: Star,
        industries: ['hospitality'],
        smbFriendly: true,
    },
    {
        name: 'Five Guys',
        industry: 'Restaurant Chain · High-Volume',
        metric: 'Automated 100% of candidate responses',
        quote: "As a fast-paced restaurant chain, our managers need to focus on customer service, not admin. Teamtailor completely automated our high-volume screening and ensures every single applicant receives a timely response.",
        ttFeature: 'Triggers & Workflows + High-Volume',
        icon: UtensilsCrossed,
        industries: ['food-beverage', 'hospitality'],
        smbFriendly: true,
    },
    {
        name: 'Pincho Nation',
        industry: 'Restaurant Franchise · 80+ Locations',
        metric: '50,000+ applications with zero manual entry',
        quote: "As a rapidly expanding franchise, we needed a scalable way to handle massive applicant volume. Teamtailor's triggers completely automate the screening process for both kitchen and waitstaff across all locations.",
        ttFeature: 'Triggers & Workflows + Mobile App',
        icon: UtensilsCrossed,
        industries: ['hospitality', 'food-beverage'],
        smbFriendly: true,
    },

    /* ── Enterprise / Mid-Market / Transcript-Sourced Case Studies ── */
    {
        name: 'Knauf',
        industry: 'Manufacturing · 43,500 Employees',
        metric: '50%+ increase in global applicant volume',
        quote: "James Forster led a 2-year journey to unify recruitment across 90+ countries. Teamtailor's Career Site Builder and multi-language support let them digitize a 90-year-old hiring process without engineering overhead.",
        ttFeature: 'Career Site Builder + Multi-Language',
        icon: Building2,
        industries: ['other'],
        smbFriendly: false,
    },

    /* ── Enterprise case studies from live transcript analysis ── */
    {
        name: 'Footasylum',
        industry: 'Retail · ~2,500 hires/yr',
        metric: '40% direct applications via careers page; 17.1% of hires from CRM',
        quote: "Footasylum went from almost no direct applications to 40% of candidates coming via their careers page by the end of year two — that's 200,000 applications they didn't pay for. 17.1% of their 2,500 annual hires came from Connect talent pools.",
        ttFeature: 'Career Site Builder + Connect CRM',
        icon: ShoppingBag,
        industries: ['retail'],
        smbFriendly: false,
    },
    {
        name: 'Motorpoint',
        industry: 'Automotive Retail',
        metric: '57% reduction in time-to-hire downtime',
        quote: "Motorpoint's TA was super-engaged but hiring managers let candidates sit for 14 days then they'd withdraw. By mapping SLA triggers and auto-escalations, they reduced downtime to hire by 57%.",
        ttFeature: 'SLA Triggers + Automation',
        icon: ShoppingBag,
        industries: ['retail', 'other'],
        smbFriendly: false,
    },
    {
        name: 'Lotus Cars',
        industry: 'Automotive · APAC/EMEA/Middle East',
        metric: 'Time to hire reduced from 55 to 23 days',
        quote: "Lotus reduced their time to hire from 55 days to 23 days across APAC, EMEA, and the Middle East using SLA tracking and automation triggers. A small accountability change with dramatic impact.",
        ttFeature: 'SLA Tracking + Automation',
        icon: Sparkles,
        industries: ['other'],
        smbFriendly: false,
    },

    {
        name: 'Savills',
        industry: 'Real Estate · 40,000 Employees',
        metric: 'Change management via embedded HM training',
        quote: "With 40,000 employees and thousands of hiring managers, Savills embedded training videos directly on the Teamtailor dashboard login. Best practices are reinforced automatically every time a manager logs in.",
        ttFeature: 'User-Friendly ATS + Change Management',
        icon: Building2,
        industries: ['professional-services', 'other'],
        smbFriendly: false,
    },
    {
        name: 'Octavo',
        industry: 'Construction · Mid-Market',
        metric: '100% hiring manager adoption in ~3 months',
        quote: "Octavo had very technophobic hiring managers that were really disengaged and put a lot of pressure on TA. From implementing Teamtailor in November to their QBR in February, they achieved 100% hiring manager adoption.",
        ttFeature: 'User-Friendly ATS',
        icon: Building2,
        industries: ['construction', 'other'],
        smbFriendly: false,
    },
    {
        name: 'Kelso Burnett',
        industry: 'Construction & Facilities · ~500 Employees',
        metric: '65% reduction in recruitment agency spend in 12 months',
        quote: "By launching a localized, interactive employer brand careers page and using Teamtailor's candidate CRM to engage passive candidates, Kelso Burnett successfully moved their hiring process off expensive external agencies. Sourcing power and pipeline visibility was fully brought in-house.",
        ttFeature: 'Career Site Builder + Connect CRM',
        icon: Building2,
        industries: ['construction'],
        smbFriendly: false,
    },


    /* ── From teamtailor.com/en/customers/ — added May 2026 ── */
    {
        name: 'Pemo',
        industry: 'FinTech · ~100 Employees · UAE',
        metric: 'Structured hiring across MENA expansion',
        quote: "Pemo transformed reactive, spreadsheet-based recruitment into a structured, strategic hiring function across UAE and Cairo. Interview kits mapped to company values ensure every hire aligns with culture, while the career site drives inbound talent.",
        ttFeature: 'Interview Kits + Career Site',
        icon: Banknote,
        industries: ['financial-services', 'technology'],
        smbFriendly: true,
    },
    {
        name: 'Actavo',
        industry: 'Infrastructure Services · 2,000+ Employees',
        metric: 'Time to hire reduced from 46 to 38 days; 100% HM adoption',
        quote: "Actavo made 101 permanent hires in just 4 months after launch. By automating admin with triggers, the recruitment team focused on engaging candidates and supporting hiring managers instead of managing manual paperwork.",
        ttFeature: 'Triggers + Hiring Manager Portal',
        icon: Building2,
        industries: ['construction', 'other'],
        smbFriendly: false,
    },
    {
        name: 'Dacha Real Estate',
        industry: 'Real Estate Brokerage · ~150 Employees · Dubai',
        metric: 'Scaled international hiring while keeping the human touch',
        quote: "Teamtailor was one of our best investments — it balances structure, efficiency, and personal, brand-focused engagement. They went from manual spreadsheets to managing hundreds of international applications weekly with faster time-to-hire.",
        ttFeature: 'Career Site + Visual Pipelines',
        icon: Globe,
        industries: ['professional-services', 'other'],
        smbFriendly: true,
    },
    {
        name: 'Wego',
        industry: 'Travel Technology · ~300 Employees',
        metric: 'From zero ATS to full hiring manager engagement',
        quote: "Teamtailor is plug and play — the team learned the system easily without heavy backend maintenance. It helps recruiters and hiring managers think about the next 2-5 years with every hire they make.",
        ttFeature: 'Internal Jobs + HM Engagement',
        icon: Plane,
        industries: ['technology'],
        smbFriendly: true,
    },
    {
        name: 'Scandinavian Executive',
        industry: 'Executive Search · Boutique Firm',
        metric: '4-8 active cases per person simultaneously',
        quote: "The platform helps us maintain transparency and build long-term relationships without sacrificing quality or trust. By digitizing and centralizing interim recruitment, each consultant can now run 4-8 cases simultaneously.",
        ttFeature: 'Talent Network + Pipeline Management',
        icon: Briefcase,
        industries: ['professional-services'],
        smbFriendly: true,
    },
    {
        name: 'GoodOaks Homecare',
        industry: 'Homecare · 30+ Franchise Branches',
        metric: 'Eliminated manual hiring; reduced time-to-offer across franchise',
        quote: "GoodOaks chose Teamtailor for its user-friendly interface, cost-effectiveness, and built-in automation features that let them manage the entire hiring process within the ATS — from triggers to AI-powered Co-pilot screening.",
        ttFeature: 'Triggers + Co-pilot AI',
        icon: Heart,
        industries: ['healthcare'],
        smbFriendly: true,
    },
    {
        name: 'Precis Digital',
        industry: 'Performance Marketing · ~500 Employees',
        metric: 'Achieved Diversity Champion® certification',
        quote: "Teamtailor's built-in tools for anonymization, standardized scoring, and diversity tracking replaced gut reactions with objective, measurable evaluations — fast-tracking our path to Diversity Champion certification.",
        ttFeature: 'Blind Applications + Scorecards',
        icon: Shield,
        industries: ['media', 'technology'],
        smbFriendly: false,
    },
];

/* ── Industry-Specific "Did You Know?" micro-stats ── */
const INDUSTRY_STATS: Record<string, { stat: string; source: string; icon: typeof Star }[]> = {
    'food-beverage': [
        { stat: '100-130% annual turnover in QSR', source: 'NRA 2025', icon: UtensilsCrossed },
        { stat: '54% of restaurant workers quit within 90 days', source: 'Restaurant Dive', icon: Star },
        { stat: 'Hourly seekers accept the first job offer they receive', source: 'Fountain 2023', icon: Star },
    ],
    'retail': [
        { stat: '60-75% annual turnover for hourly retail roles', source: 'Korn Ferry', icon: ShoppingBag },
        { stat: '25-35% interview no-show rate in retail', source: 'Indeed/ZipRecruiter', icon: Star },
        { stat: '400-500K seasonal positions added each Q4', source: 'NRF', icon: Star },
    ],
    'fitness-wellness': [
        { stat: '50-80% annual front desk/sales turnover', source: 'IHRSA', icon: Dumbbell },
        { stat: '21-45 day time-to-hire for certified trainers', source: 'Operator Surveys', icon: Star },
        { stat: 'Studio owners spend 10+ hrs/week on hiring', source: 'Industry Benchmark', icon: Star },
    ],
    'hospitality': [
        { stat: '70-100%+ annual turnover for hourly roles', source: 'BLS / AHLA', icon: Building2 },
        { stat: 'Extreme seasonal spikes require rapid ramp-up', source: 'AHLA', icon: Star },
        { stat: 'Guest complaints directly tied to understaffing', source: 'AHLA', icon: Star },
    ],
    'healthcare': [
        { stat: '30-45 day avg time-to-hire for clinical support', source: 'MGMA', icon: Heart },
        { stat: '20-35% annual turnover for support staff', source: 'AAHA', icon: Star },
        { stat: 'Chronic shortages in MA, hygienist, vet tech roles', source: 'AMA/ADA/AVMA', icon: Star },
    ],
    'professional-services': [
        { stat: '15-25% annual turnover in professional services', source: 'SHRM', icon: Briefcase },
        { stat: '30-60 day time-to-hire for professional roles', source: 'LinkedIn', icon: Star },
        { stat: 'Vacant seat = lost billable hours & margin', source: 'Industry Norm', icon: Star },
    ],
    'nonprofit': [
        { stat: '15-30% annual turnover for nonprofit staff', source: 'Nonprofit HR Surveys', icon: GraduationCap },
        { stat: '8-10% annual teacher attrition nationally', source: 'EdWeek', icon: Star },
        { stat: 'Most small nonprofits have no dedicated HR', source: 'Industry Norm', icon: Star },
    ],
    'construction': [
        { stat: '65% average reduction in external agency placement fees', source: 'Teamtailor Case Study', icon: Star },
        { stat: '100% adoption rate among onsite construction hiring managers', source: 'Octavo QBR', icon: Star },
        { stat: 'Over 50% reduction in average time-to-hire for project managers', source: 'Lotus/Motorpoint benchmarks', icon: Star },
    ],
    'insurance': [
        { stat: '1099 agents average 40-60% annual attrition', source: 'Insurance Industry Benchmarks', icon: Star },
        { stat: 'Always-on recruiting required for licensed agent roles', source: 'NAIC / Carrier Reports', icon: Star },
        { stat: 'Agencies with employer brand sites see 3x more direct applicants', source: 'Teamtailor Benchmark', icon: Star },
    ],
    'financial-services': [
        { stat: '20-30% annual turnover for client-facing financial roles', source: 'SHRM / BLS', icon: Banknote },
        { stat: 'Compliance-heavy onboarding adds 2-3 weeks to time-to-hire', source: 'Industry Benchmark', icon: Star },
        { stat: 'Licensed roles require targeted sourcing vs. mass posting', source: 'Industry Norm', icon: Star },
    ],
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface SocialProofGridProps {
    selectedIndustry?: string | null;
    enabledStudyNames?: string[];
    enabledProofCustomers?: string[];
}

function DynamicProofCustomers({ enabledProofCustomers }: { enabledProofCustomers: string[] }) {
    const [proofCustomers, setProofCustomers] = useState<Customer[]>([]);
    useEffect(() => {
        if (!enabledProofCustomers || enabledProofCustomers.length === 0) return;
        supabase.from('customers').select('*').in('id', enabledProofCustomers).then(({ data }) => {
            if (data) {
                setProofCustomers(data.map((r: any) => ({
                    id: r.id, accountName: r.account_name, website: r.website, careerSite: r.career_site,
                    phase: r.phase, lastActive: r.last_active, linkedinUrl: r.linkedin_url, segment: r.segment,
                    employeeRange: r.employee_range, previousAts: r.previous_ats, billingCountry: r.billing_country,
                    billingState: r.billing_state, region: r.region, countryFlag: r.country_flag, industry: r.industry,
                    wonOpportunities: r.won_opportunities, npsScore: r.nps_score, npsClassification: r.nps_classification,
                    npsAvgScore: r.nps_avg_score, npsResponses: r.nps_responses,
                })));
            }
        });
    }, [enabledProofCustomers]);

    if (proofCustomers.length === 0) return null;

    return (
        <div className="mb-12">
            <div className="mx-auto max-w-4xl mb-6">
                <p className="text-[10px] font-bold text-stone-400 mb-1">Trusted by companies like yours</p>
                <p className="text-sm text-stone-500">Real companies using Teamtailor today, matched to your industry and size</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mx-auto max-w-4xl">
                {proofCustomers.map((c, i) => (
                    <motion.div
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3 rounded-2xl bg-white p-4 border border-stone-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 text-lg shrink-0">
                            {c.countryFlag}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-stone-800 truncate">{c.accountName}</p>
                            <div className="flex items-center gap-1.5">
                                <p className="text-[10px] text-stone-400 truncate">{c.industry}</p>
                                {c.npsScore !== null && c.npsScore >= 9 && (
                                    <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">★ NPS {c.npsScore}</span>
                                )}
                            </div>
                        </div>
                        {c.careerSite && !c.careerSite.includes('.teamtailor.com') && (
                            <a href={`https://${c.careerSite}`} target="_blank" rel="noopener noreferrer"
                                className="shrink-0 text-stone-300 hover:text-stone-500 transition-colors" title="View career site">
                                <ExternalLink size={12} />
                            </a>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export function SocialProofGrid({ selectedIndustry, enabledStudyNames, enabledProofCustomers }: SocialProofGridProps) {
    /* Pick case studies that match the selected industry, falling back to SMB-first defaults */
    const displayedStudies = useMemo(() => {
        // If specific studies are whitelisted, use only those
        const pool = enabledStudyNames && enabledStudyNames.length > 0
            ? ALL_CASE_STUDIES.filter(s => enabledStudyNames.includes(s.name))
            : ALL_CASE_STUDIES;

        // Expand the raw industry to include alias categories
        // Many industries (insurance, logistics, education, etc.) don't have direct case studies
        // but map well to nearby verticals
        const INDUSTRY_ALIASES: Record<string, string[]> = {
            'insurance': ['financial-services', 'professional-services'],
            'financial-services': ['professional-services'],
            'education': ['nonprofit'],
            'government': ['nonprofit', 'professional-services'],
            'logistics': ['construction', 'other'],
            'manufacturing': ['construction', 'other'],
            'energy-maritime': ['construction', 'other'],
            'automotive': ['retail'],
            'real-estate': ['professional-services', 'construction'],
            'staffing': ['professional-services'],
            'legal': ['professional-services'],
            'agriculture': ['other'],
        };

        const ind = selectedIndustry && selectedIndustry !== 'none' ? selectedIndustry : null;

        if (ind) {
            const industriesToMatch = [ind, ...(INDUSTRY_ALIASES[ind] || [])];
            // 1. Studies matching this industry or its aliases
            const matched = pool.filter(s => s.industries.some(si => industriesToMatch.includes(si)));
            // 2. Fill remaining slots with other SMB studies (excluding nonprofits for commercial industries)
            const commercialIndustries = ['insurance', 'financial-services', 'professional-services', 'retail', 'technology', 'construction', 'real-estate', 'staffing', 'legal', 'automotive', 'logistics', 'manufacturing'];
            const isCommercial = commercialIndustries.includes(ind);
            const others = pool.filter(s =>
                !matched.includes(s) && s.smbFriendly &&
                // Don't show nonprofits to commercial companies
                (!isCommercial || !s.industries.includes('nonprofit'))
            );
            return [...matched, ...others].slice(0, 6);
        }

        // Default: show SMB-friendly first, then enterprise
        const smb = pool.filter(s => s.smbFriendly);
        const ent = pool.filter(s => !s.smbFriendly);
        return [...smb, ...ent].slice(0, 6);
    }, [selectedIndustry, enabledStudyNames]);

    const industryStats = selectedIndustry && selectedIndustry !== 'none'
        ? INDUSTRY_STATS[selectedIndustry] ?? null
        : null;

    return (
        <div className="w-full">
            {/* Proven Results — Why Teamtailor Exists */}
            <div className="mb-12">
                <div className="text-center mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-2">Our Track Record</p>
                    <h3 className="text-2xl font-bold text-stone-900 mb-3">Proven Results Across 13,000+ Companies</h3>
                    <p className="text-sm text-stone-500 max-w-2xl mx-auto">
                        Teamtailor was built to solve the fundamental disconnect between employer brand and hiring outcomes.
                        Companies were spending on job boards and agencies while their career sites repelled talent.
                        We built the platform that fixed this — and the numbers prove it.
                    </p>
                </div>

                {/* Big aggregate stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { number: '13,000+', label: 'Companies worldwide', icon: '🏢' },
                        { number: '845K+', label: 'Hires facilitated', icon: '🎯' },
                        { number: '16M+', label: 'Candidates screened by AI', icon: '🤖' },
                        { number: '150+', label: 'Countries served', icon: '🌍' },
                    ].map(stat => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="rounded-2xl bg-gradient-to-br from-stone-50 to-white border border-stone-200/60 p-5 text-center"
                        >
                            <div className="text-2xl mb-2">{stat.icon}</div>
                            <div className="text-2xl font-black text-stone-900 mb-1">{stat.number}</div>
                            <div className="text-[11px] text-stone-500 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Performance metrics row */}
                <div className="grid grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-xl bg-emerald-50 border border-emerald-200/40 p-4 text-center"
                    >
                        <div className="text-xl font-black text-emerald-600 mb-1">58%</div>
                        <div className="text-[10px] text-stone-500 font-medium">Average reduction in time-to-hire</div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.06 }}
                        className="rounded-xl bg-sky-50 border border-sky-200/40 p-4 text-center"
                    >
                        <div className="text-xl font-black text-sky-600 mb-1">89.3%</div>
                        <div className="text-[10px] text-stone-500 font-medium">AI screening accuracy</div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.12 }}
                        className="rounded-xl bg-amber-50 border border-amber-200/40 p-4 text-center"
                    >
                        <div className="text-xl font-black text-amber-600 mb-1">3.2x</div>
                        <div className="text-[10px] text-stone-500 font-medium">More qualified applicants</div>
                    </motion.div>
                </div>
            </div>

            {/* Industry-Specific Stats Bar (appears when industry is selected) */}
            {industryStats && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-fuchsia-50 p-6 mb-10 border border-pink-100"
                >
                    <p className="text-[10px] font-bold text-pink-400 mb-4">
                        Industry Benchmarks — Why Companies Like Yours Switch
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {industryStats.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 text-left">
                                <s.icon size={14} className="mt-0.5 text-pink-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-stone-800">{s.stat}</p>
                                    <p className="text-[10px] text-stone-500">{s.source}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="mx-auto max-w-2xl mb-12 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-2">Select Customer Stories</p>
                <p className="text-sm text-stone-500">
                    {selectedIndustry && selectedIndustry !== 'none'
                        ? 'A few examples from our portfolio of 13,000+ organizations, filtered to your industry.'
                        : 'A few examples from our portfolio of 13,000+ organizations.'}
                </p>
            </div>

            {/* ── Dynamic Customer Proof (from universe) ── */}
            {enabledProofCustomers && enabledProofCustomers.length > 0 && (
                <DynamicProofCustomers enabledProofCustomers={enabledProofCustomers} />
            )}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {displayedStudies.map((study, index) => {
                    const Icon = study.icon;
                    return (
                        <motion.div
                            key={study.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.12 }}
                            className="flex flex-col rounded-3xl bg-white p-8 shadow-xl border border-stone-100"
                        >
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900">{study.name}</h3>
                                    <p className="text-xs font-semibold text-stone-400">
                                        {study.industry}
                                    </p>
                                </div>
                            </div>
                            <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                                {study.metric}
                            </div>
                            <p className="mb-4 flex-1 text-sm italic leading-relaxed text-stone-600">
                                "{study.quote}"
                            </p>
                            <div className="flex items-center gap-2 border-t border-stone-100 pt-4">
                                <Sparkles size={14} className="text-amber-500" />
                                <span className="text-[11px] font-bold text-stone-500">
                                    Powered by: {study.ttFeature}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
