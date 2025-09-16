// Cache Persistente Global - Carrega dados uma única vez
// Mantém dados em memória durante toda a sessão

import { debugService } from './debugService';
import { fallbackDataService } from './fallbackDataService';

interface CachedData {
  spreadsheets: any[];
  currentSpreadsheet: any;
  currentSheet: any;
  analysisData: any;
  operatorProfiles: any[];
  periodComparisons: any[];
  queueAnalysis: any[];
  lastUpdate: Date;
  isLoaded: boolean;
  isFallback: boolean;
  error?: string | null;
}

class PersistentGlobalCache {
  private static instance: PersistentGlobalCache;
  private cache: CachedData | null = null;
  private loadingPromise: Promise<CachedData> | null = null;
  private isInitialized = false;
  private listeners: ((data: CachedData) => void)[] = [];

  private constructor() {
    debugService.log('🏗️ Inicializando cache persistente global');
  }

  static getInstance(): PersistentGlobalCache {
    if (!PersistentGlobalCache.instance) {
      PersistentGlobalCache.instance = new PersistentGlobalCache();
    }
    return PersistentGlobalCache.instance;
  }

  /**
   * Obter dados - carrega apenas uma vez
   */
  async getData(): Promise<CachedData> {
    // Se já tem dados em memória, retorna imediatamente
    if (this.cache && this.isInitialized) {
      debugService.log('📦 Retornando dados do cache em memória');
      return this.cache;
    }

    // Se já está carregando, aguarda o carregamento atual
    if (this.loadingPromise) {
      debugService.log('⏳ Aguardando carregamento em andamento');
      return this.loadingPromise;
    }

    // Iniciar carregamento
    this.loadingPromise = this.loadData();
    return this.loadingPromise;
  }

  /**
   * Carregar dados uma única vez
   */
  private async loadData(): Promise<CachedData> {
    debugService.log('🔄 Iniciando carregamento único dos dados');
    
    try {
      // Verificar cache do localStorage primeiro
      const cachedData = this.getFromLocalStorage();
      if (cachedData && !this.isExpired(cachedData)) {
        debugService.log('📦 Dados encontrados no localStorage');
        this.cache = cachedData;
        this.isInitialized = true;
        this.notifyListeners();
        return cachedData;
      }

      // Carregar dados reais (simulado por enquanto)
      debugService.log('🌐 Carregando dados da API...');
      
      // Simular carregamento de 1 minuto
      await this.simulateLongLoading();
      
      // Por enquanto, usar dados de fallback
      const data = fallbackDataService.generateFallbackData();
      
      // Armazenar no cache
      this.cache = data;
      this.isInitialized = true;
      this.saveToLocalStorage(data);
      this.notifyListeners();
      
      debugService.log('✅ Dados carregados e armazenados com sucesso');
      return data;

    } catch (error) {
      debugService.error('❌ Erro ao carregar dados', error);
      
      // Usar fallback em caso de erro
      const fallbackData = fallbackDataService.generateFallbackData();
      this.cache = fallbackData;
      this.isInitialized = true;
      this.saveToLocalStorage(fallbackData);
      this.notifyListeners();
      
      return fallbackData;
    } finally {
      this.loadingPromise = null;
    }
  }

  /**
   * Simular carregamento longo (1 minuto)
   */
  private async simulateLongLoading(): Promise<void> {
    debugService.log('⏳ Simulando carregamento de 1 minuto...');
    
    // Simular progresso
    const steps = 60; // 60 segundos
    const stepDuration = 1000; // 1 segundo por step
    
    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      // Notificar progresso a cada 10 segundos
      if (i % 10 === 0) {
        debugService.log(`📊 Progresso: ${Math.round((i / steps) * 100)}%`);
      }
    }
    
    debugService.log('✅ Carregamento simulado concluído');
  }

  /**
   * Obter dados do localStorage
   */
  private getFromLocalStorage(): CachedData | null {
    try {
      const cached = localStorage.getItem('veloigp_persistent_cache');
      if (cached) {
        const data = JSON.parse(cached);
        // Converter string de data de volta para Date
        data.lastUpdate = new Date(data.lastUpdate);
        return data;
      }
    } catch (error) {
      debugService.warn('Erro ao ler cache do localStorage', error);
    }
    return null;
  }

  /**
   * Salvar dados no localStorage
   */
  private saveToLocalStorage(data: CachedData): void {
    try {
      localStorage.setItem('veloigp_persistent_cache', JSON.stringify(data));
      debugService.log('💾 Dados salvos no localStorage');
    } catch (error) {
      debugService.warn('Erro ao salvar cache no localStorage', error);
    }
  }

  /**
   * Verificar se dados expiraram (24 horas)
   */
  private isExpired(data: CachedData): boolean {
    const now = new Date();
    const lastUpdate = new Date(data.lastUpdate);
    const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 24;
  }

  /**
   * Notificar listeners sobre mudanças (com debounce para evitar loops)
   */
  private notifyListeners(): void {
    if (this.cache && this.listeners.length > 0) {
      // Usar setTimeout para evitar problemas de batching do React
      setTimeout(() => {
        this.listeners.forEach(listener => {
          try {
            listener(this.cache!);
          } catch (error) {
            debugService.error('Erro ao notificar listener', error);
          }
        });
      }, 0);
    }
  }

  /**
   * Adicionar listener para mudanças
   */
  addListener(listener: (data: CachedData) => void): void {
    this.listeners.push(listener);
    
    // Se já tem dados, notificar imediatamente (com setTimeout para evitar problemas de React)
    if (this.cache && this.isInitialized) {
      setTimeout(() => {
        try {
          listener(this.cache!);
        } catch (error) {
          debugService.error('Erro ao notificar listener imediatamente', error);
        }
      }, 0);
    }
  }

  /**
   * Remover listener
   */
  removeListener(listener: (data: CachedData) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Forçar recarregamento
   */
  async reload(): Promise<CachedData> {
    debugService.log('🔄 Forçando recarregamento dos dados');
    this.cache = null;
    this.isInitialized = false;
    this.loadingPromise = null;
    this.clearLocalStorage();
    return this.getData();
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    debugService.log('🗑️ Limpando cache');
    this.cache = null;
    this.isInitialized = false;
    this.loadingPromise = null;
    this.clearLocalStorage();
  }

  /**
   * Limpar localStorage
   */
  private clearLocalStorage(): void {
    try {
      localStorage.removeItem('veloigp_persistent_cache');
      debugService.log('🗑️ Cache do localStorage limpo');
    } catch (error) {
      debugService.warn('Erro ao limpar localStorage', error);
    }
  }

  /**
   * Verificar se está carregando
   */
  isLoading(): boolean {
    return this.loadingPromise !== null;
  }

  /**
   * Verificar se tem dados
   */
  hasData(): boolean {
    return this.cache !== null && this.isInitialized;
  }

  /**
   * Obter dados síncronos (se disponíveis)
   */
  getDataSync(): CachedData | null {
    return this.cache;
  }
}

// Instância singleton
export const persistentGlobalCache = PersistentGlobalCache.getInstance();
export default persistentGlobalCache;
