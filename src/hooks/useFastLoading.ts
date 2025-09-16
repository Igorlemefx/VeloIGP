// Hook de Carregamento Rápido - VeloIGP
import { useState, useCallback } from 'react';

interface FastLoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  error: string | null;
}

export const useFastLoading = () => {
  const [state, setState] = useState<FastLoadingState>({
    isLoading: false,
    progress: 0,
    message: 'Carregando...',
    error: null
  });

  const startLoading = useCallback((message: string = 'Carregando...') => {
    setState({
      isLoading: true,
      progress: 0,
      message,
      error: null
    });
  }, []);

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
  }, []);

  const setSuccess = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100,
      error: null
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      message: 'Carregando...',
      error: null
    });
  }, []);

  return {
    ...state,
    startLoading,
    updateProgress,
    setError,
    setSuccess,
    reset
  };
};



