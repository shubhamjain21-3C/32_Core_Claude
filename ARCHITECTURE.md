# Architecture — 3C Core Website

Last updated: 2026-06-08

---

## 1. High-level system diagram

```
                    Visitor
                       │
                       ▼
      GoDaddy DNS A-record → 76.76.21.21
                       │
                       ▼
      Vercel CDN (edge / SSL / caching)
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │  Next.js 14 App Router (Node.js runtime) │
    │                                          │
    │  - Static & dynamic pages                │
    │  - 21 server API routes                  │
    │  - middleware.ts (NextAuth withAuth)     │
    └──────────────────────────────────────────┘
        │            │             │           │
        ▼            ▼             ▼           ▼
   Supabase      Resend       Anthropic     Stripe
   (DB+Auth+     (SMTP +      (Claude       (Payments
    Storage)     Tx email)    AI)           — staged)
```

External integrations:
- **Supabase** — Postgres database, Auth (email OTP for registration / admin login / password reset), Storage (inventory media + report PDFs).
- **Resend** — Supabase SMTP sender for OTP emails, plus direct `/api/contact` and `/api/service-bookings` notifications.
- **Anthropic Claude** — inventory analysis via `/api/inventory/analyse`. Currently flag-gated stub; flip `NEXT_PUBLIC_AI_ANALYSIS_ENABLED=true` + add `ANTHROPIC_API_KEY` to enable.
- **Stripe** — payment intents + webhook scaffolded under `/api/payments`. Live keys not yet wired.

---

## 2. App Router page tree

```
app/
├── layout.tsx                     # Root layout (fonts + global providers)
├── page.tsx                       # / Home
├── about/page.tsx                 # /about
├── contact/page.tsx               # /contact
├── who-are-you/page.tsx           # /who-are-you (journey selector)
│
├── services/
│   ├── page.tsx                   # /services            (service list per role)
│   ├── [slug]/page.tsx            # /services/:slug      (legacy generic detail)
│   ├── inventory/
│   │   ├── page.tsx               # /services/inventory       (DIY vs Agent chooser)
│   │   └── diy/page.tsx           # /services/inventory/diy   (4-step DIY tool)
│   ├── maintenance/page.tsx       # /services/maintenance     (type-select + booking)
│   ├── midterm-inspections/page.tsx
│   ├── dispute-resolution/page.tsx
│   ├── deposit-negotiation/page.tsx
│   └── letting-services/page.tsx  # listings + Schedule Callback
│
├── portfolio/
│   ├── page.tsx
│   └── [slug]/page.tsx
│
├── legal/
│   ├── privacy-and-terms/page.tsx
│   └── cookies/page.tsx
│
├── portal/                        # ────── Public portal pages ──────
│   ├── page.tsx                   # /portal               (portal selector)
│   ├── login/page.tsx             # /portal/login         (customer login)
│   ├── register/page.tsx          # /portal/register      (customer signup + OTP)
│   ├── forgot-password/page.tsx   # /portal/forgot-password (3-step reset)
│   ├── admin-login/page.tsx       # /portal/admin-login   (admin 2-step OTP)
│   ├── admin/login/page.tsx       # legacy admin login path
│   │
│   ├── customer/                  # ───── Customer-only (middleware-gated) ─────
│   │   ├── dashboard/page.tsx
│   │   ├── account/page.tsx
│   │   ├── properties/page.tsx
│   │   ├── properties/new/page.tsx
│   │   ├── services/page.tsx
│   │   └── payments/page.tsx
│   │
│   ├── admin/                     # ───── Admin-only (middleware-gated) ─────
│   │   ├── dashboard/page.tsx
│   │   ├── customers/page.tsx
│   │   └── properties/page.tsx
│   │
│   └── dashboard/page.tsx         # legacy /portal/dashboard
│
└── api/                           # ────── 21 server routes ──────
    ├── auth/
    │   ├── [...nextauth]/route.ts        # NextAuth handler
    │   ├── otp/send/route.ts             # registration OTP → Supabase
    │   ├── register/route.ts             # verify OTP + create user
    │   ├── check-email/route.ts          # used by RegisterForm step 1
    │   ├── admin/start-login/route.ts    # verify admin pw + send OTP
    │   └── forgot-password/
    │       ├── start/route.ts            # send reset OTP
    │       └── reset/route.ts            # verify OTP + update password
    │
    ├── contact/route.ts                  # Resend transactional email
    │
    ├── inventory/
    │   ├── reports/route.ts              # POST/PATCH inventory_reports
    │   ├── rooms/route.ts                # upsert/delete inventory_rooms
    │   ├── items/route.ts                # upsert/delete inventory_items
    │   ├── upload/route.ts               # multipart → inventory-media bucket + media row
    │   ├── analyse/route.ts              # Claude analysis (flag-gated stub)
    │   └── generate-pdf/route.ts         # jspdf + inventory-reports bucket
    │
    ├── lettings/available/route.ts       # property_lettings + properties join
    ├── lookups/route.ts                  # generic ref_* fetcher
    ├── service-bookings/route.ts         # ServiceBookingForm submissions
    ├── properties/route.ts               # in-memory store CRUD
    ├── properties/[id]/route.ts
    └── payments/
        ├── create-intent/route.ts        # Stripe (live keys pending)
        └── webhook/route.ts
```

