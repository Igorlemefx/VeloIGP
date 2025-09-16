import React from 'react';
import useMobileDetection from '../../hooks/useMobileDetection';
import TouchOptimized from '../ui/TouchOptimized';
import './EnhancedOperatorCard.css';

interface Operator {
  id: string;
  name: string;
  department: string;
  status: 'online' | 'offline' | 'busy';
  calls: number;
  satisfaction: number;
  efficiency: number;
  avgCallTime: number;
  avatar?: string;
}

interface EnhancedOperatorCardProps {
  operator: Operator;
  onViewProfile: (operatorId: string) => void;
  isSelected?: boolean;
  onSelect?: (operatorId: string) => void;
  showSelection?: boolean;
}

const EnhancedOperatorCard: React.FC<EnhancedOperatorCardProps> = ({
  operator,
  onViewProfile,
  isSelected = false,
  onSelect,
  showSelection = false
}) => {
  const { isMobile, screenSize } = useMobileDetection();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'var(--velotax-success)';
      case 'busy':
        return 'var(--velotax-warning)';
      case 'offline':
        return 'var(--velotax-text-secondary)';
      default:
        return 'var(--velotax-text-secondary)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return 'fas fa-circle';
      case 'busy':
        return 'fas fa-clock';
      case 'offline':
        return 'fas fa-circle';
      default:
        return 'fas fa-circle';
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'var(--velotax-success)';
    if (value >= 70) return 'var(--velotax-warning)';
    return 'var(--velotax-error)';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <TouchOptimized
      onTap={() => onViewProfile(operator.id)}
      onLongPress={() => onSelect?.(operator.id)}
      hapticFeedback={true}
      className={`enhanced-operator-card ${isSelected ? 'enhanced-operator-card--selected' : ''} ${isMobile ? 'enhanced-operator-card--mobile' : ''}`}
    >
      <div className="card-header">
        <div className="operator-avatar">
          <div className="avatar-circle">
            <i className="fas fa-user"></i>
          </div>
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor(operator.status) }}
          >
            <i className={getStatusIcon(operator.status)}></i>
          </div>
        </div>
        
        {showSelection && (
          <div className="selection-checkbox">
            <i className={`fas fa-${isSelected ? 'check-circle' : 'circle'}`}></i>
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="operator-info">
          <h3 className="operator-name">{operator.name}</h3>
          <p className="operator-department">{operator.department}</p>
        </div>

        <div className="performance-metrics">
          <div className="metric-item">
            <div className="metric-icon">
              <i className="fas fa-phone"></i>
            </div>
            <div className="metric-content">
              <div className="metric-value">{operator.calls}</div>
              <div className="metric-label">Chamadas</div>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="metric-content">
              <div 
                className="metric-value"
                style={{ color: getPerformanceColor(operator.satisfaction) }}
              >
                {operator.satisfaction}%
              </div>
              <div className="metric-label">Satisfação</div>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="metric-content">
              <div 
                className="metric-value"
                style={{ color: getPerformanceColor(operator.efficiency) }}
              >
                {operator.efficiency}%
              </div>
              <div className="metric-label">Eficiência</div>
            </div>
          </div>
        </div>

        <div className="performance-bar">
          <div className="bar-track">
            <div 
              className="bar-fill"
              style={{ 
                width: `${operator.efficiency}%`,
                backgroundColor: getPerformanceColor(operator.efficiency)
              }}
            ></div>
          </div>
          <div className="bar-label">
            Performance: {operator.efficiency}%
          </div>
        </div>

        <div className="additional-info">
          <div className="info-item">
            <i className="fas fa-clock"></i>
            <span>Tempo médio: {formatTime(operator.avgCallTime)}</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <TouchOptimized
          onTap={() => onViewProfile(operator.id)}
          hapticFeedback={true}
          className="view-profile-btn"
        >
          <i className="fas fa-eye"></i>
          <span>Ver Perfil</span>
        </TouchOptimized>
      </div>
    </TouchOptimized>
  );
};

export default EnhancedOperatorCard;
