-- ============================================================
-- 3C CORE — Complete Database Schema
-- Run this entire file in Supabase SQL Editor
-- Order: Extensions → Functions → Profiles → All Tables → RLS → Storage
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ────────────────────────────────────────────────────────────
-- 2. SHARED FUNCTION: auto-update updated_at timestamp
-- ────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ────────────────────────────────────────────────────────────
-- 3. PROFILES (extends auth.users — created on every signup)
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  full_name       text,
  first_name      text,
  middle_name     text,
  last_name       text,
  phone           text,
  date_of_birth   date,
  company         text,
  avatar_url      text,
  user_role       text check (user_role in ('property_manager','landlord','tenant','student','admin')),
  journey_intent  text check (journey_intent in ('services','letting')),
  role_verified_at timestamptz,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists profiles_email_idx    on public.profiles(email);
create index if not exists profiles_role_idx     on public.profiles(user_role);
create index if not exists profiles_phone_idx    on public.profiles(phone);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile when a user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS on profiles
alter table public.profiles enable row level security;

create policy "Users view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);


-- ────────────────────────────────────────────────────────────
-- 4. JOURNEY SESSIONS (anonymous user tracking)
-- ────────────────────────────────────────────────────────────
create table if not exists public.journey_sessions (
  id             uuid primary key default uuid_generate_v4(),
  session_token  text unique not null,
  user_id        uuid references public.profiles(id) on delete set null,
  user_role      text check (user_role in ('property_manager','landlord','tenant','student')),
  journey_intent text check (journey_intent in ('services','letting')),
  ip_address     text,
  user_agent     text,
  created_at     timestamptz not null default now(),
  expires_at     timestamptz not null default (now() + interval '24 hours')
);

create index if not exists idx_journey_sessions_token   on public.journey_sessions(session_token);
create index if not exists idx_journey_sessions_user    on public.journey_sessions(user_id);
create index if not exists idx_journey_sessions_expires on public.journey_sessions(expires_at);

alter table public.journey_sessions enable row level security;

create policy "Public insert journey session"
  on public.journey_sessions for insert with check (true);

create policy "Own journey session read"
  on public.journey_sessions for select
  using (user_id = auth.uid());


