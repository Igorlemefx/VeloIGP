import React, { useState, useEffect } from 'react';
import useMobileDetection from '../../hooks/useMobileDetection';
import TouchOptimized from '../ui/TouchOptimized';
import './AdvancedOperatorDateSelector.css';

interface Operator {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  status: 'online' | 'offline' | 'busy';
  performance?: number;
  calls?: number;
  satisfaction?: number;
  efficiency?: number;
  avgCallTime?: number;
}

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface AdvancedOperatorDateSelectorProps {
  operators: Operator[];
  selectedOperators: string[];
  selectedDateRange: DateRange | null;
  onOperatorsChange: (operatorIds: string[]) => void;
  onDateRangeChange: (dateRange: DateRange) => void;
  onApply: () => void;
  onClear: () => void;
}

const AdvancedOperatorDateSelector: React.FC<AdvancedOperatorDateSelectorProps> = ({
  operators,
  selectedOperators,
  selectedDateRange,
  onOperatorsChange,
  onDateRangeChange,
  onApply,
  onClear
}) => {
  const { isMobile, screenSize } = useMobileDetection();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOperators, setShowOperators] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | null>(selectedDateRange);

  // Presets de data
  const datePresets: DateRange[] = [
    {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Últimas 24h'
    },
    {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Últimos 7 dias'
    },
    {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Últimos 30 dias'
    },
    {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(),
      label: 'Este mês'
    }
  ];

  // Filtrar operadores
  const filteredOperators = operators.filter(operator =>
    operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selecionar/deselecionar operador
  const toggleOperator = (operatorId: string) => {
    if (selectedOperators.includes(operatorId)) {
      onOperatorsChange(selectedOperators.filter(id => id !== operatorId));
    } else {
      onOperatorsChange([...selectedOperators, operatorId]);
    }
  };

  // Selecionar todos os operadores
  const selectAllOperators = () => {
    onOperatorsChange(operators.map(op => op.id));
  };

  // Limpar seleção de operadores
  const clearOperators = () => {
    onOperatorsChange([]);
  };

  // Aplicar range de data
  const applyDateRange = (dateRange: DateRange) => {
    setTempDateRange(dateRange);
    onDateRangeChange(dateRange);
    setShowDatePicker(false);
  };

  // Formatar data para exibição
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obter operadores selecionados
  const selectedOperatorsData = operators.filter(op => selectedOperators.includes(op.id));

  return (
    <div className={`advanced-selector ${isExpanded ? 'advanced-selector--expanded' : ''} ${isMobile ? 'advanced-selector--mobile' : ''}`}>
      {/* Header do Seletor */}
      <div className="selector-header">
        <div className="selector-title">
          <i className="fas fa-filter"></i>
          <span>Filtros Avançados</span>
        </div>
        <TouchOptimized
          onTap={() => setIsExpanded(!isExpanded)}
          hapticFeedback={true}
          className="selector-toggle"
        >
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
        </TouchOptimized>
      </div>

      {/* Conteúdo do Seletor */}
      {isExpanded && (
        <div className="selector-content">
          {/* Seletor de Operadores */}
          <div className="selector-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-users"></i>
                Operadores
              </h3>
              <div className="section-actions">
                <TouchOptimized
                  onTap={selectAllOperators}
                  hapticFeedback={true}
                  className="action-btn action-btn--primary"
                >
                  <i className="fas fa-check-double"></i>
                  Todos
                </TouchOptimized>
                <TouchOptimized
                  onTap={clearOperators}
                  hapticFeedback={true}
                  className="action-btn action-btn--secondary"
                >
                  <i className="fas fa-times"></i>
                  Limpar
                </TouchOptimized>
              </div>
            </div>

            {/* Campo de busca */}
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Buscar operadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Lista de operadores */}
            <div className="operators-list">
              {filteredOperators.map((operator) => (
                <TouchOptimized
                  key={operator.id}
                  onTap={() => toggleOperator(operator.id)}
                  hapticFeedback={true}
                  className={`operator-item ${selectedOperators.includes(operator.id) ? 'operator-item--selected' : ''}`}
                >
                  <div className="operator-avatar">
                    <i className="fas fa-user"></i>
                    <div className={`status-indicator status-indicator--${operator.status}`}></div>
                  </div>
                  <div className="operator-info">
                    <div className="operator-name">{operator.name}</div>
                    <div className="operator-department">{operator.department}</div>
                    <div className="operator-performance">
                      <i className="fas fa-chart-line"></i>
                      {operator.performance || operator.efficiency || 0}%
                    </div>
                  </div>
                  <div className="operator-checkbox">
                    <i className={`fas fa-${selectedOperators.includes(operator.id) ? 'check-circle' : 'circle'}`}></i>
                  </div>
                </TouchOptimized>
              ))}
            </div>

            {/* Resumo da seleção */}
            {selectedOperators.length > 0 && (
              <div className="selection-summary">
                <i className="fas fa-info-circle"></i>
                <span>
                  {selectedOperators.length} operador{selectedOperators.length > 1 ? 'es' : ''} selecionado{selectedOperators.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Seletor de Data */}
          <div className="selector-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-calendar-alt"></i>
                Período
              </h3>
            </div>

            {/* Presets de data */}
            <div className="date-presets">
              {datePresets.map((preset, index) => (
                <TouchOptimized
                  key={index}
                  onTap={() => applyDateRange(preset)}
                  hapticFeedback={true}
                  className={`preset-btn ${tempDateRange?.label === preset.label ? 'preset-btn--active' : ''}`}
                >
                  {preset.label}
                </TouchOptimized>
              ))}
            </div>

            {/* Seletor de data customizado */}
            <div className="custom-date-range">
              <div className="date-inputs">
                <div className="date-input-group">
                  <label>Data Inicial</label>
                  <input
                    type="date"
                    value={tempDateRange ? tempDateRange.start.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const start = new Date(e.target.value);
                      const end = tempDateRange?.end || new Date();
                      setTempDateRange({ start, end, label: 'Personalizado' });
                    }}
                    className="date-input"
                  />
                </div>
                <div className="date-input-group">
                  <label>Data Final</label>
                  <input
                    type="date"
                    value={tempDateRange ? tempDateRange.end.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const end = new Date(e.target.value);
                      const start = tempDateRange?.start || new Date();
                      setTempDateRange({ start, end, label: 'Personalizado' });
                    }}
                    className="date-input"
                  />
                </div>
              </div>
            </div>

            {/* Range selecionado */}
            {tempDateRange && (
              <div className="selected-range">
                <i className="fas fa-calendar-check"></i>
                <span>
                  {formatDate(tempDateRange.start)} - {formatDate(tempDateRange.end)}
                </span>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="selector-actions">
            <TouchOptimized
              onTap={onClear}
              hapticFeedback={true}
              className="action-btn action-btn--secondary action-btn--large"
            >
              <i className="fas fa-eraser"></i>
              Limpar Filtros
            </TouchOptimized>
            <TouchOptimized
              onTap={onApply}
              hapticFeedback={true}
              className="action-btn action-btn--primary action-btn--large"
            >
              <i className="fas fa-search"></i>
              Aplicar Filtros
            </TouchOptimized>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOperatorDateSelector;
