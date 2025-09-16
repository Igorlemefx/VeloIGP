// Hook de Carregamento Otimizado - VeloIGP
import { useState, useEffect, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  error: string | null;
  retryCount: number;
}

interface UseOptimizedLoadingOptions {
  timeout?: number;
  maxRetries?: number;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export const useOptimizedLoading = (options: UseOptimizedLoadingOptions = {}) => {
  const {
    timeout = 15000,
    maxRetries = 3,
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: 'Iniciando carregamento...',
    error: null,
    retryCount: 0
  });

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error,
      progress: 0
    }));
    onError?.(error);
  }, [onError]);

  const setSuccess = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100,
      error: null
    }));
    onSuccess?.();
  }, [onSuccess]);

  const startLoading = useCallback((message: string = 'Carregando...') => {
    setState({
      isLoading: true,
      progress: 0,
      message,
      error: null,
      retryCount: 0
    });
  }, []);

  const retry = useCallback(() => {
    if (state.retryCount >= maxRetries) {
      setError('Número máximo de tentativas excedido');
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      error: null,
      retryCount: prev.retryCount + 1,
      message: `Tentativa ${prev.retryCount + 1} de ${maxRetries}...`
    }));
  }, [state.retryCount, maxRetries, setError]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      message: 'Iniciando carregamento...',
      error: null,
      retryCount: 0
    });
  }, []);

  // Timeout automático
  useEffect(() => {
    if (!state.isLoading) return;

    const timeoutId = setTimeout(() => {
      if (state.progress < 100) {
        setError('Timeout: Carregamento demorou mais que o esperado');
      }
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [state.isLoading, state.progress, timeout, setError]);

  return {
    ...state,
    updateProgress,
    setError,
    setSuccess,
    startLoading,
    retry,
    reset,
    canRetry: state.retryCount < maxRetries
  };
};



