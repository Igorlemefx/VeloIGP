/**
 * Processador de Dados conforme Manual VeloIGP
 * Baseado no documento "Dados & Referencias.docx"
 */

import { CalculationEngineFactory, CalculationResult } from './calculationEngines';

export interface ManualDataRow {
  data: string;           // Coluna D
  nomeAtendente: string;  // Coluna C
  tempoAtendimento: number; // Coluna N (em segundos)
  avaliacaoAtendente: number; // Coluna AB (Pergunta 1)
  avaliacaoSolucao: number;   // Coluna AC (Pergunta 2)
  contagemChamadas: string;   // Coluna A (considerar somente "Atendidas")
  desconexaoChamada: string;  // Coluna P
}

export interface FiltroPeriodo {
  tipo: 'ontem' | 'semana' | 'mes' | 'ano';
  dataInicio: Date;
  dataFim: Date;
  label: string;
}

export interface IndicadoresGerais {
  totalLigacoesAtendidas: number;
  tempoMedioAtendimento: number; // em segundos
  avaliacaoAtendimento: number;  // média Pergunta 1
  avaliacaoSolucao: number;      // média Pergunta 2
  periodo: FiltroPeriodo;
}

export interface IndicadoresOperador {
  nomeAtendente: string;
  totalLigacoesAtendidas: number;
  tempoMedioAtendimento: number;
  avaliacaoAtendimento: number;
  avaliacaoSolucao: number;
  eficiencia: number; // score combinado
}

export class ManualDataProcessor {
  private static instance: ManualDataProcessor;
  private cache: Map<string, any> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static getInstance(): ManualDataProcessor {
    if (!ManualDataProcessor.instance) {
      ManualDataProcessor.instance = new ManualDataProcessor();
    }
    return ManualDataProcessor.instance;
  }

