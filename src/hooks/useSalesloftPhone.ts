import { useState, useEffect, useCallback, useRef } from 'react';
import { getPersonPhone } from '../lib/salesloft';
import type { PhoneLookupResult } from '../lib/salesloft';

/**
 * Phone enrichment result for a single contact.
 * - 'loading': lookup in progress
 * - PhoneLookupResult: data returned from Salesloft
 * - null: not found or not yet looked up
 */
export type PhoneEnrichment = PhoneLookupResult | 'loading' | null;

/**
 * Hook that enriches contacts with Salesloft phone data.
 * 
 * SAFETY:
 *   - READ-ONLY: Only calls GET endpoints via findPersonByEmail
 *   - DNC-AWARE: Returns doNotContact flag so UI can block call links
 *   - RATE-LIMITED: Processes one lookup at a time with delays between requests
 *   - CACHED: Results are cached for the session — no redundant API calls
 * 
 * @param emails - Array of contact emails to enrich (only those without existing phone)
 * @param enabled - Set false to disable (e.g. in dev mode or when SL not connected)
 */
export function useSalesloftPhone(
  emails: string[],
  enabled: boolean = true
) {
  const [phoneMap, setPhoneMap] = useState<Map<string, PhoneLookupResult>>(new Map());
  const [loadingEmails, setLoadingEmails] = useState<Set<string>>(new Set());
  const lookedUpRef = useRef<Set<string>>(new Set());
  const abortRef = useRef(false);

  useEffect(() => {
    if (!enabled || emails.length === 0) return;

    abortRef.current = false;

    // Filter to emails we haven't looked up yet
    const newEmails = emails.filter(e => !lookedUpRef.current.has(e));
    if (newEmails.length === 0) return;

    async function enrichBatch() {
      const DELAY_MS = 200; // Stay well under 600 req/min limit

      for (const email of newEmails) {
        if (abortRef.current) break;
        if (lookedUpRef.current.has(email)) continue;

        // Mark as in-progress
        lookedUpRef.current.add(email);
        setLoadingEmails(prev => new Set([...prev, email]));

        try {
          const result = await getPersonPhone(email);
          if (result && !abortRef.current) {
            setPhoneMap(prev => {
              const next = new Map(prev);
              next.set(email, result);
              return next;
            });
          }
        } catch (err) {
          console.warn(`[useSalesloftPhone] Failed for ${email}:`, err);
        } finally {
          setLoadingEmails(prev => {
            const next = new Set(prev);
            next.delete(email);
            return next;
          });
        }

        // Rate-limit delay between requests
        if (!abortRef.current) {
          await new Promise(r => setTimeout(r, DELAY_MS));
        }
      }
    }

    enrichBatch();

    return () => {
      abortRef.current = true;
    };
  }, [emails.join(','), enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Get enrichment status for a specific email */
  const getPhoneFor = useCallback((email: string): PhoneEnrichment => {
    if (loadingEmails.has(email)) return 'loading';
    return phoneMap.get(email) || null;
  }, [phoneMap, loadingEmails]);

  /** Check if a contact is DNC */
  const isDNC = useCallback((email: string): boolean => {
    const result = phoneMap.get(email);
    return result?.doNotContact === true;
  }, [phoneMap]);

  /** Get the best phone number (primary > mobile > home) */
  const getBestPhone = useCallback((email: string, existingPhone?: string): string | null => {
    // Prefer existing phone from Clay/DB
    if (existingPhone) return existingPhone;

    const result = phoneMap.get(email);
    if (!result || result.doNotContact) return null;

    return result.phone || result.mobilePhone || result.homePhone || null;
  }, [phoneMap]);

  return {
    phoneMap,
    getPhoneFor,
    isDNC,
    getBestPhone,
    isEnriching: loadingEmails.size > 0,
  };
}
