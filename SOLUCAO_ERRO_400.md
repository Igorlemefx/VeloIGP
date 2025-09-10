# 🚨 Solução para Erro 400 - FAILED_PRECONDITION

## 📋 Problema Identificado
**Erro**: `"This operation is not supported for this document"`
**Status**: `FAILED_PRECONDITION`
**Código**: 400

## 🔍 Causa do Problema
A planilha não está configurada para permitir acesso via API do Google Sheets. Isso acontece quando:

1. **Planilha não é pública** (mais comum)
2. **API Key não tem permissões** adequadas
3. **Planilha está em formato incompatível** com a API

## 🔧 Soluções

### Solução 1: Tornar Planilha Pública (Recomendado)

1. **Acesse sua planilha**:
   - URL: https://docs.google.com/spreadsheets/d/1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp/edit

2. **Clique em "Compartilhar"** (canto superior direito)

3. **Configure permissões**:
   - Clique em "Alterar para qualquer pessoa com o link"
   - Selecione "Visualizador" (apenas leitura)
   - Clique em "Concluído"

4. **Teste o acesso**:
   - A planilha deve estar acessível sem login
   - URL deve funcionar sem autenticação

### Solução 2: Verificar Formato da Planilha

1. **Abra a planilha** no Google Sheets
2. **Verifique se tem dados** na primeira aba
3. **Confirme se a estrutura** está correta (40 colunas)
4. **Salve a planilha** (Ctrl+S)

### Solução 3: Configurar API Key Corretamente

1. **Acesse Google Cloud Console**: https://console.cloud.google.com/
2. **Selecione seu projeto**
3. **Vá para APIs & Services > Credentials**
4. **Crie uma nova API Key**:
   - Clique em "Create Credentials" > "API Key"
   - Copie a API key gerada
5. **Habilite Google Sheets API**:
   - Vá para "APIs & Services" > "Library"
   - Procure por "Google Sheets API"
   - Clique em "Enable"

## 🧪 Teste Após Configurar

### Teste 1: Verificar se Planilha é Pública
Abra esta URL no navegador (sem login):
```
https://docs.google.com/spreadsheets/d/1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp/edit
```

**✅ Sucesso**: Planilha abre sem pedir login
**❌ Erro**: Pede login ou mostra erro de permissão

### Teste 2: Verificar API Key
Use o arquivo de teste: `test-spreadsheet.html`

### Teste 3: Verificar no Sistema
1. Acesse: https://velo-d4o0xi3u2-igors-projects-fbf5bb59.vercel.app
2. Vá para página "Planilhas"
3. Abra console (F12)
4. Verifique se aparece erro diferente

## 📊 Estrutura Esperada da Planilha

A planilha deve ter **exatamente** esta estrutura na primeira linha:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z | AA | AB | AC | AD | AE | AF | AG | AH | AI | AJ | AK | AL | AM | AN |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Chamada | Audio E Transcrições | Operador | Data | Hora | Data Atendimento | Hora Atendimento | País | DDD | Numero | Fila | Tempo Na Ura | Tempo De Espera | Tempo Falado | Tempo Total | Desconexão | Telefone Entrada | Caminho U R A | Cpf/Cnpj | Pedido | Id Ligação | Id Ligação De Origem | I D Do Ticket | Fluxo De Filas | Wh_quality_reason | Wh_humor_reason | Questionário De Qualidade | Pergunta2 1 PERGUNTA ATENDENTE | Pergunta2 2 PERGUNTA SOLUCAO | Dia | qtde | Até 20 Seg | Faixa | Mês | TMA (FALADO | Tempo URA (seg | TME (seg) | TMA (seg) | Pergunta 1 | Pergunta 2 |

## 🚀 Próximos Passos

1. **Configure a planilha** usando a Solução 1 (tornar pública)
2. **Teste o acesso** usando os testes acima
3. **Verifique o sistema** VeloIGP novamente
4. **Se ainda der erro**, me informe qual erro específico aparece

## 📞 Suporte

Se o problema persistir:
1. Verifique se a planilha tem dados reais
2. Confirme se a estrutura está correta
3. Teste com uma planilha simples primeiro
4. Verifique as permissões no Google Drive

O erro `FAILED_PRECONDITION` é **100% solucionável** com as configurações corretas! 🎯
