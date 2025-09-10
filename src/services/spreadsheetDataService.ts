// Serviço Centralizado de Dados da Planilha - VeloIGP
// Gerencia dados compartilhados entre Dashboard e Planilhas

import { calculationEngine, MetricsResult, CallData, TimeRange } from './calculationEngine';
import { googleSheetsService, SpreadsheetData, SheetData } from './googleSheetsService';
import { comparativeAnalysisService, ComparativeData, AgentComparison, QueueAnalysis } from './comparativeAnalysisService';

export interface PeriodOption {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
  type: 'last-month' | 'last-3-months' | 'year' | 'custom';
}

export interface DashboardData {
  metrics: MetricsResult;
  period: PeriodOption;
  lastUpdate: Date;
  dataQuality: number;
  recommendations: string[];
}

export interface SpreadsheetAnalysis {
  rawData: any[][];
  processedData: CallData[];
  metrics: MetricsResult;
  dataQuality: number;
  recommendations: string[];
  period: TimeRange;
}

class SpreadsheetDataService {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutos
  private currentSpreadsheet: SpreadsheetData | null = null;
  private currentSheet: SheetData | null = null;

  /**
   * Obter opções de período disponíveis
   */
  getPeriodOptions(): PeriodOption[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    return [
      {
        id: 'last-month',
        label: 'Último Mês',
        startDate: new Date(currentYear, now.getMonth() - 1, 1),
        endDate: new Date(currentYear, now.getMonth(), 0),
        type: 'last-month'
      },
      {
        id: 'last-3-months',
        label: 'Últimos 3 Meses',
        startDate: new Date(currentYear, now.getMonth() - 3, 1),
        endDate: new Date(currentYear, now.getMonth(), 0),
        type: 'last-3-months'
      },
      {
        id: 'current-year',
        label: `${currentYear}`,
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear, 11, 31),
        type: 'year'
      },
      {
        id: 'custom',
        label: 'Período Personalizado',
        startDate: new Date(),
        endDate: new Date(),
        type: 'custom'
      }
    ];
  }

  /**
   * Carregar dados do Dashboard baseado no período selecionado
   */
  async loadDashboardData(periodId: string): Promise<DashboardData> {
    const cacheKey = `dashboard_${periodId}`;
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Obter período
      const periodOptions = this.getPeriodOptions();
      const period = periodOptions.find(p => p.id === periodId) || periodOptions[0];

      // Carregar dados da planilha
      const spreadsheetData = await this.loadSpreadsheetData(period);
      
      // Processar com motor de cálculo
      const metrics = await calculationEngine.calculateMetrics(
        spreadsheetData.processedData,
        { start: period.startDate, end: period.endDate }
      );

      // Gerar recomendações
      const recommendations = this.generateDashboardRecommendations(metrics);

      const result: DashboardData = {
        metrics,
        period,
        lastUpdate: new Date(),
        dataQuality: spreadsheetData.dataQuality,
        recommendations
      };

      // Armazenar no cache
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      throw new Error(`Falha ao carregar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Carregar dados da planilha para análise
   */
  async loadSpreadsheetAnalysis(
    spreadsheetId: string, 
    sheetId: string, 
    period?: TimeRange
  ): Promise<SpreadsheetAnalysis> {
    const cacheKey = `spreadsheet_${spreadsheetId}_${sheetId}`;
    
    try {
      // Carregar dados da planilha
      const spreadsheet = await googleSheetsService.getSpreadsheetData(spreadsheetId);
      const sheet = spreadsheet.sheets.find(s => s.id === sheetId);
      
      if (!sheet) {
        throw new Error('Aba não encontrada');
      }

      // Processar dados
      const processedData = calculationEngine.convertSpreadsheetToCallData(sheet.data);
      
      // Filtrar por período se especificado
      let filteredData = processedData;
      if (period) {
        filteredData = processedData.filter(call => 
          call.timestamp >= period.start && call.timestamp <= period.end
        );
      }

      // Calcular métricas
      const timeRange = period || {
        start: new Date(Math.min(...processedData.map(call => call.timestamp.getTime()))),
        end: new Date(Math.max(...processedData.map(call => call.timestamp.getTime())))
      };

      const metrics = await calculationEngine.calculateMetrics(filteredData, timeRange);
      
      // Validar qualidade dos dados
      const validation = calculationEngine.validateCallData(filteredData);
      
      // Gerar recomendações
      const recommendations = this.generateSpreadsheetRecommendations(metrics, validation);

      return {
        rawData: sheet.data,
        processedData: filteredData,
        metrics,
        dataQuality: validation.dataQuality,
        recommendations,
        period: timeRange
      };

    } catch (error) {
      console.error('Erro ao carregar análise da planilha:', error);
      throw error;
    }
  }

  /**
   * Carregar dados da planilha (método privado)
   */
  private async loadSpreadsheetData(period: PeriodOption): Promise<{
    processedData: CallData[];
    dataQuality: number;
  }> {
    // Simular carregamento de dados da planilha
    // Em produção, isso virá da Google Sheets API
    const mockData = calculationEngine.generateMockData({
      start: period.startDate,
      end: period.endDate
    });

    // Validar qualidade
    const validation = calculationEngine.validateCallData(mockData);

    return {
      processedData: mockData,
      dataQuality: validation.dataQuality
    };
  }

  /**
   * Gerar recomendações para Dashboard
   */
  private generateDashboardRecommendations(metrics: MetricsResult): string[] {
    const recommendations: string[] = [];

    if (metrics.answerRate < 85) {
      recommendations.push('Taxa de atendimento abaixo de 85%. Considere otimizar a distribuição de chamadas.');
    }

    if (metrics.averageWaitTime > 3) {
      recommendations.push('Tempo de espera elevado. Avalie a eficiência dos agentes.');
    }

    if (metrics.dailyTrend < -5) {
      recommendations.push('Queda no volume de chamadas. Verifique possíveis problemas técnicos.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance dentro dos parâmetros esperados.');
    }

    return recommendations;
  }

  /**
   * Gerar recomendações para Planilhas
   */
  private generateSpreadsheetRecommendations(metrics: MetricsResult, validation: any): string[] {
    const recommendations: string[] = [];

    if (validation.dataQuality < 95) {
      recommendations.push('Verifique a qualidade dos dados na planilha.');
    }

    if (metrics.answerRate < 80) {
      recommendations.push('Taxa de atendimento baixa. Revise processos de atendimento.');
    }

    if (metrics.averageSatisfaction < 3.5) {
      recommendations.push('Satisfação do cliente baixa. Considere treinamento adicional.');
    }

    return recommendations;
  }

  /**
   * Obter dados em tempo real (simulado)
   */
  async getRealTimeData(): Promise<Partial<MetricsResult>> {
    // Simular dados em tempo real
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const mockData = calculationEngine.generateMockData({
      start: oneHourAgo,
      end: now
    });

    const metrics = await calculationEngine.calculateMetrics(mockData, {
      start: oneHourAgo,
      end: now
    });

    return {
      totalCalls: metrics.totalCalls,
      answeredCalls: metrics.answeredCalls,
      missedCalls: metrics.missedCalls,
      answerRate: metrics.answerRate,
      averageWaitTime: metrics.averageWaitTime,
      averageSatisfaction: metrics.averageSatisfaction
    };
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obter análise comparativa entre períodos
   */
  async getComparativeAnalysis(
    currentPeriodId: string,
    previousPeriodId: string
  ): Promise<{
    periodComparison: ComparativeData;
    agentComparison: AgentComparison[];
    queueAnalysis: QueueAnalysis[];
  }> {
    const cacheKey = `comparative_${currentPeriodId}_${previousPeriodId}`;
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Carregar dados dos dois períodos
      const currentData = await this.loadSpreadsheetData(this.getPeriodOptions().find(p => p.id === currentPeriodId)!);
      const previousData = await this.loadSpreadsheetData(this.getPeriodOptions().find(p => p.id === previousPeriodId)!);
      
      // Gerar análise comparativa
      const analysis = await comparativeAnalysisService.generateComparativeReport(
        currentData.processedData,
        previousData.processedData,
        { start: this.getPeriodOptions().find(p => p.id === currentPeriodId)!.startDate, end: this.getPeriodOptions().find(p => p.id === currentPeriodId)!.endDate },
        { start: this.getPeriodOptions().find(p => p.id === previousPeriodId)!.startDate, end: this.getPeriodOptions().find(p => p.id === previousPeriodId)!.endDate }
      );

      const result = {
        periodComparison: analysis.periodComparison,
        agentComparison: analysis.agentComparison,
        queueAnalysis: analysis.queueAnalysis
      };

      // Armazenar no cache
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Erro na análise comparativa:', error);
      throw error;
    }
  }

  /**
   * Obter dados individuais de chamadas com filtros
   */
  async getIndividualCallData(
    spreadsheetId: string,
    sheetId: string,
    filters?: {
      agentId?: string;
      queueId?: string;
      status?: string;
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<CallData[]> {
    try {
      const analysis = await this.loadSpreadsheetAnalysis(spreadsheetId, sheetId);
      let filteredData = analysis.processedData;

      // Aplicar filtros
      if (filters) {
        if (filters.agentId) {
          filteredData = filteredData.filter(call => call.agentId === filters.agentId);
        }
        if (filters.queueId) {
          filteredData = filteredData.filter(call => call.queueId === filters.queueId);
        }
        if (filters.status) {
          filteredData = filteredData.filter(call => call.status === filters.status);
        }
        if (filters.dateRange) {
          filteredData = filteredData.filter(call => 
            call.timestamp >= filters.dateRange!.start && 
            call.timestamp <= filters.dateRange!.end
          );
        }
      }

      return filteredData;
    } catch (error) {
      console.error('Erro ao obter dados individuais:', error);
      throw error;
    }
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

// Instância singleton do serviço
export const spreadsheetDataService = new SpreadsheetDataService();
export default spreadsheetDataService;
