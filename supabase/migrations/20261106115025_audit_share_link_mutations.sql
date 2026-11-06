-- Keep recruiter share lifecycle actions auditable in the same transaction.
create or replace function public.audit_share_link_mutations()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $audit_share_link_mutations$
declare
  v_action text;
  v_metadata jsonb;
begin
  if tg_op = 'INSERT' then
    v_action := 'share.created';
    v_metadata := jsonb_build_object(
      'allow_download', new.allow_download,
      'expires_at', new.expires_at
    );
  elsif old.revoked_at is null and new.revoked_at is not null then
    v_action := 'share.revoked';
    v_metadata := jsonb_build_object('revoked_at', new.revoked_at);
  else
    v_action := 'share.updated';
    v_metadata := jsonb_build_object(
      'allow_download', new.allow_download,
      'expires_at', new.expires_at
    );
  end if;

  insert into public.audit_logs (
    workspace_id, actor_id, action, target_type, target_id, metadata
  )
  values (
    new.workspace_id, (select auth.uid()), v_action, 'share_link',
    new.id::text, v_metadata
  );

  return new;
end;
$audit_share_link_mutations$;

revoke all on function public.audit_share_link_mutations() from public, anon;
grant execute on function public.audit_share_link_mutations() to authenticated;

drop trigger if exists audit_share_link_mutations on public.share_links;
create trigger audit_share_link_mutations
after insert or update on public.share_links
for each row
execute function public.audit_share_link_mutations();