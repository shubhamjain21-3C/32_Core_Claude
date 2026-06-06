# 3C Core — Blockers & Pending Setup

This document tracks items that are blocked pending external credentials,
third-party setup, or architectural decisions.

---

## BLOCKER 1: Supabase Project Credentials

**Status:** Not configured  
**Blocks:** Database migrations, auth, storage, RLS policies  

**Required actions:**
1. Create project at supabase.com
2. Copy Project URL and anon key → add to Vercel env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Run migrations: `npx supabase db push` (requires `supabase login` first)

**Migrations ready to run** (`supabase/migrations/`):
- `010_add_user_role_journey.sql`
- `011_properties_and_tenancies.sql`
- `012_inventory_reports.sql`
- `013_inventory_media.sql`
- `014_payments.sql`
- `015_letting_services.sql`
- `016_storage_buckets_extended.sql`
- `017_rls_extended.sql`

---

## BLOCKER 2: Auth Migration — NextAuth → Supabase Auth

**Status:** Not started — requires planning  
**Blocks:** User accounts, portal login, role-based access  

Currently using NextAuth.js. All new DB tables use `profiles.id` (UUID from
Supabase Auth) as the central FK (star schema). Migration plan required:

1. Set up Supabase Auth (email + password provider)
2. Create trigger: `auth.users` → `public.profiles` on new user signup
3. Replace `useSession()` (NextAuth) with `useUser()` (Supabase) throughout
4. Remove `next-auth` dependency once migrated

**Do not break** existing portal login flow until migration is ready.

---

## BLOCKER 3: Anthropic API Key (Production)

**Status:** Not added to Vercel  
**Blocks:** AI Inventory DIY tool (`/services/inventory/diy`)  

- Add `ANTHROPIC_API_KEY` to Vercel environment variables (Production + Preview)
- The route `/api/inventory/analyse` returns 503 when key is absent

---

## BLOCKER 4: Stripe Live Keys

**Status:** Not obtained  
**Blocks:** Payment processing  

- Obtain Stripe live publishable + secret keys from stripe.com dashboard
- Add to Vercel: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`
- Configure webhook: `STRIPE_WEBHOOK_SECRET` (from Stripe dashboard → Webhooks)
- Webhook endpoint URL: `https://3ccore.com/api/payments/webhook`

---

## BLOCKER 5: PDF Report Generation

**Status:** Stub only (returns 501)  
**Blocks:** Inventory report download as PDF  

- Route `/api/inventory/generate-pdf` currently returns 501
- Requires: `@react-pdf/renderer` or Puppeteer for server-side PDF generation
- Install: `npm install @react-pdf/renderer`
- Alternative: generate HTML, use headless Chrome via Vercel serverless

---

## BLOCKER 6: Resend Domain Verification

**Status:** DNS records added — pending propagation confirmation  
**Blocks:** Sending from `contactus@3ccore.com`  

- Until verified, fallback sender is `onboarding@resend.dev`
- Check status: Resend dashboard → Domains → 3ccore.com
- Once verified, set `RESEND_FROM_EMAIL=contactus@3ccore.com` in Vercel

---

## Non-blocking TODOs

- Dashboard (`app/portal/customer/dashboard/page.tsx`): role-specific sections
- Subscription plan pages
- Property listing integration (Rightmove/Zoopla API)
- `npx supabase gen types typescript` — generate TypeScript types from schema
