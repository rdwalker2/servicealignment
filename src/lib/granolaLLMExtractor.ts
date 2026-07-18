// ============================================================
// granolaLLMExtractor.ts — AI-powered transcript → BAP extraction
// Takes a Granola transcript + session context and returns
// structured session field updates using OpenAI structured output.
// ============================================================

import type { DiscoverySession, BAPAnswer } from './discoveryDatabase';
import { SHEETS, type DiscoveryQuestion } from '../data/personaSheets';
import { TT_PAINS } from '../data/painData';

// ── Storage ──

const OPENAI_KEY_STORAGE = 'openai_api_key';
const LLM_AUTO_EXTRACT_STORAGE = 'granola_llm_auto_extract';

export function getOpenAIKey(): string | null {
  return import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem(OPENAI_KEY_STORAGE);
}
export function setOpenAIKey(key: string): void {
  localStorage.setItem(OPENAI_KEY_STORAGE, key);
}
export function hasOpenAIKey(): boolean {
  return !!getOpenAIKey();
}
export function isAutoExtractEnabled(): boolean {
  return localStorage.getItem(LLM_AUTO_EXTRACT_STORAGE) === 'true';
}
export function setAutoExtractEnabled(enabled: boolean): void {
  localStorage.setItem(LLM_AUTO_EXTRACT_STORAGE, String(enabled));
}

// ── Types ──

export interface ExtractedField {
  key: string;
  label: string;
  section: 'call_sheet' | 'bap' | 'meddpicc' | 'deal_intel' | 'meta';
  value: any;
  confidence: 'high' | 'medium' | 'low';
  evidence?: string;       // Verbatim quote that supports this extraction
  existingValue?: any;     // Current value in session (for conflict detection)
  hasConflict?: boolean;   // True if existing value differs
}

export interface ExtractionResult {
  fields: ExtractedField[];
  key_quotes: string[];
  next_steps: string;
  summary: string;
  pain_quotes: Record<string, string>;
  room_content: Record<string, string>;
  raw_response?: any;
}

// ── Build the extraction prompt ──

function buildQuestionContext(session: DiscoverySession): string {
  // Find the active persona sheet
  const personaId = session.call_sheet_persona || session.persona || 'hr-director';
  const sheet = SHEETS.find(s => s.id === personaId) || SHEETS[0];

  // Build question reference for the LLM
  const questionLines = sheet.questions.map(q => {
    const optionStr = q.options ? ` Options: [${q.options.join(', ')}]` : '';
    const typeStr = q.type === 'number' ? ' (numeric answer expected)' : '';
    return `- ${q.id}: "${q.question}"${typeStr}${optionStr}`;
  }).join('\n');

  return questionLines;
}

function buildPainContext(session: DiscoverySession): string {
  // Build pain reference for the LLM — include selected pains + all available pains
  const selected = session.selected_pains || [];
  const painLines = TT_PAINS.map(p => {
    const isSelected = selected.includes(p.id);
    return `- ${p.id}: "${p.title}" — ${p.description}${isSelected ? ' [SELECTED]' : ''}`;
  }).join('\n');
  return painLines;
}

