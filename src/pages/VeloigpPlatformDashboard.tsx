import React from 'react';
import './VeloigpPlatformDashboard.css';
import '../styles/design-system.css';

const VeloigpPlatformDashboard: React.FC = () => {

  return (
    <div className="platform-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="fas fa-tachometer-alt"></i>
          </div>
          <div className="header-text">
            <h1>VeloIGP</h1>
            <p>Sistema de Telefonia Empresarial</p>
            <span className="header-subtitle">Monitoramento e análise de dados em tempo real</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => window.location.href = '/relatorios'}
          >
            <i className="fas fa-chart-line"></i>
            Acessar Relatórios
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="system-info grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="card info-card animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="card-body">
              <div className="info-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="info-content">
                <h3>Análise de Dados</h3>
                <p>Processamento inteligente de dados de chamadas telefônicas com métricas avançadas de performance</p>
              </div>
            </div>
          </div>

          <div className="card info-card animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-body">
              <div className="info-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="info-content">
                <h3>Gestão de Operadores</h3>
                <p>Monitoramento individual e em equipe com relatórios detalhados de produtividade</p>
              </div>
            </div>
          </div>

          <div className="card info-card animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-body">
              <div className="info-icon">
                <i className="fas fa-file-excel"></i>
              </div>
              <div className="info-content">
                <h3>Integração com Planilhas</h3>
                <p>Conexão direta com Google Sheets para importação e exportação de dados em tempo real</p>
              </div>
            </div>
          </div>

          <div className="card info-card animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="card-body">
              <div className="info-icon">
                <i className="fas fa-phone"></i>
              </div>
              <div className="info-content">
                <h3>API 55PBX</h3>
                <p>Integração completa com sistema de telefonia para coleta automática de dados</p>
              </div>
            </div>
          </div>

          <div className="card info-card animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="card-body">
              <div className="info-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <div className="info-content">
                <h3>Relatórios Avançados</h3>
                <p>Dashboards interativos com visualizações de tendências e comparações de performance</p>
              </div>
            </div>
          </div>

          <div className="card info-card animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="card-body">
              <div className="info-icon">
                <i className="fas fa-download"></i>
              </div>
              <div className="info-content">
                <h3>Exportação de Dados</h3>
                <p>Exportação em múltiplos formatos (Excel, CSV, PDF) com templates personalizáveis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-welcome animate-fade-in">
          <div className="card welcome-card">
            <div className="card-body">
              <div className="welcome-content">
                <h2>Bem-vindo ao VeloIGP</h2>
                <p>Sistema completo de monitoramento e análise de dados para telefonia empresarial</p>
                <div className="welcome-actions">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => window.location.href = '/relatorios'}
                  >
                    <i className="fas fa-chart-line"></i>
                    Acessar Relatórios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeloigpPlatformDashboard;

