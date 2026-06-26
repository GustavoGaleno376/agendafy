@echo off
echo ============================================
echo  Agendafy - Deploy Supabase Edge Function
echo ============================================
echo.
echo Verifique se o Supabase CLI esta instalado
echo Para instalar: npm i -g supabase
echo.

REM Verificar se supabase CLI existe
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Supabase CLI nao encontrado.
    echo Instale com: npm install -g supabase
    pause
    exit /b 1
)

echo [1/3] Login no Supabase...
supabase login

echo.
echo [2/3] Vincular projeto...
supabase link --project-ref dtovcvjeohjyrjivovid

echo.
echo [3/3] Fazer deploy da Edge Function...
supabase functions deploy send-whatsapp

echo.
echo ============================================
echo  Deploy concluido!
echo.
echo  Agora configure as variaveis no dashboard:
echo  https://supabase.com/dashboard/project/dtovcvjeohjyrjivovid/edge-functions/send-whatsapp/variables
echo ============================================

pause
