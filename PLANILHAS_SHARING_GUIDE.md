# Guia para Compartilhar Planilhas - Passo 7

## 🔗 Compartilhar Planilhas com Service Account

### 1. Acessar a Planilha

1. Abra o Google Sheets no navegador
2. Acesse a planilha com ID: `13bZBY4PDqUc8TtHE9ztBLo1XIsZ7yjJw`
3. Ou acesse diretamente: https://docs.google.com/spreadsheets/d/13bZBY4PDqUc8TtHE9ztBLo1XIsZ7yjJw

### 2. Compartilhar a Planilha

1. Clique no botão **"Compartilhar"** (canto superior direito)
2. Na janela que abrir, clique em **"Adicionar pessoas e grupos"**
3. Digite o email do service account: `veloigp-sheets-service-333@veloigp.iam.gserviceaccount.com`
4. Defina a permissão como **"Editor"** ou **"Visualizador"**
5. Clique em **"Enviar"**

### 3. Verificar Permissões

1. Na mesma janela de compartilhamento
2. Verifique se o service account aparece na lista
3. Confirme se a permissão está correta

### 4. Estrutura da Planilha

A planilha deve ter a seguinte estrutura na **primeira linha** (cabeçalhos):

```
A: Chamada
B: Audio E Transcrições
C: Operador
D: Data
E: Hora
F: Data Atendimento
G: Hora Atendimento
H: País
I: DDD
J: Numero
K: Fila
L: Tempo Na Ura
M: Tempo De Espera
N: Tempo Falado
O: Tempo Total
P: Desconexão
Q: Telefone Entrada
R: Caminho U R A
S: Cpf/Cnpj
T: Pedido
U: Id Ligação
V: Id Ligação De Origem
W: I D Do Ticket
X: Fluxo De Filas
Y: Wh_quality_reason
Z: Wh_humor_reason
AA: Questionário De Qualidade
AB: Pergunta2 1 PERGUNTA ATENDENTE
AC: Pergunta2 2 PERGUNTA SOLUCAO
AD: Dia
AE: qtde
AF: Até 20 Seg
AG: Faixa
AH: Mês
AI: TMA (FALADO
AJ: Tempo URA (seg
AK: TME (seg)
AL: TMA (seg)
AM: Pergunta 1
AN: Pergunta 2
```

### 5. Dados de Exemplo

A partir da **segunda linha**, os dados devem seguir esta estrutura:

| Chamada | Operador | Data | Hora | Fila | Tempo De Espera | Tempo Falado | ... |
|---------|----------|------|------|------|-----------------|--------------|-----|
| 1 | João Silva | 2025-01-10 | 09:00 | Vendas | 15 | 120 | ... |
| 2 | Maria Santos | 2025-01-10 | 09:15 | Suporte | 30 | 180 | ... |

### 5. Testar Acesso

Após compartilhar, teste se o service account consegue acessar:

1. Reinicie o servidor: `npm start`
2. Acesse a página de **Planilhas**
3. Verifique no console se há mensagens de sucesso
4. Os dados reais devem aparecer em vez dos simulados

### 6. Troubleshooting

#### Erro: "Permission denied"
- Verifique se o email do service account está correto
- Confirme se a planilha foi compartilhada
- Verifique se a permissão é "Editor" ou "Visualizador"

#### Erro: "Spreadsheet not found"
- Verifique se o ID da planilha está correto
- Confirme se a planilha existe e está acessível

#### Erro: "Invalid range"
- Verifique se as abas existem na planilha
- Confirme se os nomes das abas estão corretos
- Verifique se há dados nas abas

### 7. Próximos Passos

1. ✅ Compartilhar planilha com service account
2. ✅ Configurar estrutura das abas
3. ✅ Testar acesso via API
4. ✅ Verificar dados na interface
5. ✅ Ajustar ranges se necessário

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Confirme se todas as etapas foram seguidas
3. Teste com uma planilha simples primeiro
4. Verifique as permissões no Google Sheets
