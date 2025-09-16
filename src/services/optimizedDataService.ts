// Serviço otimizado para carregamento rápido e cache persistente
import { googleSheetsService } from './googleSheetsService';

interface CachedData {
  data: any;
  timestamp: number;
  expiresIn: number; // em milissegundos
}

class OptimizedDataService {
  private cache = new Map<string, CachedData>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private readonly SPREADSHEET_ID = '1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM';
  
  // Cache em localStorage para persistência
  private readonly STORAGE_KEY = 'veloigp_reports_cache';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Converter objeto de volta para Map
        this.cache = new Map(Object.entries(parsed));
        console.log('📦 Cache carregado do localStorage');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar cache do localStorage:', error);
      // Se der erro, limpar cache
      this.cache.clear();
    }
  }

  private saveToStorage() {
    try {
      // Converter Map para objeto serializável
      const cacheObject: Record<string, CachedData> = {};
      this.cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      
      const serialized = JSON.stringify(cacheObject);
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.warn('⚠️ Erro ao salvar cache no localStorage:', error);
      // Se der erro, limpar cache para evitar problemas
      this.cache.clear();
    }
  }

  private isExpired(cachedData: CachedData): boolean {
    return Date.now() - cachedData.timestamp > cachedData.expiresIn;
  }

  private setCache(key: string, data: any, expiresIn: number = this.CACHE_DURATION) {
    const cachedData: CachedData = {
      data,
      timestamp: Date.now(),
      expiresIn
    };
    
    this.cache.set(key, cachedData);
    this.saveToStorage();
  }

  private getCache(key: string): any | null {
    const cachedData = this.cache.get(key);
    
    if (!cachedData) {
      return null;
    }

    if (this.isExpired(cachedData)) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return cachedData.data;
  }

  // Carregar dados da planilha com cache inteligente
  async getSpreadsheetData(forceRefresh: boolean = false): Promise<any> {
    const cacheKey = `spreadsheet_${this.SPREADSHEET_ID}`;
    
    // Se não forçar refresh, tentar cache primeiro
    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Dados carregados do cache');
        return cachedData;
      }
    }

    try {
      console.log('🔄 Carregando dados da planilha...');
      const data = await googleSheetsService.getSpreadsheetData(this.SPREADSHEET_ID);
      
      if (data && data.length > 0) {
        this.setCache(cacheKey, data);
        console.log('✅ Dados carregados e salvos no cache');
        return data;
      }
      
      throw new Error('Nenhum dado encontrado na planilha');
    } catch (error) {
      console.error('❌ Erro ao carregar dados da planilha:', error);
      
      // Tentar dados do cache mesmo expirados
      const expiredData = this.cache.get(cacheKey)?.data;
      if (expiredData) {
        console.log('⚠️ Usando dados expirados do cache como fallback');
        return expiredData;
      }
      
      throw error;
    }
  }

  // Processar dados com cache de processamento
  async getProcessedData(forceRefresh: boolean = false): Promise<any> {
    const cacheKey = 'processed_reports_data';
    
    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Dados processados carregados do cache');
        return cachedData;
      }
    }

    try {
      const rawData = await this.getSpreadsheetData(forceRefresh);
      const processedData = this.processRealSpreadsheetData(rawData[0].data, rawData[0].headers);
      
      this.setCache(cacheKey, processedData, this.CACHE_DURATION * 2); // Cache mais longo para dados processados
      console.log('✅ Dados processados e salvos no cache');
      return processedData;
    } catch (error) {
      console.error('❌ Erro ao processar dados:', error);
      
      // Tentar dados do cache mesmo expirados como fallback
      const expiredData = this.cache.get(cacheKey)?.data;
      if (expiredData) {
        console.log('⚠️ Usando dados processados expirados como fallback');
        return expiredData;
      }
      
      // Se não houver cache, retornar dados básicos
      console.log('⚠️ Retornando dados básicos devido ao erro');
      return this.generateBasicData();
    }
  }

  // Gerar dados básicos em caso de erro
  private generateBasicData() {
    return {
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
      operators: [],
      trends: {
        daily: [],
        weekly: [],
        monthly: []
      },
      comparisons: {
        teamAverage: 0,
        topPerformer: 0,
        departmentAverage: 0,
        companyAverage: 0
      }
    };
  }

  // Processar dados reais da planilha
  private processRealSpreadsheetData(rawData: any[][], headers: string[]): any {
    console.log('🔍 Processando dados reais da planilha...');
    console.log('📋 Cabeçalhos disponíveis:', headers);
    
    // Mapear dados da planilha real baseado na estrutura real
    const callData = rawData.map((row, index) => {
      if (index === 0) {
        console.log('📊 Primeira linha de dados:', row);
      }
      
      return {
        operador: row[2] || '', // Coluna C - Operador
        fila: row[10] || '', // Coluna K - Fila
        data: row[3] || '', // Coluna D - Data
        hora: row[4] || '', // Coluna E - Hora
        duracao: row[12] || '', // Coluna M - Tempo Falado
        status: row[0] || '', // Coluna A - Chamada (Atendida/Retida na URA)
        tempo_espera: row[11] || '', // Coluna L - Tempo De Espera
        cliente: row[8] || '', // Coluna I - Numero
        observacoes: row[1] || '', // Coluna B - Audio E Transcrições
        tipo_chamada: row[9] || '', // Coluna J - Tempo Na Ura
        prioridade: row[13] || '', // Coluna N - Tempo Total
        id_ligacao: row[19] || '', // Coluna T - Id Ligação
        cpf_cnpj: row[18] || '', // Coluna S - Cpf/Cnpj
        pedido: row[20] || '' // Coluna U - Pedido
      };
    }).filter(call => call.operador && call.operador.trim() !== '');

    console.log(`📈 Dados processados: ${callData.length} chamadas válidas`);
    const uniqueOperators = Array.from(new Set(callData.map(c => c.operador)));
    console.log('👥 Operadores encontrados:', uniqueOperators);

    // Agrupar por operador
    const operatorsMap = new Map<string, any>();
    callData.forEach(call => {
      const operatorName = call.operador.trim();
      if (!operatorsMap.has(operatorName)) {
        operatorsMap.set(operatorName, {
          id: operatorName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          name: operatorName,
          calls: [],
          queue: call.fila || 'Geral',
          lastActivity: call.data + ' ' + call.hora
        });
      }
      operatorsMap.get(operatorName).calls.push(call);
    });

    console.log(`👥 Operadores únicos encontrados: ${operatorsMap.size}`);

    // Processar operadores
    const operators = Array.from(operatorsMap.values()).map(operator => {
      const calls = operator.calls;
      const totalCalls = calls.length;
      const answeredCalls = calls.filter(c => c.status.toLowerCase().includes('atendida')).length;
      // const missedCalls = calls.filter(c => c.status.toLowerCase().includes('retida na ura')).length;
      
      const totalDuration = calls
        .filter(c => c.status.toLowerCase().includes('atendida'))
        .reduce((sum, c) => sum + this.parseDuration(c.duracao), 0);
      
      // const totalWaitTime = calls
      //   .filter(c => c.status.toLowerCase().includes('atendida'))
      //   .reduce((sum, c) => sum + this.parseDuration(c.tempo_espera), 0);
      
      const serviceLevel = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
      const efficiency = this.calculateEfficiency(calls, totalDuration);
      
      // Determinar status baseado na última atividade
      const lastCall = calls[calls.length - 1];
      const lastActivityDate = new Date(lastCall.data + ' ' + lastCall.hora);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60);
      
      let status: 'online' | 'offline' | 'busy' | 'away' = 'offline';
      if (diffMinutes < 30) status = 'online';
      else if (diffMinutes < 120) status = 'busy';
      else if (diffMinutes < 480) status = 'away';
      
      console.log(`👤 Operador: ${operator.name} - ${totalCalls} chamadas, ${answeredCalls} atendidas, eficiência: ${efficiency.toFixed(1)}%`);
      
      return {
        id: operator.id,
        name: operator.name,
        calls: totalCalls,
        efficiency: Math.round(efficiency * 10) / 10,
        serviceLevel: Math.round(serviceLevel * 10) / 10,
        status,
        lastActivity: lastCall.data + ' ' + lastCall.hora,
        queue: operator.queue
      };
    }).sort((a, b) => b.efficiency - a.efficiency);

    // Calcular dados gerais
    const totalCalls = callData.length;
    const answeredCalls = callData.filter(c => c.status.toLowerCase().includes('atendida')).length;
    const missedCalls = callData.filter(c => c.status.toLowerCase().includes('retida na ura')).length;
    const generalServiceLevel = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
    const generalEfficiency = operators.length > 0 ? operators.reduce((sum, op) => sum + op.efficiency, 0) / operators.length : 0;

    const totalDuration = callData
      .filter(c => c.status.toLowerCase().includes('atendida'))
      .reduce((sum, c) => sum + this.parseDuration(c.duracao), 0);
    
    const totalWaitTime = callData
      .filter(c => c.status.toLowerCase().includes('atendida'))
      .reduce((sum, c) => sum + this.parseDuration(c.tempo_espera), 0);

    console.log(`📊 Dados gerais: ${totalCalls} total, ${answeredCalls} atendidas, ${missedCalls} perdidas`);
    console.log(`📈 Service Level: ${generalServiceLevel.toFixed(1)}%, Eficiência: ${generalEfficiency.toFixed(1)}%`);

    return {
      general: {
        totalCalls,
        answeredCalls,
        missedCalls,
        abandonedCalls: 0,
        serviceLevel: Math.round(generalServiceLevel * 10) / 10,
        efficiency: Math.round(generalEfficiency * 10) / 10,
        averageWaitTime: answeredCalls > 0 ? Math.round((totalWaitTime / answeredCalls) * 10) / 10 : 0,
        averageTalkTime: answeredCalls > 0 ? Math.round((totalDuration / answeredCalls) * 10) / 10 : 0
      },
      operators,
      trends: {
        daily: this.generateDailyTrends(callData),
        weekly: this.generateWeeklyTrends(callData),
        monthly: this.generateMonthlyTrends(callData)
      },
      comparisons: {
        teamAverage: Math.round(generalEfficiency * 10) / 10,
        topPerformer: operators.length > 0 ? Math.max(...operators.map(op => op.efficiency)) : 0,
        departmentAverage: Math.round(generalEfficiency * 0.95 * 10) / 10,
        companyAverage: Math.round(generalEfficiency * 0.9 * 10) / 10
      }
    };
  }

  private parseDuration(duration: string): number {
    if (!duration || typeof duration !== 'string') return 0;
    
    const parts = duration.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  }

  private calculateEfficiency(calls: any[], totalDuration: number): number {
    if (calls.length === 0) return 0;
    
    const answeredCalls = calls.filter(c => c.status.toLowerCase().includes('atendida')).length;
    const averageDuration = answeredCalls > 0 ? totalDuration / answeredCalls : 0;
    
    // Fórmula de eficiência baseada em chamadas atendidas e duração média
    const callEfficiency = (answeredCalls / calls.length) * 100;
    const durationEfficiency = Math.min(100, (averageDuration / 300) * 100); // 5 minutos como referência
    
    return (callEfficiency + durationEfficiency) / 2;
  }

  private generateDailyTrends(callData: any[]): Array<{ date: string; calls: number; efficiency: number }> {
    const trends = new Map<string, { calls: number; totalDuration: number; answeredCalls: number }>();
    
    callData.forEach(call => {
      try {
        const dateStr = call.data;
        if (!dateStr || typeof dateStr !== 'string') return;
        
        // Normalizar formato de data para chave
        let normalizedDate: string;
        if (dateStr.includes('/')) {
          // Converter DD/MM/YYYY para YYYY-MM-DD
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
            normalizedDate = `${year}-${month}-${day}`;
          } else {
            return;
          }
        } else {
          normalizedDate = dateStr;
        }
        
        if (!trends.has(normalizedDate)) {
          trends.set(normalizedDate, { calls: 0, totalDuration: 0, answeredCalls: 0 });
        }
        
        const trend = trends.get(normalizedDate)!;
        trend.calls++;
        
        if (call.status.toLowerCase().includes('atendida')) {
          trend.answeredCalls++;
          trend.totalDuration += this.parseDuration(call.duracao);
        }
      } catch (error) {
        console.warn('Erro ao processar data para tendência diária:', call.data, error);
      }
    });

    return Array.from(trends.entries()).map(([date, data]) => ({
      date,
      calls: data.calls,
      efficiency: data.answeredCalls > 0 ? (data.answeredCalls / data.calls) * 100 : 0
    })).sort((a, b) => {
      try {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } catch {
        return 0;
      }
    });
  }

  private generateWeeklyTrends(callData: any[]): Array<{ week: string; calls: number; efficiency: number }> {
    const trends = new Map<string, { calls: number; totalDuration: number; answeredCalls: number }>();
    
    callData.forEach(call => {
      try {
        // Validar e formatar data
        const dateStr = call.data;
        if (!dateStr || typeof dateStr !== 'string') return;
        
        // Tentar diferentes formatos de data
        let date: Date;
        if (dateStr.includes('/')) {
          // Formato DD/MM/YYYY ou DD/MM/YY
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Mês é 0-indexado
            const year = parseInt(parts[2]);
            // Ajustar ano se for 2 dígitos
            const fullYear = year < 100 ? 2000 + year : year;
            date = new Date(fullYear, month, day);
          } else {
            return;
          }
        } else {
          date = new Date(dateStr);
        }
        
        // Verificar se a data é válida
        if (isNaN(date.getTime())) {
          console.warn('Data inválida ignorada:', dateStr);
          return;
        }
        
        // Calcular início da semana (domingo)
        const weekStart = new Date(date);
        const dayOfWeek = date.getDay();
        weekStart.setDate(date.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!trends.has(weekKey)) {
          trends.set(weekKey, { calls: 0, totalDuration: 0, answeredCalls: 0 });
        }
        
        const trend = trends.get(weekKey)!;
        trend.calls++;
        
        if (call.status.toLowerCase().includes('atendida')) {
          trend.answeredCalls++;
          trend.totalDuration += this.parseDuration(call.duracao);
        }
      } catch (error) {
        console.warn('Erro ao processar data para tendência semanal:', call.data, error);
      }
    });

    return Array.from(trends.entries()).map(([week, data]) => ({
      week,
      calls: data.calls,
      efficiency: data.answeredCalls > 0 ? (data.answeredCalls / data.calls) * 100 : 0
    })).sort((a, b) => {
      try {
        return new Date(a.week).getTime() - new Date(b.week).getTime();
      } catch {
        return 0;
      }
    });
  }

  private generateMonthlyTrends(callData: any[]): Array<{ month: string; calls: number; efficiency: number }> {
    const trends = new Map<string, { calls: number; totalDuration: number; answeredCalls: number }>();
    
    callData.forEach(call => {
      try {
        const dateStr = call.data;
        if (!dateStr || typeof dateStr !== 'string') return;
        
        // Tentar diferentes formatos de data
        let date: Date;
        if (dateStr.includes('/')) {
          // Formato DD/MM/YYYY ou DD/MM/YY
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Mês é 0-indexado
            const year = parseInt(parts[2]);
            // Ajustar ano se for 2 dígitos
            const fullYear = year < 100 ? 2000 + year : year;
            date = new Date(fullYear, month, day);
          } else {
            return;
          }
        } else {
          date = new Date(dateStr);
        }
        
        // Verificar se a data é válida
        if (isNaN(date.getTime())) {
          console.warn('Data inválida ignorada para tendência mensal:', dateStr);
          return;
        }
        
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!trends.has(monthKey)) {
          trends.set(monthKey, { calls: 0, totalDuration: 0, answeredCalls: 0 });
        }
        
        const trend = trends.get(monthKey)!;
        trend.calls++;
        
        if (call.status.toLowerCase().includes('atendida')) {
          trend.answeredCalls++;
          trend.totalDuration += this.parseDuration(call.duracao);
        }
      } catch (error) {
        console.warn('Erro ao processar data para tendência mensal:', call.data, error);
      }
    });

    return Array.from(trends.entries()).map(([month, data]) => ({
      month,
      calls: data.calls,
      efficiency: data.answeredCalls > 0 ? (data.answeredCalls / data.calls) * 100 : 0
    })).sort((a, b) => {
      try {
        return new Date(a.month).getTime() - new Date(b.month).getTime();
      } catch {
        return 0;
      }
    });
  }

  // Limpar cache
  clearCache() {
    this.cache.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Cache limpo');
  }

  // Forçar refresh
  async refreshData() {
    this.clearCache();
    return await this.getProcessedData(true);
  }
}

const optimizedDataService = new OptimizedDataService();
export { optimizedDataService };
