import React, { useState, useEffect } from 'react';
import advancedExportService, { ExportOptions } from '../../services/advancedExportService';
import { useToast } from '../../hooks/useToast';
import './AdvancedExportModal.css';

interface AdvancedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any[];
}

const AdvancedExportModal: React.FC<AdvancedExportModalProps> = ({ 
  isOpen, 
  onClose, 
  data = [] 
}) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    data: [],
    filename: `relatorio-veloigp-${new Date().toISOString().split('T')[0]}`,
    includeCharts: true,
    includeMetadata: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && data.length > 0) {
      setExportOptions(prev => ({ ...prev, data }));
      setPreviewData(advancedExportService.generatePreview(data));
    }
  }, [isOpen, data]);

  const handleFormatChange = (format: 'pdf' | 'excel' | 'csv') => {
    setExportOptions(prev => ({ ...prev, format }));
  };


  const handleOptionChange = (option: keyof ExportOptions, value: boolean) => {
    setExportOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleExport = async () => {
    if (!data || data.length === 0) {
      showError('Erro de Exportação', 'Nenhum dado disponível para exportação');
      return;
    }

    // Validar dados
    const validation = advancedExportService.validateData(data);
    if (!validation.isValid) {
      showError('Erro de Validação', validation.errors.join(', '));
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // Executar exportação
      const result = await advancedExportService.export(exportOptions);

      // Finalizar progresso
      clearInterval(progressInterval);
      setExportProgress(100);

      if (result.success) {
        showSuccess('Exportação Concluída', `Arquivo ${result.filename} exportado com sucesso!`);
        
        // Fechar modal após sucesso
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(0);
          onClose();
        }, 1000);
      } else {
        showError('Erro na Exportação', result.message);
        setIsExporting(false);
        setExportProgress(0);
      }

    } catch (error) {
      console.error('Erro na exportação:', error);
      showError('Erro na Exportação', 'Erro inesperado ao exportar dados. Tente novamente.');
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="export-modal-overlay">
      <div className="export-modal">
        <div className="export-modal-header">
          <h2>Exportação Avançada</h2>
          <button 
            className="export-modal-close"
            onClick={onClose}
            disabled={isExporting}
          >
            ×
          </button>
        </div>

        <div className="export-modal-content">
          {/* Seleção de Formato */}
          <div className="export-section">
            <h3>Formato de Exportação</h3>
            <div className="format-options">
              <label className={`format-option ${exportOptions.format === 'pdf' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={exportOptions.format === 'pdf'}
                  onChange={() => handleFormatChange('pdf')}
                />
                <div className="format-icon">📄</div>
                <div className="format-info">
                  <div className="format-name">PDF</div>
                  <div className="format-desc">Relatório formatado com gráficos</div>
                </div>
              </label>

              <label className={`format-option ${exportOptions.format === 'excel' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={exportOptions.format === 'excel'}
                  onChange={() => handleFormatChange('excel')}
                />
                <div className="format-icon">📊</div>
                <div className="format-info">
                  <div className="format-name">Excel</div>
                  <div className="format-desc">Planilha com múltiplas abas</div>
                </div>
              </label>

              <label className={`format-option ${exportOptions.format === 'csv' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportOptions.format === 'csv'}
                  onChange={() => handleFormatChange('csv')}
                />
                <div className="format-icon">📋</div>
                <div className="format-info">
                  <div className="format-name">CSV</div>
                  <div className="format-desc">Dados brutos para análise</div>
                </div>
              </label>
            </div>
          </div>

          {/* Seleção de Template */}

          {/* Opções de Conteúdo */}
          <div className="export-section">
            <h3>Conteúdo a Incluir</h3>
            <div className="content-options">
              <label className="content-option">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                />
                <span>Análise e Resumo</span>
              </label>

              <label className="content-option">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCharts}
                  onChange={(e) => handleOptionChange('includeCharts', e.target.checked)}
                />
                <span>Dados Detalhados</span>
              </label>

              <label className="content-option">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCharts}
                  onChange={(e) => handleOptionChange('includeCharts', e.target.checked)}
                />
                <span>Gráficos e Visualizações</span>
              </label>
            </div>
          </div>

          {/* Informações do Arquivo */}
          <div className="export-info">
            <div className="info-item">
              <span className="info-label">Registros:</span>
              <span className="info-value">{data.length.toLocaleString('pt-BR')}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tamanho estimado:</span>
              <span className="info-value">
                {exportOptions.format === 'pdf' ? '2-5 MB' : 
                 exportOptions.format === 'excel' ? '1-3 MB' : '500 KB - 1 MB'}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        {isExporting && (
          <div className="export-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {exportProgress < 100 ? 'Exportando...' : 'Concluído!'}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="export-modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleExport}
            disabled={isExporting || data.length === 0}
          >
            {isExporting ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedExportModal;
