-- Adicionar professional_name ao barber_unavailable_days para bloqueio individual por barbeiro
ALTER TABLE barber_unavailable_days ADD COLUMN IF NOT EXISTS professional_name TEXT;

-- Recriar o constraint UNIQUE para incluir professional_name
ALTER TABLE barber_unavailable_days DROP CONSTRAINT IF EXISTS barber_unavailable_days_barbershop_id_date_key;
ALTER TABLE barber_unavailable_days ADD CONSTRAINT barber_unavailable_days_unique UNIQUE(barbershop_id, date, professional_name);

-- Index para buscar por profissional
CREATE INDEX IF NOT EXISTS idx_unavailable_days_professional ON barber_unavailable_days(barbershop_id, professional_name, date);

-- Policies para INSERT e DELETE já existem da migration 003
