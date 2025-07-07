
-- Create the `buses` table so you can store and retrieve bus data from Supabase
CREATE TABLE public.buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plate_number text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- (Optional, but recommended:) Add Row Level Security for future multi-user safety
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;

-- Public SELECT policy for MVP (anyone can read buses)
CREATE POLICY "Public read access" ON public.buses
  FOR SELECT USING (true);
