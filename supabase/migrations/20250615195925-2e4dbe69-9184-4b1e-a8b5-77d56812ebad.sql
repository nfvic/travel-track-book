
-- This allows us to get the row data on inserts/updates
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- Add the table to the 'supabase_realtime' publication to enable realtime events
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
