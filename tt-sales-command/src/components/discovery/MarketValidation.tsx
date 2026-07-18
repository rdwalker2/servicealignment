import { motion } from 'framer-motion';
import { MessageSquare, Star, Building2, User, Quote, AlertCircle } from 'lucide-react';
import { getRelevantReviews, getATSDisplayName } from '../../data/competitorReviews';

interface MarketValidationProps {
  ats: string | null;
  selectedPains: string[];
  themeColor: string;
}

export function MarketValidation({ ats, selectedPains, themeColor }: MarketValidationProps) {
  const reviews = getRelevantReviews(ats, selectedPains, 3);
  const atsName = ats ? getATSDisplayName(ats) : '';

  if (!ats || reviews.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 shadow-inner">
          <MessageSquare className="text-zinc-400" size={24} />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
          Market Perspectives on {atsName}
        </h3>
        <p className="mt-2 text-zinc-500">
          You're not alone. Here's what other talent leaders are saying about the exact challenges you selected.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Top accent line */}
            <div
              className="absolute left-0 top-0 h-1 w-full"
              style={{ backgroundColor: themeColor, opacity: 0.8 }}
            />

            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold text-zinc-600">
                  <AlertCircle size={10} />
                  Validated Pain
                </span>
                {review.stars && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        size={12}
                        className={
                          starIdx < review.stars!
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-zinc-200 text-zinc-200'
                        }
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="relative mb-6">
                <Quote
                  className="absolute -left-2 -top-2 h-8 w-8 text-zinc-100"
                  style={{ zIndex: 0 }}
                />
                <p className="relative z-10 text-sm leading-relaxed text-zinc-700 italic">
                  "{review.quote}"
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                  <User size={12} className="text-zinc-400" />
                  {review.reviewerRole}
                </span>
                {review.companySize && (
                  <span className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <Building2 size={10} />
                    {review.companySize}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                  Source
                </span>
                <span className="mt-0.5 text-xs font-bold text-zinc-700">
                  {review.source}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
