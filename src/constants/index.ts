// Constantes do sistema VeloIGP

export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.55pbx.com',
  REAL_TIME: '/realtime',
  ANALYTICS: '/analytics',
  REPORTS: '/reports',
  SPREADSHEETS: '/spreadsheets'
} as const;

export const THEME_CONFIG = {
  STORAGE_KEY: 'veloigp-theme',
  DEFAULT_THEME: 'light' as const,
  THEMES: ['light', 'dark'] as const
} as const;

export const PERIOD_OPTIONS = [
  { value: '1d', label: 'Últimas 24 horas' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' }
] as const;

export const METRIC_OPTIONS = [
  { value: 'calls', label: 'Chamadas' },
  { value: 'satisfaction', label: 'Satisfação' },
  { value: 'waitTime', label: 'Tempo de Espera' },
  { value: 'answerRate', label: 'Taxa de Atendimento' }
] as const;

export const QUEUE_TYPES = [
  'Principal',
  'VIP', 
  'Técnica',
  'Vendas',
  'Suporte',
  'Financeiro'
] as const;

export const LOADING_MESSAGES = [
  'Conectando com API 55PBX...',
  'Carregando dados em tempo real...',
  'Processando análises...',
  'Sincronizando informações...',
  'Atualizando métricas...'
] as const;

export const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Falha na conexão com a API',
  DATA_LOAD_ERROR: 'Erro ao carregar dados',
  INVALID_SPREADSHEET: 'Planilha inválida ou inacessível',
  NETWORK_ERROR: 'Erro de rede. Verifique sua conexão.',
  UNAUTHORIZED: 'Acesso não autorizado. Faça login novamente.'
} as const;

export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Dados carregados com sucesso',
  SPREADSHEET_CONNECTED: 'Planilha conectada com sucesso',
  REPORT_GENERATED: 'Relatório gerado com sucesso',
  SETTINGS_SAVED: 'Configurações salvas com sucesso'
} as const;



