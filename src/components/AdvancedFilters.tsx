import React, { useState, useEffect } from 'react';
import './AdvancedFilters.css';

export interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  availableOperators: string[];
  availableQueues: string[];
  dateRange: { start: string; end: string };
}

export interface FilterState {
  operators: string[];
  queues: string[];
  dateRange: { start: string; end: string };
  qualityRange: { min: number; max: number };
  callStatus: string[];
  timeRange: { start: string; end: string };
  searchTerm: string;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  availableOperators,
  availableQueues,
  dateRange
}) => {
  const [filters, setFilters] = useState<FilterState>({
    operators: [],
    queues: [],
    dateRange: { start: '', end: '' },
    qualityRange: { min: 1, max: 5 },
    callStatus: [],
    timeRange: { start: '00:00', end: '23:59' },
    searchTerm: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Calcular número de filtros ativos
    let count = 0;
    if (filters.operators.length > 0) count++;
    if (filters.queues.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.qualityRange.min > 1 || filters.qualityRange.max < 5) count++;
    if (filters.callStatus.length > 0) count++;
    if (filters.timeRange.start !== '00:00' || filters.timeRange.end !== '23:59') count++;
    if (filters.searchTerm) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleOperatorToggle = (operator: string) => {
    const newOperators = filters.operators.includes(operator)
      ? filters.operators.filter(op => op !== operator)
      : [...filters.operators, operator];
    handleFilterChange('operators', newOperators);
  };

  const handleQueueToggle = (queue: string) => {
    const newQueues = filters.queues.includes(queue)
      ? filters.queues.filter(q => q !== queue)
      : [...filters.queues, queue];
    handleFilterChange('queues', newQueues);
  };

  const handleCallStatusToggle = (status: string) => {
    const newStatus = filters.callStatus.includes(status)
      ? filters.callStatus.filter(s => s !== status)
      : [...filters.callStatus, status];
    handleFilterChange('callStatus', newStatus);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      operators: [],
      queues: [],
      dateRange: { start: '', end: '' },
      qualityRange: { min: 1, max: 5 },
      callStatus: [],
      timeRange: { start: '00:00', end: '23:59' },
      searchTerm: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const callStatusOptions = [
    { value: 'Atendida', label: 'Atendida', color: '#28a745' },
    { value: 'Retida na URA', label: 'Retida na URA', color: '#dc3545' },
    { value: 'Abandonada', label: 'Abandonada', color: '#ffc107' }
  ];

  return (
    <div className="advanced-filters">
      <div className="filters-header">
        <div className="filters-title">
          <h3>Filtros Avançados</h3>
          {activeFiltersCount > 0 && (
            <span className="active-filters-badge">{activeFiltersCount}</span>
          )}
        </div>
        <div className="filters-actions">
          <button 
            className="btn-clear-filters"
            onClick={clearAllFilters}
            disabled={activeFiltersCount === 0}
          >
            <i className="fas fa-times"></i>
            Limpar Todos
          </button>
          <button 
            className="btn-toggle-filters"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
            {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="filters-content">
          {/* Busca Global */}
          <div className="filter-group">
            <label>Busca Global</label>
            <div className="search-input">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Buscar por operador, fila, número..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
            </div>
          </div>

          {/* Filtros por Data */}
          <div className="filter-group">
            <label>Período</label>
            <div className="date-range">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value
                })}
                placeholder="Data início"
              />
              <span>até</span>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value
                })}
                placeholder="Data fim"
              />
            </div>
          </div>

          {/* Filtros por Hora */}
          <div className="filter-group">
            <label>Horário</label>
            <div className="time-range">
              <input
                type="time"
                value={filters.timeRange.start}
                onChange={(e) => handleFilterChange('timeRange', {
                  ...filters.timeRange,
                  start: e.target.value
                })}
              />
              <span>até</span>
              <input
                type="time"
                value={filters.timeRange.end}
                onChange={(e) => handleFilterChange('timeRange', {
                  ...filters.timeRange,
                  end: e.target.value
                })}
              />
            </div>
          </div>

          {/* Filtros por Operador */}
          <div className="filter-group">
            <label>Operadores</label>
            <div className="multi-select">
              <div className="selected-items">
                {filters.operators.map(operator => (
                  <span key={operator} className="selected-item">
                    {operator}
                    <button onClick={() => handleOperatorToggle(operator)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
              <div className="options-list">
                {availableOperators.map(operator => (
                  <label key={operator} className="option-item">
                    <input
                      type="checkbox"
                      checked={filters.operators.includes(operator)}
                      onChange={() => handleOperatorToggle(operator)}
                    />
                    <span>{operator}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Filtros por Fila */}
          <div className="filter-group">
            <label>Filas</label>
            <div className="multi-select">
              <div className="selected-items">
                {filters.queues.map(queue => (
                  <span key={queue} className="selected-item">
                    {queue}
                    <button onClick={() => handleQueueToggle(queue)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
              <div className="options-list">
                {availableQueues.map(queue => (
                  <label key={queue} className="option-item">
                    <input
                      type="checkbox"
                      checked={filters.queues.includes(queue)}
                      onChange={() => handleQueueToggle(queue)}
                    />
                    <span>{queue}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Filtros por Status */}
          <div className="filter-group">
            <label>Status da Chamada</label>
            <div className="status-filters">
              {callStatusOptions.map(status => (
                <label key={status.value} className="status-option">
                  <input
                    type="checkbox"
                    checked={filters.callStatus.includes(status.value)}
                    onChange={() => handleCallStatusToggle(status.value)}
                  />
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: status.color }}
                  >
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtros por Qualidade */}
          <div className="filter-group">
            <label>Faixa de Qualidade</label>
            <div className="quality-range">
              <div className="range-inputs">
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={filters.qualityRange.min}
                  onChange={(e) => handleFilterChange('qualityRange', {
                    ...filters.qualityRange,
                    min: parseInt(e.target.value) || 1
                  })}
                />
                <span>até</span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={filters.qualityRange.max}
                  onChange={(e) => handleFilterChange('qualityRange', {
                    ...filters.qualityRange,
                    max: parseInt(e.target.value) || 5
                  })}
                />
              </div>
              <div className="quality-slider">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={filters.qualityRange.min}
                  onChange={(e) => handleFilterChange('qualityRange', {
                    ...filters.qualityRange,
                    min: parseFloat(e.target.value)
                  })}
                  className="range-min"
                />
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={filters.qualityRange.max}
                  onChange={(e) => handleFilterChange('qualityRange', {
                    ...filters.qualityRange,
                    max: parseFloat(e.target.value)
                  })}
                  className="range-max"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;

