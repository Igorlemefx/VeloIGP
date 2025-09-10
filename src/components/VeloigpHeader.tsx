import React from 'react';
import './VeloigpHeader.css';

interface VeloigpHeaderProps {
  currentPage: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const VeloigpHeader: React.FC<VeloigpHeaderProps> = ({ currentPage, theme, onToggleTheme }) => {
  const navigationItems = [
    { id: 'home', label: 'Início', path: '/' },
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'planilhas', label: 'Planilhas', path: '/planilhas' },
    { id: 'relatorios', label: 'Relatórios', path: '/relatorios' },
    { id: 'tempo-real', label: 'Tempo Real', path: '/tempo-real' },
    { id: 'config', label: 'Config', path: '/config' }
  ];

  return (
    <header className="veloigp-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <span className="logo-text">VeloIGP</span>
          </div>
        </div>
        
        <nav className="nav-menu">
          {navigationItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-right">
          <button 
            className="theme-toggle"
            onClick={onToggleTheme}
            title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
          >
            <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default VeloigpHeader;
