// Configuração do Google Sheets API para VeloIGP
// Configurações de autenticação e credenciais

export interface GoogleSheetsCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

export interface GoogleSheetsConfig {
  credentials: GoogleSheetsCredentials;
  spreadsheetId: string;
  scopes: string[];
}

// Configuração padrão para desenvolvimento
export const defaultGoogleSheetsConfig: Partial<GoogleSheetsConfig> = {
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
  ]
};

// IDs das planilhas 55PBX (configurar com os IDs reais)
export const SPREADSHEET_IDS = {
  MAIN_REPORTS: '1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM', // ID real da planilha principal
  MONTHLY_DATA: '1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM', // Usando mesmo ID por enquanto
  AGENT_PERFORMANCE: '1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM' // Usando mesmo ID por enquanto
};

// Configuração de ranges padrão baseada na estrutura real da planilha
export const DEFAULT_RANGES = {
  CALLS_DATA: 'A:AM', // Todas as colunas da planilha principal
  HOURLY_METRICS: 'A:AM', // Usar mesma planilha com filtros por hora
  AGENT_PERFORMANCE: 'A:AM', // Usar mesma planilha com filtros por operador
  MONTHLY_COMPARISON: 'A:AM', // Usar mesma planilha com filtros por mês
  QUEUE_ANALYSIS: 'A:AM' // Usar mesma planilha com filtros por fila
};

// Mapeamento das colunas da planilha real
export const COLUMN_MAPPING = {
  // Colunas principais
  CHAMADA: 'A', // Chamada
  AUDIO_TRANSCRICOES: 'B', // Audio E Transcrições
  OPERADOR: 'C', // Operador
  DATA: 'D', // Data
  HORA: 'E', // Hora
  DATA_ATENDIMENTO: 'F', // Data Atendimento
  HORA_ATENDIMENTO: 'G', // Hora Atendimento
  PAIS: 'H', // País
  DDD: 'I', // DDD
  NUMERO: 'J', // Numero
  FILA: 'K', // Fila
  TEMPO_URA: 'L', // Tempo Na Ura
  TEMPO_ESPERA: 'M', // Tempo De Espera
  TEMPO_FALADO: 'N', // Tempo Falado
  TEMPO_TOTAL: 'O', // Tempo Total
  DESCONEXAO: 'P', // Desconexão
  TELEFONE_ENTRADA: 'Q', // Telefone Entrada
  CAMINHO_URA: 'R', // Caminho U R A
  CPF_CNPJ: 'S', // Cpf/Cnpj
  PEDIDO: 'T', // Pedido
  ID_LIGACAO: 'U', // Id Ligação
  ID_LIGACAO_ORIGEM: 'V', // Id Ligação De Origem
  ID_TICKET: 'W', // I D Do Ticket
  FLUXO_FILAS: 'X', // Fluxo De Filas
  WH_QUALITY_REASON: 'Y', // Wh_quality_reason
  WH_HUMOR_REASON: 'Z', // Wh_humor_reason
  QUESTIONARIO_QUALIDADE: 'AA', // Questionário De Qualidade
  PERGUNTA_ATENDENTE: 'AB', // Pergunta2 1 PERGUNTA ATENDENTE
  PERGUNTA_SOLUCAO: 'AC', // Pergunta2 2 PERGUNTA SOLUCAO
  DIA: 'AD', // Dia
  QTDE: 'AE', // qtde
  ATE_20_SEG: 'AF', // Até 20 Seg
  FAIXA: 'AG', // Faixa
  MES: 'AH', // Mês
  TMA_FALADO: 'AI', // TMA (FALADO
  TEMPO_URA_SEG: 'AJ', // Tempo URA (seg
  TME_SEG: 'AK', // TME (seg)
  TMA_SEG: 'AL', // TMA (seg)
  PERGUNTA_1: 'AM', // Pergunta 1
  PERGUNTA_2: 'AN' // Pergunta 2
};

// Validação de configuração
export function validateGoogleSheetsConfig(config: GoogleSheetsConfig): boolean {
  if (!config.credentials) {
    console.error('Credenciais do Google Sheets não fornecidas');
    return false;
  }

  if (!config.credentials.client_email) {
    console.error('client_email é obrigatório');
    return false;
  }

  if (!config.credentials.private_key) {
    console.error('private_key é obrigatória');
    return false;
  }

  if (!config.spreadsheetId) {
    console.error('spreadsheetId é obrigatório');
    return false;
  }

  return true;
}

// Função para carregar credenciais do ambiente
export function loadCredentialsFromEnv(): GoogleSheetsCredentials | null {
  try {
    const credentials = {
      type: process.env.REACT_APP_GOOGLE_SHEETS_TYPE || 'service_account',
      project_id: process.env.REACT_APP_GOOGLE_SHEETS_PROJECT_ID || '',
      private_key_id: process.env.REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY_ID || '',
      private_key: (process.env.REACT_APP_GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      client_email: process.env.REACT_APP_GOOGLE_SHEETS_CLIENT_EMAIL || '',
      client_id: process.env.REACT_APP_GOOGLE_SHEETS_CLIENT_ID || '',
      auth_uri: process.env.REACT_APP_GOOGLE_SHEETS_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.REACT_APP_GOOGLE_SHEETS_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.REACT_APP_GOOGLE_SHEETS_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.REACT_APP_GOOGLE_SHEETS_CLIENT_X509_CERT_URL || ''
    };

    // Verificar se todas as credenciais necessárias estão presentes
    if (!credentials.client_email || !credentials.private_key) {
      console.warn('Credenciais do Google Sheets não configuradas no ambiente');
      return null;
    }

    return credentials;
  } catch (error) {
    console.error('Erro ao carregar credenciais do ambiente:', error);
    return null;
  }
}
