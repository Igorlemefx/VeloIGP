// Serviço de Autenticação API 55PBX
// Gerenciamento de tokens e autenticação OAuth2

import { api55pbxConfig, api55pbxEndpoints, getDefaultHeaders } from '../config/api55pbxConfig';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  scope: string | null;
}

class Api55pbxAuthService {
  private static instance: Api55pbxAuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    scope: null
  };

  private constructor() {
    this.loadAuthState();
  }

  static getInstance(): Api55pbxAuthService {
    if (!Api55pbxAuthService.instance) {
      Api55pbxAuthService.instance = new Api55pbxAuthService();
    }
    return Api55pbxAuthService.instance;
  }

  /**
   * Iniciar processo de autenticação OAuth2
   */
  initiateAuth(): void {
    const authUrl = new URL(`${api55pbxConfig.baseUrl}${api55pbxEndpoints.auth.authorize}`);
    authUrl.searchParams.set('client_id', api55pbxConfig.clientId);
    authUrl.searchParams.set('redirect_uri', api55pbxConfig.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', api55pbxConfig.scopes.join(' '));
    authUrl.searchParams.set('state', this.generateState());

    console.log('🔐 Iniciando autenticação 55PBX...');
    window.location.href = authUrl.toString();
  }

  /**
   * Trocar código de autorização por token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<boolean> {
    try {
      console.log('🔄 Trocando código por token...');

      const response = await fetch(`${api55pbxConfig.baseUrl}${api55pbxEndpoints.auth.token}`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: api55pbxConfig.clientId,
          client_secret: api55pbxConfig.clientSecret,
          redirect_uri: api55pbxConfig.redirectUri,
          code: code
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na autenticação: ${response.status} ${response.statusText}`);
      }

      const tokenData: TokenResponse = await response.json();
      
      this.authState = {
        isAuthenticated: true,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
        scope: tokenData.scope
      };

      this.saveAuthState();
      console.log('✅ Autenticação 55PBX realizada com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro na autenticação 55PBX:', error);
      return false;
    }
  }

  /**
   * Renovar token de acesso
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.authState.refreshToken) {
      console.warn('⚠️ Nenhum refresh token disponível');
      return false;
    }

    try {
      console.log('🔄 Renovando token de acesso...');

      const response = await fetch(`${api55pbxConfig.baseUrl}${api55pbxEndpoints.auth.refresh}`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: api55pbxConfig.clientId,
          client_secret: api55pbxConfig.clientSecret,
          refresh_token: this.authState.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao renovar token: ${response.status} ${response.statusText}`);
      }

      const tokenData: TokenResponse = await response.json();
      
      this.authState.accessToken = tokenData.access_token;
      this.authState.expiresAt = Date.now() + (tokenData.expires_in * 1000);
      
      if (tokenData.refresh_token) {
        this.authState.refreshToken = tokenData.refresh_token;
      }

      this.saveAuthState();
      console.log('✅ Token renovado com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Verificar se token está válido
   */
  isTokenValid(): boolean {
    if (!this.authState.isAuthenticated || !this.authState.accessToken || !this.authState.expiresAt) {
      return false;
    }

    // Verificar se token expira em menos de 5 minutos
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return this.authState.expiresAt > fiveMinutesFromNow;
  }

  /**
   * Obter token de acesso válido
   */
  async getValidToken(): Promise<string | null> {
    if (!this.isTokenValid()) {
      console.log('🔄 Token expirado, tentando renovar...');
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        return null;
      }
    }

    return this.authState.accessToken;
  }

  /**
   * Fazer logout
   */
  logout(): void {
    this.authState = {
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      scope: null
    };
    this.saveAuthState();
    console.log('🚪 Logout realizado');
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated && this.isTokenValid();
  }

  /**
   * Obter estado da autenticação
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Salvar estado no localStorage
   */
  private saveAuthState(): void {
    try {
      localStorage.setItem('api55pbx_auth', JSON.stringify(this.authState));
    } catch (error) {
      console.error('❌ Erro ao salvar estado de autenticação:', error);
    }
  }

  /**
   * Carregar estado do localStorage
   */
  private loadAuthState(): void {
    try {
      const saved = localStorage.getItem('api55pbx_auth');
      if (saved) {
        this.authState = JSON.parse(saved);
        // Verificar se token ainda é válido
        if (!this.isTokenValid()) {
          this.logout();
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estado de autenticação:', error);
      this.logout();
    }
  }

  /**
   * Gerar state para OAuth2
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export const api55pbxAuthService = Api55pbxAuthService.getInstance();
export default api55pbxAuthService;



