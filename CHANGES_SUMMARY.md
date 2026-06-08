# Changes Summary

Last updated: 2026-06-08

This is a chronological log of substantial changes shipped on the website. Each batch corresponds to a merge to `main`. The most recent batch is at the top.

For the current overall architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

# Batch 5 — Persistent customer profile + password on `public.users`

**Why:** The in-memory `lib/store.ts` is reset on every Vercel serverless cold start. That meant:

1. A customer who registered, logged out, then tried to log in again from a fresh function instance got "invalid credentials" — their password hash was gone.
2. Forgot-password silently no-op'd for the same reason: `findUserByEmail` returned null, so no OTP was sent.
3. `public.users` was missing `Lastname`, `MiddleName`, `Phone`, `Company`, and had no password at all — the Supabase trigger only set `FirstName` (defaulting to the email local part) and `Email`.

**Fix:** new migration `022_persistent_user_profile_and_password.sql` and a new helper `lib/users-db.ts`.

### Database

- **Migration 022** adds `password_hash text` to `public.users` and a case-insensitive index `idx_users_email_ci on lower("Email")`.
- The existing `Lastname`, `MiddleName`, `Phone`, `Company`, `portal_role_id` columns are now actually populated by the application.
- Service role bypasses RLS for writes; the existing "Users update own row" policy still works for authenticated browser updates.

### Application code

| Flow | Before | After |
|---|---|---|
| **Register** (`/api/auth/register`) | wrote name+pw to in-memory only; `public.users` had stub from trigger | also calls `writeCustomerProfile` to UPDATE `public.users` with full profile + `password_hash` + `portal_role_id` |
| **Customer login** (NextAuth `customer-login`) | only checked in-memory | checks Supabase `public.users` first; falls back to in-memory for the 9 seeded demo accounts |
| **Forgot-password start** | only sent OTP if email was in in-memory store | uses `lib/email-exists` (in-memory ∪ Supabase) — OTP now goes out for any registered email |
| **Forgot-password reset** | updated in-memory only | calls `updateCustomerPassword` to set `password_hash` in Supabase, plus in-memory for the current instance |

### Files

Added
- `supabase/migrations/022_persistent_user_profile_and_password.sql`
- `lib/users-db.ts` (read / write / update password helpers)
- `ARCHITECTURE.md` rewritten

Updated
- `lib/auth.ts` — customer-login provider now hits Supabase first
- `app/api/auth/register/route.ts` — persists full profile + hash
- `app/api/auth/forgot-password/start/route.ts` — uses `emailExists`
- `app/api/auth/forgot-password/reset/route.ts` — updates Supabase password

### Required steps after deploy

**Run migration 022 in the Supabase SQL Editor** before the next deploy is exercised. Without `password_hash`, the new register / login / reset code paths will silently fall back to "no Supabase persistence" and you're back where you started.

### Acceptance

- [x] New customer registers → `public.users` row has FirstName, Lastname, Phone, Company, password_hash, portal_role_id correctly set
- [x] Same customer logs out, lands on a cold Vercel instance, logs back in with their password — works
- [x] Same customer hits Forgot password → receives an OTP, resets, new password works on a different cold instance
- [x] Existing seeded demo accounts (Shubham/Irfan/Adamya × roles) still log in (in-memory fallback path)
- [x] `npm run build` passes

---

# Batch 4 — Duplicate-email guard + forgot-password unblock

Pushed two fixes:

1. **Forgot-password page was unreachable.** The `withAuth` middleware in `middleware.ts` only allowed `/portal`, `/portal/login`, `/portal/register`, `/portal/admin-login` without a token. Clicking "Forgot password?" was bouncing back to `/portal/login` (looked like a refresh). Added `/portal/forgot-password` to the allow-list.

2. **Duplicate-email guard now persistent.** New `lib/email-exists.ts` helper checks both the in-memory store and Supabase `public.users`. Used by:
   - `/api/auth/check-email` — called by RegisterForm step 1 to fail fast before any OTP
   - `/api/auth/otp/send` — refuses to send if email exists, returns 409 with `code: 'EMAIL_EXISTS'`
   - `/api/auth/register` — final safety net at OTP-verify time

3. **RegisterForm UX:** if the email exists, an amber banner appears with two clickable actions — "sign in to your existing account" or "reset your password if you've forgotten it". Banner clears when the user edits the email field.

4. **Forgot-password link defensiveness:** swapped `next/link` for a plain `<a href>` on the customer login form to force a real browser navigation (bypasses any stale client bundle).

5. **Post-registration redirect** changed from `/portal/customer/dashboard` to `/services?role=<role>` so new customers pick a service first (matching the post-login redirect).

---

# Batch 3 — Admin OTP login + customer forgot-password

Admin login is now 2-step:
- Step 1: email + password → `/api/auth/admin/start-login` validates the password and triggers a Supabase OTP email to the admin address
- Step 2: 6-digit code → the NextAuth `admin-login` provider re-checks the password AND calls `supabase.auth.verifyOtp({ type: 'email' })` before issuing a session

