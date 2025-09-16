import React, { useState, useEffect } from 'react';
import { intelligentReportsService } from '../../services/intelligentReportsService';
import { alertNotificationService } from '../../services/alertNotificationService';
import './IntelligentReports.css';

interface IntelligentInsight {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  actionable: boolean;
  actionText?: string;
  impact: number;
  confidence: number;
  timestamp: Date;
}

interface IntelligentReportsProps {
  data: any[];
  onInsightClick?: (insight: IntelligentInsight) => void;
}

const IntelligentReports: React.FC<IntelligentReportsProps> = ({ data, onInsightClick }) => {
  const [insights, setInsights] = useState<IntelligentInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const generateInsights = React.useCallback(async () => {
    setLoading(true);
    try {
      const report = await intelligentReportsService.generateComprehensiveReport();
      setInsights(report.insights || []);
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    } finally {
      setLoading(false);
    }
  }, [data]);

  const checkAlerts = React.useCallback(async () => {
    try {
      await alertNotificationService.checkData(data);
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
    }
  }, [data]);

  useEffect(() => {
    if (data.length > 0) {
      generateInsights();
      checkAlerts();
    }
  }, [data, generateInsights, checkAlerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--velotax-error)';
      case 'high': return 'var(--velotax-warning)';
      case 'medium': return 'var(--velotax-info)';
      case 'low': return 'var(--velotax-success)';
      default: return 'var(--velotax-text-secondary)';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return 'ℹ️';
      case 'low': return '💡';
      default: return '📊';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return '📈';
      case 'trend': return '📊';
      case 'anomaly': return '🔍';
      case 'recommendation': return '💡';
      default: return '📋';
    }
  };

  const filteredInsights = insights.filter(insight => {
    const typeMatch = selectedType === 'all' || insight.type === selectedType;
    const severityMatch = selectedSeverity === 'all' || insight.severity === selectedSeverity;
    return typeMatch && severityMatch;
  });

  const stats = {
    total: insights.length,
    critical: insights.filter(i => i.severity === 'critical').length,
    high: insights.filter(i => i.severity === 'high').length,
    medium: insights.filter(i => i.severity === 'medium').length,
    low: insights.filter(i => i.severity === 'low').length,
    actionable: insights.filter(i => i.actionable).length
  };

  return (
    <div className="intelligent-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <h2 className="reports-title">
            <span className="title-icon">🧠</span>
            Relatórios Inteligentes
          </h2>
          <p className="reports-subtitle">
            Análises automáticas e insights baseados em IA
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={generateInsights}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i>
            {loading ? 'Analisando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="insights-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total de Insights</div>
        </div>
        <div className="stat-card critical">
          <div className="stat-value">{stats.critical}</div>
          <div className="stat-label">Críticos</div>
        </div>
        <div className="stat-card high">
          <div className="stat-value">{stats.high}</div>
          <div className="stat-label">Alto</div>
        </div>
        <div className="stat-card medium">
          <div className="stat-value">{stats.medium}</div>
          <div className="stat-label">Médio</div>
        </div>
        <div className="stat-card low">
          <div className="stat-value">{stats.low}</div>
          <div className="stat-label">Baixo</div>
        </div>
        <div className="stat-card actionable">
          <div className="stat-value">{stats.actionable}</div>
          <div className="stat-label">Acionáveis</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="insights-filters">
        <div className="filter-group">
          <label>Tipo:</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="performance">Performance</option>
            <option value="trend">Tendências</option>
            <option value="anomaly">Anomalias</option>
            <option value="recommendation">Recomendações</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Severidade:</label>
          <select 
            value={selectedSeverity} 
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      {/* Lista de Insights */}
      <div className="insights-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Analisando dados e gerando insights...</p>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>Nenhum insight encontrado</h3>
            <p>Os dados serão analisados automaticamente quando disponíveis.</p>
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <div 
              key={insight.id} 
              className={`insight-card ${insight.severity} ${insight.actionable ? 'actionable' : ''}`}
              onClick={() => onInsightClick?.(insight)}
            >
              <div className="insight-header">
                <div className="insight-type">
                  <span className="type-icon">{getTypeIcon(insight.type)}</span>
                  <span className="type-label">{insight.type}</span>
                </div>
                <div className="insight-severity">
                  <span className="severity-icon">{getSeverityIcon(insight.severity)}</span>
                  <span 
                    className="severity-label"
                    style={{ color: getSeverityColor(insight.severity) }}
                  >
                    {insight.severity}
                  </span>
                </div>
              </div>
              
              <div className="insight-content">
                <h3 className="insight-title">{insight.title}</h3>
                <p className="insight-description">{insight.description}</p>
                
                {insight.actionable && insight.actionText && (
                  <div className="insight-action">
                    <span className="action-label">Ação sugerida:</span>
                    <span className="action-text">{insight.actionText}</span>
                  </div>
                )}
              </div>
              
              <div className="insight-footer">
                <div className="insight-metrics">
                  <div className="metric">
                    <span className="metric-label">Impacto:</span>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ width: `${insight.impact}%` }}
                      ></div>
                    </div>
                    <span className="metric-value">{insight.impact}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Confiança:</span>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ width: `${insight.confidence}%` }}
                      ></div>
                    </div>
                    <span className="metric-value">{insight.confidence}%</span>
                  </div>
                </div>
                
                <div className="insight-timestamp">
                  {new Date(insight.timestamp).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IntelligentReports;
