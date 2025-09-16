// Google Sheets Service - Versão Simplificada e Funcional
// Integração direta com planilha Google Sheets

export interface SpreadsheetData {
  id: string;
  title: string;
  sheets: SheetData[];
  lastModified: Date;
}

export interface SheetData {
  id: number;
  title: string;
  data: any[][];
  headers: string[];
  rowCount: number;
  colCount: number;
}

class GoogleSheetsService {
  private apiKey = 'AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A';
  private spreadsheetId = '1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM';

  constructor() {
    console.log('🔧 Google Sheets Service inicializado');
  }

  /**
   * Obter dados da planilha
   */
  async getSpreadsheetData(spreadsheetId?: string, range?: string): Promise<SheetData[]> {
    const id = spreadsheetId || this.spreadsheetId;
    const rangeToUse = range || 'A:AN';
    
    try {
      console.log(`🔄 Carregando dados da planilha: ${id}`);
      console.log(`📊 Range: ${rangeToUse}`);
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${rangeToUse}?key=${this.apiKey}`;
      console.log(`🌐 URL: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro na API (${response.status}):`, errorText);
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }
      
      const values = await response.json();
      const data = values.values || [];
      
      console.log(`📈 Dados recebidos: ${data.length} linhas`);
      
      if (data.length === 0) {
        throw new Error('Planilha vazia ou sem dados');
      }
      
      const sheetData: SheetData = {
        id: 0,
        title: 'Dados 55PBX',
        data: data.slice(1), // Remover cabeçalho
        headers: data[0] || [],
        rowCount: data.length - 1,
        colCount: data[0]?.length || 0
      };
      
      console.log(`✅ Dados processados: ${sheetData.rowCount} linhas, ${sheetData.colCount} colunas`);
      console.log('📋 Cabeçalhos:', sheetData.headers);
      
      return [sheetData];
      
    } catch (error) {
      console.error('❌ Erro ao obter dados da planilha:', error);
      throw error;
    }
  }

  /**
   * Listar planilhas disponíveis
   */
  async listSpreadsheets(): Promise<SpreadsheetData[]> {
    try {
      const sheets = await this.getSpreadsheetData();
      
      return [{
        id: this.spreadsheetId,
        title: 'Planilha 55PBX',
        sheets: sheets,
        lastModified: new Date()
      }];
    } catch (error) {
      console.error('Erro ao listar planilhas:', error);
      throw error;
    }
  }

  /**
   * Verificar se o serviço está configurado
   */
  isConfigured(): boolean {
    return true;
  }

  /**
   * Exportar dados para CSV
   */
  exportToCSV(data: any[][], filename: string): void {
    const csvContent = data.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Obter estatísticas da planilha
   */
  async getSpreadsheetStats(spreadsheetId: string): Promise<{
    totalSheets: number;
    totalRows: number;
    lastModified: Date;
    size: string;
  }> {
    const data = await this.getSpreadsheetData(spreadsheetId);
    
    const totalRows = data.reduce((sum, sheet) => sum + sheet.rowCount, 0);
    const totalSheets = data.length;
    
    return {
      totalSheets,
      totalRows,
      lastModified: new Date(),
      size: `${(totalRows * 0.1).toFixed(1)} KB`
    };
  }
}

// Instância singleton do serviço
export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;