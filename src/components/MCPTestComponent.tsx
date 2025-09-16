import React, { useState } from 'react';
import { useMCPGoogleSheets } from '../hooks/useMCPGoogleSheets';
import { useToast } from '../hooks/useToast';
import './MCPTestComponent.css';

const MCPTestComponent: React.FC = () => {
  const {
    isInitialized,
    isLoading,
    error,
    lastUpdate,
    rawData,
    processedData,
    metrics,
    headers,
    initialize,
    readSpreadsheet,
    readSheet,
    listSheets,
    getMetadata,
    testConnection,
    processDataForAnalysis,
    refresh
  } = useMCPGoogleSheets();

  const { showSuccess, showError, showInfo } = useToast();
  const [testRange, setTestRange] = useState('A:AN');
  const [testSheet, setTestSheet] = useState('');

  const handleTestConnection = async () => {
    try {
      await testConnection();
      showSuccess('Teste de Conexão', 'Conexão com a planilha testada com sucesso!');
    } catch (err: any) {
      showError('Erro no Teste', `Erro ao testar conexão: ${err.message}`);
    }
  };

  const handleReadSpreadsheet = async () => {
    try {
      await readSpreadsheet(testRange);
      showSuccess('Leitura da Planilha', 'Dados da planilha lidos com sucesso!');
    } catch (err: any) {
      showError('Erro na Leitura', `Erro ao ler planilha: ${err.message}`);
    }
  };

  const handleProcessData = async () => {
    try {
      await processDataForAnalysis(testRange);
      showSuccess('Processamento de Dados', 'Dados processados para análise com sucesso!');
    } catch (err: any) {
      showError('Erro no Processamento', `Erro ao processar dados: ${err.message}`);
    }
  };

  const handleListSheets = async () => {
    try {
      await listSheets();
      showInfo('Listagem de Abas', 'Abas da planilha listadas no console');
    } catch (err: any) {
      showError('Erro na Listagem', `Erro ao listar abas: ${err.message}`);
    }
  };

  const handleGetMetadata = async () => {
    try {
      await getMetadata();
      showInfo('Metadados', 'Metadados da planilha obtidos no console');
    } catch (err: any) {
      showError('Erro nos Metadados', `Erro ao obter metadados: ${err.message}`);
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      showSuccess('Atualização', 'Dados atualizados com sucesso!');
    } catch (err: any) {
      showError('Erro na Atualização', `Erro ao atualizar dados: ${err.message}`);
    }
  };

  return (
    <div className="mcp-test-component">
      <div className="mcp-test-header">
        <h2>
          <i className="fas fa-plug"></i>
          Teste do MCP Google Sheets Service
        </h2>
        <p>Teste a conexão e leitura da planilha do Google Sheets</p>
      </div>

      {/* Status do Serviço */}
      <div className="mcp-status-section">
        <h3>Status do Serviço</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Inicializado:</span>
            <span className={`status-value ${isInitialized ? 'success' : 'error'}`}>
              {isInitialized ? 'Sim' : 'Não'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Carregando:</span>
            <span className={`status-value ${isLoading ? 'loading' : 'idle'}`}>
              {isLoading ? 'Sim' : 'Não'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Última Atualização:</span>
            <span className="status-value">
              {lastUpdate ? lastUpdate.toLocaleString('pt-BR') : 'Nunca'}
            </span>
          </div>
        </div>
        
        {error && (
          <div className="error-display">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Controles de Teste */}
      <div className="mcp-controls-section">
        <h3>Controles de Teste</h3>
        
        <div className="control-group">
          <label>Range de Teste:</label>
          <input
            type="text"
            value={testRange}
            onChange={(e) => setTestRange(e.target.value)}
            placeholder="Ex: A:AN, A1:Z100"
          />
        </div>

        <div className="control-group">
          <label>Nome da Aba (opcional):</label>
          <input
            type="text"
            value={testSheet}
            onChange={(e) => setTestSheet(e.target.value)}
            placeholder="Ex: Dados, Planilha1"
          />
        </div>

        <div className="control-buttons">
          <button
            className="btn btn-primary"
            onClick={handleTestConnection}
            disabled={isLoading}
          >
            <i className="fas fa-plug"></i>
            Testar Conexão
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleReadSpreadsheet}
            disabled={isLoading || !isInitialized}
          >
            <i className="fas fa-table"></i>
            Ler Planilha
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleProcessData}
            disabled={isLoading || !isInitialized}
          >
            <i className="fas fa-cogs"></i>
            Processar Dados
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleListSheets}
            disabled={isLoading || !isInitialized}
          >
            <i className="fas fa-list"></i>
            Listar Abas
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleGetMetadata}
            disabled={isLoading || !isInitialized}
          >
            <i className="fas fa-info-circle"></i>
            Metadados
          </button>

          <button
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <i className="fas fa-sync-alt"></i>
            Atualizar Tudo
          </button>
        </div>
      </div>

      {/* Dados Brutos */}
      {rawData && (
        <div className="mcp-data-section">
          <h3>Dados Brutos ({rawData.length} linhas)</h3>
          <div className="data-preview">
            <div className="data-table">
              {headers && (
                <div className="table-header">
                  {headers.slice(0, 10).map((header, index) => (
                    <div key={index} className="table-cell header-cell">
                      {header}
                    </div>
                  ))}
                </div>
              )}
              {rawData.slice(0, 5).map((row, rowIndex) => (
                <div key={rowIndex} className="table-row">
                  {row.slice(0, 10).map((cell: any, cellIndex: number) => (
                    <div key={cellIndex} className="table-cell">
                      {String(cell || '').substring(0, 20)}
                      {String(cell || '').length > 20 ? '...' : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {rawData.length > 5 && (
              <p className="data-note">
                Mostrando apenas as primeiras 5 linhas de {rawData.length} total
              </p>
            )}
          </div>
        </div>
      )}

      {/* Dados Processados */}
      {processedData && (
        <div className="mcp-data-section">
          <h3>Dados Processados ({processedData.length} linhas)</h3>
          <div className="data-preview">
            <div className="data-table">
              {processedData.slice(0, 3).map((row, rowIndex) => (
                <div key={rowIndex} className="table-row">
                  <div className="table-cell">
                    <strong>Chamada:</strong> {row['Chamada']}
                  </div>
                  <div className="table-cell">
                    <strong>Operador:</strong> {row['Operador']}
                  </div>
                  <div className="table-cell">
                    <strong>Data:</strong> {row['Data']}
                  </div>
                  <div className="table-cell">
                    <strong>Status:</strong> {row['Desconexão']}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Métricas */}
      {metrics && (
        <div className="mcp-metrics-section">
          <h3>Métricas Calculadas</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{metrics.totalCalls}</div>
              <div className="metric-label">Total de Chamadas</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.answeredCalls}</div>
              <div className="metric-label">Chamadas Atendidas</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.abandonedCalls}</div>
              <div className="metric-label">Chamadas Abandonadas</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.answerRate}%</div>
              <div className="metric-label">Taxa de Atendimento</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.abandonmentRate}%</div>
              <div className="metric-label">Taxa de Abandono</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.avgWaitTimeFormatted}</div>
              <div className="metric-label">Tempo Médio de Espera</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.avgTalkTimeFormatted}</div>
              <div className="metric-label">Tempo Médio de Atendimento</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCPTestComponent;
