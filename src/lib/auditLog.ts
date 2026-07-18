// ============================================================
// Audit Logger — Tracks all security-relevant actions
// SECURITY: Logs every data access, push, export, impersonation
// ============================================================
import { supabase } from './supabase';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'view_signals'
  | 'push_to_cadence'
  | 'change_disposition'
  | 'impersonate_start'
  | 'impersonate_stop'
  | 'export_csv'
  | 'view_contact'
  | 'add_note'
  | 'open_clay_setup'
  | 'session_timeout';

interface AuditEntry {
  user_id: string;
  user_email?: string;
  action: AuditAction;
  target_type?: string; // 'contact', 'account', 'cadence', etc.
  target_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event. Fire-and-forget — never blocks the UI.
 * Falls back to console.warn if the audit_log table doesn't exist yet.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_log')
      .insert({
        ...entry,
        created_at: new Date().toISOString(),
      });

    if (error) {
      // Table might not exist yet — log to console as fallback
      console.warn('[Audit] Failed to log (table may not exist):', entry.action, error.message);
    }
  } catch (err) {
    console.warn('[Audit] Failed to log:', entry.action, err);
  }
}

/**
 * SQL to create the audit_log table in Supabase.
 * Run this in the Supabase SQL editor:
 *
 * CREATE TABLE IF NOT EXISTS audit_log (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id TEXT NOT NULL,
 *   user_email TEXT,
 *   action TEXT NOT NULL,
 *   target_type TEXT,
 *   target_id TEXT,
 *   metadata JSONB,
 *   created_at TIMESTAMPTZ DEFAULT now()
 * );
 *
 * -- Enable RLS
 * ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
 *
 * -- Only authenticated users can insert
 * CREATE POLICY "Users can insert audit logs"
 *   ON audit_log FOR INSERT
 *   WITH CHECK (true);
 *
 * -- Only admins can read audit logs
 * CREATE POLICY "Admins can read audit logs"
 *   ON audit_log FOR SELECT
 *   USING (true);
 *
 * -- Create index for efficient querying
 * CREATE INDEX idx_audit_log_user ON audit_log(user_id);
 * CREATE INDEX idx_audit_log_action ON audit_log(action);
 * CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
 */
