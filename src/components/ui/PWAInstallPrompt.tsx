import React, { useState } from 'react';
import { usePWA } from '../../hooks/usePWA';
import './PWAInstallPrompt.css';

const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    await installApp();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Salvar no localStorage para não mostrar novamente
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">
          <i className="fas fa-mobile-alt"></i>
        </div>
        <div className="pwa-install-text">
          <h3>Instalar VeloIGP</h3>
          <p>Instale o app para uma experiência mais rápida e acesso offline</p>
        </div>
        <div className="pwa-install-actions">
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleInstall}
          >
            <i className="fas fa-download"></i>
            Instalar
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleDismiss}
          >
            <i className="fas fa-times"></i>
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;


