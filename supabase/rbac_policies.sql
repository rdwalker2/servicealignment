-- ═══════════════════════════════════════════════════════════════════
-- RBAC Policies for Sales Command Center
-- ═══════════════════════════════════════════════════════════════════
-- Replaces ALL permissive USING(true) policies with proper role-based
-- access control using auth.jwt() ->> 'email'.
--
-- ROLES:
--   admin  → ryan.walker@teamtailor.com (full CRUD on all tables)
--   rep    → jack.luther@teamtailor.com, moe.aqel@teamtailor.com,
--            tyler.hanson@teamtailor.com (scoped per table)
--
-- SAFE TO RUN MULTIPLE TIMES — uses DROP POLICY IF EXISTS.
-- ═══════════════════════════════════════════════════════════════════


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  HELPER FUNCTION: Check if the current JWT email is an admin     ║
-- ╚═══════════════════════════════════════════════════════════════════╝
-- We wrap the admin check in a function so policies stay DRY and
-- adding future admins only requires changing one place.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'email' = 'ryan.walker@teamtailor.com',
    false
  );
$$;

-- Helper: check if the current user is any whitelisted team member
CREATE OR REPLACE FUNCTION public.is_team_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'email' IN (
      'ryan.walker@teamtailor.com',
      'jack.luther@teamtailor.com',
      'moe.aqel@teamtailor.com',
      'tyler.hanson@teamtailor.com'
    ),
    false
  );
$$;

-- Helper: get the current user's email from the JWT
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT auth.jwt() ->> 'email';
$$;


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  TABLE 1: customers (10,618 records)                             ║
-- ║  Admin: full CRUD | Rep: read-only                               ║
-- ╚═══════════════════════════════════════════════════════════════════╝

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Authenticated users can read" ON customers;
DROP POLICY IF EXISTS "customers_select_all" ON customers;
DROP POLICY IF EXISTS "customers_insert_admin" ON customers;
DROP POLICY IF EXISTS "customers_update_admin" ON customers;
DROP POLICY IF EXISTS "customers_delete_admin" ON customers;

-- All team members can read
CREATE POLICY "customers_select_all"
  ON customers FOR SELECT
  TO authenticated
  USING (public.is_team_member());

-- Only admin can insert
CREATE POLICY "customers_insert_admin"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admin can update
CREATE POLICY "customers_update_admin"
  ON customers FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Only admin can delete
CREATE POLICY "customers_delete_admin"
  ON customers FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  TABLE 2: audit_log                                              ║
-- ║  Admin: read | All team: insert-only | No update/delete          ║
-- ╚═══════════════════════════════════════════════════════════════════╝

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow insert" ON audit_log;
DROP POLICY IF EXISTS "Allow read" ON audit_log;
DROP POLICY IF EXISTS "audit_log_insert_team" ON audit_log;
DROP POLICY IF EXISTS "audit_log_select_admin" ON audit_log;

-- Any team member can insert audit entries (fire-and-forget logging)
CREATE POLICY "audit_log_insert_team"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_member());

-- Only admin can read audit logs (security trail)
CREATE POLICY "audit_log_select_admin"
  ON audit_log FOR SELECT
  TO authenticated
  USING (public.is_admin());


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  TABLE 3: account_notes                                          ║
-- ║  Admin: full CRUD | Rep: read all, insert/update/delete own      ║
-- ╚═══════════════════════════════════════════════════════════════════╝

ALTER TABLE account_notes ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all for authenticated" ON account_notes;
DROP POLICY IF EXISTS "anon_read_notes" ON account_notes;
DROP POLICY IF EXISTS "anon_write_notes" ON account_notes;
DROP POLICY IF EXISTS "account_notes_select_team" ON account_notes;
DROP POLICY IF EXISTS "account_notes_insert_team" ON account_notes;
DROP POLICY IF EXISTS "account_notes_update_own_or_admin" ON account_notes;
DROP POLICY IF EXISTS "account_notes_delete_own_or_admin" ON account_notes;

-- All team members can read all notes (collaboration)
CREATE POLICY "account_notes_select_team"
  ON account_notes FOR SELECT
  TO authenticated
  USING (public.is_team_member());

-- All team members can insert notes
CREATE POLICY "account_notes_insert_team"
  ON account_notes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_member());

