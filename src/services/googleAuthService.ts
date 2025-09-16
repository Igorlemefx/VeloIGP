// Serviço de Autenticação Google OAuth
// Sistema de login com Google para emails específicos

// Declaração global do Google
declare global {
  interface Window {
    google: any;
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  isAuthorized: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface GoogleAuthConfig {
  clientId: string;
  authorizedEmails: string[];
  redirectUri: string;
}

class GoogleAuthService {
  private config: GoogleAuthConfig;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null
  };
  private listeners: ((state: AuthState) => void)[] = [];

  constructor(config: GoogleAuthConfig) {
    this.config = config;
    this.loadStoredAuth();
  }

  // Inicializar Google OAuth
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: this.config.clientId,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true
          });
          resolve();
        } else {
          reject(new Error('Falha ao carregar Google OAuth'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Erro ao carregar script do Google OAuth'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Verificar se o email está autorizado
  private isEmailAuthorized(email: string): boolean {
    return this.config.authorizedEmails.includes(email.toLowerCase());
  }

  // Processar resposta de credenciais do Google
  private handleCredentialResponse(response: any): void {
    try {
      const credential = response.credential;
      const payload = this.parseJwt(credential);
      
      const user: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        isAuthorized: this.isEmailAuthorized(payload.email)
      };

      if (!user.isAuthorized) {
        this.updateAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: `Email ${user.email} não está autorizado para acessar o sistema.`
        });
        return;
      }

      // Salvar no localStorage
      localStorage.setItem('veloigp-auth', JSON.stringify({
        user,
        timestamp: Date.now()
      }));

      this.updateAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null
      });

    } catch (error: any) {
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: `Erro ao processar login: ${error.message}`
      });
    }
  }

  // Decodificar JWT token
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Atualizar estado de autenticação
  private updateAuthState(newState: AuthState): void {
    this.authState = { ...newState };
    this.listeners.forEach(listener => listener(this.authState));
  }

  // Carregar autenticação salva
  private loadStoredAuth(): void {
    try {
      const stored = localStorage.getItem('veloigp-auth');
      if (stored) {
        const { user, timestamp } = JSON.parse(stored);
        
        // Verificar se não expirou (24 horas)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          this.updateAuthState({
            isAuthenticated: true,
            user,
            isLoading: false,
            error: null
          });
        } else {
          this.logout();
        }
      }
    } catch (error) {
      this.logout();
    }
  }

  // Fazer login
  async login(): Promise<void> {
    this.updateAuthState({
      ...this.authState,
      isLoading: true,
      error: null
    });

    try {
      await this.initialize();
      
      if (window.google) {
        window.google.accounts.id.prompt();
      } else {
        throw new Error('Google OAuth não inicializado');
      }
    } catch (error: any) {
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error.message
      });
    }
  }

  // Fazer logout
  logout(): void {
    localStorage.removeItem('veloigp-auth');
    
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }

    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null
    });
  }

  // Obter estado atual
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // Adicionar listener
  addAuthListener(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Retornar função para remover listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Verificar se usuário está autenticado
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  // Obter usuário atual
  getCurrentUser(): User | null {
    return this.authState.user;
  }

  // Verificar se usuário tem permissão
  hasPermission(): boolean {
    return this.authState.isAuthenticated && 
           this.authState.user?.isAuthorized === true;
  }
}

// Configuração do Google OAuth
const googleAuthConfig: GoogleAuthConfig = {
  clientId: 'AIzaSyA-BgGFBY8BTfwqkKlAB92ZM-jvMexmM_A', // Usando a mesma API Key por enquanto
  authorizedEmails: [
    'igor@velotax.com.br',
    'admin@velotax.com.br',
    'suporte@velotax.com.br',
    'dev@velotax.com.br'
  ],
  redirectUri: window.location.origin
};

// Instância global do serviço
export const googleAuthService = new GoogleAuthService(googleAuthConfig);

export default googleAuthService;
