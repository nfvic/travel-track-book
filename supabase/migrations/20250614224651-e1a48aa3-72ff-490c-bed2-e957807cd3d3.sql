
-- Add a new nullable column for total seats in buses
ALTER TABLE public.buses
ADD COLUMN total_seats integer;

-- Recommended: allow operators to update this value, but not required for select/policy right now
