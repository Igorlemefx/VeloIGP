import React from 'react';
import './UnifiedLoading.css';

interface UnifiedLoadingProps {
  isLoading: boolean;
  message?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

const UnifiedLoading: React.FC<UnifiedLoadingProps> = ({
  isLoading,
  message = 'Carregando...',
  variant = 'spinner',
  size = 'md',
  showProgress = false,
  progress = 0,
  className = ''
}) => {
  if (!isLoading) return null;

  const containerClasses = [
    'unified-loading',
    `unified-loading--${variant}`,
    `unified-loading--${size}`,
    className
  ].filter(Boolean).join(' ');

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="unified-spinner">
            <div className="spinner-ring"></div>
          </div>
        );
      
      case 'dots':
        return (
          <div className="unified-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className="unified-pulse">
            <div className="pulse-circle"></div>
          </div>
        );
      
      case 'skeleton':
        return (
          <div className="unified-skeleton">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={containerClasses}>
      <div className="unified-loading-content">
        {renderSpinner()}
        
        {message && (
          <div className="unified-loading-message">
            {message}
          </div>
        )}
        
        {showProgress && (
          <div className="unified-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedLoading;



