/**
 * Configuração da Aplicação - VeloIGP
 * Centraliza todas as configurações do sistema
 */

export interface AppConfig {
  // Configurações de API
  api: {
    googleSheets: {
      apiKey: string;
      spreadsheetId: string;
      timeout: number;
      retryAttempts: number;
    };
  };
  
  // Configurações de Performance
  performance: {
    enableLogs: boolean;
    enableDebugMode: boolean;
    cacheTimeout: number;
    maxRetries: number;
  };
  
  // Configurações de UI
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    animations: boolean;
    compactMode: boolean;
  };
  
  // Configurações de Dados
  data: {
    maxRows: number;
    refreshInterval: number;
    enableCaching: boolean;
    cacheSize: number;
  };
}

// Configuração padrão
export const defaultConfig: AppConfig = {
  api: {
    googleSheets: {
      apiKey: process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || 'AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A',
      spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID || '1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM',
      timeout: 15000,
      retryAttempts: 3
    }
  },
  
  performance: {
    enableLogs: process.env.NODE_ENV === 'development',
    enableDebugMode: process.env.NODE_ENV === 'development',
    cacheTimeout: 300000, // 5 minutos
    maxRetries: 3
  },
  
  ui: {
    theme: 'light',
    language: 'pt-BR',
    animations: true,
    compactMode: false
  },
  
  data: {
    maxRows: 100000,
    refreshInterval: 60000, // 1 minuto
    enableCaching: true,
    cacheSize: 50 // MB
  }
};

// Singleton para configuração
class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = { ...defaultConfig };
    this.loadFromStorage();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('veloigp-config');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.warn('Erro ao carregar configuração do localStorage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('veloigp-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Erro ao salvar configuração no localStorage:', error);
    }
  }
}

export const configManager = ConfigManager.getInstance();
export const appConfig = configManager.getConfig();
