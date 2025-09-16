// Serviço MCP simplificado para Google Sheets (Frontend)
// Este serviço usa apenas a API Key para leitura da planilha

export interface MCPGoogleSheetsConfig {
  apiKey: string;
  spreadsheetId: string;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

export class MCPGoogleSheetsService {
  private config: MCPGoogleSheetsConfig;

  constructor(config: MCPGoogleSheetsConfig) {
    this.config = config;
  }

  /**
   * Inicializa o serviço MCP
   */
  async initialize(): Promise<MCPResponse> {
    try {
      // Testar se a API Key está configurada
      if (!this.config.apiKey) {
        throw new Error('API Key não configurada');
      }

      if (!this.config.spreadsheetId) {
        throw new Error('Spreadsheet ID não configurado');
      }

      return {
        success: true,
        data: { message: 'MCP Google Sheets Service inicializado com sucesso' },
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Erro ao inicializar MCP Service: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Lê dados da planilha usando a API Key
   */
  async readSpreadsheet(range: string = 'A:AN'): Promise<MCPResponse> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${range}?key=${this.config.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const values = data.values || [];
      
      if (values.length === 0) {
        return {
          success: false,
          error: 'Planilha vazia ou sem dados no range especificado',
          timestamp: new Date()
        };
      }

      // Processar dados
      const headers = values[0];
      const dataRows = values.slice(1);
      
      const processedData = {
        headers,
        data: dataRows,
        rowCount: dataRows.length,
        colCount: headers.length,
        lastUpdated: new Date().toISOString()
      };

      return {
        success: true,
        data: processedData,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Erro ao ler planilha: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Lê dados de uma aba específica
   */
  async readSheet(sheetName: string, range?: string): Promise<MCPResponse> {
    const fullRange = range ? `${sheetName}!${range}` : `${sheetName}!A:AN`;
    return this.readSpreadsheet(fullRange);
  }

  /**
   * Lista todas as abas da planilha
   */
  async listSheets(): Promise<MCPResponse> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}?key=${this.config.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const sheets = data.sheets?.map((sheet: any) => ({
        title: sheet.properties.title,
        sheetId: sheet.properties.sheetId,
        rowCount: sheet.properties.gridProperties?.rowCount,
        colCount: sheet.properties.gridProperties?.columnCount
      })) || [];

      return {
        success: true,
        data: { sheets },
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Erro ao listar abas: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Obtém metadados da planilha
   */
  async getSpreadsheetMetadata(): Promise<MCPResponse> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}?key=${this.config.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const metadata = {
        title: data.properties?.title,
        locale: data.properties?.locale,
        timeZone: data.properties?.timeZone,
        sheets: data.sheets?.map((sheet: any) => ({
          title: sheet.properties.title,
          sheetId: sheet.properties.sheetId,
          rowCount: sheet.properties.gridProperties?.rowCount,
          colCount: sheet.properties.gridProperties?.columnCount
        })) || []
      };

      return {
        success: true,
        data: metadata,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Erro ao obter metadados: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Testa a conexão com a planilha
   */
  async testConnection(): Promise<MCPResponse> {
    try {
      // Tenta ler apenas a primeira linha para testar a conexão
      const response = await this.readSpreadsheet('A1:AN1');
      
      if (response.success) {
        return {
          success: true,
          data: { 
            message: 'Conexão com a planilha estabelecida com sucesso',
            headersCount: response.data?.headers?.length || 0
          },
          timestamp: new Date()
        };
      } else {
        return response;
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Erro ao testar conexão: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Processa dados da planilha para análise
   */
  async processDataForAnalysis(range: string = 'A:AN'): Promise<MCPResponse> {
    try {
      console.log('🔄 Iniciando processamento de dados da planilha...');
      
      const readResponse = await this.readSpreadsheet(range);
      
      if (!readResponse.success) {
        console.error('❌ Erro ao ler planilha:', readResponse.error);
        return readResponse;
      }

      const { headers, data } = readResponse.data;
      console.log('📊 Dados brutos recebidos:', { headers: headers.length, rows: data.length });
      
      // Mapear colunas dinamicamente baseado nos headers reais
      const columnMap: { [key: string]: number } = {};
      headers.forEach((header: string, index: number) => {
        columnMap[header] = index;
      });
      
      console.log('🗂️ Mapeamento de colunas:', columnMap);

      // Processar dados
      const processedData = data.map((row: any[], index: number) => {
        const processedRow: any = {};
        
        // Mapear cada coluna baseado no header real
        headers.forEach((header: string, colIndex: number) => {
          processedRow[header] = row[colIndex] || '';
        });

        // Adicionar metadados
        processedRow._rowIndex = index + 1;
        processedRow._timestamp = new Date().toISOString();

        return processedRow;
      });

      console.log('✅ Dados processados:', processedData.length, 'linhas');

      // Calcular métricas básicas
      const metrics = this.calculateBasicMetrics(processedData, headers);
      console.log('📈 Métricas calculadas:', metrics);

      return {
        success: true,
        data: {
          headers,
          processedData,
          metrics,
          totalRows: processedData.length,
          lastUpdated: new Date().toISOString()
        },
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error('❌ Erro ao processar dados:', error);
      return {
        success: false,
        error: `Erro ao processar dados: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Calcula métricas básicas dos dados
   */
  private calculateBasicMetrics(data: any[], headers: string[]): any {
    console.log('📊 Calculando métricas para', data.length, 'registros');
    
    const totalCalls = data.length;
    
    // Encontrar colunas dinamicamente baseado na estrutura real da planilha
    const desconexaoCol = headers.find(h => h.toLowerCase().includes('desconexão') || h.toLowerCase().includes('desconexao'));
    const operadorCol = headers.find(h => h.toLowerCase().includes('operador'));
    const tempoEsperaCol = headers.find(h => h.toLowerCase().includes('tempo') && h.toLowerCase().includes('espera'));
    const tempoFaladoCol = headers.find(h => h.toLowerCase().includes('tempo') && h.toLowerCase().includes('falado'));
    const dataCol = headers.find(h => h.toLowerCase().includes('data') && !h.toLowerCase().includes('atendimento'));
    const dataAtendimentoCol = headers.find(h => h.toLowerCase().includes('data') && h.toLowerCase().includes('atendimento'));
    const horaCol = headers.find(h => h.toLowerCase().includes('hora') && !h.toLowerCase().includes('atendimento'));
    const horaAtendimentoCol = headers.find(h => h.toLowerCase().includes('hora') && h.toLowerCase().includes('atendimento'));
    const filaCol = headers.find(h => h.toLowerCase().includes('fila'));
    const pergunta1Col = headers.find(h => h.toLowerCase().includes('pergunta') && h.includes('1'));
    const pergunta2Col = headers.find(h => h.toLowerCase().includes('pergunta') && h.includes('2'));
    
    console.log('🔍 Colunas encontradas:', {
      desconexao: desconexaoCol,
      operador: operadorCol,
      tempoEspera: tempoEsperaCol,
      tempoFalado: tempoFaladoCol,
      data: dataCol,
      dataAtendimento: dataAtendimentoCol,
      hora: horaCol,
      horaAtendimento: horaAtendimentoCol,
      fila: filaCol,
      pergunta1: pergunta1Col,
      pergunta2: pergunta2Col
    });

    // Calcular chamadas atendidas e abandonadas baseado na coluna "Chamada"
    let answeredCalls = 0;
    let abandonedCalls = 0;
    
    // A coluna "Chamada" (primeira coluna) indica o status
    const chamadaCol = headers[0]; // Primeira coluna é sempre "Chamada"
    
    if (chamadaCol) {
      answeredCalls = data.filter(row => {
        const status = row[0] || ''; // Primeira coluna
        return status.toLowerCase().includes('atendida');
      }).length;
      
      abandonedCalls = data.filter(row => {
        const status = row[0] || ''; // Primeira coluna
        return status.toLowerCase().includes('retida') || 
               status.toLowerCase().includes('abandonada') ||
               status.toLowerCase().includes('desistiu') ||
               status.toLowerCase().includes('timeout');
      }).length;
    } else {
      // Fallback: usar coluna de desconexão se disponível
      if (desconexaoCol) {
        answeredCalls = data.filter(row => {
          const desconexao = row[desconexaoCol] || '';
          return desconexao.toLowerCase().includes('atendida') || 
                 desconexao.toLowerCase().includes('completa') ||
                 desconexao.toLowerCase().includes('finalizada');
        }).length;
        
        abandonedCalls = data.filter(row => {
          const desconexao = row[desconexaoCol] || '';
          return desconexao.toLowerCase().includes('abandonada') || 
                 desconexao.toLowerCase().includes('desistiu') ||
                 desconexao.toLowerCase().includes('timeout');
        }).length;
      } else {
        // Se não encontrar nenhuma coluna, assumir que todas são atendidas
        answeredCalls = totalCalls;
        abandonedCalls = 0;
      }
    }

    const answerRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
    const abandonmentRate = totalCalls > 0 ? (abandonedCalls / totalCalls) * 100 : 0;

    // Calcular tempos médios
    let avgWaitTime = 0;
    let avgTalkTime = 0;
    
    if (tempoEsperaCol) {
      const waitTimes = data
        .map(row => this.parseTimeToSeconds(row[tempoEsperaCol]))
        .filter(time => time > 0);
      
      avgWaitTime = waitTimes.length > 0 ? 
        waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length : 0;
    }
    
    if (tempoFaladoCol) {
      const talkTimes = data
        .map(row => this.parseTimeToSeconds(row[tempoFaladoCol]))
        .filter(time => time > 0);
      
      avgTalkTime = talkTimes.length > 0 ? 
        talkTimes.reduce((sum, time) => sum + time, 0) / talkTimes.length : 0;
    }

    // Calcular operadores únicos
    const uniqueOperators = operadorCol ? 
      Array.from(new Set(data.map(row => row[operadorCol]).filter(op => op && op.trim()))) : [];

    const metrics = {
      totalCalls,
      answeredCalls,
      abandonedCalls,
      answerRate: Math.round(answerRate * 100) / 100,
      abandonmentRate: Math.round(abandonmentRate * 100) / 100,
      avgWaitTimeSeconds: Math.round(avgWaitTime),
      avgTalkTimeSeconds: Math.round(avgTalkTime),
      avgWaitTimeFormatted: this.formatSecondsToMMSS(avgWaitTime),
      avgTalkTimeFormatted: this.formatSecondsToMMSS(avgTalkTime),
      uniqueOperators: uniqueOperators.length,
      operatorList: uniqueOperators
    };

    console.log('📈 Métricas calculadas:', metrics);
    return metrics;
  }

  /**
   * Converte tempo MM:SS para segundos
   */
  private parseTimeToSeconds(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  }

  /**
   * Formata segundos para MM:SS
   */
  private formatSecondsToMMSS(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Instância global do serviço MCP
export const mcpGoogleSheetsService = new MCPGoogleSheetsService({
  apiKey: 'AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A',
  spreadsheetId: '1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM'
});

export default mcpGoogleSheetsService;