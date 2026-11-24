# Google sign-in, operator identity and automatic progress sync

The client is prepared but **not activated**. Backend deployment status appears
below. The public backend configuration must remain blank until the chosen
email flow and activation checks are verified. Automated tests send no emails.

## Deployment owned by the account owner

1. Create/select the intended Supabase project. Apply
   `supabase/migrations/202611240001_cloud_progress.sql` through the project's
   migration workflow. The table has one row per authenticated user, private RLS
   reads, no direct client writes, and an atomic revision compare-and-swap RPC.
2. Deploy the `delete-account` Edge Function in `supabase/functions/delete-account`.
   Its `verify_jwt = false` gateway setting does **not** mean anonymous deletion:
   the function validates the supplied token with Auth `getUser` before creating
   the admin client, and deletes only that verified user's ID. A submitted body
   user ID is never read. The cloud save cascades from `auth.users` deletion.
3. Ensure the Edge environment supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY` and
   `SUPABASE_SERVICE_ROLE_KEY`. The service-role key stays exclusively on the
   server. Never put it in frontend configuration, an APK, repository files,
   screenshots or support messages. Default allowed browser origins are
   `https://ajavadinezhad.github.io` and
   `https://appassets.androidplatform.net`; any additional testing origins must be
   deliberately added through the server's `ALLOWED_ORIGINS` setting.
4. Enable email sign-in. Configure production email delivery/SMTP for the project.
   The game now supports the default email sign-in links using PKCE. Links must
   open in the same browser that requested them; the verifier stays on that
   device. Allow only the exact deployed game and deletion-page callback URLs.
   Custom numeric-code templates are no longer required. Configure appropriate rate limits and expiry. Verify a
   real sign-up and an existing-account sign-in before enabling the feature.
5. Populate only the **public** Supabase HTTPS project URL and publishable/anon key
   in the public backend configuration. The client rejects arbitrary domains,
   non-HTTPS URLs, service-role JWTs and secret keys. It does not follow redirects.
   Leave the configuration blank until setup and delivery have been verified.

## Save behavior

Email and passwordless credentials belong to Supabase Auth. The private database
row contains game backup JSON, a revision number and its update time; no password,
email code or auth tokens are put in the game save. Client session tokens live in
project-scoped local storage and are never returned by the account state API or
included in support/error text.

Signing in does not silently replace either device's save. Existing remote
progress requires the game's explicit cloud/local choice; subsequent automatic
checkpoint uploads use the adopted revision. Stale revisions return a conflict
without changing the cloud row. Offline requests preserve local play and the
stored session; a rejected refresh token signs the account out safely. Signing
out leaves local game progress. Deleting an account removes Auth and its cloud
row; local progress is handled separately by the game's account flow.

Backups and responses are bounded to 8 MiB plus small response framing overhead.
The database independently enforces the JSON payload size and checks owner IDs.

## Required activation verification

Use disposable accounts and the final configured browser/native build:

- Receive a real OTP for a new and existing account; expired/incorrect codes fail.
- Save from device A, sign in on B, and verify the explicit local/cloud choice.
- Race A and B against the same revision: exactly one update succeeds and the
  other asks for a choice; neither local progress nor the accepted cloud row is
  silently replaced.
- With two accounts, attempt direct REST reads/updates of the other's row and RPC
  owner spoofing. They must not expose or change that account's data. The RPC has
  no caller-supplied owner argument, and direct client writes are revoked.
- Turn networking off, reach a checkpoint, and resume local play. Restore network
  and confirm sync recovers without losing the newer local checkpoint.
- Verify app updates retain the project-scoped account session and local progress.
- Delete the signed-in disposable account through the game. Check Auth user and
  cloud row removal, failure handling, and that a submitted different account ID
  cannot change the deletion target. Verify a deleted user's old JWT cannot
  recreate a save; the RPC checks that its Auth user still exists.

