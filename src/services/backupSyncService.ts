// Serviço de Backup e Sincronização - VeloIGP

interface BackupData {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental' | 'scheduled';
  size: number;
  status: 'success' | 'failed' | 'in_progress';
  collections: string[];
  description?: string;
}

interface SyncStatus {
  lastSync: Date | null;
  status: 'synced' | 'pending' | 'error' | 'never' | 'in_progress';
  error?: string;
  nextSync: Date | null;
}

class BackupSyncService {
  private backups: BackupData[] = [];
  private syncStatus: SyncStatus = {
    lastSync: null,
    status: 'never',
    nextSync: null
  };

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    // Configurar sincronização automática a cada 30 minutos
    setInterval(() => {
      this.performAutoSync();
    }, 30 * 60 * 1000);

    // Carregar backups salvos
    this.loadBackups();
  }

  // Criar backup completo
  public async createFullBackup(description?: string): Promise<BackupData> {
    const backup: BackupData = {
      id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'full',
      size: 0,
      status: 'in_progress',
      collections: ['operators', 'calls', 'metrics', 'operators_history', 'calls_history', 'metrics_history'],
      description
    };

    this.backups.unshift(backup);
    this.saveBackups();

    try {
      // Simular processo de backup
      await this.simulateBackupProcess(backup);
      
      backup.status = 'success';
      backup.size = Math.floor(Math.random() * 50) + 10; // Simular tamanho em MB
      
      console.log(`✅ Backup completo criado: ${backup.id}`);
      return backup;
    } catch (error) {
      backup.status = 'failed';
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    }
  }

  // Criar backup incremental
  public async createIncrementalBackup(description?: string): Promise<BackupData> {
    const backup: BackupData = {
      id: `backup_inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'incremental',
      size: 0,
      status: 'in_progress',
      collections: ['operators', 'calls', 'metrics'],
      description
    };

    this.backups.unshift(backup);
    this.saveBackups();

    try {
      await this.simulateBackupProcess(backup);
      
      backup.status = 'success';
      backup.size = Math.floor(Math.random() * 10) + 1; // Simular tamanho menor
      
      console.log(`✅ Backup incremental criado: ${backup.id}`);
      return backup;
    } catch (error) {
      backup.status = 'failed';
      console.error('❌ Erro ao criar backup incremental:', error);
      throw error;
    }
  }

  // Simular processo de backup
  private async simulateBackupProcess(backup: BackupData): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular 90% de sucesso
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Falha simulada no backup'));
        }
      }, 2000 + Math.random() * 3000); // 2-5 segundos
    });
  }

  // Sincronizar com MongoDB
  public async syncWithMongoDB(): Promise<SyncStatus> {
    this.syncStatus.status = 'pending';
    
    try {
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      this.syncStatus = {
        lastSync: new Date(),
        status: 'synced',
        nextSync: new Date(Date.now() + 30 * 60 * 1000) // Próxima em 30 min
      };

      console.log('✅ Sincronização com MongoDB concluída');
      return this.syncStatus;
    } catch (error) {
      this.syncStatus = {
        lastSync: this.syncStatus.lastSync,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        nextSync: new Date(Date.now() + 5 * 60 * 1000) // Tentar novamente em 5 min
      };

      console.error('❌ Erro na sincronização:', error);
      return this.syncStatus;
    }
  }

  // Sincronização automática
  private async performAutoSync(): Promise<void> {
    if (this.syncStatus.status === 'in_progress') return;
    
    try {
      await this.syncWithMongoDB();
    } catch (error) {
      console.error('Erro na sincronização automática:', error);
    }
  }

  // Obter lista de backups
  public getBackups(): BackupData[] {
    return [...this.backups];
  }

  // Obter status de sincronização
  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Restaurar backup
  public async restoreBackup(backupId: string): Promise<boolean> {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) {
      throw new Error('Backup não encontrado');
    }

    if (backup.status !== 'success') {
      throw new Error('Backup não pode ser restaurado (status inválido)');
    }

    try {
      // Simular processo de restauração
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
      
      console.log(`✅ Backup restaurado: ${backupId}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      throw error;
    }
  }

  // Excluir backup
  public deleteBackup(backupId: string): boolean {
    const index = this.backups.findIndex(b => b.id === backupId);
    if (index === -1) return false;

    this.backups.splice(index, 1);
    this.saveBackups();
    
    console.log(`🗑️ Backup excluído: ${backupId}`);
    return true;
  }

  // Limpar backups antigos (manter apenas os últimos 10)
  public cleanupOldBackups(): number {
    const initialCount = this.backups.length;
    this.backups = this.backups.slice(0, 10);
    const removedCount = initialCount - this.backups.length;
    
    if (removedCount > 0) {
      this.saveBackups();
      console.log(`🧹 ${removedCount} backups antigos removidos`);
    }
    
    return removedCount;
  }

  // Salvar backups no localStorage
  private saveBackups(): void {
    try {
      localStorage.setItem('veloigp_backups', JSON.stringify(this.backups));
    } catch (error) {
      console.error('Erro ao salvar backups:', error);
    }
  }

  // Carregar backups do localStorage
  private loadBackups(): void {
    try {
      const saved = localStorage.getItem('veloigp_backups');
      if (saved) {
        this.backups = JSON.parse(saved).map((b: any) => ({
          ...b,
          timestamp: new Date(b.timestamp)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
      this.backups = [];
    }
  }

  // Obter estatísticas de backup
  public getBackupStats() {
    const totalBackups = this.backups.length;
    const successfulBackups = this.backups.filter(b => b.status === 'success').length;
    const failedBackups = this.backups.filter(b => b.status === 'failed').length;
    const totalSize = this.backups
      .filter(b => b.status === 'success')
      .reduce((sum, b) => sum + b.size, 0);

    return {
      totalBackups,
      successfulBackups,
      failedBackups,
      totalSize,
      successRate: totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0
    };
  }

  // Configurar backup automático
  public setAutoBackup(enabled: boolean, interval: number = 24): void {
    if (enabled) {
      // Backup automático a cada X horas
      setInterval(() => {
        this.createIncrementalBackup('Backup automático');
      }, interval * 60 * 60 * 1000);
      
      console.log(`🔄 Backup automático configurado para ${interval}h`);
    }
  }
}

// Instância singleton
const backupSyncService = new BackupSyncService();

export default backupSyncService;
