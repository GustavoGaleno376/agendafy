-- ==========================================
-- Agendafy - Multi-Barbershop Schema
-- (apenas tabelas NOVAS, sem duplicar 001)
-- ==========================================

-- 1. BARBERSHOPS
CREATE TABLE IF NOT EXISTS barbershops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  instagram TEXT,
  photos TEXT[] DEFAULT '{}',
  business_hours JSONB DEFAULT '{}',
  evolution_api_url TEXT,
  evolution_api_key TEXT,
  evolution_instance TEXT,
  active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFESSIONALS
CREATE TABLE IF NOT EXISTS professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT DEFAULT 'Barbeiro',
  avatar TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SERVICES
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  satisfaction INT CHECK (satisfaction BETWEEN 1 AND 5),
  service INT CHECK (service BETWEEN 1 AND 5),
  ambience INT CHECK (ambience BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BARBERSHOP ADMINS
CREATE TABLE IF NOT EXISTS barbershop_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ADD barbershop_id TO EXISTING appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_name TEXT;

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_professionals_barbershop ON professionals(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_services_barbershop ON services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop ON appointments(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_barbershops_slug ON barbershops(slug);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershop_admins ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view professionals" ON professionals;
CREATE POLICY "Anyone can view professionals" ON professionals FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anyone can view services" ON services;
CREATE POLICY "Anyone can view services" ON services FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT TO anon WITH CHECK (true);

-- ==========================================
-- SEED DATA
-- ==========================================
INSERT INTO barbershops (id, name, slug, phone, whatsapp, address, instagram, business_hours, verified) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'MD BARBEARIA',
    'md-barbearia',
    '(11) 99999-8888',
    '5511999998888',
    'Rua Augusta, 1500 - Consolação, São Paulo - SP',
    '@md_barbearia',
    '{"weekdays": "08:00 às 23:00", "sunday": "Fechado"}',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Barber Classic',
    'barber-classic',
    '(11) 98888-7777',
    '5511988887777',
    'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    '@barberclassic',
    '{"weekdays": "09:00 às 21:00", "saturday": "09:00 às 18:00", "sunday": "Fechado"}',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Cortes & Cia',
    'cortes-cia',
    '(11) 97777-6666',
    '5511977776666',
    'Rua Oscar Freire, 500 - Jardins, São Paulo - SP',
    '@cortesecia',
    '{"weekdays": "08:00 às 22:00", "saturday": "09:00 às 17:00", "sunday": "Fechado"}',
    false
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO professionals (barbershop_id, name, title) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Miranda', 'Barbeiro Master'),
  ('a0000000-0000-0000-0000-000000000001', 'Carlos', 'Barbeiro Senior'),
  ('a0000000-0000-0000-0000-000000000002', 'Ricardo', 'Barbeiro'),
  ('a0000000-0000-0000-0000-000000000002', 'Felipe', 'Barbeiro Master'),
  ('a0000000-0000-0000-0000-000000000003', 'Thiago', 'Barbeiro'),
  ('a0000000-0000-0000-0000-000000000003', 'Rafael', 'Barbeiro Senior');

INSERT INTO services (barbershop_id, name, duration, price) VALUES
  -- MD Barbearia
  ('a0000000-0000-0000-0000-000000000001', 'Barba', 30, 20),
  ('a0000000-0000-0000-0000-000000000001', 'Bigode', 5, 5),
  ('a0000000-0000-0000-0000-000000000001', 'Corte', 30, 25),
  ('a0000000-0000-0000-0000-000000000001', 'Corte + Barba', 60, 45),
  ('a0000000-0000-0000-0000-000000000001', 'Sobrancelha', 15, 10),
  ('a0000000-0000-0000-0000-000000000001', 'Luzes', 120, 60),
  -- Barber Classic
  ('a0000000-0000-0000-0000-000000000002', 'Corte Degradê', 40, 35),
  ('a0000000-0000-0000-0000-000000000002', 'Barba Tradicional', 25, 20),
  ('a0000000-0000-0000-0000-000000000002', 'Hidratação', 30, 30),
  -- Cortes & Cia
  ('a0000000-0000-0000-0000-000000000003', 'Corte Social', 30, 30),
  ('a0000000-0000-0000-0000-000000000003', 'Barba Premium', 30, 25),
  ('a0000000-0000-0000-0000-000000000003', 'Combo Corte + Barba', 60, 50);
