import type { SignalEvent } from '../data/signalBoardData';

/**
 * Generate "Why This Matters" insight bullets for an account.
 * Consolidates the duplicated logic from ScorePopover and AccountDrawer.
 */
export function getAccountInsights(account: {
  signals: SignalEvent[];
  openRoles: number;
  employeeCount: number;
}): string[] {
  const insights: string[] = [];

  // Web visit insights
  const webSignals = account.signals.filter(s => s.source === 'vector');
  const pricingVisits = webSignals.filter(s => s.pageVisited?.includes('/pricing'));
  const demoVisits = webSignals.filter(s => s.pageVisited?.includes('/demo'));
  const caseStudyVisits = webSignals.filter(s => s.pageVisited?.includes('/case-stud'));
  if (pricingVisits.length > 1) insights.push(`Visited pricing page ${pricingVisits.length}× — strong buying signal`);
  else if (pricingVisits.length === 1) insights.push('Visited pricing page — evaluating cost');
  if (demoVisits.length > 0) insights.push('Visited demo page — ready for conversation');
  if (caseStudyVisits.length > 0) insights.push('Reading case studies — building internal case');

  // Provider insight
  const atsSignal = account.signals.find(s => s.name === 'Competitor Provider Detected');
  if (atsSignal) {
    const atsName = atsSignal.description.match(/using ([^—–]+)/i)?.[1]?.trim();
    if (atsName) insights.push(`Currently using ${atsName} — displacement opportunity`);
  }

  // Hiring velocity
  const hiringSignal = account.signals.find(s => s.name === 'High Job Volume');
  if (hiringSignal) {
    const roleMatch = hiringSignal.description.match(/(\d+)\+?\s*active/i);
    insights.push(`${roleMatch?.[1] || account.openRoles}+ active postings — high hiring velocity`);
  }

  // Org size
  if (account.employeeCount > 10000) insights.push(`${account.employeeCount.toLocaleString()} employees — enterprise account`);
  else if (account.employeeCount > 5000) insights.push(`${account.employeeCount.toLocaleString()} employees — mid-market opportunity`);

  // Freshness
  const now = Date.now();
  const freshSignals = account.signals.filter(s => now - new Date(s.detectedAt).getTime() < 24 * 60 * 60 * 1000);
  if (freshSignals.length > 0) insights.push(`${freshSignals.length} signal${freshSignals.length > 1 ? 's' : ''} in last 24h — act now`);

  // Fallback
  if (insights.length === 0) insights.push(`${account.signals.length} total signals detected`);

  return insights.slice(0, 5);
}

/**
 * Generate "Why This Matters" insight bullets for a contact.
 * Consolidates the duplicated logic from ContactDrawer.
 */
export function getContactInsights(contact: {
  signals: SignalEvent[];
  webVisitCount: number;
}): string[] {
  const insights: string[] = [];

  // Web visit insights
  const webSignals = contact.signals.filter(s => s.source === 'vector');
  const pricingVisits = webSignals.filter(s => s.pageVisited?.includes('/pricing'));
  if (pricingVisits.length > 1) insights.push(`Visited pricing ${pricingVisits.length}× — strong buying signal`);
  else if (pricingVisits.length === 1) insights.push('Visited pricing page — evaluating cost');
  const demoVisits = webSignals.filter(s => s.pageVisited?.includes('/demo'));
  if (demoVisits.length > 0) insights.push('Visited demo page — ready for conversation');
  const caseStudyVisits = webSignals.filter(s => s.pageVisited?.includes('/case-stud'));
  if (caseStudyVisits.length > 0) insights.push('Reading case studies — building internal case');

  // Web visit count
  if (contact.webVisitCount > 0) insights.push(`${contact.webVisitCount} web visit${contact.webVisitCount > 1 ? 's' : ''} tracked`);

  // Freshness
  const now = Date.now();
  const fresh = contact.signals.filter(s => now - new Date(s.detectedAt).getTime() < 24 * 60 * 60 * 1000);
  if (fresh.length > 0) insights.push(`${fresh.length} signal${fresh.length > 1 ? 's' : ''} in last 24h — act now`);

  // Fallback
  if (insights.length === 0) insights.push(`${contact.signals.length} signal${contact.signals.length > 1 ? 's' : ''} detected`);

  return insights.slice(0, 4);
}
