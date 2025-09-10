# 🔗 Configurar Planilha Real do Google Drive

## 🎯 Objetivo
Conectar o sistema VeloIGP **EXCLUSIVAMENTE** com a planilha real salva no Google Drive. O sistema não possui fallback para dados simulados.

## 📋 Pré-requisitos
1. **Planilha no Google Drive** com dados do 55PBX
2. **API Key do Google Sheets** (gratuita)
3. **Planilha pública** ou com permissão de visualização

## 🔧 Passo a Passo

### 1. Obter API Key do Google Sheets

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto ou crie um novo
3. Vá para **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **API Key**
5. Copie a API Key gerada

### 2. Habilitar Google Sheets API

1. No Google Cloud Console, vá para **APIs & Services** > **Library**
2. Procure por **Google Sheets API**
3. Clique em **Enable**

### 3. Configurar Permissões da Planilha

1. Abra sua planilha no Google Sheets
2. Clique em **Share** (Compartilhar)
3. Defina como **"Anyone with the link can view"** (Qualquer pessoa com o link pode visualizar)
4. Copie o ID da planilha da URL

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Google Sheets API Key (obrigatória)
REACT_APP_GOOGLE_API_KEY=sua-api-key-aqui

# ID da sua planilha real
REACT_APP_SPREADSHEET_ID=seu-id-da-planilha-aqui
```

### 5. Atualizar ID da Planilha

No arquivo `src/config/googleSheetsConfig.ts`, atualize:

```typescript
export const SPREADSHEET_IDS = {
  MAIN_REPORTS: 'SEU_ID_DA_PLANILHA_AQUI', // Substitua pelo ID real
  MONTHLY_DATA: 'SEU_ID_DA_PLANILHA_AQUI',
  AGENT_PERFORMANCE: 'SEU_ID_DA_PLANILHA_AQUI'
};
```

## 🔍 Como Encontrar o ID da Planilha

O ID da planilha está na URL do Google Sheets:

```
https://docs.google.com/spreadsheets/d/ID_DA_PLANILHA_AQUI/edit
```

Exemplo:
- URL: `https://docs.google.com/spreadsheets/d/13bZBY4PDqUc8TtHE9ztBLo1XIsZ7yjJw/edit`
- ID: `13bZBY4PDqUc8TtHE9ztBLo1XIsZ7yjJw`

## 📊 Estrutura da Planilha

A planilha deve ter a seguinte estrutura na **primeira linha**:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z | AA | AB | AC | AD | AE | AF | AG | AH | AI | AJ | AK | AL | AM | AN |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Chamada | Audio E Transcrições | Operador | Data | Hora | Data Atendimento | Hora Atendimento | País | DDD | Numero | Fila | Tempo Na Ura | Tempo De Espera | Tempo Falado | Tempo Total | Desconexão | Telefone Entrada | Caminho U R A | Cpf/Cnpj | Pedido | Id Ligação | Id Ligação De Origem | I D Do Ticket | Fluxo De Filas | Wh_quality_reason | Wh_humor_reason | Questionário De Qualidade | Pergunta2 1 PERGUNTA ATENDENTE | Pergunta2 2 PERGUNTA SOLUCAO | Dia | qtde | Até 20 Seg | Faixa | Mês | TMA (FALADO | Tempo URA (seg | TME (seg) | TMA (seg) | Pergunta 1 | Pergunta 2 |

## 🧪 Testar Conexão

1. Reinicie o servidor: `npm start`
2. Acesse a página de **Planilhas**
3. Verifique no console do navegador:
   - ✅ **Sucesso**: "Conectando com planilha real do Google Drive..."
   - ❌ **Erro**: "Erro ao obter planilha real" - **Sistema não funcionará sem a planilha real!**

## 🚨 Troubleshooting

### Erro: "API key not valid"
- Verifique se a API key está correta
- Confirme se a Google Sheets API está habilitada

### Erro: "The caller does not have permission"
- Verifique se a planilha está pública
- Confirme se o ID da planilha está correto

### Erro: "Requested entity was not found"
- Verifique se o ID da planilha está correto
- Confirme se a planilha existe

### Dados não aparecem
- Verifique se a planilha tem dados na primeira aba
- Confirme se a estrutura está correta (40 colunas)

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Confirme se todas as etapas foram seguidas
3. Teste com uma planilha simples primeiro
4. Verifique as permissões no Google Drive

## 🎯 Resultado Esperado

Após configurar corretamente:
- ✅ **Dados reais** da planilha aparecerão no sistema
- ✅ **Filtros funcionarão** com dados reais
- ✅ **Análises** serão baseadas em dados reais
- ✅ **Atualizações** refletirão mudanças na planilha
