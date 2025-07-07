
-- 1. Create enum type for app roles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'passenger');
  END IF;
END$$;

-- 2. Add 'role' column to profiles table if it does not exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role public.app_role;

-- (optional, later you can run an update to backfill values)
