-- ============================================================
-- Migration 012: Inventory Reports (Star Schema FACT tables)
-- Central fact table: inventory_reports
-- All FK chains back to profiles.id (user PK)
-- ============================================================

-- FACT: Inventory Reports
-- created_by FK → profiles.id  (the user who created the report)
-- assigned_agent_id FK → profiles.id
-- property_id FK → properties.id → owner_id FK → profiles.id
-- tenancy_id FK → tenancies.id → landlord_id/tenant_id FK → profiles.id
create table if not exists public.inventory_reports (
  id                  uuid primary key default uuid_generate_v4(),
  tenancy_id          uuid references public.tenancies(id) on delete set null,
  property_id         uuid not null references public.properties(id) on delete cascade,
  report_type         text not null check (report_type in ('check_in','check_out','midterm')),
  created_by          uuid not null references public.profiles(id),        -- USER PK
  assigned_agent_id   uuid references public.profiles(id),                 -- USER PK
  inspection_method   text not null default 'diy'
                        check (inspection_method in ('diy','professional')),
  status              text not null default 'draft'
                        check (status in (
                          'draft','ai_processing','pending_review',
                          'tenant_review','landlord_review',
                          'pending_signatures','completed','disputed'
                        )),
  ai_summary          jsonb,
  ai_processed_at     timestamptz,
  ai_model_version    text,
  pdf_url             text,
  pdf_generated_at    timestamptz,
  landlord_signed     boolean not null default false,
  landlord_signed_at  timestamptz,
  tenant_signed       boolean not null default false,
  tenant_signed_at    timestamptz,
  agent_signed        boolean not null default false,
  agent_signed_at     timestamptz,
  tenant_amendments   jsonb,
  amendments_approved boolean,
  retain_until        timestamptz,   -- lease end_date + 6 years (UK legal requirement)
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- FACT: Inventory Rooms (child of inventory_reports)
create table if not exists public.inventory_rooms (
  id                uuid primary key default uuid_generate_v4(),
  report_id         uuid not null references public.inventory_reports(id) on delete cascade,
  room_name         text not null,
  room_order        integer not null default 0,
  overall_condition text check (overall_condition in ('excellent','good','fair','poor','damaged')),
  ai_summary        text,
  notes             text,
  created_at        timestamptz not null default now()
);

-- FACT: Inventory Items (child of inventory_rooms)
create table if not exists public.inventory_items (
  id             uuid primary key default uuid_generate_v4(),
  room_id        uuid not null references public.inventory_rooms(id) on delete cascade,
  report_id      uuid not null references public.inventory_reports(id) on delete cascade,
  item_name      text not null,
  item_category  text check (item_category in (
                   'door','window','wall','ceiling','floor',
                   'appliance','fixture','fitting','furniture',
                   'electrical','plumbing','exterior','other'
                 )),
  condition      text check (condition in ('excellent','good','fair','poor','damaged','missing')),
  ai_description text,
  user_notes     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger inventory_reports_updated_at
  before update on public.inventory_reports
  for each row execute procedure public.handle_updated_at();

create trigger inventory_items_updated_at
  before update on public.inventory_items
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_inv_reports_created_by on public.inventory_reports(created_by);
create index if not exists idx_inv_reports_property   on public.inventory_reports(property_id);
create index if not exists idx_inv_reports_tenancy    on public.inventory_reports(tenancy_id);
create index if not exists idx_inv_reports_status     on public.inventory_reports(status);
create index if not exists idx_inv_reports_type       on public.inventory_reports(report_type);
create index if not exists idx_inv_rooms_report       on public.inventory_rooms(report_id);
create index if not exists idx_inv_items_room         on public.inventory_items(room_id);
create index if not exists idx_inv_items_report       on public.inventory_items(report_id);
