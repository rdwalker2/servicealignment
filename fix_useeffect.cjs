const fs = require('fs');
const file = 'src/pages/discovery/ProspectRoom.tsx';
let code = fs.readFileSync(file, 'utf8');

const correctCode = `  useEffect(() => {
    if (token) {
      const decoded = decodeRoomToken(token);
      if (decoded) {
        setConfig(decoded);
        setLoadingState('ready');
        
        if (decoded.sessionId) {
          const liveSession = getSession(decoded.sessionId);
          if (liveSession) {
            setLocalSession(liveSession);
            if ((liveSession as any).room_visibility) {
              setVisibility((liveSession as any).room_visibility);
            }
          }
        }

        import('../../lib/predictiveEngineDb').then(({ getPredictiveDataByCompany }) => {
          getPredictiveDataByCompany(decoded.company).then(data => {
            if (data) setPredictiveData(data);
          });
        });
      } else {
        import('../../lib/predictiveEngineDb').then(({ getPredictiveDataByToken }) => {
          getPredictiveDataByToken(token).then(data => {
            if (data && data.properties.length > 0) {
              const companyName = data.properties[0].property?.property_name?.split('-')[0]?.trim() || 'Your Company';
              const fauxConfig = {
                company: companyName,
                accent: '#ef4444'
              };
              setConfig(fauxConfig);
              setPredictiveData(data);
              setLoadingState('ready');

              const score = data.properties[0].healthScore?.health_score ?? 68;
              const signals = data.properties[0].signals || [];
              setLocalSession(prev => ({
                ...prev,
                roof_health_score: score,
                roof_signals: signals,
                roi_total: 250000
              } as any));
            } else {
              setLoadingState('error');
            }
          }).catch(() => {
            setLoadingState('error');
          });
        });
      }
    } else {
      setLoadingState('error');
    }
  }, [token]);`;

const startStr = '  useEffect(() => {\n    if (token) {\n      const decoded';
const endStr = '  }, [token]);';
const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr, startIndex) + endStr.length;

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end index");
  process.exit(1);
}

code = code.substring(0, startIndex) + correctCode + code.substring(endIndex);
fs.writeFileSync(file, code);
