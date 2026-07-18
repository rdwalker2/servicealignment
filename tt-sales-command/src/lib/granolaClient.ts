// ============================================================
// Granola API Client — Meeting Notes Integration
// Auto-populates MEDDPICC + Next Steps + Most Recent Update
// ============================================================

const GRANOLA_API_KEY_STORAGE = 'granola_api_key';
const GRANOLA_API_BASE = 'https://public-api.granola.ai/v1';

// ── API Key Management ──

export function getGranolaApiKey(): string | null {
  return localStorage.getItem(GRANOLA_API_KEY_STORAGE);
}

export function setGranolaApiKey(key: string): void {
  localStorage.setItem(GRANOLA_API_KEY_STORAGE, key);
}

export function hasGranolaApiKey(): boolean {
  return !!getGranolaApiKey();
}

// ── Types (matching Granola Public API v1) ──

export interface GranolaApiNote {
  id: string;
  object: 'note';
  title: string;
  web_url?: string;
  owner: {
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  calendar_event?: {
    event_title: string;
    invitees?: Array<{ email: string }>;
  };
  attendees?: Array<{
    name: string;
    email: string;
  }>;
  folder_membership?: Array<{ folder_id: string; folder_name: string }>;
  // List endpoint excludes these:
  transcript?: string | null;
  summary_text?: string;
  summary_markdown?: string;
}

export interface GranolaApiNoteDetails extends GranolaApiNote {
  transcript: string | null;
  summary_text: string;
  summary_markdown: string;
}

// Back-compat alias
export type GranolaApiNoteDetails_Legacy = GranolaApiNoteDetails;

// ── API Calls ──

export async function fetchRecentNotes(limit = 25): Promise<GranolaApiNote[]> {
  const apiKey = getGranolaApiKey();
  if (!apiKey) throw new Error('Granola API key is not set');

  const response = await fetch(`${GRANOLA_API_BASE}/notes?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Granola API error: ${response.statusText}`);
  }

  const data = await response.json();
  return (data.notes || data.items || data) as GranolaApiNote[];
}

