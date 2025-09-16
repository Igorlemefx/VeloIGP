import React, { useMemo } from 'react';
import AdvancedCharts from '../charts/AdvancedCharts';
import './AnalyticsDashboard.css';

interface AnalyticsData {
  totalCalls: number;
  avgTalkTime: number;
  avgAgentRating: number;
  avgSolutionRating: number;
  operators: Array<{
    name: string;
    calls: number;
    avgTalkTime: number;
    avgRating: number;
  }>;
  hourlyData: Array<{
    hour: string;
    calls: number;
  }>;
  dailyData: Array<{
    day: string;
    calls: number;
  }>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  period: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, period }) => {
  // Preparar dados para gráficos
  const chartData = useMemo(() => {
    // Dados de operadores para gráfico de barras
    const operatorsChartData = data.operators.map(op => ({
      name: op.name.length > 10 ? op.name.substring(0, 10) + '...' : op.name,
      value: op.calls,
      fullName: op.name
    }));

    // Dados de distribuição de chamadas por hora
    const hourlyChartData = data.hourlyData.map(h => ({
      name: h.hour,
      value: h.calls
    }));

    // Dados de distribuição por dia
    const dailyChartData = data.dailyData.map(d => ({
      name: d.day,
      value: d.calls
    }));

    // Dados de avaliações para gráfico radial
    const ratingsData = [
      { name: 'Atendimento', value: data.avgAgentRating, fill: '#3b82f6' },
      { name: 'Solução', value: data.avgSolutionRating, fill: '#10b981' }
    ];

    // Dados de performance geral
    const performanceData = [
      { name: 'Chamadas', value: data.totalCalls, fill: '#3b82f6' },
      { name: 'Tempo Médio', value: Math.round(data.avgTalkTime / 60), fill: '#10b981' },
      { name: 'Avaliação Atend.', value: data.avgAgentRating, fill: '#f59e0b' },
      { name: 'Avaliação Sol.', value: data.avgSolutionRating, fill: '#ef4444' }
    ];

    return {
      operators: operatorsChartData,
      hourly: hourlyChartData,
      daily: dailyChartData,
      ratings: ratingsData,
      performance: performanceData
    };
  }, [data]);

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Analytics Inteligentes</h2>
        <p>Análise detalhada para o período: {period}</p>
      </div>

      <div className="analytics-grid">
        {/* Gráfico de Performance Geral */}
        <div className="chart-section">
          <AdvancedCharts
            data={chartData.performance}
            type="bar"
            title="Indicadores de Performance"
            height={250}
          />
        </div>

        {/* Gráfico de Operadores */}
        <div className="chart-section">
          <AdvancedCharts
            data={chartData.operators}
            type="bar"
            title="Chamadas por Operador"
            height={250}
          />
        </div>

        {/* Gráfico de Distribuição Horária */}
        <div className="chart-section">
          <AdvancedCharts
            data={chartData.hourly}
            type="area"
            title="Distribuição de Chamadas por Hora"
            height={250}
          />
        </div>

        {/* Gráfico de Distribuição Diária */}
        <div className="chart-section">
          <AdvancedCharts
            data={chartData.daily}
            type="line"
            title="Tendência Diária"
            height={250}
          />
        </div>

        {/* Gráfico de Avaliações */}
        <div className="chart-section">
          <AdvancedCharts
            data={chartData.ratings}
            type="radial"
            title="Avaliações de Qualidade"
            height={250}
          />
        </div>

        {/* Gráfico de Distribuição de Chamadas */}
        <div className="chart-section">
          <AdvancedCharts
            data={[
              { name: 'Atendidas', value: data.totalCalls, fill: '#10b981' },
              { name: 'Perdidas', value: Math.round(data.totalCalls * 0.1), fill: '#ef4444' }
            ]}
            type="pie"
            title="Distribuição de Chamadas"
            height={250}
          />
        </div>
      </div>

      {/* Métricas Resumidas */}
      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-phone"></i>
          </div>
          <div className="summary-content">
            <h3>{data.totalCalls.toLocaleString()}</h3>
            <p>Total de Chamadas</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="summary-content">
            <h3>{Math.round(data.avgTalkTime / 60)}min</h3>
            <p>Tempo Médio</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="summary-content">
            <h3>{data.avgAgentRating.toFixed(1)}</h3>
            <p>Avaliação Atendimento</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="summary-content">
            <h3>{data.avgSolutionRating.toFixed(1)}</h3>
            <p>Avaliação Solução</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
