-- Attach the private generated DOCX artifact to the immutable version.
drop function if exists public.publish_workspace_document(uuid, uuid, jsonb);

create or replace function public.publish_workspace_document(
  p_workspace_id uuid,
  p_document_id uuid,
  p_content_snapshot jsonb,
  p_storage_path text default null
)
returns table(version_id uuid, version_number integer)
language plpgsql
security invoker
set search_path = public, pg_temp
as $publish_workspace_document$
declare
  v_document public.documents%rowtype;
  v_version_number integer;
  v_version_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_storage_path is not null
     and p_storage_path !~ ('^' || p_workspace_id::text || '/' || p_document_id::text || '/[^/]+\.docx$') then
    raise exception 'The private document path is invalid' using errcode = '22023';
  end if;

  select d.* into v_document
    from public.documents as d
   where d.id = p_document_id and d.workspace_id = p_workspace_id
   for update;

  if not found then
    raise exception 'Document not found or access denied' using errcode = '42501';
  end if;

  select coalesce(max(dv.version_number), 0) + 1 into v_version_number
    from public.document_versions as dv
   where dv.document_id = p_document_id and dv.workspace_id = p_workspace_id;

  insert into public.document_versions (
    workspace_id, document_id, version_number, document_type,
    content_snapshot, storage_path, created_by
  )
  values (
    p_workspace_id, p_document_id, v_version_number, v_document.document_type,
    coalesce(p_content_snapshot, '{}'::jsonb), p_storage_path, auth.uid()
  )
  returning id into v_version_id;

  update public.documents
     set status = 'published', updated_at = now()
   where id = p_document_id and workspace_id = p_workspace_id;

  insert into public.audit_logs (
    workspace_id, actor_id, action, target_type, target_id, metadata
  )
  values (
    p_workspace_id, auth.uid(), 'document.published', 'document',
    p_document_id::text,
    jsonb_build_object('version_id', v_version_id, 'version_number', v_version_number, 'storage_path', p_storage_path)
  );

  return query select v_version_id, v_version_number;
end;
$publish_workspace_document$;

revoke all on function public.publish_workspace_document(uuid, uuid, jsonb, text) from public, anon;
grant execute on function public.publish_workspace_document(uuid, uuid, jsonb, text) to authenticated;