function buildSystemPrompt(session: DiscoverySession): string {
  const questionContext = buildQuestionContext(session);
  const painContext = buildPainContext(session);

  return `You are an expert sales intelligence analyst trained on the Buyer's Action Plan (BAP) methodology from Sales Autonomy. You extract structured data from meeting transcripts for a B2B SaaS sales team selling Service Alignment (an Provider / employer brand platform).

## BAP Methodology Context
The Buyer's Action Plan has 3 checkpoints:
- CP1 "Do They Need to Act?" — Identify core problem, stakeholders, cost of indecision, priority level
- CP2 "Do They Need Outside Help?" — Current approach failures, root cause, need for external expertise, readiness
- CP3 "Best Solution & Path Forward" — Proven results, solution clarity, success metrics, trial close

## Your Task
Analyze the meeting transcript and extract:
1. Call sheet question answers
2. BAP checkpoint scores with evidence
3. MEDDPICC fields
4. Deal intelligence
5. **Pain-specific prospect quotes** — Map the prospect's exact words to specific pain categories
6. **Room content** — Write prospect-facing narrative content for the discovery room

## Context
- Company: ${session.company_name}
- Current Provider: ${session.current_ats || 'Unknown'}
- Industry: ${session.industry || 'Unknown'}
- Company Size: ${session.company_size || 'Unknown'}
- Selected Persona: ${session.persona || 'Unknown'}

## Call Sheet Questions to Extract
${questionContext}

## BAP Questions to Score (Yes / Maybe / No)
- q1: Did they identify a core problem? (CP1)
- q2: Are stakeholders mapped? (CP1)
- q3: Is the cost of indecision quantified? (CP1)
- q4: Is this a high enough priority? (CP1)
- q5: Have they tried to solve this before? (CP2)
- q6: Do they understand why current efforts failed? (CP2)
- q7: Have they acknowledged they need outside expertise? (CP2)
- q8: Is budget/timeline/resources discussed? (CP2)
- q9: Have we proven we can solve their specific problem? (CP3)
- q10: Is it clear how our product fixes their problem? (CP3)
- q11: How will they measure success? (CP3)
- q12: How confident are they this is the right fit (1-10)? (CP3)

## Pain Categories (map quotes to these IDs)
${painContext}

## MEDDPICC Fields
- pain_narrative: Their pain in their own words (verbatim)
- success_metrics_text: How they'll measure success
- decision_criteria: What they're evaluating against
- decision_process: Steps to signed contract
- paper_process: Procurement/legal/infosec steps
- champion_name: Internal champion name + title
- champion_validation_notes: Evidence they can sell internally
- competitive_situation: Who else is in the evaluation
- economic_buyer_access: Who controls budget + access status

## Deal Intelligence
- contract_end_date: When their current Provider contract ends
- competitors_identified: Other vendors being evaluated (comma-separated)
- implementation_timeline: When they need this implemented
- next_meeting_date: Any agreed next meeting date (ISO format)

## Room Content to Generate
Write prospect-facing content for the discovery room based on what was discussed:
- executive_brief: A 2-3 paragraph narrative summarizing the conversation — what they shared, why it matters, and the path forward. Written TO the prospect ("Based on our conversation..."). Professional, empathetic tone.
- current_approach: A 1-2 sentence description of what they're currently doing to solve this problem (for the Root Cause section)
- root_cause: A 1-2 sentence description of WHY their current approach isn't working (the underlying root cause)
- bigger_problem: A 1-2 sentence description of what happens if this doesn't get solved (the cost of indecision, in their terms)

## Rules
1. Only extract what is EXPLICITLY stated or clearly implied in the transcript. Never fabricate.
2. For call sheet questions with predefined options, pick the closest matching option.
3. For number-type questions, extract the exact number mentioned.
4. For BAP scoring: "yes" = clearly confirmed, "maybe" = partially discussed/unclear, "no" = explicitly denied. null = not discussed.
5. Include a verbatim quote as evidence for each high-confidence extraction.
6. For pain_quotes: use the prospect's EXACT words, mapped to the closest matching pain ID. Only map quotes where the connection is clear.
7. For room_content: write as if addressing the prospect directly. Use their language and specific details from the call.
8. Extract the 3-5 most impactful prospect quotes verbatim.
9. Extract any agreed next steps.
10. **CRITICAL for selected_pains**: You MUST select 3-7 pain IDs from the EXACT list above. Do NOT invent new IDs. Every ID must exactly match one from the Pain Categories list. If the prospect describes a pain that doesn't perfectly match, pick the CLOSEST existing ID. For example:
    - "Our Provider is shutting down" → use 'vendor-support-gap'
    - "We're juggling too many tools" → use 'tool-sprawl-centralization'
    - "We're not getting any applicants" → use 'dead-nurture-pipeline' or 'manual-sourcing'
    - "We don't have a career site" → use 'outdated-career-site'
    - "Scheduling interviews is a nightmare" → use 'scheduling-chaos'
11. For bap_notes: Write a 1-3 sentence analyst note for EACH BAP question (q1-q12) summarizing what the prospect said. These notes should be written as if a sales coach is documenting the conversation. Reference specific details, names, and numbers from the call.`;
}