-- ────────────────────────────────────────────────────────────
-- 5. PROPERTIES
-- ────────────────────────────────────────────────────────────
create table if not exists public.properties (
  id             uuid primary key default uuid_generate_v4(),
  owner_id       uuid not null references public.profiles(id) on delete cascade,
  address_line1  text not null,
  address_line2  text,
  city           text not null default 'London',
  postcode       text not null,
  property_type  text check (property_type in (
                   'flat','house','hmo','studio','room','commercial','other'
                 )),
  bedrooms       smallint,
  bathrooms      smallint,
  monthly_rent   numeric(10,2),
  status         text not null default 'vacant'
                   check (status in ('occupied','vacant','under_management','for_letting')),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger properties_updated_at
  before update on public.properties
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_properties_owner    on public.properties(owner_id);
create index if not exists idx_properties_postcode on public.properties(postcode);
create index if not exists idx_properties_status   on public.properties(status);

alter table public.properties enable row level security;

create policy "Owner manages own properties"
  on public.properties for all using (owner_id = auth.uid());


-- ────────────────────────────────────────────────────────────
-- 6. TENANCIES (links properties ↔ tenants)
-- ────────────────────────────────────────────────────────────
create table if not exists public.tenancies (
  id              uuid primary key default uuid_generate_v4(),
  property_id     uuid not null references public.properties(id) on delete cascade,
  landlord_id     uuid not null references public.profiles(id),
  tenant_id       uuid references public.profiles(id),
  start_date      date not null,
  end_date        date,
  rent_amount     numeric(10,2),
  deposit_amount  numeric(10,2),
  deposit_scheme  text check (deposit_scheme in ('tds','dps','mydeposits','other')),
  deposit_ref     text,
  status          text not null default 'active'
                    check (status in ('pending','active','ended','disputed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger tenancies_updated_at
  before update on public.tenancies
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_tenancies_property on public.tenancies(property_id);
create index if not exists idx_tenancies_landlord on public.tenancies(landlord_id);
create index if not exists idx_tenancies_tenant   on public.tenancies(tenant_id);
create index if not exists idx_tenancies_status   on public.tenancies(status);

alter table public.tenancies enable row level security;

create policy "Landlord and tenant view tenancy"
  on public.tenancies for select
  using (landlord_id = auth.uid() or tenant_id = auth.uid());

create policy "Landlord manages tenancy"
  on public.tenancies for all using (landlord_id = auth.uid());


-- ────────────────────────────────────────────────────────────
-- 7. INVENTORY REPORTS
-- ────────────────────────────────────────────────────────────
create table if not exists public.inventory_reports (
  id                  uuid primary key default uuid_generate_v4(),
  tenancy_id          uuid references public.tenancies(id) on delete set null,
  property_id         uuid not null references public.properties(id) on delete cascade,
  report_type         text not null check (report_type in ('check_in','check_out','midterm')),
  created_by          uuid not null references public.profiles(id),
  assigned_agent_id   uuid references public.profiles(id),
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
  retain_until        timestamptz,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger inventory_reports_updated_at
  before update on public.inventory_reports
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_inv_reports_created_by on public.inventory_reports(created_by);
create index if not exists idx_inv_reports_property   on public.inventory_reports(property_id);
create index if not exists idx_inv_reports_tenancy    on public.inventory_reports(tenancy_id);
create index if not exists idx_inv_reports_status     on public.inventory_reports(status);
create index if not exists idx_inv_reports_type       on public.inventory_reports(report_type);

alter table public.inventory_reports enable row level security;

create policy "Report access for involved parties"
  on public.inventory_reports for select
  using (
    created_by = auth.uid()
    or assigned_agent_id = auth.uid()
    or auth.uid() in (
      select landlord_id from public.tenancies where id = inventory_reports.tenancy_id
      union
      select tenant_id  from public.tenancies where id = inventory_reports.tenancy_id
    )
  );

create policy "Report write for creator"
  on public.inventory_reports for all
  using (created_by = auth.uid());


-- ────────────────────────────────────────────────────────────
-- 8. INVENTORY ROOMS
-- ────────────────────────────────────────────────────────────
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

create index if not exists idx_inv_rooms_report on public.inventory_rooms(report_id);

alter table public.inventory_rooms enable row level security;

create policy "Room access via report"
  on public.inventory_rooms for all
  using (
    exists (
      select 1 from public.inventory_reports r
      where r.id = inventory_rooms.report_id
        and r.created_by = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────
-- 9. INVENTORY ITEMS
-- ────────────────────────────────────────────────────────────
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

create trigger inventory_items_updated_at
  before update on public.inventory_items
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_inv_items_room   on public.inventory_items(room_id);
create index if not exists idx_inv_items_report on public.inventory_items(report_id);

alter table public.inventory_items enable row level security;

create policy "Item access via report"
  on public.inventory_items for all
  using (
    exists (
      select 1 from public.inventory_reports r
      where r.id = inventory_items.report_id
        and r.created_by = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────
-- 10. INVENTORY MEDIA (photos/videos per item or room)
-- ────────────────────────────────────────────────────────────
create table if not exists public.inventory_media (
  id               uuid primary key default uuid_generate_v4(),
  report_id        uuid not null references public.inventory_reports(id) on delete cascade,
  room_id          uuid references public.inventory_rooms(id) on delete set null,
  item_id          uuid references public.inventory_items(id) on delete set null,
  uploaded_by      uuid not null references public.profiles(id),
  file_name        text not null,
  file_type        text not null check (file_type in ('image','video')),
  mime_type        text not null,
  file_size_bytes  bigint,
  storage_path     text not null,
  public_url       text,
  thumbnail_url    text,
  ai_analysis      jsonb,
  ai_analysed_at   timestamptz,
  upload_source    text check (upload_source in ('landlord','tenant','agent','system')),
  retain_until     timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_inv_media_uploaded_by on public.inventory_media(uploaded_by);
create index if not exists idx_inv_media_report      on public.inventory_media(report_id);
create index if not exists idx_inv_media_item        on public.inventory_media(item_id);

alter table public.inventory_media enable row level security;

create policy "Media access for report parties"
  on public.inventory_media for select
  using (
    uploaded_by = auth.uid()
    or exists (
      select 1 from public.inventory_reports r
      where r.id = inventory_media.report_id
        and (r.created_by = auth.uid() or r.assigned_agent_id = auth.uid())
    )
  );

create policy "Media upload by authenticated users"
  on public.inventory_media for insert
  with check (uploaded_by = auth.uid());


-- ────────────────────────────────────────────────────────────
-- 11. PORTAL MEDIA (general uploads — 30-day auto-delete)
-- ────────────────────────────────────────────────────────────
create table if not exists public.portal_media (
  id               uuid primary key default uuid_generate_v4(),
  uploaded_by      uuid not null references public.profiles(id),
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

create index if not exists idx_portal_media_user on public.portal_media(uploaded_by);
create index if not exists idx_portal_media_del  on public.portal_media(auto_delete_at) where deleted_at is null;

alter table public.portal_media enable row level security;

create policy "Users manage own portal media"
  on public.portal_media for all using (uploaded_by = auth.uid());


-- ────────────────────────────────────────────────────────────
-- 12. PAYMENTS
-- ────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id                        uuid primary key default uuid_generate_v4(),
  user_id                   uuid not null references public.profiles(id),
  service_type              text not null check (service_type in (
                              'inventory_diy','inventory_professional',
                              'midterm_inspection','dispute_resolution',
                              'maintenance','deposit_negotiation',
                              'letting_service','subscription','other'
                            )),
  booking_id                uuid,
  amount_pence              integer not null,
  currency                  text not null default 'gbp',
  status                    text not null default 'pending'
                              check (status in (
                                'pending','processing','succeeded',
                                'failed','refunded','disputed'
                              )),
  stripe_payment_intent_id  text unique,
  stripe_customer_id        text,
  stripe_payment_method     text,
  payment_method_type       text check (payment_method_type in (
                              'card','apple_pay','google_pay','bank_transfer','other'
                            )),
  receipt_url               text,
  failure_reason            text,
  refund_amount_pence       integer,
  refunded_at               timestamptz,
  metadata                  jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create trigger payments_updated_at
  before update on public.payments
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_payments_user   on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_stripe on public.payments(stripe_payment_intent_id);

alter table public.payments enable row level security;

create policy "Users view own payments"
  on public.payments for select using (user_id = auth.uid());

create policy "System inserts payments"
  on public.payments for insert with check (true);


-- ────────────────────────────────────────────────────────────
-- 13. LETTING ENQUIRIES
-- ────────────────────────────────────────────────────────────
create table if not exists public.letting_enquiries (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references public.profiles(id) on delete set null,
  user_role         text check (user_role in ('tenant','student')),
  full_name         text not null,
  email             text not null,
  phone             text,
  university        text,
  course_duration   text,
  preferred_area    text,
  budget_min_pcm    integer,
  budget_max_pcm    integer,
  move_in_date      date,
  lease_type        text check (lease_type in (
                      'short_term','long_term','student_let','room_only'
                    )),
  bedrooms_needed   smallint,
  additional_notes  text,
  status            text not null default 'new'
                      check (status in ('new','contacted','viewing','let','closed')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger letting_enquiries_updated_at
  before update on public.letting_enquiries
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_letting_user   on public.letting_enquiries(user_id);
create index if not exists idx_letting_status on public.letting_enquiries(status);

alter table public.letting_enquiries enable row level security;

create policy "Users view own enquiries"
  on public.letting_enquiries for select
  using (user_id = auth.uid());

create policy "Anyone can submit letting enquiry"
  on public.letting_enquiries for insert with check (true);


-- ────────────────────────────────────────────────────────────
-- 14. CHAT (AI Chatbot conversations)
-- ────────────────────────────────────────────────────────────
create table if not exists public.chat_conversations (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete set null,
  session_id  text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id                  uuid primary key default uuid_generate_v4(),
  conversation_id     uuid not null references public.chat_conversations(id) on delete cascade,
  role                text not null check (role in ('user','assistant')),
  content             text not null,
  navigation_links    jsonb,
  created_at          timestamptz not null default now()
);

create index if not exists idx_chat_conv_user    on public.chat_conversations(user_id);
create index if not exists idx_chat_conv_session on public.chat_conversations(session_id);
create index if not exists idx_chat_msg_conv     on public.chat_messages(conversation_id);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages      enable row level security;

create policy "Users view own conversations"
  on public.chat_conversations for all using (user_id = auth.uid());

create policy "Messages via conversation"
  on public.chat_messages for all
  using (
    exists (
      select 1 from public.chat_conversations c
      where c.id = chat_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

create policy "Public insert conversation"
  on public.chat_conversations for insert with check (true);

create policy "Public insert message"
  on public.chat_messages for insert with check (true);


-- ────────────────────────────────────────────────────────────
-- 15. STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inventory-media', 'inventory-media', false, 104857600,
  array['image/jpeg','image/jpg','image/png','image/webp','image/heic','video/mp4','video/quicktime','video/webm','application/pdf']
) on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inventory-reports', 'inventory-reports', false, 52428800,
  array['application/pdf']
) on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portal-media', 'portal-media', false, 52428800,
  array['image/jpeg','image/jpg','image/png','image/webp','video/mp4','video/quicktime','video/webm']
) on conflict (id) do nothing;

-- Storage RLS
create policy "Inventory media: authenticated read"
  on storage.objects for select
  using (bucket_id = 'inventory-media' and auth.role() = 'authenticated');

create policy "Inventory media: authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'inventory-media' and auth.role() = 'authenticated');

create policy "Report PDFs: authenticated read"
  on storage.objects for select
  using (bucket_id = 'inventory-reports' and auth.role() = 'authenticated');

create policy "Portal media: own folder"
  on storage.objects for all
  using (
    bucket_id = 'portal-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


-- ────────────────────────────────────────────────────────────
-- DONE — 14 tables + 3 storage buckets created
-- ────────────────────────────────────────────────────────────
