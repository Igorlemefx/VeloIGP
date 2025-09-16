// Analytics Service - Engine de Análise Avançada
// Sistema inteligente para análise de dados de telefonia

import { ProcessedCallData, OperatorMetrics, QueueMetrics, GeneralMetrics } from './dataProcessorService';

export interface TrendAnalysis {
  periodo: string;
  tendencia: 'crescimento' | 'decrescimento' | 'estavel';
  percentual: number;
  descricao: string;
  recomendacoes: string[];
}

export interface PerformanceInsight {
  tipo: 'alerta' | 'oportunidade' | 'destaque' | 'recomendacao';
  titulo: string;
  descricao: string;
  impacto: 'alto' | 'medio' | 'baixo';
  operador?: string;
  fila?: string;
  acao: string;
  prioridade: number;
}

export interface ComparativeAnalysis {
  metrica: string;
  atual: number;
  anterior: number;
  diferenca: number;
  percentual: number;
  tendencia: 'melhor' | 'pior' | 'igual';
  significancia: 'alta' | 'media' | 'baixa';
}

export interface DashboardData {
  resumo: {
    totalChamadas: number;
    taxaAtendimento: number;
    duracaoMedia: number;
    satisfacaoMedia: number;
    operadoresAtivos: number;
    filasAtivas: number;
  };
  topPerformers: {
    operadores: OperatorMetrics[];
    filas: QueueMetrics[];
  };
  alertas: PerformanceInsight[];
  tendencias: TrendAnalysis[];
  comparacoes: ComparativeAnalysis[];
  graficos: {
    chamadasPorHora: { hora: number; chamadas: number }[];
    chamadasPorDia: { dia: string; chamadas: number }[];
    performanceOperadores: { operador: string; eficiencia: number }[];
    distribuicaoStatus: { status: string; quantidade: number }[];
  };
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private insights: PerformanceInsight[] = [];
  private trends: TrendAnalysis[] = [];

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Gerar dashboard completo
   */
  async generateDashboard(
    processedData: ProcessedCallData[],
    operatorMetrics: OperatorMetrics[],
    queueMetrics: QueueMetrics[],
    generalMetrics: GeneralMetrics
  ): Promise<DashboardData> {
    console.log('📊 Gerando dashboard de analytics...');

    // Gerar insights
    this.insights = this.generateInsights(processedData, operatorMetrics, queueMetrics, generalMetrics);
    
    // Gerar tendências
    this.trends = this.generateTrends(processedData, generalMetrics);
    
    // Gerar comparações
    const comparacoes = this.generateComparisons(operatorMetrics, queueMetrics, generalMetrics);
    
    // Gerar dados para gráficos
    const graficos = this.generateChartData(processedData, operatorMetrics);

    return {
      resumo: {
        totalChamadas: generalMetrics.totalChamadas,
        taxaAtendimento: generalMetrics.taxaAtendimentoGeral,
        duracaoMedia: generalMetrics.duracaoMediaGeral,
        satisfacaoMedia: generalMetrics.satisfacaoMediaGeral,
        operadoresAtivos: generalMetrics.operadoresAtivos,
        filasAtivas: generalMetrics.filasAtivas
      },
      topPerformers: {
        operadores: operatorMetrics
          .sort((a, b) => b.eficiencia - a.eficiencia)
          .slice(0, 5),
        filas: queueMetrics
          .sort((a, b) => b.taxaAtendimento - a.taxaAtendimento)
          .slice(0, 3)
      },
      alertas: this.insights.filter(i => i.tipo === 'alerta'),
      tendencias: this.trends,
      comparacoes,
      graficos
    };
  }

  /**
   * Gerar insights de performance
   */
  private generateInsights(
    data: ProcessedCallData[],
    operators: OperatorMetrics[],
    queues: QueueMetrics[],
    general: GeneralMetrics
  ): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    // Análise de taxa de atendimento
    if (general.taxaAtendimentoGeral < 80) {
      insights.push({
        tipo: 'alerta',
        titulo: 'Taxa de Atendimento Baixa',
        descricao: `A taxa de atendimento está em ${general.taxaAtendimentoGeral}%, abaixo do ideal de 80%`,
        impacto: 'alto',
        acao: 'Revisar processos de atendimento e capacitação da equipe',
        prioridade: 1
      });
    } else if (general.taxaAtendimentoGeral > 95) {
      insights.push({
        tipo: 'destaque',
        titulo: 'Excelente Taxa de Atendimento',
        descricao: `Taxa de atendimento de ${general.taxaAtendimentoGeral}% está excelente!`,
        impacto: 'alto',
        acao: 'Manter os processos atuais e compartilhar boas práticas',
        prioridade: 3
      });
    }

