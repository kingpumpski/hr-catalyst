-- Make the service-role-only rate-limit table explicitly deny browser roles.
begin;
create policy "share_resolution_attempts_deny_client_access"
  on public.share_resolution_attempts
  for all to anon, authenticated
  using (false)
  with check (false);
commit;
