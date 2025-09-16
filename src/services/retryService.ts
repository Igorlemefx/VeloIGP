// Serviço de Retry Automático para APIs
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}

export class RetryService {
  private static defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: (error) => {
      // Retry em erros de rede, timeout e 5xx
      return (
        error.name === 'NetworkError' ||
        error.message.includes('timeout') ||
        error.message.includes('Timeout') ||
        (error.status >= 500 && error.status < 600) ||
        error.code === 'NETWORK_ERROR'
      );
    }
  };

  static async execute<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    let lastError: any;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        console.log(`Tentativa ${attempt}/${config.maxAttempts}`);
        const result = await operation();
        console.log(`Operação bem-sucedida na tentativa ${attempt}`);
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`Tentativa ${attempt} falhou:`, error);

        // Verificar se deve tentar novamente
        if (attempt === config.maxAttempts || !config.retryCondition(error)) {
          console.error(`Todas as tentativas falharam. Último erro:`, error);
          throw error;
        }

        // Calcular delay com backoff exponencial
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
          config.maxDelay
        );

        console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Método específico para APIs com timeout
  static async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = 15000, // Aumentado para 15 segundos
    retryOptions: RetryOptions = {}
  ): Promise<T> {
    return this.execute(async () => {
      return Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout após ${timeoutMs}ms`)), timeoutMs)
        )
      ]);
    }, retryOptions);
  }

  // Método para operações críticas com retry mais agressivo
  static async executeCritical<T>(
    operation: () => Promise<T>,
    retryOptions: RetryOptions = {}
  ): Promise<T> {
    return this.execute(operation, {
      maxAttempts: 5,
      baseDelay: 500,
      maxDelay: 5000,
      backoffFactor: 1.5,
      ...retryOptions
    });
  }
}

export default RetryService;


