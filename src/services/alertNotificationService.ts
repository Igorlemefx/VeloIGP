/**
 * Serviço de Alertas e Notificações
 * Sistema inteligente de alertas baseado em métricas
 */

export interface Alert {
  id: string;
  type: 'performance' | 'threshold' | 'anomaly' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  data: any;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: () => void;
}

export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  sound: boolean;
  thresholds: {
    serviceLevel: number;
    abandonmentRate: number;
    occupancy: number;
    waitTime: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  condition: (data: any) => boolean;
  severity: Alert['severity'];
  message: (data: any) => string;
  cooldown: number; // minutos
  lastTriggered?: Date;
}

export class AlertNotificationService {
  private static instance: AlertNotificationService;
  private alerts: Alert[] = [];
  private settings: NotificationSettings;
  private rules: AlertRule[] = [];
  private listeners: ((alert: Alert) => void)[] = [];

  constructor() {
    this.settings = {
      email: false,
      browser: true,
      sound: true,
      thresholds: {
        serviceLevel: 80,
        abandonmentRate: 5,
        occupancy: 85,
        waitTime: 120
      }
    };
    
    this.initializeDefaultRules();
  }

  static getInstance(): AlertNotificationService {
    if (!AlertNotificationService.instance) {
      AlertNotificationService.instance = new AlertNotificationService();
    }
    return AlertNotificationService.instance;
  }

