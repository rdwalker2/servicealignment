// Salesforce OAuth Authentication
// Tokens stored in-memory; will persist across requests but not restarts
let tokens = {};

export function getAuthorizationUrl() {
  const clientId = process.env.SF_CLIENT_ID;
  const redirectUri = process.env.SF_REDIRECT_URI || 'https://teamtailor-gtm-workspace-production.up.railway.app/api/salesforce/callback';
  if (!clientId) return 'https://login.salesforce.com'; // fallback
  return `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export async function handleCallback(code) {
  const clientId = process.env.SF_CLIENT_ID;
  const clientSecret = process.env.SF_CLIENT_SECRET;
  const redirectUri = process.env.SF_REDIRECT_URI || 'https://teamtailor-gtm-workspace-production.up.railway.app/api/salesforce/callback';

  const res = await fetch('https://login.salesforce.com/services/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) throw new Error(`Salesforce OAuth failed: ${res.status}`);
  tokens = await res.json();
  console.log('[SF Auth] Connected to instance:', tokens.instance_url);
  return tokens;
}

export async function isConnected() {
  return !!tokens.access_token;
}

export async function getConnectionStatus() {
  return {
    connected: !!tokens.access_token,
    instanceUrl: tokens.instance_url || null,
    tokenType: tokens.token_type || null,
  };
}
