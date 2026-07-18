// ── Domain Normalization Utility ──
// Single source of truth for domain cleaning.
// Used on every import, export, and lookup to prevent domain-mismatch fragmentation.

/**
 * Normalize a company domain to a canonical format.
 * Strips protocol, www prefix, trailing slashes, and forces lowercase.
 * 
 * Examples:
 *   "https://www.Sherwin-Williams.com/" → "sherwin-williams.com"
 *   "WWW.DAYFORCE.COM"                 → "dayforce.com"
 *   "hibob.com/careers"                → "hibob.com"
 */
export function normalizeDomain(domain: string | null | undefined): string {
  if (!domain) return '';
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')   // strip protocol
    .replace(/^www\./, '')          // strip www
    .replace(/\/.*$/, '')           // strip path
    .replace(/\/$/, '');            // strip trailing slash
}

/**
 * Normalize an audience source tag.
 * Forces lowercase, replaces spaces with underscores, strips special chars.
 * 
 * Examples:
 *   "Rippling"     → "rippling"
 *   "K-12"         → "k12"
 *   "Day Force"    → "day_force"
 */
export function normalizeAudienceSource(source: string | null | undefined): string {
  if (!source) return '';
  return source
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}
