-- ============================================================
-- 020_finalised_schema_with_lookups.sql
-- 3C CORE — Finalised Schema v2
-- Supersedes migrations 010–017 (never applied to production)
-- Run this in Supabase SQL Editor
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 0. EXTENSIONS & SHARED FUNCTION
-- ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper: is the current user an admin?
-- Uses plpgsql (not sql) so table ref is resolved at runtime, not parse time
create or replace function public.is_admin()
returns boolean language plpgsql security definer as $$
begin
  return coalesce(
    (select true from public.users
     where "User_id" = auth.uid()
       and portal_role_id = (
         select id from public.ref_portal_roles where code = 'admin' limit 1
       )),
    false
  );
end;
$$;


-- ────────────────────────────────────────────────────────────
-- 1. DROP SUPERSEDED DRAFT TABLES (010–017, never in prod)
-- ────────────────────────────────────────────────────────────
drop table if exists public.chat_messages       cascade;
drop table if exists public.chat_conversations  cascade;
drop table if exists public.letting_enquiries   cascade;
drop table if exists public.payments            cascade;
drop table if exists public.portal_media        cascade;
drop table if exists public.inventory_media     cascade;
drop table if exists public.inventory_items     cascade;
drop table if exists public.inventory_rooms     cascade;
drop table if exists public.inventory_reports   cascade;
drop table if exists public.tenancies           cascade;
drop table if exists public.properties          cascade;
drop table if exists public.journey_sessions    cascade;
drop table if exists public.profiles            cascade;


-- ────────────────────────────────────────────────────────────
-- 2. LOOKUP (ref_*) TABLES
-- Identical structure for every lookup table.
-- ref_* tables are publicly readable (is_active rows only).
-- ────────────────────────────────────────────────────────────

