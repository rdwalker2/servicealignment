// ============================================================
// Salesforce OAuth2 Authentication & Token Management
// Manages jsforce connections with automatic token refresh
// and persists credentials in Supabase.
// ============================================================
import jsforce from 'jsforce';
import { createClient } from '@supabase/supabase-js';

// ── Environment Variables ──
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_REDIRECT_URI = process.env.SF_REDIRECT_URI;
const SF_INSTANCE_URL = process.env.SF_INSTANCE_URL || 'https://login.salesforce.com';

// ── Supabase Client (same pattern as server.js) ──
const supabase = createClient(
  'https://tqmpaaxocpwmziivxkym.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// ── Shared OAuth2 configuration ──
const oauth2 = new jsforce.OAuth2({
  clientId: SF_CLIENT_ID,
  clientSecret: SF_CLIENT_SECRET,
  redirectUri: SF_REDIRECT_URI,
  loginUrl: SF_INSTANCE_URL,
});

// ── Logging helper ──
const log = (...args) => console.log('[SF Auth]', ...args);
const logError = (...args) => console.error('[SF Auth]', ...args);

// ── Credential row ID (single-tenant — one row for the org) ──
const CREDENTIAL_ROW_ID = 'default';

// ============================================================
// Internal helpers
// ============================================================

/**
 * Reads the stored Salesforce credentials from Supabase.
 * @returns {Promise<object|null>} The credential row, or null if none exists.
 */
async function getStoredCredentials() {
  try {
    const { data, error } = await supabase
      .from('sf_credentials')
      .select('*')
      .eq('id', CREDENTIAL_ROW_ID)
      .maybeSingle();

    if (error) {
      logError('Failed to read stored credentials:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    logError('Unexpected error reading credentials:', err.message);
    return null;
  }
}

/**
 * Persists Salesforce tokens and metadata to Supabase.
 * Uses upsert so the first save creates the row, subsequent saves update it.
 * @param {object} params
 * @param {string} params.accessToken
 * @param {string} params.refreshToken
 * @param {string} params.instanceUrl
 * @param {string} [params.integrationUser] - The username of the authenticated Salesforce user.
 * @returns {Promise<void>}
 */
async function storeCredentials({ accessToken, refreshToken, instanceUrl, integrationUser }) {
  try {
    const payload = {
      id: CREDENTIAL_ROW_ID,
      access_token: accessToken,
      refresh_token: refreshToken,
      instance_url: instanceUrl,
      last_refreshed: new Date().toISOString(),
    };

    if (integrationUser) {
      payload.integration_user = integrationUser;
    }

    const { error } = await supabase
      .from('sf_credentials')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      logError('Failed to store credentials:', error.message);
      throw new Error(`Credential storage failed: ${error.message}`);
    }

    log('Credentials stored successfully');
  } catch (err) {
    logError('Unexpected error storing credentials:', err.message);
    throw err;
  }
}

// ============================================================
// Exported API
// ============================================================

/**
 * Returns a connected jsforce.Connection using stored tokens.
 * The connection is configured for automatic token refresh via the
 * OAuth2 client credentials. When a refresh occurs, the new tokens
 * are automatically persisted back to Supabase.
 *
 * @returns {Promise<jsforce.Connection>} An authenticated Salesforce connection.
 * @throws {Error} If no stored credentials are found or connection fails.
 */
export async function getConnection() {
  const creds = await getStoredCredentials();

  if (!creds || !creds.access_token || !creds.refresh_token) {
    throw new Error(
      'No Salesforce credentials found. Complete the OAuth flow first via /api/salesforce/auth.'
    );
  }

  const conn = new jsforce.Connection({
    oauth2,
    instanceUrl: creds.instance_url,
    accessToken: creds.access_token,
    refreshToken: creds.refresh_token,
  });

  // ── Auto-persist tokens on refresh ──
  conn.on('refresh', async (newAccessToken, res) => {
    log('Access token refreshed automatically');
    try {
      await storeCredentials({
        accessToken: newAccessToken,
        refreshToken: creds.refresh_token, // refresh token doesn't change
        instanceUrl: creds.instance_url,
      });
    } catch (err) {
      logError('Failed to persist refreshed token:', err.message);
    }
  });

  log(`Connection established → ${creds.instance_url}`);
  return conn;
}

/**
 * Generates the Salesforce OAuth2 authorization URL.
 * Redirect the user's browser here to begin the OAuth consent flow.
 *
 * @returns {string} The full authorization URL.
 */
export function getAuthorizationUrl() {
  const url = oauth2.getAuthorizationUrl({
    scope: 'api refresh_token',
  });
  log('Authorization URL generated');
  return url;
}

/**
 * Exchanges an OAuth2 authorization code for access & refresh tokens,
 * stores them in Supabase, and returns a ready-to-use connection.
 *
 * @param {string} code - The authorization code from the OAuth callback.
 * @returns {Promise<jsforce.Connection>} An authenticated Salesforce connection.
 * @throws {Error} If the token exchange or storage fails.
 */
export async function handleCallback(code) {
  if (!code) {
    throw new Error('Authorization code is required');
  }

  const conn = new jsforce.Connection({ oauth2 });

  try {
    // Exchange the code for tokens
    const userInfo = await conn.authorize(code);

    log(`OAuth flow completed for user ${userInfo.id} (org ${userInfo.organizationId})`);

    // Fetch the username for display purposes
    let integrationUser = null;
    try {
      const identity = await conn.identity();
      integrationUser = identity.username;
      log(`Integration user: ${integrationUser}`);
    } catch (identityErr) {
      logError('Could not fetch user identity (non-fatal):', identityErr.message);
    }

    // Persist the tokens
    await storeCredentials({
      accessToken: conn.accessToken,
      refreshToken: conn.refreshToken,
      instanceUrl: conn.instanceUrl,
      integrationUser,
    });

    // Wire up auto-refresh persistence for this connection
    conn.on('refresh', async (newAccessToken) => {
      log('Access token refreshed automatically');
      try {
        await storeCredentials({
          accessToken: newAccessToken,
          refreshToken: conn.refreshToken,
          instanceUrl: conn.instanceUrl,
        });
      } catch (err) {
        logError('Failed to persist refreshed token:', err.message);
      }
    });

    return conn;
  } catch (err) {
    logError('OAuth callback failed:', err.message);
    throw new Error(`Salesforce OAuth callback failed: ${err.message}`);
  }
}

/**
 * Checks whether we have valid stored Salesforce credentials.
 * Performs a lightweight identity check against the Salesforce API
 * to confirm the tokens are still usable.
 *
 * @returns {Promise<boolean>} `true` if credentials exist and are valid.
 */
export async function isConnected() {
  try {
    const creds = await getStoredCredentials();
    if (!creds || !creds.access_token || !creds.refresh_token) {
      return false;
    }

    // Attempt a lightweight API call to verify the token
    const conn = new jsforce.Connection({
      oauth2,
      instanceUrl: creds.instance_url,
      accessToken: creds.access_token,
      refreshToken: creds.refresh_token,
    });

    await conn.identity();
    return true;
  } catch (err) {
    logError('Connection check failed:', err.message);
    return false;
  }
}

/**
 * Returns a summary of the current Salesforce connection status.
 *
 * @returns {Promise<object>} Status object with connection details:
 *   - `connected` {boolean} — whether stored credentials exist
 *   - `instanceUrl` {string|null} — the Salesforce instance URL
 *   - `lastRefreshed` {string|null} — ISO timestamp of the last token refresh
 *   - `integrationUser` {string|null} — the Salesforce username
 */
export async function getConnectionStatus() {
  try {
    const creds = await getStoredCredentials();

    if (!creds || !creds.access_token) {
      return {
        connected: false,
        instanceUrl: null,
        lastRefreshed: null,
        integrationUser: null,
      };
    }

    return {
      connected: true,
      instanceUrl: creds.instance_url || null,
      lastRefreshed: creds.last_refreshed || null,
      integrationUser: creds.integration_user || null,
    };
  } catch (err) {
    logError('Failed to get connection status:', err.message);
    return {
      connected: false,
      instanceUrl: null,
      lastRefreshed: null,
      integrationUser: null,
    };
  }
}
