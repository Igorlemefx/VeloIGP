# Configuração do Google Sheets API - VeloIGP

## 📋 Pré-requisitos

1. **Conta Google** com acesso ao Google Cloud Console
2. **Projeto no Google Cloud** habilitado para Google Sheets API
3. **Service Account** criado com permissões adequadas

## 🔧 Passo a Passo

### 1. Criar Service Account

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto ou crie um novo
3. Vá para **IAM & Admin** > **Service Accounts**
4. Clique em **Create Service Account**
5. Preencha:
   - **Name**: `veloigp-sheets-service`
   - **Description**: `Service account para integração VeloIGP com Google Sheets`
6. Clique em **Create and Continue**

### 2. Configurar Permissões

1. Na tela de **Grant Access**, adicione as seguintes roles:
   - **Viewer** (para visualizar planilhas)
   - **Editor** (para acessar dados)
2. Clique em **Continue** e depois **Done**

### 3. Gerar Chave de Autenticação

1. Clique no service account criado
2. Vá para a aba **Keys**
3. Clique em **Add Key** > **Create New Key**
4. Selecione **JSON** e clique em **Create**
5. Baixe o arquivo JSON (mantenha seguro!)

### 4. Habilitar APIs Necessárias

1. Vá para **APIs & Services** > **Library**
2. Procure e habilite:
   - **Google Sheets API**
   - **Google Drive API**

### 5. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Google Sheets API Configuration
REACT_APP_GOOGLE_SHEETS_TYPE=service_account
REACT_APP_GOOGLE_SHEETS_PROJECT_ID=veloigp
REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY_ID=AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A
REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua-private-key-aqui\n-----END PRIVATE KEY-----\n"
REACT_APP_GOOGLE_SHEETS_CLIENT_EMAIL=seu-service-account@seu-project.iam.gserviceaccount.com
REACT_APP_GOOGLE_SHEETS_CLIENT_ID=seu-client-id
REACT_APP_GOOGLE_SHEETS_AUTH_URI=https://accounts.google.com/o/oauth2/auth
REACT_APP_GOOGLE_SHEETS_TOKEN_URI=https://oauth2.googleapis.com/token
REACT_APP_GOOGLE_SHEETS_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
REACT_APP_GOOGLE_SHEETS_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/seu-service-account%40seu-project.iam.gserviceaccount.com
```

### 6. Configurar IDs das Planilhas

No arquivo `src/config/googleSheetsConfig.ts`, atualize os IDs:

```typescript
export const SPREADSHEET_IDS = {
  MAIN_REPORTS: 'ID_DA_SUA_PLANILHA_PRINCIPAL',
  MONTHLY_DATA: 'ID_DA_SUA_PLANILHA_MENSAL',
  AGENT_PERFORMANCE: 'ID_DA_SUA_PLANILHA_AGENTES'
};
```

### 7. Compartilhar Planilhas

1. Abra cada planilha no Google Sheets
2. Clique em **Share** (Compartilhar)
3. Adicione o email do service account: `seu-service-account@seu-project.iam.gserviceaccount.com`
4. Defina permissão como **Editor** ou **Viewer**
5. Clique em **Send**

## 🔒 Segurança

- **NUNCA** commite o arquivo `.env.local` no Git
- **NUNCA** compartilhe as chaves de autenticação
- Use **Service Account** com permissões mínimas necessárias
- Monitore o uso da API no Google Cloud Console

## 🧪 Testando a Configuração

1. Reinicie o servidor de desenvolvimento: `npm start`
2. Acesse a página de **Planilhas**
3. Verifique no console do navegador se há mensagens de sucesso
4. Os dados reais devem aparecer em vez dos simulados

## 🚨 Troubleshooting

### Erro: "Google Sheets Service não configurado"
- Verifique se o arquivo `.env.local` existe
- Confirme se todas as variáveis estão preenchidas
- Reinicie o servidor após alterações

### Erro: "Permission denied"
- Verifique se o service account tem acesso às planilhas
- Confirme se as APIs estão habilitadas
- Verifique se o email do service account está correto

### Erro: "Invalid credentials"
- Verifique se a private key está correta (com quebras de linha)
- Confirme se o client_email está correto
- Verifique se o project_id está correto

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Confirme se todas as etapas foram seguidas
3. Teste com uma planilha simples primeiro
4. Verifique as permissões no Google Cloud Console
