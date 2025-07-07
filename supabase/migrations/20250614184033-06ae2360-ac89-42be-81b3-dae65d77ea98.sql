
-- Add owner_id column to the buses table
ALTER TABLE public.buses
  ADD COLUMN owner_id uuid;

-- Backfill existing rows with NULL; optionally, you could prompt users to claim these buses in the app

-- Set owner_id NOT NULL for all new rows
ALTER TABLE public.buses
  ALTER COLUMN owner_id SET NOT NULL;

-- Add a foreign key constraint to auth.users (safe to do for user ownership)
ALTER TABLE public.buses
  ADD CONSTRAINT buses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS if not already
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;

-- Allow operators to insert their owned buses
CREATE POLICY "Operators can insert own bus"
  ON public.buses
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Allow operators to select their own buses
CREATE POLICY "Operators can select own bus"
  ON public.buses
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Allow operators to update their own buses
CREATE POLICY "Operators can update own bus"
  ON public.buses
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Allow operators to delete their own buses
CREATE POLICY "Operators can delete own bus"
  ON public.buses
  FOR DELETE
  USING (auth.uid() = owner_id);

-- (Optional) Keep the public SELECT for MVP (uncomment if you still want public access)
-- CREATE POLICY "Public read access"
--   ON public.buses
--   FOR SELECT
--   USING (true);
