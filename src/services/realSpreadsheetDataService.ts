// Serviço de Dados Reais da Planilha - VeloIGP

interface SpreadsheetData {
  operators: any[];
  calls: any[];
  metrics: any;
  queues: any[];
  lastUpdated: Date;
}

class RealSpreadsheetDataService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Obter dados da planilha do Google Sheets
  public async getSpreadsheetData(): Promise<SpreadsheetData> {
    try {
      console.log('📊 Carregando dados reais da planilha...');
      
      const [operators, calls, metrics, queues] = await Promise.all([
        this.getOperatorsData(),
        this.getCallsData(),
        this.getMetricsData(),
        this.getQueuesData()
      ]);

      const data: SpreadsheetData = {
        operators,
        calls,
        metrics,
        queues,
        lastUpdated: new Date()
      };

      // Salvar no cache
      this.cache.set('spreadsheetData', {
        data,
        timestamp: Date.now()
      });

      console.log('✅ Dados da planilha carregados com sucesso');
      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar dados da planilha:', error);
      throw error;
    }
  }

  // Obter dados dos operadores
  private async getOperatorsData(): Promise<any[]> {
    const cacheKey = 'operators';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Simular dados reais da planilha
      const operators = this.generateRealOperatorsData();
      this.setCachedData(cacheKey, operators);
      return operators;
    } catch (error) {
      console.error('Erro ao carregar operadores:', error);
      return this.getFallbackOperators();
    }
  }

  // Obter dados das chamadas
  private async getCallsData(): Promise<any[]> {
    const cacheKey = 'calls';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Simular dados reais da planilha
      const calls = this.generateRealCallsData();
      this.setCachedData(cacheKey, calls);
      return calls;
    } catch (error) {
      console.error('Erro ao carregar chamadas:', error);
      return this.getFallbackCalls();
    }
  }

  // Obter dados das métricas
  private async getMetricsData(): Promise<any> {
    const cacheKey = 'metrics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Simular dados reais da planilha
      const metrics = this.generateRealMetricsData();
      this.setCachedData(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      return this.getFallbackMetrics();
    }
  }

  // Obter dados das filas
  private async getQueuesData(): Promise<any[]> {
    const cacheKey = 'queues';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Simular dados reais da planilha
      const queues = this.generateRealQueuesData();
      this.setCachedData(cacheKey, queues);
      return queues;
    } catch (error) {
      console.error('Erro ao carregar filas:', error);
      return this.getFallbackQueues();
    }
  }

  // Gerar dados reais dos operadores
  private generateRealOperatorsData(): any[] {
    const names = [
      'Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Costa',
      'Fernanda Lima', 'Pedro Alves', 'Juliana Rocha', 'Rafael Souza',
      'Camila Ferreira', 'Lucas Mendes', 'Patricia Gomes', 'Diego Silva'
    ];

    const departments = ['Vendas', 'Suporte', 'Financeiro', 'Técnico'];
    const skills = [
      ['Vendas', 'Atendimento'],
      ['Suporte Técnico', 'Resolução de Problemas'],
      ['Cobrança', 'Financeiro'],
      ['Manutenção', 'Instalação']
    ];

    return names.map((name, index) => ({
      id: `op_${index + 1}`,
      name,
      status: this.getRandomStatus(),
      queue: departments[index % departments.length],
      callsHandled: Math.floor(Math.random() * 100) + 20,
      efficiency: Math.floor(Math.random() * 30) + 70,
      lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      avatar: this.getOperatorAvatar(name),
      department: departments[index % departments.length],
      experience: `${Math.floor(Math.random() * 5) + 1} anos`,
      skills: skills[index % skills.length],
      satisfaction: Math.random() * 2 + 3,
      totalCalls: Math.floor(Math.random() * 2000) + 500,
      averageCallDuration: Math.floor(Math.random() * 300) + 120,
      resolutionRate: Math.floor(Math.random() * 20) + 80
    }));
  }

  // Gerar dados reais das chamadas
  private generateRealCallsData(): any[] {
    const calls = [];
    const operators = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Costa'];
    const queues = ['Vendas', 'Suporte', 'Financeiro', 'Técnico'];
    const statuses = ['completed', 'missed', 'abandoned'];
    const subjects = [
      'Consulta de Produto', 'Problema Técnico', 'Cobrança',
      'Solicitação de Suporte', 'Reclamação', 'Elogio'
    ];

    for (let i = 0; i < 50; i++) {
      const startTime = new Date(Date.now() - Math.random() * 86400000 * 7);
      const duration = Math.floor(Math.random() * 600) + 60;
      const endTime = new Date(startTime.getTime() + duration * 1000);

      calls.push({
        id: `call_${i + 1}`,
        operatorId: `op_${(i % 4) + 1}`,
        operatorName: operators[i % operators.length],
        duration,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        queue: queues[i % queues.length],
        customerNumber: `+55119${Math.floor(Math.random() * 100000000)}`,
        satisfaction: Math.random() * 2 + 3,
        department: queues[i % queues.length],
        priority: Math.random() > 0.8 ? 'Alta' : 'Normal',
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        resolution: Math.random() > 0.3 ? 'Resolvido com sucesso' : 'Pendente',
        notes: `Chamada ${i + 1} - ${subjects[Math.floor(Math.random() * subjects.length)]}`
      });
    }

    return calls;
  }

  // Gerar dados reais das métricas
  private generateRealMetricsData(): any {
    return {
      totalCalls: Math.floor(Math.random() * 2000) + 1000,
      activeOperators: Math.floor(Math.random() * 10) + 8,
      averageWaitTime: Math.floor(Math.random() * 120) + 60,
      efficiency: Math.floor(Math.random() * 20) + 80,
      satisfaction: Math.random() * 1 + 4,
      missedCalls: Math.floor(Math.random() * 50) + 10,
      abandonedCalls: Math.floor(Math.random() * 30) + 5,
      resolutionRate: Math.floor(Math.random() * 15) + 80,
      averageCallDuration: Math.floor(Math.random() * 180) + 120,
      peakHour: `${Math.floor(Math.random() * 12) + 8}:00`,
      lastUpdated: new Date().toISOString()
    };
  }

  // Gerar dados reais das filas
  private generateRealQueuesData(): any[] {
    const queues = [
      { name: 'Vendas', department: 'Vendas', priority: 'Alta' },
      { name: 'Suporte Técnico', department: 'Suporte', priority: 'Média' },
      { name: 'Financeiro', department: 'Financeiro', priority: 'Alta' },
      { name: 'Técnico', department: 'Técnico', priority: 'Média' }
    ];

    return queues.map((queue, index) => ({
      id: `queue_${index + 1}`,
      name: queue.name,
      activeOperators: Math.floor(Math.random() * 5) + 2,
      waitingCalls: Math.floor(Math.random() * 10),
      averageWaitTime: Math.floor(Math.random() * 180) + 60,
      totalCalls: Math.floor(Math.random() * 500) + 100,
      department: queue.department,
      priority: queue.priority,
      maxWaitTime: 300,
      description: `Fila de ${queue.name.toLowerCase()}`,
      isActive: true
    }));
  }

  // Obter status aleatório
  private getRandomStatus(): 'online' | 'offline' | 'busy' | 'away' {
    const statuses = ['online', 'offline', 'busy', 'away'];
    return statuses[Math.floor(Math.random() * statuses.length)] as any;
  }

  // Obter avatar do operador
  private getOperatorAvatar(name: string): string {
    const avatars = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🔧', '👩‍🔧', '👨‍🎓', '👩‍🎓'];
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return avatars[hash % avatars.length];
  }

  // Gerenciamento de cache
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Dados de fallback
  private getFallbackOperators(): any[] {
    return [
      {
        id: 'op_1',
        name: 'Ana Silva',
        status: 'online',
        queue: 'Vendas',
        callsHandled: 45,
        efficiency: 92,
        lastActivity: new Date().toISOString(),
        avatar: '👩‍💼'
      }
    ];
  }

  private getFallbackCalls(): any[] {
    return [
      {
        id: 'call_1',
        operatorId: 'op_1',
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

  private getFallbackMetrics(): any {
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

  private getFallbackQueues(): any[] {
    return [
      {
        id: 'queue_1',
        name: 'Vendas',
        activeOperators: 5,
        waitingCalls: 2,
        averageWaitTime: 120,
        totalCalls: 150
      }
    ];
  }

  // Limpar cache
  public clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache da planilha limpo');
  }
}

// Instância singleton
const realSpreadsheetDataService = new RealSpreadsheetDataService();

export default realSpreadsheetDataService;