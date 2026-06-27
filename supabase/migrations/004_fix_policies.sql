-- Allow anonymous UPDATE on appointments (barber editing)
DROP POLICY IF EXISTS "Allow anonymous update" ON appointments;
CREATE POLICY "Allow anonymous update" ON appointments
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous DELETE on appointments
DROP POLICY IF EXISTS "Allow anonymous delete" ON appointments;
CREATE POLICY "Allow anonymous delete" ON appointments
  FOR DELETE
  TO anon
  USING (true);

-- Allow anonymous SELECT on barbershops (needed for getUnavailableDays)
DROP POLICY IF EXISTS "Allow anonymous select barbershops" ON barbershops;
CREATE POLICY "Allow anonymous select barbershops" ON barbershops
  FOR SELECT
  TO anon
  USING (true);
