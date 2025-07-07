
-- Policy: Any authenticated user can SELECT (view) routes
CREATE POLICY "Authenticated users can view all routes"
  ON public.routes FOR SELECT
  TO authenticated
  USING (TRUE);
