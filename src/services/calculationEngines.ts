/**
 * MOTORES DE CÁLCULO INDIVIDUAIS - VeloIGP
 * Sistema de cálculo preciso e confiável conforme manual
 */

export interface CalculationResult {
  value: number;
  formatted: string;
  precision: number;
  isValid: boolean;
  error?: string;
}

export interface CalculationEngine {
  calculate: (data: any[]) => CalculationResult;
  validate: (value: number) => boolean;
  format: (value: number) => string;
}

/**
 * MOTOR 1: TOTAL DE LIGAÇÕES ATENDIDAS
 * Soma das chamadas com status "Atendidas"
 */
export class TotalLigacoesEngine implements CalculationEngine {
  calculate(data: any[]): CalculationResult {
    try {
      const total = data.reduce((sum, row) => {
        const chamada = row.contagemChamadas || row.Chamada || '';
        return chamada === 'Atendidas' ? sum + 1 : sum;
      }, 0);

      return {
        value: total,
        formatted: total.toLocaleString('pt-BR'),
        precision: 0,
        isValid: total >= 0,
        error: total < 0 ? 'Valor negativo inválido' : undefined
      };
    } catch (error) {
      return {
        value: 0,
        formatted: '0',
        precision: 0,
        isValid: false,
        error: `Erro no cálculo: ${error}`
      };
    }
  }

  validate(value: number): boolean {
    return Number.isInteger(value) && value >= 0;
  }

  format(value: number): string {
    return value.toLocaleString('pt-BR');
  }
}

/**
 * MOTOR 2: TEMPO MÉDIO DE ATENDIMENTO
 * Média simples do campo "Tempo Falado"
 */
export class TempoMedioEngine implements CalculationEngine {
  calculate(data: any[]): CalculationResult {
    try {
      const temposValidos = data
        .map(row => {
          const tempo = row.tempoAtendimento || row['Tempo Falado'] || '';
          return this.parseTimeToSeconds(tempo);
        })
        .filter(tempo => tempo > 0);

      if (temposValidos.length === 0) {
        return {
          value: 0,
          formatted: '0:00',
          precision: 0,
          isValid: false,
          error: 'Nenhum tempo válido encontrado'
        };
      }

      const mediaSegundos = temposValidos.reduce((sum, tempo) => sum + tempo, 0) / temposValidos.length;
      const mediaMinutos = mediaSegundos / 60;

      return {
        value: mediaMinutos,
        formatted: this.formatTime(mediaMinutos),
        precision: 2,
        isValid: mediaMinutos >= 0,
        error: mediaMinutos < 0 ? 'Tempo negativo inválido' : undefined
      };
    } catch (error) {
      return {
        value: 0,
        formatted: '0:00',
        precision: 0,
        isValid: false,
        error: `Erro no cálculo: ${error}`
      };
    }
  }

  private parseTimeToSeconds(timeStr: string): number {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    
    // Formato HH:MM:SS ou MM:SS
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  validate(value: number): boolean {
    return value >= 0 && !isNaN(value);
  }

  format(value: number): string {
    return this.formatTime(value);
  }
}

/**
 * MOTOR 3: AVALIAÇÃO DO ATENDIMENTO
 * Média simples do campo "Pergunta 1"
 */
export class AvaliacaoAtendimentoEngine implements CalculationEngine {
  calculate(data: any[]): CalculationResult {
    try {
      const avaliacoesValidas = data
        .map(row => {
          const avaliacao = row.avaliacaoAtendente || row['Pergunta 1'] || '';
          return this.parseRating(avaliacao);
        })
        .filter(avaliacao => avaliacao > 0);

      if (avaliacoesValidas.length === 0) {
        return {
          value: 0,
          formatted: '0.0',
          precision: 1,
          isValid: false,
          error: 'Nenhuma avaliação válida encontrada'
        };
      }

      const media = avaliacoesValidas.reduce((sum, aval) => sum + aval, 0) / avaliacoesValidas.length;

      return {
        value: media,
        formatted: media.toFixed(1),
        precision: 1,
        isValid: media >= 0 && media <= 5,
        error: (media < 0 || media > 5) ? 'Avaliação fora do range 0-5' : undefined
      };
    } catch (error) {
      return {
        value: 0,
        formatted: '0.0',
        precision: 1,
        isValid: false,
        error: `Erro no cálculo: ${error}`
      };
    }
  }