The Node tests use injected HTTP, storage and Edge Auth/admin doubles, and inspect
schema security constraints. They do **not** prove real SMTP delivery, a deployed
RLS policy, Android networking or live account deletion. Those checks remain
required before activation. The game's privacy policy, Data safety answers and
store screenshots must describe the activated build, including cloud account
storage and its deletion route. Public support: ahmadjavadi17@gmail.com.

## Deployment status — 2026-11-24

Project `jgmqtibhrpqqqoxycakh` (Nulldelve) has the cloud-save migration
deployed. A live SQL permission check confirmed RLS enabled, no anonymous read
or RPC execution, authenticated SELECT and RPC execution, and no direct client
UPDATE permission. These checks do not replace the two-account tests above.

The `delete-account` Edge Function was deployed through the dashboard. Its
legacy JWT gateway verification remains enabled; configure the intended verified
user authentication mode and test it before activation. No account was deleted.

Custom SMTP is not configured. The dashboard requires it to edit the email
templates, so numeric OTP delivery and public signup remain unverified. The
game's public backend configuration is deliberately still blank. No cloud-enabled
build or public site update has been published.

The owner chose Supabase's built-in email temporarily. Custom SMTP remains off;
public signup is limited to project team addresses by the built-in sender. The
local browser build now supports default sign-in links with SHA-256 PKCE,
project-scoped temporary verifier storage, callback code removal, returned-email
matching and generation guards. Numeric-code entry is no longer shown.

For the owner-requested test, Site URL is temporarily `http://localhost:8058/`.
The isolated preview serves only the 150 allowlisted public runtime files from
`/tmp/nulldelve-link-test-public`, never the repository root. Public project URL
and publishable key are configured locally; the website and Android artifacts
have not been republished. Supabase accepted a link request for the authorized
owner email on 2026-11-24. Actual inbox receipt and callback/save verification
await the owner's click in the same Chrome browser. An accepted request does not
by itself prove delivery. Native app link routing is not yet implemented; do not
claim this browser flow works inside the APK. Replace the temporary Site URL with
the deployed game URL and configure exact callbacks before any public rollout.

## Primary implementation references

- [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Auth REST API](https://supabase.github.io/auth/)
- [Verified user lookup](https://supabase.com/docs/reference/javascript/auth-getuser)
- [Server-only account deletion](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser)
- [User data and deletion behavior](https://supabase.com/docs/guides/auth/managing-user-data)

## Current direction: Google first-time setup

The owner replaced email-link entry with **Continue with Google**, followed by a
unique username (3–20 lowercase ASCII letters/digits/underscores), display name
(1–24 Unicode characters), and one of eight locally bundled operator avatars.
Identity is a separate owner-private table, not part of a checkpoint or imported
backup. Main/pause menus show an editable operator chip; gameplay uses a compact
avatar in the existing cash row so the phone HUD does not gain another panel.

Migration `202611240002_player_profiles.sql` was deployed successfully on
2026-11-24. Username uniqueness is enforced by PostgreSQL, profile writes use an
owner-bound RPC, and Auth deletion cascades to identity and saves. Remote profile
loading must succeed before the creation form appears, preventing a transient
read failure from replacing a returning player's identity.

Google is currently **disabled** in the Supabase dashboard: a Google OAuth Web
client ID and client secret have not been connected. Configure the Google client
with authorized redirect URI:
`https://jgmqtibhrpqqqoxycakh.supabase.co/auth/v1/callback`.
Keep the secret only in the Supabase provider settings, never frontend config.
Do not skip nonce checks or permit missing emails. Google sign-in does not need
the temporary SMTP sender. Email request testing was stopped at the owner's
request; inbox receipt was not verified. Google sign-in is not yet live-tested.

Browser OAuth uses SHA-256 PKCE and removes the one-use callback code from the
address bar. Native Android system-browser callback routing remains a separate
required integration before claiming APK account support. The public website
and signed Android artifacts have not been updated with this implementation.
