-- Lock down the auth trigger helper and index foreign-key lookup columns.
begin;

revoke all on function public.handle_new_hr_catalyst_user() from public, anon, authenticated;

create index audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index document_versions_created_by_idx on public.document_versions(created_by);
create index document_versions_document_workspace_idx on public.document_versions(document_id, workspace_id);
create index document_versions_workspace_id_idx on public.document_versions(workspace_id);
create index share_links_created_by_idx on public.share_links(created_by);
create index share_links_document_id_idx on public.share_links(document_id);
create index share_links_workspace_id_idx on public.share_links(workspace_id);
create index share_links_version_document_workspace_idx
  on public.share_links(document_version_id, document_id, workspace_id);
create index workspace_members_user_id_idx on public.workspace_members(user_id);

commit;
