-- Add work schedule columns to professionals table
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS work_days JSONB DEFAULT '{"monday":true,"tuesday":true,"wednesday":true,"thursday":true,"friday":true,"saturday":true,"sunday":false}'::jsonb;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS work_start TEXT DEFAULT '08:00';
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS work_end TEXT DEFAULT '22:00';

-- Create time_off table for specific date+hour blocks
CREATE TABLE IF NOT EXISTS professional_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  professional_name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_time_off_professional ON professional_time_off(barbershop_id, professional_name, date);

-- Add total_duration and hours/photos columns if missing
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_duration INTEGER;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS hours TEXT;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- Clean duplicate services (keep first occurrence of each name per barbershop)
DELETE FROM services s1 USING services s2
WHERE s1.id > s2.id
  AND s1.barbershop_id = s2.barbershop_id
  AND LOWER(s1.name) = LOWER(s2.name);
