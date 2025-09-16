import React from 'react';

interface PlatformActivityProps {
  activity: {
    recentLogins: Array<{
      user: string;
      time: Date;
      location: string;
    }>;
    systemEvents: Array<{
      type: 'info' | 'warning' | 'error' | 'success';
      message: string;
      time: Date;
    }>;
    dataUsage: {
      today: number;
      yesterday: number;
      thisWeek: number;
      lastWeek: number;
    };
  };
}

const PlatformActivity: React.FC<PlatformActivityProps> = ({ activity }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'info':
        return 'fas fa-info-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'error':
        return 'fas fa-times-circle';
      case 'success':
        return 'fas fa-check-circle';
      default:
        return 'fas fa-circle';
    }
  };

  const getEventClass = (type: string) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDataSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="activity-section">
      <div className="activity-header">
        <h2 className="activity-title">Atividade da Plataforma</h2>
      </div>

      <div className="activity-grid">
        {/* Logins Recentes */}
        <div className="activity-column">
          <h3 className="activity-column-title">
            <i className="fas fa-user"></i>
            Logins Recentes
          </h3>
          {activity.recentLogins.map((login, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon info">
                <i className="fas fa-user"></i>
              </div>
              <div className="activity-content">
                <div className="activity-text">{login.user}</div>
                <div className="activity-time">
                  {login.location} - {formatTime(login.time)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Eventos do Sistema */}
        <div className="activity-column">
          <h3 className="activity-column-title">
            <i className="fas fa-bell"></i>
            Eventos do Sistema
          </h3>
          {activity.systemEvents.map((event, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-icon ${getEventClass(event.type)}`}>
                <i className={getEventIcon(event.type)}></i>
              </div>
              <div className="activity-content">
                <div className="activity-text">{event.message}</div>
                <div className="activity-time">
                  {formatDate(event.time)} - {formatTime(event.time)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Uso de Dados */}
        <div className="activity-column">
          <h3 className="activity-column-title">
            <i className="fas fa-chart-bar"></i>
            Uso de Dados
          </h3>
          <div className="activity-item">
            <div className="activity-content">
              <div className="activity-text">
                <strong>Hoje:</strong> {formatDataSize(activity.dataUsage.today)}
              </div>
              <div className="activity-time">
                +{calculatePercentage(activity.dataUsage.today, activity.dataUsage.yesterday)}%
              </div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-content">
              <div className="activity-text">
                <strong>Esta Semana:</strong> {formatDataSize(activity.dataUsage.thisWeek)}
              </div>
              <div className="activity-time">
                +{calculatePercentage(activity.dataUsage.thisWeek, activity.dataUsage.lastWeek)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformActivity;