// ============================================================
// Role-Based Access Control — Centralized role definitions
// ============================================================
// Derives all maps from the ALLOWED_USERS list in AuthContext.
// This eliminates the previous hardcoded duplication.
// Used by both the frontend (AuthContext) and referenced by the
// Supabase RLS policies (supabase/rbac_policies.sql).
// ============================================================

import type { UserRole } from '../types';

export type AppRole = UserRole; // 'admin' | 'rep' | 'exec' | 'manager'

// ── Canonical user list ──
// Single source of truth: email → { role, profileId }
// AuthContext.tsx reads from its own ALLOWED_USERS (with full Profile objects),
// but this list must stay in sync. We derive all helper maps from here.
const USERS: { email: string; role: AppRole; profileId: string }[] = [
  { email: 'ryan.walker@teamtailor.com', role: 'admin', profileId: 'admin-ryan' },
  { email: 'jack.luther@teamtailor.com', role: 'rep', profileId: 'rep-jl' },
  { email: 'moe.aqel@teamtailor.com', role: 'rep', profileId: 'rep-ma' },
  { email: 'tyler.hanson@teamtailor.com', role: 'rep', profileId: 'rep-th' },
  { email: 'katy.shelman@teamtailor.com', role: 'rep', profileId: 'rep-ks' },
  // ── Exec stakeholders ──
  { email: 'brian.mcgarry@teamtailor.com', role: 'exec', profileId: 'exec-bm' },
  { email: 'daniel.mathisen@teamtailor.com', role: 'exec', profileId: 'exec-dm' },
  { email: 'gordon.french@teamtailor.com', role: 'exec', profileId: 'exec-gf' },
  { email: 'jesper.astrom@teamtailor.com', role: 'exec', profileId: 'exec-ja' },
];

/** Maps every authorized email to their role (derived from USERS) */
const EMAIL_ROLE_MAP: Record<string, AppRole> = Object.fromEntries(
  USERS.map(u => [u.email, u.role])
);

/** All admin emails — used by RLS helper functions in Supabase */
export const ADMIN_EMAILS: readonly string[] = USERS
  .filter(u => u.role === 'admin')
  .map(u => u.email);

/** All rep emails */
export const REP_EMAILS: readonly string[] = USERS
  .filter(u => u.role === 'rep')
  .map(u => u.email);

/** All authorized emails (admin + reps + exec) */
export const ALL_TEAM_EMAILS: readonly string[] = USERS.map(u => u.email);

/**
 * Maps email → profile ID used in the database.
 * Derived from USERS — always in sync with AuthContext's ALLOWED_USERS.
 */
export const EMAIL_TO_PROFILE_ID: Record<string, string> = Object.fromEntries(
  USERS.map(u => [u.email, u.profileId])
);

// ── Public API ──────────────────────────────────────────────

/**
 * Check if the given email belongs to an admin.
 * @param email - The user's email (case-insensitive)
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return EMAIL_ROLE_MAP[email.toLowerCase().trim()] === 'admin';
}

/**
 * Check if the given email belongs to any team member (admin, rep, or exec).
 * @param email - The user's email (case-insensitive)
 */
export function isTeamMember(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() in EMAIL_ROLE_MAP;
}

/**
 * Get the role for a given email. Returns undefined if not authorized.
 * @param email - The user's email (case-insensitive)
 */
export function getUserRole(email: string | null | undefined): AppRole | undefined {
  if (!email) return undefined;
  return EMAIL_ROLE_MAP[email.toLowerCase().trim()];
}

/**
 * Get the profile ID for a given email. Returns undefined if not authorized.
 * @param email - The user's email (case-insensitive)
 */
export function getProfileId(email: string | null | undefined): string | undefined {
  if (!email) return undefined;
  return EMAIL_TO_PROFILE_ID[email.toLowerCase().trim()];
}
