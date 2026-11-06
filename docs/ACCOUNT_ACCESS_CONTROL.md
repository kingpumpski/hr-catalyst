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
- The owner-only browser routes require the verified Supabase `app_metadata.role` claim to equal `owner`. User-editable metadata and URL parameters are never authorization inputs. Only a Supabase administrator may assign or remove this claim.
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

- The frontend now supports password sign-in/session restoration and protects full CV editing, settings and the referee vault behind the administrator-assigned owner claim. There is intentionally no public sign-up or self-service role assignment.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for local builds and as GitHub Actions repository variables for Pages deployments. Both are browser configuration; the publishable key is safe to expose. Never use a service-role or secret key.
- Provision the owner identity in Supabase Auth, then assign `{"role":"owner"}` in that user's `raw_app_meta_data` through an administrator-controlled operation (for example, in the dedicated project's SQL editor for the exact owner account). Do not set `user_metadata.role`. The user must sign out and back in after a role change so the new claim is issued.
- The current CV editor and referee vault continue to use browser-local persistence; CV edits are namespaced by authenticated user ID, and referee contacts remain locally encrypted. Migrating editable documents to the existing workspace/document tables remains future work.
- Add owner-side document publishing, share creation (cryptographically random token generation and hash-only persistence), revocation and audit events.
- Add integration tests for RLS isolation, owner-role provisioning/revocation, email-restricted shares, expiry/revocation, download disabled/enabled, and signed URL expiry.
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
- Resolver client tests cover token entropy/hash generation, fragment-based URLs, no-store requests, invalid/revoked tokens and signed-download host validation.

This is the recruiter-side resolver integration only. It does **not** complete owner authentication, document publishing, share-link creation/revocation UI, invited-recipient sign-in, or end-to-end authorization testing. Those remain release blockers until the owner workflow is connected to the authenticated Supabase workspace.
