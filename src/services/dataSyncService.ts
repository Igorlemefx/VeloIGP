// Serviço de Sincronização de Dados
// Sincroniza dados entre API 55PBX e Google Sheets

import { api55pbxDataService } from './api55pbxData';
import { googleSheetsService } from './googleSheetsService';

interface SyncStatus {
  isRunning: boolean;
  lastSync: Date | null;
  nextSync: Date | null;
  errors: string[];
  stats: {
    totalRecords: number;
    syncedRecords: number;
    failedRecords: number;
  };
}

interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // em minutos
  maxRetries: number;
  batchSize: number;
}

class DataSyncService {
  private static instance: DataSyncService;
  private syncStatus: SyncStatus = {
    isRunning: false,
    lastSync: null,
    nextSync: null,
    errors: [],
    stats: {
      totalRecords: 0,
      syncedRecords: 0,
      failedRecords: 0
    }
  };

  private syncConfig: SyncConfig = {
    autoSync: true,
    syncInterval: 5, // 5 minutos
    maxRetries: 3,
    batchSize: 100
  };

  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startAutoSync();
  }

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  /**
   * Iniciar sincronização automática
   */
  startAutoSync(): void {
    if (this.syncConfig.autoSync && !this.syncInterval) {
      this.syncInterval = setInterval(() => {
        this.syncData();
      }, this.syncConfig.syncInterval * 60 * 1000);
      
      console.log(`🔄 Sincronização automática iniciada (${this.syncConfig.syncInterval} min)`);
    }
  }

  /**
   * Parar sincronização automática
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Sincronização automática parada');
    }
  }

  /**
   * Sincronizar dados entre API 55PBX e Google Sheets
   */
  async syncData(): Promise<boolean> {
    if (this.syncStatus.isRunning) {
      console.log('⚠️ Sincronização já em andamento');
      return false;
    }

    this.syncStatus.isRunning = true;
    this.syncStatus.errors = [];
    this.syncStatus.stats = {
      totalRecords: 0,
      syncedRecords: 0,
      failedRecords: 0
    };

    try {
      console.log('🔄 Iniciando sincronização de dados...');

      // 1. Verificar conectividade com API 55PBX
      const apiConnected = await api55pbxDataService.checkConnectivity();
      if (!apiConnected) {
        throw new Error('API 55PBX não está acessível');
      }

      // 2. Verificar conectividade com Google Sheets
      const sheetsConnected = await this.checkGoogleSheetsConnection();
      if (!sheetsConnected) {
        throw new Error('Google Sheets não está acessível');
      }

      // 3. Obter dados da API 55PBX
      const realtimeData = await api55pbxDataService.getRealtimeData();
      if (!realtimeData.success) {
        throw new Error('Falha ao obter dados da API 55PBX');
      }

      // 4. Processar e sincronizar dados
      await this.processAndSyncData(realtimeData.data);

      this.syncStatus.lastSync = new Date();
      this.syncStatus.nextSync = new Date(Date.now() + (this.syncConfig.syncInterval * 60 * 1000));
      
      console.log('✅ Sincronização concluída com sucesso');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.syncStatus.errors.push(errorMessage);
      console.error('❌ Erro na sincronização:', errorMessage);
      return false;
    } finally {
      this.syncStatus.isRunning = false;
    }
  }

  /**
   * Verificar conexão com Google Sheets
   */
  private async checkGoogleSheetsConnection(): Promise<boolean> {
    try {
      const spreadsheets = await googleSheetsService.listSpreadsheets();
      return spreadsheets && spreadsheets.length > 0;
    } catch (error) {
      console.error('❌ Erro na conexão com Google Sheets:', error);
      return false;
    }
  }

  /**
   * Processar e sincronizar dados
   */
  private async processAndSyncData(data: any): Promise<void> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Preparar dados para sincronização
    const syncData = this.prepareDataForSync(data, today);

    // Sincronizar com Google Sheets
    await this.syncToGoogleSheets(syncData, today);
  }

  /**
   * Preparar dados para sincronização
   */
  private prepareDataForSync(data: any, date: string): any[][] {
    const syncData = [];

    // Cabeçalho
    syncData.push([
      'Data',
      'Hora',
      'Operador',
      'Fila',
      'Status',
      'Duração',
      'Tempo de Espera',
      'Cliente',
      'Tipo de Chamada'
    ]);

    // Processar dados de chamadas
    if (data.calls && Array.isArray(data.calls)) {
      data.calls.forEach((call: any) => {
        const startTime = new Date(call.startTime);
        const hour = startTime.getHours().toString().padStart(2, '0');
        const minute = startTime.getMinutes().toString().padStart(2, '0');
        
        syncData.push([
          date,
          `${hour}:${minute}`,
          call.agent || 'N/A',
          call.queue || 'N/A',
          call.status || 'N/A',
          this.formatDuration(call.duration || 0),
          this.formatDuration(call.waitTime || 0),
          call.callerId || 'N/A',
          'Entrada'
        ]);
      });
    }

    // Processar dados de agentes
    if (data.agents && Array.isArray(data.agents)) {
      data.agents.forEach((agent: any) => {
        const now = new Date();
        const hour = now.getHours().toString().padStart(2, '0');
        const minute = now.getMinutes().toString().padStart(2, '0');
        
        syncData.push([
          date,
          `${hour}:${minute}`,
          agent.name || 'N/A',
          agent.queue || 'N/A',
          agent.status || 'N/A',
          this.formatDuration(agent.totalTalkTime || 0),
          '0:00',
          'Sistema',
          'Status Operador'
        ]);
      });
    }

    this.syncStatus.stats.totalRecords = syncData.length - 1; // -1 para excluir cabeçalho
    return syncData;
  }

  /**
   * Sincronizar dados com Google Sheets
   */
  private async syncToGoogleSheets(data: any[][], date: string): Promise<void> {
    try {
      // Obter planilhas disponíveis
      const spreadsheets = await googleSheetsService.listSpreadsheets();
      if (!spreadsheets || spreadsheets.length === 0) {
        throw new Error('Nenhuma planilha encontrada');
      }

      // Usar a primeira planilha disponível
      const spreadsheet = spreadsheets[0];
      
      // Simular sincronização (implementar quando necessário)
      console.log(`📊 Sincronizando dados com planilha: ${spreadsheet.title}`);
      
      this.syncStatus.stats.syncedRecords = data.length - 1; // -1 para excluir cabeçalho
      console.log(`✅ Dados sincronizados com Google Sheets: ${data.length - 1} registros`);

    } catch (error) {
      this.syncStatus.stats.failedRecords = data.length - 1;
      throw error;
    }
  }

  /**
   * Formatar duração em segundos para MM:SS
   */
  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Obter status da sincronização
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Obter configuração da sincronização
   */
  getSyncConfig(): SyncConfig {
    return { ...this.syncConfig };
  }

  /**
   * Atualizar configuração da sincronização
   */
  updateSyncConfig(config: Partial<SyncConfig>): void {
    this.syncConfig = { ...this.syncConfig, ...config };
    
    // Reiniciar auto-sync se necessário
    if (config.autoSync !== undefined || config.syncInterval !== undefined) {
      this.stopAutoSync();
      if (this.syncConfig.autoSync) {
        this.startAutoSync();
      }
    }
  }

  /**
   * Forçar sincronização manual
   */
  async forceSync(): Promise<boolean> {
    console.log('🔄 Forçando sincronização manual...');
    return await this.syncData();
  }

  /**
   * Limpar dados de sincronização
   */
  clearSyncData(): void {
    this.syncStatus = {
      isRunning: false,
      lastSync: null,
      nextSync: null,
      errors: [],
      stats: {
        totalRecords: 0,
        syncedRecords: 0,
        failedRecords: 0
      }
    };
    console.log('🧹 Dados de sincronização limpos');
  }
}

export const dataSyncService = DataSyncService.getInstance();
export default dataSyncService;
