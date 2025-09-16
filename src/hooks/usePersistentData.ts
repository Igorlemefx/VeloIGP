// Hook de Dados Persistentes - Sem Loading
// Carrega dados uma única vez e os mantém em memória

import { useState, useEffect, useCallback } from 'react';
import { persistentGlobalCache } from '../services/persistentGlobalCache';
import { debugService } from '../services/debugService';

interface PersistentDataState {
  data: any;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface UsePersistentDataOptions {
  onDataUpdate?: (data: any) => void;
}

export const usePersistentData = ({
  onDataUpdate
}: UsePersistentDataOptions = {}) => {
  const [state, setState] = useState<PersistentDataState>({
    data: null,
    isLoading: false,
    error: null,
    isInitialized: false
  });

  // Função para carregar dados
  const loadData = useCallback(async () => {
    debugService.log('🔄 Iniciando carregamento de dados persistentes');
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const data = await persistentGlobalCache.getData();
      
      setState({
        data,
        isLoading: false,
        error: null,
        isInitialized: true
      });

      if (onDataUpdate) {
        onDataUpdate(data);
      }

      debugService.log('✅ Dados persistentes carregados com sucesso');

    } catch (error) {
      debugService.error('❌ Erro ao carregar dados persistentes', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  }, [onDataUpdate]);

  // Função para recarregar dados
  const reload = useCallback(async () => {
    debugService.log('🔄 Recarregando dados persistentes');
    await persistentGlobalCache.reload();
    await loadData();
  }, [loadData]);

  // Função para limpar cache
  const clearCache = useCallback(() => {
    debugService.log('🗑️ Limpando cache persistente');
    persistentGlobalCache.clearCache();
    setState({
      data: null,
      isLoading: false,
      error: null,
      isInitialized: false
    });
  }, []);

  // Função para limpar erro
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // Carregar dados no mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Escutar mudanças no cache global (com useCallback para evitar re-renders)
  const handleDataUpdate = useCallback((data: any) => {
    debugService.log('📊 Dados atualizados no cache global');
    setState(prev => ({
      ...prev,
      data,
      isInitialized: true
    }));

    if (onDataUpdate) {
      onDataUpdate(data);
    }
  }, [onDataUpdate]);

  useEffect(() => {
    persistentGlobalCache.addListener(handleDataUpdate);

    return () => {
      persistentGlobalCache.removeListener(handleDataUpdate);
    };
  }, [handleDataUpdate]);

  return {
    ...state,
    reload,
    clearCache,
    clearError
  };
};

export default usePersistentData;
