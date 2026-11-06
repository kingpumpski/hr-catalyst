# HR Catalyst account access and document sharing

## Product decision

HR Catalyst will launch with two roles:

- **Owner:** owns a private workspace and has full control over its profile, CV/resume content, document settings, sharing links, and workspace members.
- **Recruiter / Viewer:** has read-only access to the specific document and fields the owner explicitly shares. The recruiter can download only the selected CV or resume when downloading is enabled.

A future **Collaborator** role may be added with narrowly scoped editing rights. It is not part of the first release.

## Required user journeys

1. An owner registers or signs in and enters a private workspace.
2. The owner creates or edits CVs and resumes; edits are saved to the owner's account rather than only the current browser.
3. The owner chooses a document type, visibility, download permission, optional invited email restriction, and optional expiry.
4. HR Catalyst creates a high-entropy, revocable share token. Store only a cryptographic hash of the token in the database.
5. A recruiter opens the link and sees only the approved document. No owner dashboard, editor, account details, other documents, or private metadata are exposed.
6. The owner can revoke the link, change expiry, or disable downloads. Revocation must take effect on the next access request.
7. Important actions (sign-in, document edits, share creation/revocation, downloads, member changes) are auditable.

## Proposed authorization model

- Use Supabase Auth for identity and PostgreSQL Row Level Security for data authorization.
- A workspace has one immutable owner identity for the first release.
- Membership roles are stored in a protected database table, not user-editable Auth metadata.
- Owner write policies must check both the authenticated user ID and workspace ownership.
- Recruiter access is mediated by a narrow server-side/Edge Function share-token resolver. Do not grant anonymous SELECT on private workspace/document tables.
- Never expose the Supabase service-role or secret key in browser code.
- Store files in a private Storage bucket. Only issue short-lived signed download URLs after validating the share token, expiry, revocation and download permission.
- Do not put document contents, private IDs, email addresses or long-lived storage URLs in share URLs.
- Rate-limit share-token resolution and record download events without logging the raw token.

## Initial data model

- `profiles`: user-facing account profile linked to `auth.users`.
- `workspaces`: owner-controlled workspace.
- `workspace_members`: role assignments and invitations; owner role is not self-assignable.
- `documents`: structured CV/resume content, type, version, owner workspace and status.
- `document_versions`: immutable published snapshots used for stable recruiter downloads.
- `share_links`: token hash, document version, document type, expiry, revoked timestamp, download permission and optional invited email.
- `audit_logs`: actor, workspace, action, target, timestamp and safe metadata.

Every table in an exposed schema must have RLS enabled and explicit least-privilege policies. UPDATE policies need both USING and WITH CHECK. Avoid SECURITY DEFINER functions unless there is a documented need and explicit authorization checks.

## Release phases

1. Provision a dedicated HR Catalyst Supabase project and configure Auth redirect URLs and email delivery.
2. Add schema migrations, RLS policies, private Storage policies and share-token Edge Function.
3. Add sign-in, sign-up, recovery, session handling and owner workspace routes.
4. Migrate existing browser-local CV data into the authenticated owner's workspace with an explicit import/reconciliation step; never silently overwrite existing owner content.
5. Add recruiter share pages and controlled downloads.
6. Add owner account, membership and share-link management.
7. Run cross-role authorization tests, anonymous-access tests, token expiry/revocation tests, storage-policy tests and end-to-end browser tests before release.

## Deployment and data freshness safeguards

- Treat GitHub `main` as the source of truth for the static site deployment.
- A code change is not considered live until the exact main-branch SHA has a successful Pages build and deployment.
- Add build metadata (commit SHA and build timestamp) to the app so support can identify which revision a browser has loaded.
- Use source snapshots when persisting editable CV data. If source data changes, refresh fields that still match the previous source snapshot while preserving user-edited fields.
- Version browser storage schemas and migrate legacy data rather than allowing stale localStorage values to mask updated repository data.
- Verify the published site and its asset hashes after deployment; instruct users to hard-refresh only after deployment is confirmed.

## Infrastructure boundary

The connected Supabase account currently exposes a project named `harmony-health-hub` under the `Bredas Health` organization. That project is associated with a different product and must not be reused for HR Catalyst without an explicit decision. HR Catalyst should have its own isolated project, keys, database and storage bucket. Project creation may incur charges and requires the owner to select the organization and approve any quoted non-zero cost.


## Dedicated Supabase project provisioned

The isolated HR Catalyst project has been provisioned in the approved Supabase organization `pumpski6-9376's projects`:

