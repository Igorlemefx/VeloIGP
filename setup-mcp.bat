@echo off
echo 🔧 Configurando MCP Server para Google Sheets...

REM Verificar se o arquivo de credenciais existe
set CREDENTIALS_PATH=C:\Users\Velotax Suporte\Downloads\ProjetoIGP\gcp-oauth.keys.json..json
if not exist "%CREDENTIALS_PATH%" (
    echo ❌ Arquivo de credenciais não encontrado em: %CREDENTIALS_PATH%
    echo Por favor, verifique se o arquivo existe e tente novamente.
    pause
    exit /b 1
)

echo ✅ Arquivo de credenciais encontrado!

REM Instalar o MCP Server para Google Sheets
echo 📦 Instalando MCP Server para Google Sheets...
call npm install -g @modelcontextprotocol/server-google-sheets
if errorlevel 1 (
    echo ❌ Erro ao instalar MCP Server
    pause
    exit /b 1
)

echo ✅ MCP Server instalado com sucesso!

REM Configurar variável de ambiente
echo 🔑 Configurando variável de ambiente...
set GOOGLE_APPLICATION_CREDENTIALS=%CREDENTIALS_PATH%

REM Criar arquivo .env
echo 📝 Criando arquivo .env...
(
echo # Configurações do Google Sheets
echo REACT_APP_GOOGLE_API_KEY=AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A
echo REACT_APP_GOOGLE_SPREADSHEET_ID=1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM
echo.
echo # Configurações do MCP Server
echo GOOGLE_APPLICATION_CREDENTIALS=%CREDENTIALS_PATH%
) > .env

echo ✅ Arquivo .env criado!

echo.
echo 🎉 MCP Server configurado com sucesso!
echo.
echo 📋 Próximos passos:
echo 1. Reinicie o Cursor.IA
echo 2. O MCP Server estará disponível para leitura da planilha
echo 3. Use o comando 'mcp_TestSprite_testsprite_bootstrap_tests' para testar
echo.
echo 🔗 Para executar o MCP Server manualmente, use:
echo npx @modelcontextprotocol/server-google-sheets
echo.
pause
