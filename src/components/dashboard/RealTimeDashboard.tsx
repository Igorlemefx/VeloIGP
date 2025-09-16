import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import './RealTimeDashboard.css';

interface RealTimeData {
  totalCalls: number;
  activeOperators: number;
  averageWaitTime: number;
  efficiency: number;
  lastUpdate: Date;
  alerts: number;
  status: 'online' | 'offline' | 'warning';
}

const RealTimeDashboard: React.FC = () => {
  const [data, setData] = useState<RealTimeData>({
    totalCalls: 0,
    activeOperators: 0,
    averageWaitTime: 0,
    efficiency: 0,
    lastUpdate: new Date(),
    alerts: 0,
    status: 'online'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadRealTimeData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRealTimeData = async () => {
    try {
      setIsLoading(true);
      
      // Simular dados em tempo real
      const newData: RealTimeData = {
        totalCalls: Math.floor(Math.random() * 1000) + 500,
        activeOperators: Math.floor(Math.random() * 20) + 10,
        averageWaitTime: Math.floor(Math.random() * 300) + 60,
        efficiency: Math.floor(Math.random() * 30) + 70,
        lastUpdate: new Date(),
        alerts: Math.floor(Math.random() * 5),
        status: Math.random() > 0.1 ? 'online' : 'warning'
      };

      setData(newData);
      setLastRefresh(new Date());

      // Verificar alertas
      checkAlerts(newData);

      // Salvar no cache
      // Cache local para dados em tempo real
      localStorage.setItem('realtime_data', JSON.stringify(newData));

    } catch (error) {
      console.error('Erro ao carregar dados em tempo real:', error);
      notificationService.showError('Erro de Conexão', 'Falha ao carregar dados em tempo real');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAlerts = (data: RealTimeData) => {
    // Alertas de eficiência
    if (data.efficiency < 75) {
      notificationService.showWarning(
        'Eficiência Baixa',
        `Eficiência atual: ${data.efficiency}%`
      );
    }

    // Alertas de tempo de espera
    if (data.averageWaitTime > 300) {
      notificationService.showWarning(
        'Tempo de Espera Alto',
        `Tempo médio: ${Math.floor(data.averageWaitTime / 60)} minutos`
      );
    }

    // Alertas de operadores
    if (data.activeOperators < 5) {
      notificationService.showError(
        'Poucos Operadores Ativos',
        `Apenas ${data.activeOperators} operadores ativos`
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'offline': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return 'fas fa-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'offline': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="realtime-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h2>
            <i className="fas fa-tachometer-alt"></i>
            Dashboard em Tempo Real
          </h2>
          <p>Dados atualizados automaticamente a cada 30 segundos</p>
        </div>
        
        <div className="header-right">
          <div className="status-indicator">
            <i 
              className={getStatusIcon(data.status)}
              style={{ color: getStatusColor(data.status) }}
            ></i>
            <span>Status: {data.status.toUpperCase()}</span>
          </div>
          
          <button 
            className="refresh-btn"
            onClick={loadRealTimeData}
            disabled={isLoading}
          >
            <i className={`fas fa-sync-alt ${isLoading ? 'spinning' : ''}`}></i>
            Atualizar
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-phone"></i>
          </div>
          <div className="metric-content">
            <div className="metric-label">Total de Chamadas</div>
            <div className="metric-value">{data.totalCalls.toLocaleString()}</div>
            <div className="metric-trend">
              <i className="fas fa-arrow-up"></i>
              +12% vs ontem
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="metric-content">
            <div className="metric-label">Operadores Ativos</div>
            <div className="metric-value">{data.activeOperators}</div>
            <div className="metric-trend">
              <i className="fas fa-arrow-up"></i>
              +2 vs ontem
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="metric-content">
            <div className="metric-label">Tempo Médio de Espera</div>
            <div className="metric-value">{Math.floor(data.averageWaitTime / 60)}min</div>
            <div className="metric-trend">
              <i className="fas fa-arrow-down"></i>
              -5min vs ontem
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="metric-content">
            <div className="metric-label">Eficiência</div>
            <div className="metric-value">{data.efficiency}%</div>
            <div className="metric-trend">
              <i className="fas fa-arrow-up"></i>
              +3% vs ontem
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="last-update">
          <i className="fas fa-clock"></i>
          Última atualização: {formatTime(lastRefresh)}
        </div>
        
        <div className="alerts-count">
          <i className="fas fa-bell"></i>
          {data.alerts} alertas ativos
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;


