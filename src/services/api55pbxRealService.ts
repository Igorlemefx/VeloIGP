// Serviço Real da API 55PBX - VeloIGP

interface Api55PBXConfig {
  baseUrl: string;
  apiKey: string;
  username: string;
  password: string;
  timeout: number;
}

interface OperatorData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  queue: string;
  callsHandled: number;
  efficiency: number;
  lastActivity: string;
  avatar?: string;
}

interface CallData {
  id: string;
  operatorId: string;
  operatorName: string;
  duration: number;
  startTime: string;
  endTime: string;
  status: 'completed' | 'missed' | 'abandoned';
  queue: string;
  customerNumber: string;
  satisfaction?: number;
}

interface QueueData {
  id: string;
  name: string;
  activeOperators: number;
  waitingCalls: number;
  averageWaitTime: number;
  totalCalls: number;
}

interface MetricsData {
  totalCalls: number;
  activeOperators: number;
  averageWaitTime: number;
  efficiency: number;
  satisfaction: number;
  missedCalls: number;
  abandonedCalls: number;
}

class Api55PBXRealService {
  private config: Api55PBXConfig;
  private isConnected: boolean = false;
  private lastSync: Date | null = null;

  constructor() {
    this.config = {
      baseUrl: process.env.REACT_APP_55PBX_BASE_URL || 'https://api.55pbx.com.br',
      apiKey: process.env.REACT_APP_55PBX_API_KEY || '',
      username: process.env.REACT_APP_55PBX_USERNAME || '',
      password: process.env.REACT_APP_55PBX_PASSWORD || '',
      timeout: 10000
    };
  }

