// Salesforce Gap Detector — finds signals not yet in SFDC
export async function detectAndResolve(signal) {
  console.log('[SF Gap] Detect requested for:', signal?.domain || 'unknown');
  return { action: 'none', message: 'Gap detector not yet configured' };
}

export async function scanAllGaps({ dryRun = false, limit = 100 } = {}) {
  console.log('[SF Gap] Scan requested (dryRun:', dryRun, ', limit:', limit, ')');
  return { scanned: 0, gaps: [], message: 'Gap scan not yet configured' };
}

export async function createLead(data) {
  console.log('[SF Gap] Create lead requested');
  return null;
}

export async function createContact(signal, accountId) {
  console.log('[SF Gap] Create contact requested for account:', accountId);
  return null;
}
