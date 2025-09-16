// Serviço de Exportação Avançado
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportData {
  title: string;
  data: any[][];
  headers: string[];
  metadata?: {
    period: string;
    totalRecords: number;
    generatedAt: string;
    filters?: any;
  };
}

export interface ChartExportData {
  title: string;
  chartElement: HTMLElement;
  description?: string;
}

class ExportService {
  /**
   * Exportar dados para CSV
   */
  exportToCSV(exportData: ExportData): void {
    const { data, headers, metadata } = exportData;
    
    // Adicionar cabeçalhos
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(',')
      )
    ].join('\n');

    // Adicionar metadados no final
    if (metadata) {
      const metadataText = [
        '',
        '--- METADADOS ---',
        `Período: ${metadata.period}`,
        `Total de Registros: ${metadata.totalRecords}`,
        `Gerado em: ${metadata.generatedAt}`,
        ...(metadata.filters ? [`Filtros: ${JSON.stringify(metadata.filters)}`] : [])
      ].join('\n');
      
      const fullContent = csvContent + metadataText;
      const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${exportData.title}_${this.getTimestamp()}.csv`);
    } else {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${exportData.title}_${this.getTimestamp()}.csv`);
    }
  }

  /**
   * Exportar dados para Excel
   */
  exportToExcel(exportData: ExportData): void {
    const { data, headers, metadata } = exportData;
    
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Preparar dados com cabeçalhos
    const worksheetData = [headers, ...data];
    
    // Criar worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Adicionar metadados em uma nova aba
    if (metadata) {
      const metadataSheet = XLSX.utils.aoa_to_sheet([
        ['METADADOS DO RELATÓRIO'],
        [''],
        ['Período:', metadata.period],
        ['Total de Registros:', metadata.totalRecords],
        ['Gerado em:', metadata.generatedAt],
        [''],
        ['FILTROS APLICADOS:'],
        ...Object.entries(metadata.filters || {}).map(([key, value]) => [key, value])
      ]);
      
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');
      XLSX.utils.book_append_sheet(wb, metadataSheet, 'Metadados');
    } else {
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    }
    
    // Configurar larguras das colunas
    const colWidths = headers.map((_, index) => ({
      wch: Math.max(15, Math.max(...data.map(row => String(row[index] || '').length)) + 2)
    }));
    ws['!cols'] = colWidths;
    
    // Exportar arquivo
    XLSX.writeFile(wb, `${exportData.title}_${this.getTimestamp()}.xlsx`);
  }

  /**
   * Exportar gráfico para PDF
   */
  async exportChartToPDF(chartData: ChartExportData): Promise<void> {
    const { chartElement, title, description } = chartData;
    
    try {
      // Capturar o elemento como imagem
      const canvas = await html2canvas(chartElement, {
        backgroundColor: 'var(--velotax-bg-secondary)',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Criar PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Adicionar título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, 20, 20);
      
      // Adicionar descrição se fornecida
      if (description) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(description, 20, 30);
      }
      
      // Adicionar imagem do gráfico
      pdf.addImage(imgData, 'PNG', 20, description ? 40 : 30, imgWidth, imgHeight);
      
      // Adicionar rodapé
      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, pageHeight - 10);
      
      // Salvar arquivo
      pdf.save(`${title}_${this.getTimestamp()}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar gráfico para PDF:', error);
      throw new Error('Falha ao exportar gráfico para PDF');
    }
  }

  /**
   * Exportar relatório completo para PDF
   */
  async exportFullReportToPDF(
    title: string,
    sections: Array<{
      title: string;
      content: HTMLElement;
      description?: string;
    }>
  ): Promise<void> {
    try {
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      let yPosition = 20;
      
      // Título principal
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, 20, yPosition);
      yPosition += 15;
      
      // Data de geração
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, yPosition);
      yPosition += 20;
      
      // Processar cada seção
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Verificar se precisa de nova página
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Título da seção
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(section.title, 20, yPosition);
        yPosition += 10;
        
        // Descrição da seção
        if (section.description) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text(section.description, 20, yPosition);
          yPosition += 10;
        }
        
        // Capturar conteúdo como imagem
        try {
          const canvas = await html2canvas(section.content, {
            backgroundColor: 'var(--velotax-bg-secondary)',
            scale: 1.5,
            useCORS: true,
            allowTaint: true
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Verificar se a imagem cabe na página
          if (yPosition + imgHeight > 280) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.error(`Erro ao processar seção ${section.title}:`, error);
          // Continuar com próxima seção
        }
      }
      
      // Salvar arquivo
      pdf.save(`${title}_RelatorioCompleto_${this.getTimestamp()}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar relatório completo:', error);
      throw new Error('Falha ao exportar relatório completo');
    }
  }

  /**
   * Exportar dados para JSON
   */
  exportToJSON(exportData: ExportData): void {
    const jsonData = {
      title: exportData.title,
      headers: exportData.headers,
      data: exportData.data,
      metadata: exportData.metadata,
      exportedAt: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `${exportData.title}_${this.getTimestamp()}.json`);
  }

  /**
   * Gerar timestamp para nomes de arquivo
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
  }

  /**
   * Validar dados antes da exportação
   */
  validateExportData(data: any[][]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data || data.length === 0) {
      errors.push('Nenhum dado para exportar');
    }
    
    if (data && data.length > 0) {
      const firstRowLength = data[0].length;
      const inconsistentRows = data.filter(row => row.length !== firstRowLength);
      
      if (inconsistentRows.length > 0) {
        errors.push(`${inconsistentRows.length} linhas com número inconsistente de colunas`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obter estatísticas do arquivo a ser exportado
   */
  getExportStats(data: any[][]): {
    totalRows: number;
    totalColumns: number;
    estimatedSize: string;
    dataTypes: { [key: string]: number };
  } {
    const totalRows = data.length;
    const totalColumns = data.length > 0 ? data[0].length : 0;
    
    // Calcular tamanho estimado
    const totalCells = totalRows * totalColumns;
    const estimatedBytes = totalCells * 10; // Estimativa de 10 bytes por célula
    const estimatedSize = this.formatBytes(estimatedBytes);
    
    // Analisar tipos de dados
    const dataTypes: { [key: string]: number } = {};
    data.forEach(row => {
      row.forEach(cell => {
        const type = typeof cell;
        dataTypes[type] = (dataTypes[type] || 0) + 1;
      });
    });
    
    return {
      totalRows,
      totalColumns,
      estimatedSize,
      dataTypes
    };
  }

  /**
   * Formatar bytes para tamanho legível
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const exportService = new ExportService();