Customer forgot-password (`/portal/forgot-password`):
- 3-step UI: email → code + new password → success
- `/api/auth/forgot-password/start` sends an OTP via Supabase (returns generic success whether the email is registered or not, so attackers can't probe for accounts)
- `/api/auth/forgot-password/reset` verifies the OTP and updates the password hash

`LoginForm` was split into `CustomerLoginForm` + `AdminLoginForm` under the same exported component so the existing admin login pages keep working unchanged.

---

# Batch 2 — DIY Inventory Report

New route `/services/inventory/diy` — 4-step tool:

1. Property + report meta → creates `inventory_reports` draft
2. Rooms + media — add/reorder/remove, upload + live camera, optional items
3. Review + AI analysis (flag-gated stub)
4. Real PDF download with 3C Core branding + signature blocks

APIs added/rewritten:
- `/api/inventory/reports` POST/PATCH
- `/api/inventory/rooms` POST/DELETE
- `/api/inventory/items` POST/DELETE
- `/api/inventory/upload` multipart → `inventory-media` bucket + `media` row (`auto_delete_at = NULL`)
- `/api/inventory/analyse` — flag-gated stub behind `NEXT_PUBLIC_AI_ANALYSIS_ENABLED`
- `/api/inventory/generate-pdf` — real jspdf builder, saves to `inventory-reports` bucket, writes `pdf_url`

New components:
- `components/inventory/CameraCapture.tsx` — live `getUserMedia` with front/back switch, preview/retake, file-input fallback when permission denied
- `lib/anthropic.ts` exposes `AI_ANALYSIS_ENABLED`, `hasAnthropicKey`, `CLAUDE_MODEL`

Autosave: `localStorage` + server PATCH (both debounced). Anonymous-user CTA to create an account before download.

---

# Batch 1 — OTP fix + Service Navigation Rework

- Email OTP standardised on Supabase Auth (`signInWithOtp` / `verifyOtp({ type: 'email' })`)
- Phone OTP gated behind `NEXT_PUBLIC_PHONE_OTP_ENABLED` (default false)
- Custom `lib/otp-store.ts` removed
- Old 4-tab (Description / FAQs / Prices / Book Now) page removed from every service
- New shared `ServiceBookingForm` modal with auto-filled role / name / service type
- `/api/service-bookings` persists to `service_bookings` and emails `contactus@3ccore.com`
- Migration `021_service_bookings_and_maintenance_types.sql` adds `ref_maintenance_types` + `service_bookings`

Per-service routing:
- **Inventory** → DIY vs Book-an-Agent chooser
- **Maintenance** → maintenance-type select first, then booking
- **Midterm / Dispute / Deposit** → straight to booking form
- **Letting** → available listings + Schedule a Callback

---

# Required Supabase Dashboard configuration

(One-time, in order):

1. **Run migrations** in SQL Editor — `020_finalised_schema_with_lookups.sql`, then `021_service_bookings_and_maintenance_types.sql`, then `022_persistent_user_profile_and_password.sql`.
2. **Authentication → Providers → Email** — enabled.
3. **Authentication → URL Configuration** —
   - Site URL: `https://3ccore.com`
   - Redirect URLs: `https://3ccore.com`, `https://3ccore.com/**`, your Vercel preview URLs, `http://localhost:3000`, `http://localhost:3000/**`
4. **Authentication → Emails → SMTP Settings** — custom SMTP via Resend (`smtp.resend.com:465`, user `resend`, password = Resend API key, sender from a verified Resend domain).
5. **Authentication → Email Templates** — both **Confirm signup** AND **Magic Link or OTP** updated to render `{{ .Token }}` instead of `{{ .ConfirmationURL }}`.

---

# Required Vercel environment variables

| Key | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | **Sensitive** — backend only |
| `NEXTAUTH_SECRET` | **Sensitive** — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://3ccore.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://3ccore.com` — used in `emailRedirectTo` |
| `PORTAL_ADMIN_EMAIL` | identity for admin 2FA |
| `PORTAL_ADMIN_PASSWORD` | **Sensitive** |
| `RESEND_API_KEY` | **Sensitive** — also used in Supabase SMTP |
| `RESEND_FROM_EMAIL` | optional |
| `NEXT_PUBLIC_PHONE_OTP_ENABLED` | default `false` |
| `NEXT_PUBLIC_AI_ANALYSIS_ENABLED` | default `false` |
| `ANTHROPIC_API_KEY` | required only when AI analysis is enabled |
| `ANTHROPIC_MODEL` | optional — defaults to `claude-sonnet-4-6` |
| `NEXT_PUBLIC_COMPANY_EMAIL` | optional — overrides booking-email recipient |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | when Stripe goes live |
| `STRIPE_SECRET_KEY` | **Sensitive** — when Stripe goes live |
| `STRIPE_WEBHOOK_SECRET` | **Sensitive** — when Stripe goes live |
