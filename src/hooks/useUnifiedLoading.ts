// Hook Unificado de Loading com Cache Inteligente
import { useState, useEffect, useCallback, useRef } from 'react';
import { persistentCacheService } from '../services/persistentCacheService';

interface LoadingState {
  isLoading: boolean;
  data: any;
  error: string | null;
  progress: number;
  message: string;
}

interface UseUnifiedLoadingOptions {
  cacheKey: string;
  fetcher: () => Promise<any>;
  ttl?: number; // Time to live em ms
  autoLoad?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
}

export const useUnifiedLoading = ({
  cacheKey,
  fetcher,
  ttl = 30 * 60 * 1000, // 30 minutos
  autoLoad = true,
  retryOnError = true,
  maxRetries = 3
}: UseUnifiedLoadingOptions) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    data: null,
    error: null,
    progress: 0,
    message: 'Carregando dados...'
  });

  const retryCount = useRef(0);
  const isMounted = useRef(true);
  const currentProgress = useRef(0);

  // Função para atualizar estado
  const updateState = useCallback((updates: Partial<LoadingState>) => {
    if (isMounted.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Função para carregar dados
  const loadData = useCallback(async (forceRefresh = false) => {
    // Se já está carregando, não carregar novamente
    if (state.isLoading) {
      return;
    }

    // Se não forçar refresh, tentar obter do cache
    if (!forceRefresh) {
      const cachedData = persistentCacheService.get(cacheKey);
      if (cachedData) {
        updateState({
          data: cachedData,
          isLoading: false,
          error: null,
          progress: 100
        });
        return;
      }
    }

    // Iniciar carregamento
    currentProgress.current = 0;
    updateState({
      isLoading: true,
      error: null,
      progress: 0,
      message: 'Carregando dados...'
    });

    try {
      // Simular progresso mais realista
      const progressInterval = setInterval(() => {
        currentProgress.current = Math.min(currentProgress.current + 5, 85);
        updateState({
          progress: currentProgress.current
        });
      }, 100);

      // Buscar dados com progresso em etapas
      updateState({ message: 'Conectando com o servidor...', progress: 15 });
      await new Promise(resolve => setTimeout(resolve, 200));
      
      updateState({ message: 'Carregando dados...', progress: 30 });
      const data = await fetcher();

      clearInterval(progressInterval);

      updateState({ message: 'Processando dados...', progress: 70 });
      await new Promise(resolve => setTimeout(resolve, 300));

      // Armazenar no cache
      persistentCacheService.set(cacheKey, data, ttl);

      updateState({ message: 'Finalizando...', progress: 90 });
      await new Promise(resolve => setTimeout(resolve, 200));

      // Atualizar estado final
      updateState({
        data,
        isLoading: false,
        error: null,
        progress: 100,
        message: 'Dados carregados com sucesso!'
      });

      // Reset retry count
      retryCount.current = 0;

    } catch (error) {
      console.error(`❌ Erro ao carregar dados para ${cacheKey}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      updateState({
        isLoading: false,
        error: errorMessage,
        progress: 0,
        message: 'Erro ao carregar dados'
      });

      // Retry automático se habilitado
      if (retryOnError && retryCount.current < maxRetries) {
        retryCount.current++;
        console.log(`🔄 Tentativa ${retryCount.current}/${maxRetries} para ${cacheKey}`);
        
        setTimeout(() => {
          if (isMounted.current) {
            loadData(true);
          }
        }, 2000 * retryCount.current); // Delay progressivo
      }
    }
  }, [cacheKey, fetcher, ttl, state.isLoading, retryOnError, maxRetries, updateState]);

  // Função para recarregar dados
  const reload = useCallback(() => {
    retryCount.current = 0;
    loadData(true);
  }, [loadData]);

  // Função para limpar cache
  const clearCache = useCallback(() => {
    persistentCacheService.delete(cacheKey);
    updateState({
      data: null,
      error: null,
      progress: 0
    });
  }, [cacheKey, updateState]);

  // Função para limpar erro
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Auto-load no mount
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }

    return () => {
      isMounted.current = false;
    };
  }, [autoLoad, loadData]);

  // Limpar cache quando componente desmontar
  useEffect(() => {
    return () => {
      // Não limpar cache automaticamente - manter para próxima sessão
    };
  }, []);

  return {
    ...state,
    reload,
    clearCache,
    clearError,
    isCached: persistentCacheService.has(cacheKey),
    cacheStats: persistentCacheService.getStats()
  };
};

export default useUnifiedLoading;
