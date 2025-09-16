// Lista de Operadores com Perfis
// Interface para visualizar e acessar perfis individuais

import React, { useState, useEffect, useCallback } from 'react';
import OperatorProfile from './OperatorProfile';
import './OperatorsList.css';

interface Operator {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  calls: number;
  efficiency: number;
  serviceLevel: number;
  lastActivity: string;
  queue: string;
  avatar?: string;
}

interface OperatorsListProps {
  operators?: Operator[];
  data?: any;
  onOperatorClick?: (operatorId: string) => void;
}

const OperatorsList: React.FC<OperatorsListProps> = ({ operators: propOperators, data, onOperatorClick }) => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'efficiency' | 'calls' | 'serviceLevel'>('efficiency');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadOperatorsData = useCallback(async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados dos operadores
      const mockOperators = generateMockOperators();
      setOperators(mockOperators);
    } catch (error) {
      console.error('Erro ao carregar dados dos operadores:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados dos operadores
  useEffect(() => {
    if (propOperators) {
      setOperators(propOperators);
      setLoading(false);
    } else {
      loadOperatorsData();
    }
  }, [propOperators, data, loadOperatorsData]);

  const generateMockOperators = (): Operator[] => {
    const names = [
      'Ana Silva', 'Carlos Santos', 'Maria Costa', 'João Oliveira',
      'Pedro Lima', 'Fernanda Souza', 'Rafael Alves', 'Camila Rocha',
      'Lucas Ferreira', 'Juliana Martins', 'Diego Silva', 'Patricia Lima'
    ];
    
    const queues = ['Suporte Técnico', 'Vendas', 'Financeiro', 'Geral'];
    const statuses: ('online' | 'offline' | 'busy' | 'away')[] = ['online', 'offline', 'busy', 'away'];
    const avatars = ['👩‍💼', '👨‍💼', '👩‍💻', '👨‍💻', '👩‍🔧', '👨‍🔧', '👩‍🎓', '👨‍🎓', '👩‍💼', '👨‍💼', '👩‍💻', '👨‍💻'];
    
    return names.map((name, index) => ({
      id: `operator-${index + 1}`,
      name,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      calls: Math.floor(Math.random() * 50) + 10,
      efficiency: Math.floor(Math.random() * 30) + 70,
      serviceLevel: Math.floor(Math.random() * 25) + 75,
      lastActivity: new Date(Date.now() - Math.random() * 86400000).toLocaleString('pt-BR'),
      queue: queues[Math.floor(Math.random() * queues.length)],
      avatar: avatars[index % avatars.length]
    }));
  };

  const handleOperatorClick = (operator: Operator) => {
    if (onOperatorClick) {
      onOperatorClick(operator.id);
    } else {
      setSelectedOperator(operator);
    }
  };

  const handleCloseProfile = () => {
    setSelectedOperator(null);
  };

  const filteredOperators = operators.filter(operator =>
    operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.queue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedOperators = [...filteredOperators].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#28a745';
      case 'busy': return '#ffc107';
      case 'away': return '#17a2b8';
      case 'offline': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Ocupado';
      case 'away': return 'Ausente';
      case 'offline': return 'Offline';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="operators-list">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando operadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="operators-list">
      {/* Header */}
      <div className="operators-header">
        <h2>👥 Operadores</h2>
        <div className="operators-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="sort-container">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="name">Nome</option>
              <option value="efficiency">Eficiência</option>
              <option value="calls">Chamadas</option>
              <option value="serviceLevel">Service Level</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-button"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="operators-stats">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{operators.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Online:</span>
          <span className="stat-value success">
            {operators.filter(op => op.status === 'online').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ocupados:</span>
          <span className="stat-value warning">
            {operators.filter(op => op.status === 'busy').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Offline:</span>
          <span className="stat-value error">
            {operators.filter(op => op.status === 'offline').length}
          </span>
        </div>
      </div>

      {/* Operators Grid */}
      <div className="operators-grid">
        {sortedOperators.map((operator) => (
          <div
            key={operator.id}
            className="operator-card"
            onClick={() => handleOperatorClick(operator)}
          >
            <div className="operator-avatar">
              <div className="avatar-icon">
                {operator.avatar}
              </div>
              <div
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(operator.status) }}
              ></div>
            </div>
            
            <div className="operator-info">
              <h3 className="operator-name">{operator.name}</h3>
              <p className="operator-queue">{operator.queue}</p>
              <p className="operator-status">{getStatusText(operator.status)}</p>
            </div>
            
            <div className="operator-metrics">
              <div className="metric">
                <span className="metric-label">Chamadas:</span>
                <span className="metric-value">{operator.calls}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Eficiência:</span>
                <span className="metric-value">{operator.efficiency}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Service Level:</span>
                <span className="metric-value">{operator.serviceLevel}%</span>
              </div>
            </div>
            
            <div className="operator-actions">
              <button className="view-profile-btn">
                Ver Perfil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedOperators.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>Nenhum operador encontrado</h3>
          <p>Tente ajustar os filtros de busca</p>
        </div>
      )}

      {/* Operator Profile Modal */}
      {selectedOperator && (
        <OperatorProfile
          operatorId={selectedOperator.id}
          operatorName={selectedOperator.name}
          onClose={handleCloseProfile}
        />
      )}
    </div>
  );
};

export default OperatorsList;
