/**
 * Componente de Indicadores Otimizado - VeloIGP
 * Seção de indicadores com performance otimizada
 */

import React, { memo } from 'react';
import PremiumCard from '../ui/PremiumCard';
import { IndicadoresGerais, IndicadoresOperador } from '../../services/enhancedManualDataProcessor';

interface IndicatorsSectionProps {
  indicadoresGerais: IndicadoresGerais | null;
  indicadoresOperadores: IndicadoresOperador[];
  selectedOperator: string | null;
  onSelectOperator: (operatorName: string | null) => void;
  onViewOperatorDetails: (operatorName: string) => void;
  isLoading: boolean;
}

const IndicatorsSection: React.FC<IndicatorsSectionProps> = memo(({
  indicadoresGerais,
  indicadoresOperadores,
  selectedOperator,
  onSelectOperator,
  onViewOperatorDetails,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="indicators-loading">
        <div className="loading-spinner"></div>
        <p>Calculando indicadores...</p>
      </div>
    );
  }

  if (!indicadoresGerais || indicadoresGerais.totalLigacoesAtendidas === 0) {
    return (
      <div className="no-data-state">
        <div className="no-data-icon">
          <i className="fas fa-database"></i>
        </div>
        <h3>Nenhum Dado Encontrado</h3>
        <p>Não foram encontradas chamadas atendidas na planilha para o período selecionado.</p>
      </div>
    );
  }

  return (
    <div className="indicators-section">
      {/* Indicadores Gerais */}
      <div className="gerais-indicators">
        <h3>Indicadores Gerais</h3>
        <div className="indicators-grid">
          <PremiumCard
            variant="gradient"
            size="md"
            icon={<i className="fas fa-phone"></i>}
            title="Total de Ligações"
            subtitle={indicadoresGerais.calculations?.totalLigacoes.formatted || indicadoresGerais.totalLigacoesAtendidas.toLocaleString('pt-BR')}
          />
          
          <PremiumCard
            variant="gradient"
            size="md"
            icon={<i className="fas fa-clock"></i>}
            title="Tempo Médio"
            subtitle={indicadoresGerais.calculations?.tempoMedio.formatted || `${(indicadoresGerais.tempoMedioAtendimento / 60).toFixed(1)}min`}
          />
          
          <PremiumCard
            variant="gradient"
            size="md"
            icon={<i className="fas fa-star"></i>}
            title="Avaliação Atendimento"
            subtitle={`${indicadoresGerais.calculations?.avaliacaoAtendimento.formatted || indicadoresGerais.avaliacaoAtendimento.toFixed(1)}/5`}
          />
          
          <PremiumCard
            variant="gradient"
            size="md"
            icon={<i className="fas fa-check-circle"></i>}
            title="Avaliação Solução"
            subtitle={`${indicadoresGerais.calculations?.avaliacaoSolucao.formatted || indicadoresGerais.avaliacaoSolucao.toFixed(1)}/5`}
          />
        </div>
      </div>

      {/* Indicadores por Operador */}
      <div className="operadores-indicators">
        <h3>Indicadores por Operador</h3>
        <div className="operadores-grid">
          {indicadoresOperadores
            .filter(op => !selectedOperator || op.nomeAtendente === selectedOperator)
            .map((operador, index) => (
            <div 
              key={index} 
              className={`operador-card ${selectedOperator === operador.nomeAtendente ? 'selected' : ''}`}
              onClick={() => onSelectOperator(operador.nomeAtendente)}
            >
              <div className="operador-header">
                <h4>{operador.nomeAtendente}</h4>
                {selectedOperator === operador.nomeAtendente && (
                  <span className="selected-badge">
                    <i className="fas fa-check-circle"></i>
                    Selecionado
                  </span>
                )}
              </div>
              
              <div className="operador-metrics">
                <div className="metric">
                  <span className="metric-label">Total:</span>
                  <span className="metric-value">
                    {operador.calculations?.totalLigacoes.formatted || operador.totalLigacoesAtendidas.toLocaleString('pt-BR')}
                  </span>
                </div>
                
                <div className="metric">
                  <span className="metric-label">Tempo:</span>
                  <span className="metric-value">
                    {operador.calculations?.tempoMedio.formatted || `${(operador.tempoMedioAtendimento / 60).toFixed(1)}min`}
                  </span>
                </div>
                
                <div className="metric">
                  <span className="metric-label">Avaliação:</span>
                  <span className="metric-value">
                    {operador.calculations?.avaliacaoAtendimento.formatted || operador.avaliacaoAtendimento.toFixed(1)}/5
                  </span>
                </div>
              </div>
              
              <button 
                className="view-details-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewOperatorDetails(operador.nomeAtendente);
                }}
              >
                <i className="fas fa-eye"></i>
                Ver Detalhes
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

IndicatorsSection.displayName = 'IndicatorsSection';

export default IndicatorsSection;
