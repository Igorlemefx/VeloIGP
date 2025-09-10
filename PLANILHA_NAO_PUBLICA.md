# 🚨 PLANILHA NÃO ESTÁ PÚBLICA - SOLUÇÃO IMEDIATA

## ❌ Problema Identificado
A planilha ainda está **privada** e pedindo login. Por isso o erro `FAILED_PRECONDITION`.

## 🔧 SOLUÇÃO RÁPIDA (2 minutos)

### Passo 1: Tornar Planilha Pública
1. **Acesse sua planilha**: https://docs.google.com/spreadsheets/d/1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp/edit
2. **Clique em "Compartilhar"** (canto superior direito - ícone de pessoa)
3. **Clique em "Alterar para qualquer pessoa com o link"**
4. **Selecione "Visualizador"** (apenas leitura)
5. **Clique em "Concluído"**

### Passo 2: Verificar se Funcionou
1. **Abra uma aba anônima** no navegador
2. **Acesse**: https://docs.google.com/spreadsheets/d/1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp/edit
3. **Deve abrir SEM pedir login**

### Passo 3: Testar no Sistema
1. **Acesse**: https://velo-o1n2r7eti-igors-projects-fbf5bb59.vercel.app
2. **Vá para Planilhas**
3. **Clique em "Atualizar"**
4. **Dados devem aparecer**

## 🔍 Verificações Adicionais

### Se ainda não funcionar:

#### 1. Verificar se tem dados
- A planilha deve ter pelo menos algumas linhas de dados
- A primeira linha deve ter os cabeçalhos corretos

#### 2. Verificar estrutura
- Deve ter exatamente 40 colunas (A até AN)
- Primeira linha deve ter os cabeçalhos esperados

#### 3. Verificar se salvou
- Pressione Ctrl+S para salvar
- Aguarde a sincronização do Google Drive

## 📊 Estrutura Obrigatória

A planilha deve ter **exatamente** esta primeira linha:

```
Chamada | Audio E Transcrições | Operador | Data | Hora | Data Atendimento | Hora Atendimento | País | DDD | Numero | Fila | Tempo Na Ura | Tempo De Espera | Tempo Falado | Tempo Total | Desconexão | Telefone Entrada | Caminho U R A | Cpf/Cnpj | Pedido | Id Ligação | Id Ligação De Origem | I D Do Ticket | Fluxo De Filas | Wh_quality_reason | Wh_humor_reason | Questionário De Qualidade | Pergunta2 1 PERGUNTA ATENDENTE | Pergunta2 2 PERGUNTA SOLUCAO | Dia | qtde | Até 20 Seg | Faixa | Mês | TMA (FALADO | Tempo URA (seg | TME (seg) | TMA (seg) | Pergunta 1 | Pergunta 2
```

## 🧪 Teste Rápido

Use o validador: https://velo-o1n2r7eti-igors-projects-fbf5bb59.vercel.app/validar-planilha.html

## ⚡ Resumo da Solução

**O problema é simples**: A planilha não está pública.

**A solução é simples**: Tornar pública no Google Drive.

**Tempo estimado**: 2 minutos.

Após tornar pública, o sistema VeloIGP funcionará imediatamente! 🎉
