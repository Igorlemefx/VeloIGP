// Tipos para dados da API 55PBX

export interface RealTimeData {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  answerRate: number;
  averageWaitTime: number;
  averageSatisfaction: number;
}

export interface QueueData {
  queue: string;
  calls: number;
  avgWait: number;
  satisfaction: number;
}

export interface TrendData {
  date: string;
  calls: number;
  satisfaction: number;
}

export interface AnalyticsData {
  period: string;
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  answerRate: number;
  averageWaitTime: number;
  averageSatisfaction: number;
  peakHours: { hour: number; calls: number }[];
  queuePerformance: QueueData[];
  trends: TrendData[];
}

export interface SpreadsheetData {
  id: string;
  name: string;
  url: string;
  lastModified: Date;
  isActive: boolean;
  metrics: {
    totalRows: number;
    processedRows: number;
    errorRows: number;
  };
}

export interface ReportData {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  generatedAt: Date;
  data: any;
  filters: {
    dateRange: { start: string; end: string };
    operators: string[];
    queues: string[];
  };
}



