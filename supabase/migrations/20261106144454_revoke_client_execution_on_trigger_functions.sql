-- Trigger functions are invoked by PostgreSQL triggers, not by browser RPC calls.
-- Remove direct execution grants and make future public-schema functions opt-in.
begin;

revoke all on function public.set_updated_at()
  from public, anon, authenticated;

revoke all on function public.audit_share_link_mutations()
  from public, anon, authenticated;

alter default privileges in schema public
  revoke execute on functions from public, anon, authenticated;

commit;
