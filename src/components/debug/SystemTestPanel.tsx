import React, { useState } from 'react';
import { systemTester } from '../../utils/systemTester';
import { debugService } from '../../services/debugService';
import './SystemTestPanel.css';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}

const SystemTestPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0, skipped: 0 });

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      const testResults = await systemTester.runAllTests();
      setResults(testResults);
      setSummary(systemTester.getSummary());
      
      debugService.log('🧪 Testes concluídos', { results: testResults, summary: systemTester.getSummary() });
    } catch (error) {
      debugService.error('❌ Erro ao executar testes', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'SKIP': return '⏭️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return '#10b981';
      case 'FAIL': return '#ef4444';
      case 'SKIP': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (!isVisible) {
    return (
      <button
        className="test-panel-toggle"
        onClick={() => setIsVisible(true)}
        title="Abrir painel de testes"
      >
        🧪
      </button>
    );
  }

  return (
    <div className="test-panel-overlay">
      <div className="test-panel">
        <div className="test-panel-header">
          <h3>🧪 Testes do Sistema</h3>
          <button
            className="test-panel-close"
            onClick={() => setIsVisible(false)}
          >
            ✕
          </button>
        </div>

        <div className="test-panel-content">
          <div className="test-controls">
            <button
              className="test-run-btn"
              onClick={runTests}
              disabled={isRunning}
            >
              {isRunning ? '🔄 Executando...' : '▶️ Executar Testes'}
            </button>
            
            {summary.total > 0 && (
              <div className="test-summary">
                <div className="summary-item">
                  <span className="summary-label">Total:</span>
                  <span className="summary-value">{summary.total}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Passou:</span>
                  <span className="summary-value" style={{ color: '#10b981' }}>{summary.passed}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Falhou:</span>
                  <span className="summary-value" style={{ color: '#ef4444' }}>{summary.failed}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Pulou:</span>
                  <span className="summary-value" style={{ color: '#f59e0b' }}>{summary.skipped}</span>
                </div>
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className="test-results">
              <h4>Resultados dos Testes:</h4>
              <div className="results-list">
                {results.map((result, index) => (
                  <div key={index} className="result-item">
                    <div className="result-header">
                      <span className="result-icon">{getStatusIcon(result.status)}</span>
                      <span className="result-name">{result.test}</span>
                      <span className="result-duration">{result.duration}ms</span>
                    </div>
                    <div className="result-message" style={{ color: getStatusColor(result.status) }}>
                      {result.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isRunning && (
            <div className="test-loading">
              <div className="loading-spinner"></div>
              <p>Executando testes do sistema...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemTestPanel;



