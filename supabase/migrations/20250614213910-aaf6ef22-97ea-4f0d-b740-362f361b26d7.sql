
-- Add a price column to the routes table (in cents, integer, not null, default 100 for backwards compatibility)
ALTER TABLE public.routes ADD COLUMN price_cents INTEGER NOT NULL DEFAULT 100;

-- If you want pricing on buses instead, comment out above and use:
-- ALTER TABLE public.buses ADD COLUMN price_cents INTEGER NOT NULL DEFAULT 100;
