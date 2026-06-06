-- ============================================================
-- Migration 010: User role & journey
-- Star schema: profiles.id is the central user PK (UUID)
-- All tables reference profiles.id as FK
-- ============================================================

-- Extend profiles with role and journey columns
-- profiles.id = UUID, PK, linked to auth.users.id
alter table public.profiles
  add column if not exists user_role text
    check (user_role in ('property_manager', 'landlord', 'tenant', 'student'))
    default null,
  add column if not exists journey_intent text
    check (journey_intent in ('services', 'letting'))
    default null,
  add column if not exists role_verified_at timestamptz default null;

-- Anonymous journey sessions (non-logged-in users, tracked by session token)
create table if not exists public.journey_sessions (
  id             uuid primary key default uuid_generate_v4(),
  session_token  text unique not null,
  user_id        uuid references public.profiles(id) on delete set null,  -- set when user logs in
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