    // Análise de operadores
    operators.forEach(operator => {
      if (operator.taxaAtendimento < 70) {
        insights.push({
          tipo: 'alerta',
          titulo: 'Operador com Baixa Performance',
          descricao: `${operator.operador} tem taxa de atendimento de ${operator.taxaAtendimento}%`,
          impacto: 'medio',
          operador: operator.operador,
          acao: 'Fornecer treinamento adicional e acompanhamento',
          prioridade: 2
        });
      } else if (operator.eficiencia > 90) {
        insights.push({
          tipo: 'destaque',
          titulo: 'Operador de Alto Desempenho',
          descricao: `${operator.operador} apresenta excelente eficiência de ${operator.eficiencia}%`,
          impacto: 'medio',
          operador: operator.operador,
          acao: 'Reconhecer performance e considerar como mentor',
          prioridade: 4
        });
      }
    });

    // Análise de filas
    queues.forEach(queue => {
      if (queue.taxaAtendimento < 75) {
        insights.push({
          tipo: 'alerta',
          titulo: 'Fila com Baixa Performance',
          descricao: `Fila ${queue.fila} tem taxa de atendimento de ${queue.taxaAtendimento}%`,
          impacto: 'medio',
          fila: queue.fila,
          acao: 'Revisar processos da fila e redistribuir recursos',
          prioridade: 2
        });
      }
    });

    // Análise de satisfação
    if (general.satisfacaoMediaGeral < 3.0) {
      insights.push({
        tipo: 'alerta',
        titulo: 'Satisfação do Cliente Baixa',
        descricao: `Satisfação média de ${general.satisfacaoMediaGeral.toFixed(1)} está abaixo do esperado`,
        impacto: 'alto',
        acao: 'Implementar programa de melhoria da experiência do cliente',
        prioridade: 1
      });
    }

    // Análise de duração média
    if (general.duracaoMediaGeral > 300) { // 5 minutos
      insights.push({
        tipo: 'oportunidade',
        titulo: 'Duração de Chamadas Longa',
        descricao: `Duração média de ${Math.round(general.duracaoMediaGeral / 60)} minutos pode ser otimizada`,
        impacto: 'medio',
        acao: 'Implementar scripts de atendimento e treinamento de eficiência',
        prioridade: 3
      });
    }

    // Análise de distribuição de chamadas
    const chamadasPorOperador = operators.map(op => op.totalChamadas);
    const mediaChamadas = chamadasPorOperador.reduce((a, b) => a + b, 0) / chamadasPorOperador.length;
    const desbalanceamento = chamadasPorOperador.some(total => Math.abs(total - mediaChamadas) > mediaChamadas * 0.3);

    if (desbalanceamento) {
      insights.push({
        tipo: 'oportunidade',
        titulo: 'Distribuição Desbalanceada de Chamadas',
        descricao: 'Alguns operadores recebem muito mais chamadas que outros',
        impacto: 'medio',
        acao: 'Implementar sistema de distribuição mais equilibrada',
        prioridade: 3
      });
    }

