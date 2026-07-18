import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Logs a simulated Salesforce action to the sfdc_sync_logs table for the Admin Dashboard
 * 
 * @param {string} status - 'DRY_RUN', 'HALTED', 'ERROR', 'SUCCESS'
 * @param {string} accountDomain - The domain of the company (e.g., 'acme.com')
 * @param {string} sfAccountId - The Salesforce ID, if known
 * @param {string} message - Human-readable description of what would have happened
 * @param {object} payload - The JSON payload that would have been sent
 */
export async function logSfdcAction(status, accountDomain, sfAccountId, message, payload = {}) {
  try {
    await supabase.from('sfdc_sync_logs').insert({
      status,
      account_domain: accountDomain,
      sf_account_id: sfAccountId,
      message,
      payload
    });
    console.log(`[SFDC ${status}] ${accountDomain} - ${message}`);
  } catch (err) {
    console.error(`[SFDC Logger Error] Failed to log ${status} for ${accountDomain}:`, err);
  }
}
