// Motor de Cálculo Avançado
// Sistema robusto de análise e cálculos para operadores

interface OperatorData {
  id: string;
  name: string;
  calls: CallRecord[];
  periods: PeriodData[];
  metrics?: OperatorMetrics;
}

interface CallRecord {
  id: string;
  date: string;
  time: string;
  duration: number; // em segundos
  status: 'answered' | 'missed' | 'abandoned';
  queue: string;
  waitTime: number; // em segundos
  customerId?: string;
  callType?: 'inbound' | 'outbound';
}

interface PeriodData {
  period: string;
  startDate: string;
  endDate: string;
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  abandonedCalls: number;
  totalDuration: number;
  averageDuration: number;
  averageWaitTime: number;
  serviceLevel: number;
  efficiency: number;
}

interface OperatorMetrics {
  // Métricas básicas
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  abandonedCalls: number;
  
  // Métricas de tempo
  totalTalkTime: number;
  averageTalkTime: number;
  totalWaitTime: number;
  averageWaitTime: number;
  
  // Métricas de performance
  serviceLevel: number;
  efficiency: number;
  availability: number;
  productivity: number;
  
  // Métricas de qualidade
  firstCallResolution: number;
  customerSatisfaction: number;
  adherence: number;
  
  // Rankings e comparações
  ranking: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  improvement: number;
}

interface CalculationConfig {
  serviceLevelTarget: number; // 80% por padrão
  efficiencyTarget: number; // 85% por padrão
  workingHours: number; // 8 horas por dia
  breakTime: number; // 1 hora de pausa
  maxWaitTime: number; // 30 segundos
}

class AdvancedCalculationEngine {
  private static instance: AdvancedCalculationEngine;
  private config: CalculationConfig;

  private constructor() {
    this.config = {
      serviceLevelTarget: 80,
      efficiencyTarget: 85,
      workingHours: 8,
      breakTime: 1,
      maxWaitTime: 30
    };
  }

  static getInstance(): AdvancedCalculationEngine {
    if (!AdvancedCalculationEngine.instance) {
      AdvancedCalculationEngine.instance = new AdvancedCalculationEngine();
    }
    return AdvancedCalculationEngine.instance;
  }

  /**
   * Calcular métricas completas de um operador
   */
  calculateOperatorMetrics(operatorData: OperatorData): OperatorMetrics {
    const calls = operatorData.calls;
    const totalCalls = calls.length;
    
    if (totalCalls === 0) {
      return this.getEmptyMetrics();
    }

    // Métricas básicas
    const answeredCalls = calls.filter(c => c.status === 'answered').length;
    const missedCalls = calls.filter(c => c.status === 'missed').length;
    const abandonedCalls = calls.filter(c => c.status === 'abandoned').length;

    // Métricas de tempo
    const totalTalkTime = calls
      .filter(c => c.status === 'answered')
      .reduce((sum, c) => sum + c.duration, 0);
    
    const averageTalkTime = answeredCalls > 0 ? totalTalkTime / answeredCalls : 0;
    
    const totalWaitTime = calls
      .filter(c => c.status === 'answered')
      .reduce((sum, c) => sum + c.waitTime, 0);
    
    const averageWaitTime = answeredCalls > 0 ? totalWaitTime / answeredCalls : 0;

    // Métricas de performance
    const serviceLevel = this.calculateServiceLevel(calls);
    const efficiency = this.calculateEfficiency(calls, totalTalkTime);
    const availability = this.calculateAvailability(calls);
    const productivity = this.calculateProductivity(calls, totalTalkTime);

    // Métricas de qualidade
    const firstCallResolution = this.calculateFirstCallResolution(calls);
    const customerSatisfaction = this.calculateCustomerSatisfaction(calls);
    const adherence = this.calculateAdherence(calls);

    // Rankings e comparações
    const ranking = this.calculateRanking(operatorData);
    const percentile = this.calculatePercentile(operatorData);
    const trend = this.calculateTrend(operatorData.periods);
    const improvement = this.calculateImprovement(operatorData.periods);

    return {
      totalCalls,
      answeredCalls,
      missedCalls,
      abandonedCalls,
      totalTalkTime,
      averageTalkTime,
      totalWaitTime,
      averageWaitTime,
      serviceLevel,
      efficiency,
      availability,
      productivity,
      firstCallResolution,
      customerSatisfaction,
      adherence,
      ranking,
      percentile,
      trend,
      improvement
    };
  }

