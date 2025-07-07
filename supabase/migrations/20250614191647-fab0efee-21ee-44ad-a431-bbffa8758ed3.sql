
-- Create the trips table
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id uuid NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  route_id uuid NOT NULL,
  current_stage TEXT,
  driver_name TEXT,
  gps_path JSONB,
  delay_reason TEXT,
  status TEXT DEFAULT 'ongoing',
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
  -- Add a FOREIGN KEY for route_id once / if the routes table exists:
  -- , FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view trips
CREATE POLICY "Anyone can view trips"
  ON public.trips FOR SELECT
  USING (true);

-- Policy: Operators can INSERT if they own the bus
CREATE POLICY "Operators can insert trip"
  ON public.trips FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.buses b
      WHERE b.id = bus_id AND b.owner_id = auth.uid()
    )
  );

-- Policy: Operators can UPDATE trips of their buses
CREATE POLICY "Operators can update trip"
  ON public.trips FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.buses b
      WHERE b.id = bus_id AND b.owner_id = auth.uid()
    )
  );

-- Policy: Operators can DELETE trips of their buses
CREATE POLICY "Operators can delete trip"
  ON public.trips FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.buses b
      WHERE b.id = bus_id AND b.owner_id = auth.uid()
    )
  );
