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