  // Autenticar com a API 55PBX
  public async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (response.ok) {
        const data = await response.json();
        // Armazenar token de autenticação
        localStorage.setItem('55pbx_token', data.token);
        this.isConnected = true;
        this.lastSync = new Date();
        console.log('✅ Autenticação 55PBX bem-sucedida');
        return true;
      } else {
        throw new Error(`Erro de autenticação: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro na autenticação 55PBX:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Verificar status da conexão
  public async checkConnection(): Promise<boolean> {
    try {
      const token = localStorage.getItem('55pbx_token');
      if (!token) {
        return await this.authenticate();
      }

      const response = await fetch(`${this.config.baseUrl}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': this.config.apiKey
        },
        signal: AbortSignal.timeout(5000)
      });

      this.isConnected = response.ok;
      if (this.isConnected) {
        this.lastSync = new Date();
      }
      return this.isConnected;
    } catch (error) {
      console.error('❌ Erro ao verificar conexão 55PBX:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Obter dados dos operadores
  public async getOperators(): Promise<OperatorData[]> {
    try {
      const token = localStorage.getItem('55pbx_token');
      if (!token) {
        await this.authenticate();
      }

      const response = await fetch(`${this.config.baseUrl}/operators`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': this.config.apiKey
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (response.ok) {
        const data = await response.json();
        return this.transformOperatorsData(data);
      } else {
        throw new Error(`Erro ao buscar operadores: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar operadores:', error);
      // Retornar dados simulados em caso de erro
      return this.getSimulatedOperators();
    }
  }

  // Obter dados das chamadas
  public async getCalls(startDate?: string, endDate?: string): Promise<CallData[]> {
    try {
      const token = localStorage.getItem('55pbx_token');
      if (!token) {
        await this.authenticate();
      }

      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`${this.config.baseUrl}/calls?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': this.config.apiKey
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (response.ok) {
        const data = await response.json();
        return this.transformCallsData(data);
      } else {
        throw new Error(`Erro ao buscar chamadas: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar chamadas:', error);
      return this.getSimulatedCalls();
    }
  }

  // Obter dados das filas
  public async getQueues(): Promise<QueueData[]> {
    try {
      const token = localStorage.getItem('55pbx_token');
      if (!token) {
        await this.authenticate();
      }

      const response = await fetch(`${this.config.baseUrl}/queues`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': this.config.apiKey
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (response.ok) {
        const data = await response.json();
        return this.transformQueuesData(data);
      } else {
        throw new Error(`Erro ao buscar filas: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar filas:', error);
      return this.getSimulatedQueues();
    }
  }

  // Obter métricas gerais
  public async getMetrics(): Promise<MetricsData> {
    try {
      const token = localStorage.getItem('55pbx_token');
      if (!token) {
        await this.authenticate();
      }

      const response = await fetch(`${this.config.baseUrl}/metrics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': this.config.apiKey
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (response.ok) {
        const data = await response.json();
        return this.transformMetricsData(data);
      } else {
        throw new Error(`Erro ao buscar métricas: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar métricas:', error);
      return this.getSimulatedMetrics();
    }
  }

  // Transformar dados dos operadores
  private transformOperatorsData(data: any[]): OperatorData[] {
    return data.map(op => ({
      id: op.id || op.operator_id,
      name: op.name || op.operator_name,
      status: this.mapStatus(op.status),
      queue: op.queue || op.queue_name,
      callsHandled: op.calls_handled || op.total_calls || 0,
      efficiency: op.efficiency || op.performance || 0,
      lastActivity: op.last_activity || op.last_seen || new Date().toISOString(),
      avatar: op.avatar || op.photo
    }));
  }

  // Transformar dados das chamadas
  private transformCallsData(data: any[]): CallData[] {
    return data.map(call => ({
      id: call.id || call.call_id,
      operatorId: call.operator_id,
      operatorName: call.operator_name,
      duration: call.duration || 0,
      startTime: call.start_time || call.created_at,
      endTime: call.end_time || call.finished_at,
      status: this.mapCallStatus(call.status),
      queue: call.queue || call.queue_name,
      customerNumber: call.customer_number || call.phone,
      satisfaction: call.satisfaction || call.rating
    }));
  }

  // Transformar dados das filas
  private transformQueuesData(data: any[]): QueueData[] {
    return data.map(queue => ({
      id: queue.id || queue.queue_id,
      name: queue.name || queue.queue_name,
      activeOperators: queue.active_operators || queue.operators_count || 0,
      waitingCalls: queue.waiting_calls || queue.pending_calls || 0,
      averageWaitTime: queue.average_wait_time || queue.avg_wait || 0,
      totalCalls: queue.total_calls || queue.calls_count || 0
    }));
  }

  // Transformar dados das métricas
  private transformMetricsData(data: any): MetricsData {
    return {
      totalCalls: data.total_calls || 0,
      activeOperators: data.active_operators || 0,
      averageWaitTime: data.average_wait_time || 0,
      efficiency: data.efficiency || data.performance || 0,
      satisfaction: data.satisfaction || data.rating || 0,
      missedCalls: data.missed_calls || 0,
      abandonedCalls: data.abandoned_calls || 0
    };
  }

  // Mapear status do operador
  private mapStatus(status: string): 'online' | 'offline' | 'busy' | 'away' {
    const statusMap: { [key: string]: 'online' | 'offline' | 'busy' | 'away' } = {
      'online': 'online',
      'offline': 'offline',
      'busy': 'busy',
      'away': 'away',
      'disponivel': 'online',
      'indisponivel': 'offline',
      'ocupado': 'busy',
      'ausente': 'away'
    };
    return statusMap[status?.toLowerCase()] || 'offline';
  }

  // Mapear status da chamada
  private mapCallStatus(status: string): 'completed' | 'missed' | 'abandoned' {
    const statusMap: { [key: string]: 'completed' | 'missed' | 'abandoned' } = {
      'completed': 'completed',
      'missed': 'missed',
      'abandoned': 'abandoned',
      'concluida': 'completed',
      'perdida': 'missed',
      'abandonada': 'abandoned'
    };
    return statusMap[status?.toLowerCase()] || 'completed';
  }

  // Dados simulados para fallback
  private getSimulatedOperators(): OperatorData[] {
    return [
      {
        id: 'op1',
        name: 'Ana Silva',
        status: 'online',
        queue: 'Vendas',
        callsHandled: 45,
        efficiency: 92,
        lastActivity: new Date().toISOString(),
        avatar: '👩‍💼'
      },
      {
        id: 'op2',
        name: 'Carlos Santos',
        status: 'busy',
        queue: 'Suporte',
        callsHandled: 38,
        efficiency: 88,
        lastActivity: new Date().toISOString(),
        avatar: '👨‍💼'
      }
    ];
  }

  private getSimulatedCalls(): CallData[] {
    return [
      {
        id: 'call1',
        operatorId: 'op1',
        operatorName: 'Ana Silva',
        duration: 180,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() - 3420000).toISOString(),
        status: 'completed',
        queue: 'Vendas',
        customerNumber: '+5511999999999',
        satisfaction: 5
      }
    ];
  }

  private getSimulatedQueues(): QueueData[] {
    return [
      {
        id: 'queue1',
        name: 'Vendas',
        activeOperators: 5,
        waitingCalls: 2,
        averageWaitTime: 120,
        totalCalls: 150
      }
    ];
  }

  private getSimulatedMetrics(): MetricsData {
    return {
      totalCalls: 1250,
      activeOperators: 12,
      averageWaitTime: 95,
      efficiency: 87,
      satisfaction: 4.2,
      missedCalls: 15,
      abandonedCalls: 8
    };
  }

  // Obter status da conexão
  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      lastSync: this.lastSync,
      config: {
        baseUrl: this.config.baseUrl,
        hasApiKey: !!this.config.apiKey,
        hasCredentials: !!(this.config.username && this.config.password)
      }
    };
  }
}

// Instância singleton
const api55pbxRealService = new Api55PBXRealService();

export default api55pbxRealService;


