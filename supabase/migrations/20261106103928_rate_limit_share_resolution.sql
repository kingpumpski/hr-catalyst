-- Add a token-scoped resolver throttle without persisting raw tokens or IP addresses.
begin;

create table public.share_resolution_attempts (
  id bigint generated always as identity primary key,
  token_hash text not null check (token_hash ~ '^[a-f0-9]{64}$'),
  attempted_at timestamptz not null default now()
);
create index share_resolution_attempts_token_time
  on public.share_resolution_attempts(token_hash, attempted_at desc);
alter table public.share_resolution_attempts enable row level security;

create or replace function public.allow_share_resolution(p_token_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_attempts integer;
begin
  if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_token_hash, 0));

  select count(*)::integer
    into recent_attempts
    from public.share_resolution_attempts
   where token_hash = p_token_hash
     and attempted_at > now() - interval '1 minute';

  if recent_attempts >= 30 then
    return false;
  end if;

  insert into public.share_resolution_attempts(token_hash) values (p_token_hash);

  delete from public.share_resolution_attempts
   where attempted_at < now() - interval '1 day';

  return true;
end;
$$;

revoke all on function public.allow_share_resolution(text) from public, anon, authenticated;
grant execute on function public.allow_share_resolution(text) to service_role;

commit;
