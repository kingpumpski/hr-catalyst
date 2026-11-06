-- Revoke anonymous table and sequence privileges in addition to RLS.
-- Keep future public-schema tables closed to anonymous clients.
begin;

revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;

alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

commit;
