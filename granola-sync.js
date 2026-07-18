// ============================================================
// granola-sync.js — Server-side Granola auto-sync
// Polls Granola API for new meeting notes, matches them to
// discovery sessions, runs LLM extraction, and queues results
// for auto-apply or AE review.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const GRANOLA_API_BASE = 'https://public-api.granola.ai/v1';
const GRANOLA_API_KEY = process.env.GRANOLA_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Internal Teamtailor email domain — used to filter out internal attendees
const INTERNAL_DOMAIN = 'teamtailor.com';

// Common free email providers that should NEVER be used for domain matching
const FREE_EMAIL_PROVIDERS = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'live.com']);

// ── Granola API ──

async function fetchRecentNotes(limit = 30) {
  if (!GRANOLA_API_KEY) {
    console.warn('[Granola Sync] No GRANOLA_API_KEY configured, skipping');
    return [];
  }

  const resp = await fetch(`${GRANOLA_API_BASE}/notes?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${GRANOLA_API_KEY}`,
      'Accept': 'application/json',
    },
  });

  if (!resp.ok) {
    throw new Error(`Granola API error: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json();
  return data.notes || data.items || data || [];
}

async function fetchNoteDetails(noteId) {
  const resp = await fetch(`${GRANOLA_API_BASE}/notes/${noteId}`, {
    headers: {
      'Authorization': `Bearer ${GRANOLA_API_KEY}`,
      'Accept': 'application/json',
    },
  });

  if (!resp.ok) {
    throw new Error(`Granola note details error: ${resp.status}`);
  }

  return resp.json();
}

// ── Session Matching ──

async function loadActiveSessions() {
  // 1. Try to load identity mapping (rep_roster)
  let roster = [];
  const { data: rosterData, error: rosterErr } = await supabase
    .from('rep_roster')
    .select('rep_id, email, granola_email');
    
  if (!rosterErr && rosterData) {
    roster = rosterData;
  } else {
    console.warn('[Granola Sync] rep_roster table not found or empty, skipping identity mapping layer');
  }

  // 2. Try discovery_sessions table
  const { data: sessions, error } = await supabase
    .from('discovery_sessions')
    .select('id, rep_id, company_name, company_domain, status, persona, current_ats, industry, company_size, selected_pains, data')
    .not('status', 'in', '("closed_won","closed_lost")');

  if (error) {
    console.warn('[Granola Sync] discovery_sessions table not found, checking accounts...');
    return { sessions: [], roster };
  }

  return { sessions: sessions || [], roster };
}

function matchNoteToSession(note, sessions, roster) {
  const attendees = note.attendees || [];
  const calInvitees = note.calendar_event?.invitees || [];
  
  // ── 1. Identify Note Owner ──
  const ownerEmail = note.owner?.email?.toLowerCase();
  let ownerRepId = null;
  
  if (ownerEmail && roster.length > 0) {
    // Check granola_email first, fallback to standard email
    const rep = roster.find(r => 
      (r.granola_email && r.granola_email.toLowerCase() === ownerEmail) || 
      (r.email && r.email.toLowerCase() === ownerEmail)
    );
    if (rep) {
      ownerRepId = rep.rep_id;
    }
  }

  // ── 2. Scope Search Space ──
  // If we found the owner's rep_id, ONLY search their sessions.
  // Otherwise, fallback to all sessions (Manager/SDR fallback)
  const scopedSessions = ownerRepId 
    ? sessions.filter(s => s.rep_id === ownerRepId) 
    : sessions;
    
  if (scopedSessions.length === 0) {
    return null; // Owner has no open sessions
  }

  const externalEmails = [
    ...attendees.map(a => a.email?.toLowerCase() || ''),
    ...calInvitees.map(i => i.email?.toLowerCase() || ''),
  ].filter(e => e && !e.includes(INTERNAL_DOMAIN));

  // Filter out free email providers from domain matching to prevent poison-pill cross-pollination
  const externalDomains = new Set(
    externalEmails
      .map(e => e.split('@')[1])
      .filter(Boolean)
      .filter(domain => !FREE_EMAIL_PROVIDERS.has(domain))
  );

  const noteTitle = (note.title || '').toLowerCase();

  // ── 4. Execute Matching Tiers ──
  // Tier 1: Exact domain match from attendee emails
  const tier1Matches = [];
  for (const session of scopedSessions) {
    const domain = (session.company_domain || '').toLowerCase();

    if (domain && externalDomains.has(domain)) {
      tier1Matches.push({ session, tier: 1, confidence: 'high' });
      continue;
    }

    // Check domain without TLD
    const domainBase = domain.split('.')[0];
    if (domainBase && domainBase.length > 2) {
      for (const extDomain of externalDomains) {
        if (extDomain.startsWith(domainBase + '.')) {
          tier1Matches.push({ session, tier: 1, confidence: 'high' });
          break;
        }
      }
    }
  }

  // Break ties for multiple domain matches
  if (tier1Matches.length === 1) {
    return tier1Matches[0];
  } else if (tier1Matches.length > 1) {
    // Tie-breaker: See if the note title contains the specific company name
    const titleMatch = tier1Matches.find(m => 
      noteTitle.includes((m.session.company_name || '').toLowerCase())
    );
    return titleMatch || tier1Matches[0]; // Fallback to first if no title match
  }

  for (const session of scopedSessions) {
    const companyName = (session.company_name || '').toLowerCase();

    // Tier 2: Note title contains company name
    if (companyName.length > 2 && noteTitle.includes(companyName)) {
      return { session, tier: 2, confidence: 'high' };
    }
  }

  for (const session of scopedSessions) {
    const companyName = (session.company_name || '').toLowerCase();
    const words = companyName.split(/\s+/).filter(w => w.length > 2);

    // Tier 3: Fuzzy — 60%+ of company name words appear in title
    if (words.length > 0) {
      const matches = words.filter(w => noteTitle.includes(w));
      if (matches.length >= Math.ceil(words.length * 0.6)) {
        return { session, tier: 3, confidence: 'medium' };
      }
    }
  }

  // Manager/SDR Fallback: If we scoped to a single rep and found nothing, 
  // try company-wide search as a last resort.
  if (ownerRepId) {
    const otherSessions = sessions.filter(s => s.rep_id !== ownerRepId);
    if (otherSessions.length > 0) {
      // Recursive call without the roster to force global fallback
      const fallbackMatch = matchNoteToSession(note, otherSessions, []);
      if (fallbackMatch) {
        // Tag it as a co-pilot / fallback match and FORCE low confidence to require AE review
        return { ...fallbackMatch, confidence: 'low' };
      }
    }
  }

  return null;
}

// ── LLM Extraction ──

/**
 * Run GPT-4o-mini extraction on transcript + summary.
 * Same prompt structure as granolaLLMExtractor.ts but server-side.
 */
async function runLLMExtraction(noteDetails, session) {
  if (!OPENAI_API_KEY) {
    console.warn('[Granola Sync] No OPENAI_API_KEY — skipping LLM extraction, using regex only');
    return regexExtraction(noteDetails);
  }

  const systemPrompt = buildSystemPrompt(session);
  const userPrompt = buildUserPrompt(noteDetails);

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(`OpenAI error: ${resp.status} — ${errData.error?.message || resp.statusText}`);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty OpenAI response');

    return JSON.parse(content);
  } catch (err) {
    console.error('[Granola Sync] LLM extraction failed:', err.message);
    return regexExtraction(noteDetails);
  }
}

function buildSystemPrompt(session) {
  const existingData = session.data || {};
  const existingMeddpicc = existingData.meddpicc || {};
  const existingBap = existingData.bap_answers || {};

  // Format existing MEDDPICC for the prompt
  const meddpiccContext = Object.entries(existingMeddpicc)
    .filter(([_, data]) => data?.value)
    .map(([key, data]) => `- ${key}: ${data.value}`)
    .join('\n');

  // Format existing BAP for the prompt
  const bapContext = Object.entries(existingBap)
    .filter(([_, data]) => data?.value)
    .map(([key, data]) => `- ${key}: ${data.value}`)
    .join('\n');

  return `You are an expert sales intelligence analyst. Extract structured data from meeting transcripts for a B2B SaaS sales team selling Teamtailor (an ATS / employer brand platform).

## Context
- Company: ${session.company_name || 'Unknown'}
- Current ATS: ${session.current_ats || 'Unknown'}
- Industry: ${session.industry || 'Unknown'}
- Company Size: ${session.company_size || 'Unknown'}
- Target Pains to Prove: ${session.selected_pains?.join(', ') || 'Unknown'}

## Existing Deal Knowledge (CRITICAL)
Below is what we ALREADY know about this deal. You must act as an ADDITIVE Refiner. 
DO NOT overwrite these existing details with generic or brief mentions from the current call. Only output these fields if the current call contains NEW, ADDITIVE information, or EXPLICIT CORRECTIONS to the existing knowledge. If there is new additive info, synthesize it cleanly with the existing knowledge.

Existing MEDDPICC:
${meddpiccContext || 'None'}

Existing BAP Scores:
${bapContext || 'None'}

## Extract These Fields
1. MEDDPICC: pain_narrative, success_metrics_text, decision_criteria, decision_process, paper_process, champion_name, competitive_situation, economic_buyer_access
2. Next Steps: next_steps_who, next_steps_what, next_steps_when
3. Deal Intel: contract_end_date, competitors_identified, implementation_timeline, next_meeting_date
4. BAP Scores: q1-q12 (yes/maybe/no) with evidence
5. Key verbatim prospect quotes (3-5 most impactful)
6. Meeting summary (2-3 sentences)

## Rules
1. Only extract EXPLICITLY stated info. Never fabricate.
2. Include verbatim evidence quotes.
3. For BAP: "yes" = confirmed, "maybe" = partial, "no" = denied, null = not discussed.
4. SYNTHESIZE ADDITIONS: If the transcript adds detail to an existing MEDDPICC field, combine the new detail with the existing detail in your output.

Return ONLY valid JSON:
{
  "meddpicc": { "<field>": { "value": "<text>", "confidence": "high|medium|low", "evidence": "<quote>" } },
  "deal_intel": { "<field>": { "value": "<text>", "confidence": "high|medium|low", "evidence": "<quote>" } },
  "bap_answers": { "<q1-q12>": { "value": "yes|maybe|no|null", "confidence": "high|medium|low", "evidence": "<quote>" } },
  "next_steps": { "who": "<name>", "what": "<action>", "when": "<date>" },
  "key_quotes": ["<quote1>", "<quote2>"],
  "summary": "<2-3 sentences>"
}`;
}

function buildUserPrompt(noteDetails) {
  const summary = noteDetails.summary_markdown || noteDetails.summary_text || noteDetails.summary || '';
  const transcript = noteDetails.transcript || '';
  
  // Truncate for context window
  const maxChars = 60000;
  const truncated = transcript.length > maxChars
    ? transcript.substring(0, maxChars) + '\n\n[Truncated]'
    : transcript;

  return `## Meeting Summary\n${summary || '(No summary)'}\n\n## Transcript\n${truncated || '(No transcript)'}`;
}

/**
 * Regex-based extraction fallback (no LLM needed).
 * Extracts MEDDPICC sections and next steps from markdown.
 */
function regexExtraction(noteDetails) {
  const markdown = noteDetails.summary_markdown || noteDetails.summary_text || '';
  const result = { meddpicc: {}, next_steps: {}, key_quotes: [], summary: '' };

  // Extract sections by header
  const extractSection = (headers) => {
    for (const h of headers) {
      const patterns = [
        new RegExp(`###?\\s*${h}[\\s:]*\\n([\\s\\S]*?)(?=\\n###?\\s|\\n\\*\\*[A-Z]|$)`, 'i'),
        new RegExp(`\\*\\*${h}[\\s:]*\\*\\*[\\s:]*\\n([\\s\\S]*?)(?=\\n\\*\\*[A-Z]|\\n###?\\s|$)`, 'i'),
      ];
      for (const pat of patterns) {
        const match = markdown.match(pat);
        if (match?.[1]?.trim()) return match[1].trim();
      }
    }
    return '';
  };

  const pain = extractSection(['Pain', 'Identify Pain', 'Pain Points', 'Challenges']);
  if (pain) result.meddpicc.pain_narrative = { value: pain, confidence: 'medium' };

  const champion = extractSection(['Champion', 'Internal Champion']);
  if (champion) result.meddpicc.champion_name = { value: champion, confidence: 'medium' };

  const competition = extractSection(['Competition', 'Competitors', 'Competitive']);
  if (competition) result.meddpicc.competitive_situation = { value: competition, confidence: 'medium' };

  const nextSteps = extractSection(['Next Steps', 'Action Items', 'Follow-up']);
  if (nextSteps) {
    result.next_steps = { who: '', what: nextSteps, when: '' };
  }

  // Build summary from first paragraph
  const lines = markdown.split('\n').filter(l => l.trim());
  const firstContent = lines.find(l => !l.startsWith('#') && !l.startsWith('*') && l.trim().length > 10);
  if (firstContent) result.summary = firstContent.trim();

  return result;
}

// ── Auto-Apply Rules ──

/**
 * Classify extracted fields into auto-apply vs. needs-review.
 * Returns { autoApply: ExtractedField[], needsReview: ExtractedField[] }
 */
function classifyFields(extraction, session) {
  const autoApply = [];
  const needsReview = [];

  // Always auto-apply these
  const alwaysAutoApply = ['most_recent_update', 'last_call_date'];
  
  // MEDDPICC fields
  if (extraction.meddpicc) {
    const meddpiccLabels = {
      pain_narrative: 'Pain (in their words)',
      success_metrics_text: 'Metrics',
      decision_criteria: 'Decision Criteria',
      decision_process: 'Decision Process',
      paper_process: 'Paper Process',
      champion_name: 'Champion',
      competitive_situation: 'Competition',
      economic_buyer_access: 'Economic Buyer',
    };

    for (const [field, data] of Object.entries(extraction.meddpicc)) {
      if (!data?.value) continue;
      const existing = session[field];
      const entry = {
        key: `meddpicc.${field}`,
        label: meddpiccLabels[field] || field,
        section: 'meddpicc',
        value: data.value,
        confidence: data.confidence || 'medium',
        evidence: data.evidence,
        existingValue: existing || null,
        hasConflict: !!existing && existing.trim() !== '',
      };

      // Auto-apply if high confidence AND field is empty
      if (entry.confidence === 'high' && !entry.hasConflict) {
        autoApply.push(entry);
      } else {
        needsReview.push(entry);
      }
    }
  }

  // Next Steps — auto-apply if high confidence
  if (extraction.next_steps) {
    const ns = extraction.next_steps;
    if (ns.who || ns.what || ns.when) {
      const entry = {
        key: 'meta.next_steps',
        label: 'Next Steps',
        section: 'meta',
        value: ns,
        confidence: 'high',
        evidence: `Who: ${ns.who || '—'} | What: ${ns.what || '—'} | When: ${ns.when || '—'}`,
        existingValue: null,
        hasConflict: false,
      };
      autoApply.push(entry);
    }
  }

  // BAP Answers
  if (extraction.bap_answers) {
    const bapLabels = {
      q1: 'Core Problem Identified', q2: 'Stakeholders Mapped',
      q3: 'Cost of Indecision', q4: 'Priority Level',
      q5: 'Prior Solution Attempts', q6: 'Root Cause Understood',
      q7: 'Need for External Help', q8: 'Budget Discussed',
      q9: 'Proof Provided', q10: 'Solution Map Clear',
      q11: 'Success Metrics', q12: 'Confidence Level',
    };

    for (const [qId, data] of Object.entries(extraction.bap_answers)) {
      if (!data?.value || data.value === 'null') continue;
      const entry = {
        key: `bap.${qId}`,
        label: bapLabels[qId] || qId,
        section: 'bap',
        value: data.value,
        confidence: data.confidence || 'medium',
        evidence: data.evidence,
        existingValue: null,
        hasConflict: false,
      };

      if (entry.confidence === 'high') {
        autoApply.push(entry);
      } else {
        needsReview.push(entry);
      }
    }
  }

  // Deal Intel — always needs review (high-stakes data)
  if (extraction.deal_intel) {
    const dealLabels = {
      contract_end_date: 'Contract End Date',
      competitors_identified: 'Competitors',
      implementation_timeline: 'Timeline',
      next_meeting_date: 'Next Meeting',
    };

    for (const [field, data] of Object.entries(extraction.deal_intel)) {
      if (!data?.value) continue;
      needsReview.push({
        key: `deal.${field}`,
        label: dealLabels[field] || field,
        section: 'deal_intel',
        value: data.value,
        confidence: data.confidence || 'medium',
        evidence: data.evidence,
        existingValue: null,
        hasConflict: false,
      });
    }
  }

  // Summary — auto-apply as most_recent_update
  if (extraction.summary) {
    autoApply.push({
      key: 'meta.most_recent_update',
      label: 'Most Recent Update',
      section: 'meta',
      value: extraction.summary,
      confidence: 'high',
      existingValue: null,
      hasConflict: false,
    });
  }

  // Attendees — auto-apply to deal room
  if (extraction.attendees && extraction.attendees.length > 0) {
    autoApply.push({
      key: 'meta.meeting_attendees',
      label: 'Meeting Attendees',
      section: 'meta',
      value: extraction.attendees,
      confidence: 'high',
      existingValue: null,
      hasConflict: false,
    });
  }

  return { autoApply, needsReview };
}

// ── Main Sync Loop ──

/**
 * Run a single sync cycle:
 * 1. Fetch recent Granola notes
 * 2. Check which ones are already processed
 * 3. Match unprocessed notes to sessions
 * 4. Run LLM extraction
 * 5. Classify fields → auto-apply vs. review queue
 * 6. Write to granola_sync_queue
 */
export async function runGranolaSync() {
  if (!GRANOLA_API_KEY) {
    console.warn('[Granola Sync] No API key configured, skipping');
    return { processed: 0, matched: 0, skipped: 0 };
  }

  const startTime = Date.now();
  console.log('[Granola Sync] Starting sync cycle...');

  try {
    // 1. Fetch recent notes
    const notes = await fetchRecentNotes(30);
    if (notes.length === 0) {
      console.log('[Granola Sync] No notes found');
      return { processed: 0, matched: 0, skipped: 0 };
    }

    // 2. Check which notes are already in the queue
    const noteIds = notes.map(n => n.id);
    const { data: existing } = await supabase
      .from('granola_sync_queue')
      .select('granola_note_id')
      .in('granola_note_id', noteIds);

    const processedIds = new Set((existing || []).map(e => e.granola_note_id));
    const newNotes = notes.filter(n => !processedIds.has(n.id));

    if (newNotes.length === 0) {
      console.log(`[Granola Sync] All ${notes.length} notes already processed`);
      return { processed: notes.length, matched: 0, skipped: notes.length };
    }

    console.log(`[Granola Sync] Found ${newNotes.length} new notes to process`);

    // 3. Load active sessions and identity roster
    const { sessions, roster } = await loadActiveSessions();
    if (sessions.length === 0) {
      console.log('[Granola Sync] No active sessions found in Supabase');
      return { processed: 0, matched: 0, skipped: newNotes.length };
    }

    let matched = 0;
    let skipped = 0;

    // 4. Process each new note
    for (const note of newNotes) {
      try {
        const match = matchNoteToSession(note, sessions, roster);
        if (!match) {
          skipped++;
          console.log(`[Granola Sync] No match for: "${note.title}"`);
          continue;
        }

        const { session, tier, confidence } = match;
        console.log(`[Granola Sync] Matched "${note.title}" → ${session.company_name} (tier ${tier})`);

        // 5. Fetch full note details
        const details = await fetchNoteDetails(note.id);

        // 6. Run LLM extraction
        const extraction = await runLLMExtraction(details, session);
        
        // 6.5 Inject attendees from Granola API
        if (details.attendees) {
          // Filter out internal employees
          extraction.attendees = details.attendees
            .filter(a => !a.email?.includes(INTERNAL_DOMAIN))
            .map(a => ({ name: a.name, email: a.email }));
        }

        // 7. Classify into auto-apply vs. review
        const { autoApply, needsReview } = classifyFields(extraction, session);

        // 8. Write to sync queue
        const { error: insertErr } = await supabase
          .from('granola_sync_queue')
          .upsert({
            granola_note_id: note.id,
            granola_note_title: note.title,
            granola_note_date: note.start_time || note.created_at,
            session_id: session.id,
            company_name: session.company_name,
            match_tier: tier,
            match_confidence: confidence,
            extracted_fields: extraction,
            auto_applied_fields: autoApply,
            pending_review_fields: needsReview,
            status: needsReview.length > 0 ? 'pending' : 'auto_applied',
          }, { onConflict: 'granola_note_id,session_id' });

        if (insertErr) {
          console.error(`[Granola Sync] Queue insert error for ${note.id}:`, insertErr.message);
        } else {
          matched++;
          console.log(`[Granola Sync] Queued: ${autoApply.length} auto-apply, ${needsReview.length} review`);
        }

        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));

      } catch (noteErr) {
        console.error(`[Granola Sync] Error processing note "${note.title}":`, noteErr.message);
        skipped++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Granola Sync] ✅ Done in ${duration}ms: ${matched} matched, ${skipped} skipped`);

    return { processed: newNotes.length, matched, skipped, duration_ms: duration };

  } catch (err) {
    console.error('[Granola Sync] Fatal error:', err.message);
    return { processed: 0, matched: 0, skipped: 0, error: err.message };
  }
}
