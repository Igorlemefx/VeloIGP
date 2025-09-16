// Data Validation Service - Validação e Normalização de Dados
// Sistema cuidadoso para lidar com dados similares mas diferentes

export interface ValidationResult {
  isValid: boolean;
  normalizedValue: string;
  originalValue: string;
  confidence: number; // 0-1, confiança na normalização
  warnings: string[];
  suggestions: string[];
}

export interface DataQualityReport {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  qualityScore: number; // 0-100
  issues: {
    duplicates: number;
    inconsistencies: number;
    missing: number;
    formatErrors: number;
  };
  recommendations: string[];
}

export interface NormalizationRules {
  operators: {
    patterns: RegExp[];
    replacements: { [key: string]: string };
    aliases: { [key: string]: string };
  };
  status: {
    patterns: RegExp[];
    mappings: { [key: string]: string };
  };
  queues: {
    patterns: RegExp[];
    mappings: { [key: string]: string };
  };
  durations: {
    patterns: RegExp[];
    formats: string[];
  };
}

class DataValidationService {
  private static instance: DataValidationService;
  private normalizationRules: NormalizationRules;
  private knownValues: {
    operators: Set<string>;
    statuses: Set<string>;
    queues: Set<string>;
  } = {
    operators: new Set(),
    statuses: new Set(),
    queues: new Set()
  };

  private constructor() {
    this.initializeNormalizationRules();
  }

  static getInstance(): DataValidationService {
    if (!DataValidationService.instance) {
      DataValidationService.instance = new DataValidationService();
    }
    return DataValidationService.instance;
  }

  /**
   * Inicializar regras de normalização
   */
  private initializeNormalizationRules(): void {
    this.normalizationRules = {
      operators: {
        patterns: [
          /^[A-Za-z\s]+$/, // Apenas letras e espaços
          /^[A-Za-z]+[A-Za-z\s]*[A-Za-z]+$/ // Pelo menos 2 palavras
        ],
        replacements: {
          '  ': ' ', // Múltiplos espaços
          '   ': ' ', // Espaços triplos
          '    ': ' '  // Espaços quádruplos
        },
        aliases: {
          'ana silva': 'Ana Silva',
          'carlos santos': 'Carlos Santos',
          'maria costa': 'Maria Costa',
          'joão oliveira': 'João Oliveira',
          'joao oliveira': 'João Oliveira',
          'ana s.': 'Ana Silva',
          'carlos s.': 'Carlos Santos',
          'maria c.': 'Maria Costa',
          'joão o.': 'João Oliveira',
          'joao o.': 'João Oliveira'
        }
      },
      status: {
        patterns: [
          /^(atendida|perdida|abandonada|em espera)$/i,
          /^(answered|missed|abandoned|waiting)$/i,
          /^(ok|nok|pendente)$/i
        ],
        mappings: {
          'atendida': 'Atendida',
          'answered': 'Atendida',
          'ok': 'Atendida',
          'perdida': 'Perdida',
          'missed': 'Perdida',
          'nok': 'Perdida',
          'abandonada': 'Abandonada',
          'abandoned': 'Abandonada',
          'em espera': 'Em Espera',
          'waiting': 'Em Espera',
          'pendente': 'Em Espera'
        }
      },
      queues: {
        patterns: [
          /^(suporte|vendas|financeiro|geral)$/i,
          /^(support|sales|financial|general)$/i,
          /^(tec|comercial|fin|adm)$/i
        ],
        mappings: {
          'suporte': 'Suporte Técnico',
          'support': 'Suporte Técnico',
          'tec': 'Suporte Técnico',
          'vendas': 'Vendas',
          'sales': 'Vendas',
          'comercial': 'Vendas',
          'financeiro': 'Financeiro',
          'financial': 'Financeiro',
          'fin': 'Financeiro',
          'geral': 'Geral',
          'general': 'Geral',
          'adm': 'Geral'
        }
      },
      durations: {
        patterns: [
          /^\d{1,2}:\d{2}$/, // MM:SS
          /^\d{1,2}:\d{2}:\d{2}$/, // HH:MM:SS
          /^\d+$/, // Apenas números (segundos)
          /^\d+\.\d+$/ // Números decimais
        ],
        formats: ['MM:SS', 'HH:MM:SS', 'seconds', 'decimal']
      }
    };
  }