create table if not exists public.ref_portal_roles (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_property_types (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_property_status (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_tenancy_status (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_furnished_types (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_letting_status (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_report_types (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_report_status (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_condition_levels (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_room_types (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_item_types (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_entity_types (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_media_types (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_service_types (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_service_status (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.ref_chat_roles (
  id          int generated always as identity primary key,
  code        text not null unique,
  label       text not null,
  description text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  flags       jsonb not null default '{}',
  created_at  timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────
-- 3. SEED LOOKUP TABLES
-- ────────────────────────────────────────────────────────────

insert into public.ref_portal_roles (code, label, sort_order) values
  ('property_manager', 'Property Manager', 1),
  ('landlord',         'Landlord',          2),
  ('tenant',           'Tenant',            3),
  ('student',          'Student',           4),
  ('admin',            'Admin',             5)
on conflict (code) do nothing;

insert into public.ref_property_types (code, label, sort_order) values
  ('residential',  'Residential',  1),
  ('hmo',          'HMO',          2),
  ('commercial',   'Commercial',   3),
  ('student',      'Student',      4),
  ('holiday_let',  'Holiday Let',  5)
on conflict (code) do nothing;

insert into public.ref_property_status (code, label, sort_order) values
  ('occupied',          'Occupied',          1),
  ('vacant',            'Vacant',            2),
  ('under_management',  'Under Management',  3),
  ('for_letting',       'For Letting',       4)
on conflict (code) do nothing;

insert into public.ref_tenancy_status (code, label, sort_order) values
  ('pending', 'Pending', 1),
  ('active',  'Active',  2),
  ('ended',   'Ended',   3)
on conflict (code) do nothing;

insert into public.ref_furnished_types (code, label, sort_order) values
  ('furnished',       'Furnished',       1),
  ('unfurnished',     'Unfurnished',     2),
  ('part_furnished',  'Part Furnished',  3)
on conflict (code) do nothing;

insert into public.ref_letting_status (code, label, sort_order) values
  ('available',  'Available',  1),
  ('let_agreed', 'Let Agreed', 2),
  ('let',        'Let',        3),
  ('withdrawn',  'Withdrawn',  4)
on conflict (code) do nothing;

insert into public.ref_report_types (code, label, sort_order) values
  ('check_in',  'Check In',  1),
  ('check_out', 'Check Out', 2),
  ('midterm',   'Midterm',   3),
  ('periodic',  'Periodic',  4)
on conflict (code) do nothing;

insert into public.ref_report_status (code, label, sort_order) values
  ('draft',           'Draft',           1),
  ('pending_review',  'Pending Review',  2),
  ('signed',          'Signed',          3),
  ('completed',       'Completed',       4)
on conflict (code) do nothing;

insert into public.ref_condition_levels (code, label, sort_order) values
  ('excellent',      'Excellent',       1),
  ('good',           'Good',            2),
  ('fair',           'Fair',            3),
  ('poor',           'Poor',            4),
  ('missing',        'Missing',         5),
  ('not_applicable', 'Not Applicable',  6)
on conflict (code) do nothing;

insert into public.ref_room_types (code, label, sort_order) values
  ('bedroom',      'Bedroom',      1),
  ('living_room',  'Living Room',  2),
  ('kitchen',      'Kitchen',      3),
  ('bathroom',     'Bathroom',     4),
  ('hallway',      'Hallway',      5),
  ('garden',       'Garden',       6),
  ('garage',       'Garage',       7),
  ('other',        'Other',        8)
on conflict (code) do nothing;

insert into public.ref_item_types (code, label, sort_order) values
  ('ac',            'Air Conditioner',   1),
  ('geyser',        'Geyser/Water Heater',2),
  ('washer_dryer',  'Washer/Dryer',      3),
  ('fridge',        'Fridge',            4),
  ('oven',          'Oven',              5),
  ('dishwasher',    'Dishwasher',        6),
  ('other',         'Other',             7)
on conflict (code) do nothing;

insert into public.ref_entity_types (code, label, sort_order) values
  ('property',          'Property',          1),
  ('inventory_report',  'Inventory Report',  2),
  ('inventory_room',    'Inventory Room',    3),
  ('inventory_item',    'Inventory Item',    4),
  ('maintenance',       'Maintenance',       5),
  ('dispute',           'Dispute',           6)
on conflict (code) do nothing;

insert into public.ref_media_types (code, label, sort_order) values
  ('image',    'Image',    1),
  ('video',    'Video',    2),
  ('document', 'Document', 3),
  ('pdf',      'PDF',      4)
on conflict (code) do nothing;

insert into public.ref_service_types (code, label, sort_order) values
  ('inventory',   'Inventory Management',      1),
  ('maintenance', 'Maintenance & Cleaning',    2),
  ('midterm',     'Midterm Inspection',        3),
  ('dispute',     'Dispute Resolution',        4),
  ('deposit',     'Deposit Negotiation',       5),
  ('letting',     'Letting Services',          6)
on conflict (code) do nothing;

insert into public.ref_service_status (code, label, sort_order) values
  ('active',    'Active',    1),
  ('paused',    'Paused',    2),
  ('completed', 'Completed', 3)
on conflict (code) do nothing;

insert into public.ref_chat_roles (code, label, sort_order) values
  ('user',      'User',      1),
  ('assistant', 'Assistant', 2)
on conflict (code) do nothing;


-- ────────────────────────────────────────────────────────────
-- 4. CORE TABLES
-- ────────────────────────────────────────────────────────────

-- 4a. users (replaces profiles)
create table if not exists public.users (
  "User_id"       uuid primary key references auth.users(id) on delete cascade,
  "FirstName"     text not null default '',
  "MiddleName"    text,
  "Lastname"      text not null default '',
  "Email"         text not null unique,
  "Phone"         text,
  "Company"       text,
  portal_role_id  int references public.ref_portal_roles(id),
  avatar_url      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_users_email    on public.users("Email");
create index if not exists idx_users_role     on public.users(portal_role_id);

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

-- Auto-create user row on Supabase Auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  _default_role_id int;
begin
  select id into _default_role_id from public.ref_portal_roles where code = 'tenant' limit 1;
  insert into public.users ("User_id", "Email", "FirstName", portal_role_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email,'@',1)),
    _default_role_id
  )
  on conflict ("User_id") do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4b. properties
create table if not exists public.properties (
  "Property_Id"     uuid primary key default gen_random_uuid(),
  "User_id"         uuid not null references public.users("User_id") on delete cascade,
  address_line1     text not null,
  address_line2     text,
  city              text not null default 'London',
  postcode          text not null,
  country           text not null default 'UK',
  property_type_id  int  references public.ref_property_types(id),
  bedrooms          int  not null default 0,
  bathrooms         int  not null default 0,
  monthly_rent      numeric(10,2),
  status_id         int  references public.ref_property_status(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_properties_user     on public.properties("User_id");
create index if not exists idx_properties_postcode on public.properties(postcode);
create index if not exists idx_properties_status   on public.properties(status_id);

create trigger properties_updated_at
  before update on public.properties
  for each row execute procedure public.handle_updated_at();


-- 4c. property_tenancies
create table if not exists public.property_tenancies (
  "Tenant_id"  uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties("Property_Id") on delete cascade,
  "User_id"    uuid not null references public.users("User_id"),
  start_date   date not null,
  end_date     date,
  rent_amount  numeric(10,2) not null,
  status_id    int references public.ref_tenancy_status(id),
  created_at   timestamptz not null default now(),
  unique (property_id, "Tenant_id", start_date)
);

create index if not exists idx_tenancies_property on public.property_tenancies(property_id);
create index if not exists idx_tenancies_user     on public.property_tenancies("User_id");


-- 4d. property_lettings
create table if not exists public.property_lettings (
  "Letting_Id"        uuid primary key default gen_random_uuid(),
  property_id         uuid not null references public.properties("Property_Id") on delete cascade,
  "User_Id"           uuid references public.users("User_id"),
  asking_rent         numeric(10,2),
  available_from      date,
  description         text,
  furnished_id        int references public.ref_furnished_types(id),
  min_tenancy_months  int,
  status_id           int references public.ref_letting_status(id),
  created_at          timestamptz not null default now()
);

create index if not exists idx_lettings_property on public.property_lettings(property_id);
create index if not exists idx_lettings_status   on public.property_lettings(status_id);


-- 4e. inventory_reports
create table if not exists public.inventory_reports (
  "InventoryReport_id"  uuid primary key default gen_random_uuid(),
  property_id           uuid not null references public.properties("Property_Id") on delete cascade,
  report_type_id        int  not null references public.ref_report_types(id),
  "User_Id"             uuid references public.users("User_id"),
  tenant_id             uuid references public.users("User_id"),
  status_id             int  references public.ref_report_status(id),
  ai_generated          boolean not null default false,
  overall_condition_id  int  references public.ref_condition_levels(id),
  clerk_notes           text,
  ai_summary            text,
  signed_at             timestamptz,
  signed_by_tenant      boolean not null default false,
  signed_by_manager     boolean not null default false,
  pdf_url               text,
  retain_until          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_inv_reports_property on public.inventory_reports(property_id);
create index if not exists idx_inv_reports_type     on public.inventory_reports(report_type_id);
create index if not exists idx_inv_reports_status   on public.inventory_reports(status_id);
create index if not exists idx_inv_reports_user     on public.inventory_reports("User_Id");

create trigger inventory_reports_updated_at
  before update on public.inventory_reports
  for each row execute procedure public.handle_updated_at();


-- 4f. inventory_rooms
create table if not exists public.inventory_rooms (
  "InventoryRoom_Id"   uuid primary key default gen_random_uuid(),
  "InventoryReport_id" uuid not null references public.inventory_reports("InventoryReport_id") on delete cascade,
  room_name            text not null,
  room_type_id         int  references public.ref_room_types(id),
  condition_id         int  references public.ref_condition_levels(id),
  clerk_notes          text,
  ai_description       text,
  sort_order           int  not null default 0
);

create index if not exists idx_inv_rooms_report on public.inventory_rooms("InventoryReport_id");


-- 4g. inventory_items
create table if not exists public.inventory_items (
  "InventoryItem_id"  uuid primary key default gen_random_uuid(),
  room_id             uuid not null references public.inventory_rooms("InventoryRoom_Id") on delete cascade,
  item_type_id        int  references public.ref_item_types(id),
  item_label          text,
  quantity            int  not null default 1,
  condition_id        int  references public.ref_condition_levels(id),
  clerk_notes         text,
  ai_description      text,
  sort_order          int  not null default 0
);

create index if not exists idx_inv_items_room on public.inventory_items(room_id);


-- 4h. media (polymorphic)
create table if not exists public.media (
  "Media_id"      uuid primary key default gen_random_uuid(),
  entity_type_id  int  not null references public.ref_entity_types(id),
  entity_id       uuid not null,
  storage_path    text not null,
  public_url      text not null,
  media_type_id   int  references public.ref_media_types(id),
  caption         text,
  ai_analysis     text,
  "User_Id"       uuid references public.users("User_id"),
  auto_delete_at  timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_media_entity on public.media(entity_type_id, entity_id);
create index if not exists idx_media_user   on public.media("User_Id");


-- 4i. services
create table if not exists public.services (
  "Service_Id"     uuid primary key default gen_random_uuid(),
  property_id      uuid references public.properties("Property_Id") on delete set null,
  "User_id"        uuid not null references public.users("User_id"),
  service_type_id  int  references public.ref_service_types(id),
  status_id        int  references public.ref_service_status(id),
  start_date       date not null,
  end_date         date,
  notes            text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_services_user     on public.services("User_id");
create index if not exists idx_services_property on public.services(property_id);
create index if not exists idx_services_type     on public.services(service_type_id);


-- 4j. chat_conversations
create table if not exists public.chat_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users("User_id") on delete set null,
  session_id  text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_chat_conv_user    on public.chat_conversations(user_id);
create index if not exists idx_chat_conv_session on public.chat_conversations(session_id);


-- 4k. chat_messages
create table if not exists public.chat_messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.chat_conversations(id) on delete cascade,
  role_id          int  not null references public.ref_chat_roles(id),
  content          text not null,
  navigation_links jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists idx_chat_msg_conv on public.chat_messages(conversation_id);


-- ────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

-- ref_* tables: everyone can read active rows; only admins write
do $$ declare t text;
begin
  foreach t in array array[
    'ref_portal_roles','ref_property_types','ref_property_status',
    'ref_tenancy_status','ref_furnished_types','ref_letting_status',
    'ref_report_types','ref_report_status','ref_condition_levels',
    'ref_room_types','ref_item_types','ref_entity_types',
    'ref_media_types','ref_service_types','ref_service_status','ref_chat_roles'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Public read active %I"
       on public.%I for select using (is_active = true)', t, t
    );
  end loop;
end $$;

-- core tables RLS
alter table public.users               enable row level security;
alter table public.properties          enable row level security;
alter table public.property_tenancies  enable row level security;
alter table public.property_lettings   enable row level security;
alter table public.inventory_reports   enable row level security;
alter table public.inventory_rooms     enable row level security;
alter table public.inventory_items     enable row level security;
alter table public.media               enable row level security;
alter table public.services            enable row level security;
alter table public.chat_conversations  enable row level security;
alter table public.chat_messages       enable row level security;

-- users
create policy "Users read own row"
  on public.users for select using ("User_id" = auth.uid() or public.is_admin());
create policy "Users update own row"
  on public.users for update using ("User_id" = auth.uid()) with check ("User_id" = auth.uid());

-- properties
create policy "Owner manages properties"
  on public.properties for all using ("User_id" = auth.uid() or public.is_admin());

-- property_tenancies
create policy "Tenancy: landlord or tenant access"
  on public.property_tenancies for select
  using (
    "User_id" = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.properties p
      where p."Property_Id" = property_tenancies.property_id
        and p."User_id" = auth.uid()
    )
  );
create policy "Tenancy: owner manages"
  on public.property_tenancies for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.properties p
      where p."Property_Id" = property_tenancies.property_id
        and p."User_id" = auth.uid()
    )
  );

-- property_lettings
create policy "Lettings: owner or admin"
  on public.property_lettings for all
  using (
    "User_Id" = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.properties p
      where p."Property_Id" = property_lettings.property_id
        and p."User_id" = auth.uid()
    )
  );

-- inventory_reports
create policy "Reports: involved parties"
  on public.inventory_reports for select
  using (
    "User_Id" = auth.uid()
    or tenant_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.properties p
      where p."Property_Id" = inventory_reports.property_id
        and p."User_id" = auth.uid()
    )
  );
create policy "Reports: creator manages"
  on public.inventory_reports for all
  using ("User_Id" = auth.uid() or public.is_admin());

-- inventory_rooms
create policy "Rooms: via report"
  on public.inventory_rooms for all
  using (
    exists (
      select 1 from public.inventory_reports r
      where r."InventoryReport_id" = inventory_rooms."InventoryReport_id"
        and (r."User_Id" = auth.uid() or public.is_admin())
    )
  );

-- inventory_items
create policy "Items: via room report"
  on public.inventory_items for all
  using (
    exists (
      select 1 from public.inventory_rooms rm
      join public.inventory_reports r on r."InventoryReport_id" = rm."InventoryReport_id"
      where rm."InventoryRoom_Id" = inventory_items.room_id
        and (r."User_Id" = auth.uid() or public.is_admin())
    )
  );

-- media
create policy "Media: uploader or admin"
  on public.media for select using ("User_Id" = auth.uid() or public.is_admin());
create policy "Media: upload by auth users"
  on public.media for insert with check (auth.uid() is not null);

-- services
create policy "Services: owner or admin"
  on public.services for all using ("User_id" = auth.uid() or public.is_admin());

-- chat_conversations
create policy "Chat: public insert"
  on public.chat_conversations for insert with check (true);
create policy "Chat: own or anon session"
  on public.chat_conversations for select using (user_id = auth.uid());

-- chat_messages
create policy "Messages: public insert"
  on public.chat_messages for insert with check (true);
create policy "Messages: via conversation"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chat_conversations c
      where c.id = chat_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────
-- 6. STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('inventory-media', 'inventory-media', false, 104857600,
  array['image/jpeg','image/jpg','image/png','image/webp','image/heic','video/mp4','video/quicktime','video/webm','application/pdf'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('inventory-reports', 'inventory-reports', false, 52428800, array['application/pdf'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portal-media', 'portal-media', false, 52428800,
  array['image/jpeg','image/jpg','image/png','image/webp','video/mp4','video/quicktime','video/webm'])
on conflict (id) do nothing;


-- ────────────────────────────────────────────────────────────
-- 7. SANITY CHECK — count every ref_* table
-- ────────────────────────────────────────────────────────────
select 'ref_portal_roles'     as table_name, count(*) from public.ref_portal_roles
union all select 'ref_property_types',    count(*) from public.ref_property_types
union all select 'ref_property_status',   count(*) from public.ref_property_status
union all select 'ref_tenancy_status',    count(*) from public.ref_tenancy_status
union all select 'ref_furnished_types',   count(*) from public.ref_furnished_types
union all select 'ref_letting_status',    count(*) from public.ref_letting_status
union all select 'ref_report_types',      count(*) from public.ref_report_types
union all select 'ref_report_status',     count(*) from public.ref_report_status
union all select 'ref_condition_levels',  count(*) from public.ref_condition_levels
union all select 'ref_room_types',        count(*) from public.ref_room_types
union all select 'ref_item_types',        count(*) from public.ref_item_types
union all select 'ref_entity_types',      count(*) from public.ref_entity_types
union all select 'ref_media_types',       count(*) from public.ref_media_types
union all select 'ref_service_types',     count(*) from public.ref_service_types
union all select 'ref_service_status',    count(*) from public.ref_service_status
union all select 'ref_chat_roles',        count(*) from public.ref_chat_roles
order by 1;
