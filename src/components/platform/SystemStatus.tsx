import React from 'react';

interface SystemStatusProps {
  status: {
    api: 'online' | 'offline' | 'degraded';
    database: 'online' | 'offline' | 'degraded';
    storage: 'online' | 'offline' | 'degraded';
    performance: 'excellent' | 'good' | 'fair' | 'poor';
    lastCheck: Date;
  };
}

const SystemStatus: React.FC<SystemStatusProps> = ({ status }) => {
  const getStatusValue = (status: string) => {
    switch (status) {
      case 'online':
      case 'excellent':
        return 'ONLINE';
      case 'degraded':
      case 'good':
        return 'DEGRADED';
      case 'offline':
      case 'poor':
        return 'OFFLINE';
      case 'fair':
        return 'FAIR';
      default:
        return 'UNKNOWN';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'online':
      case 'excellent':
        return '';
      case 'degraded':
      case 'good':
        return 'degraded';
      case 'offline':
      case 'poor':
        return 'offline';
      case 'fair':
        return 'degraded';
      default:
        return 'offline';
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
    <div className="status-section">
      <div className="status-header">
        <h2 className="status-title">Status do Sistema</h2>
        <div className="status-timestamp">
          Última verificação: {formatTime(status.lastCheck)}
        </div>
      </div>

      <div className="status-grid">
        <div className="status-item">
          <div className={`status-indicator ${getStatusClass(status.api)}`}></div>
          <div className="status-label">API</div>
          <div className={`status-value ${getStatusClass(status.api)}`}>
            {getStatusValue(status.api)}
          </div>
        </div>

        <div className="status-item">
          <div className={`status-indicator ${getStatusClass(status.database)}`}></div>
          <div className="status-label">Database</div>
          <div className={`status-value ${getStatusClass(status.database)}`}>
            {getStatusValue(status.database)}
          </div>
        </div>

        <div className="status-item">
          <div className={`status-indicator ${getStatusClass(status.storage)}`}></div>
          <div className="status-label">Storage</div>
          <div className={`status-value ${getStatusClass(status.storage)}`}>
            {getStatusValue(status.storage)}
          </div>
        </div>

        <div className="status-item">
          <div className={`status-indicator ${getStatusClass(status.performance)}`}></div>
          <div className="status-label">Performance</div>
          <div className={`status-value ${getStatusClass(status.performance)}`}>
            {getStatusValue(status.performance)}
          </div>
        </div>
      </div>

      <div className="status-item">
        <div className="status-indicator"></div>
        <div className="status-label">Status Geral:</div>
        <div className="status-value">
          SISTEMA OPERACIONAL
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;