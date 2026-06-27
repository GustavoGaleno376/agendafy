-- Limpa todos os dados das tabelas (mantém a estrutura)
DELETE FROM professional_time_off;
DELETE FROM barber_unavailable_days;
DELETE FROM appointments;
DELETE FROM services;
DELETE FROM professionals;
DELETE FROM barbershops;

-- Limpa as colunas de fotos
UPDATE barbershops SET photos = '[]'::jsonb, avatar = NULL;
UPDATE professionals SET avatar = NULL;
