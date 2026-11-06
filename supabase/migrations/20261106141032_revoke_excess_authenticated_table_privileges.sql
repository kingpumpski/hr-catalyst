-- Prevent browser roles from using privileges that bypass row-level security.
-- RLS protects row operations; TRUNCATE, REFERENCES and TRIGGER are table-level
-- privileges and must not be inherited by authenticated browser clients.
begin;

revoke truncate, references, trigger
  on all tables in schema public
  from authenticated;

revoke update, delete
  on public.audit_logs, public.document_versions
  from authenticated;

-- The resolver rate-limit table is only accessed by its SECURITY DEFINER helper.
revoke all privileges
  on public.share_resolution_attempts
  from anon, authenticated;

-- Keep future public tables closed unless a migration grants the exact required
-- browser privileges explicitly.
alter default privileges in schema public
  revoke all privileges on tables from anon, authenticated;
alter default privileges in schema public
  revoke all privileges on sequences from anon, authenticated;
alter default privileges in schema public
  revoke truncate, references, trigger on tables from authenticated;

commit;
