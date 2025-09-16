// Serviço de Análise de Dados da Planilha 55PBX
// Processa dados reais e gera análises comparativas

export interface CallData {
  chamada: string;
  audio: string;
  operador: string;
  data: string;
  hora: string;
  dataAtendimento: string;
  horaAtendimento: string;
  pais: string;
  ddd: string;
  numero: string;
  fila: string;
  tempoUra: string;
  tempoEspera: string;
  tempoFalado: string;
  tempoTotal: string;
  desconexao: string;
  telefoneEntrada: string;
  caminhoUra: string;
  cpfCnpj: string;
  pedido: string;
  idLigacao: string;
  idLigacaoOrigem: string;
  idTicket: string;
  fluxoFilas: string;
  whQualityReason: string;
  whHumorReason: string;
  questionarioQualidade: string;
  perguntaAtendente: string;
  perguntaSolucao: string;
  dia: string;
  qtde: string;
  ate20Seg: string;
  faixa: string;
  mes: string;
  tmaFalado: string;
  tempoUraSeg: string;
  tmeSeg: string;
  tmaSeg: string;
  pergunta1: string;
  pergunta2: string;
}

export interface OperatorProfile {
  nome: string;
  totalChamadas: number;
  chamadasAtendidas: number;
  chamadasPerdidas: number;
  taxaAtendimento: number;
  tempoMedioAtendimento: number;
  tempoMedioEspera: number;
  satisfacaoMedia: number;
  filas: string[];
  periodo: {
    inicio: string;
    fim: string;
  };
  performance: {
    excelente: number;
    boa: number;
    regular: number;
    ruim: number;
  };
}

export interface PeriodComparison {
  periodo: string;
  totalChamadas: number;
  chamadasAtendidas: number;
  taxaAtendimento: number;
  tempoMedioAtendimento: number;
  satisfacaoMedia: number;
  operadores: {
    nome: string;
    chamadas: number;
    taxaAtendimento: number;
  }[];
}

export interface QueueAnalysis {
  fila: string;
  totalChamadas: number;
  chamadasAtendidas: number;
  taxaAtendimento: number;
  tempoMedioEspera: number;
  satisfacaoMedia: number;
  operadores: string[];
}

class SpreadsheetAnalysisService {
  private data: CallData[] = [];

  /**
   * Processar dados brutos da planilha
   */
  processSpreadsheetData(rawData: any[][]): CallData[] {
    if (!rawData || rawData.length < 2) return [];

    const rows = rawData.slice(1);

    this.data = rows.map(row => ({
      chamada: row[0] || '',
      audio: row[1] || '',
      operador: row[2] || '',
      data: row[3] || '',
      hora: row[4] || '',
      dataAtendimento: row[5] || '',
      horaAtendimento: row[6] || '',
      pais: row[7] || '',
      ddd: row[8] || '',
      numero: row[9] || '',
      fila: row[10] || '',
      tempoUra: row[11] || '',
      tempoEspera: row[12] || '',
      tempoFalado: row[13] || '',
      tempoTotal: row[14] || '',
      desconexao: row[15] || '',
      telefoneEntrada: row[16] || '',
      caminhoUra: row[17] || '',
      cpfCnpj: row[18] || '',
      pedido: row[19] || '',
      idLigacao: row[20] || '',
      idLigacaoOrigem: row[21] || '',
      idTicket: row[22] || '',
      fluxoFilas: row[23] || '',
      whQualityReason: row[24] || '',
      whHumorReason: row[25] || '',
      questionarioQualidade: row[26] || '',
      perguntaAtendente: row[27] || '',
      perguntaSolucao: row[28] || '',
      dia: row[29] || '',
      qtde: row[30] || '',
      ate20Seg: row[31] || '',
      faixa: row[32] || '',
      mes: row[33] || '',
      tmaFalado: row[34] || '',
      tempoUraSeg: row[35] || '',
      tmeSeg: row[36] || '',
      tmaSeg: row[37] || '',
      pergunta1: row[38] || '',
      pergunta2: row[39] || ''
    }));

    return this.data;
  }

