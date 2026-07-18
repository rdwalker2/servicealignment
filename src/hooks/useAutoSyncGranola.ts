import { useEffect, useRef } from 'react';
import { useToast } from '../components/ui/Toast';
import { fetchRecentNotes, fetchNoteDetails, extractMEDDPICCFromSummary } from '../lib/granolaClient';
import { parseGranolaSummary } from '../lib/granolaParser';
import { addGranolaNoteToSession, updateSessionFromGranola, type DiscoverySession } from '../lib/discoveryDatabase';
import { extractFieldsFromTranscript, hasOpenAIKey, isAutoExtractEnabled, type ExtractionResult } from '../lib/granolaLLMExtractor';

export function useAutoSyncGranola(
  session: DiscoverySession | null, 
  onSyncSuccess?: () => void,
  onExtractionReady?: (result: ExtractionResult, noteTitle: string) => void,
) {
  const { toast } = useToast();
  // We use a ref to store the last synced session ID to avoid double fetching in React strict mode
  const lastSyncedId = useRef<string | null>(null);

  useEffect(() => {
    if (!session || lastSyncedId.current === session.id) return;

    let isMounted = true;

    async function sync() {
      try {
        const apiKey = localStorage.getItem('granola_api_key');
        if (!apiKey) return; // Silent return if no key

        const recentNotes = await fetchRecentNotes(5);
        if (!isMounted) return;

        const companyNameLower = session!.company_name.toLowerCase();
        let syncedAnything = false;

        for (const note of recentNotes) {
          // Check if already synced
          if (session?.granola_notes?.some(n => n.id === note.id)) {
            continue;
          }

          // Match logic
          const matchByTitle = note.title.toLowerCase().includes(companyNameLower);
          
          let matchByDomain = false;
          if (note.attendees) {
            for (const attendee of note.attendees) {
              if (attendee.email && attendee.email.toLowerCase().includes(companyNameLower.replace(/\s+/g, ''))) {
                matchByDomain = true;
                break;
              }
            }
          }

          if (matchByTitle || matchByDomain) {
            // Import it!
            const details = await fetchNoteDetails(note.id);
            if (!isMounted) return;

            const newNote = {
              id: details.id,
              url: details.url || `https://granola.ai/notes/${details.id}`,
              title: details.title,
              date: details.start_time || details.created_at,
              summary: details.summary || details.notes || '',
              transcript: details.transcript || '',
              attendees: (details.attendees || []).map(a => a.name || a.email)
            };

            addGranolaNoteToSession(session!.id, newNote);

            // Layer 1: Regex parser (always runs as baseline — BAP, MEDDPICC text, MAP, call sheet)
            const combinedText = `${details.summary || details.notes || ''}\n${details.transcript || ''}`;
            const regexUpdates = parseGranolaSummary(combinedText);
            
            if (Object.keys(regexUpdates).length > 0) {
              updateSessionFromGranola(session!.id, regexUpdates);
            }

            // Layer 1.5: MEDDPICC + Who/What/When extraction from summary markdown
            // This populates next_steps_who, next_steps_what, next_steps_when, and most_recent_update
            const summaryMarkdown = details.summary_markdown || details.summary || details.notes || '';
            if (summaryMarkdown) {
              const meddpiccExtraction = extractMEDDPICCFromSummary(summaryMarkdown, details.attendees);
              const meddpiccUpdates: Partial<DiscoverySession> = {};

              // Map MEDDPICC text fields
              if (meddpiccExtraction.metrics) meddpiccUpdates.success_metrics_text = meddpiccExtraction.metrics;
              if (meddpiccExtraction.economic_buyer) meddpiccUpdates.economic_buyer_access = meddpiccExtraction.economic_buyer;
              if (meddpiccExtraction.decision_criteria) meddpiccUpdates.decision_criteria = meddpiccExtraction.decision_criteria;
              if (meddpiccExtraction.decision_process) meddpiccUpdates.decision_process = meddpiccExtraction.decision_process;
              if (meddpiccExtraction.paper_process) meddpiccUpdates.paper_process = meddpiccExtraction.paper_process;
              if (meddpiccExtraction.identify_pain) meddpiccUpdates.pain_narrative = meddpiccExtraction.identify_pain;
              if (meddpiccExtraction.champion) meddpiccUpdates.champion_name = meddpiccExtraction.champion;
              if (meddpiccExtraction.competition) meddpiccUpdates.competitive_situation = meddpiccExtraction.competition;
              if (meddpiccExtraction.compelling_event) (meddpiccUpdates as any).compelling_event = meddpiccExtraction.compelling_event;

              // Map Who/What/When next steps
              if ((meddpiccExtraction as any).next_steps_who) meddpiccUpdates.next_steps_who = (meddpiccExtraction as any).next_steps_who;
              if ((meddpiccExtraction as any).next_steps_what) meddpiccUpdates.next_steps_what = (meddpiccExtraction as any).next_steps_what;
              if ((meddpiccExtraction as any).next_steps_when) meddpiccUpdates.next_steps_when = (meddpiccExtraction as any).next_steps_when;
              if (meddpiccExtraction.next_steps) meddpiccUpdates.next_action = meddpiccExtraction.next_steps;

              // Map most recent update
              if (meddpiccExtraction.most_recent_update) {
                meddpiccUpdates.most_recent_update = meddpiccExtraction.most_recent_update;
                (meddpiccUpdates as any).most_recent_update_source = 'granola';
                (meddpiccUpdates as any).most_recent_update_at = new Date().toISOString();
              }

              // Also auto-set last_call_date from the note
              (meddpiccUpdates as any).last_call_date = details.start_time || details.created_at || new Date().toISOString();

              if (Object.keys(meddpiccUpdates).length > 0) {
                updateSessionFromGranola(session!.id, meddpiccUpdates);
              }
            }

            // Layer 2: LLM extraction (if configured and enabled)
            if (hasOpenAIKey() && isAutoExtractEnabled()) {
              try {
                const extraction = await extractFieldsFromTranscript(
                  details.summary || details.notes || '',
                  details.transcript || '',
                  session!,
                );

                if (extraction.fields.length > 0 && isMounted) {
                  // Don't auto-merge — surface to user for review
                  if (onExtractionReady) {
                    onExtractionReady(extraction, note.title);
                  }
                  toast(`📝 AI extracted ${extraction.fields.length} fields from "${note.title}". Review to merge.`, 'info');
                }
              } catch (llmErr) {
                console.warn('LLM extraction failed (falling back to regex):', llmErr);
                // Regex results already applied above — this is graceful degradation
              }
            }

            syncedAnything = true;
            toast(`Auto-imported Granola note: ${note.title}`, 'success');
          }
        }

        if (syncedAnything && onSyncSuccess) {
          onSyncSuccess();
        }

      } catch (err) {
        console.error('Auto-sync Granola failed:', err);
      } finally {
        if (isMounted && session) {
          lastSyncedId.current = session.id;
        }
      }
    }

    sync();

    return () => {
      isMounted = false;
    };
  }, [session?.id, session?.company_name, onSyncSuccess, onExtractionReady, toast]);
}
