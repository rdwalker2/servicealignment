import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  companyName: string;
  themeColor?: string;
}

const DEFAULT_STANDARDS = [
  {
    id: 'sponsor',
    title: 'Executive Alignment',
    desc: 'The project must have a dedicated executive sponsor who attends the 30-minute kick-off and the 4-week review.',
  },
  {
    id: 'it',
    title: 'Technical Readiness',
    desc: 'Your IT team must commit 2 hours during week 1 to configure SSO, DNS, and baseline security integrations.',
  },
  {
    id: 'training',
    title: 'Hiring Manager Certification',
    desc: 'All core hiring managers must complete the 20-minute Service Alignment App Certification before go-live.',
  },
  {
    id: 'content',
    title: 'Brand Assets Ready',
    desc: 'Your employer brand guidelines, fonts, and core imagery must be supplied to our implementation team by day 3.',
  }
];

export default function MinimumStandards({ companyName, themeColor = '#1c1917' }: Props) {
  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
          D4 — Decision
        </p>
        <h2 className="mb-4 text-3xl font-bold text-zinc-900">
          Minimum Standards for Success
        </h2>
        <p className="mx-auto max-w-2xl text-zinc-500">
          Our track record of creating 3-5x ROI is not magic; it's by design. To guarantee these outcomes for {companyName}, we require the following commitments.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border-2 border-zinc-200 bg-white shadow-xl overflow-hidden">
          <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} style={{ color: themeColor }} />
              <span className="font-bold text-zinc-800">Partnership Requirements</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Non-Negotiable</span>
          </div>
          
          <div className="divide-y divide-zinc-100 p-2">
            {DEFAULT_STANDARDS.map((standard, i) => (
              <motion.div
                key={standard.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 hover:bg-zinc-50 transition-colors rounded-xl"
              >
                <div className="mt-0.5 shrink-0">
                  <CheckCircle2 size={18} style={{ color: themeColor }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 mb-1">{standard.title}</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">{standard.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