  /**
   * Obter estatísticas gerais do período
   */
  getGeneralStats(): {
    totalChamadas: number;
    chamadasAtendidas: number;
    chamadasPerdidas: number;
    taxaAtendimento: number;
    tempoMedioAtendimento: number;
    tempoMedioEspera: number;
    satisfacaoMedia: number;
    periodo: {
      inicio: string;
      fim: string;
    };
  } {
    if (this.data.length === 0) {
      return {
        totalChamadas: 0,
        chamadasAtendidas: 0,
        chamadasPerdidas: 0,
        taxaAtendimento: 0,
        tempoMedioAtendimento: 0,
        tempoMedioEspera: 0,
        satisfacaoMedia: 0,
        periodo: { inicio: '', fim: '' }
      };
    }

    const atendidas = this.data.filter(call => call.chamada === 'Atendida');
    const perdidas = this.data.filter(call => call.chamada === 'Retida na URA');
    
    const datas = this.data.map(call => call.data).filter(Boolean).sort();
    const periodo = {
      inicio: datas[0] || '',
      fim: datas[datas.length - 1] || ''
    };

    const tempoMedioAtendimento = this.calculateAverageTime(atendidas.map(call => call.tempoFalado));
    const tempoMedioEspera = this.calculateAverageTime(this.data.map(call => call.tempoEspera));
    const satisfacaoMedia = this.calculateAverageSatisfaction(atendidas);

    return {
      totalChamadas: this.data.length,
      chamadasAtendidas: atendidas.length,
      chamadasPerdidas: perdidas.length,
      taxaAtendimento: this.data.length > 0 ? (atendidas.length / this.data.length) * 100 : 0,
      tempoMedioAtendimento,
      tempoMedioEspera,
      satisfacaoMedia,
      periodo
    };
  }

  /**
   * Obter perfis de operadores
   */
  getOperatorProfiles(): OperatorProfile[] {
    if (this.data.length === 0) return [];

    const operadores = Array.from(new Set(this.data.map(call => call.operador).filter(Boolean)));
    
    return operadores.map(operador => {
      const chamadasOperador = this.data.filter(call => call.operador === operador);
      const atendidas = chamadasOperador.filter(call => call.chamada === 'Atendida');
      const perdidas = chamadasOperador.filter(call => call.chamada === 'Retida na URA');
      
      const filas = Array.from(new Set(chamadasOperador.map(call => call.fila).filter(Boolean)));
      
      const datas = chamadasOperador.map(call => call.data).filter(Boolean).sort();
      const periodo = {
        inicio: datas[0] || '',
        fim: datas[datas.length - 1] || ''
      };

      const tempoMedioAtendimento = this.calculateAverageTime(atendidas.map(call => call.tempoFalado));
      const tempoMedioEspera = this.calculateAverageTime(chamadasOperador.map(call => call.tempoEspera));
      const satisfacaoMedia = this.calculateAverageSatisfaction(atendidas);

      const performance = this.calculatePerformance(atendidas);

      return {
        nome: operador,
        totalChamadas: chamadasOperador.length,
        chamadasAtendidas: atendidas.length,
        chamadasPerdidas: perdidas.length,
        taxaAtendimento: chamadasOperador.length > 0 ? (atendidas.length / chamadasOperador.length) * 100 : 0,
        tempoMedioAtendimento,
        tempoMedioEspera,
        satisfacaoMedia,
        filas,
        periodo,
        performance
      };
    });
  }

  /**
   * Obter comparação por períodos
   */
  getPeriodComparison(): PeriodComparison[] {
    if (this.data.length === 0) return [];

    // Agrupar por mês
    const dataPorMes = this.data.reduce((acc, call) => {
      const mes = call.mes || 'Desconhecido';
      if (!acc[mes]) acc[mes] = [];
      acc[mes].push(call);
      return acc;
    }, {} as Record<string, CallData[]>);

    return Object.entries(dataPorMes).map(([mes, chamadas]) => {
      const atendidas = chamadas.filter(call => call.chamada === 'Atendida');
      const tempoMedioAtendimento = this.calculateAverageTime(atendidas.map(call => call.tempoFalado));
      const satisfacaoMedia = this.calculateAverageSatisfaction(atendidas);

      // Operadores do período
      const operadores = Array.from(new Set(chamadas.map(call => call.operador).filter(Boolean)));
      const operadoresStats = operadores.map(operador => {
        const chamadasOperador = chamadas.filter(call => call.operador === operador);
        const atendidasOperador = chamadasOperador.filter(call => call.chamada === 'Atendida');
        return {
          nome: operador,
          chamadas: chamadasOperador.length,
          taxaAtendimento: chamadasOperador.length > 0 ? (atendidasOperador.length / chamadasOperador.length) * 100 : 0
        };
      });

      return {
        periodo: mes,
        totalChamadas: chamadas.length,
        chamadasAtendidas: atendidas.length,
        taxaAtendimento: chamadas.length > 0 ? (atendidas.length / chamadas.length) * 100 : 0,
        tempoMedioAtendimento,
        satisfacaoMedia,
        operadores: operadoresStats
      };
    }).sort((a, b) => a.periodo.localeCompare(b.periodo));
  }

