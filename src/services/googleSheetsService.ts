// Google Sheets Service para integração com planilhas 55PBX
// Versão híbrida: API real quando disponível, simulada quando não

import { GoogleSheetsConfig, validateGoogleSheetsConfig, SPREADSHEET_IDS } from '../config/googleSheetsConfig';

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
      console.log('🔧 Inicializando Google Sheets Service...');
      
      // Sempre tentar usar API real, independente do ambiente
      this.isAuthenticated = true;
      this.useRealAPI = true;
      
      console.log('✅ Google Sheets Service configurado para API real');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Google Sheets Service:', error);
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
   * Listar planilhas disponíveis (apenas dados reais)
   */
  async listSpreadsheets(): Promise<SpreadsheetData[]> {
    console.log('Conectando com planilha real do Google Drive...');
    return await this.getRealSpreadsheets();
  }

  /**
   * Obter planilhas reais do Google Drive
   */
  private async getRealSpreadsheets(): Promise<SpreadsheetData[]> {
    const spreadsheetId = SPREADSHEET_IDS.MAIN_REPORTS;
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY || 'AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A';
    
    try {
      console.log(`🔍 Tentando acessar planilha: ${spreadsheetId}`);
      console.log(`🔑 Usando API Key: ${apiKey.substring(0, 10)}...`);
      
      // Primeiro, tentar obter informações básicas da planilha
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro na API (${response.status}):`, errorText);
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }
      
      const spreadsheet = await response.json();
      console.log('✅ Planilha acessada com sucesso:', spreadsheet.properties?.title);
      
      // Obter dados da primeira aba
      console.log('📊 Obtendo dados da planilha...');
      const sheetsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:AN?key=${apiKey}`);
      
      if (!sheetsResponse.ok) {
        const errorText = await sheetsResponse.text();
        console.error(`❌ Erro ao obter dados (${sheetsResponse.status}):`, errorText);
        throw new Error(`Erro ao obter dados: ${sheetsResponse.status} - ${errorText}`);
      }
      
      const values = await sheetsResponse.json();
      const data = values.values || [];
      
      console.log(`📈 Dados obtidos: ${data.length} linhas`);
      
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
      
      return [{
        id: spreadsheetId,
        title: spreadsheet.properties?.title || 'Planilha 55PBX',
        sheets: [sheetData],
        lastModified: new Date(spreadsheet.properties?.modifiedTime || new Date())
      }];
      
    } catch (error) {
      console.error('❌ Erro ao obter planilha real:', error);
      
      // Verificar se é erro de permissão específico
      if (error instanceof Error && error.message.includes('FAILED_PRECONDITION')) {
        throw new Error('Planilha não está configurada para acesso via API. Verifique as permissões da planilha.');
      }
      
      throw error;
    }
  }



  /**
   * Obter dados de uma planilha específica (apenas dados reais)
   */
  async getSpreadsheetData(spreadsheetId: string, range?: string): Promise<SheetData[]> {
    console.log('Obtendo dados reais da planilha...');
    return await this.getRealSpreadsheetData(spreadsheetId, range);
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
