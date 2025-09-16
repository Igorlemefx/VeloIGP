import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log do erro para monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Aqui você pode enviar o erro para um serviço de monitoramento
      console.error('Erro em produção:', { error, errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Ops! Algo deu errado</h2>
            <p>Ocorreu um erro inesperado. Nossa equipe foi notificada.</p>
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-redo"></i>
                Recarregar Página
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
              >
                <i className="fas fa-times"></i>
                Tentar Novamente
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Detalhes do Erro (Desenvolvimento)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
