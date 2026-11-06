-- The current owner UI uses soft revocation and document archival.
-- Remove destructive browser mutations that have no supported product workflow.
begin;

revoke delete on public.documents, public.profiles, public.share_links, public.workspaces
  from anon, authenticated;

-- Workspace membership administration is not part of this release.
-- Keep the table inaccessible until a separately reviewed member-management
-- workflow and its exact grants/policies are implemented.
revoke all privileges on public.workspace_members
  from anon, authenticated;

-- Profile rows are created by the auth trigger; browser clients may read/update
-- only their own profile, but cannot insert or delete profile records directly.
revoke insert, delete on public.profiles from authenticated;

commit;
