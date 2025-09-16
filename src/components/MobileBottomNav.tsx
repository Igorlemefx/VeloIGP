import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import useMobileDetection from '../hooks/useMobileDetection';
import TouchOptimized from './ui/TouchOptimized';
import './MobileBottomNav.css';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isMobile } = useMobileDetection();
  const [activeItem, setActiveItem] = useState('');

  if (!isMobile) return null;

  const navItems = [
    { id: 'stacked', label: 'VeloIGP', path: '/', icon: 'fas fa-chart-line' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    // Feedback tátil se suportado
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => (
        <TouchOptimized
          key={item.id}
          onTap={() => {
            handleItemClick(item.id);
            window.location.href = item.path;
          }}
          hapticFeedback={true}
          className="mobile-nav-item-wrapper"
        >
          <a
            href={item.path}
            className={`mobile-nav-item ${isActive(item.path) ? 'mobile-nav-item--active' : ''} ${activeItem === item.id ? 'mobile-nav-item--pressed' : ''}`}
          >
            <div className="mobile-nav-icon">
              <i className={item.icon}></i>
            </div>
            <span className="mobile-nav-label">{item.label}</span>
            {isActive(item.path) && <div className="mobile-nav-indicator"></div>}
          </a>
        </TouchOptimized>
      ))}
    </div>
  );
};

export default MobileBottomNav;
