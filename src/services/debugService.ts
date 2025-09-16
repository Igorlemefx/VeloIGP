// Serviço de Debug - Para Investigar Problemas
// Logs detalhados para identificar onde está travando

class DebugService {
  private logs: string[] = [];
  private isEnabled = true;

  log(message: string, data?: any) {
    if (!this.isEnabled) return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    console.log(logMessage, data || '');
    this.logs.push(logMessage);
    
    // Manter apenas os últimos 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
  }

  error(message: string, error?: any) {
    if (!this.isEnabled) return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;
    
    console.error(logMessage, error || '');
    this.logs.push(logMessage);
  }

  warn(message: string, data?: any) {
    if (!this.isEnabled) return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] WARN: ${message}`;
    
    console.warn(logMessage, data || '');
    this.logs.push(logMessage);
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  // Verificar se está em ambiente de desenvolvimento
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  // Verificar se está em produção
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}

// Instância singleton
export const debugService = new DebugService();
export default debugService;



