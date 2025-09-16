/**
 * Seletor de Perfil de Operador Melhorado - VeloIGP
 * Interface moderna e intuitiva para seleção de operadores
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import PremiumButton from '../ui/PremiumButton';
import PremiumCard from '../ui/PremiumCard';
import { IndicadoresOperador } from '../../services/enhancedManualDataProcessor';
import './OperatorProfileSelector.css';

interface OperatorProfileSelectorProps {
  operators: IndicadoresOperador[];
  selectedOperator: string | null;
  onSelectOperator: (operatorName: string | null) => void;
  onViewProfile: (operatorName: string) => void;
  onClose: () => void;
}

const OperatorProfileSelector: React.FC<OperatorProfileSelectorProps> = ({
  operators,
  selectedOperator,
  onSelectOperator,
  onViewProfile,
  onClose
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nome' | 'chamadas' | 'tempo' | 'avaliacao'>('chamadas');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtrar e ordenar operadores
  const filteredOperators = useMemo(() => {
    return operators
      .filter(op => 
        op.nomeAtendente.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (sortBy) {
          case 'nome':
            aValue = a.nomeAtendente;
            bValue = b.nomeAtendente;
            break;
          case 'chamadas':
            aValue = a.totalLigacoesAtendidas;
            bValue = b.totalLigacoesAtendidas;
            break;
          case 'tempo':
            aValue = a.tempoMedioAtendimento;
            bValue = b.tempoMedioAtendimento;
            break;
          case 'avaliacao':
            aValue = a.avaliacaoAtendimento;
            bValue = b.avaliacaoAtendimento;
            break;
          default:
            return 0;
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  }, [operators, searchTerm, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return 'fas fa-sort';
    return sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="operator-profile-selector">
      {/* Header */}
      <div className="selector-header">
        <div className="header-content">
          <h2>
            <i className="fas fa-users"></i>
            Selecionar Operador
          </h2>
          <p>Escolha um operador para visualizar seu perfil detalhado</p>
        </div>
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Controles */}
      <div className="selector-controls">
        <div className="search-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="controls-row">
          <div className="sort-section">
            <label>Ordenar por:</label>
            <div className="sort-buttons">
              {[
                { key: 'nome', label: 'Nome', icon: 'fas fa-user' },
                { key: 'chamadas', label: 'Chamadas', icon: 'fas fa-phone' },
                { key: 'tempo', label: 'Tempo', icon: 'fas fa-clock' },
                { key: 'avaliacao', label: 'Avaliação', icon: 'fas fa-star' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  className={`sort-btn ${sortBy === key ? 'active' : ''}`}
                  onClick={() => handleSort(key as typeof sortBy)}
                >
                  <i className={icon}></i>
                  <span>{label}</span>
                  <i className={getSortIcon(key as typeof sortBy)}></i>
                </button>
              ))}
            </div>
          </div>

          <div className="view-mode">
            <label>Visualização:</label>
            <div className="view-buttons">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="fas fa-th"></i>
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Operadores */}
      <div className={`operators-container ${viewMode}`}>
        {filteredOperators.length === 0 ? (
          <div className="no-operators">
            <i className="fas fa-user-slash"></i>
            <h3>Nenhum operador encontrado</h3>
            <p>Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          filteredOperators.map((operator) => (
            <PremiumCard
              key={operator.nomeAtendente}
              variant={selectedOperator === operator.nomeAtendente ? 'gradient' : 'default'}
              size="md"
              className={`operator-card ${selectedOperator === operator.nomeAtendente ? 'selected' : ''}`}
            >
              <div className="operator-content">
                <div className="operator-header">
                  <div className="operator-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="operator-info">
                    <h3>{operator.nomeAtendente}</h3>
                    <div className="operator-badges">
                      {operator.totalLigacoesAtendidas > 100 && (
                        <span className="badge badge-success">
                          <i className="fas fa-trophy"></i>
                          Top Performer
                        </span>
                      )}
                      {operator.avaliacaoAtendimento >= 4.5 && (
                        <span className="badge badge-excellent">
                          <i className="fas fa-star"></i>
                          Excelente
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="operator-metrics">
                  <div className="metric">
                    <div className="metric-icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="metric-content">
                      <span className="metric-value">
                        {operator.calculations?.totalLigacoes.formatted || operator.totalLigacoesAtendidas.toLocaleString('pt-BR')}
                      </span>
                      <span className="metric-label">Chamadas</span>
                    </div>
                  </div>

                  <div className="metric">
                    <div className="metric-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="metric-content">
                      <span className="metric-value">
                        {operator.calculations?.tempoMedio.formatted || formatTime(operator.tempoMedioAtendimento)}
                      </span>
                      <span className="metric-label">Tempo Médio</span>
                    </div>
                  </div>

                  <div className="metric">
                    <div className="metric-icon">
                      <i className="fas fa-star"></i>
                    </div>
                    <div className="metric-content">
                      <span className="metric-value">
                        {operator.calculations?.avaliacaoAtendimento.formatted || operator.avaliacaoAtendimento.toFixed(1)}
                      </span>
                      <span className="metric-label">Avaliação</span>
                    </div>
                  </div>
                </div>

                <div className="operator-actions">
                  <PremiumButton
                    onClick={() => onSelectOperator(operator.nomeAtendente)}
                    variant={selectedOperator === operator.nomeAtendente ? 'primary' : 'outline'}
                    size="sm"
                    icon={<i className="fas fa-eye"></i>}
                  >
                    {selectedOperator === operator.nomeAtendente ? 'Selecionado' : 'Selecionar'}
                  </PremiumButton>

                  <PremiumButton
                    onClick={() => onViewProfile(operator.nomeAtendente)}
                    variant="secondary"
                    size="sm"
                    icon={<i className="fas fa-chart-line"></i>}
                  >
                    Ver Perfil
                  </PremiumButton>
                </div>
              </div>
            </PremiumCard>
          ))
        )}
      </div>

      {/* Resumo */}
      {filteredOperators.length > 0 && (
        <div className="selector-summary">
          <div className="summary-grid">
            <div className="summary-item">
              <i className="fas fa-users"></i>
              <span className="summary-label">Operadores:</span>
              <span className="summary-value">{filteredOperators.length}</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-phone"></i>
              <span className="summary-label">Chamadas:</span>
              <span className="summary-value">
                {filteredOperators.reduce((sum, op) => sum + op.totalLigacoesAtendidas, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="summary-item">
              <i className="fas fa-star"></i>
              <span className="summary-label">Avaliação Média:</span>
              <span className="summary-value">
                {(filteredOperators.reduce((sum, op) => sum + op.avaliacaoAtendimento, 0) / filteredOperators.length).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorProfileSelector;
