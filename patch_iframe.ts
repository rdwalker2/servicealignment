import fs from 'fs';

const p = '/Users/ryan.walker/Desktop/teamtailor/tt-sales-command/src/components/discovery/CMSWorkspace.tsx';
let src = fs.readFileSync(p, 'utf8');

src = src.replace(
  "import { type RoomVisibility, isStageAtOrPast, SECTION_UNLOCK_STAGE, STAGE_SHORT_LABELS } from './RoomSections';",
  "import { RoomSections, type RoomVisibility, isStageAtOrPast, SECTION_UNLOCK_STAGE, STAGE_SHORT_LABELS } from './RoomSections';\nimport { computeDiagnosisOverrides, computeHeroMessage } from '../../lib/discoveryDatabase';"
);

const iframeRegex = /\{\/\* Preview iframe \*\/\}\s*<div className="flex-1 min-h-0 p-6 flex items-start justify-center overflow-auto">\s*<div className="w-full max-w-\[680px\] rounded-2xl shadow-2xl overflow-hidden border border-stone-200\/60 bg-white" style=\{\{ minHeight: '80vh' \}\}>\s*<iframe[\s\S]*?\/>\s*<\/div>\s*<\/div>/;

const newRender = `{/* Preview iframe replaced with local render */}
            <div className="flex-1 min-h-0 bg-[#f3f4f6] p-8 flex items-start justify-center overflow-auto">
              <div 
                className="w-full max-w-[850px] rounded-[2rem] shadow-2xl overflow-hidden bg-white ring-1 ring-black/5" 
                style={{ minHeight: '80vh' }}
              >
                <div className="h-[40rem] overflow-y-auto custom-scrollbar relative">
                  <div className="absolute inset-0 pointer-events-none" />
                  <RoomSections
                    companyName={companyName || 'New Company'}
                    themeColor={themeColor || '#1c1917'}
                    selectedPains={selectedPains || []}
                    selectedPersona={selectedPersona}
                    selectedATS={selectedATS}
                    session={session}
                    visibility={visibility}
                    isRepPreview={true}
                    customMessage={computeHeroMessage(session)}
                    repName={cmsPreparedBy}
                    showPricing={true}
                    enabledProofCustomers={session.enabled_proof_customers}
                    enabledPlaybookIds={session.enabled_playbook_ids}
                    currentApproach={(session.call_sheet_answers || {})['q5'] as string}
                    rootCause={(session.call_sheet_answers || {})['q6'] as string}
                    problemStatement={(session.call_sheet_answers || {})['q1'] as string}
                    businessImpact={(session.call_sheet_answers || {})['q4a'] as string}
                    urgencyReason={(session.call_sheet_answers || {})['q4b'] as string}
                    priorityRating={(session.call_sheet_answers || {})['q1b'] as string}
                    onMAPChange={() => {}}
                    onContractReadinessChange={() => {}}
                    {...computeDiagnosisOverrides(session)}
                  />
                </div>
              </div>
            </div>`;

src = src.replace(iframeRegex, newRender);
fs.writeFileSync(p, src);
console.log("Patched iframe");
