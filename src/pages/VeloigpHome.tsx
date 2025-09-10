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
            <span className="title-dashboard">Dashboard</span>
          </h1>
          <div className="title-underline"></div>
        </div>

        <div className="subtitle-container">
          <p className="main-subtitle">
            Monitoramento de produtividade com <span className="highlight-ai">Inteligência Artificial</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VeloigpHome;
