import React, { useEffect, useState } from 'react';
import './VeloigpHome.css';

const VeloigpHome: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="veloigp-home">
      {/* Background Animado */}
      <div className="animated-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      {/* Conteúdo Principal */}
      <div className={`home-content ${isLoaded ? 'loaded' : ''}`}>
        <div className="main-title-container">
          <h1 className="main-title">
            <span className="title-veloigp">VeloIGP</span>
          </h1>
          <div className="title-underline"></div>
        </div>

        <div className="subtitle-container">
          <p className="main-subtitle">
            Sistema de Monitoramento e Relatórios para <span className="highlight-55pbx">55PBX</span>
          </p>
          <p className="description-text">
            Plataforma integrada para análise de dados, geração de relatórios e monitoramento em tempo real 
            do sistema de telefonia empresarial, oferecendo insights valiosos para otimização operacional.
          </p>
        </div>

        <div className="features-container">
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="feature-text">
              <h3>Análise em Tempo Real</h3>
              <p>Monitoramento contínuo de métricas e KPIs</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-file-excel"></i>
            </div>
            <div className="feature-text">
              <h3>Relatórios Avançados</h3>
              <p>Extraction e análise de dados do Google Sheets</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-cogs"></i>
            </div>
            <div className="feature-text">
              <h3>Motor de Cálculo</h3>
              <p>Processamento robusto e confiável de dados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeloigpHome;
