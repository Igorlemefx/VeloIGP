import React, { useState, useEffect, useCallback } from 'react';
import './Toast.css';

export interface PropsToast {
  id: string;
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  titulo: string;
  mensagem?: string;
  duracao?: number;
  aoFechar: (id: string) => void;
  acao?: {
    rotulo: string;
    aoClicar: () => void;
  };
}

const Toast: React.FC<PropsToast> = ({
  id,
  tipo,
  titulo,
  mensagem,
  duracao = 5000,
  aoFechar,
  acao
}) => {
  const [visivel, setVisivel] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const fechar = useCallback(() => {
    setSaindo(true);
    setTimeout(() => {
      aoFechar(id);
    }, 300);
  }, [id, aoFechar]);

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setVisivel(true), 100);
    
    // Fechar automaticamente
    if (duracao > 0) {
      const timerFechar = setTimeout(() => {
        fechar();
      }, duracao);
      
      return () => clearTimeout(timerFechar);
    }
    
    return () => clearTimeout(timer);
  }, [duracao, fechar]);

  const obterIcone = () => {
    switch (tipo) {
      case 'sucesso':
        return 'fas fa-check-circle';
      case 'erro':
        return 'fas fa-times-circle';
      case 'aviso':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-info-circle';
    }
  };

  return (
    <div 
      className={`toast toast--${tipo} ${visivel ? 'toast--visible' : ''} ${saindo ? 'toast--leaving' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__content">
        <div className="toast__icon">
          <i className={obterIcone()}></i>
        </div>
        <div className="toast__text">
          <div className="toast__title">{titulo}</div>
          {mensagem && <div className="toast__message">{mensagem}</div>}
        </div>
        <button 
          className="toast__close"
          onClick={fechar}
          aria-label="Fechar notificação"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      {acao && (
        <div className="toast__action">
          <button 
            className="toast__action-button"
            onClick={acao.aoClicar}
          >
            {acao.rotulo}
          </button>
        </div>
      )}
    </div>
  );
};

export default Toast;
