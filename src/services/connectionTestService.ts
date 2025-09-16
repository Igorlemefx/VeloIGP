// Serviço de Teste de Conexão
// Verifica conectividade com Google Sheets e API 55PBX

import { googleSheetsService } from './googleSheetsService';
import { api55pbxDataService } from './api55pbxData';
import { api55pbxAuthService } from './api55pbxAuth';

interface ConnectionTestResult {
  service: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: Date;
}

interface OverallConnectionStatus {
  allConnected: boolean;
  tests: ConnectionTestResult[];
  summary: {
    total: number;
    success: number;
    errors: number;
    warnings: number;
  };
}

class ConnectionTestService {
  private static instance: ConnectionTestService;

  private constructor() {}

  static getInstance(): ConnectionTestService {
    if (!ConnectionTestService.instance) {
      ConnectionTestService.instance = new ConnectionTestService();
    }
    return ConnectionTestService.instance;
  }

  /**
   * Executar todos os testes de conexão
   */
  async runAllTests(): Promise<OverallConnectionStatus> {
    console.log('🔍 Iniciando testes de conexão...');
    
    const tests: ConnectionTestResult[] = [];
    
    // Teste 1: Google Sheets
    const googleSheetsTest = await this.testGoogleSheetsConnection();
    tests.push(googleSheetsTest);
    
    // Teste 2: API 55PBX (se autenticado)
    const api55pbxTest = await this.testApi55pbxConnection();
    tests.push(api55pbxTest);
    
    // Teste 3: Autenticação 55PBX
    const authTest = await this.testApi55pbxAuth();
    tests.push(authTest);
    
    // Calcular resumo
    const summary = this.calculateSummary(tests);
    const allConnected = summary.errors === 0;
    
    const result: OverallConnectionStatus = {
      allConnected,
      tests,
      summary
    };
    
    console.log('✅ Testes de conexão concluídos:', result);
    return result;
  }

