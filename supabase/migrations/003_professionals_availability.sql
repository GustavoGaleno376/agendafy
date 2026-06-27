CREATE TABLE IF NOT EXISTS barber_unavailable_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barbershop_id, date)
);

ALTER TABLE barber_unavailable_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert unavailable days" ON barber_unavailable_days;
CREATE POLICY "Anyone can insert unavailable days" ON barber_unavailable_days
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can select unavailable days" ON barber_unavailable_days;
CREATE POLICY "Anyone can select unavailable days" ON barber_unavailable_days
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anyone can delete unavailable days" ON barber_unavailable_days;
CREATE POLICY "Anyone can delete unavailable days" ON barber_unavailable_days
  FOR DELETE TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_unavailable_days_barbershop_date ON barber_unavailable_days(barbershop_id, date);
