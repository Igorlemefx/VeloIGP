import React, { useState, useEffect } from 'react';
import './DateRangeSelector.css';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: Array<{
    label: string;
    value: DateRange;
    icon?: string;
  }>;
  className?: string;
  disabled?: boolean;
  showPresets?: boolean;
  showTime?: boolean;
  placeholder?: string;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  presets = [],
  className = '',
  disabled = false,
  showPresets = true,
  showTime = false,
  placeholder = "Selecionar período"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value);

  // Atualizar range temporário quando o valor muda
  useEffect(() => {
    setTempRange(value);
  }, [value]);

  // Presets padrão
  const defaultPresets = [
    {
      label: 'Hoje',
      value: {
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999))
      },
      icon: 'fas fa-calendar-day'
    },
    {
      label: 'Ontem',
      value: (() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const start = new Date(yesterday);
        start.setHours(0, 0, 0, 0);
        const end = new Date(yesterday);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      })(),
      icon: 'fas fa-calendar-minus'
    },
    {
      label: 'Esta Semana',
      value: (() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - today.getDay() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek, end: endOfWeek };
      })(),
      icon: 'fas fa-calendar-week'
    },
    {
      label: 'Semana Passada',
      value: (() => {
        const today = new Date();
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        startOfLastWeek.setHours(0, 0, 0, 0);
        const endOfLastWeek = new Date(today);
        endOfLastWeek.setDate(today.getDate() - today.getDay() - 1);
        endOfLastWeek.setHours(23, 59, 59, 999);
        return { start: startOfLastWeek, end: endOfLastWeek };
      })(),
      icon: 'fas fa-calendar-week'
    },
    {
      label: 'Este Mês',
      value: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)
      },
      icon: 'fas fa-calendar-alt'
    },
    {
      label: 'Mês Passado',
      value: {
        start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59, 999)
      },
      icon: 'fas fa-calendar-alt'
    },
    {
      label: 'Últimos 7 dias',
      value: (() => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const end = new Date(today);
        end.setHours(23, 59, 59, 999);
        return { start: sevenDaysAgo, end };
      })(),
      icon: 'fas fa-calendar-check'
    },
    {
      label: 'Últimos 30 dias',
      value: (() => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        const end = new Date(today);
        end.setHours(23, 59, 59, 999);
        return { start: thirtyDaysAgo, end };
      })(),
      icon: 'fas fa-calendar-check'
    }
  ];

  const allPresets = [...defaultPresets, ...presets];

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayText = () => {
    if (!value.start && !value.end) return placeholder;
    if (value.start && value.end) {
      return `${formatDate(value.start)} - ${formatDate(value.end)}`;
    }
    if (value.start) return `A partir de ${formatDate(value.start)}`;
    if (value.end) return `Até ${formatDate(value.end)}`;
    return placeholder;
  };

  const handlePresetSelect = (preset: typeof allPresets[0]) => {
    onChange(preset.value);
    setIsOpen(false);
  };

  const handleDateChange = (field: 'start' | 'end', dateString: string) => {
    const date = dateString ? new Date(dateString) : null;
    const newRange = { ...tempRange, [field]: date };
    setTempRange(newRange);
  };

  const handleTimeChange = (field: 'start' | 'end', timeString: string) => {
    if (!tempRange[field]) return;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(tempRange[field]!);
    newDate.setHours(hours, minutes, 0, 0);
    
    const newRange = { ...tempRange, [field]: newDate };
    setTempRange(newRange);
  };

  const handleApply = () => {
    onChange(tempRange);
    setIsOpen(false);
  };

  const handleClear = () => {
    const emptyRange = { start: null, end: null };
    setTempRange(emptyRange);
    onChange(emptyRange);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempRange(value);
    setIsOpen(false);
  };

  return (
    <div className={`date-range-selector ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`}>
      {/* Trigger */}
      <div 
        className="date-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="trigger-content">
          <i className="fas fa-calendar-alt"></i>
          <span className="trigger-text">{getDisplayText()}</span>
        </div>
        <div className="trigger-actions">
          {(value.start || value.end) && (
            <button
              className="clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          <div className="dropdown-icon">
            <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="date-dropdown">
          {/* Presets */}
          {showPresets && allPresets.length > 0 && (
            <div className="presets-section">
              <div className="section-header">
                <i className="fas fa-clock"></i>
                Períodos Rápidos
              </div>
              <div className="presets-grid">
                {allPresets.map((preset, index) => (
                  <button
                    key={index}
                    className="preset-btn"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <i className={preset.icon || 'fas fa-calendar'}></i>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Range */}
          <div className="custom-range-section">
            <div className="section-header">
              <i className="fas fa-calendar-plus"></i>
              Período Personalizado
            </div>
            
            <div className="date-inputs">
              <div className="date-input-group">
                <label>Data Inicial</label>
                <div className="input-with-time">
                  <input
                    type="date"
                    value={tempRange.start ? tempRange.start.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="date-input"
                  />
                  {showTime && (
                    <input
                      type="time"
                      value={tempRange.start ? formatTime(tempRange.start) : ''}
                      onChange={(e) => handleTimeChange('start', e.target.value)}
                      className="time-input"
                    />
                  )}
                </div>
              </div>

              <div className="date-separator">
                <i className="fas fa-arrow-right"></i>
              </div>

              <div className="date-input-group">
                <label>Data Final</label>
                <div className="input-with-time">
                  <input
                    type="date"
                    value={tempRange.end ? tempRange.end.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="date-input"
                  />
                  {showTime && (
                    <input
                      type="time"
                      value={tempRange.end ? formatTime(tempRange.end) : ''}
                      onChange={(e) => handleTimeChange('end', e.target.value)}
                      className="time-input"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="date-actions">
            <button
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleApply}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
