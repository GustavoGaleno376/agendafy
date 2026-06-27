# Agendafy

Sistema de agendamento online para barbearias. Clientes escolhem o profissional, serviços e horário disponível. Barbeiros gerenciam sua agenda, serviços e horários de trabalho.

## Funcionalidades

- **Cliente**: Seleciona barbearia, profissional, serviços e horário — calendário respeita a disponibilidade do barbeiro
- **Barbeiro**: Dashboard com agendamentos do dia, edição de serviços, foto de perfil, horários de trabalho (dias + horários) e folgas específicas
- **Admin**: Gerenciamento de barbearias, upload de fotos, profissionais e serviços
- **Notificações**: WhatsApp integrado para confirmação e alterações de agendamento

## Tecnologias

- React 19 + Vite 8
- Tailwind CSS 4
- Framer Motion
- Supabase (banco de dados + Edge Functions)
- Lucide React (ícones)

## Como rodar

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Configuração

Crie um arquivo `.env` na raiz com as credenciais do Supabase:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

## Migrações SQL

Os arquivos em `SUPABASE_MIGRATION_*.sql` e `supabase/migrations/` devem ser executados no SQL Editor do Supabase Dashboard.

## Edge Functions

As funções em `supabase/functions/` podem ser deployadas com:

```bash
npx supabase functions deploy
```
