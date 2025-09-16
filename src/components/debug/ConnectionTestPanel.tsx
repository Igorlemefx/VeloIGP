// Painel de Teste de Conexão
// Interface para testar conectividade com APIs

import React, { useState, useEffect } from 'react';
import { connectionTestService } from '../../services/connectionTestService';
import { api55pbxAuthService } from '../../services/api55pbxAuth';
import './ConnectionTestPanel.css';

interface ConnectionTestPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const ConnectionTestPanel: React.FC<ConnectionTestPanelProps> = ({
  isVisible = true,
  onClose
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [lastTest, setLastTest] = useState<Date | null>(null);

  // Executar teste de conexão
  const runConnectionTest = async () => {
    setIsRunning(true);
    try {
      const testResults = await connectionTestService.runAllTests();
      setResults(testResults);
      setLastTest(new Date());
    } catch (error) {
      console.error('Erro no teste de conexão:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Iniciar autenticação 55PBX
  const startAuth = () => {
    api55pbxAuthService.initiateAuth();
  };

  // Fazer logout
  const logout = () => {
    api55pbxAuthService.logout();
    setResults(null);
  };

  // Executar teste ao montar o componente
  useEffect(() => {
    if (isVisible) {
      runConnectionTest();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="connection-test-panel">
      <div className="panel-header">
        <h3>🔍 Teste de Conexão</h3>
        <div className="panel-actions">
          <button 
            className="btn-test" 
            onClick={runConnectionTest}
            disabled={isRunning}
          >
            {isRunning ? '⏳ Testando...' : '🔄 Testar'}
          </button>
          {onClose && (
            <button className="btn-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="panel-content">
        {isRunning && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Testando conexões...</p>
          </div>
        )}

        {results && (
          <div className="test-results">
            <div className="summary">
              <h4>📊 Resumo</h4>
              <div className="summary-stats">
                <div className={`stat ${results.allConnected ? 'success' : 'error'}`}>
                  <span className="label">Status Geral:</span>
                  <span className="value">
                    {results.allConnected ? '✅ Conectado' : '❌ Problemas'}
                  </span>
                </div>
                <div className="stat">
                  <span className="label">Total:</span>
                  <span className="value">{results.summary.total}</span>
                </div>
                <div className="stat success">
                  <span className="label">Sucesso:</span>
                  <span className="value">{results.summary.success}</span>
                </div>
                <div className="stat error">
                  <span className="label">Erros:</span>
                  <span className="value">{results.summary.errors}</span>
                </div>
                <div className="stat warning">
                  <span className="label">Avisos:</span>
                  <span className="value">{results.summary.warnings}</span>
                </div>
              </div>
            </div>

            <div className="tests">
              <h4>🔍 Testes Individuais</h4>
              {results.tests.map((test: any, index: number) => (
                <div key={index} className={`test-item ${test.status}`}>
                  <div className="test-header">
                    <span className="test-service">{test.service}</span>
                    <span className={`test-status ${test.status}`}>
                      {test.status === 'success' && '✅'}
                      {test.status === 'error' && '❌'}
                      {test.status === 'warning' && '⚠️'}
                    </span>
                  </div>
                  <div className="test-message">{test.message}</div>
                  {test.details && (
                    <div className="test-details">
                      <pre>{JSON.stringify(test.details, null, 2)}</pre>
                    </div>
                  )}
                  <div className="test-timestamp">
                    {new Date(test.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>

            <div className="actions">
              <button 
                className="btn-auth" 
                onClick={startAuth}
                disabled={isRunning}
              >
                🔐 Autenticar 55PBX
              </button>
              <button 
                className="btn-logout" 
                onClick={logout}
                disabled={isRunning}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}

        {lastTest && (
          <div className="last-test">
            <small>Último teste: {lastTest.toLocaleString('pt-BR')}</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionTestPanel;



