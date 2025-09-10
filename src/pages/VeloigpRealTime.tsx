import React, { useState, useEffect } from 'react';
import { calculationEngine } from '../services/calculationEngine';
import './VeloigpRealTime.css';

const VeloigpRealTime: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const initializeRealTime = async () => {
      setLoading(true);
      
      try {
        // Simular conexão com API
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsConnected(true);
        
        // Carregar dados em tempo real
        await loadRealTimeData();
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao conectar:', error);
        setIsConnected(false);
        setLoading(false);
      }
    };

    initializeRealTime();

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRealTimeData = async () => {
    try {
      const metrics = await calculationEngine.getRealTimeMetrics();
      setRealTimeData(metrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados em tempo real:', error);
    }
  };

  if (loading) {
    return (
      <div className="container-main">
        <div className="realtime-loading">
          <div className="loading-spinner"></div>
          <p>Conectando com API 55PBX...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main">
      <div className="realtime-header">
        <h1>Monitoramento em Tempo Real</h1>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          <div className="last-update">
            <i className="fas fa-clock"></i>
            <span>Última atualização: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {!isConnected ? (
        <div className="connection-error">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Erro de Conexão</h3>
          <p>Não foi possível conectar com a API 55PBX. Verifique sua conexão e tente novamente.</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            <i className="fas fa-sync-alt"></i>
            Tentar Novamente
          </button>
        </div>
      ) : (
        <div className="realtime-content">
          {/* Métricas Principais */}
          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-icon">
                <i className="fas fa-phone"></i>
              </div>
              <div className="metric-content">
                <h3>Chamadas Ativas</h3>
                <div className="metric-value">{realTimeData?.totalCalls || 0}</div>
                <div className="metric-subtitle">Última hora</div>
              </div>
            </div>

            <div className="metric-card success">
              <div className="metric-icon">
                <i className="fas fa-phone-volume"></i>
              </div>
              <div className="metric-content">
                <h3>Atendidas</h3>
                <div className="metric-value">{realTimeData?.answeredCalls || 0}</div>
                <div className="metric-rate">{realTimeData?.answerRate?.toFixed(1) || 0}% de atendimento</div>
              </div>
            </div>

            <div className="metric-card warning">
              <div className="metric-icon">
                <i className="fas fa-phone-slash"></i>
              </div>
              <div className="metric-content">
                <h3>Perdidas</h3>
                <div className="metric-value">{realTimeData?.missedCalls || 0}</div>
                <div className="metric-subtitle">Chamadas não atendidas</div>
              </div>
            </div>

            <div className="metric-card info">
              <div className="metric-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="metric-content">
                <h3>Tempo de Espera</h3>
                <div className="metric-value">{realTimeData?.averageWaitTime?.toFixed(1) || 0} min</div>
                <div className="metric-subtitle">Média atual</div>
              </div>
            </div>
          </div>

          {/* Status da Fila */}
          <div className="queue-status">
            <h2>Status da Fila</h2>
            <div className="queue-cards">
              <div className="queue-card">
                <h3>Fila Principal</h3>
                <div className="queue-metrics">
                  <div className="queue-metric">
                    <span className="label">Em espera:</span>
                    <span className="value">12</span>
                  </div>
                  <div className="queue-metric">
                    <span className="label">Tempo médio:</span>
                    <span className="value">2.3 min</span>
                  </div>
                </div>
              </div>

              <div className="queue-card">
                <h3>Fila VIP</h3>
                <div className="queue-metrics">
                  <div className="queue-metric">
                    <span className="label">Em espera:</span>
                    <span className="value">3</span>
                  </div>
                  <div className="queue-metric">
                    <span className="label">Tempo médio:</span>
                    <span className="value">0.8 min</span>
                  </div>
                </div>
              </div>

              <div className="queue-card">
                <h3>Fila Técnica</h3>
                <div className="queue-metrics">
                  <div className="queue-metric">
                    <span className="label">Em espera:</span>
                    <span className="value">7</span>
                  </div>
                  <div className="queue-metric">
                    <span className="label">Tempo médio:</span>
                    <span className="value">4.1 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do Dia */}
          <div className="daily-summary">
            <h2>Resumo do Dia</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <h4>Performance Geral</h4>
                <p>
                  <strong>{realTimeData?.answerRate?.toFixed(1) || 0}%</strong> de taxa de atendimento 
                  com <strong>{realTimeData?.totalCalls || 0} chamadas</strong> processadas hoje.
                </p>
              </div>
              <div className="summary-item">
                <h4>Qualidade do Atendimento</h4>
                <p>
                  Satisfação média de <strong>{realTimeData?.averageSatisfaction?.toFixed(1) || 0}/5</strong> 
                  com tempo médio de espera de <strong>{realTimeData?.averageWaitTime?.toFixed(1) || 0} minutos</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VeloigpRealTime;
