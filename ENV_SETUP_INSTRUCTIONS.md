# Instruções para Configurar .env.local

## 📝 Passo 5 - Criar Arquivo .env.local

### 1. Criar o arquivo manualmente

Crie um arquivo chamado `.env.local` na raiz do projeto (mesmo nível do package.json) com o seguinte conteúdo:

```env
# Google Sheets API Configuration
REACT_APP_GOOGLE_SHEETS_TYPE=service_account
REACT_APP_GOOGLE_SHEETS_PROJECT_ID=veloigp
REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY_ID=AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A
REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua-private-key-aqui\n-----END PRIVATE KEY-----\n"
REACT_APP_GOOGLE_SHEETS_CLIENT_EMAIL=veloigp-sheets-service-333@veloigp.iam.gserviceaccount.com
REACT_APP_GOOGLE_SHEETS_CLIENT_ID=seu-client-id
REACT_APP_GOOGLE_SHEETS_AUTH_URI=https://accounts.google.com/o/oauth2/auth
REACT_APP_GOOGLE_SHEETS_TOKEN_URI=https://oauth2.googleapis.com/token
REACT_APP_GOOGLE_SHEETS_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
REACT_APP_GOOGLE_SHEETS_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/veloigp-sheets-service-333%40veloigp.iam.gserviceaccount.com
```

### 2. Substituir valores reais

**IMPORTANTE**: Substitua os seguintes valores pelos dados reais do seu Service Account:

- `sua-private-key-aqui` → Sua chave privada real (com quebras de linha)
- `veloigp-sheets-service-333@veloigp.iam.gserviceaccount.com` → Email real do service account
- `seu-client-id` → Client ID real do service account
- `veloigp-sheets-service-333%40veloigp.iam.gserviceaccount.com` → Email codificado para URL

### 3. Verificar estrutura do arquivo

O arquivo deve estar na raiz do projeto:
```
veloigp-dashboard/
├── .env.local          ← Aqui!
├── package.json
├── src/
└── ...
```

### 4. Testar a configuração

Após criar o arquivo, execute:

```bash
npm start
```

E verifique no console do navegador se aparecem as mensagens:
- ✅ "Google Sheets Service autenticado com sucesso"
- ✅ "Usando API real do Google Sheets"

### 5. Próximos passos

1. **Compartilhar planilhas** com o service account
2. **Atualizar IDs** das planilhas em `googleSheetsConfig.ts`
3. **Testar integração** na página de Planilhas

## 🔒 Segurança

- ✅ O arquivo `.env.local` está no `.gitignore`
- ✅ NUNCA commite credenciais reais
- ✅ Mantenha as chaves seguras
