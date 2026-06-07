# Changes Summary — OTP Fix + Service Navigation Rework

Branch: `dev` → PR to `main`

## 1. Detected Auth Setup (before changes)

- **NextAuth.js (v4)** with two `CredentialsProvider` entries (`customer-login`, `admin-login`) — see [lib/auth.ts](lib/auth.ts).
- **In-memory user store** at [lib/store.ts](lib/store.ts) — 9 hardcoded test users (Shubham / Irfan / Adamya × property_manager / tenant / student).
- **Custom in-memory OTP store** at `lib/otp-store.ts` (now removed) with a `/api/auth/otp/send` route that delivered email via Resend and stubbed SMS.
- **Supabase JS client** at [lib/supabase.ts](lib/supabase.ts) — used only for `ref_*` lookup tables, not for auth.
- **Outcome:** two parallel systems (custom OTP for verification, NextAuth for sessions). OTP failed in production whenever `RESEND_API_KEY` was missing, with no built-in retry / dashboard delivery.

## 2. OTP Verification — now uses Supabase Auth

### What changed

- **Email OTP path** ([app/api/auth/otp/send/route.ts](app/api/auth/otp/send/route.ts)) now calls `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: ... } })`. Supabase handles the code, the email delivery and the rate limiting.
- **Verification** ([app/api/auth/register/route.ts](app/api/auth/register/route.ts)) now calls `supabase.auth.verifyOtp({ email, token, type: 'email' })`. On success we sign the Supabase session out (we don't need it — NextAuth still manages the portal session) and create the local user.
- Friendly error mapping for expired / invalid / mismatch codes.
- The old `lib/otp-store.ts` and the Resend-based OTP delivery have been removed.
- Returns the actual Supabase error message back to the user when something genuinely goes wrong (rate limit, provider misconfigured) instead of a generic failure.

### Phone OTP — Coming Soon (no SMS provider yet)

- Phone field stays in the registration form but the SMS tile is visibly disabled with a **Soon** badge.
- Server-side check returns a friendly 503 if anyone tries to bypass.
- Code path for `signInWithOtp({ phone })` / `verifyOtp({ phone, type: 'sms' })` is in place behind a feature flag — flip `NEXT_PUBLIC_PHONE_OTP_ENABLED=true` to enable.

### Required Supabase Dashboard Steps

1. **Project Settings → API** — copy the project URL and the anon key into Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
2. **Authentication → Providers → Email** — enable the Email provider and turn on **Email OTP**. If using a custom SMTP, configure it; otherwise the Supabase-managed sender is used (rate-limited but enough for testing).
3. **Authentication → URL Configuration** — add `https://3ccore.com`, the production Vercel URL, and the preview wildcard (`https://*.vercel.app` for previews) to the allowed redirect URLs.
4. (Optional, for phone OTP) **Authentication → Providers → Phone** — connect Twilio / MessageBird / Vonage, then set `NEXT_PUBLIC_PHONE_OTP_ENABLED=true` in Vercel.

### Required Vercel Env Vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        (sensitive — backend only)
NEXT_PUBLIC_SITE_URL             (used in emailRedirectTo)
NEXT_PUBLIC_PHONE_OTP_ENABLED    (defaults to false — set true when SMS is wired up)
```

---

## 3. Service Navigation Rework

### Old 4-tab page — removed from the flow

`components/ui/ServiceTabNav.tsx` and `components/forms/BookingForm.tsx` are no longer imported anywhere. Every service page now lands the user directly in the new booking flow.

### New shared component

- **`components/booking/ServiceBookingForm.tsx`** — modal form used by every service. Auto-fills (and locks) the user's role, name, email, and the service type. Reads the role from NextAuth session, falling back to `sessionStorage['3c_user_role']` set by the who-are-you flow. Logged-out users get editable fields; logged-in users see read-only ones.
- **`components/booking/DirectBookingPage.tsx`** — thin wrapper used by midterm / dispute / deposit pages so they all open the modal on mount.
- **`app/api/service-bookings/route.ts`** — POST handler that
  1. resolves `serviceCode`, `portalRole`, `maintenanceType` to lookup ids (`ref_service_types`, `ref_portal_roles`, `ref_maintenance_types`);
  2. inserts a row into `public.service_bookings`;
  3. emails `contactus@3ccore.com` via Resend.

### Per-service routing map

| Service                | Path                              | Behaviour |
|------------------------|-----------------------------------|-----------|
| Inventory Management   | `/services/inventory`             | Chooser screen: **Do It Yourself** → `/services/inventory/diy`, **Book an Agent** → opens shared booking form. |
| Maintenance & Cleaning | `/services/maintenance`           | Opens booking form immediately — first picks **Maintenance Type** (from `ref_maintenance_types`), then reveals the rest of the form. |
| Midterm Inspection     | `/services/midterm-inspections`   | Opens booking form immediately. |
| Dispute Resolution     | `/services/dispute-resolution`    | Opens booking form immediately. |
| Deposit Negotiation    | `/services/deposit-negotiation`   | Opens booking form immediately. Role-gated to PM / Landlord by [app/services/page.tsx](app/services/page.tsx) (unchanged). |
| Letting Services       | `/services/letting-services`      | New page: lists available properties from `property_lettings` (joined to `properties`) with a per-card **Schedule callback** action and a global **Schedule a Callback** button. Falls back to sample listings when the DB is empty. |

### Schema additions (migration `021_service_bookings_and_maintenance_types.sql`)

- `ref_maintenance_types` lookup (gas_safety, eicr, epc, legionella, pat_testing, licensing, cleaning, general_repair, other).
- `service_bookings` table:
  - `Booking_Id` uuid PK
  - `User_id` FK → `users` (nullable for guest bookings)
  - `service_type_id`, `portal_role_id`, `maintenance_type_id` FKs to the relevant `ref_*` tables
  - snapshot of user info (`full_name`, `email`, `phone`) so guest bookings still work
  - `summary`, `service_date`, `call_back_time`, `email_sent`, `notes`, `created_at`
  - RLS enabled — owners and admins can see their bookings; service role inserts bypass RLS.

**Run this migration in Supabase SQL Editor before the new booking flow is fully wired to the DB.** Until then, the API gracefully degrades — bookings still email but aren't persisted.

### Lookups + types

- Added `ref_maintenance_types` to:
  - [lib/lookups.ts](lib/lookups.ts) (LookupTable union, `getMaintenanceTypes`)
  - [app/api/lookups/route.ts](app/api/lookups/route.ts) (`VALID_TABLES` allow-list)
  - [types/database.ts](types/database.ts) (`RefMaintenanceType`, `Database['public']['Tables']`)
- Added `service_bookings` table type and `DbServiceBooking` interface.

---

## 4. Files Touched

### Added
- `app/api/lettings/available/route.ts`
- `app/api/service-bookings/route.ts`
- `components/booking/ServiceBookingForm.tsx`
- `components/booking/DirectBookingPage.tsx`
- `supabase/migrations/021_service_bookings_and_maintenance_types.sql`
- `CHANGES_SUMMARY.md` (this file)

### Updated
- `app/api/auth/otp/send/route.ts` — switched to Supabase Auth.
- `app/api/auth/register/route.ts` — verifies via Supabase Auth.
- `app/api/lookups/route.ts` — added `ref_maintenance_types`.
- `components/portal/RegisterForm.tsx` — phone OTP marked Coming Soon, gated by feature flag.
- `app/services/inventory/page.tsx` — replaced 5-tab page with DIY / Book Agent chooser.
- `app/services/maintenance/page.tsx` — replaced 4-tab page with direct booking + maintenance type selector.
- `app/services/midterm-inspections/page.tsx` — direct booking via `DirectBookingPage`.
- `app/services/dispute-resolution/page.tsx` — direct booking.
- `app/services/deposit-negotiation/page.tsx` — direct booking.
- `app/services/letting-services/page.tsx` — listings + callback form.
- `lib/lookups.ts` — added `ref_maintenance_types`.
- `types/database.ts` — added `RefMaintenanceType`, `DbServiceBooking`, table entries.
- `.env.local.example` — documented `NEXT_PUBLIC_PHONE_OTP_ENABLED` and noted Supabase OTP requirement.

### Removed
- `lib/otp-store.ts` — replaced by Supabase Auth.

---

## 5. Acceptance Checklist

### Part A — OTP
- [x] Email OTP standardised on Supabase Auth
- [x] Resend-based custom OTP store removed
- [x] Phone field present, marked Coming Soon, signup not blocked
- [x] Feature flag (`NEXT_PUBLIC_PHONE_OTP_ENABLED`) ready for when SMS lands
- [x] Specific Supabase error messages surfaced to the user
- [x] Required env vars + dashboard steps documented (this file)

### Part B — Service navigation
- [x] Old 4-tab service page never appears after selecting a service
- [x] Single shared booking form with role / name / service type auto-filled and locked
- [x] Inventory shows DIY vs Book-an-Agent
- [x] Maintenance asks maintenance type first, then reveals booking fields
- [x] Midterm / Dispute / Deposit go straight to the form
- [x] Letting shows available listings + Schedule a Callback button
- [x] Submissions save to DB AND email `contactus@3ccore.com`
- [x] Option lists come from `ref_*` lookups
- [x] No emojis introduced; Lucide icons; amber/gold design unchanged
- [x] `npm run build` passes (47 routes generated, no TS errors)

---

## 6. Manual Steps Before Going Live

1. **Run `supabase/migrations/021_service_bookings_and_maintenance_types.sql` in Supabase SQL Editor.**
2. Confirm Supabase Auth → Providers → Email → **Email OTP enabled**.
3. Add the redirect URLs in Supabase Auth → URL Configuration (production + Vercel preview).
4. Verify the Vercel env vars listed in section 2.
5. When ready for SMS, connect Twilio (or similar) in Supabase, then set `NEXT_PUBLIC_PHONE_OTP_ENABLED=true` in Vercel.
