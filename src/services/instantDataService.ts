// Serviço de Dados Instantâneo
// Sempre retorna dados imediatamente

class InstantDataService {
  private static instance: InstantDataService;
  private cache: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): InstantDataService {
    if (!InstantDataService.instance) {
      InstantDataService.instance = new InstantDataService();
    }
    return InstantDataService.instance;
  }

  /**
   * Obter dados instantâneos
   */
  async getInstantData(): Promise<any> {
    // Verificar cache primeiro
    if (this.cache.has('instant-data')) {
      return this.cache.get('instant-data');
    }

    // Gerar dados instantâneos
    const data = this.generateInstantData();
    this.cache.set('instant-data', data);
    return data;
  }

  /**
   * Gerar dados instantâneos
   */
  private generateInstantData(): any {
    const now = new Date();
    const today = now.toLocaleDateString('pt-BR');
    
    // Dados de planilhas
    const spreadsheets = [
      {
        id: 'sheet-1',
        title: 'Relatório de Chamadas - Hoje',
        lastModified: now,
        sheets: [
          {
            id: 0,
            title: 'Dados Principais',
            headers: ['Data', 'Hora', 'Operador', 'Cliente', 'Duração', 'Status'],
            data: this.generateCallData(today),
            rowCount: 50,
            colCount: 6
          }
        ]
      }
    ];

    // Dados de análise
    const analysisData = {
      totalCalls: 150,
      answeredCalls: 120,
      missedCalls: 30,
      averageWaitTime: 25,
      averageTalkTime: 180,
      serviceLevel: 0.80,
      abandonmentRate: 0.20,
      periodo: {
        inicio: today,
        fim: today
      },
      lastUpdate: now
    };

    // Perfis de operadores
    const operatorProfiles = [
      { name: 'Ana Silva', calls: 25, avgTime: 3.5, efficiency: 0.85 },
      { name: 'Carlos Santos', calls: 30, avgTime: 2.8, efficiency: 0.92 },
      { name: 'Maria Costa', calls: 20, avgTime: 4.2, efficiency: 0.78 },
      { name: 'João Oliveira', calls: 35, avgTime: 3.1, efficiency: 0.88 }
    ];

    // Comparações de período
    const periodComparisons = [
      { period: 'Hoje', calls: 150, efficiency: 0.80 },
      { period: 'Ontem', calls: 140, efficiency: 0.75 },
      { period: 'Semana', calls: 980, efficiency: 0.82 }
    ];

    // Análise de filas
    const queueAnalysis = [
      { queue: 'Suporte Técnico', calls: 60, avgWait: 30, efficiency: 0.85 },
      { queue: 'Vendas', calls: 45, avgWait: 20, efficiency: 0.90 },
      { queue: 'Financeiro', calls: 35, avgWait: 45, efficiency: 0.70 },
      { queue: 'Geral', calls: 10, avgWait: 15, efficiency: 0.95 }
    ];

    return {
      spreadsheets,
      currentSpreadsheet: spreadsheets[0],
      currentSheet: spreadsheets[0].sheets[0],
      analysisData,
      operatorProfiles,
      periodComparisons,
      queueAnalysis,
      lastUpdate: now,
      isLoaded: true,
      isInstant: true
    };
  }

  /**
   * Gerar dados de chamadas
   */
  private generateCallData(date: string): any[][] {
    const data = [];
    const operators = ['Ana Silva', 'Carlos Santos', 'Maria Costa', 'João Oliveira'];
    const statuses = ['Atendida', 'Perdida', 'Abandonada'];
    const clients = ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D', 'Cliente E'];

    // Cabeçalho
    data.push(['Data', 'Hora', 'Operador', 'Cliente', 'Duração', 'Status']);

    // Dados de exemplo
    for (let i = 0; i < 50; i++) {
      const hour = String(Math.floor(Math.random() * 8) + 8).padStart(2, '0');
      const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      const duration = Math.floor(Math.random() * 300) + 30; // 30-330 segundos
      
      data.push([
        date,
        `${hour}:${minute}`,
        operators[Math.floor(Math.random() * operators.length)],
        clients[Math.floor(Math.random() * clients.length)],
        `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`,
        statuses[Math.floor(Math.random() * statuses.length)]
      ]);
    }

    return data;
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Verificar se tem dados
   */
  hasData(): boolean {
    return this.cache.has('instant-data');
  }
}

export const instantDataService = InstantDataService.getInstance();
export default instantDataService;



