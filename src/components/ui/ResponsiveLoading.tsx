import React, { useState, useEffect } from 'react';
import './ResponsiveLoading.css';

interface ResponsiveLoadingProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  onTimeout?: () => void;
  timeout?: number;
}

const ResponsiveLoading: React.FC<ResponsiveLoadingProps> = ({
  isLoading,
  message = 'Carregando...',
  progress = 0,
  onTimeout,
  timeout = 10000
}) => {
  const [dots, setDots] = useState('');
  const [showTimeout, setShowTimeout] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    // Animação de pontos
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Timer de progresso
    const progressInterval = setInterval(() => {
      setElapsedTime(prev => prev + 100);
    }, 100);

    // Timeout
    const timeoutId = setTimeout(() => {
      setShowTimeout(true);
      onTimeout?.();
    }, timeout);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
    };
  }, [isLoading, timeout, onTimeout]);

  if (!isLoading) return null;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="responsive-loading-overlay">
      <div className="responsive-loading-container">
        <div className="responsive-loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        
        <div className="responsive-loading-content">
          <h3 className="loading-title">
            {message}
            <span className="loading-dots">{dots}</span>
          </h3>
          
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
          
          <div className="loading-info">
            <span className="loading-time">
              <i className="fas fa-clock"></i>
              {formatTime(elapsedTime)}
            </span>
            <span className="loading-status">
              <i className="fas fa-info-circle"></i>
              Carregando dados...
            </span>
          </div>
          
          {showTimeout && (
            <div className="loading-timeout">
              <i className="fas fa-exclamation-triangle"></i>
              <p>Carregamento está demorando mais que o esperado...</p>
              <button 
                className="btn-retry"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-refresh"></i>
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLoading;



