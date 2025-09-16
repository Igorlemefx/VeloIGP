import React from 'react';
import './StandardLoading.css';

interface StandardLoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  progress?: number;
}

const StandardLoading: React.FC<StandardLoadingProps> = ({
  message = 'Carregando...',
  size = 'medium',
  showProgress = false,
  progress = 0
}) => {
  return (
    <div className={`standard-loading standard-loading--${size}`}>
      <div className="loading-spinner">
        <div className="spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
      </div>
      
      <div className="loading-content">
        <h3 className="loading-title">{message}</h3>
        
        {showProgress && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}
        
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default StandardLoading;


