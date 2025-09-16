import React, { useState, useEffect, useRef } from 'react';
import './AdvancedSelector.css';

export interface SelectorOption {
  id: string;
  label: string;
  value: any;
  avatar?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  metadata?: {
    calls?: number;
    efficiency?: number;
    queue?: string;
    lastActivity?: string;
  };
  group?: string;
  disabled?: boolean;
}

export interface AdvancedSelectorProps {
  options: SelectorOption[];
  value: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  groupable?: boolean;
  showAvatars?: boolean;
  showStatus?: boolean;
  showMetadata?: boolean;
  className?: string;
  disabled?: boolean;
  maxHeight?: number;
  allowClear?: boolean;
  allowSelectAll?: boolean;
  customRender?: (option: SelectorOption) => React.ReactNode;
}

const AdvancedSelector: React.FC<AdvancedSelectorProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecionar...",
  multiple = false,
  searchable = true,
  groupable = false,
  showAvatars = true,
  showStatus = true,
  showMetadata = true,
  className = '',
  disabled = false,
  maxHeight = 300,
  allowClear = true,
  allowSelectAll = false,
  customRender
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [groups, setGroups] = useState<Record<string, SelectorOption[]>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Agrupar opções se necessário
  useEffect(() => {
    if (groupable && options.length > 0) {
      const grouped = options.reduce((acc, option) => {
        const group = option.group || 'Outros';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(option);
        return acc;
      }, {} as Record<string, SelectorOption[]>);
      setGroups(grouped);
    }
  }, [options, groupable]);

  // Filtrar opções baseado na busca
  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchLower) ||
      option.metadata?.queue?.toLowerCase().includes(searchLower) ||
      option.group?.toLowerCase().includes(searchLower)
    );
  });

  // Opções agrupadas filtradas
  const filteredGroups = Object.keys(groups).reduce((acc, group) => {
    const filtered = groups[group].filter(option => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        option.label.toLowerCase().includes(searchLower) ||
        option.metadata?.queue?.toLowerCase().includes(searchLower)
      );
    });
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {} as Record<string, SelectorOption[]>);

  // Verificar se uma opção está selecionada
  const isSelected = (optionId: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionId);
    }
    return value === optionId;
  };

  // Obter opções selecionadas
  const getSelectedOptions = () => {
    if (multiple && Array.isArray(value)) {
      return options.filter(option => value.includes(option.id));
    }
    if (value && !Array.isArray(value)) {
      return options.filter(option => option.id === value);
    }
    return [];
  };

  // Obter texto de exibição
  const getDisplayText = () => {
    const selected = getSelectedOptions();
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return selected[0].label;
    if (multiple) return `${selected.length} selecionados`;
    return selected[0].label;
  };

  // Manipular seleção
  const handleSelect = (option: SelectorOption) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(option.id)
        ? currentValue.filter(id => id !== option.id)
        : [...currentValue, option.id];
      onChange(newValue.length > 0 ? newValue : null);
    } else {
      onChange(option.id);
      setIsOpen(false);
    }
  };

  // Selecionar todos
  const handleSelectAll = () => {
    if (multiple) {
      const allIds = filteredOptions.map(option => option.id);
      onChange(allIds);
    }
  };

  // Limpar seleção
  const handleClear = () => {
    onChange(null);
  };

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        searchRef.current?.focus();
      }
      return;
    }

    const optionsList = groupable ? Object.values(filteredGroups).flat() : filteredOptions;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < optionsList.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : optionsList.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < optionsList.length) {
          handleSelect(optionsList[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focar no input de busca quando abrir
  useEffect(() => {
    if (isOpen && searchable) {
      searchRef.current?.focus();
    }
  }, [isOpen, searchable]);

  // Renderizar avatar/ícone
  const renderAvatar = (option: SelectorOption) => {
    if (!showAvatars) return null;
    
    if (option.avatar) {
      return (
        <div className="selector-avatar">
          <div className="avatar-icon">
            {option.avatar}
          </div>
          {showStatus && option.status && (
            <div className={`status-indicator status-${option.status}`}></div>
          )}
        </div>
      );
    }
    
    return (
      <div className="selector-avatar">
        <div className="avatar-placeholder">
          <i className="fas fa-user"></i>
        </div>
        {showStatus && option.status && (
          <div className={`status-indicator status-${option.status}`}></div>
        )}
      </div>
    );
  };

  // Renderizar metadata
  const renderMetadata = (option: SelectorOption) => {
    if (!showMetadata || !option.metadata) return null;
    
    return (
      <div className="selector-metadata">
        {option.metadata.queue && (
          <span className="metadata-item">
            <i className="fas fa-list"></i>
            {option.metadata.queue}
          </span>
        )}
        {option.metadata.calls !== undefined && (
          <span className="metadata-item">
            <i className="fas fa-phone"></i>
            {option.metadata.calls} chamadas
          </span>
        )}
        {option.metadata.efficiency !== undefined && (
          <span className="metadata-item">
            <i className="fas fa-chart-line"></i>
            {option.metadata.efficiency}%
          </span>
        )}
      </div>
    );
  };

  // Renderizar opção
  const renderOption = (option: SelectorOption) => {
    if (customRender) {
      return customRender(option);
    }

    return (
      <div
        key={option.id}
        className={`selector-option ${isSelected(option.id) ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}`}
        onClick={() => handleSelect(option)}
      >
        {renderAvatar(option)}
        <div className="option-content">
          <div className="option-label">{option.label}</div>
          {renderMetadata(option)}
        </div>
        {isSelected(option.id) && (
          <div className="selection-indicator">
            <i className="fas fa-check"></i>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`advanced-selector ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Trigger */}
      <div 
        className="selector-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="trigger-content">
          {getSelectedOptions().length > 0 && showAvatars && (
            <div className="selected-avatars">
              {getSelectedOptions().slice(0, 3).map(option => (
                <div key={option.id} className="selected-avatar">
                  {option.avatar ? (
                    <div className="avatar-icon">{option.avatar}</div>
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>
              ))}
              {getSelectedOptions().length > 3 && (
                <div className="more-count">+{getSelectedOptions().length - 3}</div>
              )}
            </div>
          )}
          <span className="trigger-text">{getDisplayText()}</span>
        </div>
        <div className="trigger-actions">
          {allowClear && getSelectedOptions().length > 0 && (
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
        <div className="selector-dropdown" style={{ maxHeight }}>
          {/* Search */}
          {searchable && (
            <div className="selector-search">
              <i className="fas fa-search search-icon"></i>
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          {(allowSelectAll || allowClear) && (
            <div className="selector-actions">
              {allowSelectAll && multiple && (
                <button
                  className="action-btn"
                  onClick={handleSelectAll}
                >
                  <i className="fas fa-check-double"></i>
                  Selecionar Todos
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div ref={listRef} className="selector-options">
            {groupable ? (
              Object.entries(filteredGroups).map(([groupName, groupOptions]) => (
                <div key={groupName} className="option-group">
                  <div className="group-header">{groupName}</div>
                  {groupOptions.map(renderOption)}
                </div>
              ))
            ) : (
              filteredOptions.map(renderOption)
            )}
            
            {filteredOptions.length === 0 && (
              <div className="no-options">
                <i className="fas fa-search"></i>
                <span>Nenhuma opção encontrada</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSelector;
