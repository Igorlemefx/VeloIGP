import React, { useState, useEffect } from 'react';
import { googleSheetsService, SpreadsheetData, SheetData } from '../services/googleSheetsService';
import { calculationEngine } from '../services/calculationEngine';
import './VeloigpSpreadsheet.css';
import '../styles/filters.css';

interface SpreadsheetFilters {
  operador?: string[];
  fila?: string[];
  dataInicio?: string;
  dataFim?: string;
  status?: string[];
  qualidadeMinima?: number;
}

const VeloigpSpreadsheet: React.FC = () => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetData[]>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [filters, setFilters] = useState<SpreadsheetFilters>({});
  const [filteredData, setFilteredData] = useState<any[][]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [availableOperators, setAvailableOperators] = useState<string[]>([]);
  const [availableQueues, setAvailableQueues] = useState<string[]>([]);

  useEffect(() => {
    initializeService();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeService = async () => {
    try {
      console.log('🔧 Inicializando serviço Google Sheets...');
      
      // Configurar serviço para usar API key real
      googleSheetsService.configure({
        credentials: {
          type: 'service_account',
          project_id: 'veloigp',
          private_key_id: 'real-key-id',
          private_key: '-----BEGIN PRIVATE KEY-----\nreal-key\n-----END PRIVATE KEY-----\n',
          client_email: 'veloigp-sheets-service-333@veloigp.iam.gserviceaccount.com',
          client_id: 'real-client-id',
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/veloigp-sheets-service-333%40veloigp.iam.gserviceaccount.com'
        },
        spreadsheetId: '1Ksc8TwB6FG_Vn-xLbxMMOHqh61Vu60Jp',
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets.readonly',
          'https://www.googleapis.com/auth/drive.readonly'
        ]
      });
      
      console.log('✅ Serviço configurado, carregando planilhas...');
      setIsConfigured(true);
      await loadSpreadsheets();
    } catch (err) {
      console.error('❌ Erro ao inicializar serviço:', err);
      setError('Erro ao inicializar serviço Google Sheets');
    }
  };

  const loadSpreadsheets = async () => {
    if (!isConfigured) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await googleSheetsService.listSpreadsheets();
      setSpreadsheets(data);
      
      // Extrair operadores e filas únicos dos dados
      if (data.length > 0 && data[0].sheets.length > 0) {
        const sheetData = data[0].sheets[0];
        if (sheetData.data.length > 0) {
          const operators = Array.from(new Set(sheetData.data.map(row => row[2]).filter(Boolean))) as string[];
          const queues = Array.from(new Set(sheetData.data.map(row => row[10]).filter(Boolean))) as string[];
          setAvailableOperators(operators);
          setAvailableQueues(queues);
        }
      }
    } catch (err) {
      setError('Erro ao carregar planilhas');
    } finally {
      setLoading(false);
    }
  };

  const selectSpreadsheet = async (spreadsheet: SpreadsheetData) => {
    setSelectedSpreadsheet(spreadsheet);
    setSelectedSheet(null);
    
    try {
      const data = await googleSheetsService.getSpreadsheetData(spreadsheet.id);
      const updatedSpreadsheet = { ...spreadsheet, sheets: data };
      setSelectedSpreadsheet(updatedSpreadsheet);
    } catch (err) {
      setError('Erro ao carregar dados da planilha');
    }
  };

  const selectSheet = (sheet: SheetData) => {
    setSelectedSheet(sheet);
    setFilteredData(sheet.data);
  };

  const applyFilters = () => {
    if (!selectedSheet?.data) return;
    
    let filtered = selectedSheet.data;
    
    // Filtro por operador
    if (filters.operador && filters.operador.length > 0) {
      filtered = filtered.filter(row => filters.operador!.includes(row[2]));
    }
    
    // Filtro por fila
    if (filters.fila && filters.fila.length > 0) {
      filtered = filtered.filter(row => filters.fila!.includes(row[10]));
    }
    
    // Filtro por data
    if (filters.dataInicio) {
      filtered = filtered.filter(row => {
        const rowDate = new Date(row[3]);
        const startDate = new Date(filters.dataInicio!);
        return rowDate >= startDate;
      });
    }
    
    if (filters.dataFim) {
      filtered = filtered.filter(row => {
        const rowDate = new Date(row[3]);
        const endDate = new Date(filters.dataFim!);
        return rowDate <= endDate;
      });
    }
    
    // Filtro por qualidade mínima
    if (filters.qualidadeMinima) {
      filtered = filtered.filter(row => {
        const qualidade = parseFloat(row[27]) || 0; // Pergunta 1
        return qualidade >= filters.qualidadeMinima!;
      });
    }
    
    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setFilters({});
    setFilteredData(selectedSheet?.data || []);
  };

  const handleFilterChange = (key: keyof SpreadsheetFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportData = (format: 'csv' | 'excel') => {
    if (!selectedSheet) return;
    
    const filename = `${selectedSpreadsheet?.title}_${selectedSheet.title}`;
    
    if (format === 'csv') {
      googleSheetsService.exportToCSV(selectedSheet.data, filename);
    } else {
      googleSheetsService.exportToExcel(selectedSheet.data, filename);
    }
  };

  const analyzeData = async () => {
    if (!selectedSheet) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Processar dados da planilha usando o motor de cálculo
      const report = await calculationEngine.generateSpreadsheetReport(selectedSheet.data);
      setAnalysisData(report);
      setShowAnalysis(true);
    } catch (err) {
      setError('Erro ao analisar dados da planilha');
      console.error('Erro na análise:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="container-main">
        <div className="spreadsheet-loading">
          <div className="loading-spinner"></div>
          <p>Configurando integração com Google Sheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main">
      <div className="spreadsheet-header">
        <h1>Planilhas 55PBX</h1>
        <div className="header-actions">
          {selectedSheet && (
            <button 
              className="btn-filters" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="fas fa-filter"></i>
              Filtros
            </button>
          )}
          <button 
            className="btn-refresh" 
            onClick={loadSpreadsheets}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i>
            Atualizar
          </button>
        </div>
      </div>

      {/* Seção de Filtros */}
      {showFilters && selectedSheet && (
        <div className="filters-section">
          <div className="filters-header">
            <h3>Filtros Avançados</h3>
            <button className="btn-clear" onClick={clearFilters}>
              <i className="fas fa-times"></i>
              Limpar
            </button>
          </div>
          
          <div className="filters-grid">
            {/* Filtro por Operador */}
            <div className="filter-group">
              <label>Operador:</label>
              <select 
                multiple
                value={filters.operador || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('operador', values);
                }}
              >
                {availableOperators.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Fila */}
            <div className="filter-group">
              <label>Fila:</label>
              <select 
                multiple
                value={filters.fila || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('fila', values);
                }}
              >
                {availableQueues.map(queue => (
                  <option key={queue} value={queue}>{queue}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Data Início */}
            <div className="filter-group">
              <label>Data Início:</label>
              <input 
                type="date"
                value={filters.dataInicio || ''}
                onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
              />
            </div>

            {/* Filtro por Data Fim */}
            <div className="filter-group">
              <label>Data Fim:</label>
              <input 
                type="date"
                value={filters.dataFim || ''}
                onChange={(e) => handleFilterChange('dataFim', e.target.value)}
              />
            </div>

            {/* Filtro por Qualidade Mínima */}
            <div className="filter-group">
              <label>Qualidade Mínima:</label>
              <input 
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={filters.qualidadeMinima || ''}
                onChange={(e) => handleFilterChange('qualidadeMinima', parseFloat(e.target.value) || undefined)}
                placeholder="1-5"
              />
            </div>
          </div>

          <div className="filters-actions">
            <button className="btn-apply" onClick={applyFilters}>
              <i className="fas fa-search"></i>
              Aplicar Filtros
            </button>
            <span className="filter-results">
              {filteredData.length} de {selectedSheet.data.length} registros
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="spreadsheet-content">
        {/* Lista de Planilhas */}
        <div className="spreadsheet-list">
          <h2>Planilhas Disponíveis</h2>
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Carregando planilhas...</p>
            </div>
          ) : (
            <div className="spreadsheet-grid">
              {spreadsheets.map((spreadsheet) => (
                <div 
                  key={spreadsheet.id}
                  className={`spreadsheet-card ${
                    selectedSpreadsheet?.id === spreadsheet.id ? 'selected' : ''
                  }`}
                  onClick={() => selectSpreadsheet(spreadsheet)}
                >
                  <div className="spreadsheet-icon">
                    <i className="fab fa-google-drive"></i>
                  </div>
                  <div className="spreadsheet-info">
                    <h3>{spreadsheet.title}</h3>
                    <p className="spreadsheet-meta">
                      {spreadsheet.sheets.length} abas • 
                      Atualizado em {spreadsheet.lastModified.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="spreadsheet-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes da Planilha Selecionada */}
        {selectedSpreadsheet && (
          <div className="spreadsheet-details">
            <div className="details-header">
              <h2>{selectedSpreadsheet.title}</h2>
              <div className="details-actions">
                <button 
                  className="btn-analyze"
                  onClick={analyzeData}
                  disabled={!selectedSheet || loading}
                >
                  <i className="fas fa-chart-line"></i>
                  {loading ? 'Analisando...' : 'Analisar Dados'}
                </button>
                <button 
                  className="btn-export"
                  onClick={() => exportData('csv')}
                  disabled={!selectedSheet}
                >
                  <i className="fas fa-download"></i>
                  Exportar CSV
                </button>
                <button 
                  className="btn-export"
                  onClick={() => exportData('excel')}
                  disabled={!selectedSheet}
                >
                  <i className="fas fa-file-excel"></i>
                  Exportar Excel
                </button>
              </div>
            </div>

            {/* Lista de Abas */}
            <div className="sheets-list">
              <h3>Abas da Planilha</h3>
              <div className="sheets-grid">
                {selectedSpreadsheet.sheets.map((sheet) => (
                  <div 
                    key={sheet.id}
                    className={`sheet-card ${
                      selectedSheet?.id === sheet.id ? 'selected' : ''
                    }`}
                    onClick={() => selectSheet(sheet)}
                  >
                    <div className="sheet-icon">
                      <i className="fas fa-table"></i>
                    </div>
                    <div className="sheet-info">
                      <h4>{sheet.title}</h4>
                      <p>{sheet.rowCount} linhas × {sheet.colCount} colunas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dados da Aba Selecionada */}
            {selectedSheet && (
              <div className="sheet-data">
                <div className="data-header">
                  <h3>{selectedSheet.title}</h3>
                  <div className="data-stats">
                    <span>{filteredData.length} de {selectedSheet.rowCount} linhas</span>
                    <span>{selectedSheet.colCount} colunas</span>
                  </div>
                </div>

                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {selectedSheet.headers.map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Análise de Dados */}
            {showAnalysis && analysisData && (
              <div className="analysis-section">
                <div className="analysis-header">
                  <h3>Análise de Dados - {selectedSheet?.title}</h3>
                  <button 
                    className="btn-close-analysis"
                    onClick={() => setShowAnalysis(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="analysis-content">
                  {/* Métricas Principais */}
                  <div className="analysis-metrics">
                    <h4>Métricas Principais</h4>
                    <div className="metrics-grid">
                      <div className="metric-item">
                        <span className="metric-label">Total de Chamadas:</span>
                        <span className="metric-value">{analysisData.summary.totalCalls}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Taxa de Atendimento:</span>
                        <span className="metric-value">{analysisData.summary.answerRate.toFixed(1)}%</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Tempo Médio de Espera:</span>
                        <span className="metric-value">{analysisData.summary.averageWaitTime.toFixed(1)} min</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Satisfação Média:</span>
                        <span className="metric-value">{analysisData.summary.averageSatisfaction.toFixed(1)}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Qualidade dos Dados */}
                  <div className="data-quality">
                    <h4>Qualidade dos Dados</h4>
                    <div className="quality-indicator">
                      <div className="quality-bar">
                        <div 
                          className="quality-fill" 
                          style={{ width: `${analysisData.dataQuality.dataQuality}%` }}
                        ></div>
                      </div>
                      <span className="quality-percentage">{analysisData.dataQuality.dataQuality.toFixed(1)}%</span>
                    </div>
                    {analysisData.dataQuality.warnings.length > 0 && (
                      <div className="quality-warnings">
                        <h5>Avisos:</h5>
                        <ul>
                          {analysisData.dataQuality.warnings.map((warning: string, index: number) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Recomendações */}
                  <div className="recommendations">
                    <h4>Recomendações</h4>
                    <div className="recommendations-list">
                      {analysisData.recommendations.map((recommendation: string, index: number) => (
                        <div key={index} className="recommendation-item">
                          <i className="fas fa-lightbulb"></i>
                          <span>{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VeloigpSpreadsheet;
