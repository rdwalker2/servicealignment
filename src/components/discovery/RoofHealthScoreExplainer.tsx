import React from 'react';
import { Activity, Database, CheckCircle2, ShieldAlert } from 'lucide-react';

export function RoofHealthScoreExplainer() {
  return (
    <div style={{ marginBottom: 48, backgroundColor: '#ffffff', border: '1px solid #e4e4e7', padding: '32px 40px', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e4e4e7', paddingBottom: 24, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={14} /> PREDICTIVE ENGINE
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '1.8rem', fontWeight: 900, color: '#09090b', letterSpacing: '-0.03em' }}>Roof Health Score</h2>
          <p style={{ margin: 0, color: '#52525b', fontSize: '0.95rem', maxWidth: 600, lineHeight: 1.6, fontWeight: 500 }}>
            A proprietary 1-100 metric calculated dynamically. It aggregates building age, roof material, historical NOAA weather events, and satellite imagery to predict failure probability.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', fontFamily: 'monospace', lineHeight: 1 }}>80+</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>HEALTHY</div>
          </div>
          <div style={{ width: 1, height: 40, backgroundColor: '#e4e4e7' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#dc2626', fontFamily: 'monospace', lineHeight: 1 }}>&lt;40</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>CRITICAL RISK</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 40 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Database size={16} color="#71717a" /> Data Sources
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <CheckCircle2 size={16} color="#10b981" style={{ marginTop: 2 }} />
              <div>
                <strong style={{ display: 'block', color: '#09090b', fontSize: '0.85rem' }}>NOAA SWDI Database</strong>
                <span style={{ color: '#52525b', fontSize: '0.8rem' }}>Severe weather data mapped directly to building coordinates.</span>
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <CheckCircle2 size={16} color="#10b981" style={{ marginTop: 2 }} />
              <div>
                <strong style={{ display: 'block', color: '#09090b', fontSize: '0.85rem' }}>Local Permit Records</strong>
                <span style={{ color: '#52525b', fontSize: '0.8rem' }}>Verified installation dates to track baseline degradation.</span>
              </div>
            </li>
          </ul>
        </div>
        
        <div style={{ width: 1, backgroundColor: '#e4e4e7' }}></div>
        
        <div style={{ flex: 1, paddingLeft: 8 }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <ShieldAlert size={16} color="#dc2626" /> The "Why"
          </h3>
          <p style={{ color: '#52525b', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
            How do we know a roof is failing if we haven't been on it? <br/><br/>
            Our predictive engine tracks NOAA data against the specific installation year of your TPO system. Recent weather events in your grid have dropped your score below our safety threshold. We want to do a physical inspection to verify the algorithm's findings <strong style={{ color: '#09090b' }}>before</strong> the water hits your tenants.
          </p>
        </div>
      </div>
    </div>
  );
}
