// Google Sheets Service para integração com planilhas 55PBX
import { google } from 'googleapis';

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

export interface GoogleSheetsConfig {
  apiKey: string;
  spreadsheetId: string;
  credentials?: any;
}

class GoogleSheetsService {
  private sheets: any;
  private config: GoogleSheetsConfig | null = null;
  private isAuthenticated = false;

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    try {
      // Inicializar o serviço com API Key (para leitura pública)
      this.sheets = google.sheets({ version: 'v4' });
    } catch (error) {
      console.error('Erro ao inicializar Google Sheets Service:', error);
    }
  }

  /**
   * Configurar o serviço com credenciais
   */
  configure(config: GoogleSheetsConfig) {
    this.config = config;
    this.isAuthenticated = true;
  }

  /**
   * Verificar se o serviço está configurado
   */
  isConfigured(): boolean {
    return this.isAuthenticated && this.config !== null;
  }

  /**
   * Listar planilhas disponíveis (simulado para demonstração)
   */
  async listSpreadsheets(): Promise<SpreadsheetData[]> {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets Service não configurado');
    }

    // Simular dados de planilhas 55PBX
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            title: 'Relatórios 55PBX - Janeiro 2025',
            sheets: [
              { id: 0, title: 'Chamadas por Dia', data: [], headers: [], rowCount: 0, colCount: 0 },
              { id: 1, title: 'Métricas por Hora', data: [], headers: [], rowCount: 0, colCount: 0 },
              { id: 2, title: 'Agentes Ativos', data: [], headers: [], rowCount: 0, colCount: 0 }
            ],
            lastModified: new Date('2025-01-10T14:30:00Z')
          },
          {
            id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            title: 'Relatórios 55PBX - Dezembro 2024',
            sheets: [
              { id: 0, title: 'Resumo Mensal', data: [], headers: [], rowCount: 0, colCount: 0 },
              { id: 1, title: 'Performance Agentes', data: [], headers: [], rowCount: 0, colCount: 0 }
            ],
            lastModified: new Date('2024-12-31T23:59:59Z')
          },
          {
            id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            title: 'Dashboard Executivo 55PBX',
            sheets: [
              { id: 0, title: 'KPIs Principais', data: [], headers: [], rowCount: 0, colCount: 0 },
              { id: 1, title: 'Tendências', data: [], headers: [], rowCount: 0, colCount: 0 },
              { id: 2, title: 'Comparativo Mensal', data: [], headers: [], rowCount: 0, colCount: 0 }
            ],
            lastModified: new Date('2025-01-09T09:15:00Z')
          }
        ]);
      }, 1000);
    });
  }

  /**
   * Obter dados de uma planilha específica
   */
  async getSpreadsheetData(spreadsheetId: string, range?: string): Promise<SheetData[]> {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets Service não configurado');
    }

    try {
      // Simular dados reais da planilha 55PBX
      const mockData = this.generateMockData(spreadsheetId);
      return mockData;
    } catch (error) {
      console.error('Erro ao obter dados da planilha:', error);
      throw new Error('Falha ao carregar dados da planilha');
    }
  }

  /**
   * Gerar dados simulados baseados em planilhas 55PBX reais
   */
  private generateMockData(spreadsheetId: string): SheetData[] {
    const baseData = {
      '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms': [
        {
          id: 0,
          title: 'Chamadas por Dia',
          headers: ['Data', 'Total Chamadas', 'Atendidas', 'Perdidas', 'Tempo Médio (min)', 'Satisfação'],
          data: [
            ['2025-01-01', '1247', '1156', '91', '2.3', '4.2'],
            ['2025-01-02', '1189', '1102', '87', '2.1', '4.3'],
            ['2025-01-03', '1356', '1289', '67', '1.8', '4.5'],
            ['2025-01-04', '1423', '1345', '78', '2.0', '4.1'],
            ['2025-01-05', '1198', '1123', '75', '2.2', '4.4'],
            ['2025-01-06', '1089', '1023', '66', '1.9', '4.6'],
            ['2025-01-07', '1324', '1256', '68', '2.1', '4.3']
          ],
          rowCount: 7,
          colCount: 6
        },
        {
          id: 1,
          title: 'Métricas por Hora',
          headers: ['Hora', 'Chamadas', 'Atendidas', 'Taxa Atendimento', 'Tempo Médio'],
          data: [
            ['08:00', '45', '42', '93.3%', '1.8'],
            ['09:00', '78', '74', '94.9%', '2.1'],
            ['10:00', '95', '89', '93.7%', '2.3'],
            ['11:00', '112', '105', '93.8%', '2.5'],
            ['12:00', '89', '82', '92.1%', '2.2'],
            ['13:00', '67', '63', '94.0%', '1.9'],
            ['14:00', '134', '128', '95.5%', '2.0'],
            ['15:00', '156', '148', '94.9%', '2.4'],
            ['16:00', '142', '135', '95.1%', '2.2'],
            ['17:00', '98', '92', '93.9%', '2.1'],
            ['18:00', '67', '61', '91.0%', '2.3']
          ],
          rowCount: 11,
          colCount: 5
        },
        {
          id: 2,
          title: 'Agentes Ativos',
          headers: ['Nome', 'Chamadas Atendidas', 'Tempo Médio', 'Satisfação', 'Status'],
          data: [
            ['Ana Silva', '156', '1.8', '4.7', 'Ativo'],
            ['Carlos Santos', '142', '2.1', '4.5', 'Ativo'],
            ['Maria Oliveira', '138', '1.9', '4.6', 'Ativo'],
            ['João Costa', '134', '2.2', '4.4', 'Ativo'],
            ['Fernanda Lima', '129', '2.0', '4.8', 'Ativo'],
            ['Pedro Alves', '125', '2.3', '4.3', 'Pausa'],
            ['Lucia Ferreira', '118', '1.7', '4.9', 'Ativo'],
            ['Roberto Souza', '112', '2.4', '4.2', 'Ativo']
          ],
          rowCount: 8,
          colCount: 5
        }
      ]
    };

    return baseData[spreadsheetId] || [];
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
   * Exportar dados para Excel (simulado)
   */
  exportToExcel(data: any[][], filename: string): void {
    // Para implementação real, usar biblioteca como xlsx
    console.log('Exportando para Excel:', filename, data);
    alert('Funcionalidade de exportação Excel será implementada em breve');
  }

  /**
   * Validar configuração da API
   */
  async validateConfiguration(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      // Simular validação
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Erro na validação da configuração:', error);
      return false;
    }
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
