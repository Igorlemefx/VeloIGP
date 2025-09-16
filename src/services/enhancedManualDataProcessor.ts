/**
 * Processador de Dados Aprimorado - VeloIGP
 * Com motores de cálculo individuais e sistema de seleção de operadores
 */

import { CalculationEngineFactory, CalculationResult } from './calculationEngines';

export interface ManualDataRow {
  data: string;           // Coluna D
  nomeAtendente: string;  // Coluna C
  tempoAtendimento: number; // Coluna N (em segundos)
  avaliacaoAtendente: number; // Coluna AB (Pergunta 1)
  avaliacaoSolucao: number; // Coluna AC (Pergunta 2)
  contagemChamadas: string; // Coluna A (Atendidas/Abandonadas)
  desconexaoChamada: string; // Coluna P
}

export interface FiltroPeriodo {
  tipo: 'ontem' | 'semana' | 'mes' | 'ano';
  label: string;
  dataInicio: Date;
  dataFim: Date;
}

export interface IndicadoresGerais {
  totalLigacoesAtendidas: number;
  tempoMedioAtendimento: number;
  avaliacaoAtendimento: number;
  avaliacaoSolucao: number;
  periodo: FiltroPeriodo;
  calculations?: {
    totalLigacoes: CalculationResult;
    tempoMedio: CalculationResult;
    avaliacaoAtendimento: CalculationResult;
    avaliacaoSolucao: CalculationResult;
  };
}

export interface IndicadoresOperador {
  nomeAtendente: string;
  totalLigacoesAtendidas: number;
  tempoMedioAtendimento: number;
  avaliacaoAtendimento: number;
  avaliacaoSolucao: number;
  calculations?: {
    totalLigacoes: CalculationResult;
    tempoMedio: CalculationResult;
    avaliacaoAtendimento: CalculationResult;
    avaliacaoSolucao: CalculationResult;
  };
}

export class EnhancedManualDataProcessor {
  /**
   * Processar dados brutos da planilha
   */
  processRawData(rawData: any[]): ManualDataRow[] {
    try {
      // Logs apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Processando dados brutos da planilha...');
        console.log('📊 Dados recebidos:', rawData?.length || 0, 'linhas');
      }
      
      if (!rawData || rawData.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Nenhum dado para processar');
        }
        return [];
      }

      // Usar dados já processados pelo useMCPGoogleSheets
      if (rawData.length > 0 && typeof rawData[0] === 'object' && !Array.isArray(rawData[0])) {
        console.log('📋 Usando dados já processados pelo useMCPGoogleSheets');
        console.log('🔍 Primeiras 3 linhas para debug:', rawData.slice(0, 3));
        console.log('🔍 Chaves da primeira linha:', Object.keys(rawData[0]));
        
        // Mapear todas as linhas sem filtro primeiro
        const allProcessed = rawData.map((row: any, index: number) => {
          // Mapear campos conforme manual - tentar diferentes nomes de colunas
          const mappedRow: ManualDataRow = {
            data: row['Data'] || row['data'] || row['DATA'] || '', // D - Data
            nomeAtendente: row['Operador'] || row['operador'] || row['OPERADOR'] || row['Nome do Atendente'] || '', // C - Nome do Atendente
            tempoAtendimento: this.parseTimeToSeconds(row['Tempo Falado'] || row['tempo falado'] || row['TEMPO FALADO'] || ''), // N - Tempo de Atendimento
            avaliacaoAtendente: this.parseRating(row['Pergunta 1'] || row['pergunta 1'] || row['PERGUNTA 1'] || row['Avaliação Atendente'] || ''), // AB - Avaliação do Atendente
            avaliacaoSolucao: this.parseRating(row['Pergunta 2'] || row['pergunta 2'] || row['PERGUNTA 2'] || row['Avaliação Solução'] || ''), // AC - Avaliação da Solução
            contagemChamadas: row['Chamada'] || row['chamada'] || row['CHAMADA'] || row['Contagem das chamadas'] || '', // A - Contagem das chamadas
            desconexaoChamada: row['Desconexao'] || row['desconexao'] || row['DESCONEXAO'] || row['Desconexão da chamada'] || '' // P - Desconexão da chamada
          };

          // Log das primeiras 5 linhas para debug
          if (index < 5) {
            console.log(`📝 Linha ${index + 1} mapeada:`, {
              data: mappedRow.data,
              operador: mappedRow.nomeAtendente,
              chamada: mappedRow.contagemChamadas,
              tempo: mappedRow.tempoAtendimento
            });
          }

          return mappedRow;
        });

        // Agora filtrar apenas chamadas atendidas
        const processed = allProcessed.filter((row, index) => {
          const chamada = row.contagemChamadas?.toString().toLowerCase().trim();
          const isAtendida = chamada === 'atendidas' || 
                            chamada === 'atendida' || 
                            chamada === 'atendido' ||
                            chamada === 'answered' ||
                            chamada === 'atendida com sucesso' ||
                            chamada === 'concluída';
          
          // Log apenas das primeiras 10 para não poluir o console
          if (index < 10) {
            console.log(`🔍 Verificando chamada: "${row.contagemChamadas}" -> "${chamada}" -> ${isAtendida}`);
          }
          return isAtendida;
        });

        console.log('✅ Dados processados:', processed.length, 'chamadas atendidas');
        return processed;
      }

