// Serviço de Cache Persistente Inteligente
// Mantém dados em memória e localStorage durante toda a sessão

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

interface CacheConfig {
  defaultTTL: number; // Time to live em ms
  maxSize: number; // Tamanho máximo do cache
  version: string; // Versão do cache para invalidação
}

class PersistentCacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private readonly STORAGE_PREFIX = 'veloigp_cache_';
  private readonly VERSION_KEY = 'veloigp_cache_version';

  constructor() {
    this.config = {
      defaultTTL: 30 * 60 * 1000, // 30 minutos
      maxSize: 50, // Máximo 50 entradas
      version: '1.0.0'
    };
    
    this.initializeCache();
  }

  /**
   * Inicializar cache carregando dados do localStorage
   */
  private initializeCache(): void {
    try {
      const storedVersion = localStorage.getItem(this.VERSION_KEY);
      
      // Se a versão mudou, limpar cache antigo
      if (storedVersion !== this.config.version) {
        this.clearAllCache();
        localStorage.setItem(this.VERSION_KEY, this.config.version);
        return;
      }

      // Carregar entradas válidas do localStorage
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.STORAGE_PREFIX)
      );

      for (const key of keys) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          if (this.isEntryValid(entry)) {
            const cacheKey = key.replace(this.STORAGE_PREFIX, '');
            this.memoryCache.set(cacheKey, entry);
          } else {
            localStorage.removeItem(key);
          }
        } catch (error) {
          console.warn(`Erro ao carregar entrada do cache: ${key}`, error);
          localStorage.removeItem(key);
        }
      }

      console.log(`📦 Cache inicializado: ${this.memoryCache.size} entradas carregadas`);
    } catch (error) {
      console.error('❌ Erro ao inicializar cache:', error);
    }
  }

  /**
   * Verificar se uma entrada do cache ainda é válida
   */
  private isEntryValid(entry: CacheEntry<any>): boolean {
    if (!entry || !entry.data || !entry.timestamp || !entry.expiresAt) {
      return false;
    }
    
    return Date.now() < entry.expiresAt && entry.version === this.config.version;
  }

  /**
   * Obter dados do cache
   */
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry || !this.isEntryValid(entry)) {
      this.delete(key);
      return null;
    }

    console.log(`📦 Cache hit: ${key}`);
    return entry.data;
  }

  /**
   * Armazenar dados no cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
      version: this.config.version
    };

    // Limitar tamanho do cache
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictOldestEntry();
    }

    // Armazenar na memória
    this.memoryCache.set(key, entry);

    // Armazenar no localStorage (apenas se não for muito grande)
    try {
      const serialized = JSON.stringify(entry);
      if (serialized.length < 5 * 1024 * 1024) { // 5MB limite
        localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, serialized);
      }
    } catch (error) {
      console.warn(`Cache muito grande para localStorage: ${key}`, error);
    }

    console.log(`💾 Cache set: ${key} (expires: ${new Date(expiresAt).toLocaleTimeString()})`);
  }

  /**
   * Remover entrada mais antiga do cache
   */
  private evictOldestEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    this.memoryCache.forEach((entry, key) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Remover entrada do cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
    console.log(`🗑️ Cache delete: ${key}`);
  }

  /**
   * Limpar todo o cache
   */
  clearAllCache(): void {
    this.memoryCache.clear();
    
    // Limpar localStorage
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.STORAGE_PREFIX)
    );
    
    keys.forEach(key => localStorage.removeItem(key));
    
    console.log('🧹 Cache limpo completamente');
  }

  /**
   * Verificar se uma chave existe no cache
   */
  has(key: string): boolean {
    const entry = this.memoryCache.get(key);
    return entry ? this.isEntryValid(entry) : false;
  }

  /**
   * Obter estatísticas do cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{ key: string; age: number; expiresIn: number }>;
  } {
    const now = Date.now();
    const entries: Array<{ key: string; age: number; expiresIn: number }> = [];
    
    this.memoryCache.forEach((entry, key) => {
      entries.push({
        key,
        age: now - entry.timestamp,
        expiresIn: entry.expiresAt - now
      });
    });

    return {
      size: this.memoryCache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Seria calculado com métricas reais
      entries
    };
  }

  /**
   * Limpar entradas expiradas
   */
  cleanExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.memoryCache.forEach((entry, key) => {
      if (now >= entry.expiresAt) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 ${expiredKeys.length} entradas expiradas removidas`);
    }
  }

  /**
   * Obter ou definir dados com fallback
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    // Tentar obter do cache primeiro
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Se não estiver no cache, buscar e armazenar
    try {
      console.log(`🔄 Fetching data for key: ${key}`);
      const data = await fetcher();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching data for key ${key}:`, error);
      throw error;
    }
  }
}

// Instância singleton
export const persistentCacheService = new PersistentCacheService();
export default persistentCacheService;
