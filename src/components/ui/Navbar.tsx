import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavbarSectionProps {
  children: React.ReactNode;
  className?: string;
}

interface NavbarItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  href: string;
  current?: boolean;
  className?: string;
}

interface NavbarDividerProps {
  className?: string;
}

interface NavbarSpacerProps {
  className?: string;
}

interface NavbarLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ children, className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <header className={`velotax-navbar ${className}`} data-theme={theme}>
      <nav className="navbar-container" aria-label="Global">
        {children}
        
        {/* Mobile Menu Button */}
        <div className="navbar-mobile-toggle">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-button"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">Abrir menu principal</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mobile-menu-icon"
            >
              <path
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-panel">
            <div className="mobile-menu-header">
              <div className="mobile-menu-logo">
                <div className="logo-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <span className="logo-text">VeloIGP</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-menu-close"
              >
                <span className="sr-only">Fechar menu</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mobile-menu-close-icon"
                >
                  <path
                    d="M6 18 18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="mobile-menu-content">
              <div className="mobile-menu-links">
                <a href="/" className="mobile-menu-link">
                  Início
                </a>
                <a href="/dashboard" className="mobile-menu-link">
                  Dashboard
                </a>
                <a href="/planilhas" className="mobile-menu-link">
                  Planilhas
                </a>
                <a href="/relatorios" className="mobile-menu-link">
                  Relatórios
                </a>
                <a href="/tempo-real" className="mobile-menu-link">
                  Tempo Real
                </a>
                <a href="/config" className="mobile-menu-link">
                  Configurações
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const NavbarSection: React.FC<NavbarSectionProps> = ({ children, className = '' }) => {
  return (
    <div className={`navbar-section ${className}`}>
      {children}
    </div>
  );
};

export const NavbarItem: React.FC<NavbarItemProps> = ({ 
  children, 
  href, 
  current = false, 
  className = '',
  ...props 
}) => {
  return (
    <a
      href={href}
      className={`navbar-item ${current ? 'navbar-item--current' : ''} ${className}`}
      aria-current={current ? 'page' : undefined}
      {...props}
    >
      {children}
    </a>
  );
};

export const NavbarDivider: React.FC<NavbarDividerProps> = ({ className = '' }) => {
  return (
    <div className={`navbar-divider ${className}`} />
  );
};

export const NavbarSpacer: React.FC<NavbarSpacerProps> = ({ className = '' }) => {
  return (
    <div className={`navbar-spacer ${className}`} />
  );
};

export const NavbarLabel: React.FC<NavbarLabelProps> = ({ children, className = '' }) => {
  return (
    <span className={`navbar-label ${className}`}>
      {children}
    </span>
  );
};



