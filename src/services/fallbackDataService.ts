// Serviço de Fallback - Dados Básicos para Evitar Tela Escura
// Fornece dados básicos quando a API falha

export interface FallbackData {
  spreadsheets: any[];
  currentSpreadsheet: any;
  currentSheet: any;
  analysisData: any;
  operatorProfiles: any[];
  periodComparisons: any[];
  queueAnalysis: any[];
  lastUpdate: Date;
  isLoaded: boolean;
  isFallback: boolean;
  error?: string | null;
}

class FallbackDataService {
  /**
   * Gerar dados de fallback básicos
   */
  generateFallbackData(): FallbackData {
    console.log('🔄 Gerando dados de fallback...');
    
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Dados básicos de planilha
    const basicData = this.generateBasicSpreadsheetData();
    
    return {
      spreadsheets: [{
        id: 'fallback-1',
        title: 'Dados de Fallback',
        lastModified: yesterday,
        sheets: [{
          id: 0,
          title: 'Dados Básicos',
          rowCount: basicData.length,
          colCount: 4
        }]
      }],
      currentSpreadsheet: {
        id: 'fallback-1',
        title: 'Dados de Fallback',
        lastModified: yesterday
      },
      currentSheet: {
        id: 0,
        title: 'Dados Básicos',
        data: basicData,
        headers: ['Data', 'Operador', 'Chamadas', 'Status'],
        rowCount: basicData.length,
        colCount: 4
      },
      analysisData: {
        totalCalls: basicData.length - 1,
        answeredCalls: Math.floor((basicData.length - 1) * 0.85),
        missedCalls: Math.floor((basicData.length - 1) * 0.15),
        averageWaitTime: 30,
        averageTalkTime: 120,
        serviceLevel: 0.85,
        abandonmentRate: 0.15,
        periodo: {
          inicio: yesterday.toLocaleDateString('pt-BR'),
          fim: now.toLocaleDateString('pt-BR')
        },
        lastUpdate: now
      },
      operatorProfiles: this.generateOperatorProfiles(),
      periodComparisons: this.generatePeriodComparisons(),
      queueAnalysis: this.generateQueueAnalysis(),
      lastUpdate: now,
      isLoaded: true,
      isFallback: true
    };
  }

  /**
   * Gerar dados básicos da planilha
   */
  private generateBasicSpreadsheetData(): any[][] {
    const data = [];
    const operators = ['Operador 1', 'Operador 2', 'Operador 3', 'Operador 4'];
    const statuses = ['Atendida', 'Perdida'];
    const now = new Date();
    
    // Cabeçalho
    data.push(['Data', 'Operador', 'Chamadas', 'Status']);
    
    // Dados de exemplo
    for (let i = 0; i < 20; i++) {
      const date = new Date(now.getTime() - (i * 60 * 60 * 1000));
      data.push([
        date.toLocaleDateString('pt-BR'),
        operators[i % operators.length],
        Math.floor(Math.random() * 50) + 10,
        statuses[Math.floor(Math.random() * statuses.length)]
      ]);
    }
    
    return data;
  }

  /**
   * Gerar perfis de operadores
   */
  private generateOperatorProfiles(): any[] {
    const operators = ['Operador 1', 'Operador 2', 'Operador 3', 'Operador 4'];
    
    return operators.map((name, index) => ({
      name,
      totalCalls: Math.floor(Math.random() * 100) + 50,
      answeredCalls: Math.floor(Math.random() * 80) + 40,
      missedCalls: Math.floor(Math.random() * 20) + 5,
      averageTalkTime: Math.floor(Math.random() * 60) + 60,
      efficiency: Math.random() * 0.3 + 0.7,
      satisfaction: Math.random() * 0.2 + 0.8
    }));
  }

  /**
   * Gerar comparações de período
   */
  private generatePeriodComparisons(): any[] {
    const periods = ['Hoje', 'Ontem', 'Esta Semana', 'Semana Passada'];
    
    return periods.map(period => ({
      period,
      totalCalls: Math.floor(Math.random() * 200) + 100,
      answeredCalls: Math.floor(Math.random() * 160) + 80,
      missedCalls: Math.floor(Math.random() * 40) + 10,
      averageWaitTime: Math.floor(Math.random() * 30) + 20,
      serviceLevel: Math.random() * 0.2 + 0.8
    }));
  }

  /**
   * Gerar análise de filas
   */
  private generateQueueAnalysis(): any[] {
    const queues = ['Fila 1', 'Fila 2', 'Fila 3'];
    
    return queues.map(queue => ({
      name: queue,
      totalCalls: Math.floor(Math.random() * 150) + 50,
      answeredCalls: Math.floor(Math.random() * 120) + 40,
      missedCalls: Math.floor(Math.random() * 30) + 5,
      averageWaitTime: Math.floor(Math.random() * 45) + 15,
      serviceLevel: Math.random() * 0.3 + 0.7
    }));
  }

  /**
   * Verificar se deve usar fallback
   */
  shouldUseFallback(error: any): boolean {
    // Usar fallback se houver erro de rede, timeout, ou API indisponível
    if (!error) return false;
    
    const errorMessage = error.message || error.toString();
    return errorMessage.includes('timeout') || 
           errorMessage.includes('network') || 
           errorMessage.includes('fetch') ||
           errorMessage.includes('API') ||
           errorMessage.includes('Google Sheets');
  }
}

// Instância singleton
export const fallbackDataService = new FallbackDataService();
export default fallbackDataService;



