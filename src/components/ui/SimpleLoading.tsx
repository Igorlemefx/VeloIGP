import React from 'react';
import './SimpleLoading.css';

interface SimpleLoadingProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  isCached?: boolean;
  loadTime?: number;
}

const SimpleLoading: React.FC<SimpleLoadingProps> = ({
  isLoading,
  message = 'Carregando...',
  progress = 0,
  isCached = false,
  loadTime = 0
}) => {
  if (!isLoading) return null;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="simple-loading-overlay">
      <div className="simple-loading-container">
        <div className="simple-loading-spinner">
          <div className="spinner-circle"></div>
        </div>
        
        <div className="simple-loading-content">
          <h3 className="loading-title">{message}</h3>
          
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
          
          <div className="loading-status">
            <div className="status-item">
              <i className={isCached ? "fas fa-database" : "fas fa-cloud-download-alt"}></i>
              <span>{isCached ? 'Dados do cache' : 'Carregando dados'}</span>
            </div>
            
            {loadTime > 0 && (
              <div className="status-item">
                <i className="fas fa-clock"></i>
                <span>{formatTime(loadTime)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoading;



