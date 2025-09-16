import { useState, useCallback } from 'react';
import { PropsToast } from '../components/ui/Toast';

let idToast = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<PropsToast[]>([]);

  const removerToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const limparToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const adicionarToast = useCallback((toast: Omit<PropsToast, 'id' | 'aoFechar'>) => {
    const id = `toast-${++idToast}`;
    const novoToast: PropsToast = {
      ...toast,
      id,
      aoFechar: removerToast
    };
    
    setToasts(prev => [...prev, novoToast]);
    return id;
  }, [removerToast]);

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<PropsToast>) => {
    return adicionarToast({
      tipo: 'sucesso',
      titulo: title,
      mensagem: message,
      duracao: options?.duracao,
      acao: options?.acao
    });
  }, [adicionarToast]);

  const showError = useCallback((title: string, message?: string, options?: Partial<PropsToast>) => {
    return adicionarToast({
      tipo: 'erro',
      titulo: title,
      mensagem: message,
      duracao: options?.duracao,
      acao: options?.acao
    });
  }, [adicionarToast]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<PropsToast>) => {
    return adicionarToast({
      tipo: 'aviso',
      titulo: title,
      mensagem: message,
      duracao: options?.duracao,
      acao: options?.acao
    });
  }, [adicionarToast]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<PropsToast>) => {
    return adicionarToast({
      tipo: 'info',
      titulo: title,
      mensagem: message,
      duracao: options?.duracao,
      acao: options?.acao
    });
  }, [adicionarToast]);

  return {
    toasts,
    adicionarToast,
    removerToast,
    limparToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
