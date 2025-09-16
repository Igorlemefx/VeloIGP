# Configuração do MCP Server para Google Sheets

Este guia explica como configurar o MCP Server para que o Cursor.IA possa ler diretamente da planilha do Google Sheets.

## 📋 Pré-requisitos

1. **Arquivo de Credenciais**: `C:\Users\Velotax Suporte\Downloads\ProjetoIGP\gcp-oauth.keys.json`
2. **Node.js** instalado
3. **NPM** funcionando
4. **Cursor.IA** configurado

## 🚀 Configuração Rápida

### Opção 1: Script Automático (Recomendado)

Execute o script de configuração:

```bash
# No PowerShell (como Administrador)
.\setup-mcp.ps1

# Ou no CMD
setup-mcp.bat
```

### Opção 2: Configuração Manual

1. **Instalar o MCP Server**:
```bash
npm install -g @modelcontextprotocol/server-google-sheets
```

2. **Configurar variável de ambiente**:
```bash
# No PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\Velotax Suporte\Downloads\ProjetoIGP\gcp-oauth.keys.json"

# No CMD
set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Velotax Suporte\Downloads\ProjetoIGP\gcp-oauth.keys.json
```

3. **Criar arquivo .env**:
```env
# Configurações do Google Sheets
REACT_APP_GOOGLE_API_KEY=AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A
REACT_APP_GOOGLE_SPREADSHEET_ID=1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM

# Configurações do MCP Server
GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Velotax Suporte\Downloads\ProjetoIGP\gcp-oauth.keys.json
```

## 🔧 Configuração do Cursor.IA

1. **Reinicie o Cursor.IA** após a configuração
2. **Verifique se o MCP Server está ativo** no Cursor.IA
3. **Teste a conexão** usando os comandos MCP disponíveis

## 📊 Estrutura da Planilha

A planilha contém dados de chamadas telefônicas com 40 colunas:

### Colunas Principais:
- **Chamada**: Tipo de chamada (Atendida, Retida na URA, Abandonada)
- **Operador**: Identificação do operador
- **Data/Hora**: Data e hora da chamada e atendimento
- **País/DDD/Numero**: Informações de origem
- **Fila**: Fila de atendimento

### Tempos:
- **Tempo Na Ura**: Tempo na URA (MM:SS)
- **Tempo De Espera**: Tempo de espera (MM:SS)
- **Tempo Falado**: Tempo falado (MM:SS)
- **Tempo Total**: Tempo total (MM:SS)

### Avaliações:
- **Questionário De Qualidade**: Avaliações de qualidade
- **Pergunta2 1 PERGUNTA ATENDENTE**: Pergunta sobre atendente
- **Pergunta2 2 PERGUNTA SOLUCAO**: Pergunta sobre solução

## 🧪 Testando a Configuração

Use os seguintes comandos MCP no Cursor.IA:

```bash
# Inicializar testes
mcp_TestSprite_testsprite_bootstrap_tests

# Gerar resumo do código
mcp_TestSprite_testsprite_generate_code_summary

# Gerar PRD padronizado
mcp_TestSprite_testsprite_generate_standardized_prd

# Gerar plano de teste frontend
mcp_TestSprite_testsprite_generate_frontend_test_plan

# Gerar plano de teste backend
mcp_TestSprite_testsprite_generate_backend_test_plan

# Gerar e executar código
mcp_TestSprite_testsprite_generate_code_and_execute
```

## 🔍 Verificação da Configuração

1. **Verificar se o arquivo de credenciais existe**:
```bash
Test-Path "C:\Users\Velotax Suporte\Downloads\ProjetoIGP\gcp-oauth.keys.json"
```

2. **Verificar se a variável de ambiente está definida**:
```bash
echo $env:GOOGLE_APPLICATION_CREDENTIALS
```

3. **Testar conexão com a planilha**:
```bash
npx @modelcontextprotocol/server-google-sheets
```

## 🚨 Solução de Problemas

### Erro: "Arquivo de credenciais não encontrado"
- Verifique se o arquivo existe no caminho especificado
- Verifique as permissões do arquivo

### Erro: "Variável de ambiente não definida"
- Execute o script de configuração novamente
- Reinicie o terminal/PowerShell

### Erro: "MCP Server não responde"
- Verifique se o Node.js está instalado
- Verifique se o MCP Server foi instalado corretamente
- Reinicie o Cursor.IA

### Erro: "Acesso negado à planilha"
- Verifique se as credenciais têm permissão para acessar a planilha
- Verifique se o Spreadsheet ID está correto

## 📚 Comandos Úteis

```bash
# Instalar MCP Server
npm install -g @modelcontextprotocol/server-google-sheets

# Executar MCP Server
npx @modelcontextprotocol/server-google-sheets

# Verificar instalação
npm list -g @modelcontextprotocol/server-google-sheets

# Desinstalar MCP Server
npm uninstall -g @modelcontextprotocol/server-google-sheets
```

## 🔗 Links Úteis

- [Documentação do MCP](https://modelcontextprotocol.io/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com/)

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Cursor.IA
2. Verifique se todas as dependências estão instaladas
3. Reinicie o Cursor.IA e o terminal
4. Execute o script de configuração novamente
