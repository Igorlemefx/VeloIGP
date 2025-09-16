import React from 'react';

interface PlatformMetricsProps {
  data: {
    totalUsers: number;
    activeUsers: number;
    totalCalls: number;
    systemUptime: string;
    dataProcessed: string;
    lastUpdate: Date;
  };
}

const PlatformMetrics: React.FC<PlatformMetricsProps> = ({ data }) => {
  const formatUptime = (uptime: string) => {
    const days = Math.floor(parseInt(uptime) / (24 * 60 * 60));
    const hours = Math.floor((parseInt(uptime) % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((parseInt(uptime) % (60 * 60)) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatDataSize = (size: string) => {
    const bytes = parseInt(size);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-card-header">
          <div className="metric-card-icon primary">
            <i className="fas fa-users"></i>
          </div>
          <div className="metric-card-title">USUÁRIOS</div>
        </div>
        <div className="metric-card-value">{data.totalUsers}</div>
        <div className="metric-card-subtitle">
          {data.activeUsers} ativos agora
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-header">
          <div className="metric-card-icon primary">
            <i className="fas fa-phone"></i>
          </div>
          <div className="metric-card-title">CHAMADAS</div>
        </div>
        <div className="metric-card-value">{data.totalCalls.toLocaleString()}</div>
        <div className="metric-card-subtitle">
          Total processadas
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-header">
          <div className="metric-card-icon success">
            <i className="fas fa-clock"></i>
          </div>
          <div className="metric-card-title">UPTIME</div>
        </div>
        <div className="metric-card-value">{formatUptime(data.systemUptime)}</div>
        <div className="metric-card-subtitle">
          Sistema online
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-header">
          <div className="metric-card-icon success">
            <i className="fas fa-database"></i>
          </div>
          <div className="metric-card-title">DADOS</div>
        </div>
        <div className="metric-card-value">{formatDataSize(data.dataProcessed)}</div>
        <div className="metric-card-subtitle">
          Processados hoje
        </div>
      </div>
    </div>
  );
};

export default PlatformMetrics;