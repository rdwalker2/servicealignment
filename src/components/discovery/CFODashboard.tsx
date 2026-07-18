import React from 'react';
import { DollarSign, ShieldAlert, AlertTriangle, TrendingUp, Briefcase, Calendar, Zap } from 'lucide-react';

interface Props {
  predictiveData: any;
}

export function CFODashboard({ predictiveData }: Props) {
  if (!predictiveData || !predictiveData.properties || predictiveData.properties.length === 0) return null;

  let totalSqFt = 0;
  let totalLiability = 0;
  let warrantiesAtRisk = 0;
  
  let year1Spend = 0; // Urgent Mitigation
  let year2Spend = 0; // Capital Cycle
  let year3Spend = 0; // End of life

  let atRiskCount = 0;

  predictiveData.properties.forEach((item: any) => {
    const sqFt = item.square_footage || 45000;
    totalSqFt += sqFt;

    const score = item.healthScore?.health_score ?? 100;
    if (score < 70) atRiskCount++;

    let age = 0;
    let hasHail = false;

    if (item.healthScore?.score_factors) {
      try {
        const factors = typeof item.healthScore.score_factors === 'string' 
          ? JSON.parse(item.healthScore.score_factors) 
          : item.healthScore.score_factors;
        
        const ageFactor = factors.find((f: any) => f.factor === 'permit_roof_age');
        if (ageFactor) age = ageFactor.age;

        const hailFactor = factors.find((f: any) => f.factor === 'real_time_hail');
        if (hailFactor && hailFactor.strikes > 0) hasHail = true;
      } catch(e) {}
    }

    if (age > 15) warrantiesAtRisk++;

    // Calculate Liability based on Service Alignment math
    const capexRisk = sqFt * 7.20 * (hasHail ? 0.65 : 0.07);
    const disruptionCost = (score < 70) ? 10000 : 0;
    const maintenanceSpike = sqFt * 0.45;
    totalLiability += (capexRisk + disruptionCost + maintenanceSpike);

    // 3-Year Forecasting logic
    if (score < 70 || hasHail) {
      year1Spend += (sqFt * 3.50);
    }
    if (age > 20) {
      year3Spend += (sqFt * 15.00);
    }
    if (age > 12 && age <= 20) {
      year2Spend += (sqFt * 7.20);
    }
  });

  const proactiveCost = totalSqFt * 0.05; // 5 cents a sqft for preventative maintenance

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <section className="page w-full" id="cfo-dashboard" style={{ padding: 'clamp(40px, 8vw, 80px) clamp(16px, 5vw, 40px)', backgroundColor: '#fff', borderTop: '1px solid #e7e5e4', borderBottom: '1px solid #e7e5e4' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1c1917', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #e7e5e4', padding: '4px 12px' }}>
             <Briefcase size={14} /> Asset Management Intelligence
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.25rem)', fontWeight: 900, color: '#1c1917', marginBottom: 16, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Portfolio CapEx & Liability Forecast
          </h2>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', color: '#57534e', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            Based on NOAA weather intersections and verified permit data across your {predictiveData.properties.length} properties, here is your 3-year capital exposure.
          </p>
        </div>

        {/* Macro Metrics */}
        <div className="flex flex-col md:grid md:grid-cols-3" style={{ borderTop: '1px solid #1c1917', borderBottom: '1px solid #e7e5e4', marginBottom: 64 }}>
          <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8, minHeight: 36 }}>
               <AlertTriangle size={14} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} /> 
               <span>Total Unfunded Liability</span>
            </div>
            <div style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: '#ef4444', letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap' }}>
              {formatMoney(totalLiability)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#57534e', marginTop: 'auto', paddingTop: 16, lineHeight: 1.5 }}>Aggregated risk across {atRiskCount} critical properties showing severe degradation.</div>
          </div>
          
          <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8, minHeight: 36 }}>
               <ShieldAlert size={14} color="#1c1917" style={{ marginTop: 2, flexShrink: 0 }} /> 
               <span>Warranties at Risk</span>
            </div>
            <div style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', gap: 8 }}>
               {warrantiesAtRisk} <span style={{fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', color: '#a8a29e', fontWeight: 500}}>Roofs</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#57534e', marginTop: 'auto', paddingTop: 16, lineHeight: 1.5 }}>Exceeding 15-year lifecycle window. Manufacturer compliance review required.</div>
          </div>

          <div className="p-6 md:p-8 flex flex-col">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8, minHeight: 36 }}>
               <TrendingUp size={14} color="#1c1917" style={{ marginTop: 2, flexShrink: 0 }} /> 
               <span>Preventative Strategy ROI</span>
            </div>
            <div style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', gap: 8 }}>
               {formatMoney(proactiveCost)} <span style={{fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', color: '#a8a29e', fontWeight: 500}}>/yr</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#57534e', marginTop: 'auto', paddingTop: 16, lineHeight: 1.5 }}>Cost to fully mitigate the {formatMoney(totalLiability)} total portfolio liability.</div>
          </div>
        </div>

        {/* 3-Year Capital Runway */}
        <style>{`
          @keyframes growWidth { from { max-width: 0%; } to { max-width: 100%; } }
          @keyframes revealFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        <div style={{ padding: '48px', backgroundColor: '#ffffff', borderRadius: 24, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          
          <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 24, position: 'relative', zIndex: 1 }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#09090b', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Calendar size={20} color="#dc2626" /> 3-Year Capital Runway
              </h3>
              <span style={{ fontSize: '0.9rem', color: '#71717a' }}>Projected CapEx based on asset age and weather stress</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative', zIndex: 1 }}>
            {/* Year 1 */}
            <div style={{ animation: 'revealFade 0.6s ease forwards' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dc2626' }}></span> Year 1 (Urgent Mitigation)
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#dc2626', fontFamily: 'monospace' }}>{formatMoney(year1Spend)}</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#f4f4f5', height: 16, borderRadius: 999, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: `${Math.min(100, (year1Spend / (totalLiability || 1)) * 100)}%`, background: 'linear-gradient(90deg, #dc2626, #ef4444)', height: '100%', borderRadius: 999, animation: 'growWidth 1.5s cubic-bezier(0.2,0.8,0.2,1) forwards', maxWidth: '0%' }}></div>
              </div>
            </div>

            {/* Year 2 */}
            <div style={{ animation: 'revealFade 0.6s ease 0.15s forwards', opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#52525b', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#52525b' }}></span> Year 2 (Capital Cycle / Coating)
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace' }}>{formatMoney(year2Spend)}</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#f4f4f5', height: 16, borderRadius: 999, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: `${Math.min(100, (year2Spend / (totalLiability || 1)) * 100)}%`, background: 'linear-gradient(90deg, #3f3f46, #52525b)', height: '100%', borderRadius: 999, animation: 'growWidth 1.5s cubic-bezier(0.2,0.8,0.2,1) 0.15s forwards', maxWidth: '0%' }}></div>
              </div>
            </div>

            {/* Year 3 */}
            <div style={{ animation: 'revealFade 0.6s ease 0.3s forwards', opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#71717a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#a1a1aa' }}></span> Year 3 (End of Life / Replacement)
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace' }}>{formatMoney(year3Spend)}</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#f4f4f5', height: 16, borderRadius: 999, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: `${Math.min(100, (year3Spend / (totalLiability || 1)) * 100)}%`, background: 'linear-gradient(90deg, #a1a1aa, #d4d4d8)', height: '100%', borderRadius: 999, animation: 'growWidth 1.5s cubic-bezier(0.2,0.8,0.2,1) 0.3s forwards', maxWidth: '0%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-6 md:p-8 bg-red-50 rounded-2xl border border-red-200 flex flex-col md:flex-row gap-5 items-start relative z-10" style={{ animation: 'revealFade 0.6s ease 0.45s forwards', opacity: 0 }}>
            <div className="bg-white p-3 rounded-full shadow-[0_4px_12px_rgba(220,38,38,0.1)] flex-shrink-0">
              <Zap size={24} color="#dc2626" />
            </div>
            <div>
              <strong className="text-red-600 uppercase text-[0.8rem] tracking-[0.15em] block mb-2 font-black">Strategic Recommendation</strong>
              <div className="text-[1.05rem] text-red-950 leading-relaxed font-medium">
                Reallocate reactionary maintenance budgets toward a Year 1 preventative sweep to defer Year 2 and Year 3 capital expenditures by up to 60 months.
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
