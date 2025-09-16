// Serviço de Dados Reais API 55PBX
// Integração com dados reais do sistema

import { api55pbxConfig, api55pbxEndpoints, getDefaultHeaders } from '../config/api55pbxConfig';
import { api55pbxAuthService } from './api55pbxAuth';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: number;
}

interface RealtimeData {
  agents: AgentStatus[];
  queues: QueueStatus[];
  calls: CallStatus[];
  stats: SystemStats;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  queue: string;
  callsAnswered: number;
  totalTalkTime: number;
  lastActivity: string;
}

interface QueueStatus {
  id: string;
  name: string;
  waitingCalls: number;
  averageWaitTime: number;
  serviceLevel: number;
  agentsOnline: number;
  agentsAvailable: number;
}

interface CallStatus {
  id: string;
  callerId: string;
  queue: string;
  agent: string;
  status: 'ringing' | 'answered' | 'ended' | 'abandoned';
  startTime: string;
  duration: number;
  waitTime: number;
}

interface SystemStats {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageWaitTime: number;
  averageTalkTime: number;
  serviceLevel: number;
  abandonmentRate: number;
}

interface ReportData {
  calls: any[];
  agents: any[];
  queues: any[];
  performance: any[];
  period: {
    start: string;
    end: string;
  };
}

class Api55pbxDataService {
  private static instance: Api55pbxDataService;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  private constructor() {}

  static getInstance(): Api55pbxDataService {
    if (!Api55pbxDataService.instance) {
      Api55pbxDataService.instance = new Api55pbxDataService();
    }
    return Api55pbxDataService.instance;
  }

  /**
   * Fazer requisição autenticada para a API
   */
  private async makeAuthenticatedRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await api55pbxAuthService.getValidToken();
      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch(`${api55pbxConfig.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...getDefaultHeaders(token),
          ...options.headers
        },
        signal: AbortSignal.timeout(api55pbxConfig.timeout)
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, tentar renovar
          const refreshed = await api55pbxAuthService.refreshAccessToken();
          if (refreshed) {
            // Tentar novamente com novo token
            const newToken = await api55pbxAuthService.getValidToken();
            if (newToken) {
              const retryResponse = await fetch(`${api55pbxConfig.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                  ...getDefaultHeaders(newToken),
                  ...options.headers
                },
                signal: AbortSignal.timeout(api55pbxConfig.timeout)
              });

              if (!retryResponse.ok) {
                throw new Error(`Erro na API: ${retryResponse.status} ${retryResponse.statusText}`);
              }

              const retryData = await retryResponse.json();
              return {
                success: true,
                data: retryData,
                timestamp: Date.now()
              };
            }
          }
          throw new Error('Falha na autenticação');
        }
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ Erro na requisição API 55PBX:', error);
      return {
        success: false,
        data: null as T,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Obter dados em tempo real
   */
  async getRealtimeData(): Promise<ApiResponse<RealtimeData>> {
    const cacheKey = 'realtime_data';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: Date.now()
      };
    }

    const response = await this.makeAuthenticatedRequest<RealtimeData>('/realtime/all');
    
    if (response.success) {
      this.setCachedData(cacheKey, response.data, 30000); // 30 segundos
    }

    return response;
  }

  /**
   * Obter dados de relatórios
   */
  async getReportData(startDate: string, endDate: string): Promise<ApiResponse<ReportData>> {
    const cacheKey = `reports_${startDate}_${endDate}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: Date.now()
      };
    }

    const response = await this.makeAuthenticatedRequest<ReportData>(
      `/reports/period?start=${startDate}&end=${endDate}`
    );
    
    if (response.success) {
      this.setCachedData(cacheKey, response.data, 300000); // 5 minutos
    }

    return response;
  }

  /**
   * Obter dados de agentes
   */
  async getAgentsData(): Promise<ApiResponse<AgentStatus[]>> {
    const cacheKey = 'agents_data';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: Date.now()
      };
    }

    const response = await this.makeAuthenticatedRequest<AgentStatus[]>(
      api55pbxEndpoints.realtime.agents
    );
    
    if (response.success) {
      this.setCachedData(cacheKey, response.data, 60000); // 1 minuto
    }

    return response;
  }

  /**
   * Obter dados de filas
   */
  async getQueuesData(): Promise<ApiResponse<QueueStatus[]>> {
    const cacheKey = 'queues_data';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: Date.now()
      };
    }

    const response = await this.makeAuthenticatedRequest<QueueStatus[]>(
      api55pbxEndpoints.realtime.queues
    );
    
    if (response.success) {
      this.setCachedData(cacheKey, response.data, 60000); // 1 minuto
    }

    return response;
  }

  /**
   * Obter estatísticas do sistema
   */
  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    const cacheKey = 'system_stats';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: Date.now()
      };
    }

    const response = await this.makeAuthenticatedRequest<SystemStats>(
      api55pbxEndpoints.realtime.stats
    );
    
    if (response.success) {
      this.setCachedData(cacheKey, response.data, 30000); // 30 segundos
    }

    return response;
  }

  /**
   * Verificar conectividade com a API
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest('/health');
      return response.success;
    } catch (error) {
      console.error('❌ Erro na verificação de conectividade:', error);
      return false;
    }
  }

  /**
   * Obter dados do cache
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Salvar dados no cache
   */
  private setCachedData(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache da API 55PBX limpo');
  }

  /**
   * Obter estatísticas do cache
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const api55pbxDataService = Api55pbxDataService.getInstance();
export default api55pbxDataService;



