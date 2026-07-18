// ============================================================
// Shareable Room — URL Token Encoding/Decoding
// Generates unique, shareable URLs for prospect-facing Discovery Rooms
// ============================================================

export interface RoomConfig {
  sessionId?: string;        // ID to fetch live DB state
  company: string;           // Company name
  companyId?: string;        // Internal company ID for mock data
  repName?: string;          // Rep's name to show "Prepared by"
  accent?: string;           // Brand color (defaults to #1c1917)
  pains?: string[];          // Pre-selected pain IDs (rep can seed)
  persona?: string;          // Pre-selected persona
  ats?: string;              // Current ATS (for competitive intel)
  showPricing?: boolean;     // Whether to show the pricing section
  customMessage?: string;    // Optional personalized message in the hero
}

/**
 * Encode a RoomConfig into a URL-safe token.
 * Uses base64url encoding of JSON.
 */
export function encodeRoomToken(config: RoomConfig): string {
  const json = JSON.stringify(config);
  // base64url encode (no padding, URL-safe chars)
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode a room token back into RoomConfig.
 * Returns null if the token is invalid.
 */
export function decodeRoomToken(token: string): RoomConfig | null {
  try {
    // Restore base64 from base64url
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) base64 += '=';
    const json = decodeURIComponent(escape(atob(base64)));
    const config = JSON.parse(json) as RoomConfig;
    // Validate required fields
    if (!config.company || typeof config.company !== 'string') return null;
    return config;
  } catch {
    return null;
  }
}

/**
 * Generate the full shareable URL for a room config.
 * Uses the current origin (works in dev and production).
 */
export function generateShareableUrl(config: RoomConfig): string {
  const token = encodeRoomToken(config);
  return `${window.location.origin}/room/${token}`;
}

/**
 * Generate a short, human-readable room slug for display purposes.
 * e.g., "acme-corp-2026" — not used for routing, just for UI.
 */
export function generateRoomSlug(companyName: string): string {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const suffix = Date.now().toString(36).slice(-4);
  return `${slug}-${suffix}`;
}

/**
 * Copy text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