  /**
   * Validar e normalizar operador
   */
  validateOperator(operator: string): ValidationResult {
    const originalValue = operator?.trim() || '';
    
    if (!originalValue) {
      return {
        isValid: false,
        normalizedValue: '',
        originalValue,
        confidence: 0,
        warnings: ['Operador não informado'],
        suggestions: ['Verificar se a coluna de operador está preenchida']
      };
    }

    // Normalizar espaços
    let normalized = originalValue.replace(/\s+/g, ' ').trim();
    
    // Aplicar aliases conhecidos
    const lowerNormalized = normalized.toLowerCase();
    if (this.normalizationRules.operators.aliases[lowerNormalized]) {
      normalized = this.normalizationRules.operators.aliases[lowerNormalized];
    }

    // Capitalizar primeira letra de cada palavra
    normalized = normalized.replace(/\b\w/g, l => l.toUpperCase());

    // Validar formato
    const isValidFormat = this.normalizationRules.operators.patterns.some(pattern => 
      pattern.test(normalized)
    );

    const confidence = this.calculateConfidence(originalValue, normalized, 'operator');
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!isValidFormat) {
      warnings.push('Formato de operador não reconhecido');
      suggestions.push('Verificar se o nome contém apenas letras e espaços');
    }

    if (confidence < 0.8) {
      warnings.push('Operador pode ter sido normalizado incorretamente');
      suggestions.push('Revisar se a normalização está correta');
    }

    // Verificar duplicatas similares
    const similarOperators = this.findSimilarOperators(normalized);
    if (similarOperators.length > 0) {
      warnings.push(`Possíveis duplicatas encontradas: ${similarOperators.join(', ')}`);
      suggestions.push('Verificar se são o mesmo operador com grafias diferentes');
    }

