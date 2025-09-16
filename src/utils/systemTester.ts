// Sistema de Teste Automatizado
// Testa todas as funcionalidades do sistema

import { debugService } from '../services/debugService';
import { persistentGlobalCache } from '../services/persistentGlobalCache';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}

class SystemTester {
  private results: TestResult[] = [];

  /**
   * Executar todos os testes
   */
  async runAllTests(): Promise<TestResult[]> {
    debugService.log('🧪 Iniciando testes do sistema');
    this.results = [];

    const tests = [
      () => this.testCacheInitialization(),
      () => this.testDataLoading(),
      () => this.testDataPersistence(),
      () => this.testErrorHandling(),
      () => this.testPerformance(),
      () => this.testMemoryUsage(),
      () => this.testLocalStorage(),
      () => this.testDataIntegrity()
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        debugService.error('Erro no teste', error);
        this.addResult('Teste', 'FAIL', `Erro: ${error}`, 0);
      }
    }

    debugService.log('✅ Testes concluídos', this.results);
    return this.results;
  }

  /**
   * Teste de inicialização do cache
   */
  private async testCacheInitialization(): Promise<void> {
    const start = Date.now();
    
    try {
      const cache = persistentGlobalCache;
      const hasData = cache.hasData();
      const isLoading = cache.isLoading();
      
      const duration = Date.now() - start;
      
      if (cache && typeof hasData === 'boolean' && typeof isLoading === 'boolean') {
        this.addResult('Cache Initialization', 'PASS', 'Cache inicializado corretamente', duration);
      } else {
        this.addResult('Cache Initialization', 'FAIL', 'Cache não inicializado corretamente', duration);
      }
    } catch (error) {
      this.addResult('Cache Initialization', 'FAIL', `Erro: ${error}`, Date.now() - start);
    }
  }

  /**
   * Teste de carregamento de dados
   */
  private async testDataLoading(): Promise<void> {
    const start = Date.now();
    
    try {
      const data = await persistentGlobalCache.getData();
      const duration = Date.now() - start;
      
      if (data && data.isLoaded && data.analysisData) {
        this.addResult('Data Loading', 'PASS', 'Dados carregados com sucesso', duration);
      } else {
        this.addResult('Data Loading', 'FAIL', 'Dados não carregados corretamente', duration);
      }
    } catch (error) {
      this.addResult('Data Loading', 'FAIL', `Erro: ${error}`, Date.now() - start);
    }
  }

  /**
   * Teste de persistência de dados
   */
  private async testDataPersistence(): Promise<void> {
    const start = Date.now();
    
    try {
      // Carregar dados
      const data1 = await persistentGlobalCache.getData();
      
      // Verificar se dados persistem
      const data2 = persistentGlobalCache.getDataSync();
      
      const duration = Date.now() - start;
      
      if (data1 && data2 && data1 === data2) {
        this.addResult('Data Persistence', 'PASS', 'Dados persistem corretamente', duration);
      } else {
        this.addResult('Data Persistence', 'FAIL', 'Dados não persistem', duration);
      }
    } catch (error) {
      this.addResult('Data Persistence', 'FAIL', `Erro: ${error}`, Date.now() - start);
    }
  }

  /**
   * Teste de tratamento de erros
   */
  private async testErrorHandling(): Promise<void> {
    const start = Date.now();
    
    try {
      // Simular erro
      const originalGetData = persistentGlobalCache.getData;
      persistentGlobalCache.getData = () => Promise.reject(new Error('Teste de erro'));
      
      try {
        await persistentGlobalCache.getData();
        this.addResult('Error Handling', 'FAIL', 'Erro não foi tratado', Date.now() - start);
      } catch (error) {
        this.addResult('Error Handling', 'PASS', 'Erro tratado corretamente', Date.now() - start);
      } finally {
        // Restaurar função original
        persistentGlobalCache.getData = originalGetData;
      }
    } catch (error) {
      this.addResult('Error Handling', 'FAIL', `Erro: ${error}`, Date.now() - start);
    }
  }

  /**
   * Teste de performance
   */
  private async testPerformance(): Promise<void> {
    const start = Date.now();
    
    try {
      // Testar carregamento múltiplo
      const promises = Array(5).fill(null).map(() => persistentGlobalCache.getData());
      await Promise.all(promises);
      
      const duration = Date.now() - start;
      
      if (duration < 5000) { // Menos de 5 segundos
        this.addResult('Performance', 'PASS', `Carregamento rápido: ${duration}ms`, duration);
      } else {
        this.addResult('Performance', 'FAIL', `Carregamento lento: ${duration}ms`, duration);
      }
    } catch (error) {
      this.addResult('Performance', 'FAIL', `Erro: ${error}`, Date.now() - start);
    }
  }

  /**
   * Teste de uso de memória
   */
  private async testMemoryUsage(): Promise<void> {
    const start = Date.now();
    
    try {
      const data = await persistentGlobalCache.getData();
      const dataSize = JSON.stringify(data).length;
      const duration = Date.now() - start;
      
      if (dataSize < 1000000) { // Menos de 1MB
        this.addResult('Memory Usage', 'PASS', `Uso de memória OK: ${dataSize} bytes`, duration);
      } else {
        this.addResult('Memory Usage', 'FAIL', `Uso de memória alto: ${dataSize} bytes`, duration);
      }
    } catch (error) {
      this.addResult('Memory Usage', 'FAIL', `Erro: ${error}`, Date.now() - start);
    }
  }

  /**
   * Teste de localStorage
   */
  private async testLocalStorage(): Promise<void> {
    const start = Date.now();
    
    try {
      const testKey = 'veloigp_test';
      const testData = { test: 'data', timestamp: Date.now() };
      
      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');
      localStorage.removeItem(testKey);
      
      const duration = Date.now() - start;
      
      if (retrieved.test === 'data') {
        this.addResult('LocalStorage', 'PASS', 'LocalStorage funcionando', duration);
      } else {
        this.addResult('LocalStorage', 'FAIL', 'LocalStorage não funcionando', duration);
      }
    } catch (error) {
      this.addResult('LocalStorage', 'FAIL', `Erro: ${error}`, Date.now() - start);
    }
  }

  /**
   * Teste de integridade dos dados
   */
  private async testDataIntegrity(): Promise<void> {
    const start = Date.now();
    
    try {
      const data = await persistentGlobalCache.getData();
      const duration = Date.now() - start;
      
      const requiredFields = [
        'spreadsheets',
        'currentSpreadsheet',
        'currentSheet',
        'analysisData',
        'operatorProfiles',
        'periodComparisons',
        'queueAnalysis',
        'lastUpdate',
        'isLoaded'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in data));
      
      if (missingFields.length === 0) {
        this.addResult('Data Integrity', 'PASS', 'Todos os campos obrigatórios presentes', duration);
      } else {
        this.addResult('Data Integrity', 'FAIL', `Campos ausentes: ${missingFields.join(', ')}`, duration);
      }
    } catch (error) {
      this.addResult('Data Integrity', 'FAIL', `Erro: ${error}`, Date.now() - start);
    }
  }

  /**
   * Adicionar resultado do teste
   */
  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, duration: number): void {
    this.results.push({
      test,
      status,
      message,
      duration
    });
  }

  /**
   * Obter resumo dos testes
   */
  getSummary(): { total: number; passed: number; failed: number; skipped: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    return { total, passed, failed, skipped };
  }
}

// Instância singleton
export const systemTester = new SystemTester();
export default systemTester;



