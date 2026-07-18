// Google Calendar OAuth 2.0 Authentication
// Tokens stored in-memory; will persist across requests but not restarts
let tokens = {};

export function getAuthorizationUrl() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
    'https://teamtailor-gtm-workspace-production.up.railway.app/api/google-calendar/callback';

  if (!clientId) {
    throw new Error('GOOGLE_CALENDAR_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function handleCallback(code) {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
    'https://teamtailor-gtm-workspace-production.up.railway.app/api/google-calendar/callback';

  const res = await fetch('https://oauth2.googleapis.com/token', {
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

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google OAuth token exchange failed: ${res.status} — ${body}`);
  }

  const data = await res.json();
  tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    scope: data.scope,
    // Track when the token was obtained so we can detect expiry
    obtained_at: Date.now(),
  };

  console.log('[GCal Auth] Connected — token expires in', tokens.expires_in, 'seconds');
  return tokens;
}

export async function refreshAccessToken() {
  if (!tokens.refresh_token) {
    throw new Error('No refresh token available. Re-authorize via /api/google-calendar/authorize');
  }

  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google OAuth refresh failed: ${res.status} — ${body}`);
  }

  const data = await res.json();
  // Google does NOT return a new refresh_token on refresh — keep the existing one
  tokens = {
    ...tokens,
    access_token: data.access_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    scope: data.scope,
    obtained_at: Date.now(),
  };

  console.log('[GCal Auth] Token refreshed — expires in', tokens.expires_in, 'seconds');
  return tokens;
}

export async function isConnected() {
  return !!tokens.access_token;
}

export async function getConnectionStatus() {
  const connected = !!tokens.access_token;
  const expiresAt = tokens.obtained_at && tokens.expires_in
    ? new Date(tokens.obtained_at + tokens.expires_in * 1000).toISOString()
    : null;

  return {
    connected,
    scope: tokens.scope || null,
    tokenType: tokens.token_type || null,
    expiresAt,
    hasRefreshToken: !!tokens.refresh_token,
  };
}

export async function getAccessToken() {
  if (!tokens.access_token) {
    throw new Error('Google Calendar not connected. Visit /api/google-calendar/authorize first.');
  }

  // Auto-refresh if token is expired or within 60s of expiry
  if (tokens.obtained_at && tokens.expires_in) {
    const expiresAt = tokens.obtained_at + tokens.expires_in * 1000;
    const bufferMs = 60 * 1000; // refresh 60s before actual expiry
    if (Date.now() >= expiresAt - bufferMs) {
      console.log('[GCal Auth] Token expired or expiring soon — refreshing...');
      await refreshAccessToken();
    }
  }

  return tokens.access_token;
}

export function disconnectCalendar() {
  tokens = {};
  console.log('[GCal Auth] Disconnected — tokens cleared');
}
