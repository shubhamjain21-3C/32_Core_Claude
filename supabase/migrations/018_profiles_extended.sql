-- 018_profiles_extended.sql
-- Extends the profiles table with structured name fields, DOB, and phone

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name   text,
  ADD COLUMN IF NOT EXISTS middle_name  text,
  ADD COLUMN IF NOT EXISTS last_name    text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS phone        text;

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON public.profiles (phone);

-- Update RLS: users can update their own extended profile fields
CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
