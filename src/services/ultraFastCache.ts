// Cache Ultra-Rápido - Evita travamentos
// Sistema de cache que nunca trava e sempre responde

import { performanceMonitor } from '../utils/performanceMonitor';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  priority: 'high' | 'medium' | 'low';
}

class UltraFastCache {
  private static instance: UltraFastCache;
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize = 100;
  private defaultTTL = 5 * 60 * 1000; // 5 minutos

  private constructor() {
    // Limpeza automática a cada minuto
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  static getInstance(): UltraFastCache {
    if (!UltraFastCache.instance) {
      UltraFastCache.instance = new UltraFastCache();
    }
    return UltraFastCache.instance;
  }

  /**
   * Obter dados do cache (instantâneo)
   */
  get(key: string): any | null {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return null;
      }

      // Verificar se expirou
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        return null;
      }

      // Atualizar atividade
      performanceMonitor.updateActivity();
      
      return entry.data;
    } catch (error) {
      console.error('Erro ao obter do cache:', error);
      return null;
    }
  }

  /**
   * Salvar dados no cache (instantâneo)
   */
  set(key: string, data: any, ttl: number = this.defaultTTL, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    try {
      // Verificar se precisa limpar cache
      if (this.cache.size >= this.maxSize) {
        this.evictLowPriority();
      }

      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl,
        priority
      };

      this.cache.set(key, entry);
      performanceMonitor.updateActivity();
      
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
    }
  }

  /**
   * Remover entrada do cache
   */
  delete(key: string): boolean {
    try {
      const deleted = this.cache.delete(key);
      performanceMonitor.updateActivity();
      return deleted;
    } catch (error) {
      console.error('Erro ao deletar do cache:', error);
      return false;
    }
  }

  /**
   * Limpar cache
   */
  clear(): void {
    try {
      this.cache.clear();
      performanceMonitor.updateActivity();
      console.log('🧹 Cache limpo');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  /**
   * Verificar se existe no cache
   */
  has(key: string): boolean {
    try {
      const entry = this.cache.get(key);
      if (!entry) return false;
      
      // Verificar se expirou
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao verificar cache:', error);
      return false;
    }
  }

  /**
   * Obter dados com fallback
   */
  async getWithFallback(
    key: string,
    fallbackFn: () => Promise<any>,
    ttl: number = this.defaultTTL
  ): Promise<any> {
    try {
      // Tentar obter do cache primeiro
      const cached = this.get(key);
      if (cached) {
        return cached;
      }

      // Se não tem cache, executar fallback com timeout
      const data = await performanceMonitor.executeWithTimeout(
        `cache-fallback-${key}`,
        fallbackFn,
        5000 // 5 segundos timeout
      );

      // Salvar no cache
      this.set(key, data, ttl, 'high');
      
      return data;
    } catch (error) {
      console.error('Erro no getWithFallback:', error);
      
      // Retornar dados básicos em caso de erro
      return this.getBasicFallbackData();
    }
  }

  /**
   * Dados básicos de fallback
   */
  private getBasicFallbackData(): any {
    return {
      spreadsheets: [{
        id: 'fallback-1',
        title: 'Dados de Fallback',
        lastModified: new Date()
      }],
      currentSpreadsheet: {
        id: 'fallback-1',
        title: 'Dados de Fallback',
        lastModified: new Date()
      },
      currentSheet: {
        id: 0,
        title: 'Dados Básicos',
        data: this.generateBasicData(),
        headers: ['Data', 'Operador', 'Chamadas', 'Status'],
        rowCount: 10,
        colCount: 4
      },
      analysisData: {
        totalCalls: 100,
        answeredCalls: 85,
        missedCalls: 15,
        averageWaitTime: 30,
        averageTalkTime: 120,
        serviceLevel: 0.85,
        abandonmentRate: 0.15,
        periodo: {
          inicio: new Date().toLocaleDateString('pt-BR'),
          fim: new Date().toLocaleDateString('pt-BR')
        },
        lastUpdate: new Date()
      },
      operatorProfiles: [],
      periodComparisons: [],
      queueAnalysis: [],
      lastUpdate: new Date(),
      isLoaded: true,
      isFallback: true
    };
  }

  /**
   * Gerar dados básicos
   */
  private generateBasicData(): any[][] {
    const data = [];
    const operators = ['Operador 1', 'Operador 2', 'Operador 3'];
    const statuses = ['Atendida', 'Perdida'];
    
    // Cabeçalho
    data.push(['Data', 'Operador', 'Chamadas', 'Status']);
    
    // Dados de exemplo
    for (let i = 0; i < 10; i++) {
      data.push([
        new Date().toLocaleDateString('pt-BR'),
        operators[i % operators.length],
        Math.floor(Math.random() * 50) + 10,
        statuses[Math.floor(Math.random() * statuses.length)]
      ]);
    }
    
    return data;
  }

  /**
   * Remover entradas de baixa prioridade
   */
  private evictLowPriority(): void {
    const lowPriorityEntries = Array.from(this.cache.entries())
      .filter(([_, entry]) => entry.priority === 'low')
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remover 20% das entradas de baixa prioridade
    const toRemove = Math.ceil(lowPriorityEntries.length * 0.2);
    
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(lowPriorityEntries[i][0]);
    }
  }

  /**
   * Limpeza automática
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`🧹 Cache limpo: ${cleaned} entradas expiradas removidas`);
    }
  }

  /**
   * Obter estatísticas do cache
   */
  getStats(): { size: number; maxSize: number; entries: string[] } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Instância singleton
export const ultraFastCache = UltraFastCache.getInstance();
export default ultraFastCache;
