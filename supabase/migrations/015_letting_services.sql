-- ============================================================
-- Migration 015: Letting Enquiries
-- Star schema FACT table — user_id FK → profiles.id (USER PK)
-- Tenant + Student only
-- ============================================================

create table if not exists public.letting_enquiries (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references public.profiles(id) on delete set null,  -- USER PK (star centre)
  user_role         text check (user_role in ('tenant','student')),
  full_name         text not null,
  email             text not null,
  phone             text,
  university        text,          -- students only
  course_duration   text,          -- students only (e.g. "3 years")
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
create index if not exists idx_letting_role   on public.letting_enquiries(user_role);
