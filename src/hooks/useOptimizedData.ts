// Hook otimizado para carregamento rápido e cache persistente
import { useState, useEffect, useCallback } from 'react';
import { optimizedDataService } from '../services/optimizedDataService';

interface UseOptimizedDataReturn {
  data: any | null;
  isLoading: boolean;
  error: string | null;
  isLoaded: boolean;
  reload: () => Promise<void>;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export const useOptimizedData = (): UseOptimizedDataReturn => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Carregando dados otimizados...');
      const result = await optimizedDataService.getProcessedData(forceRefresh);
      
      setData(result);
      setIsLoaded(true);
      console.log('✅ Dados carregados com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao carregar dados:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  const refreshData = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carregar dados na inicialização
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    isLoaded,
    reload,
    clearError,
    refreshData
  };
};