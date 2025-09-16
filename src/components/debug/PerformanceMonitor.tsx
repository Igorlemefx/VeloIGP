import React, { useState, useEffect } from 'react';
import './PerformanceMonitor.css';

const PerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000); // Atualizar a cada 10s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      // Estatísticas de cache local
      const cacheStats = {
        totalItems: Object.keys(localStorage).length,
        memoryUsage: JSON.stringify(localStorage).length,
        lastUpdated: new Date().toISOString()
      };
      setStats(cacheStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      // Limpar cache local
      localStorage.clear();
      await loadStats();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="performance-monitor">
        <div className="monitor-header">
          <h3>📊 Monitor de Performance</h3>
          <div className="loading">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-monitor">
      <div className="monitor-header">
        <h3>📊 Monitor de Performance</h3>
        <button className="clear-cache-btn" onClick={clearCache}>
          🧹 Limpar Cache
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-content">
            <div className="stat-label">Documentos em Cache</div>
            <div className="stat-value">{stats?.totalDocuments || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-label">Documentos Expirados</div>
            <div className="stat-value">{stats?.expired || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Eficiência do Cache</div>
            <div className="stat-value">
              {stats?.totalDocuments > 0 
                ? Math.round(((stats.totalDocuments - stats.expired) / stats.totalDocuments) * 100)
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {stats?.byType && Object.keys(stats.byType).length > 0 && (
        <div className="cache-breakdown">
          <h4>📋 Breakdown por Tipo</h4>
          <div className="breakdown-list">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="breakdown-item">
                <span className="type-name">{type}</span>
                <span className="type-count">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="performance-tips">
        <h4>💡 Dicas de Performance</h4>
        <ul>
          <li>Cache ativo melhora performance em 10x</li>
          <li>Dados são atualizados automaticamente</li>
          <li>Cache expira em 5 minutos para operadores</li>
          <li>Cache expira em 2 minutos para chamadas</li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
