# Changes Summary

> Two batches of work — keep the OTP + service-navigation rework from the previous PR, and add the new DIY Inventory Report page on top.

Branch: `dev` → PR to `main`

---

# Batch 2 — DIY Inventory Report (this PR)

## 1. New route — `/services/inventory/diy`

The Do-It-Yourself inventory tool a tenant or property manager uses to capture a property's condition themselves. Four-step flow built end-to-end with persistence:

1. **Property & report details** — report type (from `ref_report_types`), inspection date, inspector name (auto-filled from session), address. "Start Report" creates a draft `inventory_reports` row.
2. **Rooms & media** — add/reorder/remove rooms, room type (`ref_room_types`), condition (`ref_condition_levels`), notes, plus two media inputs (upload + live camera) and optional items per room (`ref_item_types`).
3. **Review & analyse** — full edit-in-place view of every room and its captured media. "Generate Report with AI" calls the analyse route. AI is flag-gated (see section 3).
4. **Download PDF** — server-side jspdf-generated PDF with 3C Core branding, room list, item table, signature blocks, and footer. Saved to the `inventory-reports` bucket when possible.

Autosave is on for both:
- `localStorage` (every change, debounced 600 ms) so anonymous users don't lose work
- `PATCH /api/inventory/reports` (every change, debounced 1.2 s) when a `reportId` exists

## 2. API routes added / rewritten

| Route | Method | Purpose |
|---|---|---|
| `/api/inventory/reports` | POST | Create a draft `inventory_reports` row (best-effort: returns a client-side UUID if Supabase is unavailable). |
| `/api/inventory/reports` | PATCH | Autosave: update `clerk_notes`, `ai_summary`, `pdf_url`, `status_id` (via `ref_report_status` code). |
| `/api/inventory/rooms` | POST | Upsert a room under a report. Resolves `ref_room_types` / `ref_condition_levels`. |
| `/api/inventory/rooms` | DELETE | Remove a room by id. |
| `/api/inventory/items` | POST | Upsert an item under a room. Resolves `ref_item_types` / `ref_condition_levels`. |
| `/api/inventory/items` | DELETE | Remove an item by id. |
| `/api/inventory/upload` | POST | Multipart upload — stores in `inventory-media` bucket at `{reportId}/{roomId or itemId}/{filename}`. Inserts `media` row with `entity_type` resolved from `ref_entity_types`, `media_type` from `ref_media_types`, `auto_delete_at = NULL` (inventory media is retained, never auto-deleted). Returns a 7-day signed URL. |
| `/api/inventory/upload` | DELETE | Remove a previously-uploaded file. |
| `/api/inventory/analyse` | POST | **Flag-gated stub.** When `NEXT_PUBLIC_AI_ANALYSIS_ENABLED=false` (default) or `ANTHROPIC_API_KEY` missing, returns a stubbed analysis without breaking the flow. When enabled, calls Claude via `lib/anthropic.ts` (model defaults to `claude-sonnet-4-6`, override with `ANTHROPIC_MODEL`). |
| `/api/inventory/generate-pdf` | POST | Server-side jspdf builder. Header with 3C Core address (Office 818, Pride Park, Derby), meta block, per-room sections with item tables, signature blocks (Landlord/Tenant/Agent), per-page footer with `contactus@3ccore.com` and page numbers. PDF is uploaded to the `inventory-reports` bucket when `reportId` is supplied and `pdf_url` is written back to the report row. Browser receives the PDF as an attachment. |

