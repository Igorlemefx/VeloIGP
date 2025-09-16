import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Navbar, NavbarSection, NavbarItem } from './ui/Navbar';
import NotificationCenter from './ui/NotificationCenter';
import useMobileDetection from '../hooks/useMobileDetection';
import TouchOptimized from './ui/TouchOptimized';
import './ui/Navbar.css';

interface VeloigpHeaderProps {
  currentPage?: string;
}

const VeloigpHeader: React.FC<VeloigpHeaderProps> = ({ currentPage = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const { isMobile } = useMobileDetection();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'stacked', label: 'VeloIGP', path: '/', icon: 'fas fa-chart-line' }
  ];

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <Navbar>
        <NavbarSection className="navbar-section--left">
              <div className="logo">
                <div className="logo-icon">
                  <img 
                    src="/logo-velotax.png" 
                    alt="Velotax" 
                    className="logo-img"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <i className="fas fa-chart-line" style={{ display: 'none' }}></i>
                </div>
              </div>
        </NavbarSection>

        <NavbarSection className="navbar-section--center max-lg:hidden">
          {navigationItems.map((item) => (
            <NavbarItem
              key={item.id}
              href={item.path}
              current={currentPage === item.id}
            >
              {item.label}
            </NavbarItem>
          ))}
        </NavbarSection>

            <NavbarSection className="navbar-section--right">
              {isMobile ? (
                <TouchOptimized
                  onTap={handleMenuToggle}
                  hapticFeedback={true}
                  className="mobile-menu-button-wrapper"
                >
                  <button 
                    className="mobile-menu-button"
                    onClick={handleMenuToggle}
                    aria-label="Abrir menu"
                  >
                    <i className="fas fa-bars"></i>
                  </button>
                </TouchOptimized>
              ) : (
            <>
              <NotificationCenter />
              <button 
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
              >
                <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
              </button>
            </>
          )}
        </NavbarSection>
      </Navbar>

      {/* Menu Mobile */}
      {isMobile && isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={handleMenuClose}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
                <div className="mobile-menu-logo">
                  <div className="logo-icon">
                    <img 
                      src="/logo-velotax.png" 
                      alt="Velotax" 
                      className="logo-img"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }}
                    />
                    <i className="fas fa-chart-line" style={{ display: 'none' }}></i>
                  </div>
                </div>
              <button 
                className="mobile-menu-close"
                onClick={handleMenuClose}
                aria-label="Fechar menu"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="mobile-menu-content">
              <div className="mobile-menu-links">
                {navigationItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.path}
                    className={`mobile-menu-link ${currentPage === item.id ? 'mobile-menu-link--current' : ''}`}
                    onClick={handleMenuClose}
                  >
                    <i className={item.icon}></i>
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="mobile-menu-footer">
                <button 
                  className="mobile-theme-toggle"
                  onClick={toggleTheme}
                >
                  <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
                  {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VeloigpHeader;