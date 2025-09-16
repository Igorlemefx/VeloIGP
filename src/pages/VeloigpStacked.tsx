import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import VeloigpHome from './VeloigpHome';
import VeloigpManualReports from './VeloigpManualReports';
import './VeloigpStacked.css';

const VeloigpStacked: React.FC = () => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isScrolling, setIsScrolling] = useState(false);
  
  const homeRef = useRef<HTMLDivElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Configurar Intersection Observer para detectar seção ativa
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId) {
              setActiveSection(sectionId);
            }
          }
        });
      },
      { 
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    if (homeRef.current) observer.observe(homeRef.current);
    if (reportsRef.current) observer.observe(reportsRef.current);

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsScrolling(true);
    
    let targetRef = null;
    if (sectionId === 'home') targetRef = homeRef;
    if (sectionId === 'reports') targetRef = reportsRef;
    
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Resetar flag de scrolling após animação
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }
  };

  const sections = [
    { id: 'home', label: 'Início', icon: 'fas fa-home' },
    { id: 'reports', label: 'Relatórios Manual', icon: 'fas fa-chart-line' }
  ];

  return (
    <div className="veloigp-stacked" data-theme={theme}>
      {/* Navegação Fixa */}
      <nav className="stacked-navigation">
        <div className="nav-container">
          <div className="nav-brand">
            <img 
              src="/logo-velotax.png" 
              alt="Velotax" 
              className="nav-logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'flex';
                }
              }}
            />
            <div className="nav-logo-fallback" style={{ display: 'none' }}>
              <i className="fas fa-chart-line"></i>
              <span>VeloIGP</span>
            </div>
          </div>
          
          <div className="nav-menu">
            {sections.map(section => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => scrollToSection(section.id)}
                disabled={isScrolling}
              >
                <i className={section.icon}></i>
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Container Principal com Scroll */}
      <div className="stacked-container" ref={containerRef}>
        {/* Seção Home */}
        <div 
          ref={homeRef}
          data-section-id="home"
          className="stacked-section home-section"
        >
          <div className="section-wrapper">
            <VeloigpHome />
          </div>
        </div>

        {/* Seção Relatórios Manual */}
        <div 
          ref={reportsRef}
          data-section-id="reports"
          className="stacked-section reports-section"
        >
          <div className="section-wrapper">
            <VeloigpManualReports />
          </div>
        </div>
      </div>

      {/* Indicador de Progresso */}
      <div className="scroll-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{
              width: activeSection === 'home' ? '50%' : '100%'
            }}
          ></div>
        </div>
        <div className="progress-dots">
          <div className={`dot ${activeSection === 'home' ? 'active' : ''}`}></div>
          <div className={`dot ${activeSection === 'reports' ? 'active' : ''}`}></div>
        </div>
      </div>

      {/* Botão de Volta ao Topo */}
      <button 
        className="scroll-to-top"
        onClick={() => scrollToSection('home')}
        style={{ 
          opacity: activeSection === 'reports' ? 1 : 0,
          pointerEvents: activeSection === 'reports' ? 'auto' : 'none'
        }}
      >
        <i className="fas fa-chevron-up"></i>
      </button>

    </div>
  );
};

export default VeloigpStacked;
