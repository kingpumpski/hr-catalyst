-- Enforce that document versions cannot cross workspace boundaries.
begin;
alter table public.documents
  add constraint documents_id_workspace_unique unique (id, workspace_id);
alter table public.document_versions
  add constraint document_versions_document_workspace_fkey
  foreign key (document_id, workspace_id)
  references public.documents (id, workspace_id)
  on delete cascade;
commit;
