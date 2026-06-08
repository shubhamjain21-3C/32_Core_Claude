-- ============================================================
-- 022_persistent_user_profile_and_password.sql
-- 3C CORE — Persist customer profile + password hash on public.users
-- ────────────────────────────────────────────────────────────
-- Why this migration exists:
--
-- The previous schema relied on `lib/store.ts` (in-memory) for password
-- hashes and the rest of the customer profile (Lastname, Phone, Company).
-- That map is reset on every Vercel serverless cold start, which broke
-- login and forgot-password for any account created in production.
--
-- We add a `password_hash` column (Supabase Auth manages auth.users
-- passwords, but our NextAuth credentials provider needs a hash it can
-- compare against, so we store our own sha256(pw + salt) here).
--
-- The `Lastname`, `MiddleName`, `Phone`, `Company` columns already exist;
-- the application code now writes to them via /api/auth/register and
-- /api/auth/forgot-password/reset.
--
-- Idempotent. Run in Supabase SQL Editor.
-- ============================================================

alter table public.users
  add column if not exists password_hash text;

-- Helpful index for the registration / login lookups
create index if not exists idx_users_email_ci
  on public.users (lower("Email"));

-- ────────────────────────────────────────────────────────────
-- RLS — let an authenticated user UPDATE their own profile.
-- The existing "Users update own row" policy already permits this; this
-- migration is included for the new password_hash column to be writable
-- by the service role + the owning user.
-- (Service-role writes bypass RLS regardless.)
-- ────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'Users update own row'
  ) then
    create policy "Users update own row"
      on public.users for update
      using ("User_id" = auth.uid())
      with check ("User_id" = auth.uid());
  end if;
end $$;
