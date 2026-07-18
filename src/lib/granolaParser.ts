import type { DiscoverySession, BAPAnswer } from './discoveryDatabase';

export function parseGranolaSummary(text: string): Partial<DiscoverySession> {
  const updates: Partial<DiscoverySession> = {};
  const bap_answers: Record<string, BAPAnswer> = {};

  if (!text) return updates;

  // 1. Parse MEDDPICC fields
  const meddpiccMap: Record<string, keyof DiscoverySession> = {
    'M — Metrics': 'success_metrics_text',
    'E — Economic Buyer': 'economic_buyer_access',
    'D — Decision Criteria': 'decision_criteria',
    'D — Decision Process': 'decision_process',
    'P — Paper Process': 'paper_process',
    'I — Identify Pain': 'pain_narrative',
    'C — Champion': 'champion_name',
    'C — Competition': 'competitive_situation'
  };

  for (const [prefix, field] of Object.entries(meddpiccMap)) {
    // Looks for e.g. "M — Metrics: some text..." up until the next section
    // Assumes Granola recipes output exactly the requested string prefixes
    const regex = new RegExp(`${prefix}[:\\-\\s]+([^]*?)(?=(?:(?:M|E|D|P|I|C) — )|(?:Q\\d+ — )|$)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
      updates[field] = match[1].trim() as any;
    }
  }

  // 2. Parse BAP Checkpoints (Q1-Q12)
  // Format from recipe: "Q1 — Core Problem: Yes — They have a huge issue with..."
  for (let i = 1; i <= 12; i++) {
    const dbKey = `q${i}`;
    const regex = new RegExp(`Q${i} — [^:]+[:\\-\\s]+(Yes|Maybe|No)(?:[\\s\\-]*([^]*?))?(?=(?:Q\\d+ — )|(?:(?:M|E|D|P|I|C) — )|$)`, 'i');
    const match = text.match(regex);
    
    if (match && match[1]) {
      const answerText = match[1].trim().toLowerCase() as BAPAnswer;
      bap_answers[dbKey] = answerText;
      // We could also store the evidence (match[2]) in session.bap_notes if desired.
      if (match[2] && match[2].trim()) {
        if (!updates.bap_notes) updates.bap_notes = {};
        updates.bap_notes[dbKey] = match[2].trim();
      }
    }
  }

  if (Object.keys(bap_answers).length > 0) {
    updates.bap_answers = bap_answers;
  }

  // 3. Parse MAP Action Items
  // Format from recipe: 
  // MAP Action Items:
  // - Owner: Jack | Task: Send security whitepaper | Date: 2026-06-05
  const mapRegex = /MAP Action Items:[\s\r\n]*((?:-.*?(?:[\r\n]|$))+)/i;
  const mapMatch = text.match(mapRegex);
  if (mapMatch && mapMatch[1]) {
    const lines = mapMatch[1].trim().split('\n');
    const newMilestones = lines.map(line => {
      // Parse: - Owner: [owner] | Task: [task] | Date: [date]
      const parts = line.replace(/^-/, '').trim().split('|').map(p => p.trim());
      let owner = '', label = '', dueDate = '';
      
      for (const part of parts) {
        if (part.toLowerCase().startsWith('owner:')) owner = part.substring(6).trim();
        if (part.toLowerCase().startsWith('task:')) label = part.substring(5).trim();
        if (part.toLowerCase().startsWith('date:')) dueDate = part.substring(5).trim();
      }

      if (owner && label && dueDate) {
        return {
          id: `map-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          label,
          owner,
          dueDate,
          done: false
        };
      }
      return null;
    }).filter(m => m !== null);

    if (newMilestones.length > 0) {
      updates.mutual_action_plan = newMilestones as any;
    }
  }

  // 4. Parse Call Sheet Answers (Extended — for jk1-jk6, cs1-cs3, roi_*)
  // Format: "jk1: They described a 7-step process starting with..."
  // Format: "roi_hires: 45"
  const callSheetPatterns: Record<string, RegExp> = {
    // Tactical discovery
    jk1: /jk1[:\-\s]+(.+?)(?=(?:jk\d|cs\d|roi_|Q\d|M —|$))/is,
    jk2: /jk2[:\-\s]+(.+?)(?=(?:jk\d|cs\d|roi_|Q\d|M —|$))/is,
    jk3: /jk3[:\-\s]+(.+?)(?=(?:jk\d|cs\d|roi_|Q\d|M —|$))/is,
    jk4: /jk4[:\-\s]+(.+?)(?=(?:jk\d|cs\d|roi_|Q\d|M —|$))/is,
    jk5: /jk5[:\-\s]+(.+?)(?=(?:jk\d|cs\d|roi_|Q\d|M —|$))/is,
    jk6: /jk6[:\-\s]+(.+?)(?=(?:jk\d|cs\d|roi_|Q\d|M —|$))/is,
    // System & competitive
    cs1: /cs1[:\-\s]+(.+?)(?=(?:cs\d|jk\d|roi_|Q\d|M —|$))/is,
    cs2: /cs2[:\-\s]+(.+?)(?=(?:cs\d|jk\d|roi_|Q\d|M —|$))/is,
    cs3: /cs3[:\-\s]+(.+?)(?=(?:cs\d|jk\d|roi_|Q\d|M —|$))/is,
    cs4: /cs4[:\-\s]+(.+?)(?=(?:cs\d|jk\d|roi_|Q\d|M —|$))/is,
    // ROI numeric
    roi_hires: /roi_hires[:\-\s]+(\d+)/i,
    roi_agency: /roi_agency[:\-\s]+(\d+)/i,
    roi_ttf: /roi_ttf[:\-\s]+(\d+)/i,
    roi_admin_hrs: /roi_admin_hrs[:\-\s]+(\d+)/i,
    // Job/system setup
    js1: /js1[:\-\s]+(.+?)(?=(?:js\d|jk\d|cs\d|roi_|Q\d|M —|$))/is,
    js2: /js2[:\-\s]+(.+?)(?=(?:js\d|jk\d|cs\d|roi_|Q\d|M —|$))/is,
    js3: /js3[:\-\s]+(.+?)(?=(?:js\d|jk\d|cs\d|roi_|Q\d|M —|$))/is,
  };

  const callSheetAnswers: Record<string, string> = {};
  for (const [key, regex] of Object.entries(callSheetPatterns)) {
    const match = text.match(regex);
    if (match && match[1]) {
      callSheetAnswers[key] = match[1].trim();
    }
  }

  if (Object.keys(callSheetAnswers).length > 0) {
    updates.call_sheet_answers = callSheetAnswers;
  }

  // 5. Parse Deal Intelligence fields
  const contractMatch = text.match(/contract[_\s]end[_\s]date[:\-\s]+(\S+)/i);
  if (contractMatch) updates.contract_end_date = contractMatch[1].trim() as any;

  const competitorsMatch = text.match(/competitors[:\-\s]+(.+?)(?=\n|$)/i);
  if (competitorsMatch) updates.competitors_identified = competitorsMatch[1].trim() as any;

  const timelineMatch = text.match(/implementation[_\s]timeline[:\-\s]+(.+?)(?=\n|$)/i);
  if (timelineMatch) updates.implementation_timeline = timelineMatch[1].trim() as any;

  return updates;
}
