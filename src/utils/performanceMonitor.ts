// Monitor de Performance - Evita travamentos
// Sistema de timeout e recovery para evitar "Página sem resposta"

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private isMonitoring = false;
  private lastActivity = Date.now();
  private maxIdleTime = 30000; // 30 segundos
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Iniciar monitoramento de performance
   */
  private startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Iniciando monitor de performance...');
    
    // Heartbeat para manter a página ativa
    this.heartbeatInterval = setInterval(() => {
      this.updateActivity();
    }, 5000);

    // Monitor de inatividade
    setInterval(() => {
      if (Date.now() - this.lastActivity > this.maxIdleTime) {
        console.warn('⚠️ Página inativa por muito tempo, forçando refresh...');
        this.forceRefresh();
      }
    }, 10000);
  }

  /**
   * Atualizar atividade
   */
  updateActivity(): void {
    this.lastActivity = Date.now();
  }

  /**
   * Forçar refresh da página
   */
  private forceRefresh(): void {
    console.log('🔄 Forçando refresh da página...');
    window.location.reload();
  }

  /**
   * Executar função com timeout
   */
  async executeWithTimeout<T>(
    key: string,
    fn: () => Promise<T>,
    timeoutMs: number = 10000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Limpar timeout anterior se existir
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key)!);
      }

      // Criar novo timeout
      const timeout = setTimeout(() => {
        console.error(`⏰ Timeout na operação: ${key}`);
        this.timeouts.delete(key);
        reject(new Error(`Timeout após ${timeoutMs}ms`));
      }, timeoutMs);

      this.timeouts.set(key, timeout);

      // Executar função
      fn()
        .then(result => {
          clearTimeout(timeout);
          this.timeouts.delete(key);
          this.updateActivity();
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          this.timeouts.delete(key);
          this.updateActivity();
          reject(error);
        });
    });
  }

  /**
   * Cancelar operação
   */
  cancelOperation(key: string): void {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key)!);
      this.timeouts.delete(key);
      console.log(`❌ Operação cancelada: ${key}`);
    }
  }

  /**
   * Limpar todos os timeouts
   */
  clearAllTimeouts(): void {
    this.timeouts.forEach((timeout, key) => {
      clearTimeout(timeout);
      console.log(`🧹 Timeout limpo: ${key}`);
    });
    this.timeouts.clear();
  }

  /**
   * Parar monitoramento
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.clearAllTimeouts();
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    console.log('🛑 Monitor de performance parado');
  }

  /**
   * Obter estatísticas
   */
  getStats(): { activeTimeouts: number; lastActivity: Date; isMonitoring: boolean } {
    return {
      activeTimeouts: this.timeouts.size,
      lastActivity: new Date(this.lastActivity),
      isMonitoring: this.isMonitoring
    };
  }
}

// Instância singleton
export const performanceMonitor = PerformanceMonitor.getInstance();
export default performanceMonitor;



