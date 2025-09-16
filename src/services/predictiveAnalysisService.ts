// Serviço de Análise Preditiva - VeloIGP

interface HistoricalData {
  date: string;
  calls: number;
  efficiency: number;
  waitTime: number;
  operators: number;
}

interface PredictionData {
  period: string;
  predictedCalls: number;
  predictedEfficiency: number;
  predictedWaitTime: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

interface TrendAnalysis {
  calls: {
    current: number;
    previous: number;
    change: number;
    percentage: number;
  };
  efficiency: {
    current: number;
    previous: number;
    change: number;
    percentage: number;
  };
  waitTime: {
    current: number;
    previous: number;
    change: number;
    percentage: number;
  };
}

class PredictiveAnalysisService {
  private historicalData: HistoricalData[] = [];
  private predictions: PredictionData[] = [];

  constructor() {
    this.generateMockHistoricalData();
    this.generatePredictions();
  }

  // Gerar dados históricos simulados
  private generateMockHistoricalData(): void {
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      this.historicalData.push({
        date: date.toISOString().split('T')[0],
        calls: Math.floor(Math.random() * 200) + 800,
        efficiency: Math.floor(Math.random() * 20) + 75,
        waitTime: Math.floor(Math.random() * 120) + 60,
        operators: Math.floor(Math.random() * 10) + 15
      });
    }
  }

  // Gerar previsões baseadas em dados históricos
  private generatePredictions(): void {
    const periods = [
      { label: 'Próxima Hora', hours: 1 },
      { label: 'Próximas 4 Horas', hours: 4 },
      { label: 'Próximo Dia', hours: 24 },
      { label: 'Próxima Semana', hours: 168 }
    ];

    periods.forEach(period => {
      const baseCalls = this.historicalData[this.historicalData.length - 1].calls;
      const baseEfficiency = this.historicalData[this.historicalData.length - 1].efficiency;
      const baseWaitTime = this.historicalData[this.historicalData.length - 1].waitTime;

      // Simular previsões com variação baseada no período
      const variation = period.hours / 24; // Maior variação para períodos maiores
      
      this.predictions.push({
        period: period.label,
        predictedCalls: Math.floor(baseCalls * (1 + (Math.random() - 0.5) * variation)),
        predictedEfficiency: Math.max(0, Math.min(100, baseEfficiency + (Math.random() - 0.5) * 10 * variation)),
        predictedWaitTime: Math.max(0, baseWaitTime + (Math.random() - 0.5) * 60 * variation),
        confidence: Math.max(0.6, 1 - variation * 0.3), // Menor confiança para períodos maiores
        trend: this.calculateTrend(baseCalls, baseEfficiency)
      });
    });
  }

  // Calcular tendência baseada nos dados
  private calculateTrend(calls: number, efficiency: number): 'up' | 'down' | 'stable' {
    const recentData = this.historicalData.slice(-7); // Últimos 7 dias
    const avgCalls = recentData.reduce((sum, d) => sum + d.calls, 0) / recentData.length;
    const avgEfficiency = recentData.reduce((sum, d) => sum + d.efficiency, 0) / recentData.length;

    const callsChange = (calls - avgCalls) / avgCalls;
    const efficiencyChange = (efficiency - avgEfficiency) / avgEfficiency;

    if (callsChange > 0.1 && efficiencyChange > 0.05) return 'up';
    if (callsChange < -0.1 || efficiencyChange < -0.05) return 'down';
    return 'stable';
  }

  // Obter análise de tendências
  public getTrendAnalysis(): TrendAnalysis {
    const current = this.historicalData[this.historicalData.length - 1];
    const previous = this.historicalData[this.historicalData.length - 2];

    const calculateChange = (current: number, previous: number) => {
      const change = current - previous;
      const percentage = previous !== 0 ? (change / previous) * 100 : 0;
      return { current, previous, change, percentage };
    };

    return {
      calls: calculateChange(current.calls, previous.calls),
      efficiency: calculateChange(current.efficiency, previous.efficiency),
      waitTime: calculateChange(current.waitTime, previous.waitTime)
    };
  }

  // Obter previsões
  public getPredictions(): PredictionData[] {
    return [...this.predictions];
  }

  // Obter dados históricos
  public getHistoricalData(): HistoricalData[] {
    return [...this.historicalData];
  }