    return {
      isValid: isValidFormat && confidence > 0.5,
      normalizedValue: normalized,
      originalValue,
      confidence,
      warnings,
      suggestions
    };
  }

  /**
   * Validar e normalizar status
   */
  validateStatus(status: string): ValidationResult {
    const originalValue = status?.trim() || '';
    
    if (!originalValue) {
      return {
        isValid: false,
        normalizedValue: '',
        originalValue,
        confidence: 0,
        warnings: ['Status não informado'],
        suggestions: ['Verificar se a coluna de status está preenchida']
      };
    }

    const lowerOriginal = originalValue.toLowerCase();
    const normalized = this.normalizationRules.status.mappings[lowerOriginal] || originalValue;

    const isValidFormat = this.normalizationRules.status.patterns.some(pattern => 
      pattern.test(normalized)
    );

    const confidence = this.calculateConfidence(originalValue, normalized, 'status');
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!isValidFormat) {
      warnings.push('Status não reconhecido');
      suggestions.push('Usar apenas: Atendida, Perdida, Abandonada, Em Espera');
    }

    if (confidence < 0.9) {
      warnings.push('Status pode ter sido normalizado incorretamente');
    }

    return {
      isValid: isValidFormat && confidence > 0.7,
      normalizedValue: normalized,
      originalValue,
      confidence,
      warnings,
      suggestions
    };
  }

  /**
   * Validar e normalizar fila
   */
  validateQueue(queue: string): ValidationResult {
    const originalValue = queue?.trim() || '';
    
    if (!originalValue) {
      return {
        isValid: false,
        normalizedValue: 'Geral',
        originalValue,
        confidence: 0.5,
        warnings: ['Fila não informada, usando padrão'],
        suggestions: ['Verificar se a coluna de fila está preenchida']
      };
    }

    const lowerOriginal = originalValue.toLowerCase();
    const normalized = this.normalizationRules.queues.mappings[lowerOriginal] || originalValue;

    const isValidFormat = this.normalizationRules.queues.patterns.some(pattern => 
      pattern.test(normalized)
    );

    const confidence = this.calculateConfidence(originalValue, normalized, 'queue');
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!isValidFormat) {
      warnings.push('Fila não reconhecida');
      suggestions.push('Usar apenas: Suporte Técnico, Vendas, Financeiro, Geral');
    }

    return {
      isValid: isValidFormat && confidence > 0.6,
      normalizedValue: normalized,
      originalValue,
      confidence,
      warnings,
      suggestions
    };
  }

  /**
   * Validar e normalizar duração
   */
  validateDuration(duration: string): ValidationResult {
    const originalValue = duration?.trim() || '';
    
    if (!originalValue) {
      return {
        isValid: false,
        normalizedValue: '0:00',
        originalValue,
        confidence: 0,
        warnings: ['Duração não informada'],
        suggestions: ['Verificar se a coluna de duração está preenchida']
      };
    }

    let normalized = originalValue;
    let confidence = 1;

    // Tentar diferentes formatos
    if (/^\d+$/.test(originalValue)) {
      // Apenas números (assumir segundos)
      const seconds = parseInt(originalValue);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      normalized = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else if (/^\d+\.\d+$/.test(originalValue)) {
      // Números decimais (assumir minutos)
      const minutes = parseFloat(originalValue);
      const wholeMinutes = Math.floor(minutes);
      const seconds = Math.round((minutes - wholeMinutes) * 60);
      normalized = `${wholeMinutes}:${seconds.toString().padStart(2, '0')}`;
    } else if (/^\d{1,2}:\d{2}$/.test(originalValue)) {
      // MM:SS
      normalized = originalValue;
    } else if (/^\d{1,2}:\d{2}:\d{2}$/.test(originalValue)) {
      // HH:MM:SS
      normalized = originalValue;
    } else {
      confidence = 0.3;
    }

    const isValidFormat = this.normalizationRules.durations.patterns.some(pattern => 
      pattern.test(normalized)
    );

    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!isValidFormat) {
      warnings.push('Formato de duração não reconhecido');
      suggestions.push('Usar formato MM:SS ou HH:MM:SS');
    }

    if (confidence < 0.8) {
      warnings.push('Duração pode ter sido normalizada incorretamente');
    }

    return {
      isValid: isValidFormat && confidence > 0.5,
      normalizedValue: normalized,
      originalValue,
      confidence,
      warnings,
      suggestions
    };
  }

  /**
   * Calcular confiança na normalização
   */
  private calculateConfidence(original: string, normalized: string, type: string): number {
    if (original === normalized) return 1;
    
    const similarity = this.calculateSimilarity(original, normalized);
    const hasMapping = this.hasKnownMapping(original, type);
    
    return hasMapping ? Math.max(similarity, 0.8) : similarity;
  }

  /**
   * Calcular similaridade entre strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calcular distância de Levenshtein
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Verificar se tem mapeamento conhecido
   */
  private hasKnownMapping(value: string, type: string): boolean {
    const lowerValue = value.toLowerCase();
    
    switch (type) {
      case 'operator':
        return lowerValue in this.normalizationRules.operators.aliases;
      case 'status':
        return lowerValue in this.normalizationRules.status.mappings;
      case 'queue':
        return lowerValue in this.normalizationRules.queues.mappings;
      default:
        return false;
    }
  }

  /**
   * Encontrar operadores similares
   */
  private findSimilarOperators(operator: string): string[] {
    const similar: string[] = [];
    const threshold = 0.8;
    
    this.knownValues.operators.forEach(knownOperator => {
      if (knownOperator !== operator) {
        const similarity = this.calculateSimilarity(operator, knownOperator);
        if (similarity >= threshold) {
          similar.push(knownOperator);
        }
      }
    });
    
    return similar;
  }

  /**
   * Validar conjunto completo de dados
   */
  async validateDataset(data: any[][]): Promise<DataQualityReport> {
    console.log('🔍 Iniciando validação completa do dataset...');
    
    const totalRecords = data.length - 1; // Excluir cabeçalho
    let validRecords = 0;
    let invalidRecords = 0;
    const issues = {
      duplicates: 0,
      inconsistencies: 0,
      missing: 0,
      formatErrors: 0
    };
    const recommendations: string[] = [];

    // Mapear colunas
    const headers = data[0];
    const columnMap = this.mapColumns(headers);
    
    // Validar cada registro
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let isValid = true;
      
      // Validar operador
      const operatorResult = this.validateOperator(row[columnMap.operador]);
      if (!operatorResult.isValid) {
        isValid = false;
        issues.formatErrors++;
      }
      
      // Validar status
      const statusResult = this.validateStatus(row[columnMap.status]);
      if (!statusResult.isValid) {
        isValid = false;
        issues.formatErrors++;
      }
      
      // Validar fila
      const queueResult = this.validateQueue(row[columnMap.fila]);
      if (!queueResult.isValid) {
        isValid = false;
        issues.formatErrors++;
      }
      
      // Validar duração
      const durationResult = this.validateDuration(row[columnMap.duracao]);
      if (!durationResult.isValid) {
        isValid = false;
        issues.formatErrors++;
      }
      
      // Verificar campos obrigatórios
      const requiredFields = ['data', 'hora', 'operador', 'status'];
      const missingFields = requiredFields.filter(field => 
        !row[columnMap[field]] || row[columnMap[field]].toString().trim() === ''
      );
      
      if (missingFields.length > 0) {
        isValid = false;
        issues.missing += missingFields.length;
      }
      
      if (isValid) {
        validRecords++;
      } else {
        invalidRecords++;
      }
    }

    // Detectar duplicatas
    const duplicates = this.detectDuplicates(data, columnMap);
    issues.duplicates = duplicates.length;
    
    // Detectar inconsistências
    const inconsistencies = this.detectInconsistencies(data, columnMap);
    issues.inconsistencies = inconsistencies.length;

    // Calcular score de qualidade
    const qualityScore = this.calculateQualityScore(totalRecords, validRecords, issues);
    
    // Gerar recomendações
    if (issues.duplicates > 0) {
      recommendations.push('Revisar e consolidar registros duplicados');
    }
    if (issues.inconsistencies > 0) {
      recommendations.push('Padronizar nomenclaturas e formatos');
    }
    if (issues.missing > 0) {
      recommendations.push('Implementar validação de campos obrigatórios');
    }
    if (issues.formatErrors > 0) {
      recommendations.push('Criar regras de validação mais rigorosas');
    }

    return {
      totalRecords,
      validRecords,
      invalidRecords,
      qualityScore,
      issues,
      recommendations
    };
  }

  /**
   * Mapear colunas da planilha
   */
  private mapColumns(headers: string[]): { [key: string]: number } {
    const columnMap: { [key: string]: number } = {};
    
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();
      
      if (normalizedHeader.includes('data') || normalizedHeader.includes('date')) {
        columnMap.data = index;
      } else if (normalizedHeader.includes('hora') || normalizedHeader.includes('time')) {
        columnMap.hora = index;
      } else if (normalizedHeader.includes('operador') || normalizedHeader.includes('operator')) {
        columnMap.operador = index;
      } else if (normalizedHeader.includes('status') || normalizedHeader.includes('situa')) {
        columnMap.status = index;
      } else if (normalizedHeader.includes('fila') || normalizedHeader.includes('queue')) {
        columnMap.fila = index;
      } else if (normalizedHeader.includes('dura') || normalizedHeader.includes('duration')) {
        columnMap.duracao = index;
      }
    });

    return columnMap;
  }

  /**
   * Detectar duplicatas
   */
  private detectDuplicates(data: any[][], columnMap: { [key: string]: number }): any[][] {
    const seen = new Set<string>();
    const duplicates: any[][] = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const key = `${row[columnMap.data]}_${row[columnMap.hora]}_${row[columnMap.operador]}`;
      
      if (seen.has(key)) {
        duplicates.push(row);
      } else {
        seen.add(key);
      }
    }
    
    return duplicates;
  }

  /**
   * Detectar inconsistências
   */
  private detectInconsistencies(data: any[][], columnMap: { [key: string]: number }): any[][] {
    const inconsistencies: any[][] = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const issues: string[] = [];
      
      // Verificar se duração é consistente com status
      const status = row[columnMap.status]?.toLowerCase();
      const duration = row[columnMap.duracao];
      
      if (status === 'perdida' && duration && duration !== '0:00') {
        issues.push('Chamada perdida com duração > 0');
      }
      
      if (status === 'atendida' && (!duration || duration === '0:00')) {
        issues.push('Chamada atendida sem duração');
      }
      
      if (issues.length > 0) {
        inconsistencies.push(row);
      }
    }
    
    return inconsistencies;
  }

  /**
   * Calcular score de qualidade
   */
  private calculateQualityScore(total: number, valid: number, issues: any): number {
    const baseScore = (valid / total) * 100;
    const penalty = (issues.duplicates + issues.inconsistencies + issues.missing + issues.formatErrors) * 2;
    return Math.max(0, baseScore - penalty);
  }

  /**
   * Atualizar valores conhecidos
   */
  updateKnownValues(operators: string[], statuses: string[], queues: string[]): void {
    operators.forEach(op => this.knownValues.operators.add(op));
    statuses.forEach(status => this.knownValues.statuses.add(status));
    queues.forEach(queue => this.knownValues.queues.add(queue));
  }

  /**
   * Limpar valores conhecidos
   */
  clearKnownValues(): void {
    this.knownValues.operators.clear();
    this.knownValues.statuses.clear();
    this.knownValues.queues.clear();
  }
}

export const dataValidationService = DataValidationService.getInstance();
export default dataValidationService;
