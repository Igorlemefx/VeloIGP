import React, { useState, useEffect, useMemo } from 'react';
import './RealTimeFilters.css';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'search' | 'toggle';
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
}

interface RealTimeFiltersProps {
  data: any[];
  onFiltersChange: (filters: Record<string, any>) => void;
  config: FilterConfig[];
  className?: string;
  autoUpdate?: boolean;
  updateInterval?: number;
}

const RealTimeFilters: React.FC<RealTimeFiltersProps> = ({
  data,
  onFiltersChange,
  config,
  className = '',
  autoUpdate = true,
  updateInterval = 5000
}) => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Gerar opções dinâmicas baseadas nos dados
  const dynamicOptions = useMemo(() => {
    const options: Record<string, FilterOption[]> = {};
    
    config.forEach(filterConfig => {
      if (filterConfig.type === 'select' || filterConfig.type === 'multiselect') {
        const uniqueValues = Array.from(new Set(
          data.map(row => row[filterConfig.key]).filter(Boolean)
        ));
        
        options[filterConfig.key] = uniqueValues.map(value => ({
          value: String(value),
          label: String(value),
          count: data.filter(row => row[filterConfig.key] === value).length
        }));
      }
    });
    
    return options;
  }, [data, config]);

  // Auto-atualização dos filtros
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Recalcular opções dinâmicas
      onFiltersChange(filters);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [filters, onFiltersChange, autoUpdate, updateInterval]);

  // Atualizar filtros quando mudarem
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const resetToDefaults = () => {
    const defaults: Record<string, any> = {};
    config.forEach(filterConfig => {
      if (filterConfig.defaultValue !== undefined) {
        defaults[filterConfig.key] = filterConfig.defaultValue;
      }
    });
    setFilters(defaults);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const renderFilter = (filterConfig: FilterConfig) => {
    const { key, label, type, placeholder, min, max, step } = filterConfig;
    const value = filters[key];
    const options = dynamicOptions[key] || filterConfig.options || [];

    switch (type) {
      case 'select':
        return (
          <div key={key} className="filter-item">
            <label className="filter-label">{label}</label>
            <select
              value={value || ''}
              onChange={(e) => handleFilterChange(key, e.target.value || null)}
              className="filter-select"
            >
              <option value="">Todos</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.count ? `(${option.count})` : ''}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={key} className="filter-item">
            <label className="filter-label">{label}</label>
            <div className="multiselect-container">
              <select
                multiple
                value={value || []}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange(key, selectedValues);
                }}
                className="filter-multiselect"
              >
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.count ? `(${option.count})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={key} className="filter-item">
            <label className="filter-label">{label}</label>
            <input
              type="date"
              value={value || ''}
              onChange={(e) => handleFilterChange(key, e.target.value || null)}
              className="filter-input"
            />
          </div>
        );

      case 'daterange':
        return (
          <div key={key} className="filter-item filter-item--daterange">
            <label className="filter-label">{label}</label>
            <div className="daterange-inputs">
              <input
                type="date"
                value={value?.start || ''}
                onChange={(e) => handleFilterChange(key, { 
                  ...value, 
                  start: e.target.value || null 
                })}
                className="filter-input"
                placeholder="Data inicial"
              />
              <span className="daterange-separator">até</span>
              <input
                type="date"
                value={value?.end || ''}
                onChange={(e) => handleFilterChange(key, { 
                  ...value, 
                  end: e.target.value || null 
                })}
                className="filter-input"
                placeholder="Data final"
              />
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={key} className="filter-item">
            <label className="filter-label">{label}</label>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleFilterChange(key, e.target.value ? Number(e.target.value) : null)}
              className="filter-input"
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
            />
          </div>
        );

      case 'search':
        return (
          <div key={key} className="filter-item">
            <label className="filter-label">{label}</label>
            <div className="search-input-container">
              <input
                type="text"
                value={value || ''}
                onChange={(e) => handleFilterChange(key, e.target.value || null)}
                className="filter-input search-input"
                placeholder={placeholder || 'Pesquisar...'}
              />
              <i className="fas fa-search search-icon"></i>
            </div>
          </div>
        );

      case 'toggle':
        return (
          <div key={key} className="filter-item filter-item--toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleFilterChange(key, e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">{label}</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`realtime-filters ${className}`}>
      <div className="filters-header">
        <div className="filters-title">
          <h3>
            <i className="fas fa-filter"></i>
            Filtros em Tempo Real
          </h3>
          <div className="filters-meta">
            <span className="last-update">
              <i className="fas fa-clock"></i>
              Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
            <span className="active-count">
              {getActiveFiltersCount()} filtros ativos
            </span>
          </div>
        </div>

        <div className="filters-controls">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
            {isExpanded ? 'Recolher' : 'Expandir'}
          </button>

          <button
            className="btn btn-sm btn-outline"
            onClick={resetToDefaults}
            disabled={Object.keys(filters).length === 0}
          >
            <i className="fas fa-undo"></i>
            Padrões
          </button>

          <button
            className="btn btn-sm btn-danger"
            onClick={clearAllFilters}
            disabled={getActiveFiltersCount() === 0}
          >
            <i className="fas fa-times"></i>
            Limpar
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="filters-content">
          <div className="filters-grid">
            {config.map(renderFilter)}
          </div>
          
          {getActiveFiltersCount() > 0 && (
            <div className="active-filters">
              <h4>Filtros Ativos:</h4>
              <div className="active-filters-list">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  
                  const filterConfig = config.find(c => c.key === key);
                  if (!filterConfig) return null;

                  const displayValue = Array.isArray(value) 
                    ? value.join(', ') 
                    : typeof value === 'object' && value.start && value.end
                    ? `${value.start} - ${value.end}`
                    : String(value);

                  return (
                    <div key={key} className="active-filter-tag">
                      <span className="filter-tag-label">{filterConfig.label}:</span>
                      <span className="filter-tag-value">{displayValue}</span>
                      <button
                        className="filter-tag-remove"
                        onClick={() => handleFilterChange(key, null)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeFilters;
