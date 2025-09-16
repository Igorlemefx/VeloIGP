import React, { useState, useEffect } from 'react';
import { SystemDiagnostic, DiagnosticResult } from '../utils/systemDiagnostic';
import './SystemDiagnosticPanel.css';

const SystemDiagnosticPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [report, setReport] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  const diagnostic = SystemDiagnostic.getInstance();

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);
    setReport('');
    
    try {
      const diagnosticResults = await diagnostic.runFullDiagnostic();
      setResults(diagnosticResults);
      setReport(diagnostic.generateReport());
    } catch (error: any) {
      console.error('Erro ao executar diagnóstico:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Executar diagnóstico automaticamente ao abrir
  useEffect(() => {
    if (isVisible) {
      runDiagnostic();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button 
        className="diagnostic-toggle"
        onClick={() => setIsVisible(true)}
        title="Abrir Diagnóstico do Sistema"
      >
        <i className="fas fa-stethoscope"></i>
      </button>
    );
  }

  return (
    <div className="diagnostic-panel">
      <div className="diagnostic-header">
        <h3>
          <i className="fas fa-stethoscope"></i>
          Diagnóstico do Sistema VeloIGP
        </h3>
        <div className="diagnostic-actions">
          <button 
            onClick={runDiagnostic}
            disabled={isRunning}
            className="btn btn-primary"
          >
            <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
            {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="btn btn-secondary"
          >
            <i className="fas fa-times"></i>
            Fechar
          </button>
        </div>
      </div>

      <div className="diagnostic-content">
        {isRunning && (
          <div className="diagnostic-loading">
            <div className="loading-spinner"></div>
            <p>Executando diagnóstico completo...</p>
          </div>
        )}

        {!isRunning && results.length > 0 && (
          <>
            <div className="diagnostic-summary">
              <div className="summary-stats">
                <div className="stat success">
                  <span className="stat-number">
                    {results.filter(r => r.status === 'success').length}
                  </span>
                  <span className="stat-label">Sucessos</span>
                </div>
                <div className="stat warning">
                  <span className="stat-number">
                    {results.filter(r => r.status === 'warning').length}
                  </span>
                  <span className="stat-label">Avisos</span>
                </div>
                <div className="stat error">
                  <span className="stat-number">
                    {results.filter(r => r.status === 'error').length}
                  </span>
                  <span className="stat-label">Erros</span>
                </div>
              </div>
            </div>

            <div className="diagnostic-results">
              {results.map((result, index) => (
                <div key={index} className="diagnostic-item">
                  <div className="item-header">
                    <span className="status-icon">
                      {getStatusIcon(result.status)}
                    </span>
                    <h4>{result.component}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(result.status) }}
                    >
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="item-content">
                    <p className="item-message">{result.message}</p>
                    
                    {result.details && (
                      <details className="item-details">
                        <summary>Detalhes</summary>
                        <pre className="details-json">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {report && (
              <div className="diagnostic-report">
                <h4>Relatório Completo</h4>
                <textarea 
                  value={report}
                  readOnly
                  className="report-textarea"
                  rows={20}
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(report)}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-copy"></i>
                  Copiar Relatório
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SystemDiagnosticPanel;