-- Reps can update only their own notes; admin can update any
-- author_id stores the rep profile ID (e.g., 'rep-jl')
-- We also check against the email-to-id mapping
CREATE POLICY "account_notes_update_own_or_admin"
  ON account_notes FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR (
      public.is_team_member()
      AND author_id = CASE public.current_user_email()
        WHEN 'jack.luther@teamtailor.com'  THEN 'rep-jl'
        WHEN 'moe.aqel@teamtailor.com'     THEN 'rep-ma'
        WHEN 'tyler.hanson@teamtailor.com'  THEN 'rep-th'
        ELSE NULL
      END
    )
  );

-- Reps can delete only their own notes; admin can delete any
CREATE POLICY "account_notes_delete_own_or_admin"
  ON account_notes FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    OR (
      public.is_team_member()
      AND author_id = CASE public.current_user_email()
        WHEN 'jack.luther@teamtailor.com'  THEN 'rep-jl'
        WHEN 'moe.aqel@teamtailor.com'     THEN 'rep-ma'
        WHEN 'tyler.hanson@teamtailor.com'  THEN 'rep-th'
        ELSE NULL
      END
    )
  );


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  TABLE 4: clay_signals                                           ║
-- ║  Admin: full CRUD | Rep: read-only                               ║
-- ║  service_role: insert (Clay webhook — bypasses RLS by default)   ║
-- ╚═══════════════════════════════════════════════════════════════════╝

ALTER TABLE clay_signals ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow read for authenticated users" ON clay_signals;
DROP POLICY IF EXISTS "Allow insert for anon (Clay webhook)" ON clay_signals;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON clay_signals;
DROP POLICY IF EXISTS "anon_read_signals" ON clay_signals;
DROP POLICY IF EXISTS "anon_write_signals" ON clay_signals;
DROP POLICY IF EXISTS "service_write_signals" ON clay_signals;
DROP POLICY IF EXISTS "clay_signals_select_team" ON clay_signals;
DROP POLICY IF EXISTS "clay_signals_insert_admin" ON clay_signals;
DROP POLICY IF EXISTS "clay_signals_insert_service" ON clay_signals;
DROP POLICY IF EXISTS "clay_signals_update_admin" ON clay_signals;
DROP POLICY IF EXISTS "clay_signals_delete_admin" ON clay_signals;

-- All team members can read signals
CREATE POLICY "clay_signals_select_team"
  ON clay_signals FOR SELECT
  TO authenticated
  USING (public.is_team_member());

-- Admin can insert signals (seed data, manual adds)
CREATE POLICY "clay_signals_insert_admin"
  ON clay_signals FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- service_role can insert signals (Clay webhook)
-- Note: service_role bypasses RLS by default, but this is explicit
CREATE POLICY "clay_signals_insert_service"
  ON clay_signals FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only admin can update signals
CREATE POLICY "clay_signals_update_admin"
  ON clay_signals FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Only admin can delete signals
CREATE POLICY "clay_signals_delete_admin"
  ON clay_signals FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  TABLE 5: dispositions                                           ║
-- ║  Admin: full CRUD | Rep: read + insert + update (own changes)    ║
-- ╚═══════════════════════════════════════════════════════════════════╝

ALTER TABLE dispositions ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all for authenticated" ON dispositions;
DROP POLICY IF EXISTS "anon_read_dispositions" ON dispositions;
DROP POLICY IF EXISTS "anon_write_dispositions" ON dispositions;
DROP POLICY IF EXISTS "anon_update_dispositions" ON dispositions;
DROP POLICY IF EXISTS "dispositions_select_team" ON dispositions;
DROP POLICY IF EXISTS "dispositions_insert_team" ON dispositions;
DROP POLICY IF EXISTS "dispositions_update_team" ON dispositions;
DROP POLICY IF EXISTS "dispositions_delete_admin" ON dispositions;

-- All team members can read
CREATE POLICY "dispositions_select_team"
  ON dispositions FOR SELECT
  TO authenticated
  USING (public.is_team_member());

-- All team members can insert dispositions
CREATE POLICY "dispositions_insert_team"
  ON dispositions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_member());

-- All team members can update dispositions (reps track their own progress)
CREATE POLICY "dispositions_update_team"
  ON dispositions FOR UPDATE
  TO authenticated
  USING (public.is_team_member());

