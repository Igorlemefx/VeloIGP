// Acesso Direto à Planilha
// Serviço para ler dados reais da planilha Google Sheets

import { googleSheetsService } from './googleSheetsService';

interface SpreadsheetRow {
  operador: string;
  fila: string;
  data: string;
  hora: string;
  duracao: string;
  status: string;
  tempo_espera: string;
  cliente?: string;
  observacoes?: string;
}

interface ProcessedData {
  operators: Array<{
    id: string;
    name: string;
    calls: number;
    efficiency: number;
    serviceLevel: number;
    status: 'online' | 'offline' | 'busy' | 'away';
    lastActivity: string;
    queue: string;
    totalDuration: number;
    averageDuration: number;
    totalWaitTime: number;
    averageWaitTime: number;
  }>;
  general: {
    totalCalls: number;
    answeredCalls: number;
    missedCalls: number;
    abandonedCalls: number;
    serviceLevel: number;
    efficiency: number;
    averageWaitTime: number;
    averageTalkTime: number;
  };
  dailyStats: Array<{
    date: string;
    calls: number;
    answered: number;
    efficiency: number;
  }>;
}

class DirectSpreadsheetAccess {
  private static instance: DirectSpreadsheetAccess;
  private cache: ProcessedData | null = null;
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

  static getInstance(): DirectSpreadsheetAccess {
    if (!DirectSpreadsheetAccess.instance) {
      DirectSpreadsheetAccess.instance = new DirectSpreadsheetAccess();
    }
    return DirectSpreadsheetAccess.instance;
  }

  /**
   * Acessar dados reais da planilha
   */
  async getRealSpreadsheetData(): Promise<ProcessedData> {
    try {
      // Verificar cache
      if (this.cache && Date.now() - this.lastUpdate < this.CACHE_DURATION) {
        console.log('📊 Retornando dados em cache da planilha');
        return this.cache;
      }

      console.log('🔄 Acessando planilha real...');
      
      // ID da planilha real (substitua pelo ID correto)
      const SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
      
      // Carregar dados da planilha
      const rawData = await googleSheetsService.getSpreadsheetData(SPREADSHEET_ID);
      
      if (!rawData || rawData.length === 0) {
        console.warn('⚠️ Planilha vazia ou inacessível');
        return this.getFallbackData();
      }

      console.log(`✅ Dados carregados: ${rawData.length} linhas`);
      
      // Processar dados reais
      const processedData = this.processRealData(rawData);
      
      // Atualizar cache
      this.cache = processedData;
      this.lastUpdate = Date.now();
      
      console.log('✅ Dados reais processados com sucesso');
      return processedData;

    } catch (error) {
      console.error('❌ Erro ao acessar planilha:', error);
      return this.getFallbackData();
    }
  }

  /**
   * Processar dados reais da planilha
   */
  private processRealData(rawData: any[]): ProcessedData {
    console.log('🔄 Processando dados reais da planilha...');
    
    // Converter dados brutos para formato estruturado
    const rows: SpreadsheetRow[] = rawData.map((row, index) => {
      // Assumir que a primeira linha são cabeçalhos
      if (index === 0) return null;
      
      return {
        operador: row[0] || '',
        fila: row[1] || '',
        data: row[2] || '',
        hora: row[3] || '',
        duracao: row[4] || '',
        status: row[5] || '',
        tempo_espera: row[6] || '',
        cliente: row[7] || '',
        observacoes: row[8] || ''
      };
    }).filter(Boolean) as SpreadsheetRow[];

    console.log(`📊 Processando ${rows.length} registros reais`);

    // Extrair dados dos operadores
    const operators = this.extractOperatorsFromRealData(rows);
    
    // Calcular métricas gerais
    const general = this.calculateGeneralMetricsFromRealData(rows);
    
    // Gerar estatísticas diárias
    const dailyStats = this.generateDailyStatsFromRealData(rows);
    
    return {
      operators,
      general,
      dailyStats
    };
  }

