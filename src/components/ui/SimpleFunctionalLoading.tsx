// Loading Simples e Funcional
// Design limpo, rápido e eficiente

import React from 'react';
import './SimpleFunctionalLoading.css';

interface SimpleFunctionalLoadingProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

const SimpleFunctionalLoading: React.FC<SimpleFunctionalLoadingProps> = ({
  message = 'Carregando...',
  showProgress = false,
  progress = 0
}) => {
  return (
    <div className="simple-loading">
      <div className="loading-content">
        {/* Spinner simples */}
        <div className="spinner"></div>
        
        {/* Mensagem */}
        <p className="message">{message}</p>
        
        {/* Progresso opcional */}
        {showProgress && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleFunctionalLoading;



