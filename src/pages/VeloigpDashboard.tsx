import React, { useState, useEffect } from 'react';
import SimpleFunctionalLoading from '../components/ui/SimpleFunctionalLoading';
import { useInstantData } from '../hooks/useInstantData';
import './VeloigpDashboard.css';

interface DashboardStats {
  totalChamadas: number;
  chamadasAtendidas: number;
  chamadasPerdidas: number;
  taxaAtendimento: number;
  tempoMedioAtendimento: number;
  tempoMedioEspera: number;
  satisfacaoMedia: number;
  periodo: {
    inicio: string;
    fim: string;
  };
}

const VeloigpDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [operadores, setOperadores] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [filas, setFilas] = useState<any[]>([]);

  // Hook de dados instantâneos
  const {
    data: cachedData,
    isLoading,
    error,
    isLoaded,
    reload,
    clearError
  } = useInstantData();

  useEffect(() => {
    if (cachedData) {
      setStats(cachedData.analysisData);
      setOperadores(cachedData.operatorProfiles);
      setPeriodos(cachedData.periodComparisons);
      setFilas(cachedData.queueAnalysis);
      console.log('✅ Dados do dashboard carregados com sucesso');
    }
  }, [cachedData]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };


  // Loading real
  if (isLoading && !isLoaded) {
    return (
      <SimpleFunctionalLoading
        message="Carregando dados do dashboard..."
        showProgress={true}
        progress={95}
      />
    );
  }

  if (error) {
    return (
      <div className="container-main">
        <div className="dashboard-error">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Erro ao Carregar Dados</h3>
          <p>{error}</p>
          <button onClick={reload}>
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
          <div className="period-info">
            <span>Período: {stats?.periodo.inicio} até {stats?.periodo.fim}</span>
          </div>
          <button onClick={reload}>
            <i className="fas fa-sync-alt"></i>
            Atualizar
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">
            <i className="fas fa-phone"></i>
          </div>
          <div className="metric-content">
            <h3>Total de Chamadas</h3>
            <div className="metric-value">{stats?.totalChamadas.toLocaleString() || 0}</div>
            <div className="metric-subtitle">Período completo</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">
            <i className="fas fa-phone-volume"></i>
          </div>
          <div className="metric-content">
            <h3>Chamadas Atendidas</h3>
            <div className="metric-value">{stats?.chamadasAtendidas.toLocaleString() || 0}</div>
            <div className="metric-rate">{stats?.taxaAtendimento.toFixed(1)}% de atendimento</div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">
            <i className="fas fa-phone-slash"></i>
          </div>
          <div className="metric-content">
            <h3>Chamadas Perdidas</h3>
            <div className="metric-value">{stats?.chamadasPerdidas.toLocaleString() || 0}</div>
            <div className="metric-rate">{(100 - (stats?.taxaAtendimento || 0)).toFixed(1)}% de perda</div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="metric-content">
            <h3>Tempo Médio de Espera</h3>
            <div className="metric-value">{formatTime(stats?.tempoMedioEspera || 0)}</div>
            <div className="metric-subtitle">Tempo médio na fila</div>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-icon">
            <i className="fas fa-microphone"></i>
          </div>
          <div className="metric-content">
            <h3>Tempo Médio de Atendimento</h3>
            <div className="metric-value">{formatTime(stats?.tempoMedioAtendimento || 0)}</div>
            <div className="metric-subtitle">Tempo médio de conversa</div>
          </div>
        </div>

        <div className="metric-card accent">
          <div className="metric-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="metric-content">
            <h3>Satisfação Média</h3>
            <div className="metric-value">{stats?.satisfacaoMedia.toFixed(1) || 0}</div>
            <div className="metric-subtitle">Avaliação de 1 a 5</div>
          </div>
        </div>
      </div>

      {/* Operadores */}
      <div className="dashboard-section">
        <h2>Performance dos Operadores</h2>
        <div className="operators-grid">
          {operadores.slice(0, 6).map((operador, index) => (
            <div key={index} className="operator-card">
              <div className="operator-header">
                <h4>{operador.nome}</h4>
                <div className="operator-status">
                  <span className={`status-badge ${operador.taxaAtendimento >= 90 ? 'excellent' : operador.taxaAtendimento >= 70 ? 'good' : 'regular'}`}>
                    {operador.taxaAtendimento.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="operator-stats">
                <div className="stat">
                  <span className="stat-label">Chamadas:</span>
                  <span className="stat-value">{operador.totalChamadas}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Atendidas:</span>
                  <span className="stat-value">{operador.chamadasAtendidas}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Satisfação:</span>
                  <span className="stat-value">{operador.satisfacaoMedia.toFixed(1)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Filas:</span>
                  <span className="stat-value">{operador.filas.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Análise por Períodos */}
      <div className="dashboard-section">
        <h2>Comparativo por Períodos</h2>
        <div className="periods-table">
          <table>
            <thead>
              <tr>
                <th>Período</th>
                <th>Total Chamadas</th>
                <th>Atendidas</th>
                <th>Taxa Atendimento</th>
                <th>Tempo Médio</th>
                <th>Satisfação</th>
              </tr>
            </thead>
            <tbody>
              {periodos.map((periodo, index) => (
                <tr key={index}>
                  <td>{periodo.periodo}</td>
                  <td>{periodo.totalChamadas}</td>
                  <td>{periodo.chamadasAtendidas}</td>
                  <td>{periodo.taxaAtendimento.toFixed(1)}%</td>
                  <td>{formatTime(periodo.tempoMedioAtendimento)}</td>
                  <td>{periodo.satisfacaoMedia.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análise por Filas */}
      <div className="dashboard-section">
        <h2>Performance por Filas</h2>
        <div className="queues-grid">
          {filas.map((fila, index) => (
            <div key={index} className="queue-card">
              <div className="queue-header">
                <h4>{fila.fila}</h4>
                <div className="queue-stats">
                  <span className="queue-calls">{fila.totalChamadas} chamadas</span>
                  <span className="queue-rate">{fila.taxaAtendimento.toFixed(1)}%</span>
                </div>
              </div>
              <div className="queue-details">
                <div className="detail">
                  <span>Atendidas:</span>
                  <span>{fila.chamadasAtendidas}</span>
                </div>
                <div className="detail">
                  <span>Tempo Espera:</span>
                  <span>{formatTime(fila.tempoMedioEspera)}</span>
                </div>
                <div className="detail">
                  <span>Satisfação:</span>
                  <span>{fila.satisfacaoMedia.toFixed(1)}</span>
                </div>
                <div className="detail">
                  <span>Operadores:</span>
                  <span>{fila.operadores.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VeloigpDashboard;
