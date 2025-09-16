// Data Processor Service - Processamento Inteligente de Dados da Planilha
// Sistema robusto para análise de dados 55PBX

export interface ProcessedCallData {
  id: string;
  data: string;
  hora: string;
  operador: string;
  cliente: string;
  duracao: number; // em segundos
  duracaoFormatada: string;
  status: 'Atendida' | 'Perdida' | 'Abandonada' | 'Em Espera';
  fila: string;
  satisfacao?: number;
  observacoes?: string;
  timestamp: Date;
  periodo: 'manha' | 'tarde' | 'noite';
  diaSemana: string;
  isWeekend: boolean;
}

export interface OperatorMetrics {
  operador: string;
  totalChamadas: number;
  chamadasAtendidas: number;
  chamadasPerdidas: number;
  chamadasAbandonadas: number;
  taxaAtendimento: number;
  duracaoMedia: number;
  duracaoTotal: number;
  satisfacaoMedia: number;
  eficiencia: number;
  ranking: number;
  periodo: {
    manha: number;
    tarde: number;
    noite: number;
  };
  dias: {
    [key: string]: number;
  };
}

export interface QueueMetrics {
  fila: string;
  totalChamadas: number;
  chamadasAtendidas: number;
  taxaAtendimento: number;
  tempoMedioEspera: number;
  tempoMedioAtendimento: number;
  satisfacaoMedia: number;
  operadores: string[];
  volumePorHora: { [key: string]: number };
}

export interface GeneralMetrics {
  totalChamadas: number;
  chamadasAtendidas: number;
  chamadasPerdidas: number;
  chamadasAbandonadas: number;
  taxaAtendimentoGeral: number;
  duracaoMediaGeral: number;
  satisfacaoMediaGeral: number;
  operadoresAtivos: number;
  filasAtivas: number;
  periodo: {
    inicio: Date;
    fim: Date;
  };
  tendencias: {
    crescimento: number;
    comparacaoAnterior: number;
  };
}

export interface ComparisonData {
  periodoAtual: GeneralMetrics;
  periodoAnterior: GeneralMetrics;
  diferencas: {
    totalChamadas: number;
    taxaAtendimento: number;
    duracaoMedia: number;
    satisfacao: number;
  };
  operadores: {
    [key: string]: {
      atual: OperatorMetrics;
      anterior: OperatorMetrics;
      diferenca: Partial<OperatorMetrics>;
    };
  };
}

class DataProcessorService {
  private static instance: DataProcessorService;
  private processedData: ProcessedCallData[] = [];
  private operatorMetrics: Map<string, OperatorMetrics> = new Map();
  private queueMetrics: Map<string, QueueMetrics> = new Map();
  private generalMetrics: GeneralMetrics | null = null;
  private lastProcessed: Date | null = null;

  private constructor() {}

  static getInstance(): DataProcessorService {
    if (!DataProcessorService.instance) {
      DataProcessorService.instance = new DataProcessorService();
    }
    return DataProcessorService.instance;
  }

