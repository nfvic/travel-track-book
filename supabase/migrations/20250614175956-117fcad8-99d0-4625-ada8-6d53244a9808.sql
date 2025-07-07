
-- Create a bookings table to store bus seat reservations
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id uuid NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'reserved', -- reserved, cancelled, etc
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security for bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Let passengers view only their own bookings
CREATE POLICY "Users can view their bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Let users insert a booking for themselves only
CREATE POLICY "Users can create bookings for themselves" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update (e.g., cancel) their own bookings
CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their bookings (optional/enable if you want)
CREATE POLICY "Users can delete own bookings" ON public.bookings
  FOR DELETE USING (auth.uid() = user_id);

