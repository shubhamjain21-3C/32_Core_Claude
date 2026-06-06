-- ============================================================
-- Migration 013: Inventory Media & Portal Media
-- Star schema: uploaded_by FK → profiles.id (user PK)
-- Long-term storage: retain_until = lease end + 6 years (UK law)
-- Portal media: auto-delete after 30 days
-- ============================================================

-- FACT: Inventory Media (long-term — exempt from 30-day cleanup)
-- uploaded_by FK → profiles.id (USER PK — central star)
create table if not exists public.inventory_media (
  id               uuid primary key default uuid_generate_v4(),
  report_id        uuid not null references public.inventory_reports(id) on delete cascade,
  room_id          uuid references public.inventory_rooms(id) on delete set null,
  item_id          uuid references public.inventory_items(id) on delete set null,
  uploaded_by      uuid not null references public.profiles(id),   -- USER PK (star centre)
  file_name        text not null,
  file_type        text not null check (file_type in ('image','video')),
  mime_type        text not null,
  file_size_bytes  bigint,
  storage_path     text not null,   -- inventory-media/{report_id}/{room_name}/{file}
  public_url       text,
  thumbnail_url    text,
  ai_analysis      jsonb,           -- {condition, description, items_detected, confidence}
  ai_analysed_at   timestamptz,
  upload_source    text check (upload_source in ('landlord','tenant','agent','system')),
  retain_until     timestamptz,     -- set to tenancy end_date + 6 years on completion
  created_at       timestamptz not null default now()
);

-- FACT: Portal Media (general uploads — auto-delete after 30 days)
-- uploaded_by FK → profiles.id (USER PK — star centre)
create table if not exists public.portal_media (
  id               uuid primary key default uuid_generate_v4(),
  uploaded_by      uuid not null references public.profiles(id),   -- USER PK (star centre)
  tenancy_id       uuid references public.tenancies(id) on delete cascade,
  file_name        text not null,
  file_type        text not null check (file_type in ('image','video','document')),
  mime_type        text,
  file_size_bytes  bigint,
  storage_path     text not null,
  public_url       text,
  description      text,
  auto_delete_at   timestamptz not null default (now() + interval '30 days'),
  deleted_at       timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_inv_media_uploaded_by on public.inventory_media(uploaded_by);
create index if not exists idx_inv_media_report      on public.inventory_media(report_id);
create index if not exists idx_inv_media_item        on public.inventory_media(item_id);
create index if not exists idx_portal_media_user     on public.portal_media(uploaded_by);
create index if not exists idx_portal_media_del      on public.portal_media(auto_delete_at)
  where deleted_at is null;