---

## 3. Authentication flows

NextAuth.js (JWT strategy) owns portal sessions. Supabase Auth is used purely for email-OTP delivery + verification — its session is discarded immediately after a code is verified.

### Customer registration

```
RegisterForm Step 1
  ├── fields: name, dob, email, phone, company (PM only), password, portal role
  ├── on Continue → POST /api/auth/check-email
  │                  └── lib/email-exists.ts → in-memory store ∪ Supabase public.users
  │     ├── exists → amber banner with [Sign in] [Reset password] links, stop
  │     └── new   → advance to Step 2

RegisterForm Step 2
  ├── method = email (SMS gated behind NEXT_PUBLIC_PHONE_OTP_ENABLED)
  ├── Send Code → POST /api/auth/otp/send
  │                 └── emailExists guard, then supabase.auth.signInWithOtp({ email })
  ├── User enters 6 digits → Verify & Create Account
  └── POST /api/auth/register
        ├── supabase.auth.verifyOtp({ email, token, type: 'email' })
        ├── emailExists guard (final safety net)
        ├── createUser() in lib/store
        ├── signIn('customer-login', { email, password })  (NextAuth credentials)
        └── router.push(`/services?role=${portalRole}`)
```

### Customer login

```
LoginForm (CustomerLoginForm)
  ├── email + password → signIn('customer-login')
  └── on success → /services?role={portalRole}   (returnUrl honoured if set)
```

### Customer forgot password

```
/portal/forgot-password
  ├── Step 1 → POST /api/auth/forgot-password/start
  │             └── generic 200 always (no account-probing leak)
  │                 └── supabase.auth.signInWithOtp({ email })  if account exists
  ├── Step 2 → user enters 6-digit code + new password
  │             POST /api/auth/forgot-password/reset
  │             └── supabase.auth.verifyOtp(...)
  │             └── lib/store.updateUserPasswordByEmail(email, hash(new))
  └── Step 3 → success, link back to /portal/login
```

### Admin login (2-step OTP)

```
LoginForm (AdminLoginForm)
  ├── Step 1: email + password → POST /api/auth/admin/start-login
  │             ├── validate against PORTAL_ADMIN_EMAIL / PORTAL_ADMIN_PASSWORD
  │             └── supabase.auth.signInWithOtp({ email: adminEmail })
  └── Step 2: 6-digit code → signIn('admin-login', { email, password, otpCode })
                └── NextAuth admin-login provider
                      ├── re-verifies password
                      └── supabase.auth.verifyOtp({ email, token, type: 'email' })
```

### Route protection (`middleware.ts`)

```
matcher: /portal/:path*

Public (no token required):
  /portal
  /portal/login
  /portal/register
  /portal/admin-login
  /portal/forgot-password

Customer-only:
  /portal/customer/*           role === 'customer'  else → /portal/login

Admin-only:
  /portal/admin/* (excluding /portal/admin-login)   role === 'admin' else → /portal/admin-login
```

---

## 4. Data layer

### Source of truth split

| Domain | Where | Notes |
|---|---|---|
| Demo / seed users | `lib/store.ts` in-memory Map | 9 hardcoded accounts (Shubham/Irfan/Adamya × PM/Tenant/Student) |
| Newly-registered users | `lib/store.ts` + Supabase `public.users` (via OTP trigger) | In-memory copy is volatile on Vercel; Supabase is authoritative |
| Properties (demo) | `lib/store.ts` Map | |
| Customer services | `lib/store.ts` Map | |
| Lookups (`ref_*`) | Supabase | Read via `lib/lookups.ts` / `/api/lookups` |
| Inventory reports / rooms / items / media | Supabase | Best-effort writes — page degrades gracefully if Supabase is down |
| Service bookings | Supabase `service_bookings` + Resend email | |
| Property lettings | Supabase `property_lettings` + sample fallback | Used by `/services/letting-services` |
| Static content (services, portfolio, testimonials) | `data/*.ts` files | Compiled at build time |