  /**
   * Calcular Service Level (SL)
   */
  private calculateServiceLevel(calls: CallRecord[]): number {
    const answeredWithinTarget = calls.filter(c => 
      c.status === 'answered' && c.waitTime <= this.config.maxWaitTime
    ).length;
    
    const totalAnswered = calls.filter(c => c.status === 'answered').length;
    
    return totalAnswered > 0 ? (answeredWithinTarget / totalAnswered) * 100 : 0;
  }

  /**
   * Calcular Eficiência
   */
  private calculateEfficiency(calls: CallRecord[], totalTalkTime: number): number {
    const totalWorkTime = calls.length * 60; // 1 minuto por chamada em média
    const actualWorkTime = totalTalkTime;
    
    return totalWorkTime > 0 ? (actualWorkTime / totalWorkTime) * 100 : 0;
  }

  /**
   * Calcular Disponibilidade
   */
  private calculateAvailability(calls: CallRecord[]): number {
    const totalCalls = calls.length;
    const answeredCalls = calls.filter(c => c.status === 'answered').length;
    
    return totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
  }

  /**
   * Calcular Produtividade
   */
  private calculateProductivity(calls: CallRecord[], totalTalkTime: number): number {
    const workingMinutes = this.config.workingHours * 60 - this.config.breakTime * 60;
    const callsPerHour = calls.length / (this.config.workingHours - this.config.breakTime);
    
    return callsPerHour;
  }

  /**
   * Calcular First Call Resolution (FCR)
   */
  private calculateFirstCallResolution(calls: CallRecord[]): number {
    // Simulação baseada em duração da chamada
    const resolvedCalls = calls.filter(c => 
      c.status === 'answered' && c.duration > 120 // Mais de 2 minutos = resolvido
    ).length;
    
    const answeredCalls = calls.filter(c => c.status === 'answered').length;
    
    return answeredCalls > 0 ? (resolvedCalls / answeredCalls) * 100 : 0;
  }

  /**
   * Calcular Satisfação do Cliente
   */
  private calculateCustomerSatisfaction(calls: CallRecord[]): number {
    // Simulação baseada em duração e status
    const satisfiedCalls = calls.filter(c => 
      c.status === 'answered' && 
      c.duration > 60 && 
      c.duration < 600 && // Entre 1 e 10 minutos
      c.waitTime < 30
    ).length;
    
    const answeredCalls = calls.filter(c => c.status === 'answered').length;
    
    return answeredCalls > 0 ? (satisfiedCalls / answeredCalls) * 100 : 0;
  }

  /**
   * Calcular Adherence
   */
  private calculateAdherence(calls: CallRecord[]): number {
    // Simulação baseada em consistência de atendimento
    const consistentCalls = calls.filter(c => 
      c.status === 'answered' && c.duration > 30
    ).length;
    
    const totalCalls = calls.length;
    
    return totalCalls > 0 ? (consistentCalls / totalCalls) * 100 : 0;
  }

  /**
   * Calcular Ranking
   */
  private calculateRanking(operatorData: OperatorData): number {
    // Simulação baseada em métricas combinadas
    const metrics = this.calculateOperatorMetrics(operatorData);
    const score = (
      metrics.serviceLevel * 0.3 +
      metrics.efficiency * 0.25 +
      metrics.availability * 0.2 +
      metrics.productivity * 0.15 +
      metrics.customerSatisfaction * 0.1
    );
    
    return Math.round(score);
  }

  /**
   * Calcular Percentil
   */
  private calculatePercentile(operatorData: OperatorData): number {
    const ranking = this.calculateRanking(operatorData);
    return Math.min(100, Math.max(0, ranking));
  }

