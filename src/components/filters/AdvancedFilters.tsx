import React, { useState, useEffect } from 'react';
import { Field, Label } from '../ui/Fieldset';
import Select from '../ui/Select';
import './AdvancedFilters.css';

export interface FilterConfig {
  operators: string[];
  queues: string[];
  dateRange: { start: string; end: string };
  qualityRange: { min: number; max: number };
  callStatus: string[];
  timeRange: { start: string; end: string };
}

interface AdvancedFiltersProps {
  data: any[][];
  onFilterChange: (filteredData: any[][]) => void;
  onConfigChange: (config: FilterConfig) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ 
  data, 
  onFilterChange, 
  onConfigChange 
}) => {
  const [config, setConfig] = useState<FilterConfig>({
    operators: [],
    queues: [],
    dateRange: { start: '', end: '' },
    qualityRange: { min: 1, max: 5 },
    callStatus: [],
    timeRange: { start: '', end: '' }
  });

  const [availableOperators, setAvailableOperators] = useState<string[]>([]);
  const [availableQueues, setAvailableQueues] = useState<string[]>([]);
  const [availableStatus, setAvailableStatus] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Extrair valores únicos dos dados
  useEffect(() => {
    if (!data || data.length === 0) return;

    const headers = data[0] || [];
    const rows = data.slice(1);

    // Encontrar índices das colunas
    const operatorIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('operador') || 
      h?.toLowerCase().includes('operator')
    );
    const queueIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('fila') || 
      h?.toLowerCase().includes('queue')
    );
    const statusIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('chamada') || 
      h?.toLowerCase().includes('status')
    );
    const dateIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('data') || 
      h?.toLowerCase().includes('date')
    );

    // Extrair valores únicos
    const operators = operatorIndex >= 0 ? 
      Array.from(new Set(rows.map(row => row[operatorIndex]).filter(Boolean))) : [];
    const queues = queueIndex >= 0 ? 
      Array.from(new Set(rows.map(row => row[queueIndex]).filter(Boolean))) : [];
    const statuses = statusIndex >= 0 ? 
      Array.from(new Set(rows.map(row => row[statusIndex]).filter(Boolean))) : [];
    const dates = dateIndex >= 0 ? 
      Array.from(new Set(rows.map(row => row[dateIndex]).filter(Boolean))).sort() : [];

    setAvailableOperators(operators);
    setAvailableQueues(queues);
    setAvailableStatus(statuses);
    setAvailableDates(dates);

    // Configurar range de datas
    if (dates.length > 0) {
      setConfig(prev => ({
        ...prev,
        dateRange: {
          start: dates[0],
          end: dates[dates.length - 1]
        }
      }));
    }
  }, [data]);

  // Aplicar filtros
  useEffect(() => {
    if (!data || data.length === 0) return;

    const headers = data[0] || [];
    const rows = data.slice(1);

    let filtered = rows;

    // Filtro por operadores
    if (config.operators.length > 0) {
      const operatorIndex = headers.findIndex(h => 
        h?.toLowerCase().includes('operador') || 
        h?.toLowerCase().includes('operator')
      );
      if (operatorIndex >= 0) {
        filtered = filtered.filter(row => 
          config.operators.includes(row[operatorIndex])
        );
      }
    }

    // Filtro por filas
    if (config.queues.length > 0) {
      const queueIndex = headers.findIndex(h => 
        h?.toLowerCase().includes('fila') || 
        h?.toLowerCase().includes('queue')
      );
      if (queueIndex >= 0) {
        filtered = filtered.filter(row => 
          config.queues.includes(row[queueIndex])
        );
      }
    }

    // Filtro por status
    if (config.callStatus.length > 0) {
      const statusIndex = headers.findIndex(h => 
        h?.toLowerCase().includes('chamada') || 
        h?.toLowerCase().includes('status')
      );
      if (statusIndex >= 0) {
        filtered = filtered.filter(row => 
          config.callStatus.includes(row[statusIndex])
        );
      }
    }

    // Filtro por data
    if (config.dateRange.start && config.dateRange.end) {
      const dateIndex = headers.findIndex(h => 
        h?.toLowerCase().includes('data') || 
        h?.toLowerCase().includes('date')
      );
      if (dateIndex >= 0) {
        filtered = filtered.filter(row => {
          const rowDate = row[dateIndex];
          return rowDate >= config.dateRange.start && rowDate <= config.dateRange.end;
        });
      }
    }

    // Filtro por qualidade (se existir coluna de qualidade)
    const qualityIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('qualidade') || 
      h?.toLowerCase().includes('quality')
    );
    if (qualityIndex >= 0) {
      filtered = filtered.filter(row => {
        const quality = parseFloat(row[qualityIndex]) || 0;
        return quality >= config.qualityRange.min && quality <= config.qualityRange.max;
      });
    }

    onFilterChange([headers, ...filtered]);
    onConfigChange(config);
  }, [data, config, onFilterChange, onConfigChange]);

  const handleOperatorChange = (operator: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      operators: checked 
        ? [...prev.operators, operator]
        : prev.operators.filter(op => op !== operator)
    }));
  };

  const handleQueueChange = (queue: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      queues: checked 
        ? [...prev.queues, queue]
        : prev.queues.filter(q => q !== queue)
    }));
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      callStatus: checked 
        ? [...prev.callStatus, status]
        : prev.callStatus.filter(s => s !== status)
    }));
  };

  const clearAllFilters = () => {
    setConfig({
      operators: [],
      queues: [],
      dateRange: { start: '', end: '' },
      qualityRange: { min: 1, max: 5 },
      callStatus: [],
      timeRange: { start: '', end: '' }
    });
  };

  const selectAllOperators = () => {
    setConfig(prev => ({
      ...prev,
      operators: availableOperators
    }));
  };

  const selectAllQueues = () => {
    setConfig(prev => ({
      ...prev,
      queues: availableQueues
    }));
  };

  const selectAllStatus = () => {
    setConfig(prev => ({
      ...prev,
      callStatus: availableStatus
    }));
  };

  return (
    <div className="advanced-filters">
      <div className="filters-header">
        <h3>
          <i className="fas fa-filter"></i>
          Filtros Avançados
        </h3>
        <button 
          className="toggle-advanced-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Filtros
        </button>
      </div>

      {showAdvanced && (
        <div className="filters-content">
          {/* Filtros Básicos */}
          <div className="filter-section">
            <h4>Filtros Rápidos</h4>
            <div className="quick-filters">
            <Field>
              <Label>Período:</Label>
              <div className="date-range-inputs">
                <Select 
                  value={config.dateRange.start}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  placeholder="Data inicial"
                >
                  <option value="">Data inicial</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </Select>
                <Select 
                  value={config.dateRange.end}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  placeholder="Data final"
                >
                  <option value="">Data final</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </Select>
              </div>
            </Field>

              <div className="filter-group">
                <label>Qualidade:</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={config.qualityRange.min}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      qualityRange: { ...prev.qualityRange, min: parseInt(e.target.value) }
                    }))}
                    className="range-input"
                    placeholder="Min"
                  />
                  <span>até</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={config.qualityRange.max}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      qualityRange: { ...prev.qualityRange, max: parseInt(e.target.value) }
                    }))}
                    className="range-input"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros por Operador */}
          <div className="filter-section">
            <div className="filter-section-header">
              <h4>Operadores</h4>
              <button onClick={selectAllOperators} className="select-all-btn">
                Selecionar Todos
              </button>
            </div>
            <div className="checkbox-grid">
              {availableOperators.map(operator => (
                <label key={operator} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={config.operators.includes(operator)}
                    onChange={(e) => handleOperatorChange(operator, e.target.checked)}
                  />
                  <span className="checkbox-label">{operator}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtros por Fila */}
          <div className="filter-section">
            <div className="filter-section-header">
              <h4>Filas</h4>
              <button onClick={selectAllQueues} className="select-all-btn">
                Selecionar Todos
              </button>
            </div>
            <div className="checkbox-grid">
              {availableQueues.map(queue => (
                <label key={queue} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={config.queues.includes(queue)}
                    onChange={(e) => handleQueueChange(queue, e.target.checked)}
                  />
                  <span className="checkbox-label">{queue}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtros por Status */}
          <div className="filter-section">
            <div className="filter-section-header">
              <h4>Status da Chamada</h4>
              <button onClick={selectAllStatus} className="select-all-btn">
                Selecionar Todos
              </button>
            </div>
            <div className="checkbox-grid">
              {availableStatus.map(status => (
                <label key={status} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={config.callStatus.includes(status)}
                    onChange={(e) => handleStatusChange(status, e.target.checked)}
                  />
                  <span className="checkbox-label">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="filter-actions">
            <button onClick={clearAllFilters} className="clear-filters-btn">
              <i className="fas fa-times"></i>
              Limpar Todos os Filtros
            </button>
            <div className="filter-stats">
              <span>
                {config.operators.length} operadores, {config.queues.length} filas, {config.callStatus.length} status
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
