
-- Add "is_suspended" column to public.profiles (users)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;

-- Add "is_suspended" column to public.buses
ALTER TABLE public.buses
ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;