  // Obter insights baseados em padrões
  public getInsights(): string[] {
    const insights: string[] = [];
    const trend = this.getTrendAnalysis();

    // Insights de chamadas
    if (trend.calls.percentage > 10) {
      insights.push(`📈 Volume de chamadas aumentou ${trend.calls.percentage.toFixed(1)}% em relação ao dia anterior`);
    } else if (trend.calls.percentage < -10) {
      insights.push(`📉 Volume de chamadas diminuiu ${Math.abs(trend.calls.percentage).toFixed(1)}% em relação ao dia anterior`);
    }

    // Insights de eficiência
    if (trend.efficiency.percentage > 5) {
      insights.push(`✅ Eficiência melhorou ${trend.efficiency.percentage.toFixed(1)}% em relação ao dia anterior`);
    } else if (trend.efficiency.percentage < -5) {
      insights.push(`⚠️ Eficiência diminuiu ${Math.abs(trend.efficiency.percentage).toFixed(1)}% em relação ao dia anterior`);
    }

    // Insights de tempo de espera
    if (trend.waitTime.percentage > 20) {
      insights.push(`⏰ Tempo de espera aumentou ${trend.waitTime.percentage.toFixed(1)}% - considere aumentar operadores`);
    } else if (trend.waitTime.percentage < -20) {
      insights.push(`🎉 Tempo de espera melhorou ${Math.abs(trend.waitTime.percentage).toFixed(1)}% - excelente performance`);
    }

    // Insights baseados em padrões
    const avgCalls = this.historicalData.reduce((sum, d) => sum + d.calls, 0) / this.historicalData.length;
    const currentCalls = this.historicalData[this.historicalData.length - 1].calls;

    if (currentCalls > avgCalls * 1.2) {
      insights.push(`🔥 Alto volume de chamadas detectado - ${currentCalls} chamadas hoje vs média de ${Math.floor(avgCalls)}`);
    }

    const avgEfficiency = this.historicalData.reduce((sum, d) => sum + d.efficiency, 0) / this.historicalData.length;
    const currentEfficiency = this.historicalData[this.historicalData.length - 1].efficiency;

    if (currentEfficiency > avgEfficiency * 1.1) {
      insights.push(`🌟 Performance excepcional - eficiência de ${currentEfficiency.toFixed(1)}% vs média de ${avgEfficiency.toFixed(1)}%`);
    }

    return insights;
  }

  // Obter recomendações baseadas em dados
  public getRecommendations(): string[] {
    const recommendations: string[] = [];
    const trend = this.getTrendAnalysis();
    const current = this.historicalData[this.historicalData.length - 1];

    // Recomendações baseadas em tendências
    if (trend.calls.percentage > 15) {
      recommendations.push('Considere aumentar o número de operadores para lidar com o alto volume');
    }

    if (trend.efficiency.percentage < -10) {
      recommendations.push('Implemente treinamento adicional para melhorar a eficiência dos operadores');
    }

    if (trend.waitTime.percentage > 30) {
      recommendations.push('Otimize o processo de atendimento para reduzir o tempo de espera');
    }

    // Recomendações baseadas em valores absolutos
    if (current.efficiency < 70) {
      recommendations.push('Eficiência baixa detectada - revise processos e forneça suporte aos operadores');
    }

    if (current.waitTime > 300) {
      recommendations.push('Tempo de espera muito alto - considere escalonamento ou melhoria de processos');
    }

    if (current.operators < 10) {
      recommendations.push('Número baixo de operadores ativos - considere aumentar a equipe');
    }

    return recommendations;
  }

  // Atualizar dados (simular nova entrada)
  public updateData(newData: Partial<HistoricalData>): void {
    const today = new Date().toISOString().split('T')[0];
    const lastData = this.historicalData[this.historicalData.length - 1];
    
    const updatedData: HistoricalData = {
      date: today,
      calls: newData.calls || lastData.calls,
      efficiency: newData.efficiency || lastData.efficiency,
      waitTime: newData.waitTime || lastData.waitTime,
      operators: newData.operators || lastData.operators
    };

    this.historicalData.push(updatedData);
    this.generatePredictions(); // Regenerar previsões
  }
}

// Instância singleton
const predictiveAnalysisService = new PredictiveAnalysisService();

export default predictiveAnalysisService;


