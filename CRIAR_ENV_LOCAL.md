# 🔧 Criar Arquivo .env.local - VeloIGP

## 📝 Instruções para Criar o Arquivo

### 1. Criar o Arquivo
Na raiz do projeto (mesmo nível do package.json), crie um arquivo chamado `.env.local`

### 2. Conteúdo do Arquivo
Cole o seguinte conteúdo no arquivo `.env.local`:

```env
# Google Sheets API Configuration
REACT_APP_GOOGLE_SHEETS_TYPE=service_account
REACT_APP_GOOGLE_SHEETS_PROJECT_ID=veloigp
REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY_ID=AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A
REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
REACT_APP_GOOGLE_SHEETS_CLIENT_EMAIL=veloigp-sheets-service-333@veloigp.iam.gserviceaccount.com
REACT_APP_GOOGLE_SHEETS_CLIENT_ID=seu-client-id
REACT_APP_GOOGLE_SHEETS_AUTH_URI=https://accounts.google.com/o/oauth2/auth
REACT_APP_GOOGLE_SHEETS_TOKEN_URI=https://oauth2.googleapis.com/token
REACT_APP_GOOGLE_SHEETS_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
REACT_APP_GOOGLE_SHEETS_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/veloigp-sheets-service-333%40veloigp.iam.gserviceaccount.com
```

### 3. Substituir Credenciais Reais
Substitua os seguintes valores pelas suas credenciais reais do Google Cloud Console:

- `SUA_CHAVE_PRIVADA_AQUI` → Sua chave privada real (com quebras de linha)
- `seu-client-id` → Seu client_id real

### 4. Verificar Estrutura
O arquivo deve estar na raiz do projeto:
```
veloigp-dashboard/
├── .env.local          ← Aqui!
├── package.json
├── src/
└── ...
```

### 5. Testar
Após criar o arquivo:
```bash
npm start
# Acessar página Planilhas
# Verificar console do navegador
```

## 🔒 Segurança
- ✅ O arquivo `.env.local` está no `.gitignore`
- ✅ NUNCA commite credenciais reais
- ✅ Mantenha as chaves seguras

## 📞 Suporte
Se encontrar problemas:
1. Verifique se o arquivo está na raiz do projeto
2. Confirme se todas as credenciais foram copiadas
3. Verifique se não há espaços extras ou caracteres especiais
4. Reinicie o servidor após alterações
