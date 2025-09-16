import { useState, useEffect, useCallback } from 'react';
import { RealTimeData } from '../types/api';
import { useLoading } from './useLoading';

interface UseRealTimeDataReturn {
  data: RealTimeData | null;
  isConnected: boolean;
  lastUpdate: Date | null;
  error: string | null;
  isLoading: boolean;
  message: string;
  refresh: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useRealTimeData = (refreshInterval = 30000): UseRealTimeDataReturn => {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, message, startLoading, stopLoading } = useLoading();

  const generateMockData = useCallback((): RealTimeData => {
    return {
      totalCalls: Math.floor(Math.random() * 50) + 20,
      answeredCalls: Math.floor(Math.random() * 40) + 15,
      missedCalls: Math.floor(Math.random() * 10) + 2,
      answerRate: Math.floor(Math.random() * 20) + 75,
      averageWaitTime: Math.floor(Math.random() * 3) + 1,
      averageSatisfaction: Math.floor(Math.random() * 2) + 3
    };
  }, []);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      // Simular carregamento de dados da API 55PBX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockData();
      setData(mockData);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(errorMessage);
      console.error('Erro ao carregar dados em tempo real:', err);
    }
  }, [generateMockData]);

  const connect = useCallback(async (): Promise<void> => {
    startLoading('Conectando com API 55PBX...');
    
    try {
      // Simular conexão com API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de conexão';
      setError(errorMessage);
      setIsConnected(false);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, loadData]);

  const disconnect = useCallback((): void => {
    setIsConnected(false);
    setData(null);
    setError(null);
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    if (!isConnected) return;
    
    startLoading('Atualizando dados...');
    await loadData();
    stopLoading();
  }, [isConnected, startLoading, stopLoading, loadData]);

  // Auto-refresh quando conectado
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [isConnected, refresh, refreshInterval]);

  // Conectar automaticamente ao montar
  useEffect(() => {
    connect();
  }, [connect]);

  return {
    data,
    isConnected,
    lastUpdate,
    error,
    isLoading,
    message,
    refresh,
    connect,
    disconnect
  };
};
