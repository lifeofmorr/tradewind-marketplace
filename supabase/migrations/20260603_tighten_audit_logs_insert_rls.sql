-- Tighten audit_logs INSERT policy.
--
-- The original policy (20260430_security.sql) used `with check (true)`, which let
-- ANY authenticated role insert arbitrary rows into the audit trail — allowing a
-- non-admin to forge "admin action" records and pollute forensics.
--
-- Every caller of logAuditEvent() in the app is an admin-only dashboard surface
-- (src/pages/dashboard/admin/*), so restricting INSERT to admins is safe and does
-- not break any legitimate logging path. The service_role key (used by edge
-- functions / triggers) bypasses RLS entirely and is unaffected.

drop policy if exists "System insert" on public.audit_logs;
create policy "Admin insert" on public.audit_logs
  for insert with check (public.is_admin());
