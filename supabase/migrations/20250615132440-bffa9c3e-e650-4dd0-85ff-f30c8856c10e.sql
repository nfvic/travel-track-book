
-- Add latitude and longitude columns to the buses table for operator location updates
ALTER TABLE public.buses
ADD COLUMN location_lat double precision,
ADD COLUMN location_lng double precision;

-- (Optional) You may want to create/update RLS policies for these columns if policies exist.
