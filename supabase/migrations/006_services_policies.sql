-- Allow anonymous INSERT on services (barber adding services)
DROP POLICY IF EXISTS "Allow anonymous insert services" ON services;
CREATE POLICY "Allow anonymous insert services" ON services
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous UPDATE on services (barber editing services)
DROP POLICY IF EXISTS "Allow anonymous update services" ON services;
CREATE POLICY "Allow anonymous update services" ON services
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous DELETE on services (barber removing services)
DROP POLICY IF EXISTS "Allow anonymous delete services" ON services;
CREATE POLICY "Allow anonymous delete services" ON services
  FOR DELETE
  TO anon
  USING (true);