  /**
   * Obter análise por filas
   */
  getQueueAnalysis(): QueueAnalysis[] {
    if (this.data.length === 0) return [];

    const filas = Array.from(new Set(this.data.map(call => call.fila).filter(Boolean)));
    
    return filas.map(fila => {
      const chamadasFila = this.data.filter(call => call.fila === fila);
      const atendidas = chamadasFila.filter(call => call.chamada === 'Atendida');
      const tempoMedioEspera = this.calculateAverageTime(chamadasFila.map(call => call.tempoEspera));
      const satisfacaoMedia = this.calculateAverageSatisfaction(atendidas);
      const operadores = Array.from(new Set(chamadasFila.map(call => call.operador).filter(Boolean)));

      return {
        fila,
        totalChamadas: chamadasFila.length,
        chamadasAtendidas: atendidas.length,
        taxaAtendimento: chamadasFila.length > 0 ? (atendidas.length / chamadasFila.length) * 100 : 0,
        tempoMedioEspera,
        satisfacaoMedia,
        operadores
      };
    }).sort((a, b) => b.totalChamadas - a.totalChamadas);
  }

  /**
   * Calcular tempo médio em segundos
   */
  private calculateAverageTime(times: string[]): number {
    const validTimes = times
      .filter(time => time && time !== '#VALUE!' && time !== '#REF!')
      .map(time => {
        // Converter formato HH:MM:SS para segundos
        const parts = time.split(':');
        if (parts.length === 3) {
          return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
        return 0;
      })
      .filter(seconds => seconds > 0);

    return validTimes.length > 0 ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : 0;
  }

  /**
   * Calcular satisfação média
   */
  private calculateAverageSatisfaction(chamadas: CallData[]): number {
    const satisfacoes = chamadas
      .map(call => {
        const pergunta1 = parseInt(call.pergunta1) || 0;
        const pergunta2 = parseInt(call.pergunta2) || 0;
        return pergunta1 > 0 ? pergunta1 : pergunta2;
      })
      .filter(sat => sat > 0);

    return satisfacoes.length > 0 ? satisfacoes.reduce((a, b) => a + b, 0) / satisfacoes.length : 0;
  }

  /**
   * Calcular performance do operador
   */
  private calculatePerformance(chamadas: CallData[]): { excelente: number; boa: number; regular: number; ruim: number } {
    const satisfacoes = chamadas
      .map(call => {
        const pergunta1 = parseInt(call.pergunta1) || 0;
        const pergunta2 = parseInt(call.pergunta2) || 0;
        return pergunta1 > 0 ? pergunta1 : pergunta2;
      })
      .filter(sat => sat > 0);

    const total = satisfacoes.length;
    if (total === 0) return { excelente: 0, boa: 0, regular: 0, ruim: 0 };

    const excelente = satisfacoes.filter(sat => sat >= 5).length;
    const boa = satisfacoes.filter(sat => sat === 4).length;
    const regular = satisfacoes.filter(sat => sat === 3).length;
    const ruim = satisfacoes.filter(sat => sat <= 2).length;

    return {
      excelente: (excelente / total) * 100,
      boa: (boa / total) * 100,
      regular: (regular / total) * 100,
      ruim: (ruim / total) * 100
    };
  }

  /**
   * Obter dados para gráficos
   */
  getChartData() {
    const stats = this.getGeneralStats();
    const operadores = this.getOperatorProfiles();
    const periodos = this.getPeriodComparison();
    const filas = this.getQueueAnalysis();

    return {
      stats,
      operadores,
      periodos,
      filas,
      chartData: {
        chamadasPorDia: this.getChamadasPorDia(),
        performanceOperadores: operadores.map(op => ({
          nome: op.nome,
          taxaAtendimento: op.taxaAtendimento,
          satisfacao: op.satisfacaoMedia
        })),
        chamadasPorFila: filas.map(fila => ({
          fila: fila.fila,
          total: fila.totalChamadas,
          atendidas: fila.chamadasAtendidas
        }))
      }
    };
  }

  /**
   * Obter chamadas por dia
   */
  private getChamadasPorDia() {
    const chamadasPorDia = this.data.reduce((acc, call) => {
      const data = call.data;
      if (!acc[data]) acc[data] = { total: 0, atendidas: 0 };
      acc[data].total++;
      if (call.chamada === 'Atendida') acc[data].atendidas++;
      return acc;
    }, {} as Record<string, { total: number; atendidas: number }>);

    return Object.entries(chamadasPorDia)
      .map(([data, stats]) => ({
        data,
        total: stats.total,
        atendidas: stats.atendidas,
        taxaAtendimento: (stats.atendidas / stats.total) * 100
      }))
      .sort((a, b) => a.data.localeCompare(b.data));
  }
}

export const spreadsheetAnalysisService = new SpreadsheetAnalysisService();
