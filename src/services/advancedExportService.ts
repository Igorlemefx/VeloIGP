// Serviço de Exportação Avançada
// Implementa lógica real para exportação de dados

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  data: any[];
  filename: string;
  includeCharts?: boolean;
  includeMetadata?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: {
    operators?: string[];
    queues?: string[];
    status?: string[];
  };
}

export interface ExportResult {
  success: boolean;
  message: string;
  filename?: string;
  size?: number;
}

class AdvancedExportService {
  private generateMetadata(options: ExportOptions): string {
    const metadata = {
      'Data de Exportação': new Date().toLocaleString('pt-BR'),
      'Período': options.dateRange ? 
        `${options.dateRange.start.toLocaleDateString('pt-BR')} - ${options.dateRange.end.toLocaleDateString('pt-BR')}` : 
        'Todos os períodos',
      'Filtros Aplicados': options.filters ? 
        Object.entries(options.filters)
          .filter(([_, value]) => value && value.length > 0)
          .map(([key, value]) => `${key}: ${value.join(', ')}`)
          .join('; ') : 
        'Nenhum filtro',
      'Total de Registros': options.data.length,
      'Formato': options.format.toUpperCase()
    };

    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  private formatDataForExport(data: any[]): any[] {
    return data.map(item => ({
      'ID': item.id || '',
      'Operador': item.operator || item.name || '',
      'Data/Hora': item.timestamp ? new Date(item.timestamp).toLocaleString('pt-BR') : '',
      'Duração (s)': item.duration || 0,
      'Status': item.status || '',
      'Fila': item.queue || '',
      'Satisfação': item.satisfaction || '',
      'Observações': item.notes || ''
    }));
  }

  async exportToPDF(options: ExportOptions): Promise<ExportResult> {
    try {
      const doc = new jsPDF();
      const formattedData = this.formatDataForExport(options.data);

      // Título
      doc.setFontSize(20);
      doc.text('Relatório VeloIGP', 14, 22);

      // Metadados
      if (options.includeMetadata) {
        doc.setFontSize(10);
        const metadata = this.generateMetadata(options);
        const metadataLines = doc.splitTextToSize(metadata, 180);
        doc.text(metadataLines, 14, 35);
      }

      // Tabela de dados
      const startY = options.includeMetadata ? 60 : 35;
      
      (doc as any).autoTable({
        head: [Object.keys(formattedData[0] || {})],
        body: formattedData.map(row => Object.values(row)),
        startY: startY,
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [22, 22, 255], // Cor da Velotax
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        }
      });

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Página ${i} de ${pageCount} - VeloIGP - ${new Date().toLocaleDateString('pt-BR')}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      const filename = `${options.filename}.pdf`;
      doc.save(filename);

      return {
        success: true,
        message: 'PDF exportado com sucesso',
        filename,
        size: doc.output('blob').size
      };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return {
        success: false,
        message: 'Erro ao gerar PDF: ' + (error as Error).message
      };
    }
  }

  async exportToExcel(options: ExportOptions): Promise<ExportResult> {
    try {
      const workbook = XLSX.utils.book_new();
      const formattedData = this.formatDataForExport(options.data);

      // Planilha principal com dados
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      
      // Ajustar largura das colunas
      const colWidths = [
        { wch: 10 }, // ID
        { wch: 20 }, // Operador
        { wch: 20 }, // Data/Hora
        { wch: 12 }, // Duração
        { wch: 15 }, // Status
        { wch: 15 }, // Fila
        { wch: 12 }, // Satisfação
        { wch: 30 }  // Observações
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

      // Planilha de metadados
      if (options.includeMetadata) {
        const metadata = this.generateMetadata(options);
        const metadataData = metadata.split('\n').map(line => {
          const [key, value] = line.split(': ');
          return { 'Campo': key, 'Valor': value };
        });
        
        const metadataSheet = XLSX.utils.json_to_sheet(metadataData);
        XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadados');
      }

      // Planilha de resumo
      const summaryData = [
        { 'Métrica': 'Total de Registros', 'Valor': formattedData.length },
        { 'Métrica': 'Operadores Únicos', 'Valor': new Set(formattedData.map(r => r.Operador)).size },
        { 'Métrica': 'Status Únicos', 'Valor': new Set(formattedData.map(r => r.Status)).size },
        { 'Métrica': 'Duração Média (s)', 'Valor': formattedData.reduce((acc, r) => acc + (r['Duração (s)'] || 0), 0) / formattedData.length || 0 }
      ];
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

      const filename = `${options.filename}.xlsx`;
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, filename);

      return {
        success: true,
        message: 'Excel exportado com sucesso',
        filename,
        size: blob.size
      };
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      return {
        success: false,
        message: 'Erro ao gerar Excel: ' + (error as Error).message
      };
    }
  }

  async exportToCSV(options: ExportOptions): Promise<ExportResult> {
    try {
      const formattedData = this.formatDataForExport(options.data);
      
      // Cabeçalho
      const headers = Object.keys(formattedData[0] || {});
      const csvContent = [
        headers.join(','),
        ...formattedData.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') ? `"${value}"` : value
          ).join(',')
        )
      ].join('\n');

      // Adicionar metadados no início se solicitado
      let finalContent = csvContent;
      if (options.includeMetadata) {
        const metadata = this.generateMetadata(options);
        finalContent = `# ${metadata.replace(/\n/g, '\n# ')}\n\n${csvContent}`;
      }

      const filename = `${options.filename}.csv`;
      const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename);

      return {
        success: true,
        message: 'CSV exportado com sucesso',
        filename,
        size: blob.size
      };
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      return {
        success: false,
        message: 'Erro ao gerar CSV: ' + (error as Error).message
      };
    }
  }

  async export(options: ExportOptions): Promise<ExportResult> {
    switch (options.format) {
      case 'pdf':
        return this.exportToPDF(options);
      case 'excel':
        return this.exportToExcel(options);
      case 'csv':
        return this.exportToCSV(options);
      default:
        return {
          success: false,
          message: 'Formato de exportação não suportado'
        };
    }
  }

  // Método para gerar preview dos dados antes da exportação
  generatePreview(data: any[], maxRows: number = 10): any[] {
    return this.formatDataForExport(data).slice(0, maxRows);
  }

  // Método para validar dados antes da exportação
  validateData(data: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || data.length === 0) {
      errors.push('Nenhum dado disponível para exportação');
    }

    if (data.length > 10000) {
      errors.push('Muitos dados para exportação. Considere aplicar filtros.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new AdvancedExportService();