import { useState, useEffect, useCallback } from 'react';
import api55pbxRealService from '../services/api55pbxRealService';

interface UseRealApiDataResult {
  // Dados
  operators: any[];
  calls: any[];
  queues: any[];
  metrics: any;
  
  // Estados
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  lastSync: Date | null;
  
  // Ações
  refreshData: () => Promise<void>;
  clearError: () => void;
  checkConnection: () => Promise<boolean>;
}

export function useRealApiData(): UseRealApiDataResult {
  const [operators, setOperators] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [queues, setQueues] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Carregar todos os dados
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar conexão primeiro
      const connected = await api55pbxRealService.checkConnection();
      setIsConnected(connected);

      if (!connected) {
        throw new Error('Não foi possível conectar com a API 55PBX');
      }

      // Carregar dados em paralelo
      const [operatorsData, callsData, queuesData, metricsData] = await Promise.all([
        api55pbxRealService.getOperators(),
        api55pbxRealService.getCalls(),
        api55pbxRealService.getQueues(),
        api55pbxRealService.getMetrics()
      ]);

      setOperators(operatorsData);
      setCalls(callsData);
      setQueues(queuesData);
      setMetrics(metricsData);
      setLastSync(new Date());

      console.log('✅ Dados carregados com sucesso da API 55PBX');
    } catch (err: any) {
      console.error('❌ Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados da API 55PBX');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar conexão
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const connected = await api55pbxRealService.checkConnection();
      setIsConnected(connected);
      return connected;
    } catch (err) {
      console.error('❌ Erro ao verificar conexão:', err);
      setIsConnected(false);
      return false;
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Atualizar dados
  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Atualizar dados automaticamente a cada 30 segundos
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      loadAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, loadAllData]);

  return {
    operators,
    calls,
    queues,
    metrics,
    isLoading,
    error,
    isConnected,
    lastSync,
    refreshData,
    clearError,
    checkConnection
  };
}

export default useRealApiData;


