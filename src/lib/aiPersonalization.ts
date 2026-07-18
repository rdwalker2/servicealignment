import { supabase } from './supabase';
import type { TargetAccount } from '../data/targetAccounts';
import type { TimelineEvent } from './salesloft';

/**
 * Calls the Supabase Edge Function to generate a personalized LinkedIn
 * connection request based on the target account's intent signals, 
 * tech stack, and company info.
 */
export async function generateLinkedInDraft(
  account: any, // TargetAccount | AccountView
  timeline: TimelineEvent[]
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-ai-draft', {
      body: { account, timeline }
    });

    if (error) {
      console.error('Edge function returned error:', error);
      throw error;
    }

    if (data && data.draft) {
      return data.draft;
    }
    
    throw new Error('Invalid response format from Edge Function.');
  } catch (err) {
    console.error('Failed to invoke generate-ai-draft edge function:', err);
    
    // Fallback template just in case the edge function isn't deployed or fails
    const contactName = account.contact?.name || account.contacts?.[0]?.name || 'there';
    const names = contactName.split(' ');
    const firstName = names[0];
    const companyName = account.name || account.companyName;
    const incumbent = account.incumbentAts || account.currentAts || 'your current Provider';

    return `Noticed ${companyName} is growing fast on ${incumbent} — we help teams like yours cut time-to-hire in half with a career site that actually converts. Worth comparing notes, ${firstName}?`;
  }
}

// Keep backward compatibility
export const generateAiEmailDraft = generateLinkedInDraft;
