-- Tabela de agendamentos
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_phone TEXT NOT NULL,
  professional_name TEXT NOT NULL,
  services TEXT[] NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'Agendado' CHECK (status IN ('Agendado', 'Confirmado', 'Concluido', 'Cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para buscar por data
CREATE INDEX idx_appointments_date ON appointments(date);

-- Index para buscar por status
CREATE INDEX idx_appointments_status ON appointments(status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy para permitir inserção anônima (frontend sem auth)
CREATE POLICY "Allow anonymous insert" ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy para permitir leitura anônima
CREATE POLICY "Allow anonymous select" ON appointments
  FOR SELECT
  TO anon
  USING (true);
