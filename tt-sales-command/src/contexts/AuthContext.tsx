/* eslint-disable react-refresh/only-export-components */
// ============================================================
// Auth Context — Real Supabase Auth with magic links
// SECURITY: Uses Supabase Auth for real authentication.
// Sessions are cryptographically signed JWTs with expiry.
// Whitelist of allowed emails prevents unauthorized access.
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Profile, UserRole } from '../types';
import { REP_SEED_DATA } from '../data/seedData';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/auditLog';
import { isAdmin as checkIsAdmin, isTeamMember } from '../lib/roles';
import type { Session } from '@supabase/supabase-js';
import { useIdleTimeout } from '../hooks/useIdleTimeout';
import { SessionTimeoutWarning } from '../components/ui/SessionTimeoutWarning';

// ── Allowed users whitelist ──
// Only these emails can log in. Maps email → profile metadata.
// IMPORTANT: Keep in sync with src/lib/roles.ts (the RBAC source of truth).
export const ALLOWED_USERS: Record<string, Profile> = {
  'ryan.walker@teamtailor.com': {
    id: 'admin-ryan',
    full_name: 'Ryan Walker',
    initials: 'RW',
    role: 'admin',
    avatar_color: '#78716c',
    created_at: new Date().toISOString(),
  },
  'jack.luther@teamtailor.com': {
    id: 'rep-jl',
    full_name: REP_SEED_DATA.JL.full_name,
    initials: 'JL',
    role: 'rep',
    avatar_color: REP_SEED_DATA.JL.avatar_color,
    created_at: new Date().toISOString(),
  },
  'moe.aqel@teamtailor.com': {
    id: 'rep-ma',
    full_name: REP_SEED_DATA.MA.full_name,
    initials: 'MA',
    role: 'rep',
    avatar_color: REP_SEED_DATA.MA.avatar_color,
    created_at: new Date().toISOString(),
  },
  'tyler.hanson@teamtailor.com': {
    id: 'rep-th',
    full_name: REP_SEED_DATA.TH.full_name,
    initials: 'TH',
    role: 'rep',
    avatar_color: REP_SEED_DATA.TH.avatar_color,
    created_at: new Date().toISOString(),
  },
  'katy.shelman@teamtailor.com': {
    id: 'rep-ks',
    full_name: REP_SEED_DATA.KS.full_name,
    initials: 'KS',
    role: 'rep',
    avatar_color: REP_SEED_DATA.KS.avatar_color,
    created_at: new Date().toISOString(),
  },
  // ── Exec stakeholders: Signal Board + K-12 only ──
  'brian.mcgarry@teamtailor.com': {
    id: 'exec-bm',
    full_name: 'Brian McGarry',
    initials: 'BM',
    role: 'exec',
    avatar_color: '#3b82f6',
    created_at: new Date().toISOString(),
  },
  'daniel.mathisen@teamtailor.com': {
    id: 'exec-dm',
    full_name: 'Daniel Mathisen',
    initials: 'DM',
    role: 'exec',
    avatar_color: '#8b5cf6',
    created_at: new Date().toISOString(),
  },
  'gordon.french@teamtailor.com': {
    id: 'exec-gf',
    full_name: 'Gordon French',
    initials: 'GF',
    role: 'exec',
    avatar_color: '#06b6d4',
    created_at: new Date().toISOString(),
  },
  'jesper.astrom@teamtailor.com': {
    id: 'exec-ja',
    full_name: 'Jesper Åström',
    initials: 'JÅ',
    role: 'exec',
    avatar_color: '#f59e0b',
    created_at: new Date().toISOString(),
  },
};

// Map rep IDs to initials for data lookups
export const REP_ID_TO_INITIALS: Record<string, string> = {
  'rep-jl': 'JL',
  'rep-ma': 'MA',
  'rep-th': 'TH',
  'rep-ks': 'KS',
};

export const REP_PROFILES: Profile[] = Object.values(ALLOWED_USERS)
  .filter(p => p.role === 'rep');

export const IMPERSONATABLE_PROFILES: Profile[] = Object.values(ALLOWED_USERS)
  .filter(p => p.role === 'rep');

