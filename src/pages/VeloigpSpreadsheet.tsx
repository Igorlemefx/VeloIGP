import React, { useState, useEffect } from 'react';
import { googleSheetsService, SpreadsheetData, SheetData } from '../services/googleSheetsService';
import './VeloigpSpreadsheet.css';

const VeloigpSpreadsheet: React.FC = () => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetData[]>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    try {
      // Simular configuração do serviço
      googleSheetsService.configure({
        apiKey: 'demo-api-key',
        spreadsheetId: 'demo-spreadsheet-id'
      });
      
      setIsConfigured(true);
      await loadSpreadsheets();
    } catch (err) {
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
                    <span>{selectedSheet.rowCount} linhas</span>
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
                      {selectedSheet.data.map((row, rowIndex) => (
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
          </div>
        )}
      </div>
    </div>
  );
};

export default VeloigpSpreadsheet;
