// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import './DynamicFilters.css';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'search';
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface DynamicFiltersProps {
  data: any[];
  onFiltersChange: (filters: Record<string, any>) => void;
  config: FilterConfig[];
  className?: string;
}

const DynamicFilters: React.FC<DynamicFiltersProps> = ({
  data,
  onFiltersChange,
  config,
  className = ''
}) => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const renderFilter = (filterConfig: FilterConfig) => {
    const { key, label, type, placeholder } = filterConfig;
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
          <div key={key} className="filter-item filter-daterange">
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
              min={filterConfig.min}
              max={filterConfig.max}
              step={filterConfig.step}
            />
          </div>
        );

      case 'search':
        return (
          <div key={key} className="filter-item filter-search">
            <label className="filter-label">{label}</label>
            <div className="search-container">
              <input
                type="text"
                value={value || ''}
                onChange={(e) => handleFilterChange(key, e.target.value || null)}
                className="filter-search-input"
                placeholder={placeholder || 'Pesquisar...'}
              />
              <i className="fas fa-search search-icon"></i>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`dynamic-filters ${className}`}>
      <div className="filters-header">
        <div className="filters-title">
          <i className="fas fa-filter"></i>
          <span>Filtros Dinâmicos</span>
          {getActiveFiltersCount() > 0 && (
            <span className="active-count">{getActiveFiltersCount()}</span>
          )}
        </div>
        <div className="filters-actions">
          <button
            className="btn-toggle-filters"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
            {isExpanded ? 'Ocultar' : 'Mostrar'}
          </button>
          {getActiveFiltersCount() > 0 && (
            <button
              className="btn-clear-filters"
              onClick={clearAllFilters}
            >
              <i className="fas fa-times"></i>
              Limpar
            </button>
          )}
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
                    : value;

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

export default DynamicFilters;