export async function fetchNoteDetails(id: string): Promise<GranolaApiNoteDetails> {
  const apiKey = getGranolaApiKey();
  if (!apiKey) throw new Error('Granola API key is not set');

  const response = await fetch(`${GRANOLA_API_BASE}/notes/${id}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Granola API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data as GranolaApiNoteDetails;
}

// ── Company Matching ──

/**
 * Fuzzy-match a Granola note to a company name.
 * Checks note title and attendee domains against company_name.
 */
export function noteMatchesCompany(note: GranolaApiNote, companyName: string): boolean {
  if (!companyName) return false;
  const cn = companyName.toLowerCase().trim();
  const words = cn.split(/\s+/).filter(w => w.length > 2);

  // Check title
  const title = (note.title || '').toLowerCase();
  if (title.includes(cn)) return true;
  // Check if majority of company words appear in title
  const titleMatches = words.filter(w => title.includes(w));
  if (words.length > 0 && titleMatches.length >= Math.ceil(words.length * 0.6)) return true;

  // Check attendee emails/domains
  const attendees = note.attendees || [];
  const calInvitees = note.calendar_event?.invitees || [];
  const allEmails = [
    ...attendees.map(a => a.email?.toLowerCase() || ''),
    ...calInvitees.map(i => (i as any).email?.toLowerCase() || ''),
  ].filter(e => e && !e.includes('teamtailor.com')); // exclude internal

  // Extract domain names from external emails
  for (const email of allEmails) {
    const domain = email.split('@')[1]?.split('.')[0] || '';
    if (domain.length > 2 && cn.includes(domain)) return true;
    if (words.some(w => domain.includes(w))) return true;
  }

  // Check attendee names
  for (const a of attendees) {
    if (!a.email?.includes('teamtailor.com') && a.name) {
      // If attendee name appears in notes, close enough
    }
  }

  return false;
}

/**
 * Find matching notes for a company across all recent Granola notes.
 * Returns notes sorted by most recent first.
 */
export async function findNotesForCompany(companyName: string, limit = 50): Promise<GranolaApiNote[]> {
  const notes = await fetchRecentNotes(limit);
  return notes
    .filter(n => noteMatchesCompany(n, companyName))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ── MEDDPICC Extraction from Summary ──

export interface MEDDPICCExtraction {
  metrics: string;
  economic_buyer: string;
  decision_criteria: string;
  decision_process: string;
  paper_process: string;
  identify_pain: string;
  champion: string;
  competition: string;
  compelling_event: string;
  next_steps: string;        // Who/What/When format
  most_recent_update: string; // Summary of what happened
}

/**
 * Extract MEDDPICC fields from a Granola summary_markdown.
 * Uses pattern matching on common section headers and bullet points.
 * Falls back to heuristic extraction if no clear sections found.
 */
export function extractMEDDPICCFromSummary(markdown: string): Partial<MEDDPICCExtraction> {
  if (!markdown) return {};
  const result: Partial<MEDDPICCExtraction> = {};
  const lower = markdown.toLowerCase();

  // Helper: extract content under a markdown heading
  const extractSection = (headers: string[]): string => {
    for (const h of headers) {
      // Match ### heading or **bold** section
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

  // Extract known MEDDPICC sections from structured Granola output
  result.metrics = extractSection(['Metrics', 'Success Metrics', 'Measurement', 'KPIs']);
  result.economic_buyer = extractSection(['Economic Buyer', 'Budget Holder', 'Decision Maker']);
  result.decision_criteria = extractSection(['Decision Criteria', 'Evaluation Criteria', 'Requirements']);
  result.decision_process = extractSection(['Decision Process', 'Buying Process', 'Timeline']);
  result.paper_process = extractSection(['Paper Process', 'Procurement', 'Legal Process', 'Contract Process']);
  result.identify_pain = extractSection(['Pain', 'Identify Pain', 'Pain Points', 'Challenges', 'Current Challenges', 'Problems']);
  result.champion = extractSection(['Champion', 'Internal Champion', 'Advocate']);
  result.competition = extractSection(['Competition', 'Competitors', 'Competitive', 'Competitive Landscape', 'Other Vendors']);
  result.compelling_event = extractSection(['Compelling Event', 'Timeline Driver', 'Urgency', 'Why Now']);
  result.next_steps = extractSection(['Next Steps', 'Action Items', 'Follow-up', 'Follow Up']);

  // Build "Most Recent Update" from the first paragraph or summary
  const lines = markdown.split('\n').filter(l => l.trim());
  const firstContent = lines.find(l => !l.startsWith('#') && !l.startsWith('*') && l.trim().length > 10);
  if (firstContent) {
    result.most_recent_update = firstContent.trim();
  }

  // Heuristic: if no structured sections found, try bullet-point extraction
  if (!result.identify_pain && !result.champion) {
    // Look for pain indicators
    const painIndicators = ['pain', 'challenge', 'problem', 'struggle', 'frustrat', 'broken', 'manual', 'spreadsheet'];
    const painLines = markdown.split('\n')
      .filter(l => l.startsWith('- ') || l.startsWith('* '))
      .filter(l => painIndicators.some(p => l.toLowerCase().includes(p)));
    if (painLines.length > 0) {
      result.identify_pain = painLines.map(l => l.replace(/^[-*]\s*/, '')).join('\n');
    }

    // Look for champion/stakeholder mentions
    const champIndicators = ['champion', 'advocate', 'head of', 'vp of', 'director of'];
    const champLines = markdown.split('\n')
      .filter(l => champIndicators.some(c => l.toLowerCase().includes(c)));
    if (champLines.length > 0) {
      result.champion = champLines[0].replace(/^[-*#\s]*/, '').trim();
    }

    // Look for competition mentions
    const compIndicators = ['competitor', 'also evaluating', 'also looking', 'greenhouse', 'lever', 'workday', 'icims', 'jazzhr', 'workable', 'bamboo'];
    const compLines = markdown.split('\n')
      .filter(l => compIndicators.some(c => l.toLowerCase().includes(c)));
    if (compLines.length > 0) {
      result.competition = compLines.map(l => l.replace(/^[-*#\s]*/, '')).join('\n');
    }
  }

  // Parse structured Who/What/When from Granola's Next Steps format
  // Granola outputs: "**Action item bold text** (Person Name)\n  Detail text..."
  if (result.next_steps) {
    const ns = result.next_steps;
    const bullets = ns.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
    
    if (bullets.length > 0) {
      // Known internal team names — actions owned by these people are "Our Actions"
      const TT_NAMES = ['ryan', 'jack', 'jamie', 'brian', 'chris', 'anna', 'james', 'nic', 'tyler', 'moe'];

      // Parse ALL bullets to classify internal vs external
      const parsedActions: Array<{ who: string; what: string; isInternal: boolean }> = [];
      for (const bullet of bullets) {
        const clean = bullet.replace(/^[-*]\s*/, '').trim();
        const ownerMatch = clean.match(/\(([^)]+)\)\s*$/);
        const owner = ownerMatch ? ownerMatch[1].trim() : '';
        const boldMatch = clean.match(/\*\*([^*]+)\*\*/);
        const action = boldMatch ? boldMatch[1].trim() : clean.replace(/\([^)]+\)\s*$/, '').trim();
        const isInternal = TT_NAMES.some(n => owner.toLowerCase().includes(n));
        parsedActions.push({ who: owner, what: action, isInternal });
      }

      // Primary "Who" — the owner of the first action
      const firstAction = parsedActions[0];
      const who = firstAction.who;

      // Build compact "What" — all internal actions + any buyer commitments
      const internalActions = parsedActions.filter(a => a.isInternal);
      const externalActions = parsedActions.filter(a => !a.isInternal);

      let what = '';
      if (internalActions.length === 1) {
        what = internalActions[0].what;
      } else if (internalActions.length > 1) {
        // Compact multi-action: "Send business case; Confirm migration scope"
        what = internalActions.map(a => a.what).join('; ');
      }

      // If there are buyer/external actions, append them
      if (externalActions.length > 0) {
        const buyerPart = externalActions.map(a => `${a.who}: ${a.what}`).join('; ');
        what = what ? `${what}. Awaiting: ${buyerPart}` : `Awaiting: ${buyerPart}`;
      }

      // Also scan detail lines (non-bullet text) for buyer commitment language
      if (externalActions.length === 0) {
        const detailLines = ns.split('\n').filter(l => !l.trim().startsWith('-') && !l.trim().startsWith('*') && l.trim());
        const buyerSignals = ['i\'ll', 'we will', 'we\'ll', 'let me', 'i need to', 'i\'m going to', 'we\'re going to', 'will respond', 'will review', 'will get back', 'will check'];
        for (const line of detailLines) {
          const lineLower = line.toLowerCase();
          if (buyerSignals.some(signal => lineLower.includes(signal))) {
            what = what ? `${what}. Awaiting: ${line.trim()}` : `Awaiting: ${line.trim()}`;
            break;
          }
        }
      }

      // Extract "When" — search ALL bullets and detail lines for dates
      const datePatterns = [
        /(?:by|on|before|until)\s+((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(?:January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}\/\d{1,2})\s*\d{0,4}(?:st|nd|rd|th)?)/i,
        /(?:week of)\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(?:January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}\/\d{1,2})\s*\d{0,4}(?:st|nd|rd|th)?/i,
        /(?:Monday|Tuesday|Wednesday|Thursday|Friday)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?/i,
        /(?:Monday|Tuesday|Wednesday|Thursday|Friday)\s+\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)/i,
        /\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/,
        /today/i,
        /tomorrow/i,
        /end of (?:this |next )?\w+/i,
      ];
      let when = '';
      // Search all text in the next steps section
      const allNSText = ns;
      for (const pattern of datePatterns) {
        const dateMatch = allNSText.match(pattern);
        if (dateMatch) {
          when = dateMatch[0].trim();
          break;
        }
      }

      // Set structured fields (these are on the extraction object — they'll be mapped to session fields downstream)
      (result as any).next_steps_who = who;
      (result as any).next_steps_what = what;
      (result as any).next_steps_when = when;

      // Also build the full flat next_action with ALL bullets for SFDC paste
      const allActions = bullets.map(b => b.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim());
      result.next_steps = allActions.join('; ');
    }
  }

  // Clean empty values
  for (const key of Object.keys(result) as (keyof MEDDPICCExtraction)[]) {
    if (!result[key]?.trim()) delete result[key];
  }

  return result;
}

/**
 * Fetch the latest Granola note for a company and extract MEDDPICC fields.
 * Returns null if no matching notes found.
 */
export async function fetchMEDDPICCForCompany(companyName: string): Promise<{
  extraction: Partial<MEDDPICCExtraction>;
  note: GranolaApiNoteDetails;
  noteDate: string;
} | null> {
  try {
    const matches = await findNotesForCompany(companyName);
    if (matches.length === 0) return null;

    // Get full details of the most recent matching note
    const details = await fetchNoteDetails(matches[0].id);
    const extraction = extractMEDDPICCFromSummary(details.summary_markdown || '');

    return {
      extraction,
      note: details,
      noteDate: details.created_at,
    };
  } catch (err) {
    console.error('[Granola] Failed to fetch MEDDPICC for', companyName, err);
    return null;
  }
}
