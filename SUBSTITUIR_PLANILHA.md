# 🔄 Guia para Substituir Planilha no Google Drive

## 🎯 Objetivo
Substituir a planilha atual por uma nova com dados atualizados (Janeiro até ontem).

## 📋 Pré-requisitos
- ✅ Nova planilha com dados de Janeiro até ontem
- ✅ Estrutura correta (40 colunas conforme especificação)
- ✅ Dados organizados na primeira aba

## 🔧 Passo a Passo

### 1. Preparar Nova Planilha

**Estrutura Obrigatória (Primeira Linha):**
```
A: Chamada | B: Audio E Transcrições | C: Operador | D: Data | E: Hora | F: Data Atendimento | G: Hora Atendimento | H: País | I: DDD | J: Numero | K: Fila | L: Tempo Na Ura | M: Tempo De Espera | N: Tempo Falado | O: Tempo Total | P: Desconexão | Q: Telefone Entrada | R: Caminho U R A | S: Cpf/Cnpj | T: Pedido | U: Id Ligação | V: Id Ligação De Origem | W: I D Do Ticket | X: Fluxo De Filas | Y: Wh_quality_reason | Z: Wh_humor_reason | AA: Questionário De Qualidade | AB: Pergunta2 1 PERGUNTA ATENDENTE | AC: Pergunta2 2 PERGunta SOLUCAO | AD: Dia | AE: qtde | AF: Até 20 Seg | AG: Faixa | AH: Mês | AI: TMA (FALADO | AJ: Tempo URA (seg | AK: TME (seg) | AL: TMA (seg) | AM: Pergunta 1 | AN: Pergunta 2
```

### 2. Opções para Substituir

#### **Opção A: Substituir Planilha Existente (Recomendado)**
1. **Acesse a planilha atual**: https://docs.google.com/spreadsheets/d/1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp/edit
2. **Selecione todos os dados** (Ctrl+A)
3. **Delete tudo** (Delete)
4. **Cole os novos dados** da planilha atualizada
5. **Salve** (Ctrl+S)
6. **Configure permissões**:
   - Clique em "Compartilhar"
   - Selecione "Qualquer pessoa com o link pode visualizar"
   - Clique em "Concluído"

#### **Opção B: Criar Nova Planilha**
1. **Crie nova planilha** no Google Drive
2. **Cole os dados** na primeira aba
3. **Configure permissões** (público)
4. **Copie o novo ID** da URL
5. **Atualize o sistema** com o novo ID

### 3. Verificar Estrutura

**Checklist da Nova Planilha:**
- ✅ **Primeira linha**: Cabeçalhos corretos (40 colunas)
- ✅ **Dados**: Pelo menos algumas linhas de dados reais
- ✅ **Formato**: Datas no formato correto (YYYY-MM-DD)
- ✅ **Permissões**: Pública ou acessível via API
- ✅ **Salvamento**: Planilha salva e sincronizada

### 4. Testar Nova Planilha

#### **Teste 1: Acesso Público**
Abra esta URL sem login:
```
https://docs.google.com/spreadsheets/d/1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp/edit
```

#### **Teste 2: API do Google Sheets**
Use o arquivo de teste: `test-spreadsheet.html`

#### **Teste 3: Sistema VeloIGP**
1. Acesse: https://velo-369rztzej-igors-projects-fbf5bb59.vercel.app
2. Vá para página "Planilhas"
3. Clique em "Atualizar"
4. Verifique se os dados aparecem

## 🔍 Troubleshooting

### Erro: "Planilha vazia"
- ✅ **Solução**: Verificar se os dados foram colados corretamente
- ✅ **Solução**: Confirmar se a primeira linha tem cabeçalhos

### Erro: "Estrutura incorreta"
- ✅ **Solução**: Verificar se tem exatamente 40 colunas
- ✅ **Solução**: Confirmar se os cabeçalhos estão corretos

### Erro: "Permissões negadas"
- ✅ **Solução**: Tornar planilha pública
- ✅ **Solução**: Verificar se está salva

### Dados não aparecem
- ✅ **Solução**: Aguardar sincronização do Google Drive
- ✅ **Solução**: Recarregar a página do sistema

## 📊 Estrutura de Dados Esperada

### Exemplo de Linha de Dados:
```
1 | audio_001.mp3 | João Silva | 2025-01-15 | 08:30 | 2025-01-15 | 08:32 | Brasil | 11 | 11987654321 | Vendas | 45 | 30 | 180 | 210 | Cliente | 11987654321 | URA_Padrão | 12345678901 | PED000001 | LIG00000001 | LIG00000000 | TKT000001 | Fluxo_Padrão | Qualidade_Boa | Humor_Positivo | Satisfatório | 5 | 4 | 15 | 1 | Sim | 0-20s | 1 | 180 | 45 | 30 | 180 | 5 | 4
```

## 🚀 Após Substituir

1. **Teste o sistema** VeloIGP
2. **Verifique os dados** na página Planilhas
3. **Teste os filtros** se os dados aparecerem
4. **Confirme as análises** funcionam

## 📞 Suporte

Se encontrar problemas:
1. Verifique se a planilha tem dados reais
2. Confirme se a estrutura está correta
3. Teste com dados simples primeiro
4. Verifique as permissões no Google Drive

A substituição da planilha deve resolver o problema `FAILED_PRECONDITION`! 🎉
