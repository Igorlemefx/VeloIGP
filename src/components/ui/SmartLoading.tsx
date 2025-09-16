// @ts-nocheck
import React, { useState, useEffect } from 'react';
import './SmartLoading.css';

interface SmartLoadingProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  showProgress?: boolean;
  timeout?: number;
  onTimeout?: () => void;
}

const SmartLoading: React.FC<SmartLoadingProps> = ({
  isLoading,
  progress = 0,
  message = 'Carregando dados...',
  showProgress = true,
  timeout = 10000,
  onTimeout
}) => {
  const [dots, setDots] = useState('');
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    // Animação de pontos
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Timeout para mostrar mensagem de erro
    const timeoutId = setTimeout(() => {
      setShowTimeout(true);
      onTimeout?.();
    }, timeout);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(timeoutId);
    };
  }, [isLoading, timeout, onTimeout]);

  if (!isLoading) return null;

  return (
    <div className="smart-loading-overlay">
      <div className="smart-loading-container">
        <div className="smart-loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        
        <div className="smart-loading-content">
          <h3 className="loading-title">
            {message}
            <span className="loading-dots">{dots}</span>
          </h3>
          
          {showProgress && (
            <div className="loading-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <span className="progress-text">{progress}%</span>
            </div>
          )}
          
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

export default SmartLoading;



