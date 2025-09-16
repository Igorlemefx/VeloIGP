import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import PremiumButton from '../ui/PremiumButton';
import PremiumCard from '../ui/PremiumCard';
import './OperatorSelector.css';

export interface OperatorData {
  nome: string;
  totalChamadas: number;
  tempoMedio: number;
  avaliacao: number;
  isValid: boolean;
}

interface OperatorSelectorProps {
  operators: OperatorData[];
  selectedOperator: string | null;
  onSelectOperator: (operatorName: string | null) => void;
  onViewDetails: (operatorName: string) => void;
}

const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  operators,
  selectedOperator,
  onSelectOperator,
  onViewDetails
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nome' | 'chamadas' | 'tempo' | 'avaliacao'>('chamadas');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrar e ordenar operadores
  const filteredOperators = operators
    .filter(op => 
      op.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      op.isValid
    )
    .sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'nome':
          aValue = a.nome;
          bValue = b.nome;
          break;
        case 'chamadas':
          aValue = a.totalChamadas;
          bValue = b.totalChamadas;
          break;
        case 'tempo':
          aValue = a.tempoMedio;
          bValue = b.tempoMedio;
          break;
        case 'avaliacao':
          aValue = a.avaliacao;
          bValue = b.avaliacao;
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

  return (
    <div className="operator-selector">
      <div className="selector-header">
        <h3>
          <i className="fas fa-users"></i>
          Selecionar Operador
        </h3>
        <p>Escolha um operador para visualizar detalhes individuais</p>
      </div>

      {/* Controles de busca e ordenação */}
      <div className="selector-controls">
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

        <div className="sort-controls">
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
      </div>

      {/* Lista de operadores */}
      <div className="operators-list">
        {filteredOperators.length === 0 ? (
          <div className="no-operators">
            <i className="fas fa-user-slash"></i>
            <p>Nenhum operador encontrado</p>
          </div>
        ) : (
          filteredOperators.map((operator, index) => (
            <PremiumCard
              key={operator.nome}
              variant={selectedOperator === operator.nome ? 'gradient' : 'default'}
              size="sm"
              className={`operator-card ${selectedOperator === operator.nome ? 'selected' : ''}`}
            >
              <div className="operator-info">
                <div className="operator-header">
                  <h4>{operator.nome}</h4>
                  <div className="operator-stats">
                    <span className="stat">
                      <i className="fas fa-phone"></i>
                      {operator.totalChamadas.toLocaleString('pt-BR')}
                    </span>
                    <span className="stat">
                      <i className="fas fa-clock"></i>
                      {operator.tempoMedio.toFixed(1)}min
                    </span>
                    <span className="stat">
                      <i className="fas fa-star"></i>
                      {operator.avaliacao.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="operator-actions">
                  <PremiumButton
                    onClick={() => onSelectOperator(operator.nome)}
                    variant={selectedOperator === operator.nome ? 'primary' : 'outline'}
                    size="sm"
                    icon={<i className="fas fa-eye"></i>}
                  >
                    {selectedOperator === operator.nome ? 'Selecionado' : 'Selecionar'}
                  </PremiumButton>

                  <PremiumButton
                    onClick={() => onViewDetails(operator.nome)}
                    variant="secondary"
                    size="sm"
                    icon={<i className="fas fa-chart-line"></i>}
                  >
                    Detalhes
                  </PremiumButton>
                </div>
              </div>
            </PremiumCard>
          ))
        )}
      </div>

      {/* Estatísticas resumidas */}
      {filteredOperators.length > 0 && (
        <div className="selector-summary">
          <div className="summary-item">
            <span className="summary-label">Total de Operadores:</span>
            <span className="summary-value">{filteredOperators.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Chamadas Totais:</span>
            <span className="summary-value">
              {filteredOperators.reduce((sum, op) => sum + op.totalChamadas, 0).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avaliação Média:</span>
            <span className="summary-value">
              {(filteredOperators.reduce((sum, op) => sum + op.avaliacao, 0) / filteredOperators.length).toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorSelector;
