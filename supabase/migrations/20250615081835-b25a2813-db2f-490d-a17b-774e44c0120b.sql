
-- Add latitude and longitude columns to the trips table for live bus location
ALTER TABLE public.trips
ADD COLUMN location_lat double precision,
ADD COLUMN location_lng double precision;

-- (Optional, but recommended) Update policies if you want to restrict insert/update/select of location columns
