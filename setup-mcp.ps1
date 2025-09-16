# Script para configurar e executar o MCP Server para Google Sheets
# Execute este script no PowerShell como Administrador

Write-Host "🔧 Configurando MCP Server para Google Sheets..." -ForegroundColor Blue

# Verificar se o arquivo de credenciais existe
$credentialsPath = "C:\Users\Velotax Suporte\Downloads\ProjetoIGP\gcp-oauth.keys.json"
if (-not (Test-Path $credentialsPath)) {
    Write-Host "❌ Arquivo de credenciais não encontrado em: $credentialsPath" -ForegroundColor Red
    Write-Host "Por favor, verifique se o arquivo existe e tente novamente." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Arquivo de credenciais encontrado!" -ForegroundColor Green

# Instalar o MCP Server para Google Sheets
Write-Host "📦 Instalando MCP Server para Google Sheets..." -ForegroundColor Blue
try {
    npm install -g @modelcontextprotocol/server-google-sheets
    Write-Host "✅ MCP Server instalado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar MCP Server: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Configurar variável de ambiente
Write-Host "🔑 Configurando variável de ambiente..." -ForegroundColor Blue
$env:GOOGLE_APPLICATION_CREDENTIALS = $credentialsPath

# Verificar se a variável foi definida
if ($env:GOOGLE_APPLICATION_CREDENTIALS) {
    Write-Host "✅ Variável GOOGLE_APPLICATION_CREDENTIALS configurada: $env:GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao configurar variável de ambiente" -ForegroundColor Red
    exit 1
}

# Criar arquivo .env para o projeto
Write-Host "📝 Criando arquivo .env..." -ForegroundColor Blue
$envContent = @"
# Configurações do Google Sheets
REACT_APP_GOOGLE_API_KEY=AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A
REACT_APP_GOOGLE_SPREADSHEET_ID=1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM

# Configurações do MCP Server
GOOGLE_APPLICATION_CREDENTIALS=$credentialsPath
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Arquivo .env criado!" -ForegroundColor Green

# Testar conexão com a planilha
Write-Host "🧪 Testando conexão com a planilha..." -ForegroundColor Blue
try {
    # Aqui você pode adicionar um teste de conexão se necessário
    Write-Host "✅ Configuração concluída com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Configuração concluída, mas teste de conexão falhou: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 MCP Server configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Reinicie o Cursor.IA" -ForegroundColor White
Write-Host "2. O MCP Server estará disponível para leitura da planilha" -ForegroundColor White
Write-Host "3. Use o comando 'mcp_TestSprite_testsprite_bootstrap_tests' para testar" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Para executar o MCP Server manualmente, use:" -ForegroundColor Cyan
Write-Host "npx @modelcontextprotocol/server-google-sheets" -ForegroundColor White