- Project: `hr-catalyst`
- Project ref: `qmxpswxwdrjotidclmcz`
- Region: `eu-west-1` (Ireland)
- API origin: `https://qmxpswxwdrjotidclmcz.supabase.co`
- Storage bucket: `hr-catalyst-private` (private; PDF and DOCX only; 10 MiB per object)
- Edge Function: `resolve-share` (deployed, version 3; JWT verification is disabled at the gateway because the function validates the share token itself and requires a verified Supabase user for email-restricted shares).

The project was created at the quoted $0/month project cost. It is isolated from the Harmony Health Hub Supabase project and its Vercel integration.

### Applied database migrations

The following migrations are applied to the new project and stored under the matching remote migration versions in this repository:

1. `20261106103439_hr_catalyst_workspace_security.sql`
   - Profiles, owner workspaces, recruiter/viewer invitations, structured documents, immutable document versions, hashed share links and audit logs.
   - RLS enabled on all seven public tables.
   - Owner-only data policies; no anonymous table read policies.
   - Private Storage bucket and owner-scoped object policies.
   - Auth user profile creation trigger.
2. `20261106103540_enforce_document_workspace_integrity.sql`
   - Composite foreign key prevents a document version from being attached to a different workspace's document.
3. `20261106103724_lock_down_trigger_and_index_foreign_keys.sql`
   - Revokes direct API execution of the SECURITY DEFINER auth trigger helper while preserving trigger invocation.
   - Adds indexes covering foreign-key columns to avoid unnecessary delete/update scans.
4. `20261106103928_rate_limit_share_resolution.sql`
   - Adds a token-hash-only, transaction-locked throttle that limits a valid share link to 30 resolver attempts per minute; only the service role can call the throttle RPC.
5. `20261106104016_deny_client_rate_limit_access.sql`
   - Adds an explicit deny-all RLS policy for browser roles on the service-role-only throttle table.

### Share resolver contract

`POST /functions/v1/resolve-share` accepts a raw high-entropy share token and hashes it with SHA-256 before lookup. It rejects missing, revoked and expired links, returns only the published immutable document snapshot, enforces verified account identity for email-restricted links, and issues a 60-second signed Storage URL only when downloading is enabled and a file has been published. Responses use `Cache-Control: no-store`. The raw share token is never stored.

### Runtime configuration

Vercel project `hr-catalyst` has these public build-time variables configured for Production, Preview and Development:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Only the publishable key is exposed to the browser. The Supabase service-role key remains server-side and is not configured as a Vite variable.

### Remaining release work

- Install and lock `@supabase/supabase-js` through a normal npm lockfile update before importing it in application code.
- Implement sign-up, sign-in, password recovery, session handling and owner workspace UI.
- Add owner-side document publishing, share creation (cryptographically random token generation and hash-only persistence), revocation and audit events.
- Wire the recruiter share route to the deployed resolver.
- Add integration tests for RLS isolation, email-restricted shares, expiry/revocation, download disabled/enabled, and signed URL expiry.
- Configure Auth site URL and redirect allow-list for the production Vercel and GitHub Pages origins, and configure production email delivery.
- Verify the live UX with browser tests before marking the owner/recruiter release gate complete.

Do not use the dormant `supabase-cinnabar-clock` project until its ownership and data purpose are established. Do not modify the Harmony Health Hub project.


## Recruiter share viewer integration (in progress)

The recruiter route now treats every share URL as a bearer-token-protected resource. It does not render the public CV catalogue as a substitute for a published private document.

- The browser sends the raw high-entropy token only to `POST /functions/v1/resolve-share`; it never queries private workspace tables directly.
- Share URLs place the token in the URL fragment (`#token=...`), not the query string. The fragment is not sent in HTTP requests or referrer headers. The viewer removes the fragment from the visible address bar after reading it and retains the token only in tab-scoped session storage for refresh support.
- The resolver response is validated before rendering. Download URLs are accepted only when they use HTTPS and the configured HR Catalyst Supabase host.
- The recruiter viewer honours the server's download permission: it only offers print/download controls when the resolver authorizes downloading.
- CV/resume snapshots use the structured editable-CV document renderer. Cover-letter snapshots use the published opening/body/closing structure. Unknown snapshot shapes fail closed with a support message.
- Resolver client tests cover token entropy/hash generation, fragment-based URLs, no-store requests, canonical 64-character lowercase hexadecimal token validation, invalid/revoked tokens and signed-download host validation.

