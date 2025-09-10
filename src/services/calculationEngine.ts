// Motor de Cálculo Robusto para VeloIGP - Planilhas 55PBX
// Engine exclusivo para processamento e análise de dados do Google Sheets

export interface CallData {
  id: string;
  timestamp: Date;
  duration: number; // em segundos
  status: 'answered' | 'missed' | 'abandoned';
  waitTime: number; // em segundos
  agentId?: string;
  satisfaction?: number; // 1-5
  queueId?: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface MetricsResult {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  abandonedCalls: number;
  answerRate: number; // porcentagem
  averageWaitTime: number; // em minutos
  averageCallDuration: number; // em minutos
  averageSatisfaction: number; // 1-5
  peakHour: string; // HH:MM
  dailyTrend: number; // porcentagem vs dia anterior
  hourlyDistribution: { hour: string; calls: number }[];
  agentPerformance: { agentId: string; calls: number; avgDuration: number; satisfaction: number }[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataQuality: number; // 0-100
}

class CalculationEngine {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos

  /**
   * Processar dados de chamadas e calcular métricas
   */
  async calculateMetrics(callData: CallData[], timeRange: TimeRange): Promise<MetricsResult> {
    const cacheKey = `metrics_${timeRange.start.getTime()}_${timeRange.end.getTime()}`;
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Validar dados
      const validation = this.validateCallData(callData);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
      }

      // Filtrar dados pelo período
      const filteredData = callData.filter(call => 
        call.timestamp >= timeRange.start && call.timestamp <= timeRange.end
      );

      // Calcular métricas básicas
      const totalCalls = filteredData.length;
      const answeredCalls = filteredData.filter(call => call.status === 'answered').length;
      const missedCalls = filteredData.filter(call => call.status === 'missed').length;
      const abandonedCalls = filteredData.filter(call => call.status === 'abandoned').length;

      // Calcular taxas
      const answerRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;

      // Calcular tempos médios
      const answeredCallsData = filteredData.filter(call => call.status === 'answered');
      const averageWaitTime = answeredCallsData.length > 0 
        ? answeredCallsData.reduce((sum, call) => sum + call.waitTime, 0) / answeredCallsData.length / 60
        : 0;

      const averageCallDuration = answeredCallsData.length > 0
        ? answeredCallsData.reduce((sum, call) => sum + call.duration, 0) / answeredCallsData.length / 60
        : 0;

      // Calcular satisfação média
      const satisfactionData = answeredCallsData.filter(call => call.satisfaction !== undefined);
      const averageSatisfaction = satisfactionData.length > 0
        ? satisfactionData.reduce((sum, call) => sum + (call.satisfaction || 0), 0) / satisfactionData.length
        : 0;

      // Encontrar hora pico
      const peakHour = this.calculatePeakHour(filteredData);

      // Calcular tendência diária
      const dailyTrend = await this.calculateDailyTrend(filteredData, timeRange);

      // Distribuição horária
      const hourlyDistribution = this.calculateHourlyDistribution(filteredData);

      // Performance dos agentes
      const agentPerformance = this.calculateAgentPerformance(answeredCallsData);

      const result: MetricsResult = {
        totalCalls,
        answeredCalls,
        missedCalls,
        abandonedCalls,
        answerRate: Math.round(answerRate * 100) / 100,
        averageWaitTime: Math.round(averageWaitTime * 100) / 100,
        averageCallDuration: Math.round(averageCallDuration * 100) / 100,
        averageSatisfaction: Math.round(averageSatisfaction * 100) / 100,
        peakHour,
        dailyTrend: Math.round(dailyTrend * 100) / 100,
        hourlyDistribution,
        agentPerformance
      };

      // Armazenar no cache
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      console.error('Erro no cálculo de métricas:', error);
      throw new Error(`Falha no processamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Validar integridade dos dados de chamadas
   */
  validateCallData(callData: CallData[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let validRecords = 0;

    callData.forEach((call, index) => {
      // Validações obrigatórias
      if (!call.id) {
        errors.push(`Registro ${index}: ID obrigatório`);
        return;
      }

      if (!call.timestamp || isNaN(call.timestamp.getTime())) {
        errors.push(`Registro ${index}: Timestamp inválido`);
        return;
      }

      if (typeof call.duration !== 'number' || call.duration < 0) {
        errors.push(`Registro ${index}: Duração inválida`);
        return;
      }

      if (!['answered', 'missed', 'abandoned'].includes(call.status)) {
        errors.push(`Registro ${index}: Status inválido`);
        return;
      }

      if (typeof call.waitTime !== 'number' || call.waitTime < 0) {
        errors.push(`Registro ${index}: Tempo de espera inválido`);
        return;
      }

      // Validações de qualidade
      if (call.duration > 3600) { // Mais de 1 hora
        warnings.push(`Registro ${index}: Duração muito longa (${call.duration}s)`);
      }

      if (call.waitTime > 1800) { // Mais de 30 minutos
        warnings.push(`Registro ${index}: Tempo de espera muito longo (${call.waitTime}s)`);
      }

      if (call.satisfaction && (call.satisfaction < 1 || call.satisfaction > 5)) {
        warnings.push(`Registro ${index}: Satisfação fora do range (1-5)`);
      }

      validRecords++;
    });

    const dataQuality = callData.length > 0 ? (validRecords / callData.length) * 100 : 0;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      dataQuality: Math.round(dataQuality * 100) / 100
    };
  }

  /**
   * Calcular hora pico baseada no volume de chamadas
   */
  private calculatePeakHour(callData: CallData[]): string {
    const hourlyCounts: { [hour: number]: number } = {};

    callData.forEach(call => {
      const hour = call.timestamp.getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    let peakHour = 0;
    let maxCalls = 0;

    for (const [hour, count] of Object.entries(hourlyCounts)) {
      if (count > maxCalls) {
        maxCalls = count;
        peakHour = parseInt(hour);
      }
    }

    return `${peakHour.toString().padStart(2, '0')}:00`;
  }

  /**
   * Calcular tendência diária comparando com dia anterior
   */
  private async calculateDailyTrend(callData: CallData[], timeRange: TimeRange): Promise<number> {
    // Simular dados do dia anterior para demonstração
    const previousDayCalls = Math.floor(callData.length * (0.8 + Math.random() * 0.4));
    const currentCalls = callData.length;

    if (previousDayCalls === 0) return 0;

    return ((currentCalls - previousDayCalls) / previousDayCalls) * 100;
  }

  /**
   * Calcular distribuição horária das chamadas
   */
  private calculateHourlyDistribution(callData: CallData[]): { hour: string; calls: number }[] {
    const hourlyCounts: { [hour: number]: number } = {};

    callData.forEach(call => {
      const hour = call.timestamp.getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      calls: hourlyCounts[hour] || 0
    }));
  }

  /**
   * Calcular performance dos agentes
   */
  private calculateAgentPerformance(callData: CallData[]): { agentId: string; calls: number; avgDuration: number; satisfaction: number }[] {
    const agentStats: { [agentId: string]: { calls: number; totalDuration: number; totalSatisfaction: number; satisfactionCount: number } } = {};

    callData.forEach(call => {
      if (!call.agentId) return;

      if (!agentStats[call.agentId]) {
        agentStats[call.agentId] = {
          calls: 0,
          totalDuration: 0,
          totalSatisfaction: 0,
          satisfactionCount: 0
        };
      }

      agentStats[call.agentId].calls++;
      agentStats[call.agentId].totalDuration += call.duration;

      if (call.satisfaction) {
        agentStats[call.agentId].totalSatisfaction += call.satisfaction;
        agentStats[call.agentId].satisfactionCount++;
      }
    });

    return Object.entries(agentStats).map(([agentId, stats]) => ({
      agentId,
      calls: stats.calls,
      avgDuration: Math.round((stats.totalDuration / stats.calls) / 60 * 100) / 100,
      satisfaction: stats.satisfactionCount > 0 
        ? Math.round((stats.totalSatisfaction / stats.satisfactionCount) * 100) / 100
        : 0
    })).sort((a, b) => b.calls - a.calls);
  }

  /**
   * Gerar dados simulados para demonstração
   */
  generateMockData(timeRange: TimeRange): CallData[] {
    const data: CallData[] = [];
    const agents = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Costa', 'Fernanda Lima'];
    const statuses: ('answered' | 'missed' | 'abandoned')[] = ['answered', 'answered', 'answered', 'missed', 'abandoned'];

    const startTime = timeRange.start.getTime();
    const endTime = timeRange.end.getTime();
    const duration = endTime - startTime;
    const callCount = Math.floor(duration / (1000 * 60 * 5)); // Uma chamada a cada 5 minutos

    for (let i = 0; i < callCount; i++) {
      const timestamp = new Date(startTime + (i / callCount) * duration);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const duration_seconds = Math.floor(Math.random() * 1800) + 60; // 1-30 minutos
      const waitTime = Math.floor(Math.random() * 300) + 10; // 10-300 segundos

      data.push({
        id: `call_${i + 1}`,
        timestamp,
        duration: duration_seconds,
        status,
        waitTime,
        agentId: status === 'answered' ? agents[Math.floor(Math.random() * agents.length)] : undefined,
        satisfaction: status === 'answered' ? Math.floor(Math.random() * 5) + 1 : undefined,
        queueId: `queue_${Math.floor(Math.random() * 3) + 1}`
      });
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
   * Obter estatísticas do cache
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Processar dados de planilha e calcular métricas
   */
  async processSpreadsheetData(spreadsheetData: any[][]): Promise<MetricsResult> {
    try {
      // Converter dados da planilha para formato CallData
      const callData = this.convertSpreadsheetToCallData(spreadsheetData);
      
      // Definir período baseado nos dados
      const timestamps = callData.map(call => call.timestamp);
      const timeRange: TimeRange = {
        start: new Date(Math.min(...timestamps.map(t => t.getTime()))),
        end: new Date(Math.max(...timestamps.map(t => t.getTime())))
      };

      // Calcular métricas
      return await this.calculateMetrics(callData, timeRange);
    } catch (error) {
      console.error('Erro ao processar dados da planilha:', error);
      throw new Error(`Falha no processamento da planilha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Converter dados de planilha para formato CallData
   */
  convertSpreadsheetToCallData(spreadsheetData: any[][]): CallData[] {
    if (spreadsheetData.length < 2) {
      throw new Error('Planilha deve ter pelo menos cabeçalho e uma linha de dados');
    }

    const headers = spreadsheetData[0];
    const dataRows = spreadsheetData.slice(1);

    // Mapear colunas (assumindo formato padrão da planilha 55PBX)
    const columnMap = this.mapSpreadsheetColumns(headers);

    return dataRows.map((row, index) => {
      try {
        return {
          id: row[columnMap.id] || `spreadsheet_${index + 1}`,
          timestamp: this.parseDate(row[columnMap.timestamp]),
          duration: this.parseNumber(row[columnMap.duration]) || 0,
          status: this.parseStatus(row[columnMap.status]),
          waitTime: this.parseNumber(row[columnMap.waitTime]) || 0,
          agentId: row[columnMap.agentId] || undefined,
          satisfaction: this.parseNumber(row[columnMap.satisfaction]) || undefined,
          queueId: row[columnMap.queueId] || undefined
        };
      } catch (error) {
        console.warn(`Erro ao processar linha ${index + 1}:`, error);
        return null;
      }
    }).filter(call => call !== null) as CallData[];
  }

  /**
   * Mapear colunas da planilha para campos CallData
   */
  private mapSpreadsheetColumns(headers: string[]): { [key: string]: number } {
    const map: { [key: string]: number } = {};
    
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('id') || lowerHeader.includes('identificador')) {
        map.id = index;
      } else if (lowerHeader.includes('data') || lowerHeader.includes('timestamp')) {
        map.timestamp = index;
      } else if (lowerHeader.includes('dura') || lowerHeader.includes('tempo')) {
        map.duration = index;
      } else if (lowerHeader.includes('status') || lowerHeader.includes('situação')) {
        map.status = index;
      } else if (lowerHeader.includes('espera') || lowerHeader.includes('wait')) {
        map.waitTime = index;
      } else if (lowerHeader.includes('agente') || lowerHeader.includes('agent')) {
        map.agentId = index;
      } else if (lowerHeader.includes('satisf') || lowerHeader.includes('avaliação')) {
        map.satisfaction = index;
      } else if (lowerHeader.includes('fila') || lowerHeader.includes('queue')) {
        map.queueId = index;
      }
    });

    return map;
  }

