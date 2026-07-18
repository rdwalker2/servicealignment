// ============================================================
// ContractSecurityCenter — Prospect-facing trust & procurement hub
// Matches content from the Teamtailor Contract Essentials deck
// ============================================================


import { motion } from 'framer-motion';
import {
  Shield,
  FileText,
  Lock,
  Building,
  ExternalLink,
  Sparkles,
  Scale,
  CreditCard,
  Award,
  Star,
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';

// ── Animation constants ──

const PREMIUM_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: PREMIUM_EASE, delay: i * 0.1 },
  }),
};

// ── Data ──

interface DocumentLink {
  label: string;
  url: string | null;
  contactNote?: string;
}

interface DocumentCategory {
  title: string;
  icon: typeof Shield;
  gradient: string;
  borderColor: string;
  bgColor: string;
  iconBg: string;
  links: DocumentLink[];
}

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    title: 'Contract / Legal',
    icon: Scale,
    gradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-100',
    bgColor: 'bg-blue-50/30',
    iconBg: 'bg-blue-100',
    links: [
      {
        label: 'Standard Terms of Service',
        url: 'https://trust.teamtailor.com/?itemName=legal',
      },
      {
        label: 'Data Processing Agreement (DPA)',
        url: 'https://trust.teamtailor.com/?itemName=legal',
      },
      {
        label: 'Data Transfer Impact Assessment',
        url: null,
        contactNote: 'Contact your rep for access',
      },
    ],
  },
  {
    title: 'Security / Compliance',
    icon: Shield,
    gradient: 'from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-100',
    bgColor: 'bg-emerald-50/30',
    iconBg: 'bg-emerald-100',
    links: [
      {
        label: 'Security Review (SOC 2 Type II & ISO 27001/27701)',
        url: 'https://trust.teamtailor.com/',
      },
      {
        label: 'Security Whitepaper (2026)',
        url: 'https://trust.teamtailor.com/',
      },
      {
        label: 'GDPR & Data Privacy FAQs',
        url: 'https://trust.teamtailor.com/',
      },
      {
        label: 'Responsible AI Principles',
        url: 'https://support.teamtailor.com/en/articles/10450488-teamtailor-responsible-ai-principles',
      },
      {
        label: 'Data Retention & Processing',
        url: 'https://trust.teamtailor.com/',
      },
    ],
  },
  {
    title: 'Procurement / Finance',
    icon: CreditCard,
    gradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-100',
    bgColor: 'bg-amber-50/30',
    iconBg: 'bg-amber-100',
    links: [
      {
        label: 'Supplier Form / Bank Details',
        url: null,
        contactNote: 'Contact your rep for access',
      },
      {
        label: 'Standard SLA Agreement',
        url: 'https://support.teamtailor.com/en/articles/6517619-teamtailor-sla-statement',
      },
      {
        label: 'Enhanced SLA Agreement',
        url: null,
        contactNote: 'Additional cost — contact your rep',
      },
    ],
  },
];



interface ReviewPlatform {
  name: string;
  url: string;
  color: string;
  bgColor: string;
  rating: string;
}

const REVIEW_PLATFORMS: ReviewPlatform[] = [
  {
    name: 'G2',
    url: 'https://www.g2.com/products/teamtailor/reviews',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    rating: '4.6 / 5',
  },
  {
    name: 'Capterra',
    url: 'https://www.capterra.com/p/teamtailor/reviews',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    rating: '4.6 / 5',
  },
  {
    name: 'Gartner',
    url: 'https://www.gartner.com/reviews/market/recruiting-software/vendor/teamtailor',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    rating: '4.5 / 5',
  },
];

// ── Props ──

interface ContractSecurityCenterProps {
  themeColor: string;
  companyName: string;
  session?: DiscoverySession | null;
  // ── Config overrides ──
  enabledBadges?: Record<string, boolean>;
  enabledDocCategories?: Record<string, boolean>;
  showAIPromise?: boolean;
  showReviewBadges?: boolean;
}

// ── Component ──

