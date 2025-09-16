import React, { useState, useEffect } from 'react';
import { performanceService } from '../services/performanceService';
import './PerformanceMonitor.css';

interface PerformanceMonitorProps {
  show?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ show = false }) => {
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (!isVisible) return;

    const updateStats = () => {
      const report = performanceService.getPerformanceReport();
      setStats(report);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible || !stats) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceStatus = () => {
    const memoryUsage = (stats.memory.used / stats.memory.limit) * 100;
    if (memoryUsage > 80) return 'critical';
    if (memoryUsage > 60) return 'warning';
    return 'good';
  };

  const status = getPerformanceStatus();

  return (
    <div className={`performance-monitor ${status}`}>
      <div className="performance-header">
        <h4>📊 Performance Monitor</h4>
        <button 
          className="close-btn"
          onClick={() => setIsVisible(false)}
        >
          ×
        </button>
      </div>
      
      <div className="performance-metrics">
        <div className="metric-group">
          <h5>💾 Cache</h5>
          <div className="metric-item">
            <span>Hit Rate:</span>
            <span className="metric-value">{stats.cache.hitRate}%</span>
          </div>
          <div className="metric-item">
            <span>Size:</span>
            <span className="metric-value">{stats.cache.size}/{stats.cache.maxSize}</span>
          </div>
        </div>

        <div className="metric-group">
          <h5>🧠 Memória</h5>
          <div className="metric-item">
            <span>Usado:</span>
            <span className="metric-value">{formatBytes(stats.memory.used)}</span>
          </div>
          <div className="metric-item">
            <span>Total:</span>
            <span className="metric-value">{formatBytes(stats.memory.total)}</span>
          </div>
          <div className="metric-item">
            <span>Limite:</span>
            <span className="metric-value">{formatBytes(stats.memory.limit)}</span>
          </div>
        </div>

        <div className="metric-group">
          <h5>⏱️ Timing</h5>
          <div className="metric-item">
            <span>Load Time:</span>
            <span className="metric-value">{stats.timing.loadTime.toFixed(2)}ms</span>
          </div>
          <div className="metric-item">
            <span>Last Update:</span>
            <span className="metric-value">
              {new Date(stats.timing.lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div className="performance-actions">
        <button 
          className="action-btn"
          onClick={() => performanceService.clearCache()}
        >
          🧹 Limpar Cache
        </button>
        <button 
          className="action-btn"
          onClick={() => performanceService.startPerformanceMonitoring()}
        >
          🔄 Reiniciar Monitor
        </button>
      </div>
    </div>
  );
};

export default PerformanceMonitor;