  /**
   * Extrair dados dos operadores dos dados reais
   */
  private extractOperatorsFromRealData(rows: SpreadsheetRow[]) {
    const operatorsMap = new Map<string, any>();
    
    rows.forEach((row) => {
      if (row.operador && row.operador.trim() !== '') {
        const operatorName = row.operador.trim();
        const operatorId = this.generateOperatorId(operatorName);
        
        if (!operatorsMap.has(operatorId)) {
          operatorsMap.set(operatorId, {
            id: operatorId,
            name: operatorName,
            calls: 0,
            answeredCalls: 0,
            missedCalls: 0,
            abandonedCalls: 0,
            totalDuration: 0,
            totalWaitTime: 0,
            queue: row.fila || 'Geral',
            lastActivity: this.getLastActivity(rows, operatorName)
          });
        }
        
        const operator = operatorsMap.get(operatorId);
        operator.calls++;
        
        // Processar status da chamada
        const status = row.status.toLowerCase();
        if (status.includes('atendida') || status.includes('concluída')) {
          operator.answeredCalls++;
          operator.totalDuration += this.parseDuration(row.duracao);
          operator.totalWaitTime += this.parseDuration(row.tempo_espera);
        } else if (status.includes('perdida') || status.includes('não atendida')) {
          operator.missedCalls++;
        } else if (status.includes('abandonada') || status.includes('desistiu')) {
          operator.abandonedCalls++;
        }
      }
    });
    
    // Converter para array e calcular métricas
    return Array.from(operatorsMap.values()).map(operator => {
      const efficiency = this.calculateRealEfficiency(operator);
      const serviceLevel = this.calculateRealServiceLevel(operator);
      
      return {
        id: operator.id,
        name: operator.name,
        calls: operator.calls,
        efficiency: Math.round(efficiency * 10) / 10,
        serviceLevel: Math.round(serviceLevel * 10) / 10,
        status: this.determineRealStatus(operator),
        lastActivity: operator.lastActivity,
        queue: operator.queue,
        totalDuration: operator.totalDuration,
        averageDuration: operator.answeredCalls > 0 ? Math.round(operator.totalDuration / operator.answeredCalls) : 0,
        totalWaitTime: operator.totalWaitTime,
        averageWaitTime: operator.answeredCalls > 0 ? Math.round(operator.totalWaitTime / operator.answeredCalls) : 0
      };
    });
  }

  /**
   * Calcular métricas gerais dos dados reais
   */
  private calculateGeneralMetricsFromRealData(rows: SpreadsheetRow[]) {
    const totalCalls = rows.length;
    const answeredCalls = rows.filter(row => {
      const status = row.status.toLowerCase();
      return status.includes('atendida') || status.includes('concluída');
    }).length;
    
    const missedCalls = rows.filter(row => {
      const status = row.status.toLowerCase();
      return status.includes('perdida') || status.includes('não atendida');
    }).length;
    
    const abandonedCalls = rows.filter(row => {
      const status = row.status.toLowerCase();
      return status.includes('abandonada') || status.includes('desistiu');
    }).length;
    
    const serviceLevel = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
    
    // Calcular eficiência média
    const totalDuration = rows
      .filter(row => {
        const status = row.status.toLowerCase();
        return status.includes('atendida') || status.includes('concluída');
      })
      .reduce((sum, row) => sum + this.parseDuration(row.duracao), 0);
    
    const efficiency = answeredCalls > 0 ? (totalDuration / answeredCalls) / 60 : 0; // em minutos
    
    // Calcular tempos médios
    const totalWaitTime = rows
      .filter(row => {
        const status = row.status.toLowerCase();
        return status.includes('atendida') || status.includes('concluída');
      })
      .reduce((sum, row) => sum + this.parseDuration(row.tempo_espera), 0);
    
    const averageWaitTime = answeredCalls > 0 ? totalWaitTime / answeredCalls : 0;
    const averageTalkTime = answeredCalls > 0 ? totalDuration / answeredCalls : 0;
    
    return {
      totalCalls,
      answeredCalls,
      missedCalls,
      abandonedCalls,
      serviceLevel: Math.round(serviceLevel * 10) / 10,
      efficiency: Math.round(efficiency * 10) / 10,
      averageWaitTime: Math.round(averageWaitTime * 10) / 10,
      averageTalkTime: Math.round(averageTalkTime * 10) / 10
    };
  }