  /**
   * Inicializa regras padrão de alertas
   */
  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'service-level-low',
        name: 'Nível de Serviço Baixo',
        description: 'Alerta quando nível de serviço está abaixo do threshold',
        enabled: true,
        condition: (data) => {
          const serviceLevel = (data.answeredCalls / data.totalCalls) * 100;
          return serviceLevel < this.settings.thresholds.serviceLevel;
        },
        severity: 'error',
        message: (data) => `Nível de serviço crítico: ${((data.answeredCalls / data.totalCalls) * 100).toFixed(1)}%`,
        cooldown: 30
      },
      {
        id: 'abandonment-rate-high',
        name: 'Taxa de Abandono Alta',
        description: 'Alerta quando taxa de abandono está acima do threshold',
        enabled: true,
        condition: (data) => {
          const abandonmentRate = ((data.totalCalls - data.answeredCalls) / data.totalCalls) * 100;
          return abandonmentRate > this.settings.thresholds.abandonmentRate;
        },
        severity: 'warning',
        message: (data) => `Taxa de abandono elevada: ${(((data.totalCalls - data.answeredCalls) / data.totalCalls) * 100).toFixed(1)}%`,
        cooldown: 15
      },
      {
        id: 'occupancy-high',
        name: 'Ocupação Alta',
        description: 'Alerta quando ocupação está acima do threshold',
        enabled: true,
        condition: (data) => {
          const occupancy = (data.answeredCalls / data.totalCalls) * 100;
          return occupancy > this.settings.thresholds.occupancy;
        },
        severity: 'warning',
        message: (data) => `Ocupação alta: ${((data.answeredCalls / data.totalCalls) * 100).toFixed(1)}%`,
        cooldown: 20
      },
      {
        id: 'wait-time-high',
        name: 'Tempo de Espera Alto',
        description: 'Alerta quando tempo médio de espera está acima do threshold',
        enabled: true,
        condition: (data) => {
          return data.averageWaitTime > this.settings.thresholds.waitTime;
        },
        severity: 'warning',
        message: (data) => `Tempo de espera alto: ${data.averageWaitTime.toFixed(1)}s`,
        cooldown: 10
      }
    ];
  }

  /**
   * Verifica dados e gera alertas
   */
  async checkData(data: any[]): Promise<Alert[]> {
    if (data.length === 0) return [];

    const newAlerts: Alert[] = [];
    const metrics = this.calculateMetrics(data);

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      // Verificar cooldown
      if (rule.lastTriggered) {
        const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
        if (timeSinceLastTrigger < rule.cooldown * 60 * 1000) {
          continue;
        }
      }

      // Verificar condição
      if (rule.condition(metrics)) {
        const alert: Alert = {
          id: `${rule.id}-${Date.now()}`,
          type: 'threshold',
          severity: rule.severity,
          title: rule.name,
          message: rule.message(metrics),
          timestamp: new Date(),
          acknowledged: false,
          data: metrics,
          actions: this.getDefaultActions(rule.id)
        };

        newAlerts.push(alert);
        rule.lastTriggered = new Date();
      }
    }

    // Adicionar alertas à lista
    this.alerts.unshift(...newAlerts);

    // Notificar listeners
    newAlerts.forEach(alert => {
      this.notifyListeners(alert);
      this.showBrowserNotification(alert);
    });

    // Manter apenas últimos 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    return newAlerts;
  }

  /**
   * Calcula métricas dos dados
   */
  private calculateMetrics(data: any[]): any {
    const totalCalls = data.length;
    const answeredCalls = data.filter(d => d.status === 'answered' || d.status === 'completed').length;
    const waitTimes = data.map(d => d.waitTime || 0).filter(w => w > 0);
    const callDurations = data.map(d => d.callDuration || 0).filter(d => d > 0);

    return {
      totalCalls,
      answeredCalls,
      missedCalls: totalCalls - answeredCalls,
      averageWaitTime: waitTimes.length > 0 ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0,
      averageCallDuration: callDurations.length > 0 ? callDurations.reduce((a, b) => a + b, 0) / callDurations.length : 0
    };
  }

  /**
   * Obtém ações padrão para alertas
   */
  private getDefaultActions(ruleId: string): AlertAction[] {
    const actions: AlertAction[] = [
      {
        id: 'acknowledge',
        label: 'Reconhecer',
        type: 'primary',
        action: () => this.acknowledgeAlert(ruleId)
      }
    ];

    if (ruleId === 'service-level-low') {
      actions.push({
        id: 'view-dashboard',
        label: 'Ver Dashboard',
        type: 'secondary',
        action: () => window.location.href = '/dashboard'
      });
    }

    return actions;
  }

  /**
   * Reconhece um alerta
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = 'user';
      alert.acknowledgedAt = new Date();
    }
  }

  /**
   * Mostra notificação no browser
   */
  private showBrowserNotification(alert: Alert): void {
    if (!this.settings.browser) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(alert.title, {
        body: alert.message,
        icon: '/favicon.ico',
        tag: alert.id
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close após 10 segundos
      setTimeout(() => notification.close(), 10000);
    }
  }

  /**
   * Solicita permissão para notificações
   */
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Adiciona listener para alertas
   */
  addListener(listener: (alert: Alert) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: (alert: Alert) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notifica listeners
   */
  private notifyListeners(alert: Alert): void {
    this.listeners.forEach(listener => listener(alert));
  }

  /**
   * Obtém alertas não reconhecidos
   */
  getUnacknowledgedAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  /**
   * Obtém alertas por severidade
   */
  getAlertsBySeverity(severity: Alert['severity']): Alert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  /**
   * Obtém alertas recentes
   */
  getRecentAlerts(hours: number = 24): Alert[] {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    return this.alerts.filter(alert => alert.timestamp > cutoffTime);
  }

  /**
   * Atualiza configurações
   */
  updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Obtém configurações
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Adiciona regra personalizada
   */
  addRule(rule: Omit<AlertRule, 'id'>): string {
    const id = `custom-${Date.now()}`;
    this.rules.push({ ...rule, id });
    return id;
  }

  /**
   * Remove regra
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  /**
   * Limpa alertas antigos
   */
  clearOldAlerts(days: number = 7): void {
    const cutoffTime = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffTime);
  }

  /**
   * Obtém estatísticas de alertas
   */
  getAlertStats(): {
    total: number;
    unacknowledged: number;
    bySeverity: Record<Alert['severity'], number>;
    recent: number;
  } {
    const unacknowledged = this.getUnacknowledgedAlerts().length;
    const recent = this.getRecentAlerts(24).length;
    
    const bySeverity = {
      info: this.getAlertsBySeverity('info').length,
      warning: this.getAlertsBySeverity('warning').length,
      error: this.getAlertsBySeverity('error').length,
      critical: this.getAlertsBySeverity('critical').length
    };

    return {
      total: this.alerts.length,
      unacknowledged,
      bySeverity,
      recent
    };
  }
}

export const alertNotificationService = AlertNotificationService.getInstance();

