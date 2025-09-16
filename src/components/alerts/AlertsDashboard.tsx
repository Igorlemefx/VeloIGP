import React, { useState, useEffect } from 'react';
import VeloigpCard from '../ui/VeloigpCard';
import './AlertsDashboard.css';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  operator?: string;
  queue?: string;
  resolved: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface AlertsDashboardProps {
  className?: string;
}

const AlertsDashboard: React.FC<AlertsDashboardProps> = ({ className = '' }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  // const [isLoading, setIsLoading] = useState(false);

  // Gerar alertas de exemplo
  useEffect(() => {
    generateMockAlerts();
  }, []);

  const generateMockAlerts = () => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Taxa de Abandono Alta',
        message: 'A taxa de abandono da fila de Vendas está em 25%, acima do limite de 20%',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
        operator: 'Sistema',
        queue: 'Vendas',
        resolved: false,
        priority: 'high'
      },
      {
        id: '2',
        type: 'error',
        title: 'Operador Offline',
        message: 'Ana Silva está offline há mais de 2 horas durante o horário comercial',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
        operator: 'Ana Silva',
        queue: 'Suporte',
        resolved: false,
        priority: 'critical'
      },
      {
        id: '3',
        type: 'info',
        title: 'Pico de Chamadas',
        message: 'Volume de chamadas 40% acima da média nas últimas 2 horas',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 min atrás
        operator: 'Sistema',
        queue: 'Geral',
        resolved: true,
        priority: 'medium'
      },
      {
        id: '4',
        type: 'success',
        title: 'Meta Atingida',
        message: 'Meta de atendimento de 95% foi atingida hoje',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min atrás
        operator: 'Sistema',
        queue: 'Geral',
        resolved: true,
        priority: 'low'
      },
      {
        id: '5',
        type: 'warning',
        title: 'Tempo de Espera Alto',
        message: 'Tempo médio de espera em 8 minutos, acima do ideal de 5 minutos',
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 min atrás
        operator: 'Sistema',
        queue: 'Financeiro',
        resolved: false,
        priority: 'medium'
      }
    ];

    setAlerts(mockAlerts);
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'fas fa-exclamation-triangle';
      case 'warning': return 'fas fa-exclamation-circle';
      case 'info': return 'fas fa-info-circle';
      case 'success': return 'fas fa-check-circle';
      default: return 'fas fa-bell';
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical': return 'var(--velotax-error)';
      case 'high': return 'var(--velotax-orange)';
      case 'medium': return 'var(--velotax-teal)';
      case 'low': return 'var(--velotax-blue)';
      default: return 'var(--velotax-text-secondary)';
    }
  };

  const getTypeColor = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'var(--velotax-error)';
      case 'warning': return 'var(--velotax-orange)';
      case 'info': return 'var(--velotax-blue)';
      case 'success': return 'var(--velotax-teal)';
      default: return 'var(--velotax-text-secondary)';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return 'Agora';
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      )
    );
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearResolved = () => {
    setAlerts(prev => prev.filter(alert => !alert.resolved));
  };

  const filteredAlerts = alerts.filter(alert => {
    const statusMatch = filter === 'all' || 
      (filter === 'unresolved' && !alert.resolved) || 
      (filter === 'resolved' && alert.resolved);
    
    const priorityMatch = priorityFilter === 'all' || alert.priority === priorityFilter;
    
    return statusMatch && priorityMatch;
  });

  const unresolvedCount = alerts.filter(alert => !alert.resolved).length;
  const criticalCount = alerts.filter(alert => !alert.resolved && alert.priority === 'critical').length;

  return (
    <div className={`alerts-dashboard ${className}`}>
      <div className="alerts-header">
        <div className="alerts-title">
          <h2>
            <i className="fas fa-bell"></i>
            Central de Alertas
          </h2>
          <div className="alerts-stats">
            <span className="stat-item unresolved">
              <i className="fas fa-exclamation-circle"></i>
              {unresolvedCount} Pendentes
            </span>
            <span className="stat-item critical">
              <i className="fas fa-exclamation-triangle"></i>
              {criticalCount} Críticos
            </span>
          </div>
        </div>

        <div className="alerts-actions">
          <div className="filters">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">Todos</option>
              <option value="unresolved">Pendentes</option>
              <option value="resolved">Resolvidos</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="critical">Crítico</option>
              <option value="high">Alto</option>
              <option value="medium">Médio</option>
              <option value="low">Baixo</option>
            </select>
          </div>

          <button
            className="btn btn-secondary"
            onClick={clearResolved}
            disabled={alerts.filter(alert => alert.resolved).length === 0}
          >
            <i className="fas fa-trash"></i>
            Limpar Resolvidos
          </button>
        </div>
      </div>

      <div className="alerts-content">
        {filteredAlerts.length === 0 ? (
          <VeloigpCard className="no-alerts">
            <div className="no-alerts-content">
              <i className="fas fa-check-circle"></i>
              <h3>Nenhum alerta encontrado</h3>
              <p>Não há alertas que correspondam aos filtros selecionados.</p>
            </div>
          </VeloigpCard>
        ) : (
          <div className="alerts-list">
            {filteredAlerts.map(alert => (
              <VeloigpCard key={alert.id} className={`alert-item ${alert.resolved ? 'resolved' : ''}`}>
                <div className="alert-content">
                  <div className="alert-icon">
                    <i 
                      className={getAlertIcon(alert.type)}
                      style={{ color: getTypeColor(alert.type) }}
                    ></i>
                  </div>

                  <div className="alert-details">
                    <div className="alert-header">
                      <h4 className="alert-title">{alert.title}</h4>
                      <div className="alert-meta">
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(alert.priority) }}
                        >
                          {alert.priority.toUpperCase()}
                        </span>
                        <span className="timestamp">{formatTimestamp(alert.timestamp)}</span>
                      </div>
                    </div>

                    <p className="alert-message">{alert.message}</p>

                    <div className="alert-footer">
                      <div className="alert-info">
                        {alert.operator && (
                          <span className="info-item">
                            <i className="fas fa-user"></i>
                            {alert.operator}
                          </span>
                        )}
                        {alert.queue && (
                          <span className="info-item">
                            <i className="fas fa-list"></i>
                            {alert.queue}
                          </span>
                        )}
                      </div>

                      <div className="alert-actions">
                        {!alert.resolved && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <i className="fas fa-check"></i>
                            Resolver
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </VeloigpCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsDashboard;