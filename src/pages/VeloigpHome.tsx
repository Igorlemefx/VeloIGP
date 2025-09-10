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
            do sistema de telefonia empresarial.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VeloigpHome;