function buildUserPrompt(summary: string, transcript: string): string {
  // Truncate very long transcripts to fit context window
  const maxTranscriptChars = 60000;
  const truncatedTranscript = transcript.length > maxTranscriptChars
    ? transcript.substring(0, maxTranscriptChars) + '\n\n[Transcript truncated for length]'
    : transcript;

  return `## Granola Meeting Summary
${summary || '(No summary available)'}

## Full Transcript
${truncatedTranscript || '(No transcript available)'}

Extract all available data as JSON matching this exact schema:

{
  "call_sheet_answers": {
    "<question_id>": { "value": "<answer>", "confidence": "high|medium|low", "evidence": "<verbatim quote>" }
  },
  "bap_answers": {
    "<q1-q12>": { "value": "yes|maybe|no|null", "confidence": "high|medium|low", "evidence": "<quote>" }
  },
  "bap_notes": {
    "<q1-q12>": "<1-3 sentence analyst note summarizing what was discussed for this BAP question>"
  },
  "selected_pains": ["<pain_id_1>", "<pain_id_2>", ...],
  "meddpicc": {
    "<field_name>": { "value": "<text>", "confidence": "high|medium|low", "evidence": "<quote>" }
  },
  "deal_intel": {
    "<field_name>": { "value": "<text>", "confidence": "high|medium|low", "evidence": "<quote>" }
  },
  "pain_quotes": {
    "<pain_id>": "<exact prospect verbatim mapped to this pain category>"
  },
  "room_content": {
    "executive_brief": "<2-3 paragraph prospect-facing narrative>",
    "current_approach": "<what they're currently doing>",
    "root_cause": "<why it's not working>",
    "bigger_problem": "<cost of indecision in their terms>"
  },
  "key_quotes": ["<verbatim prospect quote 1>", "..."],
  "next_steps": "<agreed next steps>",
  "summary": "<2-3 sentence meeting summary>"
}

CRITICAL: For "selected_pains", you MUST use ONLY IDs from the Pain Categories list above. Do not invent IDs. Pick the 3-7 closest matches.

Return ONLY valid JSON. Do not include fields where no data was found.`;
}

// ── Call OpenAI ──

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<any> {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} — ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');

  return JSON.parse(content);
}

// ── Transform LLM response → ExtractedFields ──

