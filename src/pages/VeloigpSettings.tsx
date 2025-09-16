import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import GoogleLoginButton from '../components/GoogleLoginButton';
import './VeloigpSettings.css';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'pt-BR' | 'en-US';
  timezone: string;
}

const VeloigpSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { isAuthenticated, user, logout, hasPermission } = useGoogleAuth();

  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('veloigp-user-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  // Verificar mudanças não salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('veloigp-user-settings');
    if (savedSettings) {
      try {
        const saved = JSON.parse(savedSettings);
        const hasChanges = JSON.stringify(saved) !== JSON.stringify(settings);
        setHasUnsavedChanges(hasChanges);
      } catch (error) {
        setHasUnsavedChanges(true);
      }
    } else {
      setHasUnsavedChanges(true);
    }
  }, [settings]);

  const handleInputChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      
      localStorage.setItem('veloigp-user-settings', JSON.stringify(settings));
      
      // Aplicar tema se mudou
      if (settings.theme !== 'system') {
        setTheme(settings.theme);
      }
      
      setHasUnsavedChanges(false);
      showSuccess('Configurações Salvas', 'Suas configurações foram salvas com sucesso!');
    } catch (error: any) {
      showError('Erro ao Salvar', 'Não foi possível salvar as configurações.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      theme: 'system',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    });
    setHasUnsavedChanges(true);
    showSuccess('Padrões Restaurados', 'As configurações foram restauradas para os valores padrão.');
  };

  const handleLoginSuccess = () => {
    showSuccess('Login Realizado', `Bem-vindo, ${user?.name}!`);
  };

  const handleLoginError = (error: string) => {
    showError('Erro no Login', error);
  };

  const handleLogout = () => {
    logout();
    showSuccess('Logout Realizado', 'Você foi desconectado com sucesso.');
  };

  return (
    <div className="veloigp-settings">
      <div className="settings-header">
        <h1 className="velotax-title-1">
          <i className="fas fa-cog"></i>
          Configurações do Sistema
        </h1>
        <p className="velotax-text-body">
          Gerencie suas preferências pessoais e configurações de acesso.
        </p>
      </div>

      <div className="settings-content">
        {/* Seção de Autenticação */}
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-user-shield"></i>
              Autenticação e Acesso
            </h2>
            <p>Gerencie seu acesso ao sistema VeloIGP</p>
          </div>

          <div className="auth-container">
            {isAuthenticated && hasPermission() ? (
              <div className="user-info">
                <div className="user-avatar">
                  <img 
                    src={user?.picture || '/default-avatar.png'} 
                    alt={user?.name || 'Usuário'}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="avatar-fallback" style={{ display: 'none' }}>
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <div className="user-details">
                  <h3>{user?.name}</h3>
                  <p>{user?.email}</p>
                  <span className="user-status authorized">
                    <i className="fas fa-check-circle"></i>
                    Acesso Autorizado
                  </span>
                </div>
                <button 
                  className="btn btn-secondary"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Sair
                </button>
              </div>
            ) : (
              <div className="login-section">
                <div className="login-info">
                  <h3>Faça login para acessar o sistema</h3>
                  <p>
                    Use sua conta Google para acessar o VeloIGP. 
                    Apenas emails autorizados podem acessar o sistema.
                  </p>
                  <div className="authorized-emails">
                    <h4>Emails autorizados:</h4>
                    <ul>
                      <li>igor@velotax.com.br</li>
                      <li>admin@velotax.com.br</li>
                      <li>suporte@velotax.com.br</li>
                      <li>dev@velotax.com.br</li>
                    </ul>
                  </div>
                </div>
                <GoogleLoginButton 
                  onLoginSuccess={handleLoginSuccess}
                  onLoginError={handleLoginError}
                />
              </div>
            )}
          </div>
        </div>

        {/* Seção de Preferências */}
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-palette"></i>
              Preferências de Interface
            </h2>
            <p>Personalize a aparência e comportamento da aplicação</p>
          </div>

          <div className="preferences-grid">
            <div className="preference-item">
              <label htmlFor="theme">
                <i className="fas fa-moon"></i>
                Tema da Interface
              </label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => handleInputChange('theme', e.target.value as 'light' | 'dark' | 'system')}
                className="velotax-input"
              >
                <option value="system">Sistema (Automático)</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
              <p className="preference-description">
                Escolha como a interface será exibida. O modo sistema segue as configurações do seu dispositivo.
              </p>
            </div>

            <div className="preference-item">
              <label htmlFor="language">
                <i className="fas fa-globe"></i>
                Idioma
              </label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) => handleInputChange('language', e.target.value as 'pt-BR' | 'en-US')}
                className="velotax-input"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
              </select>
              <p className="preference-description">
                Selecione o idioma preferido para a interface do sistema.
              </p>
            </div>

            <div className="preference-item">
              <label htmlFor="timezone">
                <i className="fas fa-clock"></i>
                Fuso Horário
              </label>
              <input
                id="timezone"
                type="text"
                value={settings.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="velotax-input"
                placeholder="Ex: America/Sao_Paulo"
              />
              <p className="preference-description">
                Configure o fuso horário para exibição correta de datas e horários.
              </p>
            </div>
          </div>
        </div>

        {/* Seção de Informações do Sistema */}
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-info-circle"></i>
              Informações do Sistema
            </h2>
            <p>Detalhes sobre a versão e configurações do VeloIGP</p>
          </div>

          <div className="system-info">
            <div className="info-item">
              <span className="info-label">Versão:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Última Atualização:</span>
              <span className="info-value">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value status-online">
                <i className="fas fa-circle"></i>
                Online
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Conexão Planilha:</span>
              <span className="info-value status-connected">
                <i className="fas fa-check-circle"></i>
                Conectado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="settings-actions">
        {hasUnsavedChanges && (
          <div className="unsaved-changes">
            <i className="fas fa-exclamation-triangle"></i>
            Alterações não salvas
          </div>
        )}
        
        <button
          className="btn btn-secondary"
          onClick={resetToDefaults}
          disabled={isLoading}
        >
          <i className="fas fa-undo"></i>
          Restaurar Padrões
        </button>
        
        <button
          className="btn btn-primary"
          onClick={saveSettings}
          disabled={isLoading || !hasUnsavedChanges}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Salvando...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i>
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VeloigpSettings;