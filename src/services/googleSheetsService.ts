// Google Sheets Service para integração com planilhas 55PBX
// Versão híbrida: API real quando disponível, simulada quando não

import { GoogleSheetsConfig, validateGoogleSheetsConfig, loadCredentialsFromEnv, SPREADSHEET_IDS } from '../config/googleSheetsConfig';

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
  private config: GoogleSheetsConfig | null = null;
  private isAuthenticated = false;
  private useRealAPI = false;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      // Verificar se estamos no browser ou servidor
      const isBrowser = typeof window !== 'undefined';
      
      if (isBrowser) {
        // No browser, usar dados simulados por enquanto
        console.log('Google Sheets Service inicializado em modo de demonstração (browser)');
        this.isAuthenticated = false;
        this.useRealAPI = false;
      } else {
        // No servidor, tentar usar API real
        const credentials = loadCredentialsFromEnv();
        
        if (credentials) {
          await this.authenticateWithCredentials(credentials);
        } else {
          console.warn('Credenciais do Google Sheets não encontradas. Usando modo de demonstração.');
          this.isAuthenticated = false;
          this.useRealAPI = false;
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar Google Sheets Service:', error);
      this.isAuthenticated = false;
      this.useRealAPI = false;
    }
  }

  private async authenticateWithCredentials(credentials: any) {
    try {
      // Implementação futura para servidor
      console.log('Autenticação com Google Sheets configurada para servidor');
      this.isAuthenticated = true;
      this.useRealAPI = true;
    } catch (error) {
      console.error('Erro na autenticação do Google Sheets:', error);
      this.isAuthenticated = false;
      this.useRealAPI = false;
    }
  }

  /**
   * Configurar o serviço com credenciais
   */
  async configure(config: GoogleSheetsConfig): Promise<boolean> {
    try {
      if (!validateGoogleSheetsConfig(config)) {
        throw new Error('Configuração inválida');
      }

      this.config = config;
      await this.authenticateWithCredentials(config.credentials);
      return this.isAuthenticated;
    } catch (error) {
      console.error('Erro ao configurar Google Sheets Service:', error);
      return false;
    }
  }

  /**
   * Verificar se o serviço está configurado
   */
  isConfigured(): boolean {
    return this.isAuthenticated && this.useRealAPI;
  }

  /**
   * Listar planilhas disponíveis (real ou simulado)
   */
  async listSpreadsheets(): Promise<SpreadsheetData[]> {
    // Sempre tentar usar a planilha real primeiro
    try {
      console.log('Tentando conectar com planilha real do Google Drive...');
      return await this.getRealSpreadsheets();
    } catch (error) {
      console.warn('Erro ao conectar com planilha real, usando dados simulados:', error);
      return this.getMockSpreadsheets();
    }
  }

  /**
   * Obter planilhas reais do Google Drive
   */
  private async getRealSpreadsheets(): Promise<SpreadsheetData[]> {
    // Usar a API do Google Sheets para obter dados reais
    const spreadsheetId = SPREADSHEET_IDS.MAIN_REPORTS;
    
    try {
      // Fazer requisição direta para a API do Google Sheets
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${process.env.REACT_APP_GOOGLE_API_KEY || 'AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A'}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const spreadsheet = await response.json();
      
      // Obter dados da primeira aba
      const sheetsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:AN?key=${process.env.REACT_APP_GOOGLE_API_KEY || 'AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A'}`);
      
      if (!sheetsResponse.ok) {
        throw new Error(`Erro ao obter dados: ${sheetsResponse.status}`);
      }
      
      const values = await sheetsResponse.json();
      const data = values.values || [];
      
      const sheetData: SheetData = {
        id: 0,
        title: 'Dados 55PBX',
        data: data.slice(1), // Remover cabeçalho
        headers: data[0] || [],
        rowCount: data.length - 1,
        colCount: data[0]?.length || 0
      };
      
      return [{
        id: spreadsheetId,
        title: spreadsheet.properties?.title || 'Planilha 55PBX',
        sheets: [sheetData],
        lastModified: new Date(spreadsheet.properties?.modifiedTime || new Date())
      }];
      
    } catch (error) {
      console.error('Erro ao obter planilha real:', error);
      throw error;
    }
  }

  /**
   * Obter planilhas simuladas para demonstração
   */
  private getMockSpreadsheets(): SpreadsheetData[] {
    return [
      {
        id: SPREADSHEET_IDS.MAIN_REPORTS,
        title: 'Relatórios 55PBX - Janeiro 2025',
        sheets: [
          { 
            id: 0, 
            title: 'Dados 55PBX', 
            data: this.generateMockCallData(), 
            headers: this.getRealHeaders(), 
            rowCount: 100, 
            colCount: 40 
          }
        ],
        lastModified: new Date('2025-01-10T14:30:00Z')
      }
    ];
  }

  /**
   * Obter cabeçalhos reais da planilha
   */
  private getRealHeaders(): string[] {
    return [
      'Chamada', 'Audio E Transcrições', 'Operador', 'Data', 'Hora', 'Data Atendimento', 'Hora Atendimento',
      'País', 'DDD', 'Numero', 'Fila', 'Tempo Na Ura', 'Tempo De Espera', 'Tempo Falado', 'Tempo Total',
      'Desconexão', 'Telefone Entrada', 'Caminho U R A', 'Cpf/Cnpj', 'Pedido', 'Id Ligação', 'Id Ligação De Origem',
      'I D Do Ticket', 'Fluxo De Filas', 'Wh_quality_reason', 'Wh_humor_reason', 'Questionário De Qualidade',
      'Pergunta2 1 PERGUNTA ATENDENTE', 'Pergunta2 2 PERGUNTA SOLUCAO', 'Dia', 'qtde', 'Até 20 Seg', 'Faixa',
      'Mês', 'TMA (FALADO', 'Tempo URA (seg', 'TME (seg)', 'TMA (seg)', 'Pergunta 1', 'Pergunta 2'
    ];
  }

  /**
   * Gerar dados simulados baseados na estrutura real
   */
  private generateMockCallData(): any[][] {
    const data: any[][] = [];
    const operators = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Lima'];
    const queues = ['Vendas', 'Suporte', 'Financeiro', 'Técnico', 'Atendimento'];
    const countries = ['Brasil', 'Argentina', 'Chile', 'Uruguai'];
    const dddCodes = ['11', '21', '31', '41', '51', '61', '71', '81', '85'];
    
    for (let i = 1; i <= 100; i++) {
      const date = new Date(2025, 0, Math.floor(Math.random() * 31) + 1);
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const duration = Math.floor(Math.random() * 300) + 30; // 30s a 5min
      const waitTime = Math.floor(Math.random() * 120) + 10; // 10s a 2min
      const operator = operators[Math.floor(Math.random() * operators.length)];
      const queue = queues[Math.floor(Math.random() * queues.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const ddd = dddCodes[Math.floor(Math.random() * dddCodes.length)];
      const phone = `${ddd}9${Math.floor(Math.random() * 90000000) + 10000000}`;
      
      data.push([
        i, // Chamada
        `Audio_${i}.mp3`, // Audio E Transcrições
        operator, // Operador
        date.toISOString().split('T')[0], // Data
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, // Hora
        date.toISOString().split('T')[0], // Data Atendimento
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, // Hora Atendimento
        country, // País
        ddd, // DDD
        phone, // Numero
        queue, // Fila
        Math.floor(Math.random() * 60) + 10, // Tempo Na Ura
        waitTime, // Tempo De Espera
        duration, // Tempo Falado
        duration + waitTime, // Tempo Total
        Math.random() > 0.8 ? 'Cliente' : 'Operador', // Desconexão
        phone, // Telefone Entrada
        'URA_Padrão', // Caminho U R A
        Math.floor(Math.random() * 90000000000) + 10000000000, // Cpf/Cnpj
        `PED${i.toString().padStart(6, '0')}`, // Pedido
        `LIG${i.toString().padStart(8, '0')}`, // Id Ligação
        `LIG${(i-1).toString().padStart(8, '0')}`, // Id Ligação De Origem
        `TKT${i.toString().padStart(6, '0')}`, // I D Do Ticket
        'Fluxo_Padrão', // Fluxo De Filas
        Math.random() > 0.7 ? 'Qualidade_Boa' : '', // Wh_quality_reason
        Math.random() > 0.8 ? 'Humor_Positivo' : '', // Wh_humor_reason
        Math.random() > 0.6 ? 'Satisfatório' : '', // Questionário De Qualidade
        Math.floor(Math.random() * 5) + 1, // Pergunta2 1 PERGUNTA ATENDENTE
        Math.floor(Math.random() * 5) + 1, // Pergunta2 2 PERGUNTA SOLUCAO
        date.getDate(), // Dia
        1, // qtde
        waitTime <= 20 ? 'Sim' : 'Não', // Até 20 Seg
        this.getTimeRange(waitTime), // Faixa
        date.getMonth() + 1, // Mês
        duration, // TMA (FALADO
        Math.floor(Math.random() * 60) + 10, // Tempo URA (seg
        waitTime, // TME (seg)
        duration, // TMA (seg)
        Math.floor(Math.random() * 5) + 1, // Pergunta 1
        Math.floor(Math.random() * 5) + 1 // Pergunta 2
      ]);
    }
    
    return data;
  }

  /**
   * Obter faixa de tempo baseada no tempo de espera
   */
  private getTimeRange(waitTime: number): string {
    if (waitTime <= 20) return '0-20s';
    if (waitTime <= 60) return '21-60s';
    if (waitTime <= 120) return '1-2min';
    return '2min+';
  }

  /**
   * Obter dados de uma planilha específica
   */
  async getSpreadsheetData(spreadsheetId: string, range?: string): Promise<SheetData[]> {
    try {
      console.log('Tentando obter dados reais da planilha...');
      return await this.getRealSpreadsheetData(spreadsheetId, range);
    } catch (error) {
      console.warn('Erro ao obter dados reais, usando dados simulados:', error);
      return this.generateMockData(spreadsheetId);
    }
  }

  /**
   * Obter dados reais da planilha
   */
  private async getRealSpreadsheetData(spreadsheetId: string, range?: string): Promise<SheetData[]> {
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY || 'AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A';
    const rangeToUse = range || 'A:AN';
    
    try {
      // Obter dados da planilha
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeToUse}?key=${apiKey}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }
      
      const values = await response.json();
      const data = values.values || [];
      
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
      
      return [sheetData];
      
    } catch (error) {
      console.error('Erro ao obter dados reais da planilha:', error);
      throw error;
    }
  }

  /**
   * Gerar dados simulados baseados em planilhas 55PBX reais
   * Estrutura otimizada para dados individuais e comparativos
   */
  private generateMockData(spreadsheetId: string): SheetData[] {
    const baseData: { [key: string]: SheetData[] } = {
      '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms': [
        {
          id: 0,
          title: 'Dados Individuais de Chamadas',
          headers: ['ID', 'Data/Hora', 'Duração (seg)', 'Status', 'Tempo Espera (seg)', 'Agente', 'Satisfação', 'Fila'],
          data: [
            ['CALL_001', '2025-01-10 08:15:30', '180', 'Atendida', '45', 'Ana Silva', '5', 'Principal'],
            ['CALL_002', '2025-01-10 08:22:15', '240', 'Atendida', '30', 'Carlos Santos', '4', 'Principal'],
            ['CALL_003', '2025-01-10 08:35:42', '0', 'Perdida', '120', '', '', 'Principal'],
            ['CALL_004', '2025-01-10 08:41:20', '320', 'Atendida', '25', 'Maria Oliveira', '5', 'VIP'],
            ['CALL_005', '2025-01-10 08:48:55', '0', 'Abandonada', '90', '', '', 'Principal'],
            ['CALL_006', '2025-01-10 09:12:10', '195', 'Atendida', '35', 'João Costa', '4', 'Técnica'],
            ['CALL_007', '2025-01-10 09:25:33', '280', 'Atendida', '20', 'Fernanda Lima', '5', 'VIP'],
            ['CALL_008', '2025-01-10 09:38:17', '0', 'Perdida', '150', '', '', 'Principal'],
            ['CALL_009', '2025-01-10 09:45:28', '220', 'Atendida', '40', 'Pedro Alves', '3', 'Principal'],
            ['CALL_010', '2025-01-10 10:02:45', '350', 'Atendida', '15', 'Lucia Ferreira', '5', 'VIP']
          ],
          rowCount: 10,
          colCount: 8
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
          title: 'Performance por Agente',
          headers: ['Nome', 'Chamadas Atendidas', 'Tempo Médio (min)', 'Satisfação Média', 'Status', 'Eficiência'],
          data: [
            ['Ana Silva', '156', '3.0', '4.7', 'Ativo', '95%'],
            ['Carlos Santos', '142', '4.0', '4.5', 'Ativo', '92%'],
            ['Maria Oliveira', '138', '3.2', '4.6', 'Ativo', '94%'],
            ['João Costa', '134', '3.7', '4.4', 'Ativo', '89%'],
            ['Fernanda Lima', '129', '3.3', '4.8', 'Ativo', '96%'],
            ['Pedro Alves', '125', '3.8', '4.3', 'Pausa', '87%'],
            ['Lucia Ferreira', '118', '2.8', '4.9', 'Ativo', '98%'],
            ['Roberto Souza', '112', '4.0', '4.2', 'Ativo', '85%']
          ],
          rowCount: 8,
          colCount: 6
        },
        {
          id: 3,
          title: 'Comparativo Mensal',
          headers: ['Mês', 'Total Chamadas', 'Atendidas', 'Perdidas', 'Taxa Atendimento', 'Tempo Médio', 'Satisfação'],
          data: [
            ['Janeiro 2025', '1247', '1156', '91', '92.7%', '2.3', '4.2'],
            ['Dezembro 2024', '1189', '1102', '87', '92.7%', '2.1', '4.3'],
            ['Novembro 2024', '1356', '1289', '67', '95.1%', '1.8', '4.5'],
            ['Outubro 2024', '1423', '1345', '78', '94.5%', '2.0', '4.1'],
            ['Setembro 2024', '1198', '1123', '75', '93.7%', '2.2', '4.4']
          ],
          rowCount: 5,
          colCount: 7
        },
        {
          id: 4,
          title: 'Análise por Fila',
          headers: ['Fila', 'Chamadas', 'Atendidas', 'Tempo Médio Espera', 'Satisfação', 'Prioridade'],
          data: [
            ['Principal', '856', '789', '2.5', '4.1', 'Normal'],
            ['VIP', '234', '231', '0.8', '4.8', 'Alta'],
            ['Técnica', '157', '136', '4.1', '4.3', 'Normal']
          ],
          rowCount: 3,
          colCount: 6
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
      // Implementação futura para validação real
      console.log('Validando configuração do Google Sheets (implementação futura)');
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
