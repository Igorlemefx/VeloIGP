// Serviço de Atualizações em Tempo Real
import { googleSheetsService } from './googleSheetsService';
import { spreadsheetAnalysisService } from './spreadsheetAnalysisService';

export interface RealtimeConfig {
  enabled: boolean;
  interval: number; // em milissegundos
  autoRefresh: boolean;
  notifications: boolean;
}

export interface RealtimeData {
  lastUpdate: Date;
  isUpdating: boolean;
  error: string | null;
  dataVersion: number;
}

class RealtimeService {
  private config: RealtimeConfig = {
    enabled: false,
    interval: 30000, // 30 segundos
    autoRefresh: true,
    notifications: true
  };
  
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Array<(data: RealtimeData) => void> = [];
  private currentData: RealtimeData = {
    lastUpdate: new Date(),
    isUpdating: false,
    error: null,
    dataVersion: 0
  };

  /**
   * Configurar serviço de tempo real
   */
  configure(config: Partial<RealtimeConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('🔄 Serviço de tempo real configurado:', this.config);
  }

  /**
   * Iniciar atualizações automáticas
   */
  start(): void {
    if (this.intervalId) {
      this.stop();
    }

    if (!this.config.enabled) {
      console.log('⚠️ Serviço de tempo real desabilitado');
      return;
    }

    console.log('🚀 Iniciando atualizações em tempo real...');
    
    // Atualização imediata
    this.updateData();
    
    // Configurar intervalo
    this.intervalId = setInterval(() => {
      this.updateData();
    }, this.config.interval);

    this.notifyListeners();
  }

  /**
   * Parar atualizações automáticas
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Atualizações em tempo real paradas');
    }
  }

  /**
   * Atualizar dados manualmente
   */
  async updateData(): Promise<void> {
    if (this.currentData.isUpdating) {
      console.log('⏳ Atualização já em andamento, pulando...');
      return;
    }

    this.currentData.isUpdating = true;
    this.currentData.error = null;
    this.notifyListeners();

    try {
      console.log('🔄 Atualizando dados...');
      
      // Obter dados da planilha
      const spreadsheets = await googleSheetsService.listSpreadsheets();
      if (spreadsheets.length === 0) {
        throw new Error('Nenhuma planilha encontrada');
      }

      const spreadsheet = spreadsheets[0];
      const sheets = await googleSheetsService.getSpreadsheetData(spreadsheet.id);
      
      if (sheets.length === 0) {
        throw new Error('Nenhuma aba encontrada na planilha');
      }

      const sheetData = sheets[0];
      
      // Processar dados
      spreadsheetAnalysisService.processSpreadsheetData(sheetData.data);
      
      // Atualizar estado
      this.currentData.lastUpdate = new Date();
      this.currentData.dataVersion++;
      this.currentData.isUpdating = false;
      this.currentData.error = null;

      console.log('✅ Dados atualizados com sucesso');
      
      // Mostrar notificação se habilitada
      if (this.config.notifications) {
        this.showNotification('Dados atualizados com sucesso!', 'success');
      }

    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
      
      this.currentData.isUpdating = false;
      this.currentData.error = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (this.config.notifications) {
        this.showNotification('Erro ao atualizar dados', 'error');
      }
    }

    this.notifyListeners();
  }

  /**
   * Adicionar listener para mudanças
   */
  addListener(listener: (data: RealtimeData) => void): () => void {
    this.listeners.push(listener);
    
    // Retornar função para remover listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notificar todos os listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentData);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }

  /**
   * Obter dados atuais
   */
  getCurrentData(): RealtimeData {
    return { ...this.currentData };
  }

  /**
   * Verificar se está ativo
   */
  isActive(): boolean {
    return this.intervalId !== null;
  }

  /**
   * Obter configuração atual
   */
  getConfig(): RealtimeConfig {
    return { ...this.config };
  }

  /**
   * Mostrar notificação
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // Verificar se o navegador suporta notificações
    if (!('Notification' in window)) {
      console.log('Notificações não suportadas pelo navegador');
      return;
    }

    // Solicitar permissão se necessário
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.createNotification(message, type);
        }
      });
    } else if (Notification.permission === 'granted') {
      this.createNotification(message, type);
    }
  }

  /**
   * Criar notificação
   */
  private createNotification(message: string, type: 'success' | 'error' | 'info'): void {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };

    const notification = new Notification('VeloIGP Dashboard', {
      body: `${icons[type]} ${message}`,
      icon: '/favicon.ico',
      tag: 'veloigp-update'
    });

    // Fechar notificação após 5 segundos
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  /**
   * Obter estatísticas de atualização
   */
  getStats(): {
    isActive: boolean;
    lastUpdate: Date;
    dataVersion: number;
    listenersCount: number;
    config: RealtimeConfig;
  } {
    return {
      isActive: this.isActive(),
      lastUpdate: this.currentData.lastUpdate,
      dataVersion: this.currentData.dataVersion,
      listenersCount: this.listeners.length,
      config: this.getConfig()
    };
  }

  /**
   * Limpar todos os listeners
   */
  clearListeners(): void {
    this.listeners = [];
  }

  /**
   * Destruir serviço
   */
  destroy(): void {
    this.stop();
    this.clearListeners();
    console.log('🗑️ Serviço de tempo real destruído');
  }
}

export const realtimeService = new RealtimeService();

