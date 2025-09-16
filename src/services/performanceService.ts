// Serviço de Performance e Cache
import React from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: number;
}

interface PerformanceMetrics {
  loadTime: number;
  dataSize: number;
  cacheHits: number;
  cacheMisses: number;
  lastUpdate: Date;
}

class PerformanceService {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    dataSize: 0,
    cacheHits: 0,
    cacheMisses: 0,
    lastUpdate: new Date()
  };
  
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_CACHE_SIZE = 50; // Máximo 50 entradas no cache

  /**
   * Obter dados do cache ou executar função
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      // Verificar cache
      const cached = this.getFromCache<T>(key);
      if (cached) {
        this.metrics.cacheHits++;
        console.log(`✅ Cache hit para: ${key}`);
        return cached;
      }

      // Cache miss - buscar dados
      this.metrics.cacheMisses++;
      console.log(`❌ Cache miss para: ${key}`);
      
      const data = await fetcher();
      
      // Armazenar no cache
      this.setCache(key, data, ttl);
      
      // Atualizar métricas
      this.metrics.loadTime = performance.now() - startTime;
      this.metrics.dataSize = this.calculateDataSize(data);
      this.metrics.lastUpdate = new Date();
      
      return data;
    } catch (error) {
      console.error(`❌ Erro ao buscar dados para ${key}:`, error);
      throw error;
    }
  }

  /**
   * Obter dados do cache
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`⏰ Cache expirado para: ${key}`);
      return null;
    }

    return entry.data;
  }

  /**
   * Armazenar dados no cache
   */
  private setCache<T>(key: string, data: T, ttl: number): void {
    // Limpar cache se necessário
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanupCache();
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      version: 1
    };

    this.cache.set(key, entry);
    console.log(`💾 Dados armazenados no cache: ${key}`);
  }

  /**
   * Limpar cache expirado
   */
  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Limpeza do cache: ${expiredKeys.length} entradas removidas`);
    }

    // Se ainda estiver cheio, remover as mais antigas
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE / 2));
      toRemove.forEach(([key]) => this.cache.delete(key));
      
      console.log(`🧹 Cache ainda cheio, removendo ${toRemove.length} entradas antigas`);
    }
  }

  /**
   * Invalidar cache por chave
   */
  invalidateCache(key: string): void {
    if (this.cache.delete(key)) {
      console.log(`🗑️ Cache invalidado: ${key}`);
    }
  }

  /**
   * Limpar todo o cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache completamente limpo');
  }

  /**
   * Obter estatísticas do cache
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    metrics: PerformanceMetrics;
  } {
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.metrics.cacheHits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: Math.round(hitRate * 100) / 100,
      metrics: { ...this.metrics }
    };
  }

  /**
   * Calcular tamanho dos dados
   */
  private calculateDataSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  /**
   * Otimizar dados para exibição
   */
  optimizeDataForDisplay<T>(data: T[], limit: number = 100): {
    data: T[];
    hasMore: boolean;
    total: number;
  } {
    const total = data.length;
    const hasMore = total > limit;
    const optimizedData = data.slice(0, limit);

    return {
      data: optimizedData,
      hasMore,
      total
    };
  }

  /**
   * Debounce para funções
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Throttle para funções
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Lazy loading para componentes
   */
  createLazyComponent<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ): React.LazyExoticComponent<T> {
    return React.lazy(importFunc);
  }

  /**
   * Memoização de funções
   */
  memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map();
    
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func.apply(this, args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  /**
   * Otimizar imagens
   */
  optimizeImage(src: string, width?: number, height?: number): string {
    // Implementar otimização de imagens se necessário
    return src;
  }

  /**
   * Compressão de dados
   */
  compressData(data: any): string {
    try {
      return JSON.stringify(data);
    } catch {
      return '';
    }
  }

  /**
   * Descompressão de dados
   */
  decompressData<T>(compressed: string): T | null {
    try {
      return JSON.parse(compressed);
    } catch {
      return null;
    }
  }

  /**
   * Monitorar performance
   */
  startPerformanceMonitoring(): void {
    // Monitorar Core Web Vitals
    if ('web-vitals' in window) {
      // Implementar monitoramento de Web Vitals
      console.log('📊 Monitoramento de performance iniciado');
    }
  }

  /**
   * Obter relatório de performance
   */
  getPerformanceReport(): {
    cache: {
      size: number;
      maxSize: number;
      hitRate: number;
      metrics: PerformanceMetrics;
    };
    memory: {
      used: number;
      total: number;
      limit: number;
    };
    timing: {
      loadTime: number;
      lastUpdate: Date;
    };
  } {
    const memory = (performance as any).memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };

    return {
      cache: this.getCacheStats(),
      memory: {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      },
      timing: {
        loadTime: this.metrics.loadTime,
        lastUpdate: this.metrics.lastUpdate
      }
    };
  }
}

export const performanceService = new PerformanceService();
