
-- Allow bus owners to view all bookings for their own buses
CREATE POLICY "Operators can view bookings for their buses" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM buses b
      WHERE b.id = bookings.bus_id
        AND b.owner_id = auth.uid()
    )
  );
