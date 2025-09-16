import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export const useLoading = (initialState: LoadingState = { isLoading: false }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>(initialState);

  const startLoading = useCallback((message?: string) => {
    setLoadingState({
      isLoading: true,
      message
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      message: undefined
    });
  }, []);

  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    setLoadingState({
      isLoading,
      message
    });
  }, []);

  return {
    isLoading: loadingState.isLoading,
    message: loadingState.message,
    startLoading,
    stopLoading,
    setLoading
  };
};