import React, { useState, useEffect } from 'react';
import './MobileOptimizedLayout.css';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  onBack,
  actions
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-layout">
      {/* Header Mobile */}
      <div className="mobile-header">
        <div className="mobile-header-content">
          {showBackButton && (
            <button className="mobile-back-btn" onClick={handleBack}>
              <i className="fas fa-arrow-left"></i>
            </button>
          )}
          
          <h1 className="mobile-title">{title}</h1>
          
          <div className="mobile-actions">
            {actions}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button 
                className="mobile-menu-close"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="mobile-menu-content">
              <a href="/dashboard" className="mobile-menu-item">
                <i className="fas fa-chart-pie"></i>
                Dashboard
              </a>
              <a href="/planilhas" className="mobile-menu-item">
                <i className="fas fa-table"></i>
                Planilhas
              </a>
              <a href="/relatorios" className="mobile-menu-item">
                <i className="fas fa-file-alt"></i>
                Relatórios
              </a>
              <a href="/tempo-real" className="mobile-menu-item">
                <i className="fas fa-clock"></i>
                Tempo Real
              </a>
              <a href="/config" className="mobile-menu-item">
                <i className="fas fa-cog"></i>
                Configurações
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Mobile */}
      <div className="mobile-content">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <a href="/dashboard" className="mobile-nav-item">
          <i className="fas fa-chart-pie"></i>
          <span>Dashboard</span>
        </a>
        <a href="/planilhas" className="mobile-nav-item">
          <i className="fas fa-table"></i>
          <span>Planilhas</span>
        </a>
        <a href="/relatorios" className="mobile-nav-item">
          <i className="fas fa-file-alt"></i>
          <span>Relatórios</span>
        </a>
        <a href="/tempo-real" className="mobile-nav-item">
          <i className="fas fa-clock"></i>
          <span>Tempo Real</span>
        </a>
      </div>
    </div>
  );
};

export default MobileOptimizedLayout;

