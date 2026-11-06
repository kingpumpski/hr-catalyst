-- HR Catalyst dedicated workspace, document and sharing foundation.
-- Apply only to the isolated HR Catalyst Supabase project.
begin;

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'My HR Catalyst workspace',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email text,
  role text not null default 'viewer' check (role in ('recruiter', 'viewer')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint workspace_member_identity check (user_id is not null or invited_email is not null),
  constraint workspace_member_email_normalized check (invited_email is null or invited_email = lower(trim(invited_email)))
);

create unique index workspace_members_user_unique
  on public.workspace_members(workspace_id, user_id) where user_id is not null;
create unique index workspace_members_email_unique
  on public.workspace_members(workspace_id, invited_email) where invited_email is not null;

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  slug text not null,
  title text not null,
  document_type text not null check (document_type in ('cv', 'resume', 'cover_letter', 'other')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, slug)
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  document_type text not null check (document_type in ('cv', 'resume', 'cover_letter', 'other')),
  content_snapshot jsonb not null,
  storage_path text,
  published_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  unique(document_id, version_number),
  unique(id, document_id, workspace_id)
);

create table public.share_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  document_version_id uuid not null,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  invited_email text,
  allow_download boolean not null default false,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint share_version_matches_document
    foreign key (document_version_id, document_id, workspace_id)
    references public.document_versions(id, document_id, workspace_id) on delete cascade,
  constraint share_email_normalized check (invited_email is null or invited_email = lower(trim(invited_email)))
);

create index share_links_active_lookup on public.share_links(token_hash)
  where revoked_at is null;
create index documents_workspace_updated on public.documents(workspace_id, updated_at desc);
create index document_versions_document on public.document_versions(document_id, version_number desc);
create index workspace_members_workspace on public.workspace_members(workspace_id);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (length(trim(action)) between 1 and 100),
  target_type text not null check (length(trim(target_type)) between 1 and 80),
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_workspace_created on public.audit_logs(workspace_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_hr_catalyst_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_hr_catalyst
  after insert on auth.users
  for each row execute function public.handle_new_hr_catalyst_user();

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger workspaces_set_updated_at before update on public.workspaces
  for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.share_links enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_self" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "workspaces_owner_select" on public.workspaces
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "workspaces_owner_insert" on public.workspaces
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "workspaces_owner_update" on public.workspaces
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "workspaces_owner_delete" on public.workspaces
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy "workspace_members_owner_manage" on public.workspace_members
  for all to authenticated
  using (exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id and w.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id and w.owner_id = (select auth.uid())
  ));

create policy "documents_owner_manage" on public.documents
  for all to authenticated
  using (exists (
    select 1 from public.workspaces w
    where w.id = documents.workspace_id and w.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.workspaces w
    where w.id = documents.workspace_id and w.owner_id = (select auth.uid())
  ));

create policy "document_versions_owner_read" on public.document_versions
  for select to authenticated using (exists (
    select 1 from public.workspaces w
    where w.id = document_versions.workspace_id and w.owner_id = (select auth.uid())
  ));
create policy "document_versions_owner_insert" on public.document_versions
  for insert to authenticated with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.workspaces w
      where w.id = document_versions.workspace_id and w.owner_id = (select auth.uid())
    )
  );

create policy "share_links_owner_manage" on public.share_links
  for all to authenticated
  using (exists (
    select 1 from public.workspaces w
    where w.id = share_links.workspace_id and w.owner_id = (select auth.uid())
  ))
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.workspaces w
      where w.id = share_links.workspace_id and w.owner_id = (select auth.uid())
    )
  );

create policy "audit_logs_owner_read" on public.audit_logs
  for select to authenticated using (exists (
    select 1 from public.workspaces w
    where w.id = audit_logs.workspace_id and w.owner_id = (select auth.uid())
  ));
create policy "audit_logs_owner_insert" on public.audit_logs
  for insert to authenticated with check (
    actor_id = (select auth.uid())
    and exists (
      select 1 from public.workspaces w
      where w.id = audit_logs.workspace_id and w.owner_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hr-catalyst-private',
  'hr-catalyst-private',
  false,
  10485760,
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "hr_catalyst_storage_owner_read" on storage.objects
  for select to authenticated using (
    bucket_id = 'hr-catalyst-private'
    and exists (
      select 1 from public.workspaces w
      where w.id::text = (storage.foldername(name))[1]
        and w.owner_id = (select auth.uid())
    )
  );
create policy "hr_catalyst_storage_owner_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'hr-catalyst-private'
    and exists (
      select 1 from public.workspaces w
      where w.id::text = (storage.foldername(name))[1]
        and w.owner_id = (select auth.uid())
    )
  );
create policy "hr_catalyst_storage_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'hr-catalyst-private'
    and exists (
      select 1 from public.workspaces w
      where w.id::text = (storage.foldername(name))[1]
        and w.owner_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'hr-catalyst-private'
    and exists (
      select 1 from public.workspaces w
      where w.id::text = (storage.foldername(name))[1]
        and w.owner_id = (select auth.uid())
    )
  );
create policy "hr_catalyst_storage_owner_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'hr-catalyst-private'
    and exists (
      select 1 from public.workspaces w
      where w.id::text = (storage.foldername(name))[1]
        and w.owner_id = (select auth.uid())
    )
  );

commit;
