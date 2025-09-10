// Serviço de Análise Comparativa - VeloIGP
// Gerencia análises comparativas entre períodos, agentes e filas

import { CallData, MetricsResult } from './calculationEngine';

export interface ComparativeData {
  current: MetricsResult;
  previous: MetricsResult;
  comparison: {
    callsChange: number; // percentual
    answerRateChange: number;
    waitTimeChange: number;
    satisfactionChange: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface AgentComparison {
  agentId: string;
  currentPeriod: {
    calls: number;
    avgDuration: number;
    satisfaction: number;
  };
  previousPeriod: {
    calls: number;
    avgDuration: number;
    satisfaction: number;
  };
  improvement: {
    callsChange: number;
    durationChange: number;
    satisfactionChange: number;
  };
}

export interface QueueAnalysis {
  queueId: string;
  metrics: MetricsResult;
  efficiency: number; // 0-100
  priority: 'high' | 'normal' | 'low';
  recommendations: string[];
}

class ComparativeAnalysisService {
  /**
   * Comparar métricas entre dois períodos
   */
  async comparePeriods(
    currentData: CallData[], 
    previousData: CallData[],
    currentPeriod: { start: Date; end: Date },
    previousPeriod: { start: Date; end: Date }
  ): Promise<ComparativeData> {
    try {
      // Calcular métricas do período atual
      const currentMetrics = await this.calculatePeriodMetrics(currentData, currentPeriod);
      
      // Calcular métricas do período anterior
      const previousMetrics = await this.calculatePeriodMetrics(previousData, previousPeriod);
      
      // Calcular comparações
      const comparison = this.calculateComparison(currentMetrics, previousMetrics);
      
      return {
        current: currentMetrics,
        previous: previousMetrics,
        comparison
      };
    } catch (error) {
      console.error('Erro na análise comparativa:', error);
      throw error;
    }
  }

  /**
   * Comparar performance de agentes
   */
  async compareAgents(
    currentData: CallData[],
    previousData: CallData[]
  ): Promise<AgentComparison[]> {
    try {
      const currentAgents = this.groupByAgent(currentData);
      const previousAgents = this.groupByAgent(previousData);
      
      const comparisons: AgentComparison[] = [];
      
      // Comparar agentes que existem em ambos os períodos
      for (const agentId of Object.keys(currentAgents)) {
        if (previousAgents[agentId]) {
          const current = this.calculateAgentMetrics(currentAgents[agentId]);
          const previous = this.calculateAgentMetrics(previousAgents[agentId]);
          
          comparisons.push({
            agentId,
            currentPeriod: current,
            previousPeriod: previous,
            improvement: {
              callsChange: this.calculatePercentageChange(previous.calls, current.calls),
              durationChange: this.calculatePercentageChange(previous.avgDuration, current.avgDuration),
              satisfactionChange: this.calculatePercentageChange(previous.satisfaction, current.satisfaction)
            }
          });
        }
      }
      
      return comparisons.sort((a, b) => b.improvement.callsChange - a.improvement.callsChange);
    } catch (error) {
      console.error('Erro na comparação de agentes:', error);
      throw error;
    }
  }

  /**
   * Analisar performance por fila
   */
  async analyzeQueues(data: CallData[]): Promise<QueueAnalysis[]> {
    try {
      const queueGroups = this.groupByQueue(data);
      const analyses: QueueAnalysis[] = [];
      
      for (const [queueId, calls] of Object.entries(queueGroups)) {
        const metrics = await this.calculateQueueMetrics(calls);
        const efficiency = this.calculateQueueEfficiency(metrics);
        const priority = this.determineQueuePriority(queueId, metrics);
        const recommendations = this.generateQueueRecommendations(metrics, efficiency);
        
        analyses.push({
          queueId,
          metrics,
          efficiency,
          priority,
          recommendations
        });
      }
      
      return analyses.sort((a, b) => b.efficiency - a.efficiency);
    } catch (error) {
      console.error('Erro na análise de filas:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório comparativo completo
   */
  async generateComparativeReport(
    currentData: CallData[],
    previousData: CallData[],
    currentPeriod: { start: Date; end: Date },
    previousPeriod: { start: Date; end: Date }
  ): Promise<{
    periodComparison: ComparativeData;
    agentComparison: AgentComparison[];
    queueAnalysis: QueueAnalysis[];
    summary: {
      overallTrend: 'up' | 'down' | 'stable';
      keyInsights: string[];
      recommendations: string[];
    };
  }> {
    try {
      const [periodComparison, agentComparison, queueAnalysis] = await Promise.all([
        this.comparePeriods(currentData, previousData, currentPeriod, previousPeriod),
        this.compareAgents(currentData, previousData),
        this.analyzeQueues(currentData)
      ]);

      const summary = this.generateSummary(periodComparison, agentComparison, queueAnalysis);

      return {
        periodComparison,
        agentComparison,
        queueAnalysis,
        summary
      };
    } catch (error) {
      console.error('Erro ao gerar relatório comparativo:', error);
      throw error;
    }
  }

  // Métodos privados auxiliares

  private async calculatePeriodMetrics(data: CallData[], period: { start: Date; end: Date }): Promise<MetricsResult> {
    // Implementar cálculo de métricas para um período específico
    // Por enquanto, usar dados simulados
    return {
      totalCalls: data.length,
      answeredCalls: data.filter(call => call.status === 'answered').length,
      missedCalls: data.filter(call => call.status === 'missed').length,
      abandonedCalls: data.filter(call => call.status === 'abandoned').length,
      answerRate: data.length > 0 ? (data.filter(call => call.status === 'answered').length / data.length) * 100 : 0,
      averageWaitTime: data.length > 0 ? data.reduce((sum, call) => sum + call.waitTime, 0) / data.length / 60 : 0,
      averageCallDuration: data.length > 0 ? data.reduce((sum, call) => sum + call.duration, 0) / data.length / 60 : 0,
      averageSatisfaction: data.length > 0 ? data.reduce((sum, call) => sum + (call.satisfaction || 0), 0) / data.length : 0,
      peakHour: '14:00',
      dailyTrend: 0,
      hourlyDistribution: [],
      agentPerformance: []
    };
  }

  private calculateComparison(current: MetricsResult, previous: MetricsResult): ComparativeData['comparison'] {
    return {
      callsChange: this.calculatePercentageChange(previous.totalCalls, current.totalCalls),
      answerRateChange: this.calculatePercentageChange(previous.answerRate, current.answerRate),
      waitTimeChange: this.calculatePercentageChange(previous.averageWaitTime, current.averageWaitTime),
      satisfactionChange: this.calculatePercentageChange(previous.averageSatisfaction, current.averageSatisfaction),
      trend: this.determineTrend(current, previous)
    };
  }

  private calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  private determineTrend(current: MetricsResult, previous: MetricsResult): 'up' | 'down' | 'stable' {
    const callsChange = this.calculatePercentageChange(previous.totalCalls, current.totalCalls);
    const answerRateChange = this.calculatePercentageChange(previous.answerRate, current.answerRate);
    
    if (callsChange > 5 && answerRateChange > 0) return 'up';
    if (callsChange < -5 || answerRateChange < -5) return 'down';
    return 'stable';
  }

  private groupByAgent(data: CallData[]): { [agentId: string]: CallData[] } {
    return data.reduce((groups, call) => {
      if (call.agentId) {
        if (!groups[call.agentId]) {
          groups[call.agentId] = [];
        }
        groups[call.agentId].push(call);
      }
      return groups;
    }, {} as { [agentId: string]: CallData[] });
  }

  private groupByQueue(data: CallData[]): { [queueId: string]: CallData[] } {
    return data.reduce((groups, call) => {
      const queueId = call.queueId || 'unknown';
      if (!groups[queueId]) {
        groups[queueId] = [];
      }
      groups[queueId].push(call);
      return groups;
    }, {} as { [queueId: string]: CallData[] });
  }

  private calculateAgentMetrics(calls: CallData[]): { calls: number; avgDuration: number; satisfaction: number } {
    const answeredCalls = calls.filter(call => call.status === 'answered');
    return {
      calls: calls.length,
      avgDuration: answeredCalls.length > 0 ? 
        answeredCalls.reduce((sum, call) => sum + call.duration, 0) / answeredCalls.length / 60 : 0,
      satisfaction: answeredCalls.length > 0 ? 
        answeredCalls.reduce((sum, call) => sum + (call.satisfaction || 0), 0) / answeredCalls.length : 0
    };
  }

  private async calculateQueueMetrics(calls: CallData[]): Promise<MetricsResult> {
    return this.calculatePeriodMetrics(calls, {
      start: new Date(Math.min(...calls.map(call => call.timestamp.getTime()))),
      end: new Date(Math.max(...calls.map(call => call.timestamp.getTime())))
    });
  }

  private calculateQueueEfficiency(metrics: MetricsResult): number {
    const answerRate = metrics.answerRate;
    const satisfaction = metrics.averageSatisfaction;
    const waitTime = metrics.averageWaitTime;
    
    // Fórmula de eficiência: 40% taxa atendimento + 30% satisfação + 30% tempo espera
    const efficiency = (answerRate * 0.4) + (satisfaction * 20 * 0.3) + (Math.max(0, 5 - waitTime) * 20 * 0.3);
    return Math.min(100, Math.max(0, efficiency));
  }

  private determineQueuePriority(queueId: string, metrics: MetricsResult): 'high' | 'normal' | 'low' {
    if (queueId.toLowerCase().includes('vip')) return 'high';
    if (metrics.averageWaitTime > 5) return 'high';
    if (metrics.answerRate < 80) return 'high';
    return 'normal';
  }

  private generateQueueRecommendations(metrics: MetricsResult, efficiency: number): string[] {
    const recommendations: string[] = [];
    
    if (efficiency < 70) {
      recommendations.push('Eficiência baixa. Revise processos e treinamento.');
    }
    if (metrics.averageWaitTime > 3) {
      recommendations.push('Tempo de espera elevado. Considere aumentar agentes.');
    }
    if (metrics.answerRate < 85) {
      recommendations.push('Taxa de atendimento baixa. Otimize distribuição de chamadas.');
    }
    
    return recommendations;
  }

  private generateSummary(
    periodComparison: ComparativeData,
    agentComparison: AgentComparison[],
    queueAnalysis: QueueAnalysis[]
  ): { overallTrend: 'up' | 'down' | 'stable'; keyInsights: string[]; recommendations: string[] } {
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    // Análise de tendência geral
    const overallTrend = periodComparison.comparison.trend;
    
    // Insights baseados nos dados
    if (periodComparison.comparison.callsChange > 10) {
      insights.push(`Aumento significativo no volume de chamadas (+${periodComparison.comparison.callsChange.toFixed(1)}%)`);
    }
    
    if (periodComparison.comparison.answerRateChange > 5) {
      insights.push(`Melhoria na taxa de atendimento (+${periodComparison.comparison.answerRateChange.toFixed(1)}%)`);
    }
    
    // Recomendações
    if (overallTrend === 'down') {
      recommendations.push('Performance em declínio. Implemente ações corretivas urgentes.');
    }
    
    const topAgent = agentComparison[0];
    if (topAgent && topAgent.improvement.callsChange > 20) {
      recommendations.push(`${topAgent.agentId} está com excelente performance. Use como referência para treinamento.`);
    }
    
    return {
      overallTrend,
      keyInsights: insights,
      recommendations
    };
  }
}

// Instância singleton do serviço
export const comparativeAnalysisService = new ComparativeAnalysisService();
export default comparativeAnalysisService;