All routes degrade gracefully when Supabase is unavailable (missing env vars, FK constraints because NextAuth user IDs don't exist in `public.users` yet) — the page keeps working with local UUIDs and `localStorage`.

## 3. AI integration — clearly stubbed, ready to wire

- `lib/anthropic.ts` now exports `AI_ANALYSIS_ENABLED`, `hasAnthropicKey`, `anthropic`, and `CLAUDE_MODEL`.
- `/api/inventory/analyse` returns `stubbed: true` and `{ "message": "AI analysis is disabled. Set NEXT_PUBLIC_AI_ANALYSIS_ENABLED=true (and ANTHROPIC_API_KEY on the server) to enable Claude-powered reports." }` when the flag is off.
- DIY page shows an amber warning banner when stubbed, and the PDF is still generated from user-entered data.

### To enable AI later
1. Add `ANTHROPIC_API_KEY` to Vercel (Production + Preview) — mark as sensitive.
2. Add `NEXT_PUBLIC_AI_ANALYSIS_ENABLED=true` to Vercel (Production + Preview).
3. (Optional) Override the model with `ANTHROPIC_MODEL` (e.g. `claude-opus-4-7` once available).
4. Redeploy. The `/api/inventory/analyse` route will start calling Claude.

The `TODO` comment in `app/api/inventory/analyse/route.ts` flags the parallelisation, persistence-to-rooms, and model-bump considerations for the next iteration.

## 4. New component — `components/inventory/CameraCapture.tsx`

Live `getUserMedia` camera modal with:
- Permission request flow (idle → requesting → granted)
- Front/back camera switch (`facingMode`)
- Capture → preview → retake / use-photo
- Graceful fallback: if permission is denied or no camera is available, swaps to a `<input type="file" capture="environment">` so the user can still proceed
- All controls labelled, no emojis, Lucide icons throughout
- Body scroll lock when open; cleans up the `MediaStream` on close

## 5. Files touched

### Added
- `app/api/inventory/reports/route.ts`
- `app/api/inventory/rooms/route.ts`
- `app/api/inventory/items/route.ts`
- `app/api/inventory/upload/route.ts`
- `components/inventory/CameraCapture.tsx`

### Rewritten
- `app/services/inventory/diy/page.tsx` — full 4-step rebuild with proper persistence + camera
- `app/api/inventory/analyse/route.ts` — added flag gate + stub
- `app/api/inventory/generate-pdf/route.ts` — real jspdf builder replacing the 501 stub
- `lib/anthropic.ts` — added feature flag + model export
- `.env.local.example` — documented `NEXT_PUBLIC_AI_ANALYSIS_ENABLED` and `ANTHROPIC_MODEL`

## 6. Acceptance checklist

- [x] `/services/inventory/diy` builds and renders in the existing amber/gold design
- [x] Property & report detail step creates an `inventory_reports` draft (best-effort)
- [x] Add / edit / reorder / collapse rooms; room type + condition driven by lookups
- [x] Upload images & videos (multi-select) AND live camera capture (with fallback)
- [x] Media saved to `inventory-media` bucket + `media` rows (`auto_delete_at = NULL`)
- [x] Optional items per room with their own media + condition
- [x] Review screen with full edit capability (room summary, item descriptions, notes)
- [x] `/api/inventory/analyse` exists, flag-gated, doesn't break the flow when off
- [x] `lib/anthropic.ts` exposes the flag + model — documented for wiring later
- [x] `/api/inventory/generate-pdf` produces a real PDF from entered data, saved to storage
- [x] Autosave (local + server) + resume from `localStorage` works
- [x] Anonymous-user prompt to create an account before final save
- [x] `npm run build` passes; committed to dev; PR opened to main

## 7. Required Supabase Dashboard / env steps

(in addition to the previous batch — see section in batch 1 below)

- Migration `020_finalised_schema_with_lookups.sql` must already be run (creates `inventory_reports`, `inventory_rooms`, `inventory_items`, `media`, and the `inventory-media` / `inventory-reports` buckets).
- For AI: add `ANTHROPIC_API_KEY` + `NEXT_PUBLIC_AI_ANALYSIS_ENABLED=true` to Vercel.
- No new SQL migration needed for the DIY page itself — it reuses existing tables.

## 8. Known limitations / next steps

- **NextAuth ↔ Supabase user mapping.** `lib/store.ts` uses synthetic user IDs (`user-shubham-pm`) that don't exist in `public.users` — so the report's `User_Id` FK is currently inserted as `null`. The page continues to work; replace `lib/store.ts` with the Supabase Auth migration (BLOCKER 2) to wire ownership through.
- **Bucket RLS.** Uploads use the service-role key (server-only). Browser-side direct uploads will need a Supabase Auth session before they can satisfy the `inventory-media` bucket policy.
- **Video uploads** save and store fine but aren't sent to the Claude analyse call (Claude doesn't accept videos through this prompt).

---

# Batch 1 — OTP fix + Service Navigation Rework (already on this branch)

(Kept for context — see the file history; no new work needed here.)

- Email OTP standardised on Supabase Auth (`signInWithOtp` / `verifyOtp({ type: 'email' })`).
- Phone OTP gated behind `NEXT_PUBLIC_PHONE_OTP_ENABLED` (default false), SMS tile shows "Soon".
- Custom `lib/otp-store.ts` removed.
- Old Description / FAQs / Prices / Book Now 4-tab page removed from every service.
- New shared `ServiceBookingForm` modal with auto-filled role / name / service.
- `/api/service-bookings` persists to `service_bookings` and emails `contactus@3ccore.com`.
- Migration `021_service_bookings_and_maintenance_types.sql` adds `ref_maintenance_types` + `service_bookings`.

## Required Supabase Dashboard steps (batch 1)

1. Run `supabase/migrations/021_service_bookings_and_maintenance_types.sql` in SQL Editor.
2. Supabase → Authentication → Providers → Email → enable Email OTP.
3. Supabase → Authentication → URL Configuration → add production + Vercel preview URLs.

## Required Vercel env vars (batch 1 + 2)

| Key | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | |
| `SUPABASE_SERVICE_ROLE_KEY` | Sensitive — backend only |
| `NEXT_PUBLIC_SITE_URL` | Used in `emailRedirectTo` |
| `NEXT_PUBLIC_PHONE_OTP_ENABLED` | Default `false` |
| `RESEND_API_KEY` | For booking emails |
| `RESEND_FROM_EMAIL` | Optional sender override |
| `ANTHROPIC_API_KEY` | Sensitive — only required when enabling AI |
| `ANTHROPIC_MODEL` | Optional — defaults to `claude-sonnet-4-6` |
| `NEXT_PUBLIC_AI_ANALYSIS_ENABLED` | Default `false` |
