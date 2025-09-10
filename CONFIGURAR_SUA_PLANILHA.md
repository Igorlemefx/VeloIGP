# 🔧 Configurar Sua Planilha Real

## 📋 Status Atual
- **ID da Planilha**: `1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp`
- **Status**: ❌ Planilha não acessível publicamente
- **Erro**: 400 - Solicitação Incorreta

## 🚨 Problema Identificado
A planilha não está configurada para acesso público via API. Vamos corrigir isso:

## 🔧 Soluções

### Opção 1: Tornar Planilha Pública (Recomendado)

1. **Acesse sua planilha**: https://docs.google.com/spreadsheets/d/1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp/edit

2. **Clique em "Compartilhar"** (canto superior direito)

3. **Configure as permissões**:
   - Clique em "Alterar para qualquer pessoa com o link"
   - Selecione "Visualizador" (apenas leitura)
   - Clique em "Concluído"

4. **Teste o acesso**:
   - A planilha deve estar acessível sem login
   - URL deve funcionar sem autenticação

### Opção 2: Configurar API Key com Permissões

1. **Acesse Google Cloud Console**: https://console.cloud.google.com/

2. **Selecione seu projeto** ou crie um novo

3. **Vá para APIs & Services > Credentials**

4. **Crie uma API Key**:
   - Clique em "Create Credentials" > "API Key"
   - Copie a API key gerada

5. **Habilite Google Sheets API**:
   - Vá para "APIs & Services" > "Library"
   - Procure por "Google Sheets API"
   - Clique em "Enable"

6. **Configure restrições** (opcional):
   - Clique na API key criada
   - Em "Application restrictions", selecione "HTTP referrers"
   - Adicione: `https://velo-*.vercel.app/*`

## 🧪 Testar Configuração

Após configurar, teste se a planilha está acessível:

```bash
# Teste 1: Verificar se a planilha existe
curl "https://sheets.googleapis.com/v4/spreadsheets/1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp?key=SUA_API_KEY"

# Teste 2: Verificar dados da planilha
curl "https://sheets.googleapis.com/v4/spreadsheets/1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp/values/A:AN?key=SUA_API_KEY"
```

## 📝 Configurar .env.local

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Google Sheets API Key
REACT_APP_GOOGLE_API_KEY=sua-api-key-aqui

# ID da planilha (já configurado)
REACT_APP_SPREADSHEET_ID=1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp
```

## 🔍 Verificar Estrutura da Planilha

A planilha deve ter a seguinte estrutura na **primeira linha**:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z | AA | AB | AC | AD | AE | AF | AG | AH | AI | AJ | AK | AL | AM | AN |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Chamada | Audio E Transcrições | Operador | Data | Hora | Data Atendimento | Hora Atendimento | País | DDD | Numero | Fila | Tempo Na Ura | Tempo De Espera | Tempo Falado | Tempo Total | Desconexão | Telefone Entrada | Caminho U R A | Cpf/Cnpj | Pedido | Id Ligação | Id Ligação De Origem | I D Do Ticket | Fluxo De Filas | Wh_quality_reason | Wh_humor_reason | Questionário De Qualidade | Pergunta2 1 PERGUNTA ATENDENTE | Pergunta2 2 PERGUNTA SOLUCAO | Dia | qtde | Até 20 Seg | Faixa | Mês | TMA (FALADO | Tempo URA (seg | TME (seg) | TMA (seg) | Pergunta 1 | Pergunta 2 |

## 🚀 Deploy e Teste

1. **Configure o .env.local** com sua API key
2. **Reinicie o servidor**: `npm start`
3. **Acesse a página Planilhas**
4. **Verifique no console** se aparece: "Conectando com planilha real do Google Drive..."

## 🆘 Troubleshooting

### Erro 400: Solicitação Incorreta
- ✅ **Solução**: Tornar planilha pública ou configurar API key corretamente

### Erro 403: Forbidden
- ✅ **Solução**: Verificar se a API key tem permissões para Google Sheets API

### Erro 404: Not Found
- ✅ **Solução**: Verificar se o ID da planilha está correto

### Dados não aparecem
- ✅ **Solução**: Verificar se a planilha tem dados na primeira aba
- ✅ **Solução**: Verificar se a estrutura está correta (40 colunas)

## 📞 Próximos Passos

1. **Configure a planilha** usando uma das opções acima
2. **Teste o acesso** com os comandos de teste
3. **Configure o .env.local** com sua API key
4. **Reinicie o sistema** e verifique se funciona

Após configurar, o sistema VeloIGP estará 100% conectado com sua planilha real! 🎉