  /**
   * Testar conexão com Google Sheets
   */
  private async testGoogleSheetsConnection(): Promise<ConnectionTestResult> {
    try {
      console.log('🔍 Testando conexão com Google Sheets...');
      
      // Verificar se as credenciais estão configuradas
      const hasCredentials = this.checkGoogleSheetsCredentials();
      if (!hasCredentials) {
        return {
          service: 'Google Sheets',
          status: 'error',
          message: 'Credenciais não configuradas',
          details: {
            missing: ['REACT_APP_GOOGLE_SHEETS_API_KEY', 'REACT_APP_GOOGLE_SHEETS_CLIENT_ID']
          },
          timestamp: new Date()
        };
      }

      // Tentar listar planilhas
      const spreadsheets = await googleSheetsService.listSpreadsheets();
      
      if (!spreadsheets || spreadsheets.length === 0) {
        return {
          service: 'Google Sheets',
          status: 'warning',
          message: 'Conexão OK, mas nenhuma planilha encontrada',
          details: {
            spreadsheetsCount: 0
          },
          timestamp: new Date()
        };
      }

      // Testar acesso a uma planilha específica
      const firstSpreadsheet = spreadsheets[0];
      const sheets = await googleSheetsService.getSpreadsheetData(firstSpreadsheet.id);
      
      return {
        service: 'Google Sheets',
        status: 'success',
        message: `Conexão OK - ${spreadsheets.length} planilha(s) encontrada(s)`,
        details: {
          spreadsheetsCount: spreadsheets.length,
          firstSpreadsheet: {
            id: firstSpreadsheet.id,
            title: firstSpreadsheet.title,
            hasData: !!sheets
          }
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Erro no teste Google Sheets:', error);
      return {
        service: 'Google Sheets',
        status: 'error',
        message: `Erro na conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: { error: error instanceof Error ? error.message : 'Erro desconhecido' },
        timestamp: new Date()
      };
    }
  }

  /**
   * Testar conexão com API 55PBX
   */
  private async testApi55pbxConnection(): Promise<ConnectionTestResult> {
    try {
      console.log('🔍 Testando conexão com API 55PBX...');
      
      // Verificar se as credenciais estão configuradas
      const hasCredentials = this.checkApi55pbxCredentials();
      if (!hasCredentials) {
        return {
          service: 'API 55PBX',
          status: 'error',
          message: 'Credenciais não configuradas',
          details: {
            missing: ['REACT_APP_55PBX_CLIENT_ID', 'REACT_APP_55PBX_CLIENT_SECRET']
          },
          timestamp: new Date()
        };
      }

      // Verificar se está autenticado
      const isAuthenticated = api55pbxAuthService.isAuthenticated();
      if (!isAuthenticated) {
        return {
          service: 'API 55PBX',
          status: 'warning',
          message: 'Credenciais OK, mas não autenticado',
          details: {
            needsAuth: true
          },
          timestamp: new Date()
        };
      }

      // Testar conectividade
      const isConnected = await api55pbxDataService.checkConnectivity();
      if (!isConnected) {
        return {
          service: 'API 55PBX',
          status: 'error',
          message: 'Falha na conectividade com a API',
          timestamp: new Date()
        };
      }

      return {
        service: 'API 55PBX',
        status: 'success',
        message: 'Conexão OK e autenticado',
        details: {
          authenticated: true,
          connected: true
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Erro no teste API 55PBX:', error);
      return {
        service: 'API 55PBX',
        status: 'error',
        message: `Erro na conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: { error: error instanceof Error ? error.message : 'Erro desconhecido' },
        timestamp: new Date()
      };
    }
  }

  /**
   * Testar autenticação 55PBX
   */
  private async testApi55pbxAuth(): Promise<ConnectionTestResult> {
    try {
      console.log('🔍 Testando autenticação 55PBX...');
      
      const authState = api55pbxAuthService.getAuthState();
      
      if (!authState.isAuthenticated) {
        return {
          service: 'Autenticação 55PBX',
          status: 'warning',
          message: 'Não autenticado - necessário fazer login',
          details: {
            isAuthenticated: false,
            needsLogin: true
          },
          timestamp: new Date()
        };
      }

      const isTokenValid = api55pbxAuthService.isTokenValid();
      if (!isTokenValid) {
        return {
          service: 'Autenticação 55PBX',
          status: 'warning',
          message: 'Token expirado - necessário renovar',
          details: {
            isAuthenticated: true,
            tokenValid: false,
            needsRefresh: true
          },
          timestamp: new Date()
        };
      }

      return {
        service: 'Autenticação 55PBX',
        status: 'success',
        message: 'Autenticação OK e token válido',
        details: {
          isAuthenticated: true,
          tokenValid: true,
          expiresAt: authState.expiresAt
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Erro no teste de autenticação:', error);
      return {
        service: 'Autenticação 55PBX',
        status: 'error',
        message: `Erro na autenticação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: { error: error instanceof Error ? error.message : 'Erro desconhecido' },
        timestamp: new Date()
      };
    }
  }

  /**
   * Verificar credenciais do Google Sheets
   */
  private checkGoogleSheetsCredentials(): boolean {
    const apiKey = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
    const clientId = process.env.REACT_APP_GOOGLE_SHEETS_CLIENT_ID;
    return !!(apiKey && clientId);
  }

  /**
   * Verificar credenciais da API 55PBX
   */
  private checkApi55pbxCredentials(): boolean {
    const clientId = process.env.REACT_APP_55PBX_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_55PBX_CLIENT_SECRET;
    return !!(clientId && clientSecret);
  }

  /**
   * Calcular resumo dos testes
   */
  private calculateSummary(tests: ConnectionTestResult[]): {
    total: number;
    success: number;
    errors: number;
    warnings: number;
  } {
    const total = tests.length;
    const success = tests.filter(t => t.status === 'success').length;
    const errors = tests.filter(t => t.status === 'error').length;
    const warnings = tests.filter(t => t.status === 'warning').length;

    return { total, success, errors, warnings };
  }

  /**
   * Obter status resumido
   */
  getStatusSummary(): string {
    // Esta função pode ser chamada para obter um resumo rápido
    return 'Execute runAllTests() para obter status detalhado';
  }
}

export const connectionTestService = ConnectionTestService.getInstance();
export default connectionTestService;
