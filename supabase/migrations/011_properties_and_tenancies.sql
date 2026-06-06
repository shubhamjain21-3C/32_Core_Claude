-- ============================================================
-- Migration 011: Properties & Tenancies
-- Star schema dimension tables — all FK to profiles.id
-- ============================================================

-- DIMENSION: Properties
-- owner_id FK → profiles.id (the landlord/property manager who owns it)
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
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- DIMENSION: Tenancies
-- landlord_id FK → profiles.id
-- tenant_id FK → profiles.id
-- property_id FK → properties.id
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

create trigger properties_updated_at
  before update on public.properties
  for each row execute procedure public.handle_updated_at();

create trigger tenancies_updated_at
  before update on public.tenancies
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_properties_owner   on public.properties(owner_id);
create index if not exists idx_tenancies_property on public.tenancies(property_id);
create index if not exists idx_tenancies_landlord on public.tenancies(landlord_id);
create index if not exists idx_tenancies_tenant   on public.tenancies(tenant_id);
create index if not exists idx_tenancies_status   on public.tenancies(status);
