/* eslint-disable react-refresh/only-export-components */
// ============================================================
// Auth Context — Real Supabase Auth with magic links
// Multi-Tenant Aware: Uses `super_admins` and `workspace_users` 
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Profile, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/auditLog';
import type { Session } from '@supabase/supabase-js';
import { useIdleTimeout } from '../hooks/useIdleTimeout';
import { SessionTimeoutWarning } from '../components/ui/SessionTimeoutWarning';

// Session timeout: 24 hours (in ms)
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface AuthContextType {
  user: Profile | null;
  effectiveUser: Profile | null;
  isManager: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isImpersonating: boolean;
  impersonatingRep: Profile | null;
  isLoading: boolean;
  authMode: 'magic_link' | 'dev';
  login: (email: string) => Promise<{ success: boolean; error?: string; magicLinkSent?: boolean }>;
  logout: () => void;
  startImpersonation: (repProfile: Profile) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || 'magic_link') as 'magic_link' | 'dev';

// Legacy exports to prevent build errors (should be replaced by dynamic DB lookups)
export const ALLOWED_USERS: Record<string, Profile> = {};
export const REP_PROFILES: Profile[] = [];
export const IMPERSONATABLE_PROFILES: Profile[] = [];
export const REP_ID_TO_INITIALS: Record<string, string> = {};

// Dev mode mock super admin
const DEV_SUPER_ADMIN: Profile = {
  id: 'dev-super-admin',
  email: 'ryan@servicealignment.com',
  full_name: 'Ryan (Dev Admin)',
  initials: 'RD',
  role: 'super_admin',
  avatar_color: '#3b82f6',
  created_at: new Date().toISOString()
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [impersonatingRep, setImpersonatingRep] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resolves a Supabase session to a Multi-Tenant Profile by querying the database
  const resolveProfile = async (session: Session | null): Promise<Profile | null> => {
    if (!session?.user?.email) return null;
    const email = session.user.email.toLowerCase();
    
    // Check session age
    const sessionStart = new Date(session.user.last_sign_in_at || session.user.created_at).getTime();
    if (Date.now() - sessionStart > SESSION_MAX_AGE_MS) {
      console.warn('[Auth] Session expired (24h max)');
      supabase.auth.signOut();
      return null;
    }

    try {
      // 1. Check if Super Admin
      const { data: superAdmin } = await supabase.from('super_admins').select('*').eq('email', email).single();
      if (superAdmin) {
        return {
          id: session.user.id,
          email,
          full_name: email.split('@')[0], // Placeholder until we add names to DB
          initials: email.substring(0, 2).toUpperCase(),
          role: 'super_admin',
          avatar_color: '#000000',
          created_at: superAdmin.created_at
        };
      }

      // 2. Check if Workspace User
      const { data: wu } = await supabase.from('workspace_users').select('*').eq('email', email).single();
      if (wu) {
        return {
          id: session.user.id,
          email,
          full_name: email.split('@')[0],
          initials: email.substring(0, 2).toUpperCase(),
          role: wu.role as UserRole,
          workspace_id: wu.workspace_id,
          avatar_color: '#4f46e5',
          created_at: wu.created_at
        };
      }
    } catch (err) {
      console.error('[Auth] Error resolving profile:', err);
    }
    
    return null; // Not authorized
  };

  useEffect(() => {
    if (AUTH_MODE === 'dev') {
      const stored = localStorage.getItem('scc_session');
      if (stored) {
        try { setUser(JSON.parse(stored) as Profile); }
        catch { localStorage.removeItem('scc_session'); }
      }
      const impStored = localStorage.getItem('scc_impersonating');
      if (impStored) {
        try { setImpersonatingRep(JSON.parse(impStored) as Profile); }
        catch { localStorage.removeItem('scc_impersonating'); }
      }
      setIsLoading(false);
      supabase.auth.signOut().catch(() => {});
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const profile = await resolveProfile(session);
        setUser(profile);
        if (profile) {
          localStorage.setItem('scc_workspace_id', profile.workspace_id || '');
        } else {
          localStorage.removeItem('scc_workspace_id');
        }
        
        if (profile?.role === 'super_admin' || profile?.role === 'admin') {
          const impStored = localStorage.getItem('scc_impersonating');
          if (impStored) {
            try { setImpersonatingRep(JSON.parse(impStored) as Profile); }
            catch { localStorage.removeItem('scc_impersonating'); }
          }
        }
      } catch (err) {
        console.error('[Auth] Failed to init session:', err);
      }
      setIsLoading(false);
    };
    
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);
      const profile = await resolveProfile(session);
      setUser(profile);
      if (profile) {
        localStorage.setItem('scc_workspace_id', profile.workspace_id || '');
      } else {
        localStorage.removeItem('scc_workspace_id');
        setImpersonatingRep(null);
        localStorage.removeItem('scc_impersonating');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = isSuperAdmin || user?.role === 'admin';
  const isManager = isAdmin || user?.role === 'manager';
  const isImpersonating = (isSuperAdmin || isAdmin) && impersonatingRep !== null;
  const effectiveUser = isImpersonating ? impersonatingRep : user;

  const login = async (email: string): Promise<{ success: boolean; error?: string; magicLinkSent?: boolean }> => {
    const normalizedEmail = email.toLowerCase().trim();

    if (AUTH_MODE === 'dev') {
      setUser(DEV_SUPER_ADMIN);
      localStorage.setItem('scc_session', JSON.stringify(DEV_SUPER_ADMIN));
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, magicLinkSent: true };
    } catch (err) {
      return { success: false, error: 'Failed to send login link' };
    }
  };

  const logout = async () => {
    logAudit({ user_id: user?.id || 'unknown', user_email: user?.email, action: 'logout' });
    setUser(null);
    setImpersonatingRep(null);
    localStorage.removeItem('scc_session');
    localStorage.removeItem('scc_impersonating');
    if (AUTH_MODE !== 'dev') {
      await supabase.auth.signOut();
    }
  };

  const handleIdleTimeout = useCallback(async () => {
    logAudit({ user_id: user?.id || 'unknown', action: 'session_timeout', metadata: { reason: 'idle_30min' } });
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

  const startImpersonation = (repProfile: Profile) => {
    if (!isAdmin && !isSuperAdmin) return;
    setImpersonatingRep(repProfile);
    localStorage.setItem('scc_impersonating', JSON.stringify(repProfile));
    logAudit({ user_id: user?.id || 'unknown', action: 'impersonate_start', metadata: { rep_email: repProfile.email } });
  };

  const stopImpersonation = () => {
    logAudit({ user_id: user?.id || 'unknown', action: 'impersonate_stop' });
    setImpersonatingRep(null);
    localStorage.removeItem('scc_impersonating');
  };

  return (
    <AuthContext.Provider value={{
      user,
      effectiveUser,
      isManager,
      isAdmin,
      isSuperAdmin,
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
  if (requiredRole && auth.user.role !== requiredRole && auth.user.role !== 'admin' && auth.user.role !== 'super_admin') {
    return { ...auth, authorized: false };
  }
  return { ...auth, authorized: true };
}
