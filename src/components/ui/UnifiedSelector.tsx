import React, { useState, useEffect, useCallback } from 'react';
import AdvancedSelector, { SelectorOption } from './AdvancedSelector';
import DateRangeSelector, { DateRange } from './DateRangeSelector';
import './UnifiedSelector.css';

export interface UnifiedSelectorProps {
  type: 'operators' | 'dates' | 'queues' | 'status';
  value: any;
  onChange: (value: any) => void;
  data?: any[];
  className?: string;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
}

const UnifiedSelector: React.FC<UnifiedSelectorProps> = ({
  type,
  value,
  onChange,
  data = [],
  className = '',
  placeholder,
  multiple = false,
  disabled = false
}) => {
  const [options, setOptions] = useState<SelectorOption[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  // Gerar opções de operadores
  const generateOperatorOptions = useCallback((operatorsData: any[]): SelectorOption[] => {
    const uniqueOperators = new Map();
    
    operatorsData.forEach(row => {
      const operatorName = row.operador || row.Operador || row.operator;
      if (operatorName && !uniqueOperators.has(operatorName)) {
        uniqueOperators.set(operatorName, {
          id: operatorName,
          label: operatorName,
          value: operatorName,
          avatar: getRandomAvatar(),
          status: getRandomStatus(),
          metadata: {
            calls: Math.floor(Math.random() * 100) + 10,
            efficiency: Math.floor(Math.random() * 30) + 70,
            queue: row.fila || row.Fila || 'Geral',
            lastActivity: new Date().toLocaleString('pt-BR')
          }
        });
      }
    });

    return Array.from(uniqueOperators.values());
  }, []);

  // Gerar opções de filas
  const generateQueueOptions = (data: any[]): SelectorOption[] => {
    const uniqueQueues = new Set();
    
    data.forEach(row => {
      const queue = row.fila || row.Fila || row.queue;
      if (queue) {
        uniqueQueues.add(queue);
      }
    });

    return Array.from(uniqueQueues).map(queue => ({
      id: queue as string,
      label: queue as string,
      value: queue as string,
      metadata: {
        calls: Math.floor(Math.random() * 200) + 50
      }
    }));
  };

  // Gerar opções de status
  const generateStatusOptions = (): SelectorOption[] => {
    return [
      {
        id: 'online',
        label: 'Online',
        value: 'online',
        status: 'online',
        metadata: { calls: 0 }
      },
      {
        id: 'offline',
        label: 'Offline',
        value: 'offline',
        status: 'offline',
        metadata: { calls: 0 }
      },
      {
        id: 'busy',
        label: 'Ocupado',
        value: 'busy',
        status: 'busy',
        metadata: { calls: 0 }
      },
      {
        id: 'away',
        label: 'Ausente',
        value: 'away',
        status: 'away',
        metadata: { calls: 0 }
      }
    ];
  };

  // Gerar opções baseadas no tipo
  useEffect(() => {
    let generatedOptions: SelectorOption[] = [];

    switch (type) {
      case 'operators':
        generatedOptions = generateOperatorOptions(data);
        break;
      case 'queues':
        generatedOptions = generateQueueOptions(data);
        break;
      case 'status':
        generatedOptions = generateStatusOptions();
        break;
      default:
        generatedOptions = [];
    }

    setOptions(generatedOptions);
  }, [type, data, generateOperatorOptions]);

  // Gerar avatar aleatório
  const getRandomAvatar = (): string => {
    const avatars = ['👩‍💼', '👨‍💼', '👩‍💻', '👨‍💻', '👩‍🔧', '👨‍🔧', '👩‍🎓', '👨‍🎓'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  // Gerar status aleatório
  const getRandomStatus = (): 'online' | 'offline' | 'busy' | 'away' => {
    const statuses = ['online', 'offline', 'busy', 'away'];
    return statuses[Math.floor(Math.random() * statuses.length)] as any;
  };

  // Obter placeholder padrão
  const getDefaultPlaceholder = () => {
    switch (type) {
      case 'operators': return 'Selecionar operador...';
      case 'dates': return 'Selecionar período...';
      case 'queues': return 'Selecionar fila...';
      case 'status': return 'Selecionar status...';
      default: return 'Selecionar...';
    }
  };

  // Renderizar seletor de data
  if (type === 'dates') {
    return (
      <div className={`unified-selector unified-selector--dates ${className}`}>
        <DateRangeSelector
          value={dateRange}
          onChange={(range) => {
            setDateRange(range);
            onChange(range);
          }}
          disabled={disabled}
          placeholder={placeholder || getDefaultPlaceholder()}
          showPresets={true}
          showTime={false}
        />
      </div>
    );
  }

  // Renderizar seletor avançado
  return (
    <div className={`unified-selector unified-selector--${type} ${className}`}>
      <AdvancedSelector
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder || getDefaultPlaceholder()}
        multiple={multiple}
        searchable={true}
        groupable={type === 'operators'}
        showAvatars={type === 'operators'}
        showStatus={type === 'operators' || type === 'status'}
        showMetadata={type === 'operators'}
        disabled={disabled}
        allowClear={true}
        allowSelectAll={multiple && type !== 'status'}
      />
    </div>
  );
};

export default UnifiedSelector;