  private parseRating(ratingStr: string): number {
    if (!ratingStr || typeof ratingStr !== 'string') return 0;
    
    const rating = parseFloat(ratingStr.replace(',', '.'));
    return (rating >= 0 && rating <= 5) ? rating : 0;
  }

  validate(value: number): boolean {
    return value >= 0 && value <= 5 && !isNaN(value);
  }

  format(value: number): string {
    return value.toFixed(1);
  }
}

/**
 * MOTOR 4: AVALIAÇÃO DA SOLUÇÃO
 * Média simples do campo "Pergunta 2"
 */
export class AvaliacaoSolucaoEngine implements CalculationEngine {
  calculate(data: any[]): CalculationResult {
    try {
      const avaliacoesValidas = data
        .map(row => {
          const avaliacao = row.avaliacaoSolucao || row['Pergunta 2'] || '';
          return this.parseRating(avaliacao);
        })
        .filter(avaliacao => avaliacao > 0);

      if (avaliacoesValidas.length === 0) {
        return {
          value: 0,
          formatted: '0.0',
          precision: 1,
          isValid: false,
          error: 'Nenhuma avaliação válida encontrada'
        };
      }

      const media = avaliacoesValidas.reduce((sum, aval) => sum + aval, 0) / avaliacoesValidas.length;

      return {
        value: media,
        formatted: media.toFixed(1),
        precision: 1,
        isValid: media >= 0 && media <= 5,
        error: (media < 0 || media > 5) ? 'Avaliação fora do range 0-5' : undefined
      };
    } catch (error) {
      return {
        value: 0,
        formatted: '0.0',
        precision: 1,
        isValid: false,
        error: `Erro no cálculo: ${error}`
      };
    }
  }

  private parseRating(ratingStr: string): number {
    if (!ratingStr || typeof ratingStr !== 'string') return 0;
    
    const rating = parseFloat(ratingStr.replace(',', '.'));
    return (rating >= 0 && rating <= 5) ? rating : 0;
  }

  validate(value: number): boolean {
    return value >= 0 && value <= 5 && !isNaN(value);
  }

  format(value: number): string {
    return value.toFixed(1);
  }
}

/**
 * FÁBRICA DE MOTORES DE CÁLCULO
 */
export class CalculationEngineFactory {
  private static engines = new Map<string, CalculationEngine>();

  static getEngine(type: string): CalculationEngine {
    if (!this.engines.has(type)) {
      switch (type) {
        case 'totalLigacoes':
          this.engines.set(type, new TotalLigacoesEngine());
          break;
        case 'tempoMedio':
          this.engines.set(type, new TempoMedioEngine());
          break;
        case 'avaliacaoAtendimento':
          this.engines.set(type, new AvaliacaoAtendimentoEngine());
          break;
        case 'avaliacaoSolucao':
          this.engines.set(type, new AvaliacaoSolucaoEngine());
          break;
        default:
          throw new Error(`Motor de cálculo não encontrado: ${type}`);
      }
    }
    return this.engines.get(type)!;
  }

  static calculateAll(data: any[]): {
    totalLigacoes: CalculationResult;
    tempoMedio: CalculationResult;
    avaliacaoAtendimento: CalculationResult;
    avaliacaoSolucao: CalculationResult;
  } {
    return {
      totalLigacoes: this.getEngine('totalLigacoes').calculate(data),
      tempoMedio: this.getEngine('tempoMedio').calculate(data),
      avaliacaoAtendimento: this.getEngine('avaliacaoAtendimento').calculate(data),
      avaliacaoSolucao: this.getEngine('avaliacaoSolucao').calculate(data)
    };
  }
}
