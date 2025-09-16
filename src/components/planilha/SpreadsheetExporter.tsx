import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './SpreadsheetExporter.css';

interface SpreadsheetExporterProps {
  data: any[][];
  filename?: string;
  onExport?: (format: string) => void;
}

const SpreadsheetExporter: React.FC<SpreadsheetExporterProps> = ({
  data,
  filename = 'dados-veloigp',
  onExport
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv' | 'json'>('xlsx');

  const exportToXLSX = () => {
    setIsExporting(true);
    
    try {
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');
      
      XLSX.writeFile(wb, `${filename}.xlsx`);
      
      onExport?.('xlsx');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      const csvContent = data
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
      
      onExport?.('csv');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    
    try {
      const headers = data[0];
      const rows = data.slice(1);
      
      const jsonData = rows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      
      const jsonContent = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.json`;
      link.click();
      
      onExport?.('json');
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'xlsx':
        exportToXLSX();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
    }
  };

  return (
    <div className="spreadsheet-exporter">
      <div className="exporter-header">
        <h3>
          <i className="fas fa-download"></i>
          Exportar Dados
        </h3>
        <span className="data-count">
          {data.length - 1} registros
        </span>
      </div>

      <div className="exporter-content">
        <div className="format-selector">
          <label>Formato de Exportação:</label>
          <div className="format-options">
            <label className="format-option">
              <input
                type="radio"
                name="format"
                value="xlsx"
                checked={exportFormat === 'xlsx'}
                onChange={(e) => setExportFormat(e.target.value as any)}
              />
              <span className="format-label">
                <i className="fas fa-file-excel"></i>
                Excel (.xlsx)
              </span>
            </label>
            
            <label className="format-option">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={(e) => setExportFormat(e.target.value as any)}
              />
              <span className="format-label">
                <i className="fas fa-file-csv"></i>
                CSV (.csv)
              </span>
            </label>
            
            <label className="format-option">
              <input
                type="radio"
                name="format"
                value="json"
                checked={exportFormat === 'json'}
                onChange={(e) => setExportFormat(e.target.value as any)}
              />
              <span className="format-label">
                <i className="fas fa-file-code"></i>
                JSON (.json)
              </span>
            </label>
          </div>
        </div>

        <div className="exporter-actions">
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={isExporting || !data || data.length < 2}
          >
            {isExporting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Exportando...
              </>
            ) : (
              <>
                <i className="fas fa-download"></i>
                Exportar {exportFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetExporter;



