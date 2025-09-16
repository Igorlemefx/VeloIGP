import { useState, useEffect } from 'react';
import { googleAuthService, AuthState, User } from '../services/googleAuthService';

export interface UseGoogleAuthReturn {
  // Estado
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Métodos
  login: () => Promise<void>;
  logout: () => void;
  hasPermission: () => boolean;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>(googleAuthService.getAuthState());

  useEffect(() => {
    // Adicionar listener para mudanças de estado
    const removeListener = googleAuthService.addAuthListener((newState) => {
      setAuthState(newState);
    });

    // Inicializar o serviço
    googleAuthService.initialize().catch(console.error);

    return () => {
      removeListener();
    };
  }, []);

  const login = async (): Promise<void> => {
    try {
      await googleAuthService.login();
    } catch (error: any) {
      console.error('Erro no login:', error);
    }
  };

  const logout = (): void => {
    googleAuthService.logout();
  };

  const hasPermission = (): boolean => {
    return googleAuthService.hasPermission();
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout,
    hasPermission
  };
};

export default useGoogleAuth;
