import React, { useState } from 'react';
import veloigpTestSuite from '../../tests/e2e/testSuite';
import './TestRunner.css';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
  passed: number;
  failed: number;
  skipped: number;
}

const TestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runTests = async () => {
    setIsRunning(true);
    setCurrentTest('Iniciando testes...');
    setTestSuite(null);

    try {
      const results = await veloigpTestSuite.runAllTests();
      setTestSuite(results);
    } catch (error) {
      console.error('Erro ao executar testes:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'skipped': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="test-runner">
      <div className="test-header">
        <h2>
          <i className="fas fa-vial"></i>
          Testes E2E - VeloIGP
        </h2>
        <p>Execute testes automatizados para verificar o funcionamento do sistema</p>
      </div>

      <div className="test-controls">
        <button
          className={`run-tests-btn ${isRunning ? 'running' : ''}`}
          onClick={runTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Executando Testes...
            </>
          ) : (
            <>
              <i className="fas fa-play"></i>
              Executar Testes
            </>
          )}
        </button>

        {isRunning && currentTest && (
          <div className="current-test">
            <i className="fas fa-cog fa-spin"></i>
            {currentTest}
          </div>
        )}
      </div>

      {testSuite && (
        <div className="test-results">
          <div className="results-summary">
            <div className="summary-card">
              <div className="summary-title">Resumo dos Testes</div>
              <div className="summary-stats">
                <div className="stat-item">
                  <div className="stat-value">{testSuite.tests.length}</div>
                  <div className="stat-label">Total</div>
                </div>
                <div className="stat-item passed">
                  <div className="stat-value">{testSuite.passed}</div>
                  <div className="stat-label">Passou</div>
                </div>
                <div className="stat-item failed">
                  <div className="stat-value">{testSuite.failed}</div>
                  <div className="stat-label">Falhou</div>
                </div>
                <div className="stat-item skipped">
                  <div className="stat-value">{testSuite.skipped}</div>
                  <div className="stat-label">Pulou</div>
                </div>
              </div>
              <div className="success-rate">
                Taxa de Sucesso: {((testSuite.passed / testSuite.tests.length) * 100).toFixed(1)}%
              </div>
              <div className="duration">
                Duração Total: {testSuite.totalDuration.toFixed(2)}ms
              </div>
            </div>
          </div>

          <div className="test-details">
            <h3>Detalhes dos Testes</h3>
            <div className="test-list">
              {testSuite.tests.map((test, index) => (
                <div key={index} className={`test-item ${test.status}`}>
                  <div className="test-info">
                    <div className="test-status">
                      <span className="status-icon">{getStatusIcon(test.status)}</span>
                      <span className={`status-text ${getStatusColor(test.status)}`}>
                        {test.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="test-name">{test.name}</div>
                    <div className="test-duration">{test.duration.toFixed(2)}ms</div>
                  </div>
                  {test.error && (
                    <div className="test-error">
                      <i className="fas fa-exclamation-triangle"></i>
                      {test.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {testSuite.failed > 0 && (
            <div className="test-warnings">
              <div className="warning-card">
                <i className="fas fa-exclamation-triangle"></i>
                <div className="warning-content">
                  <h4>Testes Falharam</h4>
                  <p>Alguns testes falharam e precisam ser corrigidos para garantir o funcionamento adequado do sistema.</p>
                </div>
              </div>
            </div>
          )}

          {testSuite.failed === 0 && (
            <div className="test-success">
              <div className="success-card">
                <i className="fas fa-check-circle"></i>
                <div className="success-content">
                  <h4>Todos os Testes Passaram!</h4>
                  <p>O sistema VeloIGP está funcionando perfeitamente. Todas as funcionalidades foram validadas com sucesso.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestRunner;
