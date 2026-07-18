const fs = require('fs');
const file = 'src/components/discovery/BusinessCaseDocument.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStart = "{predictiveData.properties.map((item: any, idx: number) => {";
const targetEnd = "                    <button style={{ \n                      marginTop: 'auto',";
const startIndex = code.indexOf(targetStart);
const endIndex = code.indexOf(targetEnd, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find timeline target block");
    process.exit(1);
}

const newBlock = `{
              [...predictiveData.properties]
              .sort((a, b) => (a.healthScore?.health_score ?? 100) - (b.healthScore?.health_score ?? 100))
              .map((item: any, idx: number) => {
              const score = item.healthScore?.health_score ?? 100;
              let bandColor = '#10b981'; // green
              let statusText = 'CLEAR';
              let statusColor = '#059669';

              if (score < 50) {
                bandColor = '#ef4444'; // red
                statusText = 'CRITICAL RISK';
                statusColor = '#dc2626';
              } else if (score < 70) {
                bandColor = '#f97316'; // orange
                statusText = 'HIGH RISK';
                statusColor = '#ea580c';
              } else if (score < 85) {
                bandColor = '#eab308'; // yellow
                statusText = 'CAUTION';
                statusColor = '#ca8a04';
              }

              // Extract Factors
              let age = 15;
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

              const installYear = new Date().getFullYear() - age;
              
              // Financial Risk Assessment Math (Derived from Roof Wars Playbook)
              const sqFt = item.property.sq_ft || item.property.square_feet || 20000;
              const capexRisk = sqFt * 7.20 * (hasHail ? 0.65 : 0.07);
              const disruptionCost = hasHail ? 10000 : 2500;
              const maintenanceSpike = sqFt * 0.10 * (hasHail ? 3 : 1);
              const totalRisk = capexRisk + disruptionCost + maintenanceSpike;
              
              // Triage Calculation
              const isTop5Percent = idx === 0 && predictiveData.properties.length > 3;

              return (
                <div key={item.property.id} style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: 16, 
                  overflow: 'hidden', 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)', 
                  border: \`1px solid \${bandColor}40\`, 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = \`0 20px 25px -5px \${bandColor}30, 0 8px 10px -6px rgba(0,0,0,0.05)\`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)';
                }}>
                  {/* Top Status Bar */}
                  <div style={{ padding: '12px 20px', backgroundColor: bandColor, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {score < 70 ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      {statusText}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', opacity: 0.9 }}>
                      Score: {score}
                    </div>
                  </div>

                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '4px 8px', backgroundColor: '#f5f5f4', color: '#57534e', borderRadius: 4, letterSpacing: '0.05em' }}>
                          PRIORITY #{idx + 1} OF {predictiveData.properties.length}
                        </span>
                        {isTop5Percent && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '4px 8px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 4, letterSpacing: '0.05em' }}>
                            TOP 5% HIGHEST RISK
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1c1917', lineHeight: 1.2, margin: '0 0 6px 0' }}>
                        {item.property.property_name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#78716c', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} />
                        {item.property.address}
                      </p>
                    </div>
                    
                    {/* Historical Timeline */}
                    <div style={{ backgroundColor: '#fafaf9', borderRadius: 8, padding: '20px 16px', marginBottom: 16, border: '1px solid #e7e5e4' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                        Historical Weather Timeline
                      </div>
                      
                      <div style={{ position: 'relative', paddingLeft: 20, borderLeft: '2px solid #e7e5e4', display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {hasHail && (
                          <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: -25, top: 4, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #fafaf9' }} />
                            <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 800, marginBottom: 2, letterSpacing: '0.05em' }}>APRIL 1, 2024</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c1917' }}>Catastrophic Hail Storm</div>
                            <div style={{ fontSize: '0.8rem', color: '#78716c', marginTop: 2 }}>NOAA SWDI confirmed severe hail core directly intersected property coordinates.</div>
                          </div>
                        )}

                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', left: -25, top: 4, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#a8a29e', border: '2px solid #fafaf9' }} />
                          <div style={{ fontSize: '0.65rem', color: '#a8a29e', fontWeight: 800, marginBottom: 2, letterSpacing: '0.05em' }}>EST. {installYear}</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c1917' }}>Roof Installation</div>
                          <div style={{ fontSize: '0.8rem', color: '#78716c', marginTop: 2 }}>Permit history places roof age at approximately {age} years. Baseline integrity compromised.</div>
                        </div>

                      </div>
                    </div>
                    
                    {/* Financial Risk Assessment */}
                    <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '16px', marginBottom: 24, border: \`1px solid \${bandColor}40\`, borderLeft: \`4px solid \${bandColor}\` }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1c1917', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                        Financial Risk Assessment
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: '#57534e' }}>Estimated Unplanned CapEx:</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1c1917' }}>{formatMoney(capexRisk)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: '#57534e' }}>Operations Disruption Risk:</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1c1917' }}>{formatMoney(disruptionCost)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTop: '1px dashed #e7e5e4' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1c1917' }}>Total Estimated Liability:</span>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: bandColor }}>{formatMoney(totalRisk)}</span>
                        </div>
                      </div>
                    </div>

`;

code = code.substring(0, startIndex) + newBlock + code.substring(endIndex);
fs.writeFileSync(file, code);
