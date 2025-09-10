# Guia para Compartilhar Planilhas - Passo 7

## 🔗 Compartilhar Planilhas com Service Account

### 1. Acessar a Planilha

1. Abra o Google Sheets no navegador
2. Acesse a planilha com ID: `13bZBY4PDqUc8TtHE9ztBLo1XIsZ7yjJw`
3. Ou acesse diretamente: https://docs.google.com/spreadsheets/d/13bZBY4PDqUc8TtHE9ztBLo1XIsZ7yjJw

### 2. Compartilhar a Planilha

1. Clique no botão **"Compartilhar"** (canto superior direito)
2. Na janela que abrir, clique em **"Adicionar pessoas e grupos"**
3. Digite o email do service account: `seu-service-account@seu-project.iam.gserviceaccount.com`
4. Defina a permissão como **"Editor"** ou **"Visualizador"**
5. Clique em **"Enviar"**

### 3. Verificar Permissões

1. Na mesma janela de compartilhamento
2. Verifique se o service account aparece na lista
3. Confirme se a permissão está correta

### 4. Estrutura da Planilha

Para o sistema funcionar corretamente, a planilha deve ter as seguintes abas:

#### Aba 1: "Dados Individuais de Chamadas"
```
A: Data/Hora
B: Número do Cliente
C: Agente
D: Duração (min)
E: Status
F: Fila
G: Satisfação
H: Observações
```

#### Aba 2: "Métricas por Hora"
```
A: Hora
B: Total de Chamadas
C: Chamadas Atendidas
D: Tempo Médio de Espera
E: Taxa de Atendimento
```

#### Aba 3: "Performance por Agente"
```
A: Nome do Agente
B: Total de Chamadas
C: Chamadas Atendidas
D: Tempo Médio de Atendimento
E: Taxa de Satisfação
F: Observações
```

#### Aba 4: "Comparativo Mensal"
```
A: Mês
B: Total de Chamadas
C: Taxa de Atendimento
D: Tempo Médio de Espera
E: Satisfação Média
F: Agentes Ativos
G: Observações
```

#### Aba 5: "Análise por Fila"
```
A: Nome da Fila
B: Total de Chamadas
C: Chamadas Atendidas
D: Tempo Médio de Espera
E: Taxa de Abandono
F: Observações
```

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
