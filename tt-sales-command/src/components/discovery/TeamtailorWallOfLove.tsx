import { motion } from 'framer-motion';
import { Star, Award, Building2, User, Quote, ShieldCheck } from 'lucide-react';
import { getRelevantTTReviews } from '../../data/teamtailorReviews';

interface TeamtailorWallOfLoveProps {
  selectedPains: string[];
  themeColor: string;
}

export function TeamtailorWallOfLove({ selectedPains, themeColor }: TeamtailorWallOfLoveProps) {
  const reviews = getRelevantTTReviews(selectedPains, 3);

  if (reviews.length === 0) return null;

  return (
    <div className="w-full mt-12 pt-12 border-t border-zinc-200/60">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 shadow-inner border border-emerald-100">
          <ShieldCheck className="text-emerald-500" size={24} />
        </div>
        <h3 className="text-3xl font-bold tracking-tight text-zinc-900">
          Ranked #1 for a reason
        </h3>
        <p className="mt-3 text-zinc-500 max-w-2xl mx-auto">
          You don't have to take our word for it. Here is how Teamtailor is actively solving the exact challenges you identified, according to verified users on G2 and Capterra.
        </p>

        {/* G2 Badges Row */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {['Leader Enterprise 2025', 'Easiest To Use', 'Best Support', 'High Performer'].map((badge, i) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 shadow-sm ring-1 ring-zinc-200"
            >
              <Award size={14} className="text-[#FF495C]" />
              {badge}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {reviews.map((review, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-xl ring-1 ring-zinc-100 hover:shadow-2xl transition-all"
          >
            {/* Top accent line (emerald for positive) */}
            <div
              className="absolute left-0 top-0 h-1.5 w-full bg-emerald-400"
            />

            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                  <ShieldCheck size={12} />
                  Verified Solution
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <Star
                      key={starIdx}
                      size={14}
                      className="fill-[#FF495C] text-[#FF495C]"
                    />
                  ))}
                </div>
              </div>

              <div className="relative mb-6">
                <Quote
                  className="absolute -left-2 -top-2 h-8 w-8 text-emerald-50"
                  style={{ zIndex: 0 }}
                />
                <p className="relative z-10 text-sm leading-relaxed text-zinc-800 font-medium italic">
                  "{review.quote}"
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                  <User size={12} className="text-zinc-400" />
                  {review.reviewerRole}
                </span>
                {review.companySize && (
                  <span className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
                    <Building2 size={10} />
                    {review.companySize}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Source
                </span>
                <span className="mt-0.5 text-xs font-black text-zinc-800">
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