function transformResponse(
  raw: any,
  session: DiscoverySession,
): ExtractionResult {
  const fields: ExtractedField[] = [];
  const validPainIds = new Set(TT_PAINS.map(p => p.id));

  // ── Validate & fix selected_pains ──
  // Strip any hallucinated IDs that don't exist in TT_PAINS
  if (raw.selected_pains && Array.isArray(raw.selected_pains)) {
    raw.selected_pains = raw.selected_pains.filter((id: string) => validPainIds.has(id));
  }
  // Also strip invalid pain_quotes keys
  if (raw.pain_quotes && typeof raw.pain_quotes === 'object') {
    for (const key of Object.keys(raw.pain_quotes)) {
      if (!validPainIds.has(key)) delete raw.pain_quotes[key];
    }
  }

  // 1. Call Sheet Answers
  if (raw.call_sheet_answers) {
    const personaId = session.call_sheet_persona || session.persona || 'hr-director';
    const sheet = SHEETS.find(s => s.id === personaId) || SHEETS[0];
    const questionMap = new Map(sheet.questions.map(q => [q.id, q]));

    for (const [qId, data] of Object.entries(raw.call_sheet_answers)) {
      const d = data as any;
      const question = questionMap.get(qId);
      const existingValue = session.call_sheet_answers?.[qId];

      fields.push({
        key: `call_sheet.${qId}`,
        label: question ? question.question : qId,
        section: 'call_sheet',
        value: d.value,
        confidence: d.confidence || 'medium',
        evidence: d.evidence,
        existingValue,
        hasConflict: !!existingValue && existingValue !== d.value,
      });
    }
  }

  // 2. BAP Answers
  if (raw.bap_answers) {
    const bapLabels: Record<string, string> = {
      q1: 'Core Problem Identified',
      q2: 'Stakeholders Mapped',
      q3: 'Cost of Indecision Quantified',
      q4: 'Priority Level',
      q5: 'Prior Solution Attempts',
      q6: 'Root Cause Understood',
      q7: 'Need for External Help',
      q8: 'Budget Discussed',
      q9: 'Proof Provided',
      q10: 'Solution Map Clear',
      q11: 'Success Metrics Defined',
      q12: 'Confidence Level',
    };

    for (const [qId, data] of Object.entries(raw.bap_answers)) {
      const d = data as any;
      if (d.value === null || d.value === 'null') continue;
      const existingValue = session.bap_answers?.[qId];

      fields.push({
        key: `bap.${qId}`,
        label: bapLabels[qId] || qId,
        section: 'bap',
        value: d.value as BAPAnswer,
        confidence: d.confidence || 'medium',
        evidence: d.evidence,
        existingValue,
        hasConflict: !!existingValue && existingValue !== d.value,
      });
    }
  }

  // 3. MEDDPICC
  if (raw.meddpicc) {
    const meddpiccLabels: Record<string, string> = {
      pain_narrative: 'Pain (in their words)',
      success_metrics_text: 'Metrics',
      decision_criteria: 'Decision Criteria',
      decision_process: 'Decision Process',
      paper_process: 'Paper Process',
      champion_name: 'Champion',
      champion_validation_notes: 'Champion Evidence',
      competitive_situation: 'Competition',
      economic_buyer_access: 'Economic Buyer',
    };

    for (const [field, data] of Object.entries(raw.meddpicc)) {
      const d = data as any;
      const existingValue = (session as any)[field];

      fields.push({
        key: `meddpicc.${field}`,
        label: meddpiccLabels[field] || field,
        section: 'meddpicc',
        value: d.value,
        confidence: d.confidence || 'medium',
        evidence: d.evidence,
        existingValue,
        hasConflict: !!existingValue && existingValue.trim() !== '' && existingValue !== d.value,
      });
    }
  }

  // 4. Deal Intel
  if (raw.deal_intel) {
    const dealLabels: Record<string, string> = {
      contract_end_date: 'Contract End Date',
      competitors_identified: 'Competitors',
      implementation_timeline: 'Timeline',
      next_meeting_date: 'Next Meeting',
    };

    for (const [field, data] of Object.entries(raw.deal_intel)) {
      const d = data as any;
      const existingValue = (session as any)[field];

      fields.push({
        key: `deal.${field}`,
        label: dealLabels[field] || field,
        section: 'deal_intel',
        value: d.value,
        confidence: d.confidence || 'medium',
        evidence: d.evidence,
        existingValue,
        hasConflict: !!existingValue && existingValue.trim?.() !== '' && existingValue !== d.value,
      });
    }
  }

  // 5. Pain Quotes
  if (raw.pain_quotes) {
    for (const [painId, quote] of Object.entries(raw.pain_quotes)) {
      if (!validPainIds.has(painId) || typeof quote !== 'string') continue;
      const pain = TT_PAINS.find(p => p.id === painId);
      if (!pain) continue;
      const existingQuote = session.pain_quotes?.[painId];

      fields.push({
        key: `pain_quote.${painId}`,
        label: `Quote → ${pain.title}`,
        section: 'meta',
        value: quote,
        confidence: 'high',
        evidence: quote,
        existingValue: existingQuote,
        hasConflict: !!existingQuote && existingQuote !== quote,
      });
    }
  }

  // 5b. Selected Pains — auto-derived from transcript
  if (raw.selected_pains && Array.isArray(raw.selected_pains) && raw.selected_pains.length > 0) {
    const existingPains = session.selected_pains || [];
    const newPains = raw.selected_pains.filter((id: string) => !existingPains.includes(id));
    if (newPains.length > 0 || existingPains.length === 0) {
      fields.push({
        key: 'meta.selected_pains',
        label: `Suggested Pains (${raw.selected_pains.length})`,
        section: 'meta',
        value: raw.selected_pains,
        confidence: 'high',
        evidence: `Matched ${raw.selected_pains.length} pain categories from transcript`,
        existingValue: existingPains.length > 0 ? existingPains : undefined,
        hasConflict: existingPains.length > 0,
      });
    }
  }

  // 5c. BAP Notes — analyst narratives for each BAP question
  if (raw.bap_notes && typeof raw.bap_notes === 'object') {
    const bapNoteLabels: Record<string, string> = {
      q1: 'Core Problem Note', q2: 'Stakeholder Map Note', q3: 'Cost of Indecision Note',
      q4: 'Priority Level Note', q5: 'Prior Approach Note', q6: 'Root Cause Note',
      q7: 'External Help Note', q8: 'Budget/Readiness Note', q9: 'Proof/Results Note',
      q10: 'Solution Map Note', q11: 'Success Metrics Note', q12: 'Trial Close Note',
    };
    for (const [qId, note] of Object.entries(raw.bap_notes)) {
      if (typeof note !== 'string' || !note.trim()) continue;
      const existingNote = session.bap_notes?.[qId];

      fields.push({
        key: `bap_note.${qId}`,
        label: bapNoteLabels[qId] || `BAP Note ${qId}`,
        section: 'bap',
        value: note,
        confidence: 'medium',
        existingValue: existingNote,
        hasConflict: !!existingNote && existingNote.trim() !== '' && existingNote !== note,
      });
    }
  }

  // 6. Room Content (auto-written prose)
  if (raw.room_content) {
    const roomLabels: Record<string, string> = {
      executive_brief: 'Executive Brief Narrative',
      current_approach: 'Current Approach (Root Cause section)',
      root_cause: 'Root Cause (Root Cause section)',
      bigger_problem: 'Cost of Indecision (Root Cause section)',
    };
    for (const [field, value] of Object.entries(raw.room_content)) {
      if (typeof value !== 'string' || !value.trim()) continue;
      const sessionKey = field === 'executive_brief' ? 'executive_brief_override'
        : field === 'current_approach' ? 'diagnosis_current_approach_override'
        : field === 'root_cause' ? 'diagnosis_root_cause_override'
        : field === 'bigger_problem' ? 'diagnosis_bigger_problem_override'
        : field;
      const existingValue = (session as any)[sessionKey];

      fields.push({
        key: `room.${field}`,
        label: roomLabels[field] || field,
        section: 'meta',
        value,
        confidence: 'medium',
        existingValue,
        hasConflict: !!existingValue && existingValue.trim() !== '' && existingValue !== value,
      });
    }
  }

  return {
    fields,
    key_quotes: raw.key_quotes || [],
    next_steps: raw.next_steps || '',
    summary: raw.summary || '',
    pain_quotes: raw.pain_quotes || {},
    room_content: raw.room_content || {},
    raw_response: raw,
  };
}

