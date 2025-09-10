import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VeloigpHeader from './VeloigpHeader';
import './VeloigpLayout.css';

interface VeloigpLayoutProps {
  children: React.ReactNode;
}

const VeloigpLayout: React.FC<VeloigpLayoutProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const location = useLocation();
  
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/planilhas') return 'planilhas';
    if (path === '/relatorios') return 'relatorios';
    if (path === '/tempo-real') return 'tempo-real';
    if (path === '/config') return 'config';
    return 'home';
  };
  
  const currentPage = getCurrentPage();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('veloigp-theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('veloigp-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="veloigp-app" data-theme={theme}>
      <VeloigpHeader 
        currentPage={currentPage} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default VeloigpLayout;
