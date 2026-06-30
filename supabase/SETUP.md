# Auth setup (Supabase)

The app code for login / signup / forgot-password is done. To turn it on you
just need to create a free Supabase project and paste two keys.

## 1. Create the project
1. Go to <https://supabase.com> → sign in → **New project**.
2. Pick a name, a strong database password, and the region closest to your users.
3. Wait ~2 minutes for it to provision.

## 2. Create the tables
1. In the project: **SQL Editor → New query**.
2. Open [`schema.sql`](./schema.sql), copy everything, paste it, click **Run**.
   - This creates the `profiles` table, the auto-profile trigger, and the
     (phase-2) `appointments` / `history` tables, all with row-level security.

## 3. Configure auth
1. **Authentication → Providers → Email**: make sure **Email** is enabled.
2. **Confirm email** (same screen):
   - **ON**  → after signup the user must click a link in their email before
     they can log in (the app shows a "check your email" message). More secure.
   - **OFF** → signup logs the user straight in. Smoother for testing/launch.
   Choose what the client prefers; the app handles both.
3. **Authentication → Emails**: optionally translate the *Confirm signup* and
   *Reset password* email templates to Arabic.
4. **Authentication → URL Configuration → Redirect URLs**: add the app's URL so
   the password-reset link works (e.g. `https://your-app-domain` and, for local
   testing, `http://localhost:5173`).

## 4. Connect the app
1. **Project Settings → API**. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public** key → `VITE_SUPABASE_ANON_KEY`
2. Put them in `.env` (already has placeholders). The anon key is safe to ship —
   row-level security is what protects the data.
3. Restart the dev server / rebuild.

## 5. Admin / track usage
- See every user under **Authentication → Users**.
- Browse profile rows and (later) their data under **Table Editor**.
- No extra code needed — Supabase Studio is the admin panel.

---

## What's done in the app
- `src/services/supabase.js` — client
- `src/stores/auth.js` — session, profile, signIn / signUp / signOut / reset
- `src/views/LoginPage.vue`, `SignupPage.vue`, `ForgotPasswordPage.vue`
- `src/views/PrivacyPolicyPage.vue` — **placeholder text; client must supply the real policy**
- Router guard: no app access until logged in
- Logout button in Settings

## Phase 2 — data sync (DONE — all user data follows the account)

All user data lives on the server, tied to the account. Signing out clears the
device so the next user starts clean.

- **Reminders / appointments** — `src/stores/appointments.js` ↔ `appointments`
  table. **Offline-first**: a local copy keeps reminders working and firing with
  no connection, and offline changes sync up on the next launch/login. (OS
  notifications stay on-device — that's inherent to how they fire.)
- **History** — `src/stores/history.js` ↔ `history` table, with each thumbnail
  stored as a file in the **private `history-thumbnails` Storage bucket**
  (path `<user_id>/<image_id>.jpg`) and shown via short-lived signed URLs, so
  the database stays small. Capped at 50 most-recent per user. **Server-only —
  no device cache**: the History page fetches from the server each time it opens
  (a skeleton shows while loading). This is safe because creating a history
  entry already requires a network call (the image analysis).
- **Settings** (default reminder lead time) — `src/stores/settings.js` ↔ the
  `default_lead_minutes` column on the user's `profiles` row.

### ⚠️ Re-run the schema
This phase added a `profiles` column, the `history-thumbnails` bucket, and its
storage policies. **Re-run [`schema.sql`](./schema.sql)** (SQL Editor → paste →
Run) on the existing project — every statement is idempotent (`if not exists` /
`on conflict do nothing` / `drop policy … create policy`), so it's safe to run
again and won't touch existing rows.
