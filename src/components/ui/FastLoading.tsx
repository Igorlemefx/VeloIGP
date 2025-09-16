// @ts-nocheck
import React from 'react';
import './FastLoading.css';

interface FastLoadingProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

const FastLoading: React.FC<FastLoadingProps> = ({
  message = 'Carregando dados...',
  showProgress = false,
  progress = 0
}) => {
  return (
    <div className="fast-loading-overlay">
      <div className="fast-loading-container">
        <div className="fast-spinner">
          <div className="spinner-ring"></div>
        </div>
        
        <div className="fast-loading-content">
          <h3 className="fast-loading-title">{message}</h3>
          <p className="fast-loading-subtitle">Aguarde um momento...</p>
          
          {showProgress && (
            <div className="fast-progress">
              <div className="fast-progress-bar">
                <div 
                  className="fast-progress-fill" 
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FastLoading;
