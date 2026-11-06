-- Publish a document version, change its status, and record the audit event
-- in one transaction. SECURITY INVOKER deliberately preserves caller RLS.
create or replace function public.publish_workspace_document(
  p_workspace_id uuid,
  p_document_id uuid,
  p_content_snapshot jsonb
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

  -- The row lock serializes concurrent publishes for the same document.
  -- RLS applies to this SELECT because the function is SECURITY INVOKER.
  select d.*
    into v_document
    from public.documents as d
   where d.id = p_document_id
     and d.workspace_id = p_workspace_id
   for update;

  if not found then
    raise exception 'Document not found or access denied' using errcode = '42501';
  end if;

  select coalesce(max(dv.version_number), 0) + 1
    into v_version_number
    from public.document_versions as dv
   where dv.document_id = p_document_id
     and dv.workspace_id = p_workspace_id;

  insert into public.document_versions (
    workspace_id,
    document_id,
    version_number,
    document_type,
    content_snapshot,
    created_by
  )
  values (
    p_workspace_id,
    p_document_id,
    v_version_number,
    v_document.document_type,
    coalesce(p_content_snapshot, '{}'::jsonb),
    auth.uid()
  )
  returning id into v_version_id;

  update public.documents
     set status = 'published',
         updated_at = now()
   where id = p_document_id
     and workspace_id = p_workspace_id;

  insert into public.audit_logs (
    workspace_id,
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    p_workspace_id,
    auth.uid(),
    'document.published',
    'document',
    p_document_id::text,
    jsonb_build_object(
      'version_id', v_version_id,
      'version_number', v_version_number
    )
  );

  return query select v_version_id, v_version_number;
end;
$publish_workspace_document$;

revoke all on function public.publish_workspace_document(uuid, uuid, jsonb) from public, anon;
grant execute on function public.publish_workspace_document(uuid, uuid, jsonb) to authenticated;
