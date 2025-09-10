import React, { useState, useEffect } from 'react';
import './VeloigpDashboard.css';

interface DashboardMetrics {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageWaitTime: number;
  peakHour: string;
  satisfactionRate: number;
  dailyTrend: number;
}

const VeloigpDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCalls: 0,
    answeredCalls: 0,
    missedCalls: 0,
    averageWaitTime: 0,
    peakHour: '00:00',
    satisfactionRate: 0,
    dailyTrend: 0
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Simular carregamento de dados da planilha
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dados simulados baseados em planilha 55PBX
      setMetrics({
        totalCalls: 1247,
        answeredCalls: 1156,
        missedCalls: 91,
        averageWaitTime: 2.3,
        peakHour: '14:30',
        satisfactionRate: 4.2,
        dailyTrend: 12.5
      });
      
      setLoading(false);
      setLastUpdate(new Date());
    };

    loadDashboardData();
  }, []);

  const answerRate = metrics.totalCalls > 0 ? (metrics.answeredCalls / metrics.totalCalls * 100).toFixed(1) : 0;
  const missRate = metrics.totalCalls > 0 ? (metrics.missedCalls / metrics.totalCalls * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="container-main">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Carregando dados da planilha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main">
      <div className="dashboard-header">
        <h1>Dashboard Geral - 55PBX</h1>
        <div className="last-update">
          <i className="fas fa-clock"></i>
          <span>Última atualização: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="metrics-grid">
        {/* Total de Chamadas */}
        <div className="metric-card primary">
          <div className="metric-icon">
            <i className="fas fa-phone"></i>
          </div>
          <div className="metric-content">
            <h3>Total de Chamadas</h3>
            <div className="metric-value">{metrics.totalCalls.toLocaleString()}</div>
            <div className="metric-trend positive">
              <i className="fas fa-arrow-up"></i>
              +{metrics.dailyTrend}% vs ontem
            </div>
          </div>
        </div>

        {/* Chamadas Atendidas */}
        <div className="metric-card success">
          <div className="metric-icon">
            <i className="fas fa-phone-volume"></i>
          </div>
          <div className="metric-content">
            <h3>Chamadas Atendidas</h3>
            <div className="metric-value">{metrics.answeredCalls.toLocaleString()}</div>
            <div className="metric-rate">{answerRate}% de atendimento</div>
          </div>
        </div>

        {/* Chamadas Perdidas */}
        <div className="metric-card warning">
          <div className="metric-icon">
            <i className="fas fa-phone-slash"></i>
          </div>
          <div className="metric-content">
            <h3>Chamadas Perdidas</h3>
            <div className="metric-value">{metrics.missedCalls.toLocaleString()}</div>
            <div className="metric-rate">{missRate}% de perda</div>
          </div>
        </div>

        {/* Tempo Médio de Espera */}
        <div className="metric-card info">
          <div className="metric-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="metric-content">
            <h3>Tempo Médio de Espera</h3>
            <div className="metric-value">{metrics.averageWaitTime} min</div>
            <div className="metric-subtitle">Tempo médio na fila</div>
          </div>
        </div>

        {/* Hora Pico */}
        <div className="metric-card secondary">
          <div className="metric-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="metric-content">
            <h3>Hora Pico</h3>
            <div className="metric-value">{metrics.peakHour}</div>
            <div className="metric-subtitle">Maior volume de chamadas</div>
          </div>
        </div>

        {/* Taxa de Satisfação */}
        <div className="metric-card accent">
          <div className="metric-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="metric-content">
            <h3>Satisfação</h3>
            <div className="metric-value">{metrics.satisfactionRate}/5</div>
            <div className="metric-subtitle">Avaliação média</div>
          </div>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="executive-summary">
        <h2>Resumo Executivo</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <h4>Performance Geral</h4>
            <p>
              O sistema apresentou <strong>{answerRate}% de taxa de atendimento</strong>, 
              com <strong>{metrics.totalCalls} chamadas</strong> processadas hoje.
            </p>
          </div>
          <div className="summary-item">
            <h4>Eficiência Operacional</h4>
            <p>
              Tempo médio de espera de <strong>{metrics.averageWaitTime} minutos</strong>, 
              com pico de atividade às <strong>{metrics.peakHour}</strong>.
            </p>
          </div>
          <div className="summary-item">
            <h4>Qualidade do Atendimento</h4>
            <p>
              Taxa de satisfação de <strong>{metrics.satisfactionRate}/5</strong>, 
              com <strong>{metrics.missedCalls} chamadas perdidas</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="quick-actions">
        <h3>Ações Rápidas</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <i className="fas fa-download"></i>
            Exportar Relatório
          </button>
          <button className="action-btn">
            <i className="fas fa-chart-bar"></i>
            Ver Detalhes
          </button>
          <button className="action-btn">
            <i className="fas fa-cog"></i>
            Configurar Alertas
          </button>
          <button className="action-btn">
            <i className="fas fa-sync"></i>
            Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default VeloigpDashboard;