export function ContractSecurityCenter({
  themeColor,
  companyName,
  session,
  enabledBadges,
  enabledDocCategories,
  showAIPromise = true,
  showReviewBadges = true,
}: ContractSecurityCenterProps) {

  const ALL_BADGES = ['SOC 2 Type II', 'ISO 27001', 'ISO 27701', 'GDPR Compliant', 'Responsible AI', 'EU AI Act Ready'];
  const visibleBadges = enabledBadges ? ALL_BADGES.filter(b => enabledBadges[b] !== false) : ALL_BADGES;
  const visibleDocCategories = enabledDocCategories
    ? DOCUMENT_CATEGORIES.filter(c => enabledDocCategories[c.title] !== false)
    : DOCUMENT_CATEGORIES;

  return (
    <div className="w-full">
      {/* ── Section Header ── */}
      <div className="mb-14 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
          style={{ borderColor: `${themeColor}30`, backgroundColor: `${themeColor}08` }}
        >
          <Lock size={13} style={{ color: themeColor }} />
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: themeColor }}
          >
            Contract Essentials
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl"
        >
          Trust & Security Center
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mx-auto max-w-2xl text-base text-zinc-500 leading-relaxed"
        >
          Everything {companyName} needs to evaluate, approve, and execute your
          Teamtailor partnership — all in one place.
        </motion.p>
      </div>

      {/* ── Trust Badges Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mx-auto mb-12 flex flex-wrap items-center justify-center gap-3"
      >
        {visibleBadges.map(
          (badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
            >
              <Shield size={11} />
              {badge}
            </span>
          ),
        )}
      </motion.div>

      {/* ── AI Data Promise Callout ── */}
      {showAIPromise && (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25 }}
        className="mx-auto mb-8 max-w-3xl rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-violet-50/50 p-6 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
            <Sparkles size={18} className="text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900 mb-1">
              Our AI Data Promise
            </h4>
            <p className="text-sm text-indigo-700 leading-relaxed">
              "We will <strong>not</strong> use or share customer data processed in an AI System for our or third-party purposes, such as training or development."
              <span className="text-indigo-500"> — Teamtailor Responsible AI Principles</span>
            </p>
            <p className="mt-2 text-xs text-indigo-500">
              Your candidate data stays yours. Always. No exceptions.
            </p>
          </div>
        </div>
      </motion.div>
      )}

      {/* ── Inline Security Highlights ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mx-auto mb-10 grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { icon: Lock, label: 'AES-256 Encryption', detail: 'All data encrypted at rest and TLS 1.2+ in transit' },
          { icon: Building, label: 'AWS Hosted', detail: 'EU (Ireland) & US regions, fully isolated data centers' },
          { icon: Shield, label: 'Annual Pen Testing', detail: 'External penetration tests + continuous vulnerability scanning' },
          { icon: Award, label: '99.9% Uptime', detail: 'Enterprise-grade availability with status monitoring' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-zinc-100 bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <Icon size={14} className="text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-zinc-800 mb-0.5">{item.label}</p>
              <p className="text-[10px] text-zinc-500 leading-snug">{item.detail}</p>
            </div>
          );
        })}
      </motion.div>

      {/* ── Document Categories Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-10">
        {visibleDocCategories.map((category, catIndex) => {
          const CatIcon = category.icon;
          return (
            <motion.div
              key={category.title}
              custom={catIndex}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              className={`group relative overflow-hidden rounded-2xl border ${category.borderColor} bg-white shadow-sm transition-shadow hover:shadow-lg`}
            >
              {/* Subtle gradient header */}
              <div
                className={`bg-gradient-to-br ${category.gradient} px-6 pt-6 pb-5`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${category.iconBg}`}
                  >
                    <CatIcon size={18} className="text-zinc-700" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    {category.title}
                  </h3>
                </div>
              </div>

              {/* Links */}
              <div className="divide-y divide-zinc-100 px-6 pb-2">
                {category.links.map((link) => (
                  <div
                    key={link.label}
                    className="flex items-start gap-3 py-3.5"
                  >
                    <FileText
                      size={15}
                      className="mt-0.5 shrink-0 text-zinc-400"
                    />
                    <div className="flex-1 min-w-0">
                      {link.url ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link flex items-start gap-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
                        >
                          <span className="leading-snug">{link.label}</span>
                          <ExternalLink
                            size={12}
                            className="mt-0.5 shrink-0 text-zinc-400 group-hover/link:text-zinc-600 transition-colors"
                          />
                        </a>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-zinc-700 leading-snug">
                            {link.label}
                          </p>
                          {link.contactNote && (
                            <p className="mt-0.5 text-xs text-zinc-400 italic">
                              {link.contactNote}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Review Platform Badges ── */}
      {showReviewBadges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6, ease: PREMIUM_EASE }}
          className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6"
        >
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award size={16} className="text-zinc-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Trusted by 13,000+ Companies Worldwide
              </p>
            </div>
            <p className="text-sm text-zinc-500">
              See what real customers are saying on leading review platforms
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REVIEW_PLATFORMS.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center gap-2.5 rounded-xl ${platform.bgColor} border border-transparent hover:border-zinc-200 p-5 transition-all hover:shadow-md`}
              >
                <span
                  className={`text-2xl font-black ${platform.color}`}
                >
                  {platform.name}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-zinc-700">
                  {platform.rating}
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-zinc-600 transition-colors">
                  Read reviews
                  <ExternalLink size={10} />
                </span>
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
