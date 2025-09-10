# Teste de Integração Google Sheets - VeloIGP

## ✅ Status Atual

### Configuração Completa
- ✅ **Service Account**: `veloigp-sheets-service-333@veloigp.iam.gserviceaccount.com`
- ✅ **Planilha Compartilhada**: `13bZBY4PDqUc8TtHE9ztBLo1XIsZ7yjJw`
- ✅ **Permissões**: Configuradas
- ✅ **Sistema Híbrido**: Pronto para dados reais

### Próximos Passos para Ativação

#### 1. Criar Arquivo .env.local
```bash
# Na raiz do projeto
echo. > .env.local
```

#### 2. Configurar Credenciais
Cole o conteúdo no arquivo `.env.local`:

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

#### 3. Estruturar Planilha
Crie as seguintes abas na planilha:

1. **"Dados Individuais de Chamadas"**
2. **"Métricas por Hora"**
3. **"Performance por Agente"**
4. **"Comparativo Mensal"**
5. **"Análise por Fila"**

#### 4. Testar Integração
```bash
# Reiniciar servidor
npm start

# Acessar página Planilhas
# Verificar console do navegador
```

### Mensagens Esperadas no Console

#### ✅ Sucesso
```
Google Sheets Service autenticado com sucesso
Usando API real do Google Sheets
```

#### ❌ Erro
```
Google Sheets Service não configurado, usando dados simulados
```

### Estrutura de Dados Esperada

#### Aba: "Dados Individuais de Chamadas"
| Data/Hora | Número do Cliente | Agente | Duração (min) | Status | Fila | Satisfação | Observações |
|-----------|-------------------|--------|---------------|--------|------|------------|-------------|
| 2025-01-10 09:00 | 11999999999 | João | 5 | Atendida | Vendas | 5 | Cliente satisfeito |
| 2025-01-10 09:15 | 11888888888 | Maria | 3 | Perdida | Suporte | - | Cliente desistiu |

#### Aba: "Métricas por Hora"
| Hora | Total de Chamadas | Chamadas Atendidas | Tempo Médio de Espera | Taxa de Atendimento |
|------|-------------------|-------------------|----------------------|-------------------|
| 09:00 | 15 | 12 | 2.5 | 80% |
| 10:00 | 20 | 18 | 1.8 | 90% |

### Troubleshooting

#### Erro: "Permission denied"
- Verificar se a planilha foi compartilhada com o email correto
- Confirmar se a permissão é "Editor" ou "Visualizador"

#### Erro: "Invalid credentials"
- Verificar se a private key está correta
- Confirmar se todas as variáveis estão preenchidas

#### Erro: "Spreadsheet not found"
- Verificar se o ID da planilha está correto
- Confirmar se a planilha existe

### Status da Integração

- ✅ **Configuração**: Completa
- ✅ **Compartilhamento**: Realizado
- ⏳ **Credenciais**: Aguardando configuração
- ⏳ **Estrutura**: Aguardando criação das abas
- ⏳ **Teste**: Aguardando validação

## 🚀 Próximo Passo

**Configure o arquivo `.env.local` com suas credenciais reais e teste a integração!**
