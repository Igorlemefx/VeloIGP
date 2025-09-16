import React from 'react';
import './VelotaxLoading.css';

interface VelotaxLoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  showMessage?: boolean;
  variant?: 'primary' | 'secondary' | 'minimal';
}

const VelotaxLoading: React.FC<VelotaxLoadingProps> = ({
  size = 'medium',
  message = 'Carregando...',
  showMessage = true,
  variant = 'primary'
}) => {
  return (
    <div className={`velotax-loading velotax-loading--${size} velotax-loading--${variant}`}>
      <div className="velotax-spinner">
        <div className="spinner-ring spinner-ring--1"></div>
        <div className="spinner-ring spinner-ring--2"></div>
        <div className="spinner-ring spinner-ring--3"></div>
        <div className="spinner-center">
          <div className="velotax-logo">
            <div className="logo-circle"></div>
            <div className="logo-dot"></div>
          </div>
        </div>
      </div>
      
      {showMessage && (
        <div className="velotax-loading-message">
          <span className="loading-text">{message}</span>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VelotaxLoading;