      // Fallback para dados em formato de array (se necessário)
      console.log('⚠️ Usando fallback para dados em formato de array');
      return [];
    } catch (error: any) {
      console.error('❌ Erro ao processar dados brutos:', error);
      console.error('❌ Stack trace:', error.stack);
      return [];
    }
  }

  /**
   * Gerar filtros de período
   */
  generatePeriodFilters(): FiltroPeriodo[] {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay() + 1); // Segunda-feira
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 5); // Sábado

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    const fimAno = new Date(hoje.getFullYear(), 11, 31);

    return [
      {
        tipo: 'ontem',
        label: 'Ontem',
        dataInicio: ontem,
        dataFim: ontem
      },
      {
        tipo: 'semana',
        label: 'Semana',
        dataInicio: inicioSemana,
        dataFim: fimSemana
      },
      {
        tipo: 'mes',
        label: 'Mês',
        dataInicio: inicioMes,
        dataFim: fimMes
      },
      {
        tipo: 'ano',
        label: 'Ano',
        dataInicio: inicioAno,
        dataFim: fimAno
      }
    ];
  }

  /**
   * Calcular indicadores gerais seguindo EXATAMENTE o manual
   * Manual: Data=D, Nome=C, Tempo=N, Avaliação Atendente=AB, Avaliação Solução=AC, Chamadas=A (só Atendidas)
   */
  calculateIndicadoresGerais(data: ManualDataRow[], filtro: FiltroPeriodo): IndicadoresGerais {
    console.log(`📊 Calculando indicadores gerais para ${filtro.label}...`);
    
    // Filtrar dados pelo período
    const dadosFiltrados = this.filterByPeriod(data, filtro);
    console.log(`📈 Dados filtrados: ${dadosFiltrados.length} chamadas`);

    if (dadosFiltrados.length === 0) {
      return {
        totalLigacoesAtendidas: 0,
        tempoMedioAtendimento: 0,
        avaliacaoAtendimento: 0,
        avaliacaoSolucao: 0,
        periodo: filtro
      };
    }

    // CÁLCULO 1: Total de ligações atendidas (Soma das chamadas "Atendidas")
    const totalLigacoes = dadosFiltrados.length; // Já filtrado apenas "Atendidas"

    // CÁLCULO 2: Tempo médio de atendimento (Média simples do "Tempo Falado")
    const temposValidos = dadosFiltrados
      .map(row => row.tempoAtendimento)
      .filter(tempo => tempo > 0);
    
    const tempoMedio = temposValidos.length > 0 
      ? temposValidos.reduce((sum, tempo) => sum + tempo, 0) / temposValidos.length
      : 0;

    // CÁLCULO 3: Avaliação do atendimento (Média simples da "Pergunta 1")
    const avaliacoesAtendimento = dadosFiltrados
      .map(row => row.avaliacaoAtendente)
      .filter(avaliacao => avaliacao > 0);
    
    const avaliacaoAtendimento = avaliacoesAtendimento.length > 0
      ? avaliacoesAtendimento.reduce((sum, aval) => sum + aval, 0) / avaliacoesAtendimento.length
      : 0;

    // CÁLCULO 4: Avaliação da solução (Média simples da "Pergunta 2")
    const avaliacoesSolucao = dadosFiltrados
      .map(row => row.avaliacaoSolucao)
      .filter(avaliacao => avaliacao > 0);
    
    const avaliacaoSolucao = avaliacoesSolucao.length > 0
      ? avaliacoesSolucao.reduce((sum, aval) => sum + aval, 0) / avaliacoesSolucao.length
      : 0;

    // Usar motores de cálculo para formatação precisa
    const calculations = CalculationEngineFactory.calculateAll(dadosFiltrados);

    const resultado: IndicadoresGerais = {
      totalLigacoesAtendidas: totalLigacoes,
      tempoMedioAtendimento: tempoMedio,
      avaliacaoAtendimento: avaliacaoAtendimento,
      avaliacaoSolucao: avaliacaoSolucao,
      periodo: filtro,
      calculations: {
        totalLigacoes: {
          value: totalLigacoes,
          formatted: totalLigacoes.toLocaleString('pt-BR'),
          precision: 0,
          isValid: totalLigacoes >= 0
        },
        tempoMedio: {
          value: tempoMedio,
          formatted: this.formatTime(tempoMedio),
          precision: 2,
          isValid: tempoMedio >= 0
        },
        avaliacaoAtendimento: {
          value: avaliacaoAtendimento,
          formatted: avaliacaoAtendimento.toFixed(1),
          precision: 1,
          isValid: avaliacaoAtendimento >= 0 && avaliacaoAtendimento <= 5
        },
        avaliacaoSolucao: {
          value: avaliacaoSolucao,
          formatted: avaliacaoSolucao.toFixed(1),
          precision: 1,
          isValid: avaliacaoSolucao >= 0 && avaliacaoSolucao <= 5
        }
      }
    };

    console.log('✅ Indicadores gerais calculados (conforme manual):', {
      totalLigacoes: resultado.totalLigacoesAtendidas,
      tempoMedio: resultado.tempoMedioAtendimento,
      avaliacaoAtendimento: resultado.avaliacaoAtendimento,
      avaliacaoSolucao: resultado.avaliacaoSolucao,
      dadosProcessados: dadosFiltrados.length
    });

    return resultado;
  }

  /**
   * Calcular indicadores por operador usando motores individuais
   */
  calculateIndicadoresOperadores(data: ManualDataRow[], filtro: FiltroPeriodo): IndicadoresOperador[] {
    console.log(`👥 Calculando indicadores por operador para ${filtro.label}...`);
    
    // Filtrar dados pelo período
    const dadosFiltrados = this.filterByPeriod(data, filtro);
    
    // Agrupar por operador
    const operadoresMap = new Map<string, ManualDataRow[]>();
    
    dadosFiltrados.forEach(row => {
      if (row.nomeAtendente && row.nomeAtendente.trim()) {
        const nome = row.nomeAtendente.trim();
        if (!operadoresMap.has(nome)) {
          operadoresMap.set(nome, []);
        }
        operadoresMap.get(nome)!.push(row);
      }
    });

    const operadores: IndicadoresOperador[] = [];

    operadoresMap.forEach((dadosOperador, nomeOperador) => {
      // Usar motores de cálculo individuais para cada operador
      const calculations = CalculationEngineFactory.calculateAll(dadosOperador);

      const operador: IndicadoresOperador = {
        nomeAtendente: nomeOperador,
        totalLigacoesAtendidas: calculations.totalLigacoes.value,
        tempoMedioAtendimento: calculations.tempoMedio.value,
        avaliacaoAtendimento: calculations.avaliacaoAtendimento.value,
        avaliacaoSolucao: calculations.avaliacaoSolucao.value,
        calculations
      };

      operadores.push(operador);
    });

    // Ordenar por total de chamadas (decrescente)
    operadores.sort((a, b) => b.totalLigacoesAtendidas - a.totalLigacoesAtendidas);

    console.log(`✅ Indicadores de ${operadores.length} operadores calculados`);
    return operadores;
  }

  /**
   * Filtrar dados por período
   */
  private filterByPeriod(data: ManualDataRow[], filtro: FiltroPeriodo): ManualDataRow[] {
    return data.filter(row => {
      const dataChamada = this.parseDate(row.data);
      if (!dataChamada) return false;
      
      // Comparar apenas a data (ignorar hora)
      const dataChamadaOnly = new Date(dataChamada.getFullYear(), dataChamada.getMonth(), dataChamada.getDate());
      const dataInicioOnly = new Date(filtro.dataInicio.getFullYear(), filtro.dataInicio.getMonth(), filtro.dataInicio.getDate());
      const dataFimOnly = new Date(filtro.dataFim.getFullYear(), filtro.dataFim.getMonth(), filtro.dataFim.getDate());
      
      return dataChamadaOnly >= dataInicioOnly && dataChamadaOnly <= dataFimOnly;
    });
  }

  /**
   * Converter tempo para segundos
   */
  private parseTimeToSeconds(timeStr: string): number {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    
    // Limpar string e remover espaços
    const cleanTime = timeStr.trim();
    if (!cleanTime) return 0;
    
    // Formato HH:MM:SS ou MM:SS
    const parts = cleanTime.split(':').map(Number);
    
    // Validar se todos os números são válidos
    if (parts.some(isNaN)) return 0;
    
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      if (hours >= 0 && minutes >= 0 && minutes < 60 && seconds >= 0 && seconds < 60) {
        return hours * 3600 + minutes * 60 + seconds;
      }
    } else if (parts.length === 2) {
      const [minutes, seconds] = parts;
      if (minutes >= 0 && seconds >= 0 && seconds < 60) {
        return minutes * 60 + seconds;
      }
    }
    return 0;
  }

  /**
   * Converter avaliação para número
   */
  private parseRating(ratingStr: string): number {
    if (!ratingStr || typeof ratingStr !== 'string') return 0;
    
    // Limpar string e remover espaços
    const cleanRating = ratingStr.trim();
    if (!cleanRating) return 0;
    
    // Substituir vírgula por ponto e converter
    const rating = parseFloat(cleanRating.replace(',', '.'));
    
    // Validar range 0-5
    if (isNaN(rating) || rating < 0 || rating > 5) return 0;
    
    return rating;
  }

  /**
   * Formatar tempo em minutos para HH:MM:SS ou MM:SS
   */
  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Converter data brasileira para Date
   */
  private parseDate(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    try {
      // Tentar formato brasileiro DD/MM/YYYY primeiro
      const brazilianMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (brazilianMatch) {
        const [, day, month, year] = brazilianMatch;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      // Fallback para formato ISO
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error('Erro ao converter data:', dateStr, error);
      return null;
    }
  }
}
