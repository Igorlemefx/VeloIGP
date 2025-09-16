// Componente de Loading Moderno
// Design elegante e profissional

import React from 'react';
import './ModernLoading.css';

interface ModernLoadingProps {
  message?: string;
  submessage?: string;
  showProgress?: boolean;
  progress?: number;
  size?: 'small' | 'medium' | 'large';
}

const ModernLoading: React.FC<ModernLoadingProps> = ({
  message = 'Carregando dados...',
  submessage = 'Aguarde um momento',
  showProgress = false,
  progress = 0,
  size = 'medium'
}) => {
  return (
    <div className={`modern-loading ${size}`}>
      <div className="loading-content">
        {/* Logo/Ícone */}
        <div className="loading-logo">
          <div className="logo-circle">
            <div className="logo-inner">
              <div className="logo-dot"></div>
            </div>
          </div>
        </div>

        {/* Spinner animado */}
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>

        {/* Mensagem principal */}
        <h3 className="loading-message">{message}</h3>
        
        {/* Submensagem */}
        <p className="loading-submessage">{submessage}</p>

        {/* Barra de progresso */}
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

        {/* Indicador de status */}
        <div className="loading-status">
          <div className="status-dot"></div>
          <span className="status-text">Conectando...</span>
        </div>
      </div>
    </div>
  );
};

export default ModernLoading;



