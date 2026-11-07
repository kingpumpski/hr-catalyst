create table if not exists public.private_referee_vaults (
  user_id uuid primary key references auth.users(id) on delete cascade,
  salt text not null,
  iv text not null,
  ciphertext text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint private_referee_vaults_payload_size check (
    octet_length(ciphertext) <= 1048576
  )
);

alter table public.private_referee_vaults enable row level security;

drop policy if exists "Owners can read their encrypted referee vault" on public.private_referee_vaults;
create policy "Owners can read their encrypted referee vault"
  on public.private_referee_vaults for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Owners can create their encrypted referee vault" on public.private_referee_vaults;
create policy "Owners can create their encrypted referee vault"
  on public.private_referee_vaults for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can update their encrypted referee vault" on public.private_referee_vaults;
create policy "Owners can update their encrypted referee vault"
  on public.private_referee_vaults for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can delete their encrypted referee vault" on public.private_referee_vaults;
create policy "Owners can delete their encrypted referee vault"
  on public.private_referee_vaults for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.private_referee_vaults from anon;
revoke all on public.private_referee_vaults from public;
grant select, insert, update, delete on public.private_referee_vaults to authenticated;
