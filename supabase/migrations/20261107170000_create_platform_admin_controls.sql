-- Platform administrators are provisioned out-of-band by a trusted project owner.
-- Browser clients cannot read or mutate this table; all access is mediated by the
-- platform-admin Edge Function using the Supabase service role.
begin;

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_admin_audit (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id) on delete restrict,
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

commit;
