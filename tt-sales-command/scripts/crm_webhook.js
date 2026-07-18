import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY 
);

/**
 * Handles generic inbound webhooks from CRM / Outreach tools (e.g. Smartlead, Apollo, Calendly)
 */
export async function handleCrmWebhook(payload) {
  console.log('[CRM Webhook] Received payload:', JSON.stringify(payload));
  
  // 1. Identify the prospect via Email or Domain
  let email = payload.email || payload.prospect_email || payload.invitee?.email;
  let domain = null;
  
  if (email) {
      email = email.toLowerCase().trim();
      domain = email.split('@')[1];
  } else if (payload.domain) {
      domain = payload.domain.toLowerCase().trim();
  }
  
  if (!email && !domain) {
    console.log('[CRM Webhook] ❌ Ignored: No email or domain found to map lead.');
    return { status: 'ignored', reason: 'missing_identifier' };
  }

  // 2. Determine Pipeline Stage based on Event Type
  let newStage = null;
  const event = (payload.event || payload.type || payload.event_type || '').toLowerCase();
  
  if (event.includes('reply') || event.includes('replied')) {
      newStage = 'Conversation Started';
  } else if (event.includes('meeting') || event.includes('booked') || event.includes('invitee.created')) {
      newStage = 'Meeting Set';
  } else if (event.includes('sent') || event.includes('opened') || event.includes('clicked')) {
      newStage = 'Outreach Active';
  } else if (event.includes('bounced') || event.includes('unsubscribed')) {
      newStage = 'Disqualified';
  } else {
      // Fallback
      newStage = 'Outreach Active';
  }
  
  console.log(`[CRM Webhook] Mapped Event [${event}] -> Pipeline Stage [${newStage}] for ${email || domain}`);

  // 3. Update Supabase
  let query = supabase.from('clay_signals').update({ pipeline_stage: newStage });
  
  if (email) {
      // Prefer exact email match first
      query = query.eq('email', email);
  } else {
      query = query.eq('company_domain', domain);
  }
  
  const { data, error } = await query.select('id').maybeSingle();
  
  // If email didn't match, fallback to domain if we have it
  if (!data && email && domain) {
      console.log(`[CRM Webhook] Exact email not found, attempting domain match for ${domain}...`);
      const fallbackQuery = await supabase.from('clay_signals')
          .update({ pipeline_stage: newStage })
          .eq('company_domain', domain)
          .select('id');
          
      if (fallbackQuery.error) {
           console.error('[CRM Webhook] ❌ Supabase Fallback Update Error:', fallbackQuery.error);
           return { status: 'error', reason: fallbackQuery.error.message };
      }
      
      if (!fallbackQuery.data || fallbackQuery.data.length === 0) {
           console.log(`[CRM Webhook] ⚠️ Lead not found in DB for domain ${domain}. Ignoring.`);
           return { status: 'ignored', reason: 'lead_not_found' };
      }
  } else if (error) {
      console.error('[CRM Webhook] ❌ Supabase Update Error:', error);
      return { status: 'error', reason: error.message };
  }

  console.log(`[CRM Webhook] ✅ Successfully updated pipeline stage to [${newStage}]`);
  return { status: 'updated', stage: newStage };
}
