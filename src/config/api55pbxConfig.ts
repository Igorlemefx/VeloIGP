// Configuração da API 55PBX
// Integração com dados reais do sistema

export interface Api55pbxConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export const api55pbxConfig: Api55pbxConfig = {
  baseUrl: process.env.REACT_APP_55PBX_BASE_URL || 'https://api.55pbx.com/v1',
  clientId: process.env.REACT_APP_55PBX_CLIENT_ID || '',
  clientSecret: process.env.REACT_APP_55PBX_CLIENT_SECRET || '',
  redirectUri: process.env.REACT_APP_55PBX_REDIRECT_URI || window.location.origin + '/auth/callback',
  scopes: [
    'read:reports',
    'read:realtime',
    'read:agents',
    'read:queues',
    'read:calls'
  ],
  timeout: 30000, // 30 segundos
  retryAttempts: 3,
  retryDelay: 1000 // 1 segundo
};

// Endpoints da API
export const api55pbxEndpoints = {
  // Autenticação
  auth: {
    token: '/oauth/token',
    authorize: '/oauth/authorize',
    refresh: '/oauth/refresh'
  },
  
  // Dados em tempo real
  realtime: {
    agents: '/realtime/agents',
    queues: '/realtime/queues',
    calls: '/realtime/calls',
    stats: '/realtime/stats'
  },
  
  // Relatórios
  reports: {
    calls: '/reports/calls',
    agents: '/reports/agents',
    queues: '/reports/queues',
    performance: '/reports/performance'
  },
  
  // Configurações
  config: {
    queues: '/config/queues',
    agents: '/config/agents',
    settings: '/config/settings'
  }
};

// Headers padrão
export const getDefaultHeaders = (accessToken?: string) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'VeloIGP-Dashboard/1.0',
  ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
});

export default api55pbxConfig;



