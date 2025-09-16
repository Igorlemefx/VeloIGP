// Hook de Dados Instantâneos
// Sempre retorna dados imediatamente

import { useState, useEffect, useCallback } from 'react';
import { instantDataService } from '../services/instantDataService';

interface UseInstantDataState {
  data: any;
  isLoading: boolean;
  error: string | null;
  isLoaded: boolean;
}

export const useInstantData = () => {
  const [state, setState] = useState<UseInstantDataState>({
    data: null,
    isLoading: false,
    error: null,
    isLoaded: false
  });

  // Carregar dados instantâneos
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Simular um pequeno delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 500));

      const data = await instantDataService.getInstantData();
      
      setState({
        data,
        isLoading: false,
        error: null,
        isLoaded: true
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  }, []);

  // Recarregar dados
  const reload = useCallback(async () => {
    instantDataService.clearCache();
    await loadData();
  }, [loadData]);

  // Limpar erro
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Carregar dados no mount
  useEffect(() => {
    if (!state.isLoaded && !state.isLoading) {
      loadData();
    }
  }, [loadData, state.isLoaded, state.isLoading]);

  return {
    ...state,
    reload,
    clearError,
    loadData
  };
};

export default useInstantData;



