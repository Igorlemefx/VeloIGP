# 🔐 Configuração de Credenciais - VeloIGP

## ✅ Arquivo .env.local Criado!

O arquivo `.env.local` foi criado com sucesso na raiz do projeto. Agora você precisa substituir as credenciais de exemplo pelas credenciais reais do seu Service Account.

## 📝 Próximos Passos

### 1. Obter Credenciais Reais

1. **Acesse o Google Cloud Console**: https://console.cloud.google.com/
2. **Vá para IAM & Admin > Service Accounts**
3. **Clique no service account**: `veloigp-sheets-service-333@veloigp.iam.gserviceaccount.com`
4. **Vá para a aba "Keys"**
5. **Clique em "Add Key" > "Create New Key"**
6. **Selecione "JSON" e clique em "Create"**
7. **Baixe o arquivo JSON**

### 2. Substituir Credenciais no .env.local

Abra o arquivo `.env.local` e substitua os seguintes valores:

#### ❌ Valores Atuais (Exemplo)
```env
REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
REACT_APP_GOOGLE_SHEETS_CLIENT_ID=seu-client-id
```

#### ✅ Valores Reais (Do arquivo JSON baixado)
```env
REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
REACT_APP_GOOGLE_SHEETS_CLIENT_ID=123456789012345678901
```

### 3. Mapeamento das Credenciais

| Variável .env.local | Campo no JSON | Exemplo |
|---------------------|---------------|---------|
| `REACT_APP_GOOGLE_SHEETS_TYPE` | `type` | `service_account` |
| `REACT_APP_GOOGLE_SHEETS_PROJECT_ID` | `project_id` | `veloigp` |
| `REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY_ID` | `private_key_id` | `AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A` |
| `REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY` | `private_key` | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| `REACT_APP_GOOGLE_SHEETS_CLIENT_EMAIL` | `client_email` | `veloigp-sheets-service-333@veloigp.iam.gserviceaccount.com` |
| `REACT_APP_GOOGLE_SHEETS_CLIENT_ID` | `client_id` | `123456789012345678901` |

### 4. Testar Configuração

Após substituir as credenciais:

```bash
# Reiniciar servidor
npm start

# Acessar página Planilhas
# Verificar console do navegador
```

### 5. Mensagens Esperadas

#### ✅ Sucesso (Credenciais Válidas)
```
Google Sheets Service autenticado com sucesso
Usando API real do Google Sheets
```

#### ❌ Erro (Credenciais Inválidas)
```
Google Sheets Service não configurado, usando dados simulados
Erro na autenticação do Google Sheets
```

## 🔒 Segurança

- ✅ O arquivo `.env.local` está no `.gitignore`
- ✅ NUNCA commite credenciais reais
- ✅ Mantenha as chaves seguras
- ✅ Use apenas em ambiente de desenvolvimento

## 📞 Suporte

Se encontrar problemas:
1. Verifique se o arquivo JSON foi baixado corretamente
2. Confirme se todas as credenciais foram copiadas
3. Verifique se a planilha foi compartilhada com o service account
4. Reinicie o servidor após alterações

## 🚀 Status

- ✅ **Arquivo .env.local**: Criado
- ⏳ **Credenciais reais**: Aguardando substituição
- ⏳ **Teste de integração**: Aguardando validação