// Session timeout: 24 hours (in ms)
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface AuthContextType {
  /** The real logged-in user (never changes during impersonation) */
  user: Profile | null;
  /** The effective user — the identity the UI should render as. */
  effectiveUser: Profile | null;
  /** True if the real user is admin or manager */
  isManager: boolean;
  /** True if the real user is admin */
  isAdmin: boolean;
  /** True during impersonation */
  isImpersonating: boolean;
  /** The impersonated rep's profile (null when not impersonating) */
  impersonatingRep: Profile | null;
  isLoading: boolean;
  /** Auth mode: 'magic_link' uses real Supabase Auth, 'dev' uses legacy email-only login */
  authMode: 'magic_link' | 'dev';
  /** Send a magic link to the email */
  login: (email: string) => Promise<{ success: boolean; error?: string; magicLinkSent?: boolean }>;
  logout: () => void;
  /** Start impersonating a rep (admin only) */
  startImpersonation: (repId: string) => void;
  /** Stop impersonation and return to admin view */
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Check if we should use dev mode (local development without email) ──
// Set VITE_AUTH_MODE=dev in .env to skip magic links during development
const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || 'magic_link') as 'magic_link' | 'dev';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [impersonatingRep, setImpersonatingRep] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Resolve a Supabase session to a Profile ──
  const resolveProfile = (session: Session | null): Profile | null => {
    if (!session?.user?.email) return null;
    const email = session.user.email.toLowerCase();
    const profile = ALLOWED_USERS[email];
    if (!profile) return null; // Not whitelisted
    
    // Check session age
    const sessionStart = new Date(session.user.last_sign_in_at || session.user.created_at).getTime();
    if (Date.now() - sessionStart > SESSION_MAX_AGE_MS) {
      console.warn('[Auth] Session expired (24h max)');
      supabase.auth.signOut();
      return null;
    }
    
    return profile;
  };

  // ── Initialize: check for existing Supabase session ──
  useEffect(() => {
    if (AUTH_MODE === 'dev') {
      // Dev mode: restore from localStorage (legacy behavior)
      const stored = localStorage.getItem('scc_session');
      if (stored) {
        try {
          const profile = JSON.parse(stored) as Profile;
          if (profile.id === 'manager-ryan') { profile.id = 'admin-ryan'; profile.role = 'admin'; }
          setUser(profile);
        } catch { localStorage.removeItem('scc_session'); }
      }
      const impStored = localStorage.getItem('scc_impersonating');
      if (impStored) {
        try { setImpersonatingRep(JSON.parse(impStored) as Profile); }
        catch { localStorage.removeItem('scc_impersonating'); }
      }
      setIsLoading(false);
      // Ensure Supabase token cache is cleared so it doesn't try to use an expired one and get 401s
      supabase.auth.signOut().catch(() => {});
      return;
    }

    // Production mode: use Supabase Auth
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const profile = resolveProfile(session);
        setUser(profile);
        
        // Restore impersonation from localStorage (admin only)
        if (profile?.role === 'admin') {
          const impStored = localStorage.getItem('scc_impersonating');
          if (impStored) {
            try { setImpersonatingRep(JSON.parse(impStored) as Profile); }
            catch { localStorage.removeItem('scc_impersonating'); }
          }
        }
      } catch (err) {
        console.error('[Auth] Failed to get session:', err);
      }
      setIsLoading(false);
    };
    
    initAuth();

    // Listen for auth state changes (magic link callback, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const profile = resolveProfile(session);
      setUser(profile);
      if (!profile) {
        setImpersonatingRep(null);
        localStorage.removeItem('scc_impersonating');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;
  const isImpersonating = isAdmin && impersonatingRep !== null;
  const effectiveUser = isImpersonating ? impersonatingRep : user;

  const login = async (email: string): Promise<{ success: boolean; error?: string; magicLinkSent?: boolean }> => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check whitelist first
    if (!ALLOWED_USERS[normalizedEmail]) {
      return { success: false, error: 'Email not authorized for this application' };
    }

    if (AUTH_MODE === 'dev') {
      // Dev mode: instant login (no email verification)
      const profile = ALLOWED_USERS[normalizedEmail];
      setUser(profile);
      localStorage.setItem('scc_session', JSON.stringify(profile));
      logAudit({ user_id: profile.id, user_email: normalizedEmail, action: 'login', metadata: { auth_mode: 'dev' } });
      return { success: true };
    }

    // Production mode: send magic link
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/team`,
        },
      });

      if (error) {
        console.error('[Auth] Magic link error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, magicLinkSent: true };
    } catch (err) {
      console.error('[Auth] Login error:', err);
      return { success: false, error: 'Failed to send login link' };
    }
  };

  const logout = async () => {
    logAudit({ user_id: user?.id || 'unknown', user_email: undefined, action: 'logout' });
    setUser(null);
    setImpersonatingRep(null);
    localStorage.removeItem('scc_session');
    localStorage.removeItem('scc_impersonating');
    
    if (AUTH_MODE !== 'dev') {
      await supabase.auth.signOut();
    }
  };

  // ── Idle session timeout (30 min) ──
  const handleIdleTimeout = useCallback(async () => {
    logAudit({ user_id: user?.id || 'unknown', action: 'session_timeout', metadata: { reason: 'idle_30min' } });
    console.warn('[Auth] Session timed out due to inactivity (30 min)');
    setUser(null);
    setImpersonatingRep(null);
    localStorage.removeItem('scc_session');
    localStorage.removeItem('scc_impersonating');
    if (AUTH_MODE !== 'dev') {
      await supabase.auth.signOut();
    }
  }, [user?.id]);

  const { showWarning, remainingSeconds, extendSession } = useIdleTimeout({
    enabled: !!user,
    onTimeout: handleIdleTimeout,
  });

  const startImpersonation = (repId: string) => {
    if (!isAdmin) return;
    const rep = IMPERSONATABLE_PROFILES.find(r => r.id === repId);
    if (rep) {
      setImpersonatingRep(rep);
      localStorage.setItem('scc_impersonating', JSON.stringify(rep));
      logAudit({ user_id: user?.id || 'unknown', action: 'impersonate_start', target_type: 'rep', target_id: repId, metadata: { rep_name: rep.full_name } });
    }
  };

  const stopImpersonation = () => {
    logAudit({ user_id: user?.id || 'unknown', action: 'impersonate_stop', target_type: 'rep', target_id: impersonatingRep?.id });
    setImpersonatingRep(null);
    localStorage.removeItem('scc_impersonating');
  };

  return (
    <AuthContext.Provider value={{
      user,
      effectiveUser,
      isManager,
      isAdmin,
      isImpersonating,
      impersonatingRep,
      isLoading,
      authMode: AUTH_MODE,
      login,
      logout,
      startImpersonation,
      stopImpersonation,
    }}>
      {children}
      {showWarning && (
        <SessionTimeoutWarning
          remainingSeconds={remainingSeconds}
          onExtend={extendSession}
          onLogout={logout}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireAuth(requiredRole?: UserRole) {
  const auth = useAuth();
  if (!auth.user) return { ...auth, authorized: false };
  if (requiredRole && auth.user.role !== requiredRole && auth.user.role !== 'admin') return { ...auth, authorized: false };
  return { ...auth, authorized: true };
}
