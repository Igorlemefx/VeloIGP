import React, { useState, useEffect } from 'react';
import './AdvancedSpreadsheetFilters.css';

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface AdvancedSpreadsheetFiltersProps {
  data: any[][];
  onFiltersChange: (filters: SpreadsheetFilters) => void;
  onDataFiltered: (filteredData: any[][]) => void;
}

interface SpreadsheetFilters {
  operador?: string[];
  fila?: string[];
  dataInicio?: string;
  dataFim?: string;
  status?: string[];
  duracaoMin?: number;
  duracaoMax?: number;
  horarioInicio?: string;
  horarioFim?: string;
}

const AdvancedSpreadsheetFilters: React.FC<AdvancedSpreadsheetFiltersProps> = ({
  data,
  onFiltersChange,
  onDataFiltered
}) => {
  const [filters, setFilters] = useState<SpreadsheetFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableOptions, setAvailableOptions] = useState({
    operadores: [] as FilterOption[],
    filas: [] as FilterOption[],
    status: [] as FilterOption[],
    datas: [] as string[]
  });

  // Extrair opções disponíveis dos dados
  useEffect(() => {
    if (!data || data.length < 2) return;

    const headers = data[0];
    const rows = data.slice(1);

    // Encontrar índices das colunas
    const operadorIndex = headers.findIndex(h => 
      h && h.toString().toLowerCase().includes('operador')
    );
    const filaIndex = headers.findIndex(h => 
      h && h.toString().toLowerCase().includes('fila')
    );
    const statusIndex = headers.findIndex(h => 
      h && h.toString().toLowerCase().includes('status')
    );
    const dataIndex = headers.findIndex(h => 
      h && h.toString().toLowerCase().includes('data')
    );

    // Extrair valores únicos
    const operadores = new Map<string, number>();
    const filas = new Map<string, number>();
    const status = new Map<string, number>();
    const datas = new Set<string>();

    rows.forEach(row => {
      if (operadorIndex >= 0 && row[operadorIndex]) {
        const value = row[operadorIndex].toString();
        operadores.set(value, (operadores.get(value) || 0) + 1);
      }
      if (filaIndex >= 0 && row[filaIndex]) {
        const value = row[filaIndex].toString();
        filas.set(value, (filas.get(value) || 0) + 1);
      }
      if (statusIndex >= 0 && row[statusIndex]) {
        const value = row[statusIndex].toString();
        status.set(value, (status.get(value) || 0) + 1);
      }
      if (dataIndex >= 0 && row[dataIndex]) {
        datas.add(row[dataIndex].toString());
      }
    });

    setAvailableOptions({
      operadores: Array.from(operadores.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => b.count - a.count),
      filas: Array.from(filas.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => b.count - a.count),
      status: Array.from(status.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => b.count - a.count),
      datas: Array.from(datas).sort()
    });
  }, [data]);

  // Aplicar filtros
  useEffect(() => {
    if (!data || data.length < 2) return;

    const headers = data[0];
    const rows = data.slice(1);

    let filteredRows = rows.filter(row => {
      // Filtro por operador
      if (filters.operador && filters.operador.length > 0) {
        const operadorIndex = headers.findIndex(h => 
          h && h.toString().toLowerCase().includes('operador')
        );
        if (operadorIndex >= 0 && !filters.operador.includes(row[operadorIndex]?.toString())) {
          return false;
        }
      }

      // Filtro por fila
      if (filters.fila && filters.fila.length > 0) {
        const filaIndex = headers.findIndex(h => 
          h && h.toString().toLowerCase().includes('fila')
        );
        if (filaIndex >= 0 && !filters.fila.includes(row[filaIndex]?.toString())) {
          return false;
        }
      }

      // Filtro por status
      if (filters.status && filters.status.length > 0) {
        const statusIndex = headers.findIndex(h => 
          h && h.toString().toLowerCase().includes('status')
        );
        if (statusIndex >= 0 && !filters.status.includes(row[statusIndex]?.toString())) {
          return false;
        }
      }

      // Filtro por data
      if (filters.dataInicio || filters.dataFim) {
        const dataIndex = headers.findIndex(h => 
          h && h.toString().toLowerCase().includes('data')
        );
        if (dataIndex >= 0) {
          const rowDate = new Date(row[dataIndex]);
          if (filters.dataInicio && rowDate < new Date(filters.dataInicio)) {
            return false;
          }
          if (filters.dataFim && rowDate > new Date(filters.dataFim)) {
            return false;
          }
        }
      }

      return true;
    });

    const filteredData = [headers, ...filteredRows];
    onDataFiltered(filteredData);
    onFiltersChange(filters);
  }, [data, filters, onDataFiltered, onFiltersChange]);

  const handleFilterChange = (filterType: keyof SpreadsheetFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value && (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  return (
    <div className="advanced-spreadsheet-filters">
      <div className="filters-header">
        <button
          className="filters-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <i className="fas fa-filter"></i>
          Filtros Avançados
          {getActiveFiltersCount() > 0 && (
            <span className="filter-count">{getActiveFiltersCount()}</span>
          )}
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
        </button>
        
        {getActiveFiltersCount() > 0 && (
          <button className="clear-filters" onClick={clearFilters}>
            <i className="fas fa-times"></i>
            Limpar Filtros
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filters-content">
          <div className="filters-grid">
            {/* Filtro por Operador */}
            <div className="filter-group">
              <label>Operador</label>
              <div className="filter-options">
                {availableOptions.operadores.map(option => (
                  <label key={option.value} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.operador?.includes(option.value) || false}
                      onChange={(e) => {
                        const current = filters.operador || [];
                        const newValue = e.target.checked
                          ? [...current, option.value]
                          : current.filter(v => v !== option.value);
                        handleFilterChange('operador', newValue);
                      }}
                    />
                    <span className="option-label">{option.label}</span>
                    <span className="option-count">({option.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro por Fila */}
            <div className="filter-group">
              <label>Fila</label>
              <div className="filter-options">
                {availableOptions.filas.map(option => (
                  <label key={option.value} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.fila?.includes(option.value) || false}
                      onChange={(e) => {
                        const current = filters.fila || [];
                        const newValue = e.target.checked
                          ? [...current, option.value]
                          : current.filter(v => v !== option.value);
                        handleFilterChange('fila', newValue);
                      }}
                    />
                    <span className="option-label">{option.label}</span>
                    <span className="option-count">({option.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro por Status */}
            <div className="filter-group">
              <label>Status</label>
              <div className="filter-options">
                {availableOptions.status.map(option => (
                  <label key={option.value} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(option.value) || false}
                      onChange={(e) => {
                        const current = filters.status || [];
                        const newValue = e.target.checked
                          ? [...current, option.value]
                          : current.filter(v => v !== option.value);
                        handleFilterChange('status', newValue);
                      }}
                    />
                    <span className="option-label">{option.label}</span>
                    <span className="option-count">({option.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro por Data */}
            <div className="filter-group">
              <label>Período</label>
              <div className="date-filters">
                <div className="date-input">
                  <label>Data Início</label>
                  <input
                    type="date"
                    value={filters.dataInicio || ''}
                    onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                  />
                </div>
                <div className="date-input">
                  <label>Data Fim</label>
                  <input
                    type="date"
                    value={filters.dataFim || ''}
                    onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSpreadsheetFilters;