// ── Main Export ──

/**
 * Extract structured session fields from a Granola transcript using an LLM.
 * Returns extracted fields with confidence scores for review before merging.
 */
export async function extractFieldsFromTranscript(
  summary: string,
  transcript: string,
  session: DiscoverySession,
): Promise<ExtractionResult> {
  const systemPrompt = buildSystemPrompt(session);
  const userPrompt = buildUserPrompt(summary, transcript);

  const raw = await callOpenAI(systemPrompt, userPrompt);
  return transformResponse(raw, session);
}

/**
 * Convert extraction results into session update fields for merging.
 * Only includes fields the user has approved (selected = true).
 */
export function buildSessionUpdates(
  result: ExtractionResult,
  selectedKeys: Set<string>,
): Partial<DiscoverySession> {
  const updates: Partial<DiscoverySession> = {};
  const callSheetUpdates: Record<string, any> = {};
  const bapUpdates: Record<string, BAPAnswer> = {};
  const painQuoteUpdates: Record<string, string> = {};
  let bapNoteUpdates: Record<string, string> | null = null;

  for (const field of result.fields) {
    if (!selectedKeys.has(field.key)) continue;

    if (field.section === 'call_sheet') {
      const qId = field.key.replace('call_sheet.', '');
      callSheetUpdates[qId] = field.value;
    } else if (field.section === 'bap') {
      const qId = field.key.replace('bap.', '');
      bapUpdates[qId] = field.value as BAPAnswer;
    } else if (field.section === 'meddpicc') {
      const fieldName = field.key.replace('meddpicc.', '');
      (updates as any)[fieldName] = field.value;
    } else if (field.section === 'deal_intel') {
      const fieldName = field.key.replace('deal.', '');
      (updates as any)[fieldName] = field.value;
    } else if (field.key.startsWith('pain_quote.')) {
      const painId = field.key.replace('pain_quote.', '');
      painQuoteUpdates[painId] = field.value;
    } else if (field.key.startsWith('room.')) {
      const roomField = field.key.replace('room.', '');
      const sessionKey = roomField === 'executive_brief' ? 'executive_brief_override'
        : roomField === 'current_approach' ? 'diagnosis_current_approach_override'
        : roomField === 'root_cause' ? 'diagnosis_root_cause_override'
        : roomField === 'bigger_problem' ? 'diagnosis_bigger_problem_override'
        : roomField;
      (updates as any)[sessionKey] = field.value;
    } else if (field.key === 'meta.selected_pains') {
      updates.selected_pains = field.value;
    } else if (field.key.startsWith('bap_note.')) {
      const qId = field.key.replace('bap_note.', '');
      if (!bapNoteUpdates) bapNoteUpdates = {};
      bapNoteUpdates[qId] = field.value;
    }
  }

  if (Object.keys(callSheetUpdates).length > 0) {
    updates.call_sheet_answers = callSheetUpdates;
  }
  if (Object.keys(bapUpdates).length > 0) {
    updates.bap_answers = bapUpdates;
  }
  if (Object.keys(painQuoteUpdates).length > 0) {
    updates.pain_quotes = painQuoteUpdates;
  }
  if (bapNoteUpdates && Object.keys(bapNoteUpdates).length > 0) {
    updates.bap_notes = bapNoteUpdates;
  }

  return updates;
}

