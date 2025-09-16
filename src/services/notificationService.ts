// Serviço de Notificações em Tempo Real - VeloIGP

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private maxNotifications = 50;

  // Adicionar notificação
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    
    // Manter apenas as últimas notificações
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    this.notifyListeners();
    return id;
  }

  // Remover notificação
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Marcar como lida
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Marcar todas como lidas
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  // Limpar todas as notificações
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Obter notificações
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Obter notificações não lidas
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Contar notificações não lidas
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Adicionar listener
  addListener(callback: (notifications: Notification[]) => void): void {
    this.listeners.push(callback);
  }

  // Remover listener
  removeListener(callback: (notifications: Notification[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  // Notificar listeners
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback([...this.notifications]));
  }

  // Notificações automáticas baseadas em dados
  checkDataAlerts(data: any): void {
    // Alertas de performance
    if (data.efficiency && data.efficiency < 70) {
      this.addNotification({
        type: 'warning',
        title: 'Eficiência Baixa',
        message: `Eficiência do operador está em ${data.efficiency}%`,
        action: {
          label: 'Ver Detalhes',
          callback: () => console.log('Ver detalhes do operador')
        }
      });
    }

    // Alertas de volume de chamadas
    if (data.totalCalls && data.totalCalls > 1000) {
      this.addNotification({
        type: 'info',
        title: 'Alto Volume de Chamadas',
        message: `${data.totalCalls} chamadas processadas hoje`,
        action: {
          label: 'Ver Relatório',
          callback: () => console.log('Ver relatório de chamadas')
        }
      });
    }

    // Alertas de conexão
    if (data.connectionStatus === 'disconnected') {
      this.addNotification({
        type: 'error',
        title: 'Conexão Perdida',
        message: 'Conexão com a API foi perdida',
        action: {
          label: 'Reconectar',
          callback: () => console.log('Tentar reconectar')
        }
      });
    }
  }

  // Notificações de sistema
  showSystemNotification(type: Notification['type'], title: string, message: string): void {
    this.addNotification({ type, title, message });
  }

  // Notificações de sucesso
  showSuccess(title: string, message: string): void {
    this.addNotification({ type: 'success', title, message });
  }

  // Notificações de erro
  showError(title: string, message: string): void {
    this.addNotification({ type: 'error', title, message });
  }

  // Notificações de aviso
  showWarning(title: string, message: string): void {
    this.addNotification({ type: 'warning', title, message });
  }

  // Notificações de informação
  showInfo(title: string, message: string): void {
    this.addNotification({ type: 'info', title, message });
  }
}

// Instância singleton
const notificationService = new NotificationService();

export default notificationService;