  /**
   * Gerar estatísticas diárias dos dados reais
   */
  private generateDailyStatsFromRealData(rows: SpreadsheetRow[]) {
    const dailyMap = new Map<string, any>();
    
    rows.forEach(row => {
      if (row.data) {
        const date = this.formatDate(row.data);
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            date,
            calls: 0,
            answered: 0,
            efficiency: 0
          });
        }
        
        const dayStats = dailyMap.get(date);
        dayStats.calls++;
        
        const status = row.status.toLowerCase();
        if (status.includes('atendida') || status.includes('concluída')) {
          dayStats.answered++;
        }
      }
    });
    
    // Calcular eficiência diária
    dailyMap.forEach((dayStats) => {
      dayStats.efficiency = dayStats.calls > 0 ? (dayStats.answered / dayStats.calls) * 100 : 0;
    });
    
    return Array.from(dailyMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Últimos 7 dias
  }

  /**
   * Calcular eficiência real
   */
  private calculateRealEfficiency(operator: any): number {
    if (operator.calls === 0) return 0;
    
    const baseEfficiency = 70;
    const callBonus = Math.min(operator.calls * 0.2, 20);
    const serviceLevelBonus = (operator.answeredCalls / operator.calls) * 10;
    
    return Math.min(100, baseEfficiency + callBonus + serviceLevelBonus);
  }

  /**
   * Calcular service level real
   */
  private calculateRealServiceLevel(operator: any): number {
    if (operator.calls === 0) return 0;
    return (operator.answeredCalls / operator.calls) * 100;
  }

  /**
   * Determinar status real do operador
   */
  private determineRealStatus(operator: any): 'online' | 'offline' | 'busy' | 'away' {
    // Baseado na atividade recente
    const lastActivity = new Date(operator.lastActivity);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
    
    if (diffMinutes < 5) return 'online';
    if (diffMinutes < 30) return 'busy';
    if (diffMinutes < 120) return 'away';
    return 'offline';
  }

  /**
   * Obter última atividade do operador
   */
  private getLastActivity(rows: SpreadsheetRow[], operatorName: string): string {
    const operatorRows = rows.filter(row => row.operador === operatorName);
    if (operatorRows.length === 0) return new Date().toISOString();
    
    const lastRow = operatorRows[operatorRows.length - 1];
    const dateTime = `${lastRow.data} ${lastRow.hora}`;
    return new Date(dateTime).toISOString();
  }

  /**
   * Gerar ID único para operador
   */
  private generateOperatorId(name: string): string {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 20);
  }

  /**
   * Converter duração para segundos
   */
  private parseDuration(duration: string): number {
    if (!duration) return 0;
    
    // Formato: "3:45" ou "3m45s" ou "225s"
    const match = duration.match(/(\d+):(\d+)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      return minutes * 60 + seconds;
    }
    
    const secondsMatch = duration.match(/(\d+)s/);
    if (secondsMatch) {
      return parseInt(secondsMatch[1]);
    }
    
    const minutesMatch = duration.match(/(\d+)m/);
    if (minutesMatch) {
      return parseInt(minutesMatch[1]) * 60;
    }
    
    return parseInt(duration) || 0;
  }

  /**
   * Formatar data
   */
  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Obter dados de fallback
   */
  private getFallbackData(): ProcessedData {
    console.log('🔄 Usando dados de fallback');
    
    return {
      operators: [
        { id: 'op1', name: 'Ana Silva', calls: 0, efficiency: 0, serviceLevel: 0, status: 'offline', lastActivity: new Date().toISOString(), queue: 'Geral', totalDuration: 0, averageDuration: 0, totalWaitTime: 0, averageWaitTime: 0 },
        { id: 'op2', name: 'Carlos Santos', calls: 0, efficiency: 0, serviceLevel: 0, status: 'offline', lastActivity: new Date().toISOString(), queue: 'Geral', totalDuration: 0, averageDuration: 0, totalWaitTime: 0, averageWaitTime: 0 }
      ],
      general: {
        totalCalls: 0,
        answeredCalls: 0,
        missedCalls: 0,
        abandonedCalls: 0,
        serviceLevel: 0,
        efficiency: 0,
        averageWaitTime: 0,
        averageTalkTime: 0
      },
      dailyStats: []
    };
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache = null;
    this.lastUpdate = 0;
  }
}

export const directSpreadsheetAccess = DirectSpreadsheetAccess.getInstance();
export default directSpreadsheetAccess;



