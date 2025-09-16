// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { globalDataCache } from '../services/globalDataCache';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import './VeloigpHome.css';

const VeloigpHome = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const testarToasts = () => {
    showSuccess('Sucesso!', 'Sistema de toast funcionando perfeitamente');
    setTimeout(() => showError('Erro!', 'Este é um exemplo de notificação de erro'), 1000);
    setTimeout(() => showWarning('Atenção!', 'Esta é uma notificação de aviso'), 2000);
    setTimeout(() => showInfo('Informação', 'Sistema de notificações totalmente funcional'), 3000);
  };

  useEffect(() => {
    // Carregar dados em background
    const loadDataInBackground = async () => {
      try {
        await globalDataCache.getData();
        setDataLoaded(true);
        console.log('✅ Dados carregados em background na página inicial');
      } catch (error) {
        console.error('❌ Erro ao carregar dados em background:', error);
      }
    };

    loadDataInBackground();

    // Animação de entrada
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="veloigp-home" data-theme={theme}>
      {/* Background com Círculos Animados */}
      <div className="home-background">
        <div className="gradient-overlay"></div>
        
        {/* Círculos Animados */}
        <div className="animated-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
          <div className="circle circle-4"></div>
          <div className="circle circle-5"></div>
        </div>
      </div>

      {/* Container Principal */}
      <div className="home-container">
        {/* Conteúdo Principal */}
        <div className={`home-content ${isLoaded ? 'loaded' : ''}`}>
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">
                <span className="veloigp-text">VeloIGP</span>
              </h1>
              
              <div className="title-underline"></div>
              
              <p className="hero-subtitle">
                <span className="subtitle-normal">Sistema de monitoramento e relatórios para </span>
                <span className="subtitle-highlight">atendimento telefônico</span>
              </p>
            </div>
          </div>

          {/* Status de Carregamento - Removido para carregamento automático */}

          {/* Botão de Teste de Toast */}
          {dataLoaded && (
            <div className="toast-test-section">
              <button 
                className="toast-test-button"
                onClick={testarToasts}
              >
                🧪 Testar Sistema de Notificações
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeloigpHome;