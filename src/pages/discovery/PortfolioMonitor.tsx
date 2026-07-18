import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPredictiveDataByToken, type PortfolioData, type PortfolioPropertyData } from '../../lib/predictiveEngineDb';

// Reusable icons
const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="arrow inline-block ml-1">
    <path d="M5 12h14M13 5l7 7-7 7"/>
  </svg>
);

const Wrench = () => (
  <svg className="btn-icon w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>
  </svg>
);

const Calendar = () => (
  <svg className="btn-icon w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 5l7 7-7 7"/>
  </svg>
);

import { Lock, CloudLightning, MapPin, Activity } from 'lucide-react';

export default function PortfolioMonitor() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (token) {
        const result = await getPredictiveDataByToken(token);
        setData(result);
      }
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-[Archivo] text-[var(--muted)]">Loading portfolio...</div>;
  }

  if (!data || data.properties.length === 0) {
    return <div className="min-h-screen flex items-center justify-center font-[Archivo] text-red-500">Portfolio not found or empty.</div>;
  }

  // Derived stats
  const totalBuildings = data.properties.length;
  const atRiskCount = data.properties.filter(p => (p.healthScore?.health_score ?? 100) < 50).length;
  const avgScore = Math.round(data.properties.reduce((sum, p) => sum + (p.healthScore?.health_score ?? 100), 0) / (totalBuildings || 1));

  return (
    <div className="font-[Archivo] text-[var(--ink)] bg-[var(--paper)] min-h-screen overflow-x-hidden selection:bg-[#E1251B]/20 selection:text-[#E1251B]">
      {/* HEADER */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[var(--hairline)] z-20 transition-all">
        <div className="max-w-[var(--max-w)] mx-auto px-[var(--gutter)] py-5 flex items-center justify-between gap-8 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="font-extrabold text-[2.1rem] text-[var(--jll-red)] tracking-[-0.04em] leading-none">JLL</div>
            <div className="w-[1px] h-9 bg-[var(--hairline)]"></div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.7rem] font-bold tracking-[0.18em] text-[var(--ink)] uppercase">PORTFOLIO</span>
              <span className="text-[0.7rem] font-medium tracking-[0.18em] text-[var(--muted)] uppercase">ROOF HEALTH MONITOR</span>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="hidden sm:flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.18em] text-[var(--muted)] pr-2 border-r border-[var(--hairline)] mr-2">
              <span className="w-2 h-2 rounded-full bg-[var(--score-green)] shadow-[0_0_0_0_rgba(93,191,60,0.5)] animate-pulse-green"></span>
              <span>LIVE</span>
            </div>
            <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-[1.15rem] py-[0.85rem] font-[Archivo] text-[0.82rem] font-bold tracking-[-0.005em] rounded-sm transition-all bg-[var(--ink)] text-white hover:-translate-y-[1px] hover:bg-[#2a2a2a] hover:shadow-[0_10px_24px_-10px_rgba(0,0,0,0.4)] group border-none cursor-pointer">
              Schedule a Meeting with Your Advisor
              <span className="w-4 h-4 transition-transform group-hover:translate-x-[3px]"><Calendar /></span>
            </button>
            <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-[1.15rem] py-[0.85rem] font-[Archivo] text-[0.82rem] font-bold tracking-[-0.005em] rounded-sm transition-all bg-[var(--jll-red)] text-white relative overflow-hidden group hover:-translate-y-[1px] hover:bg-[var(--jll-red-deep)] hover:shadow-[0_10px_24px_-8px_rgba(225,37,27,0.5)] border-none cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
              <span className="w-4 h-4 text-[#fff5a8] drop-shadow-[0_0_6px_rgba(255,220,60,0.6)]"><Wrench /></span>
              Fix a Leak Now
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-b from-[#f4f4f5] to-[#e4e4e7] text-[var(--ink)] pt-[clamp(3rem,8vw,6.5rem)] pb-[clamp(3rem,7vw,5rem)] relative overflow-hidden">
        {/* Background Satellite Map Effect */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-multiply">
           <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Satellite background" className="w-full h-full object-cover grayscale" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#f4f4f5] via-[#f4f4f5]/90 to-transparent pointer-events-none"></div>

        <div className="max-w-[var(--max-w)] mx-auto px-[var(--gutter)] relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <div className="text-[0.72rem] font-bold tracking-[0.22em] text-[var(--jll-red)] mb-7 flex items-center gap-2.5 opacity-0 animate-[rise_0.85s_cubic-bezier(.2,.7,.2,1)_0.08s_forwards] uppercase">
              <span className="inline-block w-2 h-2 bg-[var(--jll-red)] animate-pulse"></span>
              PORTFOLIO ALERT FOR THE {data.properties[0].campaign.campaign_name.toUpperCase()} TEAM
            </div>
            
            <h1 className="font-extrabold text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] text-[var(--ink)] opacity-0 animate-[rise_0.85s_cubic-bezier(.2,.7,.2,1)_0.2s_forwards]">
              Your portfolio just <br />
              <em className="not-italic text-[var(--jll-red)] border-b-[6px] border-[var(--jll-red)] pb-1 inline-block mt-2">pinged our system.</em>
            </h1>
            
            <p className="mt-8 text-[clamp(1rem,1.2vw,1.1rem)] text-[#3f3f46] max-w-[36rem] leading-[1.6] opacity-0 animate-[rise_0.85s_cubic-bezier(.2,.7,.2,1)_0.34s_forwards] font-medium">
              Our predictive monitoring engine cross-referenced recent severe weather data with satellite imagery of your {totalBuildings} properties. We've detected critical vulnerabilities on <strong className="text-[var(--ink)]">{atRiskCount} roofs</strong> that require your immediate review.
            </p>
            
            <div className="mt-10 flex flex-col items-start gap-4 opacity-0 animate-[rise_0.85s_cubic-bezier(.2,.7,.2,1)_0.45s_forwards]">
              <button onClick={() => window.scrollBy({top: window.innerHeight - 100, behavior: 'smooth'})} className="inline-flex items-center justify-center gap-2 px-[1.75rem] py-[1.1rem] font-[Archivo] text-[0.95rem] font-bold tracking-[-0.005em] rounded-sm transition-all bg-[var(--jll-red)] text-white hover:bg-[var(--jll-red-deep)] hover:-translate-y-[2px] hover:shadow-[0_14px_28px_-8px_rgba(225,37,27,0.4)] border-none cursor-pointer">
                View Damage Report <ArrowRight />
              </button>
              
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-3 pl-1 mt-1 opacity-80 hover:opacity-100 transition-opacity">
                  <span className="text-[0.8rem] font-medium text-[#71717a]">Prefer text alerts?</span>
                  <div className="relative flex items-center group/sms">
                    <input 
                      type="tel" 
                      placeholder="Enter mobile number" 
                      className="bg-white/50 backdrop-blur-sm border border-black/10 rounded-full pl-4 pr-10 py-1.5 text-[0.8rem] font-medium outline-none focus:border-[var(--jll-red)] focus:bg-white focus:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all w-[180px] focus:w-[200px] placeholder:text-[#a1a1aa]" 
                    />
                    <button className="absolute right-1.5 w-6 h-6 rounded-full bg-[#e4e4e7] text-[#71717a] group-focus-within/sms:bg-[var(--jll-red)] group-focus-within/sms:text-white flex items-center justify-center hover:scale-105 transition-all">
                      <ArrowRight />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pl-[118px] text-[10px] font-medium text-zinc-400">
                  <Lock size={10} /> 
                  <span>Secure & Private. <span className="text-zinc-500">No spam.</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 opacity-0 animate-[rise_0.85s_cubic-bezier(.2,.7,.2,1)_0.48s_forwards]">
            <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-2xl p-8 relative overflow-hidden shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]">
              <div className="absolute top-0 right-0 p-5">
                 <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 shadow-sm">
                   <span className="w-2 h-2 rounded-full bg-[var(--score-red)] animate-pulse shadow-[0_0_10px_rgba(225,37,27,0.4)]"></span>
                   <span className="text-[0.65rem] font-bold tracking-[0.2em] text-[#3f3f46] uppercase">LIVE</span>
                 </div>
              </div>
              
              <div className="mb-10 pb-6 border-b border-black/5">
                <div className="text-[0.65rem] font-bold tracking-[0.1em] text-zinc-500 uppercase mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active Monitoring Feeds
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2 text-zinc-600"><CloudLightning size={14} className="text-[#015287]"/> NOAA Severe Weather API</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] tracking-wide">SYNCED</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2 text-zinc-600"><MapPin size={14} className="text-[#3b82f6]"/> Geospatial Satellite Feed</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] tracking-wide">LIVE</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2 text-zinc-600"><Activity size={14} className="text-[#f59e0b]"/> Local Permit Ledger</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] tracking-wide">VERIFIED</span>
                  </div>
                </div>
              </div>
              
              <div className="text-[0.75rem] font-bold tracking-[0.2em] text-[#71717a] uppercase mb-2">Portfolio Average</div>
              <div className="text-[1.2rem] font-bold text-[var(--ink)] mb-6">Roof Health Score</div>
              
              <div className="flex items-end gap-3 mb-6">
                <div className="font-extrabold text-[6.5rem] leading-none tracking-[-0.05em] text-[var(--ink)] drop-shadow-sm">
                  {avgScore}
                </div>
                <div className="text-xl font-bold text-[#a1a1aa] mb-3 tracking-widest">/ 100</div>
              </div>
              
              <div className="w-full h-2.5 bg-[#e4e4e7] rounded-full overflow-hidden mb-8 shadow-inner">
                <div className="h-full bg-gradient-to-r from-[var(--score-red)] via-[var(--score-orange)] to-[var(--score-green)] relative" style={{ width: `${avgScore}%` }}>
                  <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-white/40 to-transparent"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-black/10 pt-7">
                <div>
                  <div className="text-[2.2rem] font-extrabold text-[var(--ink)] leading-none font-tabular-nums">{atRiskCount}</div>
                  <div className="text-[0.7rem] font-bold tracking-[0.15em] text-[var(--score-red)] uppercase mt-2">Critical Roofs</div>
                </div>
                <div>
                  <div className="text-[2.2rem] font-extrabold text-[var(--ink)] leading-none font-tabular-nums">{totalBuildings}</div>
                  <div className="text-[0.7rem] font-bold tracking-[0.15em] text-[#71717a] uppercase mt-2">Total Monitored</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="bg-[var(--cream)] pt-[clamp(3.5rem,7vw,6rem)] pb-[clamp(4rem,8vw,6rem)]">
        <div className="max-w-[var(--max-w)] mx-auto px-[var(--gutter)]">
          <div className="flex justify-between items-end gap-8 mb-12 flex-wrap opacity-0 animate-[rise_0.85s_cubic-bezier(.2,.7,.2,1)_0.62s_forwards]">
            <div>
              <div className="text-[0.72rem] font-bold tracking-[0.22em] text-[var(--jll-red)] mb-4 flex items-center gap-2.5 uppercase">
                <span className="inline-block w-2 h-2 bg-current rotate-45"></span>
                YOUR PORTFOLIO · {totalBuildings} BUILDINGS
              </div>
              <h2 className="font-extrabold text-[clamp(2rem,4vw,3.4rem)] leading-none tracking-[-0.04em] text-[var(--ink)]">
                Every roof. <em className="not-italic text-[var(--jll-red)] font-extrabold">Scored.</em> Today.
              </h2>
            </div>
            <div className="flex gap-6 text-[0.75rem] font-semibold text-[var(--ink)] items-center flex-wrap">
              <span className="inline-flex items-center gap-2"><span className="w-3 h-3 bg-[var(--score-red)]"></span>At risk</span>
              <span className="inline-flex items-center gap-2"><span className="w-3 h-3 bg-[var(--score-orange)]"></span>Watch</span>
              <span className="inline-flex items-center gap-2"><span className="w-3 h-3 bg-[var(--score-yellow)]"></span>Caution</span>
              <span className="inline-flex items-center gap-2"><span className="w-3 h-3 bg-[var(--score-green)]"></span>Clear</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.properties.map((item, idx) => {
              const score = item.healthScore?.health_score ?? 100;
              let bandColor = 'var(--score-green)';
              let statusText = 'CLEAR';
              let statusColor = '#3A8A26';

              if (score < 50) {
                bandColor = 'var(--score-red)';
                statusText = 'AT RISK';
                statusColor = 'var(--score-red)';
              } else if (score < 70) {
                bandColor = 'var(--score-orange)';
                statusText = 'WATCH';
                statusColor = 'var(--score-orange)';
              } else if (score < 85) {
                bandColor = 'var(--score-yellow)';
                statusText = 'CAUTION';
                statusColor = '#B88820';
              }

              // Take the first signal description as the note if available
              const note = item.signals.length > 0 
                ? item.signals[0].signal_data?.description 
                : 'All systems normal. Routine monitoring active.';

              return (
                <article key={item.property.id} id={`property-${item.property.id}`} className="bg-white rounded-md overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-20px_rgba(0,0,0,0.22)] cursor-pointer group flex flex-col h-full opacity-0 animate-[rise_0.85s_cubic-bezier(.2,.7,.2,1)_forwards]" style={{ animationDelay: `${0.62 + idx * 0.05}s` }}>
                  <div className="h-1.5 w-full" style={{ backgroundColor: bandColor }}></div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="text-[0.62rem] font-extrabold tracking-[0.22em] mb-3" style={{ color: statusColor }}>{statusText}</div>
                    <div className="grid grid-cols-[auto_1fr] gap-4 items-start mb-4">
                      <div className="font-extrabold text-[3.4rem] leading-none text-[var(--ink)] font-tabular-nums tracking-[-0.05em]">{score}</div>
                      <div>
                        <div className="font-bold text-base text-[var(--ink)] leading-[1.25]">{item.property.property_name}</div>
                        <div className="text-[0.78rem] text-[var(--muted)] mt-1 leading-[1.3]">{item.property.address}</div>
                      </div>
                    </div>
                    {/* Add Map Embed */}
                    <div className="w-full h-32 mb-4 rounded overflow-hidden border border-[var(--hairline)]">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_MOCK_API_KEY_OR_USE_SATELLITE_VIEW&q=${encodeURIComponent(item.property.address)}&maptype=satellite`}
                      ></iframe>
                    </div>
                    {/* Explicit Score Factors Display */}
                    <div className="mb-4">
                      {item.healthScore?.score_factors?.filter((f: any) => f.factor !== 'baseline').map((factor: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-[0.7rem] py-1 border-b border-[var(--hairline)] last:border-0">
                          <span className="text-[#3a4452] font-semibold">{factor.label}</span>
                          <span className="text-[var(--score-red)] font-bold">{factor.impact} pts</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto pt-3 border-t border-[var(--hairline)] font-medium text-[0.82rem] text-[#3a4452] leading-[1.4]">
                      {note}
                    </div>
                    <div className="mt-4 flex items-center justify-between opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-[0.72rem] font-bold tracking-[0.14em] text-[var(--jll-red)] uppercase">
                      <span>VIEW BUILDING DETAIL</span>
                      <ArrowRight />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="bg-[var(--ink)] text-white py-[clamp(2.5rem,5vw,4rem)]">
        <div className="max-w-[var(--max-w)] mx-auto px-[var(--gutter)] grid md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <div className="text-[0.7rem] font-extrabold tracking-[0.22em] text-[var(--gold-bright)] mb-4 flex items-center gap-2.5 uppercase">
              <span className="inline-block w-2 h-2 bg-current rotate-45"></span>
              POWERED BY AI
            </div>
            <h2 className="font-extrabold text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.05] tracking-[-0.035em] mb-2 text-white">Always monitoring.</h2>
            <p className="font-medium text-[0.95rem] leading-[1.5] text-[#9aaab8]">Our predictive marketing engine analyzes weather, satellite, and permit data to protect your assets 24/7.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