This is the recruiter-side resolver integration only. It does **not** complete owner authentication, document publishing, share-link creation/revocation UI, invited-recipient sign-in, or end-to-end authorization testing. Those remain release blockers until the owner workflow is connected to the authenticated Supabase workspace.


## Implementation status — 6 November 2026

The following items supersede the earlier "in progress" notes above:

- Owner registration, sign-in, password recovery, password update, sign-out, protected routes and a private workspace dashboard are implemented on PR #20.
- Browser authentication and session lifecycle now use the exact-pinned official `@supabase/supabase-js@2.119.0` client. Supabase Auth owns URL callback detection, local session persistence, automatic refresh and cross-tab auth events; the previous hand-written Auth REST/session implementation has been removed.
- The dedicated project's generated `Database` types are refreshed in `src/integrations/supabase/types.ts` and applied to the Supabase client. Workspace provisioning now uses typed SDK queries and retries safely when a second browser tab wins the unique-owner insert race. Document and share CRUD now uses typed Supabase SDK queries and the typed publish RPC, with every client created using the exact owner access token supplied by the workflow.
- Private Storage upload and removal now use the official Supabase SDK Storage client, scoped to the exact owner access token passed by the workflow. Unit tests cover upload, token binding, invalid path rejection and artifact removal.
- CV/resume/cover-letter drafts are persisted in the owner's workspace. Owner workspace links reopen the matching editor and hydrate the saved content for that document.
- Publishing now creates an immutable snapshot, updates the document status and records an audit event in one SECURITY INVOKER transaction.
- Publishing also generates a DOCX artifact, uploads it to the private Storage bucket under `{workspace_id}/{document_id}/{random_file}.docx`, and stores that path on the immutable version. Failed publish attempts trigger best-effort cleanup of the uploaded artifact.
- Owner recruiter-link UI supports creation, listing, editing expiry/email/download permissions and revocation. Raw 256-bit tokens are shown once; only SHA-256 hashes are stored and token hashes are not returned in owner API projections.
- Download permission is enabled only when the published version has a stored DOCX artifact. The resolver issues a 60-second signed URL from the private bucket.
- Invited-email access now requires both a matching authenticated email and a verified email address. Resolver version 4 is deployed with this check.
- Storage owner policies were corrected in migration `20261106114151_fix_private_storage_owner_policies.sql` to evaluate the first folder of `storage.objects.name` (workspace UUID). The previous policies incorrectly referenced `workspaces.name`.
- Migration `20261106114318_publish_workspace_document_with_private_artifact.sql` replaces the earlier publish RPC signature with a four-argument SECURITY INVOKER RPC that persists the private artifact path. Only authenticated users can execute it; anonymous EXECUTE is denied.
- Migration `20261106115025_audit_share_link_mutations.sql` adds an AFTER INSERT/UPDATE SECURITY INVOKER trigger that records share creation, settings changes and revocation in `audit_logs` in the same transaction; no invited email address or raw token is copied into audit metadata.
- Migration `20261106141032_revoke_excess_authenticated_table_privileges.sql` removes `TRUNCATE`, `REFERENCES` and `TRIGGER` privileges from authenticated browser roles, removes direct update/delete rights from immutable audit/version tables, and denies all browser-role access to the resolver rate-limit table. Default privileges keep future public-schema tables/sequences closed until a migration grants access explicitly.
- Migration `20261106144454_revoke_client_execution_on_trigger_functions.sql` revokes direct RPC execution of `set_updated_at` and `audit_share_link_mutations` from `PUBLIC`, `anon` and `authenticated`, and changes default function privileges so future public-schema functions are not executable by browser roles unless explicitly granted.
- Live database verification confirmed RLS is enabled on all eight public tables; owner policies scope workspace/document/share access by `auth.uid()`, private Storage policies bind the first object-path folder to the owning workspace, and no anon/authenticated grants remain for `TRUNCATE`, `REFERENCES`, `TRIGGER`, audit/version UPDATE/DELETE or the rate-limit table. Supabase security and health advisors both returned zero lints.

### Remaining release gates

