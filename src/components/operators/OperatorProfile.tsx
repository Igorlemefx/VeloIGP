// Componente de Perfil de Operador
// Visualização completa dos dados individuais

import React, { useState, useEffect, useCallback } from 'react';
// import { advancedCalculationEngine } from '../../services/advancedCalculationEngine';
import './OperatorProfile.css';

interface OperatorProfileProps {
  operatorId: string;
  operatorName?: string;
  onClose?: () => void;
}

interface OperatorProfileData {
  id: string;
  name: string;
  calls: any[];
  periods: any[];
  metrics: any;
  trends: any;
  comparisons: any;
}

const OperatorProfile: React.FC<OperatorProfileProps> = ({
  operatorId,
  operatorName,
  onClose
}) => {
  const [profileData, setProfileData] = useState<OperatorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'trends' | 'comparisons'>('overview');

  const loadOperatorData = useCallback(async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados do operador
      const mockData = generateMockOperatorData(operatorId, operatorName);
      setProfileData(mockData);
    } catch (error) {
      console.error('Erro ao carregar dados do operador:', error);
    } finally {
      setLoading(false);
    }
  }, [operatorId, operatorName]);

  // Carregar dados do operador
  useEffect(() => {
    loadOperatorData();
  }, [operatorId, loadOperatorData]);

  const generateMockOperatorData = (id: string, name: string): OperatorProfileData => {
    const calls = generateMockCalls(50);
    const periods = generateMockPeriods();
    
    // Gerar métricas simuladas diretamente
    const metrics = {
      totalCalls: calls.length,
      answeredCalls: calls.filter(c => c.status === 'answered').length,
      missedCalls: calls.filter(c => c.status === 'missed').length,
      abandonedCalls: calls.filter(c => c.status === 'abandoned').length,
      totalTalkTime: calls.filter(c => c.status === 'answered').reduce((sum, c) => sum + c.duration, 0),
      averageTalkTime: calls.filter(c => c.status === 'answered').reduce((sum, c) => sum + c.duration, 0) / calls.filter(c => c.status === 'answered').length || 0,
      totalWaitTime: calls.filter(c => c.status === 'answered').reduce((sum, c) => sum + c.waitTime, 0),
      averageWaitTime: calls.filter(c => c.status === 'answered').reduce((sum, c) => sum + c.waitTime, 0) / calls.filter(c => c.status === 'answered').length || 0,
      serviceLevel: 85 + Math.random() * 10,
      efficiency: 80 + Math.random() * 15,
      availability: 90 + Math.random() * 8,
      productivity: 15 + Math.random() * 10,
      firstCallResolution: 75 + Math.random() * 20,
      customerSatisfaction: 80 + Math.random() * 15,
      adherence: 85 + Math.random() * 10,
      ranking: Math.floor(Math.random() * 20) + 1,
      percentile: 70 + Math.random() * 25,
      trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down' | 'stable',
      improvement: (Math.random() - 0.5) * 20
    };
    
    return {
      id,
      name,
      calls,
      periods,
      metrics,
      trends: generateMockTrends(),
      comparisons: generateMockComparisons()
    };
  };

  const generateMockCalls = (count: number) => {
    const calls = [];
    const statuses = ['answered', 'missed', 'abandoned'];
    const queues = ['Suporte', 'Vendas', 'Financeiro', 'Geral'];
    
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      calls.push({
        id: `call-${i}`,
        date: date.toISOString().split('T')[0],
        time: `${String(Math.floor(Math.random() * 8) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        duration: Math.floor(Math.random() * 600) + 30,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        queue: queues[Math.floor(Math.random() * queues.length)],
        waitTime: Math.floor(Math.random() * 60) + 5,
        customerId: `customer-${i}`,
        callType: 'inbound'
      });
    }
    
    return calls;
  };

  const generateMockPeriods = () => {
    return [
      { period: 'Hoje', calls: 15, efficiency: 85 },
      { period: 'Ontem', calls: 18, efficiency: 82 },
      { period: 'Esta Semana', calls: 95, efficiency: 87 },
      { period: 'Semana Passada', calls: 88, efficiency: 84 }
    ];
  };

  const generateMockTrends = () => {
    return {
      calls: [12, 15, 18, 16, 20, 22, 19],
      efficiency: [80, 82, 85, 83, 87, 89, 86],
      satisfaction: [75, 78, 82, 80, 85, 88, 84]
    };
  };

  const generateMockComparisons = () => {
    return {
      teamAverage: 82,
      topPerformer: 95,
      departmentAverage: 85,
      companyAverage: 80
    };
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="operator-profile-overlay">
        <div className="operator-profile">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando perfil do operador...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="operator-profile-overlay">
        <div className="operator-profile">
          <div className="error-container">
            <h3>Erro ao carregar perfil</h3>
            <p>Não foi possível carregar os dados do operador.</p>
            <button onClick={onClose} className="btn-close">Fechar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="operator-profile-overlay">
      <div className="operator-profile">
        {/* Header */}
        <div className="profile-header">
          <div className="operator-info">
            <h2>👤 {profileData.name}</h2>
            <p>ID: {profileData.id}</p>
          </div>
          <div className="profile-actions">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-selector"
            >
              <option value="today">Hoje</option>
              <option value="yesterday">Ontem</option>
              <option value="thisWeek">Esta Semana</option>
              <option value="lastWeek">Semana Passada</option>
              <option value="thisMonth">Este Mês</option>
            </select>
            <button onClick={onClose} className="btn-close">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Visão Geral
          </button>
          <button 
            className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            📈 Métricas
          </button>
          <button 
            className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            📉 Tendências
          </button>
          <button 
            className={`tab ${activeTab === 'comparisons' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparisons')}
          >
            🏆 Comparações
          </button>
        </div>

        {/* Content */}
        <div className="profile-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="metrics-grid">
                <div className="metric-card">
                  <h3>Total de Chamadas</h3>
                  <div className="metric-value">{profileData.metrics.totalCalls}</div>
                </div>
                <div className="metric-card">
                  <h3>Chamadas Atendidas</h3>
                  <div className="metric-value success">{profileData.metrics.answeredCalls}</div>
                </div>
                <div className="metric-card">
                  <h3>Taxa de Atendimento</h3>
                  <div className="metric-value">{formatPercentage(profileData.metrics.availability)}</div>
                </div>
                <div className="metric-card">
                  <h3>Service Level</h3>
                  <div className="metric-value">{formatPercentage(profileData.metrics.serviceLevel)}</div>
                </div>
                <div className="metric-card">
                  <h3>Eficiência</h3>
                  <div className="metric-value">{formatPercentage(profileData.metrics.efficiency)}</div>
                </div>
                <div className="metric-card">
                  <h3>Produtividade</h3>
                  <div className="metric-value">{profileData.metrics.productivity.toFixed(1)} chamadas/h</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="metrics-tab">
              <div className="metrics-section">
                <h3>Métricas de Tempo</h3>
                <div className="metrics-row">
                  <div className="metric-item">
                    <span className="label">Tempo Total de Atendimento:</span>
                    <span className="value">{formatDuration(profileData.metrics.totalTalkTime)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="label">Tempo Médio de Atendimento:</span>
                    <span className="value">{formatDuration(profileData.metrics.averageTalkTime)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="label">Tempo Médio de Espera:</span>
                    <span className="value">{formatDuration(profileData.metrics.averageWaitTime)}</span>
                  </div>
                </div>
              </div>

              <div className="metrics-section">
                <h3>Métricas de Qualidade</h3>
                <div className="metrics-row">
                  <div className="metric-item">
                    <span className="label">First Call Resolution:</span>
                    <span className="value">{formatPercentage(profileData.metrics.firstCallResolution)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="label">Satisfação do Cliente:</span>
                    <span className="value">{formatPercentage(profileData.metrics.customerSatisfaction)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="label">Adherence:</span>
                    <span className="value">{formatPercentage(profileData.metrics.adherence)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="trends-tab">
              <div className="trends-section">
                <h3>Evolução das Chamadas</h3>
                <div className="trend-chart">
                  {profileData.trends.calls.map((value: number, index: number) => (
                    <div key={index} className="trend-bar">
                      <div 
                        className="bar" 
                        style={{ height: `${(value / Math.max(...profileData.trends.calls)) * 100}%` }}
                      ></div>
                      <span className="bar-label">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="trends-section">
                <h3>Evolução da Eficiência</h3>
                <div className="trend-chart">
                  {profileData.trends.efficiency.map((value: number, index: number) => (
                    <div key={index} className="trend-bar">
                      <div 
                        className="bar efficiency" 
                        style={{ height: `${(value / Math.max(...profileData.trends.efficiency)) * 100}%` }}
                      ></div>
                      <span className="bar-label">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comparisons' && (
            <div className="comparisons-tab">
              <div className="comparison-section">
                <h3>Comparações com a Equipe</h3>
                <div className="comparison-grid">
                  <div className="comparison-item">
                    <span className="label">Média da Equipe:</span>
                    <span className="value">{profileData.comparisons.teamAverage}%</span>
                    <span className={`diff ${profileData.metrics.efficiency > profileData.comparisons.teamAverage ? 'positive' : 'negative'}`}>
                      {profileData.metrics.efficiency > profileData.comparisons.teamAverage ? '+' : ''}
                      {(profileData.metrics.efficiency - profileData.comparisons.teamAverage).toFixed(1)}%
                    </span>
                  </div>
                  <div className="comparison-item">
                    <span className="label">Melhor da Equipe:</span>
                    <span className="value">{profileData.comparisons.topPerformer}%</span>
                    <span className={`diff ${profileData.metrics.efficiency > profileData.comparisons.topPerformer ? 'positive' : 'negative'}`}>
                      {profileData.metrics.efficiency > profileData.comparisons.topPerformer ? '+' : ''}
                      {(profileData.metrics.efficiency - profileData.comparisons.topPerformer).toFixed(1)}%
                    </span>
                  </div>
                  <div className="comparison-item">
                    <span className="label">Média do Departamento:</span>
                    <span className="value">{profileData.comparisons.departmentAverage}%</span>
                    <span className={`diff ${profileData.metrics.efficiency > profileData.comparisons.departmentAverage ? 'positive' : 'negative'}`}>
                      {profileData.metrics.efficiency > profileData.comparisons.departmentAverage ? '+' : ''}
                      {(profileData.metrics.efficiency - profileData.comparisons.departmentAverage).toFixed(1)}%
                    </span>
                  </div>
                  <div className="comparison-item">
                    <span className="label">Média da Empresa:</span>
                    <span className="value">{profileData.comparisons.companyAverage}%</span>
                    <span className={`diff ${profileData.metrics.efficiency > profileData.comparisons.companyAverage ? 'positive' : 'negative'}`}>
                      {profileData.metrics.efficiency > profileData.comparisons.companyAverage ? '+' : ''}
                      {(profileData.metrics.efficiency - profileData.comparisons.companyAverage).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperatorProfile;
