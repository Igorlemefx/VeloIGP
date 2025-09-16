import React from 'react';
import VeloigpCard from '../components/ui/VeloigpCard';
import './VeloigpRealTime.css';

const VeloigpRealTime: React.FC = () => {

  return (
    <div className="veloigp-realtime">
      <div className="construction-header">
        <div className="construction-icon">
          <i className="fas fa-tools"></i>
        </div>
        <h1>
          <i className="fas fa-clock"></i>
          Monitor em Tempo Real
        </h1>
        <p>Esta funcionalidade está em desenvolvimento</p>
      </div>

      <div className="construction-content">
        <VeloigpCard className="construction-card">
          <div className="construction-info">
            <div className="info-icon">
              <i className="fas fa-hammer"></i>
            </div>
            <div className="info-content">
              <h3>Página em Construção</h3>
              <p>
                Estamos trabalhando na integração com a API 55PBX para trazer 
                dados reais em tempo real. Em breve você poderá acompanhar:
              </p>
              <ul className="feature-list">
                <li>
                  <i className="fas fa-check"></i>
                  Operadores online em tempo real
                </li>
                <li>
                  <i className="fas fa-check"></i>
                  Chamadas ativas e em espera
                </li>
                <li>
                  <i className="fas fa-check"></i>
                  Métricas de performance ao vivo
                </li>
                <li>
                  <i className="fas fa-check"></i>
                  Status das filas de atendimento
                </li>
                <li>
                  <i className="fas fa-check"></i>
                  Alertas e notificações automáticas
                </li>
              </ul>
            </div>
          </div>
        </VeloigpCard>

        <VeloigpCard className="progress-card">
          <div className="progress-header">
            <h3>
              <i className="fas fa-chart-line"></i>
              Progresso do Desenvolvimento
            </h3>
          </div>
          <div className="progress-content">
            <div className="progress-item">
              <div className="progress-label">Integração API 55PBX</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
                <span className="progress-text">75%</span>
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-label">Interface de Tempo Real</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '90%' }}></div>
                <span className="progress-text">90%</span>
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-label">Sistema de Notificações</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '60%' }}></div>
                <span className="progress-text">60%</span>
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-label">Testes e Validação</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '40%' }}></div>
                <span className="progress-text">40%</span>
              </div>
            </div>
          </div>
        </VeloigpCard>

        <VeloigpCard className="timeline-card">
          <div className="timeline-header">
            <h3>
              <i className="fas fa-calendar-alt"></i>
              Cronograma de Lançamento
            </h3>
          </div>
          <div className="timeline-content">
            <div className="timeline-item completed">
              <div className="timeline-marker">
                <i className="fas fa-check"></i>
              </div>
              <div className="timeline-content">
                <h4>Fase 1: Estrutura Base</h4>
                <p>Interface e componentes básicos</p>
                <span className="timeline-date">Concluído</span>
              </div>
            </div>
            <div className="timeline-item completed">
              <div className="timeline-marker">
                <i className="fas fa-check"></i>
              </div>
              <div className="timeline-content">
                <h4>Fase 2: Integração de Dados</h4>
                <p>Conectores com APIs externas</p>
                <span className="timeline-date">Concluído</span>
              </div>
            </div>
            <div className="timeline-item current">
              <div className="timeline-marker">
                <i className="fas fa-cog fa-spin"></i>
              </div>
              <div className="timeline-content">
                <h4>Fase 3: Tempo Real</h4>
                <p>Implementação de dados em tempo real</p>
                <span className="timeline-date">Em Andamento</span>
              </div>
            </div>
            <div className="timeline-item pending">
              <div className="timeline-marker">
                <i className="fas fa-clock"></i>
              </div>
              <div className="timeline-content">
                <h4>Fase 4: Testes e Deploy</h4>
                <p>Validação final e lançamento</p>
                <span className="timeline-date">Próximas 2 semanas</span>
              </div>
            </div>
          </div>
        </VeloigpCard>
      </div>

      <div className="construction-footer">
        <div className="footer-info">
          <i className="fas fa-info-circle"></i>
          <span>Para mais informações sobre o desenvolvimento, acesse a página de Configurações</span>
        </div>
        <div className="footer-actions">
          <button className="btn btn-primary">
            <i className="fas fa-cog"></i>
            Configurações
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-envelope"></i>
            Contato
          </button>
        </div>
      </div>
    </div>
  );
};

export default VeloigpRealTime;