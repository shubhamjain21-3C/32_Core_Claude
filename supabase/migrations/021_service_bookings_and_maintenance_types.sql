-- ============================================================
-- 021_service_bookings_and_maintenance_types.sql
-- 3C CORE — Service booking flow
--   1. ref_maintenance_types lookup (matches existing ref_* pattern)
--   2. service_bookings table for callback / booking requests
-- Depends on: 020_finalised_schema_with_lookups.sql
-- Run in Supabase SQL Editor
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. ref_maintenance_types
-- ────────────────────────────────────────────────────────────
create table if not exists public.ref_maintenance_types (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

insert into public.ref_maintenance_types (code, label, sort_order) values
  ('gas_safety',     'Gas Safety Certificate',         1),
  ('eicr',           'EICR (Electrical)',              2),
  ('epc',            'EPC (Energy Performance)',       3),
  ('legionella',     'Legionella Risk Assessment',     4),
  ('pat_testing',    'PAT Testing',                    5),
  ('licensing',      'Property Licensing (HMO etc.)',  6),
  ('cleaning',       'Cleaning Service',               7),
  ('general_repair', 'General Repair / Maintenance',   8),
  ('other',          'Other',                          9)
on conflict (code) do nothing;

alter table public.ref_maintenance_types enable row level security;

drop policy if exists "ref_maintenance_types read active"
  on public.ref_maintenance_types;
create policy "ref_maintenance_types read active"
  on public.ref_maintenance_types for select
  using (is_active = true);


-- ────────────────────────────────────────────────────────────
-- 2. service_bookings
-- One row per booking / callback request submitted via the
-- shared ServiceBookingForm. Stores user/service references as
-- FK ids (resolved from lookups) so reports stay consistent.
-- ────────────────────────────────────────────────────────────
create table if not exists public.service_bookings (
  "Booking_Id"          uuid primary key default gen_random_uuid(),
  "User_id"             uuid references public.users("User_id") on delete set null,

  -- Auto-filled from session / journey
  service_type_id       int  references public.ref_service_types(id),
  portal_role_id        int  references public.ref_portal_roles(id),

  -- Snapshot of the user info at the time of booking (works for guests too)
  full_name             text not null,
  email                 text not null,
  phone                 text,

  -- Sub-type for maintenance bookings (null for other services)
  maintenance_type_id   int  references public.ref_maintenance_types(id),

  -- User-supplied details
  summary               text not null,
  service_date          date not null,
  call_back_time        text not null,

  -- Audit / delivery
  email_sent            boolean not null default false,
  notes                 text,
  created_at            timestamptz not null default now()
);

create index if not exists idx_bookings_user      on public.service_bookings("User_id");
create index if not exists idx_bookings_service   on public.service_bookings(service_type_id);
create index if not exists idx_bookings_maint     on public.service_bookings(maintenance_type_id);
create index if not exists idx_bookings_created   on public.service_bookings(created_at desc);

alter table public.service_bookings enable row level security;

-- Users see their own bookings; admins see all
drop policy if exists "service_bookings owner or admin" on public.service_bookings;
create policy "service_bookings owner or admin"
  on public.service_bookings for all
  using ("User_id" = auth.uid() or public.is_admin())
  with check ("User_id" = auth.uid() or public.is_admin());

-- Allow anonymous inserts (guest callback requests) — the API uses the service
-- role key for inserts, so RLS doesn't apply to server writes; this policy is
-- only relevant if the anon key is ever used client-side.
drop policy if exists "service_bookings anon insert" on public.service_bookings;
create policy "service_bookings anon insert"
  on public.service_bookings for insert
  with check (true);


-- ────────────────────────────────────────────────────────────
-- 3. (Optional) row counts for verification
-- ────────────────────────────────────────────────────────────
-- select 'ref_maintenance_types' as table, count(*) from public.ref_maintenance_types
-- union all select 'service_bookings', count(*) from public.service_bookings;
