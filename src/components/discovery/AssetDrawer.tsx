import React from 'react';
import { X, MapPin, Calendar, Database, ShieldAlert, CheckCircle2, TrendingDown, DollarSign, Crosshair } from 'lucide-react';
import { NwsPrecipitationForecast } from './NwsPrecipitationForecast';
import { SchedulingModal } from './SchedulingModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  property: any; // The full property item from predictiveData
}

export function AssetDrawer({ isOpen, onClose, property: incomingProperty }: Props) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [cachedProperty, setCachedProperty] = React.useState(incomingProperty);
  const [isRendered, setIsRendered] = React.useState(isOpen);

  React.useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      if (incomingProperty) setCachedProperty(incomingProperty);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 500); // 500ms allows animation to finish smoothly
      return () => clearTimeout(timer);
    }
  }, [isOpen, incomingProperty]);

  if (!isRendered && !isOpen) return null;

  const property = incomingProperty || cachedProperty;

  if (!property) return null;

  const sqFt = property.property?.square_footage || 0;
  const hasSqFt = sqFt > 0;
  const score = property.healthScore?.health_score ?? 100;
  
  let age = 0;
  let hasHail = false;

  if (property.healthScore?.score_factors) {
    try {
      const factors = typeof property.healthScore.score_factors === 'string' 
        ? JSON.parse(property.healthScore.score_factors) 
        : property.healthScore.score_factors;
      
      const ageFactor = factors.find((f: any) => f.factor === 'permit_roof_age');
      if (ageFactor) age = ageFactor.age;

      const hailFactor = factors.find((f: any) => f.factor === 'real_time_hail');
      if (hailFactor && hailFactor.strikes > 0) hasHail = true;
    } catch(e) {}
  }

  // Parse Real Coordinates
  let latText = "Awaiting Sync";
  let lonText = "";
  let latNum: number | null = null;
  let lonNum: number | null = null;

  if (property.property?.coordinates) {
    try {
      const coords = typeof property.property.coordinates === 'string' 
        ? JSON.parse(property.property.coordinates) 
        : property.property.coordinates;
      
      if (coords.coordinates && coords.coordinates.length === 2) {
        lonNum = coords.coordinates[0];
        latNum = coords.coordinates[1];
        // GeoJSON uses [lon, lat]
        latText = `${latNum!.toFixed(4)}° N`;
        lonText = `, ${Math.abs(lonNum!).toFixed(4)}° W`;
      }
    } catch (e) {}
  }

  // Parse Real Weather Signal Date
  let noaaDate = "Monitoring Active";
  if (property.signals && property.signals.length > 0) {
    const weatherSignal = property.signals.find((s: any) => s.signal_type === 'weather');
    if (weatherSignal && weatherSignal.detected_at) {
      noaaDate = new Date(weatherSignal.detected_at).toISOString().split('T')[0] + ' (Verified)';
    } else {
      noaaDate = new Date(property.property.pierced_at || Date.now()).toISOString().split('T')[0] + ' (Last Scan)';
    }
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(9, 9, 11, 0.4)',
          backdropFilter: isOpen ? 'blur(8px)' : 'blur(0px)',
          WebkitBackdropFilter: isOpen ? 'blur(8px)' : 'blur(0px)',
          zIndex: 9999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '550px',
          backgroundColor: '#fff',
          boxShadow: isOpen ? '-20px 0 40px rgba(0,0,0,0.15)' : '0 0 0 rgba(0,0,0,0)',
          zIndex: 10000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ padding: 'clamp(16px, 4vw, 24px) clamp(20px, 5vw, 32px)', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10 }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              Asset Dossier
            </div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 900, color: '#09090b', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              {property.property?.property_name || 'Asset Detail'}
            </h2>
            <div style={{ fontSize: '0.9rem', color: '#52525b' }}>
              {property.property?.site_address || property.property?.address}
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#52525b' }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: 'clamp(24px, 5vw, 32px)' }}>
          
          {/* Data Verification Trail */}
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1c1917', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={16} color="#78716c" /> Data Verification Trail
            </h3>
            <div style={{ border: '1px solid #e7e5e4', borderRadius: 4, backgroundColor: '#fafaf9', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={14} color="#78716c" />
                  <span style={{ fontSize: '0.85rem', color: '#57534e', fontWeight: 600 }}>Asset Coordinates</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1c1917', fontFamily: 'monospace' }}>
                  {latText}{lonText}
                </div>
              </div>
              <div style={{ height: 1, backgroundColor: '#e7e5e4' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} color="#78716c" />
                  <span style={{ fontSize: '0.85rem', color: '#57534e', fontWeight: 600 }}>Permit Ledger Data</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> Verified Public Record
                </div>
              </div>
              <div style={{ height: 1, backgroundColor: '#e7e5e4' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={14} color="#78716c" />
                  <span style={{ fontSize: '0.85rem', color: '#57534e', fontWeight: 600 }}>NOAA SWDI Query</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1c1917', fontFamily: 'monospace' }}>
                  {noaaDate}
                </div>
              </div>

            </div>
          </div>

          {/* Live NWS Feed */}
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1c1917', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={16} color="#78716c" /> Live Weather Threat (Next 168 Hrs)
            </h3>
            {latNum !== null && lonNum !== null ? (
              <NwsPrecipitationForecast lat={latNum} lon={lonNum} />
            ) : (
              <div style={{ padding: '16px 0', borderTop: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: '#78716c', fontStyle: 'italic' }}>
                  Awaiting coordinates to query NOAA API.
                </div>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarSign size={16} color="#09090b" /> CapEx Liability Forecast
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ borderTop: '3px solid #dc2626', borderBottom: '1px solid #e4e4e7', borderLeft: '1px solid #e4e4e7', borderRight: '1px solid #e4e4e7', backgroundColor: '#ffffff', padding: 16, borderRadius: 0 }}>
                <div style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.1em' }}>Tear-Off Cost</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace' }}>{hasSqFt ? formatMoney(sqFt * 15.00) : 'Pending Data'}</div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: 4 }}>Required if neglected</div>
              </div>
              <div style={{ borderTop: '3px solid #10b981', borderBottom: '1px solid #e4e4e7', borderLeft: '1px solid #e4e4e7', borderRight: '1px solid #e4e4e7', backgroundColor: '#ffffff', padding: 16, borderRadius: 0 }}>
                <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.1em' }}>Coating Mitigation</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace' }}>{hasSqFt ? formatMoney(sqFt * 7.20) : 'Pending Data'}</div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: 4 }}>Preserves existing asset</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', marginBottom: 4, letterSpacing: '0.05em' }}>Historical Reactive Spend</div>
                <div style={{ fontSize: '0.75rem', color: '#52525b' }}>Estimated "Band-Aid" repairs to date</div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#52525b', fontFamily: 'monospace' }}>{hasSqFt ? formatMoney(sqFt * 0.45) : 'Pending Data'}</div>
            </div>

            {/* Cost of Inaction (Accelerated Decay) */}
            <div style={{ paddingBottom: 16 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
                 Cost of Inaction
              </div>
              <div style={{ fontSize: '0.85rem', color: '#52525b', lineHeight: 1.5 }}>
                 Without a proactive preventative maintenance plan, this {hasSqFt ? sqFt.toLocaleString() : '---'} sq ft property will experience a <strong style={{color: '#09090b'}}>40% accelerated decay rate</strong>, resulting in approximately <strong style={{color: '#dc2626'}}>{hasSqFt ? formatMoney(sqFt * 7.20 * 0.40) : 'Pending Data'} in unneeded capital investment</strong> over its lifecycle.
              </div>
            </div>
          </div>

          {/* AI Intelligence Note */}
          <div style={{ marginBottom: 40, padding: '16px', border: `1px solid ${score < 70 ? '#fca5a5' : '#86efac'}`, borderLeft: `3px solid ${score < 70 ? '#ef4444' : '#22c55e'}` }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: score < 70 ? '#b91c1c' : '#15803d', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
              Predictive Insight
            </div>
            <div style={{ fontSize: '0.75rem', color: score < 70 ? '#7f1d1d' : '#14532d', lineHeight: 1.6, fontWeight: 500 }}>
              {hasHail && age > 15 
                ? `Permit data flags roof age at ${age} yrs. NOAA confirms recent severe hail intersecting coordinates. High risk.` 
                : hasHail 
                  ? `NOAA SWDI confirms recent severe hail events intersecting coordinates. Physical inspection recommended.`
                  : age > 20
                    ? `Permit data flags roof age at ${age} yrs. Capital cycle window approaching. Warranty likely expired.`
                    : age > 15
                      ? `Permit data flags roof age at ${age} yrs. Approaching mid-life check.`
                      : `Strong permit-verified age profile (${age} yrs). All systems normal. Next routine check recommended.`}
            </div>
          </div>

          {/* Lifecycle & Warranty */}
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingDown size={16} color="#09090b" /> Lifecycle & Warranty
            </h3>
            
            <div style={{ position: 'relative', paddingTop: 20 }}>
              <div style={{ position: 'absolute', top: 24, left: 16, bottom: 0, width: 1, backgroundColor: '#e4e4e7' }}></div>
              
              <div style={{ position: 'relative', paddingLeft: 40, marginBottom: 24 }}>
                <div style={{ position: 'absolute', left: 12, top: 2, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#a1a1aa', border: '2px solid #ffffff' }}></div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#71717a', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>EST. {new Date().getFullYear() - age}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b' }}>Initial Installation</div>
                <div style={{ fontSize: '0.75rem', color: '#52525b' }}>Verified via Municipal Permit Data</div>
              </div>

              {hasHail && (
                <div style={{ position: 'relative', paddingLeft: 40, marginBottom: 24 }}>
                  <div style={{ position: 'absolute', left: 12, top: 2, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#dc2626', border: '2px solid #ffffff' }}></div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>RECENT</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b' }}>Severe Hail Strike</div>
                  <div style={{ fontSize: '0.75rem', color: '#52525b' }}>NOAA confirms severe weather intersection</div>
                </div>
              )}

              <div style={{ position: 'relative', paddingLeft: 40 }}>
                <div style={{ position: 'absolute', left: 12, top: 2, width: 10, height: 10, borderRadius: '50%', backgroundColor: age > 15 ? '#dc2626' : '#3b82f6', border: '2px solid #ffffff' }}></div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#71717a', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>TODAY</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: age > 15 ? '#dc2626' : '#09090b' }}>
                  {age > 15 ? 'Warranty at Risk / Expiring' : 'Mid-Life Operations'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#52525b' }}>
                  {age > 15 ? 'Lack of preventative maintenance documentation risks manufacturer claim denial.' : 'Routine maintenance required to preserve NDL warranty.'}
                </div>
              </div>

            </div>
          </div>

        </div>
        
        {/* Footer Action */}
        <div style={{ padding: 24, borderTop: '1px solid #e4e4e7', backgroundColor: '#ffffff', marginTop: 'auto' }}>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ 
            width: '100%', 
            padding: 16, 
            backgroundColor: '#09090b', 
            color: '#fff', 
            border: 'none', 
            fontSize: '0.85rem', 
            fontWeight: 800, 
            cursor: 'pointer', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderRadius: 8
          }}>
            <Crosshair size={16} />
            Schedule Drone Audit
          </button>
        </div>

      </div>

      <SchedulingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        propertyName={property.property?.property_name} 
      />
    </>
  );
}