    return insights.sort((a, b) => a.prioridade - b.prioridade);
  }

  /**
   * Gerar análise de tendências
   */
  private generateTrends(data: ProcessedCallData[], general: GeneralMetrics): TrendAnalysis[] {
    const trends: TrendAnalysis[] = [];

    // Análise por dia da semana
    const chamadasPorDia = this.groupByDay(data);
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    diasSemana.forEach(dia => {
      const chamadas = chamadasPorDia[dia] || 0;
      if (chamadas > 0) {
        const media = Object.values(chamadasPorDia).reduce((a, b) => a + b, 0) / 7;
        const percentual = ((chamadas - media) / media) * 100;
        
        if (Math.abs(percentual) > 20) {
          trends.push({
            periodo: dia,
            tendencia: percentual > 0 ? 'crescimento' : 'decrescimento',
            percentual: Math.abs(percentual),
            descricao: `${dia} tem ${percentual > 0 ? 'mais' : 'menos'} ${Math.abs(percentual).toFixed(1)}% chamadas que a média`,
            recomendacoes: percentual > 0 
              ? ['Aumentar equipe nas segundas-feiras', 'Preparar scripts específicos para picos']
              : ['Reduzir equipe nas segundas-feiras', 'Focar em treinamento e capacitação']
          });
        }
      }
    });

    // Análise por período do dia
    const chamadasPorPeriodo = this.groupByPeriod(data);
    const periodos = ['manha', 'tarde', 'noite'];
    
    periodos.forEach(periodo => {
      const chamadas = chamadasPorPeriodo[periodo] || 0;
      if (chamadas > 0) {
        const media = Object.values(chamadasPorPeriodo).reduce((a, b) => a + b, 0) / 3;
        const percentual = ((chamadas - media) / media) * 100;
        
        if (Math.abs(percentual) > 30) {
          trends.push({
            periodo: periodo.charAt(0).toUpperCase() + periodo.slice(1),
            tendencia: percentual > 0 ? 'crescimento' : 'decrescimento',
            percentual: Math.abs(percentual),
            descricao: `Período da ${periodo} tem ${percentual > 0 ? 'mais' : 'menos'} ${Math.abs(percentual).toFixed(1)}% chamadas`,
            recomendacoes: percentual > 0 
              ? [`Aumentar equipe no período da ${periodo}`, 'Otimizar processos para picos']
              : [`Redistribuir equipe do período da ${periodo}`, 'Focar em outras atividades']
          });
        }
      }
    });

    return trends;
  }

  /**
   * Gerar comparações
   */
  private generateComparisons(
    operators: OperatorMetrics[],
    queues: QueueMetrics[],
    general: GeneralMetrics
  ): ComparativeAnalysis[] {
    const comparisons: ComparativeAnalysis[] = [];

    // Comparar operadores
    const mediaEficiencia = operators.reduce((sum, op) => sum + op.eficiencia, 0) / operators.length;
    operators.forEach(operator => {
      const diferenca = operator.eficiencia - mediaEficiencia;
      const percentual = (diferenca / mediaEficiencia) * 100;
      
      comparisons.push({
        metrica: `Eficiência - ${operator.operador}`,
        atual: operator.eficiencia,
        anterior: mediaEficiencia,
        diferenca,
        percentual,
        tendencia: diferenca > 0 ? 'melhor' : 'pior',
        significancia: Math.abs(percentual) > 20 ? 'alta' : Math.abs(percentual) > 10 ? 'media' : 'baixa'
      });
    });

    // Comparar filas
    const mediaTaxaFila = queues.reduce((sum, q) => sum + q.taxaAtendimento, 0) / queues.length;
    queues.forEach(queue => {
      const diferenca = queue.taxaAtendimento - mediaTaxaFila;
      const percentual = (diferenca / mediaTaxaFila) * 100;
      
      comparisons.push({
        metrica: `Taxa Atendimento - ${queue.fila}`,
        atual: queue.taxaAtendimento,
        anterior: mediaTaxaFila,
        diferenca,
        percentual,
        tendencia: diferenca > 0 ? 'melhor' : 'pior',
        significancia: Math.abs(percentual) > 15 ? 'alta' : Math.abs(percentual) > 8 ? 'media' : 'baixa'
      });
    });

    return comparisons;
  }

  /**
   * Gerar dados para gráficos
   */
  private generateChartData(data: ProcessedCallData[], operators: OperatorMetrics[]) {
    // Chamadas por hora
    const chamadasPorHora = Array.from({ length: 24 }, (_, i) => ({
      hora: i,
      chamadas: data.filter(call => call.timestamp.getHours() === i).length
    }));

    // Chamadas por dia
    const chamadasPorDia = this.groupByDay(data);
    const chamadasPorDiaArray = Object.entries(chamadasPorDia).map(([dia, chamadas]) => ({
      dia,
      chamadas
    }));

    // Performance dos operadores
    const performanceOperadores = operators.map(op => ({
      operador: op.operador,
      eficiencia: op.eficiencia
    }));

    // Distribuição de status
    const distribuicaoStatus = this.groupByStatus(data);

    return {
      chamadasPorHora,
      chamadasPorDia: chamadasPorDiaArray,
      performanceOperadores,
      distribuicaoStatus
    };
  }

  /**
   * Agrupar dados por dia da semana
   */
  private groupByDay(data: ProcessedCallData[]): { [key: string]: number } {
    const groups: { [key: string]: number } = {};
    data.forEach(call => {
      groups[call.diaSemana] = (groups[call.diaSemana] || 0) + 1;
    });
    return groups;
  }

  /**
   * Agrupar dados por período
   */
  private groupByPeriod(data: ProcessedCallData[]): { [key: string]: number } {
    const groups: { [key: string]: number } = {};
    data.forEach(call => {
      groups[call.periodo] = (groups[call.periodo] || 0) + 1;
    });
    return groups;
  }

  /**
   * Agrupar dados por status
   */
  private groupByStatus(data: ProcessedCallData[]): { status: string; quantidade: number }[] {
    const groups: { [key: string]: number } = {};
    data.forEach(call => {
      groups[call.status] = (groups[call.status] || 0) + 1;
    });
    return Object.entries(groups).map(([status, quantidade]) => ({
      status,
      quantidade
    }));
  }

  /**
   * Obter insights gerados
   */
  getInsights(): PerformanceInsight[] {
    return this.insights;
  }

  /**
   * Obter tendências geradas
   */
  getTrends(): TrendAnalysis[] {
    return this.trends;
  }

  /**
   * Filtrar insights por tipo
   */
  getInsightsByType(tipo: PerformanceInsight['tipo']): PerformanceInsight[] {
    return this.insights.filter(insight => insight.tipo === tipo);
  }

  /**
   * Obter insights por operador
   */
  getInsightsByOperator(operador: string): PerformanceInsight[] {
    return this.insights.filter(insight => insight.operador === operador);
  }

  /**
   * Obter insights por fila
   */
  getInsightsByQueue(fila: string): PerformanceInsight[] {
    return this.insights.filter(insight => insight.fila === fila);
  }

  /**
   * Limpar dados
   */
  clearData(): void {
    this.insights = [];
    this.trends = [];
  }
}

export const analyticsService = AnalyticsService.getInstance();
export default analyticsService;