### Supabase schema (migrations 020 + 021)

Reference (lookup) tables — every dropdown reads from one of these:

```
ref_portal_roles         ref_property_types      ref_property_status
ref_tenancy_status       ref_furnished_types     ref_letting_status
ref_report_types         ref_report_status       ref_condition_levels
ref_room_types           ref_item_types          ref_entity_types
ref_media_types          ref_service_types       ref_service_status
ref_chat_roles           ref_maintenance_types
```

Core tables:

```
users                    1 row per Supabase auth.users (trigger-managed)
properties               owned by users
property_tenancies       links tenant users to properties
property_lettings        available-to-rent listings
services                 active services per customer
service_bookings         booking / callback requests from ServiceBookingForm
inventory_reports        ─┐
inventory_rooms          ─┼ inventory hierarchy
inventory_items          ─┘
media                    polymorphic — entity_type_id + entity_id
chat_conversations       (scaffold — chatbot not yet wired)
chat_messages
```

Storage buckets:

| Bucket | Public? | Allowed types | Used by |
|---|---|---|---|
| `inventory-media` | private | jpg/png/webp/heic/mp4/mov/webm/pdf | `/api/inventory/upload` |
| `inventory-reports` | private | pdf | `/api/inventory/generate-pdf` |
| `portal-media` | private | jpg/png/webp/mp4/mov/webm | (reserved for portal media) |

RLS: every core table has Row Level Security enabled. The service-role key (used in API routes) bypasses RLS; the browser anon client respects it.

---

## 5. Service navigation flow

Driven by the **journey selector** at `/who-are-you` which writes the chosen role into `sessionStorage['3c_user_role']`. The role is also persisted to NextAuth's JWT after login.

```
/                                  → "Get Started"
  ↓
/who-are-you                       → pick role (PM/Tenant/Student)
  ↓
/services?role=<role>              → role-filtered service list
  ↓ click a service
  │
  ├── inventory  → /services/inventory       → DIY chooser
  │                    ├── DIY → /services/inventory/diy (4-step tool)
  │                    └── Agent → ServiceBookingForm modal
  │
  ├── maintenance → /services/maintenance    → ServiceBookingForm (type-select first)
  ├── midterm     → ServiceBookingForm
  ├── dispute     → ServiceBookingForm
  ├── deposit     → ServiceBookingForm        (role-gated to PM only)
  └── letting     → /services/letting-services → listings + Schedule Callback
```

All forms route through `/api/service-bookings` → row in `public.service_bookings` + Resend email to `contactus@3ccore.com`.

---

## 6. DIY inventory pipeline

```
Step 1 — property + report meta
  └── POST /api/inventory/reports
        └── inserts inventory_reports row (status_id = 'draft')

Step 2 — rooms + media
  ├── add room    → POST /api/inventory/rooms (upsert)
  ├── upload      → POST /api/inventory/upload (multipart)
  │                  ├── storage: inventory-media/{reportId}/{roomId|itemId}/{filename}
  │                  └── insert media row (auto_delete_at = NULL — never auto-deleted)
  ├── camera      → components/inventory/CameraCapture → File → upload
  └── add item    → POST /api/inventory/items (upsert)

Step 3 — review + AI analysis
  └── POST /api/inventory/analyse
        ├── flag OFF (default) → stubbed response, status_id → 'pending_review'
        └── flag ON            → Claude call (model from ANTHROPIC_MODEL)

Step 4 — download PDF
  └── POST /api/inventory/generate-pdf
        ├── jsPDF build (header + meta + rooms + items + signatures + footer)
        ├── upload to inventory-reports bucket
        ├── PATCH inventory_reports.pdf_url with signed URL
        └── stream the PDF back as attachment
```

Autosave:
- `localStorage['3c.diy.draft']` (debounced 600 ms) — survives reloads / lost connections
- `PATCH /api/inventory/reports` (debounced 1.2 s) — server-side draft when a `reportId` exists

---

## 7. Environment configuration

