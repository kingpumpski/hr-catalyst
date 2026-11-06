-- Correct owner-scoped private Storage policies.
-- Qualify storage.objects.name explicitly; the previous policy accidentally
-- extracted a folder from workspaces.name instead of the object path.
drop policy if exists hr_catalyst_storage_owner_insert on storage.objects;
drop policy if exists hr_catalyst_storage_owner_read on storage.objects;
drop policy if exists hr_catalyst_storage_owner_update on storage.objects;
drop policy if exists hr_catalyst_storage_owner_delete on storage.objects;

create policy hr_catalyst_storage_owner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'hr-catalyst-private'
  and exists (
    select 1 from public.workspaces as w
     where w.id::text = (storage.foldername(storage.objects.name))[1]
       and w.owner_id = (select auth.uid())
  )
);

create policy hr_catalyst_storage_owner_read
on storage.objects
for select
to authenticated
using (
  bucket_id = 'hr-catalyst-private'
  and exists (
    select 1 from public.workspaces as w
     where w.id::text = (storage.foldername(storage.objects.name))[1]
       and w.owner_id = (select auth.uid())
  )
);

create policy hr_catalyst_storage_owner_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'hr-catalyst-private'
  and exists (
    select 1 from public.workspaces as w
     where w.id::text = (storage.foldername(storage.objects.name))[1]
       and w.owner_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'hr-catalyst-private'
  and exists (
    select 1 from public.workspaces as w
     where w.id::text = (storage.foldername(storage.objects.name))[1]
       and w.owner_id = (select auth.uid())
  )
);

create policy hr_catalyst_storage_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'hr-catalyst-private'
  and exists (
    select 1 from public.workspaces as w
     where w.id::text = (storage.foldername(storage.objects.name))[1]
       and w.owner_id = (select auth.uid())
  )
);