-- Only admin can delete dispositions
CREATE POLICY "dispositions_delete_admin"
  ON dispositions FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  TABLE 6: push_events                                            ║
-- ║  Admin: full CRUD | Rep: read + insert                           ║
-- ╚═══════════════════════════════════════════════════════════════════╝

ALTER TABLE push_events ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all for authenticated" ON push_events;
DROP POLICY IF EXISTS "anon_read_push_events" ON push_events;
DROP POLICY IF EXISTS "anon_write_push_events" ON push_events;
DROP POLICY IF EXISTS "push_events_select_team" ON push_events;
DROP POLICY IF EXISTS "push_events_insert_team" ON push_events;
DROP POLICY IF EXISTS "push_events_update_admin" ON push_events;
DROP POLICY IF EXISTS "push_events_delete_admin" ON push_events;

-- All team members can read push events
CREATE POLICY "push_events_select_team"
  ON push_events FOR SELECT
  TO authenticated
  USING (public.is_team_member());

-- All team members can log pushes
CREATE POLICY "push_events_insert_team"
  ON push_events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_member());

-- Only admin can update push events
CREATE POLICY "push_events_update_admin"
  ON push_events FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Only admin can delete push events
CREATE POLICY "push_events_delete_admin"
  ON push_events FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  TABLE 7: scc_sync_store (if it exists)                          ║
-- ║  Admin: full CRUD | Rep: read + upsert                           ║
-- ╚═══════════════════════════════════════════════════════════════════╝

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scc_sync_store') THEN
    -- Enable RLS
    EXECUTE 'ALTER TABLE scc_sync_store ENABLE ROW LEVEL SECURITY';

    -- Drop old policies
    EXECUTE 'DROP POLICY IF EXISTS "scc_sync_store_select_team" ON scc_sync_store';
    EXECUTE 'DROP POLICY IF EXISTS "scc_sync_store_insert_team" ON scc_sync_store';
    EXECUTE 'DROP POLICY IF EXISTS "scc_sync_store_update_team" ON scc_sync_store';
    EXECUTE 'DROP POLICY IF EXISTS "scc_sync_store_delete_admin" ON scc_sync_store';

    -- All team members can read
    EXECUTE 'CREATE POLICY "scc_sync_store_select_team" ON scc_sync_store FOR SELECT TO authenticated USING (public.is_team_member())';
    EXECUTE 'CREATE POLICY "scc_sync_store_insert_team" ON scc_sync_store FOR INSERT TO authenticated WITH CHECK (public.is_team_member())';
    EXECUTE 'CREATE POLICY "scc_sync_store_update_team" ON scc_sync_store FOR UPDATE TO authenticated USING (public.is_team_member())';
    EXECUTE 'CREATE POLICY "scc_sync_store_delete_admin" ON scc_sync_store FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;
END $$;


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  REVOKE anon ACCESS                                              ║
-- ║  No table should be accessible via the anon role anymore.        ║
-- ║  The app uses authenticated Supabase Auth sessions.              ║
-- ╚═══════════════════════════════════════════════════════════════════╝

-- Remove any remaining anon policies that may exist on these tables
-- (The DROP POLICY IF EXISTS calls above should have handled them,
--  but this ensures no stragglers from ad-hoc SQL editor runs.)

-- Revoke direct table-level grants from anon (belt + suspenders)
REVOKE ALL ON customers FROM anon;
REVOKE ALL ON audit_log FROM anon;
REVOKE ALL ON account_notes FROM anon;
REVOKE ALL ON clay_signals FROM anon;
REVOKE ALL ON dispositions FROM anon;
REVOKE ALL ON push_events FROM anon;


-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  VERIFY: Check RLS is enabled and policies are in place          ║
-- ╚═══════════════════════════════════════════════════════════════════╝

SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'customers',
    'audit_log',
    'account_notes',
    'clay_signals',
    'dispositions',
    'push_events',
    'scc_sync_store'
  )
ORDER BY tablename;

-- List all policies for verification
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'customers',
    'audit_log',
    'account_notes',
    'clay_signals',
    'dispositions',
    'push_events',
    'scc_sync_store'
  )
ORDER BY tablename, policyname;
