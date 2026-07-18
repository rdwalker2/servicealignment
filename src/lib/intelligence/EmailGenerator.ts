import type { DiscoverySession } from '../discoveryDatabase';
import { TT_PAINS } from '../../components/discovery/PainDiscoveryModule';

export class EmailGenerator {
  /**
   * Simulates an intelligent generation of a highly personalized follow-up email.
   */
  public static async generateFollowUp(session: DiscoverySession, repName: string): Promise<string> {
    // Simulate generation delay to feel like an AI
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const company = session.company_name || 'your team';
    const ats = session.current_ats && session.current_ats !== 'None' ? session.current_ats : 'your current system';
    
    // Grab selected pains
    const selectedPains = session.selected_pains || [];
    const painsText = selectedPains.map(id => {
      const p = TT_PAINS.find(x => x.id === id);
      return p ? p.title.toLowerCase() : '';
    }).filter(Boolean);

    if (painsText.length === 1) {
      painStr = `struggles with ${painsText[0]}`;
    } else if (painsText.length > 1) {
      const last = painsText.pop();
      painStr = `challenges around ${painsText.join(', ')} and ${last}`;
    } else {
      painStr = `growth challenges you are facing`;
    }

    // Extract BAP Notes (combining them)
    const notes = Object.values(session.bap_notes || {}).filter(n => n.trim().length > 0);
    const notesStr = notes.length > 0 
      ? `\n\nI specifically noted what you mentioned: "${notes[0]}" — we will make sure that is front and center as we build your business case.`
      : '';

    // Timeline
    const timelineStr = session.implementation_timeline 
      ? `\n\nSince you are aiming to go live by ${session.implementation_timeline}, here is our proposed path forward to ensure we hit that timeline:`
      : `\n\nHere is our proposed path forward:`;

    // Budget
    const budgetStr = session.budget_confirmed
      ? `\n\nI'm glad to hear the budget is already allocated. We'll ensure the final proposal aligns perfectly with your parameters.`
      : `\n\nI'll be sending over the full business impact and ROI case shortly so you have everything you need to secure the budget internally.`;

    const email = `Hi Team,

It was great speaking with you today about the talent acquisition goals at ${company}.

Based on our conversation, it's clear that your team is ready to evolve past ${ats}. The ${painStr} are creating real friction for your hiring managers and candidates, and it's time for a more modern approach.${notesStr}${budgetStr}${timelineStr}

1. Review the custom Discovery Room blueprint (link below) and share it with your stakeholders.
2. Review the ROI calculator to see your exact projected savings.
3. Reconnect on our scheduled call to finalize the Mutual Action Plan.

Looking forward to partnering with you on this.

Best,
${repName}`;

    return email;
  }
}
