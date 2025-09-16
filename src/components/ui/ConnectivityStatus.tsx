import React from 'react';
import { usePWA } from '../../hooks/usePWA';
import './ConnectivityStatus.css';

const ConnectivityStatus: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="connectivity-status">
      <div className="connectivity-content">
        <div className="connectivity-icon">
          <i className="fas fa-wifi"></i>
        </div>
        <div className="connectivity-text">
          <span>Modo Offline</span>
          <small>Algumas funcionalidades podem estar limitadas</small>
        </div>
      </div>
    </div>
  );
};

export default ConnectivityStatus;