  /**
   * Calcular Tendência
   */
  private calculateTrend(periods: PeriodData[]): 'up' | 'down' | 'stable' {
    if (periods.length < 2) return 'stable';
    
    const recent = periods[periods.length - 1];
    const previous = periods[periods.length - 2];
    
    const recentScore = recent.efficiency;
    const previousScore = previous.efficiency;
    
    const difference = recentScore - previousScore;
    
    if (difference > 5) return 'up';
    if (difference < -5) return 'down';
    return 'stable';
  }

  /**
   * Calcular Melhoria
   */
  private calculateImprovement(periods: PeriodData[]): number {
    if (periods.length < 2) return 0;
    
    const recent = periods[periods.length - 1];
    const previous = periods[periods.length - 2];
    
    return recent.efficiency - previous.efficiency;
  }

  /**
   * Gerar dados de período
   */
  generatePeriodData(operatorData: OperatorData, period: string): PeriodData {
    const calls = operatorData.calls;
    const totalCalls = calls.length;
    const answeredCalls = calls.filter(c => c.status === 'answered').length;
    const missedCalls = calls.filter(c => c.status === 'missed').length;
    const abandonedCalls = calls.filter(c => c.status === 'abandoned').length;
    
    const totalDuration = calls
      .filter(c => c.status === 'answered')
      .reduce((sum, c) => sum + c.duration, 0);
    
    const averageDuration = answeredCalls > 0 ? totalDuration / answeredCalls : 0;
    
    const totalWaitTime = calls
      .filter(c => c.status === 'answered')
      .reduce((sum, c) => sum + c.waitTime, 0);
    
    const averageWaitTime = answeredCalls > 0 ? totalWaitTime / answeredCalls : 0;
    
    const serviceLevel = this.calculateServiceLevel(calls);
    const efficiency = this.calculateEfficiency(calls, totalDuration);
    
    return {
      period,
      startDate: this.getPeriodStartDate(period),
      endDate: this.getPeriodEndDate(period),
      totalCalls,
      answeredCalls,
      missedCalls,
      abandonedCalls,
      totalDuration,
      averageDuration,
      averageWaitTime,
      serviceLevel,
      efficiency
    };
  }

  /**
   * Obter métricas vazias
   */
  private getEmptyMetrics(): OperatorMetrics {
    return {
      totalCalls: 0,
      answeredCalls: 0,
      missedCalls: 0,
      abandonedCalls: 0,
      totalTalkTime: 0,
      averageTalkTime: 0,
      totalWaitTime: 0,
      averageWaitTime: 0,
      serviceLevel: 0,
      efficiency: 0,
      availability: 0,
      productivity: 0,
      firstCallResolution: 0,
      customerSatisfaction: 0,
      adherence: 0,
      ranking: 0,
      percentile: 0,
      trend: 'stable',
      improvement: 0
    };
  }

  /**
   * Obter data de início do período
   */
  private getPeriodStartDate(period: string): string {
    const today = new Date();
    switch (period) {
      case 'today':
        return today.toISOString().split('T')[0];
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return startOfWeek.toISOString().split('T')[0];
      case 'lastWeek':
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        return startOfLastWeek.toISOString().split('T')[0];
      case 'thisMonth':
        return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      case 'lastMonth':
        return new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
      default:
        return today.toISOString().split('T')[0];
    }
  }

  /**
   * Obter data de fim do período
   */
  private getPeriodEndDate(period: string): string {
    const today = new Date();
    switch (period) {
      case 'today':
      case 'yesterday':
        return today.toISOString().split('T')[0];
      case 'thisWeek':
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - today.getDay() + 6);
        return endOfWeek.toISOString().split('T')[0];
      case 'lastWeek':
        const endOfLastWeek = new Date(today);
        endOfLastWeek.setDate(today.getDate() - today.getDay() - 1);
        return endOfLastWeek.toISOString().split('T')[0];
      case 'thisMonth':
        return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      case 'lastMonth':
        return new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
      default:
        return today.toISOString().split('T')[0];
    }
  }

  /**
   * Atualizar configuração
   */
  updateConfig(newConfig: Partial<CalculationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obter configuração atual
   */
  getConfig(): CalculationConfig {
    return { ...this.config };
  }
}

export const advancedCalculationEngine = AdvancedCalculationEngine.getInstance();
export default advancedCalculationEngine;
