
-- Create the table to store announcements
CREATE TABLE public.announcements (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    operator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add comments for clarity
COMMENT ON TABLE public.announcements IS 'Stores announcements sent by operators for specific trips.';
COMMENT ON COLUMN public.announcements.trip_id IS 'The trip this announcement belongs to.';
COMMENT ON COLUMN public.announcements.operator_id IS 'The operator who sent the announcement.';
COMMENT ON COLUMN public.announcements.message IS 'The content of the announcement.';

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Operators can create announcements for trips on buses they own.
CREATE POLICY "Operators can create announcements for their trips"
ON public.announcements
FOR INSERT
WITH CHECK (
  auth.uid() = operator_id AND
  (EXISTS (
    SELECT 1
    FROM public.trips t
    JOIN public.buses b ON t.bus_id = b.id
    WHERE t.id = announcements.trip_id AND b.owner_id = auth.uid()
  ))
);

-- Policy: Operators can view announcements for trips on buses they own.
CREATE POLICY "Operators can view announcements for their trips"
ON public.announcements
FOR SELECT
USING (
  (EXISTS (
    SELECT 1
    FROM public.trips t
    JOIN public.buses b ON t.bus_id = b.id
    WHERE t.id = announcements.trip_id AND b.owner_id = auth.uid()
  ))
);

-- Policy: Passengers with a booking can view announcements for their trip.
CREATE POLICY "Passengers can view announcements for their trips"
ON public.announcements
FOR SELECT
USING (
  (EXISTS (
    SELECT 1
    FROM public.trips t
    JOIN public.bookings k ON t.bus_id = k.bus_id
    WHERE t.id = announcements.trip_id AND k.user_id = auth.uid()
  ))
);