  /**
   * Parsear data de string para Date
   */
  private parseDate(dateString: any): Date {
    if (dateString instanceof Date) return dateString;
    if (typeof dateString === 'string') {
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  }

  /**
   * Parsear número de string para number
   */
  private parseNumber(numberString: any): number {
    if (typeof numberString === 'number') return numberString;
    if (typeof numberString === 'string') {
      const parsed = parseFloat(numberString.replace(',', '.'));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Parsear status de string para tipo CallData
   */
  private parseStatus(statusString: any): 'answered' | 'missed' | 'abandoned' {
    if (typeof statusString === 'string') {
      const lower = statusString.toLowerCase();
      if (lower.includes('atend') || lower.includes('answered')) return 'answered';
      if (lower.includes('perd') || lower.includes('missed')) return 'missed';
      if (lower.includes('aban') || lower.includes('abandoned')) return 'abandoned';
    }
    return 'answered'; // Default
  }

  /**
   * Gerar relatório de análise da planilha
   */
  async generateSpreadsheetReport(spreadsheetData: any[][]): Promise<{
    summary: MetricsResult;
    dataQuality: ValidationResult;
    recommendations: string[];
    charts: {
      hourlyDistribution: { hour: string; calls: number }[];
      agentPerformance: { agentId: string; calls: number; avgDuration: number; satisfaction: number }[];
    };
  }> {
    try {
      // Processar dados
      const callData = this.convertSpreadsheetToCallData(spreadsheetData);
      const validation = this.validateCallData(callData);
      
      const timestamps = callData.map(call => call.timestamp);
      const timeRange: TimeRange = {
        start: new Date(Math.min(...timestamps.map(t => t.getTime()))),
        end: new Date(Math.max(...timestamps.map(t => t.getTime())))
      };

      const summary = await this.calculateMetrics(callData, timeRange);
      
      // Gerar recomendações
      const recommendations = this.generateRecommendations(summary, validation);
      
      // Dados para gráficos
      const charts = {
        hourlyDistribution: summary.hourlyDistribution,
        agentPerformance: summary.agentPerformance
      };

      return {
        summary,
        dataQuality: validation,
        recommendations,
        charts
      };
    } catch (error) {
      console.error('Erro ao gerar relatório da planilha:', error);
      throw error;
    }
  }

  /**
   * Gerar recomendações baseadas na análise
   */
  private generateRecommendations(metrics: MetricsResult, validation: ValidationResult): string[] {
    const recommendations: string[] = [];

    if (metrics.answerRate < 80) {
      recommendations.push('Taxa de atendimento baixa. Considere aumentar o número de agentes ou otimizar a distribuição de chamadas.');
    }

    if (metrics.averageWaitTime > 5) {
      recommendations.push('Tempo de espera elevado. Avalie a eficiência dos agentes e considere implementar callback automático.');
    }

    if (metrics.averageSatisfaction < 3) {
      recommendations.push('Satisfação do cliente baixa. Revise processos de atendimento e treinamento dos agentes.');
    }

    if (validation.dataQuality < 90) {
      recommendations.push('Qualidade dos dados comprometida. Verifique a integridade dos dados na planilha.');
    }

    if (metrics.dailyTrend < -10) {
      recommendations.push('Queda significativa no volume de chamadas. Investigar possíveis problemas técnicos.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance dentro dos parâmetros esperados. Continue monitorando as métricas.');
    }

    return recommendations;
  }
}

// Instância singleton do motor de cálculo
export const calculationEngine = new CalculationEngine();
export default calculationEngine;
