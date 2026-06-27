-- Adicionar colunas Z-API na tabela barbershops
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS zapi_instance TEXT;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS zapi_token TEXT;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS zapi_client_token TEXT;

-- Adicionar coluna de fotos (caso não exista da migration 002)
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