// ── Next Steps Extraction ──

export interface ExtractedNextSteps {
  who: string;
  what: string;
  when: string;
}

export async function extractNextStepsFromTranscript(summary: string, transcript: string): Promise<ExtractedNextSteps> {
  const maxTranscriptChars = 60000;
  const truncatedTranscript = transcript.length > maxTranscriptChars
    ? transcript.substring(0, maxTranscriptChars) + '\n\n[Transcript truncated for length]'
    : transcript;

  const systemPrompt = `You are an expert sales analyst. A sales meeting has just finished and I need to update my Salesforce pipeline. Your job is to extract the agreed upon next steps so I can log them into our CRM.

Context: I sell Service Alignment (Provider/recruiting software). The people I meet with are HR leaders and talent acquisition professionals. 

Rules:
- For "who", include the person's full name and title.
- For "what", be specific: Is it a scheduled call on the calendar? A follow-up date they agreed to? Something we owe them? Something they owe us?
- For "when", include the exact date and time if known.
- If there are no clear next steps, return empty strings.

Return ONLY valid JSON matching this exact schema:
{
  "who": "<Who are the next steps with?>",
  "what": "<Specific action details>",
  "when": "<When is this next step due?>"
}`;

  const userPrompt = `## Granola Meeting Summary\n${summary || '(No summary)'}\n\n## Full Transcript\n${truncatedTranscript || '(No transcript)'}`;

  const response = await callOpenAI(systemPrompt, userPrompt);
  return {
    who: response.who || '',
    what: response.what || '',
    when: response.when || ''
  };
}
