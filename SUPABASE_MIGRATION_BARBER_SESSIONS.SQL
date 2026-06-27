-- ******************** DATABASE MIGRATION FOR BARBER SESSIONS SYSTEM ********************
-- Execute este SQL no painel SQL do Supabase

-- 1. Criar tabela para sessões de barbeiros
CREATE TABLE IF NOT EXISTS barber_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  professional_name TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE CASCADE,
  FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
);

-- 2. Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_barber_sessions_token ON barber_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_barber_sessions_professional ON barber_sessions(professional_id);
CREATE INDEX IF NOT EXISTS idx_barber_sessions_barbershop ON barber_sessions(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barber_sessions_expires ON barber_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_barber_sessions_active ON barber_sessions(is_active);

-- 3. Função para limpar sessões expiradas (executada via cron jobs)
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM barber_sessions WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para limpeza automática (opcional - mais comum usar Cron Jobs)
CREATE OR REPLACE TRIGGER auto_clean_sessions
AFTER INSERT ON barber_sessions
FOR EACH STATEMENT
EXECUTE FUNCTION clean_expired_sessions();

-- 5. Procedimento armazenado para criar sessão (opcional)
CREATE OR REPLACE PROCEDURE create_barber_session(
  p_barbershop_id UUID,
  p_professional_id UUID,
  p_professional_name TEXT,
  p_session_token TEXT,
  p_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Limpar sessões anteriores do mesmo barbeiro
  UPDATE barber_sessions 
  SET is_active = false 
  WHERE professional_id = p_professional_id AND is_active = true;
  
  -- Inserir nova sessão
  INSERT INTO barber_sessions (id, barbershop_id, professional_id, professional_name, session_token, expires_at)
  VALUES (gen_random_uuid(), p_barbershop_id, p_professional_id, p_professional_name, p_session_token, p_expires_at);
END;
$$;

-- ******************** FIM DA MIGRACAO ********************

COMMENT ON TABLE barber_sessions IS 'Armazena sessões ativas de barbeiros';