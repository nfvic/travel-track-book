
-- Add a foreign key from trips.route_id to routes.id
ALTER TABLE public.trips
ADD CONSTRAINT trips_route_id_fkey
FOREIGN KEY (route_id)
REFERENCES public.routes(id)
ON DELETE CASCADE;