| Env var | Required? | Used for |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase client + Supabase Auth OTP |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | browser-side Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | server-side admin client (storage + DB writes that bypass RLS) |
| `NEXTAUTH_SECRET` | Yes | NextAuth JWT signing |
| `NEXTAUTH_URL` | Yes | NextAuth callbacks |
| `NEXT_PUBLIC_SITE_URL` | Yes | `emailRedirectTo` in OTP routes |
| `PORTAL_ADMIN_EMAIL` | Yes | admin login identity |
| `PORTAL_ADMIN_PASSWORD` | Yes | admin login secret (rotated via env-var change) |
| `RESEND_API_KEY` | Yes | Supabase SMTP + `/api/contact` + `/api/service-bookings` |
| `RESEND_FROM_EMAIL` | Optional | overrides default sender |
| `NEXT_PUBLIC_PHONE_OTP_ENABLED` | Optional (default `false`) | toggles SMS verification path |
| `NEXT_PUBLIC_AI_ANALYSIS_ENABLED` | Optional (default `false`) | toggles Claude analysis on DIY inventory |
| `ANTHROPIC_API_KEY` | Optional | required only when AI is enabled |
| `ANTHROPIC_MODEL` | Optional | defaults to `claude-sonnet-4-6` |
| `NEXT_PUBLIC_COMPANY_EMAIL` | Optional | overrides booking-email recipient (default `contactus@3ccore.com`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | When Stripe goes live | client publishable key |
| `STRIPE_SECRET_KEY` | When Stripe goes live | server secret |
| `STRIPE_WEBHOOK_SECRET` | When Stripe goes live | webhook signature |

---

## 8. Supabase dashboard configuration

Required for the auth flows to work end-to-end:

1. **Authentication → Providers → Email** — enabled (provides email/OTP).
2. **Authentication → URL Configuration** —
   - Site URL: `https://3ccore.com`
   - Redirect URLs allow-list: `https://3ccore.com`, `https://3ccore.com/**`, the Vercel preview URLs, and `http://localhost:3000`, `http://localhost:3000/**`.
3. **Authentication → Emails → SMTP Settings** — custom SMTP via Resend (`smtp.resend.com:465`, user `resend`, password = Resend API key, sender from a verified domain). Required to edit email templates.
4. **Authentication → Email Templates → Magic Link or OTP** AND **Confirm signup** — both updated to use `{{ .Token }}` so users receive a 6-digit code rather than a magic link.
5. **Storage** — three buckets created by migration 020 (`inventory-media`, `inventory-reports`, `portal-media`).
6. **SQL** — migrations `020_finalised_schema_with_lookups.sql` and `021_service_bookings_and_maintenance_types.sql` run.

---

## 9. Component map

```
app/layout.tsx
  └── Navbar / Footer (components/layout)

Home (app/page.tsx)
  ├── HeroSection
  ├── ServicesPreview → ServiceCard[]
  ├── WhyUs
  ├── StatsSection
  ├── Testimonials
  └── CTABanner

Portal pages
  ├── LoginForm (components/portal)
  │     ├── CustomerLoginForm
  │     └── AdminLoginForm (2-step OTP)
  ├── RegisterForm (2-step with email-exists banner)
  └── /portal/forgot-password (3-step inline)

Services
  ├── ServicePageHeader (components/layout)
  ├── ServiceBookingForm modal (components/booking) — shared across all 5 services
  └── DirectBookingPage helper (components/booking) — wraps the modal for direct-form services

DIY Inventory
  ├── RoomCard + ItemRow (inline in app/services/inventory/diy)
  ├── MediaTile + ThumbPreview
  └── CameraCapture modal (components/inventory)
```

---

## 10. Known limitations / next steps

- **NextAuth ↔ Supabase user mapping (BLOCKER 2).** Customer sessions live in NextAuth JWTs with synthetic IDs (`user-shubham-pm`, `user-1700000000`) that don't match `public.users.User_id` (UUIDs). FK fields are inserted as `NULL` in inventory writes, and RLS for the bucket can't be tightened until this is unified.
- **In-memory user store.** New customer registrations land in `lib/store.ts` which is reset between Vercel function instances. The Supabase `public.users` row (created by the auth trigger) is the durable record; we now check against it for duplicate-email guards.
- **Phone OTP** — code path is implemented but gated. Connect Twilio/MessageBird in Supabase Auth → Providers → Phone, then flip `NEXT_PUBLIC_PHONE_OTP_ENABLED=true`.
- **AI analysis** — flag-gated stub. Adds `ANTHROPIC_API_KEY` and flips `NEXT_PUBLIC_AI_ANALYSIS_ENABLED=true` to enable live Claude calls.
- **Stripe** — routes scaffolded but no live keys.
- **Chat scaffolding** — `chat_conversations` / `chat_messages` tables exist; widget UI shows "Coming Soon".
