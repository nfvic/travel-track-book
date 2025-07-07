
-- Create a 'routes' table for friendly route names and stages
CREATE TABLE public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL, -- owner (foreign key to auth.user or to buses.owner_id)
  name TEXT NOT NULL, -- e.g., 'CBD → Uthiru'
  stages TEXT[] NOT NULL, -- e.g., ARRAY['CBD', 'Westlands', 'Kangemi', ...]
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Policy: Operators can SELECT routes they own
CREATE POLICY "Operators can view their routes"
  ON public.routes FOR SELECT
  USING (operator_id = auth.uid());

-- Policy: Operators can INSERT routes for themselves
CREATE POLICY "Operators can insert their routes"
  ON public.routes FOR INSERT
  WITH CHECK (operator_id = auth.uid());

-- Policy: Operators can UPDATE their own routes
CREATE POLICY "Operators can update their routes"
  ON public.routes FOR UPDATE
  USING (operator_id = auth.uid());

-- Policy: Operators can DELETE their own routes
CREATE POLICY "Operators can delete their routes"
  ON public.routes FOR DELETE
  USING (operator_id = auth.uid());
