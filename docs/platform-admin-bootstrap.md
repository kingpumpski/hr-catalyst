# HR Catalyst platform administrator bootstrap

## Security model

Platform administrator grants live in `public.platform_admins`. Browser roles and editable profile metadata cannot grant administrator privileges. The `platform-admin` Edge Function verifies the caller's Supabase access token and then checks this table using the server-only service role key. Browser clients have no direct privileges on the administrator or audit tables.

The console manages invitations, account suspension/restoration and administrator grants. It deliberately does not expose passwords, referee-vault plaintext, CV contents or private document storage.

## Provision the first administrator

1. Configure the Supabase URL and publishable key in the frontend environment.
2. Apply migration `20261107170000_create_platform_admin_controls.sql` to the dedicated HR Catalyst Supabase project.
3. Deploy the `platform-admin` Edge Function.
4. Set the Edge Function secret `HR_CATALYST_SITE_URL` to the verified production origin, currently `https://hr-catalyst-five.vercel.app`.
5. Create the first account through the normal HR Catalyst sign-up flow and complete email verification.
6. In Supabase Dashboard → SQL Editor, replace the email below with the exact verified email of the intended first administrator and run:

```sql
insert into public.platform_admins (user_id, granted_by)
select id, id
from auth.users
where lower(email) = lower('replace-with-your-verified-admin-email@example.com')
  and email_confirmed_at is not null
on conflict (user_id) do nothing;
```

7. Confirm exactly one row was inserted for the intended user. Then sign in and open `/admin`.

Do not run this bootstrap query for an unverified address. Do not place the service-role key in Vite environment variables, browser code, GitHub Actions artifacts or repository files.

## Operational notes

- The first 100 auth users are listed; pagination can be added before the account base grows beyond this page.
- Suspending a user uses Supabase Auth's admin ban operation. Restoring clears the ban.
- The console prevents an administrator from suspending or demoting themselves and the API prevents removing the last administrator.
- All successful operations are written to `platform_admin_audit`.
- The Edge Function is intentionally not deployed by this repository commit. Apply and deploy it only after the PR is reviewed and release approved.
