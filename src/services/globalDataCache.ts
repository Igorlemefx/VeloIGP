// Cache Global de Dados - VeloIGP
// Evita chamadas desnecessárias à API

import { googleSheetsService } from './googleSheetsService';
import { spreadsheetAnalysisService } from './spreadsheetAnalysisService';
import RetryService from './retryService';

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
  error?: string | null;
}

class GlobalDataCache {
  private cache: CachedData | null = null;
  private loadingPromise: Promise<CachedData> | null = null;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
  private readonly PERSISTENT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private readonly MAX_RETRIES = 3;
  private retryCount = 0;
  private readonly CACHE_KEY = 'veloigp-global-cache';
  private readonly CACHE_TIMESTAMP_KEY = 'veloigp-cache-timestamp';

  /**
   * Obter dados do cache ou carregar se necessário
   */
  async getData(): Promise<CachedData> {
    // Se já está carregando, aguardar a mesma promise
    if (this.loadingPromise) {
      console.log('⏳ Aguardando carregamento em andamento...');
      return this.loadingPromise;
    }

    // Se tem cache válido, retornar
    if (this.cache && this.isCacheValid()) {
      console.log('📦 Retornando dados do cache global');
      return this.cache;
    }

    // Tentar carregar do localStorage primeiro
    const persistentCache = this.loadFromPersistentCache();
    if (persistentCache && this.isPersistentCacheValid()) {
      console.log('💾 Carregando dados do cache persistente');
      this.cache = persistentCache;
      return persistentCache;
    }

    // Carregar dados
    console.log('🚀 Carregando dados globalmente...');
    this.loadingPromise = this.loadData();
    
    try {
      const result = await this.loadingPromise;
      this.cache = result;
      this.saveToPersistentCache(result);
      this.loadingPromise = null;
      console.log('✅ Dados globais carregados e armazenados no cache');
      return result;
    } catch (error) {
      this.loadingPromise = null;
      console.error('❌ Erro ao carregar dados globais:', error);
      
      // Re-throw o erro original
      throw error;
    }
  }

  private async loadData(): Promise<CachedData> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Carregando dados da planilha...');
      
      // Carregar dados reais da API
      
      // Carregar planilhas com retry automático
      const spreadsheets = await RetryService.executeWithTimeout(
        () => googleSheetsService.listSpreadsheets(),
        3000, // 3 segundos timeout
        { maxAttempts: 2 }
      );
      
      if (spreadsheets.length === 0) {
        throw new Error('Nenhuma planilha encontrada');
      }

      // Carregar dados da planilha principal com timeout reduzido
      const currentSpreadsheet = spreadsheets[0];
      const sheets = await this.loadWithTimeout(
        () => googleSheetsService.getSpreadsheetData(currentSpreadsheet.id),
        20000 // 20 segundos timeout
      );
      
      if (sheets.length === 0) {
        throw new Error('Nenhuma aba encontrada na planilha');
      }

      const currentSheet = sheets[0];
      console.log(`📊 Dados carregados: ${currentSheet.data.length} linhas`);

      // Processar análise de dados em paralelo para melhor performance
      const processStartTime = Date.now();
      spreadsheetAnalysisService.processSpreadsheetData(currentSheet.data);
      
      const [analysisData, operatorProfiles, periodComparisons, queueAnalysis] = await Promise.all([
        this.loadWithTimeout(() => Promise.resolve(spreadsheetAnalysisService.getGeneralStats()), 5000),
        this.loadWithTimeout(() => Promise.resolve(spreadsheetAnalysisService.getOperatorProfiles()), 5000),
        this.loadWithTimeout(() => Promise.resolve(spreadsheetAnalysisService.getPeriodComparison()), 5000),
        this.loadWithTimeout(() => Promise.resolve(spreadsheetAnalysisService.getQueueAnalysis()), 5000)
      ]);

      const processTime = Date.now() - processStartTime;
      const totalTime = Date.now() - startTime;
      console.log(`⚡ Dados processados em ${processTime}ms (total: ${totalTime}ms)`);

      return {
        spreadsheets,
        currentSpreadsheet,
        currentSheet,
        analysisData,
        operatorProfiles,
        periodComparisons,
        queueAnalysis,
        lastUpdate: new Date(),
        isLoaded: true,
        error: null
      };

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      throw error;
    }
  }

  /**
   * Carregar com timeout
   */
  private async loadWithTimeout<T>(
    operation: () => Promise<T>, 
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout após ${timeoutMs}ms`)), timeoutMs)
      )
    ]).catch(error => {
      console.warn('Timeout ou erro na operação:', error.message);
      // Retornar dados vazios em caso de timeout
      return [] as T;
    });
  }

  /**
   * Verificar se o cache ainda é válido
   */
  private isCacheValid(): boolean {
    if (!this.cache) return false;
    
    const now = Date.now();
    const cacheAge = now - this.cache.lastUpdate.getTime();
    
    return cacheAge < this.CACHE_DURATION;
  }

  /**
   * Obter dados do cache sem carregar
   */
  getCachedData(): CachedData | null {
    return this.cache;
  }

  /**
   * Verificar se os dados estão carregados
   */
  isDataLoaded(): boolean {
    return this.cache?.isLoaded || false;
  }

  /**
   * Invalidar cache
   */
  invalidateCache(): void {
    this.cache = null;
    this.loadingPromise = null;
    console.log('🗑️ Cache global invalidado');
  }

  /**
   * Forçar atualização dos dados
   */
  async refreshData(): Promise<CachedData> {
    this.invalidateCache();
    return this.getData();
  }

  /**
   * Obter estatísticas do cache
   */
  getCacheStats(): {
    hasData: boolean;
    isLoaded: boolean;
    lastUpdate: Date | null;
    cacheAge: number;
  } {
    return {
      hasData: this.cache !== null,
      isLoaded: this.cache?.isLoaded || false,
      lastUpdate: this.cache?.lastUpdate || null,
      cacheAge: this.cache ? Date.now() - this.cache.lastUpdate.getTime() : 0
    };
  }

  /**
   * Salvar dados no cache persistente (localStorage)
   */
  private saveToPersistentCache(data: CachedData): void {
    try {
      const cacheData = {
        ...data,
        lastUpdate: data.lastUpdate.toISOString()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
      console.log('💾 Dados salvos no cache persistente');
    } catch (error) {
      console.warn('⚠️ Erro ao salvar cache persistente:', error);
    }
  }

  /**
   * Carregar dados do cache persistente (localStorage)
   */
  private loadFromPersistentCache(): CachedData | null {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) return null;

      const parsed = JSON.parse(cachedData);
      return {
        ...parsed,
        lastUpdate: new Date(parsed.lastUpdate)
      };
    } catch (error) {
      console.warn('⚠️ Erro ao carregar cache persistente:', error);
      return null;
    }
  }

  /**
   * Verificar se o cache persistente ainda é válido
   */
  private isPersistentCacheValid(): boolean {
    try {
      const timestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
      if (!timestamp) return false;

      const cacheAge = Date.now() - parseInt(timestamp);
      return cacheAge < this.PERSISTENT_CACHE_DURATION;
    } catch (error) {
      console.warn('⚠️ Erro ao verificar validade do cache persistente:', error);
      return false;
    }
  }

  /**
   * Limpar cache persistente
   */
  clearPersistentCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
      console.log('🗑️ Cache persistente limpo');
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache persistente:', error);
    }
  }
}

export const globalDataCache = new GlobalDataCache();
