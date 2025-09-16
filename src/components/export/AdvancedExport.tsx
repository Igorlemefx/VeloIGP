import React, { useState } from 'react';
import advancedExportService, { ExportOptions } from '../../services/advancedExportService';
import './AdvancedExport.css';

interface AdvancedExportProps {
  data: any[][];
  headers: string[];
  title?: string;
  metadata?: any;
}

const AdvancedExport: React.FC<AdvancedExportProps> = ({ 
  data, 
  headers, 
  title = 'Relatório VeloIGP',
  metadata 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    data: data,
    filename: `relatorio-veloigp-${new Date().toISOString().split('T')[0]}`,
    includeCharts: false,
    includeMetadata: true
  });


  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert('Nenhum dado disponível para exportar');
      return;
    }

    setIsExporting(true);
    
    try {
      // const exportData: ExportData = {
      //   title,
      //   headers,
      //   data,
      //   metadata: {
      //     ...metadata,
      //     generatedAt: new Date(),
      //     totalRecords: data.length
      //   }
      // };

      // Configurar dados
      const exportData = {
        ...exportOptions,
        data: data.flat()
      };
      
      // Exportar
      const result = await advancedExportService.export(exportData);
      
      // Fechar modal após exportação
      setIsOpen(false);
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFormatChange = (format: string) => {
    setExportOptions(prev => ({
      ...prev,
      format: format as ExportOptions['format']
    }));
  };



  return (
    <>
      {/* Botão de Abertura */}
      <button 
        className="export-btn"
        onClick={() => setIsOpen(true)}
        disabled={!data || data.length === 0}
      >
        <i className="fas fa-download"></i>
        Exportar Dados
      </button>

      {/* Modal de Exportação */}
      {isOpen && (
        <div className="export-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <h2>
                <i className="fas fa-download"></i>
                Exportar Dados
              </h2>
              <button 
                className="close-btn"
                onClick={() => setIsOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="export-modal-content">
              {/* Formato de Exportação */}
              <div className="export-section">
                <h3>Formato de Exportação</h3>
                <div className="format-options">
                  {[
                    { value: 'pdf', label: 'PDF', icon: '📄' },
                    { value: 'excel', label: 'Excel', icon: '📊' },
                    { value: 'csv', label: 'CSV', icon: '📋' }
                  ].map((format) => (
                    <label 
                      key={format.value}
                      className={`format-option ${exportOptions.format === format.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={exportOptions.format === format.value}
                        onChange={(e) => handleFormatChange(e.target.value)}
                      />
                      <div className="format-content">
                        <span className="format-icon">{format.icon}</span>
                        <span className="format-label">{format.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>


              {/* Opções Adicionais */}
              <div className="export-section">
                <h3>Opções Adicionais</h3>
                <div className="export-options">
                  <label className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCharts}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        includeCharts: e.target.checked
                      }))}
                    />
                    <span>Incluir gráficos (quando disponível)</span>
                  </label>
                  
                  <label className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeMetadata: e.target.checked
                      }))}
                    />
                    <span>Incluir insights e análises</span>
                  </label>
                </div>
              </div>

              {/* Informações do Dados */}
              <div className="export-section">
                <h3>Informações do Relatório</h3>
                <div className="data-info">
                  <div className="info-item">
                    <span className="info-label">Título:</span>
                    <span className="info-value">{title}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total de Registros:</span>
                    <span className="info-value">{data.length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Colunas:</span>
                    <span className="info-value">{headers.length}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="export-modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </button>
              <button 
                className="export-confirm-btn"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Exportando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download"></i>
                    Exportar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvancedExport;
