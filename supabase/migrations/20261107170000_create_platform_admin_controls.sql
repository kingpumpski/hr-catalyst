-- Platform administrators are provisioned out-of-band by a trusted project owner.
-- Browser clients cannot read or mutate this table; all access is mediated by the
-- platform-admin Edge Function using the service role.
begin;

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_admin_audit (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (length(trim(action)) between 1 and 80),
  target_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_admin_audit_created_at_idx
  on public.platform_admin_audit(created_at desc);
create index if not exists platform_admin_audit_actor_idx
  on public.platform_admin_audit(actor_id, created_at desc);

alter table public.platform_admins enable row level security;
alter table public.platform_admin_audit enable row level security;

revoke all on public.platform_admins from public, anon, authenticated;
revoke all on public.platform_admin_audit from public, anon, authenticated;
grant all on public.platform_admins to service_role;
grant all on public.platform_admin_audit to service_role;
grant usage, select on sequence public.platform_admin_audit_id_seq to service_role;

-- Serialize administrator removals and write the audit record in the same
-- transaction. This prevents two concurrent administrators from removing
-- each other and leaving the platform with no administrator.
create or replace function public.revoke_platform_admin_safely(
  p_actor_id uuid,
  p_target_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  administrator_count bigint;
  deleted_user_id uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('hr_catalyst_platform_admin_last_admin_guard', 0)
  );

  if not exists (
    select 1 from public.platform_admins
    where user_id = p_target_user_id
  ) then
    return false;
  end if;

  select count(*) into administrator_count
  from public.platform_admins;

  if administrator_count <= 1 then
    return false;
  end if;

  delete from public.platform_admins
  where user_id = p_target_user_id
  returning user_id into deleted_user_id;

  if deleted_user_id is null then
    return false;
  end if;

  insert into public.platform_admin_audit (
    actor_id, action, target_user_id, metadata
  ) values (
    p_actor_id, 'revoke-admin', p_target_user_id, '{}'::jsonb
  );

  return true;
end;
$function$;

revoke all on function public.revoke_platform_admin_safely(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.revoke_platform_admin_safely(uuid, uuid)
  to service_role;

commit;