  /**
   * Processar dados brutos da planilha
   */
  async processSpreadsheetData(rawData: any[][]): Promise<{
    processedData: ProcessedCallData[];
    operatorMetrics: OperatorMetrics[];
    queueMetrics: QueueMetrics[];
    generalMetrics: GeneralMetrics;
  }> {
    console.log('🔄 Iniciando processamento de dados da planilha...');
    
    // Limpar dados anteriores
    this.processedData = [];
    this.operatorMetrics.clear();
    this.queueMetrics.clear();
    this.generalMetrics = null;

    if (!rawData || rawData.length < 2) {
      throw new Error('Dados insuficientes para processamento');
    }

    const headers = rawData[0];
    const dataRows = rawData.slice(1);

    console.log(`📊 Processando ${dataRows.length} registros...`);

    // Mapear colunas (flexível para diferentes estruturas)
    const columnMap = this.mapColumns(headers);
    console.log('🗂️ Mapeamento de colunas:', columnMap);

    // Processar cada linha
    for (let i = 0; i < dataRows.length; i++) {
      try {
        const processedCall = this.processCallData(dataRows[i], columnMap, i);
        if (processedCall) {
          this.processedData.push(processedCall);
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao processar linha ${i + 2}:`, error);
        // Continuar processamento mesmo com erros
      }
    }

    console.log(`✅ Processados ${this.processedData.length} registros válidos`);

    // Calcular métricas
    this.calculateOperatorMetrics();
    this.calculateQueueMetrics();
    this.calculateGeneralMetrics();

    this.lastProcessed = new Date();

    return {
      processedData: this.processedData,
      operatorMetrics: Array.from(this.operatorMetrics.values()),
      queueMetrics: Array.from(this.queueMetrics.values()),
      generalMetrics: this.generalMetrics!
    };
  }

  /**
   * Mapear colunas da planilha (flexível)
   */
  private mapColumns(headers: string[]): { [key: string]: number } {
    const columnMap: { [key: string]: number } = {};
    
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();
      
      // Mapear diferentes variações de nomes de colunas
      if (normalizedHeader.includes('data') || normalizedHeader.includes('date')) {
        columnMap.data = index;
      } else if (normalizedHeader.includes('hora') || normalizedHeader.includes('time')) {
        columnMap.hora = index;
      } else if (normalizedHeader.includes('operador') || normalizedHeader.includes('operator') || normalizedHeader.includes('atendente')) {
        columnMap.operador = index;
      } else if (normalizedHeader.includes('cliente') || normalizedHeader.includes('client') || normalizedHeader.includes('customer')) {
        columnMap.cliente = index;
      } else if (normalizedHeader.includes('dura') || normalizedHeader.includes('duration') || normalizedHeader.includes('tempo')) {
        columnMap.duracao = index;
      } else if (normalizedHeader.includes('status') || normalizedHeader.includes('situa')) {
        columnMap.status = index;
      } else if (normalizedHeader.includes('fila') || normalizedHeader.includes('queue') || normalizedHeader.includes('grupo')) {
        columnMap.fila = index;
      } else if (normalizedHeader.includes('satisfa') || normalizedHeader.includes('rating') || normalizedHeader.includes('nota')) {
        columnMap.satisfacao = index;
      } else if (normalizedHeader.includes('obs') || normalizedHeader.includes('observa') || normalizedHeader.includes('note')) {
        columnMap.observacoes = index;
      }
    });

    return columnMap;
  }

  /**
   * Processar dados de uma chamada individual
   */
  private processCallData(row: any[], columnMap: { [key: string]: number }, index: number): ProcessedCallData | null {
    try {
      // Extrair dados básicos
      const data = this.extractValue(row, columnMap.data);
      const hora = this.extractValue(row, columnMap.hora);
      const operador = this.extractValue(row, columnMap.operador);
      const cliente = this.extractValue(row, columnMap.cliente);
      const duracaoStr = this.extractValue(row, columnMap.duracao);
      const status = this.extractValue(row, columnMap.status);
      const fila = this.extractValue(row, columnMap.fila);
      const satisfacao = this.extractValue(row, columnMap.satisfacao);
      const observacoes = this.extractValue(row, columnMap.observacoes);

      // Validar dados obrigatórios
      if (!data || !hora || !operador || !status) {
        return null;
      }

      // Processar data e hora
      const timestamp = this.parseDateTime(data, hora);
      if (!timestamp) return null;

      // Processar duração
      const duracao = this.parseDuration(duracaoStr);
      const duracaoFormatada = this.formatDuration(duracao);

      // Determinar período do dia
      const periodo = this.getPeriodo(timestamp);

      // Determinar dia da semana
      const diaSemana = this.getDiaSemana(timestamp);
      const isWeekend = this.isWeekend(timestamp);

      // Processar satisfação
      const satisfacaoNum = satisfacao ? parseFloat(satisfacao) : undefined;

      return {
        id: `call_${index}_${timestamp.getTime()}`,
        data,
        hora,
        operador: operador.trim(),
        cliente: cliente?.trim() || 'N/A',
        duracao,
        duracaoFormatada,
        status: this.normalizeStatus(status),
        fila: fila?.trim() || 'Geral',
        satisfacao: satisfacaoNum,
        observacoes: observacoes?.trim(),
        timestamp,
        periodo,
        diaSemana,
        isWeekend
      };
    } catch (error) {
      console.warn(`Erro ao processar linha ${index + 2}:`, error);
      return null;
    }
  }

  /**
   * Extrair valor de uma coluna
   */
  private extractValue(row: any[], columnIndex: number | undefined): string | undefined {
    if (columnIndex === undefined || columnIndex < 0 || columnIndex >= row.length) {
      return undefined;
    }
    const value = row[columnIndex];
    return value ? String(value).trim() : undefined;
  }

  /**
   * Parsear data e hora
   */
  private parseDateTime(data: string, hora: string): Date | null {
    try {
      // Tentar diferentes formatos de data
      let dateStr = data;
      if (data.includes('/')) {
        // Formato DD/MM/YYYY
        const parts = data.split('/');
        if (parts.length === 3) {
          dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

      const dateTimeStr = `${dateStr}T${hora}`;
      const timestamp = new Date(dateTimeStr);
      
      if (isNaN(timestamp.getTime())) {
        return null;
      }
      
      return timestamp;
    } catch (error) {
      return null;
    }
  }

  /**
   * Parsear duração
   */
  private parseDuration(duracaoStr: string | undefined): number {
    if (!duracaoStr) return 0;

    // Formato MM:SS ou HH:MM:SS
    if (duracaoStr.includes(':')) {
      const parts = duracaoStr.split(':');
      if (parts.length === 2) {
        // MM:SS
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      } else if (parts.length === 3) {
        // HH:MM:SS
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      }
    }

    // Apenas números (assumir segundos)
    const num = parseInt(duracaoStr);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Formatar duração
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Normalizar status
   */
  private normalizeStatus(status: string): 'Atendida' | 'Perdida' | 'Abandonada' | 'Em Espera' {
    const normalized = status.toLowerCase().trim();
    
    if (normalized.includes('atend') || normalized.includes('answer')) {
      return 'Atendida';
    } else if (normalized.includes('perd') || normalized.includes('miss')) {
      return 'Perdida';
    } else if (normalized.includes('aband') || normalized.includes('abort')) {
      return 'Abandonada';
    } else {
      return 'Em Espera';
    }
  }

  /**
   * Determinar período do dia
   */
  private getPeriodo(timestamp: Date): 'manha' | 'tarde' | 'noite' {
    const hour = timestamp.getHours();
    if (hour >= 6 && hour < 12) return 'manha';
    if (hour >= 12 && hour < 18) return 'tarde';
    return 'noite';
  }

  /**
   * Obter dia da semana
   */
  private getDiaSemana(timestamp: Date): string {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[timestamp.getDay()];
  }

  /**
   * Verificar se é fim de semana
   */
  private isWeekend(timestamp: Date): boolean {
    const day = timestamp.getDay();
    return day === 0 || day === 6; // Domingo ou Sábado
  }

  /**
   * Calcular métricas por operador
   */
  private calculateOperatorMetrics(): void {
    const operatorGroups = new Map<string, ProcessedCallData[]>();

    // Agrupar por operador
    this.processedData.forEach(call => {
      if (!operatorGroups.has(call.operador)) {
        operatorGroups.set(call.operador, []);
      }
      operatorGroups.get(call.operador)!.push(call);
    });

    // Calcular métricas para cada operador
    operatorGroups.forEach((calls, operador) => {
      const totalChamadas = calls.length;
      const chamadasAtendidas = calls.filter(c => c.status === 'Atendida').length;
      const chamadasPerdidas = calls.filter(c => c.status === 'Perdida').length;
      const chamadasAbandonadas = calls.filter(c => c.status === 'Abandonada').length;
      
      const taxaAtendimento = totalChamadas > 0 ? (chamadasAtendidas / totalChamadas) * 100 : 0;
      const duracaoTotal = calls.reduce((sum, c) => sum + c.duracao, 0);
      const duracaoMedia = chamadasAtendidas > 0 ? duracaoTotal / chamadasAtendidas : 0;
      
      const satisfacoes = calls.filter(c => c.satisfacao !== undefined).map(c => c.satisfacao!);
      const satisfacaoMedia = satisfacoes.length > 0 ? satisfacoes.reduce((sum, s) => sum + s, 0) / satisfacoes.length : 0;
      
      // Calcular eficiência (combinação de taxa de atendimento e satisfação)
      const eficiencia = (taxaAtendimento * 0.7) + (satisfacaoMedia * 20 * 0.3);

      // Agrupar por período
      const periodo = {
        manha: calls.filter(c => c.periodo === 'manha').length,
        tarde: calls.filter(c => c.periodo === 'tarde').length,
        noite: calls.filter(c => c.periodo === 'noite').length
      };

      // Agrupar por dia
      const dias: { [key: string]: number } = {};
      calls.forEach(call => {
        dias[call.diaSemana] = (dias[call.diaSemana] || 0) + 1;
      });

      this.operatorMetrics.set(operador, {
        operador,
        totalChamadas,
        chamadasAtendidas,
        chamadasPerdidas,
        chamadasAbandonadas,
        taxaAtendimento: Number(taxaAtendimento.toFixed(2)),
        duracaoMedia: Number(duracaoMedia.toFixed(2)),
        duracaoTotal,
        satisfacaoMedia: Number(satisfacaoMedia.toFixed(2)),
        eficiencia: Number(eficiencia.toFixed(2)),
        ranking: 0, // Será calculado depois
        periodo,
        dias
      });
    });

    // Calcular ranking
    const sortedOperators = Array.from(this.operatorMetrics.values())
      .sort((a, b) => b.eficiencia - a.eficiencia);
    
    sortedOperators.forEach((op, index) => {
      op.ranking = index + 1;
    });
  }

  /**
   * Calcular métricas por fila
   */
  private calculateQueueMetrics(): void {
    const queueGroups = new Map<string, ProcessedCallData[]>();

    // Agrupar por fila
    this.processedData.forEach(call => {
      if (!queueGroups.has(call.fila)) {
        queueGroups.set(call.fila, []);
      }
      queueGroups.get(call.fila)!.push(call);
    });

    // Calcular métricas para cada fila
    queueGroups.forEach((calls, fila) => {
      const totalChamadas = calls.length;
      const chamadasAtendidas = calls.filter(c => c.status === 'Atendida').length;
      const taxaAtendimento = totalChamadas > 0 ? (chamadasAtendidas / totalChamadas) * 100 : 0;
      
      const duracaoTotal = calls.reduce((sum, c) => sum + c.duracao, 0);
      const tempoMedioAtendimento = chamadasAtendidas > 0 ? duracaoTotal / chamadasAtendidas : 0;
      
      const satisfacoes = calls.filter(c => c.satisfacao !== undefined).map(c => c.satisfacao!);
      const satisfacaoMedia = satisfacoes.length > 0 ? satisfacoes.reduce((sum, s) => sum + s, 0) / satisfacoes.length : 0;
      
      const operadores = Array.from(new Set(calls.map(c => c.operador)));
      
      // Volume por hora
      const volumePorHora: { [key: string]: number } = {};
      calls.forEach(call => {
        const hora = call.timestamp.getHours();
        volumePorHora[hora] = (volumePorHora[hora] || 0) + 1;
      });

      this.queueMetrics.set(fila, {
        fila,
        totalChamadas,
        chamadasAtendidas,
        taxaAtendimento: Number(taxaAtendimento.toFixed(2)),
        tempoMedioEspera: 0, // Implementar cálculo de tempo de espera
        tempoMedioAtendimento: Number(tempoMedioAtendimento.toFixed(2)),
        satisfacaoMedia: Number(satisfacaoMedia.toFixed(2)),
        operadores,
        volumePorHora
      });
    });
  }

  /**
   * Calcular métricas gerais
   */
  private calculateGeneralMetrics(): void {
    const totalChamadas = this.processedData.length;
    const chamadasAtendidas = this.processedData.filter(c => c.status === 'Atendida').length;
    const chamadasPerdidas = this.processedData.filter(c => c.status === 'Perdida').length;
    const chamadasAbandonadas = this.processedData.filter(c => c.status === 'Abandonada').length;
    
    const taxaAtendimentoGeral = totalChamadas > 0 ? (chamadasAtendidas / totalChamadas) * 100 : 0;
    
    const duracaoTotal = this.processedData.reduce((sum, c) => sum + c.duracao, 0);
    const duracaoMediaGeral = chamadasAtendidas > 0 ? duracaoTotal / chamadasAtendidas : 0;
    
    const satisfacoes = this.processedData.filter(c => c.satisfacao !== undefined).map(c => c.satisfacao!);
    const satisfacaoMediaGeral = satisfacoes.length > 0 ? satisfacoes.reduce((sum, s) => sum + s, 0) / satisfacoes.length : 0;
    
    const operadoresAtivos = this.operatorMetrics.size;
    const filasAtivas = this.queueMetrics.size;
    
    // Calcular período
    const timestamps = this.processedData.map(c => c.timestamp);
    const inicio = timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : new Date();
    const fim = timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : new Date();

    this.generalMetrics = {
      totalChamadas,
      chamadasAtendidas,
      chamadasPerdidas,
      chamadasAbandonadas,
      taxaAtendimentoGeral: Number(taxaAtendimentoGeral.toFixed(2)),
      duracaoMediaGeral: Number(duracaoMediaGeral.toFixed(2)),
      satisfacaoMediaGeral: Number(satisfacaoMediaGeral.toFixed(2)),
      operadoresAtivos,
      filasAtivas,
      periodo: { inicio, fim },
      tendencias: {
        crescimento: 0, // Implementar cálculo de tendências
        comparacaoAnterior: 0
      }
    };
  }

  /**
   * Obter dados processados
   */
  getProcessedData(): ProcessedCallData[] {
    return this.processedData;
  }

  /**
   * Obter métricas de operadores
   */
  getOperatorMetrics(): OperatorMetrics[] {
    return Array.from(this.operatorMetrics.values());
  }

  /**
   * Obter métricas de filas
   */
  getQueueMetrics(): QueueMetrics[] {
    return Array.from(this.queueMetrics.values());
  }

  /**
   * Obter métricas gerais
   */
  getGeneralMetrics(): GeneralMetrics | null {
    return this.generalMetrics;
  }

  /**
   * Obter dados de comparação
   */
  getComparisonData(periodoAnterior: ProcessedCallData[]): ComparisonData | null {
    if (!this.generalMetrics) return null;

    // Processar dados do período anterior
    const anteriorProcessor = new DataProcessorService();
    const anteriorData = anteriorProcessor.processSpreadsheetData([
      ['Data', 'Hora', 'Operador', 'Cliente', 'Duração', 'Status', 'Fila', 'Satisfação'],
      ...periodoAnterior.map(call => [
        call.data, call.hora, call.operador, call.cliente, 
        call.duracaoFormatada, call.status, call.fila, call.satisfacao || ''
      ])
    ]);

    const anteriorMetrics = anteriorProcessor.getGeneralMetrics();
    if (!anteriorMetrics) return null;

    // Calcular diferenças
    const diferencas = {
      totalChamadas: this.generalMetrics.totalChamadas - anteriorMetrics.totalChamadas,
      taxaAtendimento: this.generalMetrics.taxaAtendimentoGeral - anteriorMetrics.taxaAtendimentoGeral,
      duracaoMedia: this.generalMetrics.duracaoMediaGeral - anteriorMetrics.duracaoMediaGeral,
      satisfacao: this.generalMetrics.satisfacaoMediaGeral - anteriorMetrics.satisfacaoMediaGeral
    };

    return {
      periodoAtual: this.generalMetrics,
      periodoAnterior: anteriorMetrics,
      diferencas,
      operadores: {} // Implementar comparação de operadores
    };
  }

  /**
   * Limpar dados processados
   */
  clearProcessedData(): void {
    this.processedData = [];
    this.operatorMetrics.clear();
    this.queueMetrics.clear();
    this.generalMetrics = null;
    this.lastProcessed = null;
  }

  /**
   * Verificar se há dados processados
   */
  hasProcessedData(): boolean {
    return this.processedData.length > 0;
  }

  /**
   * Obter estatísticas de processamento
   */
  getProcessingStats(): {
    totalProcessed: number;
    lastProcessed: Date | null;
    operatorsCount: number;
    queuesCount: number;
  } {
    return {
      totalProcessed: this.processedData.length,
      lastProcessed: this.lastProcessed,
      operatorsCount: this.operatorMetrics.size,
      queuesCount: this.queueMetrics.size
    };
  }
}

export const dataProcessorService = DataProcessorService.getInstance();
export default dataProcessorService;

