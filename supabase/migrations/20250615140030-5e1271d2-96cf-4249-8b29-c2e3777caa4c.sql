
-- Add a stage_coords column to store coordinates per route stage
ALTER TABLE public.routes
ADD COLUMN stage_coords jsonb[] DEFAULT ARRAY[]::jsonb[];

-- (Optional) Add a comment to clarify usage
COMMENT ON COLUMN public.routes.stage_coords IS 'Array of JSON objects {lat, lng} corresponding to each stage in stages[] array';
