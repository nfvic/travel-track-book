
-- Allow admins to fully manage all trips

-- First, helper function to get current user's role (if not already created):
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- INSERT
CREATE POLICY "Admins can insert any trip"
  ON public.trips FOR INSERT
  WITH CHECK (public.get_current_user_role() = 'admin');

-- UPDATE
CREATE POLICY "Admins can update any trip"
  ON public.trips FOR UPDATE
  USING (public.get_current_user_role() = 'admin');

-- DELETE
CREATE POLICY "Admins can delete any trip"
  ON public.trips FOR DELETE
  USING (public.get_current_user_role() = 'admin');