  /**
   * Processar dados brutos da planilha conforme manual
   */
  processRawData(rawData: any[][]): ManualDataRow[] {
    console.log('🔄 Processando dados conforme manual VeloIGP...');
    
    if (!rawData || rawData.length < 2) {
      console.warn('⚠️ Dados insuficientes para processamento');
      return [];
    }

    const headers = rawData[0];
    const dataRows = rawData.slice(1);

    // Mapear colunas conforme manual
    const colD = this.findColumnIndex(headers, 'D'); // Data
    const colC = this.findColumnIndex(headers, 'C'); // Nome do Atendente
    const colN = this.findColumnIndex(headers, 'N'); // Tempo de Atendimento
    const colAB = this.findColumnIndex(headers, 'AB'); // Avaliação do Atendente
    const colAC = this.findColumnIndex(headers, 'AC'); // Avaliação da Solução
    const colA = this.findColumnIndex(headers, 'A'); // Contagem das chamadas
    const colP = this.findColumnIndex(headers, 'P'); // Desconexão da chamada

    console.log('📊 Mapeamento de colunas:', {
      Data: colD,
      NomeAtendente: colC,
      TempoAtendimento: colN,
      AvaliacaoAtendente: colAB,
      AvaliacaoSolucao: colAC,
      ContagemChamadas: colA,
      DesconexaoChamada: colP
    });

    const processedData: ManualDataRow[] = [];

    dataRows.forEach((row, index) => {
      try {
        // Verificar se a chamada foi atendida (coluna A = "Atendidas")
        const contagemChamadas = row[colA]?.toString().trim() || '';
        if (contagemChamadas.toLowerCase() !== 'atendidas') {
          return; // Pular chamadas não atendidas
        }

        const processedRow: ManualDataRow = {
          data: this.parseDate(row[colD])?.toISOString().split('T')[0] || '',
          nomeAtendente: this.cleanString(row[colC]),
          tempoAtendimento: this.parseTimeToSeconds(row[colN]),
          avaliacaoAtendente: this.parseNumber(row[colAB]),
          avaliacaoSolucao: this.parseNumber(row[colAC]),
          contagemChamadas: contagemChamadas,
          desconexaoChamada: this.cleanString(row[colP])
        };

        // Validar dados obrigatórios
        if (processedRow.data && processedRow.nomeAtendente) {
          processedData.push(processedRow);
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao processar linha ${index + 2}:`, error);
      }
    });

    console.log(`✅ Dados processados: ${processedData.length} chamadas atendidas`);
    return processedData;
  }

  /**
   * Gerar filtros de período conforme manual
   */
  generatePeriodFilters(): FiltroPeriodo[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Ontem
    const ontem = new Date(today);
    ontem.setDate(ontem.getDate() - 1);
    
    // Semana (segunda a sábado)
    const inicioSemana = new Date(today);
    const diaSemana = today.getDay();
    const diasParaSegunda = diaSemana === 0 ? 6 : diaSemana - 1; // Domingo = 0, ajustar para 6
    inicioSemana.setDate(today.getDate() - diasParaSegunda);
    
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 5); // Segunda + 5 dias = Sábado
    
    // Mês atual
    const inicioMes = new Date(today.getFullYear(), today.getMonth(), 1);
    const fimMes = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Ano atual (mês a mês)
    const inicioAno = new Date(today.getFullYear(), 0, 1);
    const fimAno = new Date(today.getFullYear(), 11, 31);

    return [
      {
        tipo: 'ontem',
        dataInicio: ontem,
        dataFim: ontem,
        label: 'Ontem'
      },
      {
        tipo: 'semana',
        dataInicio: inicioSemana,
        dataFim: fimSemana,
        label: `Semana (${inicioSemana.toLocaleDateString('pt-BR')} - ${fimSemana.toLocaleDateString('pt-BR')})`
      },
      {
        tipo: 'mes',
        dataInicio: inicioMes,
        dataFim: fimMes,
        label: `Mês (${inicioMes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})`
      },
      {
        tipo: 'ano',
        dataInicio: inicioAno,
        dataFim: fimAno,
        label: `Ano (${today.getFullYear()})`
      }
    ];
  }

  /**
   * Calcular indicadores gerais conforme manual
   */
  calculateIndicadoresGerais(data: ManualDataRow[], filtro: FiltroPeriodo): IndicadoresGerais {
    console.log(`📊 Calculando indicadores gerais para ${filtro.label}...`);
    console.log(`📅 Período: ${filtro.dataInicio.toLocaleDateString('pt-BR')} - ${filtro.dataFim.toLocaleDateString('pt-BR')}`);
    console.log(`📊 Total de dados para filtrar: ${data.length}`);
    
    // Filtrar dados pelo período
    const dadosFiltrados = data.filter((row, index) => {
      // Converter data brasileira (DD/MM/YYYY) para Date
      const dataChamada = this.parseDate(row.data);
      if (!dataChamada) {
        if (index < 10) console.log(`❌ Data inválida na linha ${index}:`, row.data);
        return false;
      }
      
      // Comparar apenas a data (ignorar hora)
      const dataChamadaOnly = new Date(dataChamada.getFullYear(), dataChamada.getMonth(), dataChamada.getDate());
      const dataInicioOnly = new Date(filtro.dataInicio.getFullYear(), filtro.dataInicio.getMonth(), filtro.dataInicio.getDate());
      const dataFimOnly = new Date(filtro.dataFim.getFullYear(), filtro.dataFim.getMonth(), filtro.dataFim.getDate());
      
      const isInRange = dataChamadaOnly >= dataInicioOnly && dataChamadaOnly <= dataFimOnly;
      
      if (index < 10) {
        console.log(`📅 Linha ${index}: ${row.data} -> ${dataChamadaOnly.toLocaleDateString('pt-BR')} (${isInRange ? '✅' : '❌'})`);
      }
      
      return isInRange;
    });

    console.log(`📈 Dados filtrados: ${dadosFiltrados.length} chamadas`);

    // Total de ligações atendidas (soma da coluna A = "Atendidas")
    const totalLigacoesAtendidas = dadosFiltrados.length;

    // Tempo médio de atendimento (média simples da coluna N)
    const temposValidos = dadosFiltrados.filter(row => row.tempoAtendimento > 0);
    const tempoMedioAtendimento = temposValidos.length > 0 
      ? temposValidos.reduce((sum, row) => sum + row.tempoAtendimento, 0) / temposValidos.length
      : 0;

    console.log(`⏱️ Tempo médio: ${tempoMedioAtendimento}s (${temposValidos.length} registros válidos)`);

    // Avaliação do atendimento (média simples da coluna AB - Pergunta 1)
    const avaliacoesAtendimento = dadosFiltrados
      .filter(row => row.avaliacaoAtendente > 0)
      .map(row => row.avaliacaoAtendente);
    
    const avaliacaoAtendimento = avaliacoesAtendimento.length > 0
      ? avaliacoesAtendimento.reduce((sum, val) => sum + val, 0) / avaliacoesAtendimento.length
      : 0;

    console.log(`⭐ Avaliação atendimento: ${avaliacaoAtendimento} (${avaliacoesAtendimento.length} registros válidos)`);

    // Avaliação da solução (média simples da coluna AC - Pergunta 2)
    const avaliacoesSolucao = dadosFiltrados
      .filter(row => row.avaliacaoSolucao > 0)
      .map(row => row.avaliacaoSolucao);
    
    const avaliacaoSolucao = avaliacoesSolucao.length > 0
      ? avaliacoesSolucao.reduce((sum, val) => sum + val, 0) / avaliacoesSolucao.length
      : 0;

    console.log(`⭐ Avaliação solução: ${avaliacaoSolucao} (${avaliacoesSolucao.length} registros válidos)`);

    const indicadores: IndicadoresGerais = {
      totalLigacoesAtendidas,
      tempoMedioAtendimento,
      avaliacaoAtendimento,
      avaliacaoSolucao,
      periodo: filtro
    };

    console.log('✅ Indicadores gerais calculados:', indicadores);
    return indicadores;
  }

  /**
   * Calcular indicadores por operador conforme manual
   */
  calculateIndicadoresOperadores(data: ManualDataRow[], filtro: FiltroPeriodo): IndicadoresOperador[] {
    console.log(`👥 Calculando indicadores por operador para ${filtro.label}...`);
    
    // Filtrar dados pelo período
    const dadosFiltrados = data.filter(row => {
      // Converter data brasileira (DD/MM/YYYY) para Date
      const dataChamada = this.parseDate(row.data);
      if (!dataChamada) return false;
      
      // Comparar apenas a data (ignorar hora)
      const dataChamadaOnly = new Date(dataChamada.getFullYear(), dataChamada.getMonth(), dataChamada.getDate());
      const dataInicioOnly = new Date(filtro.dataInicio.getFullYear(), filtro.dataInicio.getMonth(), filtro.dataInicio.getDate());
      const dataFimOnly = new Date(filtro.dataFim.getFullYear(), filtro.dataFim.getMonth(), filtro.dataFim.getDate());
      
      return dataChamadaOnly >= dataInicioOnly && dataChamadaOnly <= dataFimOnly;
    });

    // Agrupar por operador
    const operadoresMap = new Map<string, ManualDataRow[]>();
    
    dadosFiltrados.forEach(row => {
      const nome = row.nomeAtendente;
      if (!operadoresMap.has(nome)) {
        operadoresMap.set(nome, []);
      }
      operadoresMap.get(nome)!.push(row);
    });

    const indicadoresOperadores: IndicadoresOperador[] = [];

    operadoresMap.forEach((chamadas, nomeAtendente) => {
      // Total de ligações atendidas
      const totalLigacoesAtendidas = chamadas.length;

      // Tempo médio de atendimento
      const tempoMedioAtendimento = chamadas.length > 0
        ? chamadas.reduce((sum, row) => sum + row.tempoAtendimento, 0) / chamadas.length
        : 0;

      // Avaliação do atendimento
      const avaliacoesAtendimento = chamadas
        .filter(row => row.avaliacaoAtendente > 0)
        .map(row => row.avaliacaoAtendente);
      
      const avaliacaoAtendimento = avaliacoesAtendimento.length > 0
        ? avaliacoesAtendimento.reduce((sum, val) => sum + val, 0) / avaliacoesAtendimento.length
        : 0;

      // Avaliação da solução
      const avaliacoesSolucao = chamadas
        .filter(row => row.avaliacaoSolucao > 0)
        .map(row => row.avaliacaoSolucao);
      
      const avaliacaoSolucao = avaliacoesSolucao.length > 0
        ? avaliacoesSolucao.reduce((sum, val) => sum + val, 0) / avaliacoesSolucao.length
        : 0;

      // Eficiência (score combinado)
      const eficiencia = this.calculateEficiencia(
        totalLigacoesAtendidas,
        tempoMedioAtendimento,
        avaliacaoAtendimento,
        avaliacaoSolucao
      );

      indicadoresOperadores.push({
        nomeAtendente,
        totalLigacoesAtendidas,
        tempoMedioAtendimento,
        avaliacaoAtendimento,
        avaliacaoSolucao,
        eficiencia
      });
    });

    // Ordenar por eficiência (maior primeiro)
    indicadoresOperadores.sort((a, b) => b.eficiencia - a.eficiencia);

    console.log(`✅ Indicadores de ${indicadoresOperadores.length} operadores calculados`);
    return indicadoresOperadores;
  }

  /**
   * Calcular eficiência do operador
   */
  private calculateEficiencia(
    totalChamadas: number,
    tempoMedio: number,
    avaliacaoAtendimento: number,
    avaliacaoSolucao: number
  ): number {
    // Fórmula de eficiência: (volume * qualidade) / tempo
    const volume = Math.min(totalChamadas / 10, 1); // Normalizar volume (máx 1)
    const qualidade = (avaliacaoAtendimento + avaliacaoSolucao) / 2 / 5; // Normalizar para 0-1
    const tempo = Math.max(1 - (tempoMedio / 300), 0); // Penalizar tempos muito longos
    
    return (volume * qualidade * tempo) * 100; // Retornar como porcentagem
  }

  /**
   * Utilitários de parsing
   */
  private findColumnIndex(headers: string[], columnLetter: string): number {
    // Converter letra da coluna para índice (A=0, B=1, C=2, etc.)
    return columnLetter.charCodeAt(0) - 65;
  }

  private parseDate(dateStr: any): Date | null {
    if (!dateStr) return null;
    
    try {
      console.log('🗓️ Tentando parsear data:', dateStr, 'tipo:', typeof dateStr);
      
      // Tentar formato brasileiro DD/MM/YYYY primeiro
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado
          const year = parseInt(parts[2], 10);
          
          console.log('📅 Partes da data:', { day, month: month + 1, year });
          
          if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 2000) {
            const parsedDate = new Date(year, month, day);
            console.log('✅ Data parseada com sucesso:', parsedDate);
            return parsedDate;
          }
        }
      }
      
      // Tentar formato ISO ou americano
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        console.log('✅ Data parseada (formato ISO):', date);
        return date;
      }
      
      console.log('❌ Falha ao parsear data:', dateStr);
      return null;
    } catch (error) {
      console.log('❌ Erro ao parsear data:', error);
      return null;
    }
  }

  private parseTimeToSeconds(timeStr: any): number {
    if (!timeStr) return 0;
    
    try {
      // Formato esperado: "MM:SS" ou "HH:MM:SS"
      const parts = timeStr.toString().split(':').map(Number);
      
      if (parts.length === 2) {
        // MM:SS
        return parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
      
      return 0;
    } catch {
      return 0;
    }
  }

  private parseNumber(value: any): number {
    if (!value) return 0;
    
    try {
      const num = parseFloat(value.toString().replace(',', '.'));
      return isNaN(num) ? 0 : num;
    } catch {
      return 0;
    }
  }

  private cleanString(str: any): string {
    if (!str) return '';
    return str.toString().trim();
  }

  /**
   * Formatar tempo para exibição
   */
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Formatar número para exibição
   */
  formatNumber(value: number, decimals: number = 1): string {
    return value.toFixed(decimals);
  }
}
