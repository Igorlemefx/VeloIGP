import React, { useState, useEffect } from 'react';
import { spreadsheetDataService, DashboardData, PeriodOption } from '../services/spreadsheetDataService';
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('last-month');
  const [periodOptions, setPeriodOptions] = useState<PeriodOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carregar opções de período
    const loadPeriodOptions = () => {
      const options = spreadsheetDataService.getPeriodOptions();
      setPeriodOptions(options);
    };

    loadPeriodOptions();
  }, []);

  useEffect(() => {
    // Carregar dados do dashboard
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await spreadsheetDataService.loadDashboardData(selectedPeriod);
        setDashboardData(data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (periodOptions.length > 0) {
      loadDashboardData();
    }
  }, [selectedPeriod, periodOptions]);

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriod(periodId);
  };

  const answerRate = dashboardData?.metrics?.totalCalls && dashboardData.metrics.totalCalls > 0 
    ? (dashboardData.metrics.answeredCalls / dashboardData.metrics.totalCalls * 100).toFixed(1) 
    : 0;
  const missRate = dashboardData?.metrics?.totalCalls && dashboardData.metrics.totalCalls > 0 
    ? (dashboardData.metrics.missedCalls / dashboardData.metrics.totalCalls * 100).toFixed(1) 
    : 0;

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

  if (error) {
    return (
      <div className="container-main">
        <div className="dashboard-error">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Erro ao Carregar Dados</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            <i className="fas fa-sync-alt"></i>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main">
      <div className="dashboard-header">
        <h1>Dashboard Geral - 55PBX</h1>
        <div className="header-controls">
          <div className="period-selector">
            <label htmlFor="period-select">Período:</label>
            <select 
              id="period-select"
              value={selectedPeriod} 
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="period-select"
            >
              {periodOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="last-update">
            <i className="fas fa-clock"></i>
            <span>Última atualização: {dashboardData?.lastUpdate.toLocaleTimeString() || 'N/A'}</span>
          </div>
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
            <div className="metric-value">{dashboardData?.metrics.totalCalls.toLocaleString() || 0}</div>
            <div className="metric-trend positive">
              <i className="fas fa-arrow-up"></i>
              +{dashboardData?.metrics.dailyTrend || 0}% vs ontem
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
            <div className="metric-value">{dashboardData?.metrics.answeredCalls.toLocaleString() || 0}</div>
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
            <div className="metric-value">{dashboardData?.metrics.missedCalls.toLocaleString() || 0}</div>
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
            <div className="metric-value">{dashboardData?.metrics.averageWaitTime || 0} min</div>
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
            <div className="metric-value">{dashboardData?.metrics.peakHour || '00:00'}</div>
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
            <div className="metric-value">{dashboardData?.metrics.averageSatisfaction || 0}/5</div>
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
              com <strong>{dashboardData?.metrics.totalCalls || 0} chamadas</strong> processadas hoje.
            </p>
          </div>
          <div className="summary-item">
            <h4>Eficiência Operacional</h4>
            <p>
              Tempo médio de espera de <strong>{dashboardData?.metrics.averageWaitTime || 0} minutos</strong>, 
              com pico de atividade às <strong>{dashboardData?.metrics.peakHour || '00:00'}</strong>.
            </p>
          </div>
          <div className="summary-item">
            <h4>Qualidade do Atendimento</h4>
            <p>
              Taxa de satisfação de <strong>{dashboardData?.metrics.averageSatisfaction || 0}/5</strong>, 
              com <strong>{dashboardData?.metrics.missedCalls || 0} chamadas perdidas</strong>.
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