- Pass both Quality and CV Editor CI workflows on the final PR head after the latest typed SDK and privilege-hardening changes, including lint, typecheck, unit tests and production build.
- Complete browser/end-to-end testing for the SDK-managed callback, session refresh and cross-tab events; the current unit tests do not substitute for real browser verification.
- Re-run both Quality and CV Editor workflows on the final PR head after the typed SDK migration; verify all updated SDK query tests pass.
- Add browser/end-to-end tests for signup, email verification, recovery, sign-in/out, refresh and cross-tab synchronization; owner document save/publish; share create/edit/revoke; invited-email restriction; recruiter viewing and DOCX download; A4/Letter print.
- Add automated cross-account RLS tests and authenticated/anonymous Storage authorization tests.
- Verify Supabase Auth Site URL, redirect allow-list and production email delivery for GitHub Pages and Vercel.
- Verify the canonical production hostname `hr-catalyst.vercel.app`; prior Vercel domain inventory showed `hr-catalyst-five.vercel.app`.
- Confirm GitHub main-branch protection and required checks. The current GitHub connection has not yet confirmed the branch ruleset.
- Do not mark the feature production-ready or merge PR #20 until these gates pass.

### Follow-up hardening — recruiter share mutation concurrency

Owner share-link mutations now request the updated row from PostgREST and verify that a row was actually changed. Revocation and settings changes fail closed with an explicit stale/already-revoked error if the active-link filter matches no row. This prevents the UI from reporting success when a link was revoked or otherwise changed between the owner's initial read and the final update. Unit coverage exercises successful revocation, already-revoked/missing links and concurrent revocation during settings updates.

A fresh live schema inspection on 6 November 2026 reconfirmed that all eight public tables have RLS enabled, workspace ownership policies are based on auth.uid(), workspace_members.role is constrained to recruiter or viewer, and the only SECURITY DEFINER application helpers have an empty or explicitly constrained search_path. These are structural checks; they do not replace cross-account requests using real authenticated users or browser-level Storage tests.

### Typed SDK data-layer completion — 6 November 2026

The remaining owner document and recruiter-share data operations have been migrated from hand-built PostgREST URLs to generated-type-aware Supabase SDK queries:

- Workspace document list and content hydration use scoped documents select queries.
- Document save uses a typed upsert on the workspace/slug conflict key and returns the saved projection.
- Publish uses the generated publish_workspace_document RPC signature.
- Share list/create/revoke/update and published-version lookups use typed share_links and document_versions operations.
- All these operations use getSupabaseClientForSession(session), which disables implicit session persistence/refresh and binds the exact owner access token in the client Authorization header.
- Unit tests were migrated to exercise the typed RPC/query interfaces, including hash-only token persistence, owner/workspace scoping, invalid invited-email and expiry rejection, download-artifact checks, stale revocation and fail-closed mutation behavior.

This completes the application-side migration of owner document/share CRUD to the typed Supabase SDK. It does not replace the outstanding live cross-account RLS, browser, auth-configuration and production deployment release gates.


### Trigger-function execution hardening — 6 November 2026

Live SQL inspection found that the generic `set_updated_at()` trigger function retained default EXECUTE privileges for browser roles, and the share-audit trigger function had an explicit authenticated EXECUTE grant. Although PostgreSQL invokes trigger functions through their attached triggers rather than direct RPC calls, those grants were unnecessary. Applied remote migration `20261106144454_revoke_client_execution_on_trigger_functions` and committed the matching migration file. Verified that `anon`, `authenticated` and `PUBLIC` have no EXECUTE privilege on either trigger function; the publish RPC remains executable only by `authenticated`, and the resolver throttle remains service-role-only. Supabase security advisor returned zero lints after the change. Future functions in the public schema now require explicit grants before browser invocation.


### Share-token input hardening — 6 November 2026

The browser resolver and `resolve-share` Edge Function now accept only the exact canonical token representation generated by the application: 64 lowercase hexadecimal characters (256 bits). Malformed, truncated, oversized or non-hexadecimal tokens are rejected before database lookup. Client unit tests cover invalid alphabet and length; generated share tokens remain 64-character lowercase hexadecimal values. This narrows the resolver input surface without changing existing generated links.


### Least-privilege browser mutation grants — 6 November 2026

Live grants inspection found that authenticated users still had DELETE privileges on documents, profiles, share links and workspaces, plus full browser privileges on `workspace_members`, although the current UI uses document archival, share soft-revocation and auth-trigger profile creation and does not implement workspace membership administration. Applied migration `20261106144632_revoke_unsupported_browser_delete_and_membership_access.sql` and committed it with the exact remote migration version. It removes browser DELETE rights from those owner tables, removes profile INSERT/DELETE rights, and denies all browser-role access to `workspace_members` until a separately reviewed member-management feature is implemented. Rechecked live grants: authenticated now has only the SELECT/INSERT/UPDATE rights needed by current document/share/workspace flows, and SELECT/UPDATE on self-scoped profiles; no anon table grants remain. Supabase security advisor continues to report zero lints.
