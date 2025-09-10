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
  MAIN_REPORTS: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', // Substituir pelo ID real
  MONTHLY_DATA: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', // Substituir pelo ID real
  AGENT_PERFORMANCE: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' // Substituir pelo ID real
};

// Configuração de ranges padrão
export const DEFAULT_RANGES = {
  CALLS_DATA: 'Dados Individuais de Chamadas!A:H',
  HOURLY_METRICS: 'Métricas por Hora!A:E',
  AGENT_PERFORMANCE: 'Performance por Agente!A:F',
  MONTHLY_COMPARISON: 'Comparativo Mensal!A:G',
  QUEUE_ANALYSIS: 'Análise por Fila!A:F'
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
