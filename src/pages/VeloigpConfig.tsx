import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import './VeloigpConfig.css';

interface ConfigData {
  theme: 'light' | 'dark' | 'auto';
  language: 'pt' | 'en' | 'es';
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  dataRefresh: {
    interval: number; // em minutos
    autoRefresh: boolean;
  };
  googleSheets: {
    apiKey: string;
    spreadsheetId: string;
    lastSync: string | null;
  };
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const VeloigpConfig: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [config, setConfig] = useState<ConfigData>({
    theme: 'auto',
    language: 'pt',
    notifications: {
      enabled: true,
      sound: true,
      desktop: false
    },
    dataRefresh: {
      interval: 5,
      autoRefresh: true
    },
    googleSheets: {
      apiKey: '',
      spreadsheetId: '',
      lastSync: null
    },
    user: {
      name: '',
      email: '',
      role: 'Administrador'
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'account' | 'advanced'>('general');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    try {
      const savedConfig = localStorage.getItem('veloigp_config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsedConfig }));
      }
      
      // Carregar configurações do Google Sheets
      const sheetsConfig = {
        apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
        spreadsheetId: '1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM'
      };
      
      setConfig(prev => ({
        ...prev,
        googleSheets: { ...prev.googleSheets, ...sheetsConfig }
      }));
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('veloigp_config', JSON.stringify(config));
      
      // Aplicar tema se mudou
      if (config.theme !== 'auto') {
        setTheme(config.theme);
      }
      
      showSuccess('Configurações Salvas', 'Suas configurações foram salvas com sucesso!');
    } catch (error) {
      showError('Erro ao Salvar', 'Não foi possível salvar as configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const resetConfig = () => {
    if (window.confirm('Tem certeza que deseja resetar todas as configurações?')) {
      localStorage.removeItem('veloigp_config');
      loadConfig();
      showInfo('Configurações Resetadas', 'Todas as configurações foram restauradas para o padrão');
    }
  };

  const testGoogleSheetsConnection = async () => {
    if (!config.googleSheets.apiKey) {
      showError('API Key Necessária', 'Configure a API Key do Google Sheets primeiro');
      return;
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.googleSheets.spreadsheetId}/values/A1:AN1?key=${config.googleSheets.apiKey}`;
      const response = await fetch(url);
      
      if (response.ok) {
        showSuccess('Conexão OK', 'Conexão com Google Sheets estabelecida com sucesso!');
        setConfig(prev => ({
          ...prev,
          googleSheets: {
            ...prev.googleSheets,
            lastSync: new Date().toISOString()
          }
        }));
      } else {
        showError('Erro de Conexão', 'Não foi possível conectar com a planilha');
      }
    } catch (error) {
      showError('Erro de Conexão', 'Erro ao testar conexão com Google Sheets');
    }
  };

  const handleInputChange = (section: keyof ConfigData, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: keyof ConfigData, subsection: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="veloigp-config">
      <div className="config-header">
        <h1 className="velotax-title-1">
          <i className="fas fa-cog"></i>
          Configurações do Sistema
        </h1>
        <p>Gerencie as configurações e preferências do VeloIGP</p>
      </div>

      <div className="config-container">
        {/* Navegação por Abas */}
        <div className="config-tabs">
          <button 
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="fas fa-sliders-h"></i>
            Geral
          </button>
          <button 
            className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <i className="fas fa-database"></i>
            Dados
          </button>
          <button 
            className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <i className="fas fa-user"></i>
            Conta
          </button>
          <button 
            className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            <i className="fas fa-tools"></i>
            Avançado
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="config-content">
          {activeTab === 'general' && (
            <div className="config-section">
              <h3>
                <i className="fas fa-palette"></i>
                Aparência e Interface
              </h3>
              
              <div className="config-group">
                <label>Tema do Sistema</label>
                <select 
                  value={config.theme} 
                  onChange={(e) => handleInputChange('theme', 'theme', e.target.value)}
                >
                  <option value="auto">Automático</option>
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>

              <div className="config-group">
                <label>Idioma</label>
                <select 
                  value={config.language} 
                  onChange={(e) => handleInputChange('language', 'language', e.target.value)}
                >
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <h3>
                <i className="fas fa-bell"></i>
                Notificações
              </h3>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={config.notifications.enabled}
                    onChange={(e) => handleNestedInputChange('notifications', 'notifications', 'enabled', e.target.checked)}
                  />
                  <span>Habilitar notificações</span>
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={config.notifications.sound}
                    onChange={(e) => handleNestedInputChange('notifications', 'notifications', 'sound', e.target.checked)}
                  />
                  <span>Som nas notificações</span>
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={config.notifications.desktop}
                    onChange={(e) => handleNestedInputChange('notifications', 'notifications', 'desktop', e.target.checked)}
                  />
                  <span>Notificações do desktop</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="config-section">
              <h3>
                <i className="fas fa-sync-alt"></i>
                Atualização de Dados
              </h3>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={config.dataRefresh.autoRefresh}
                    onChange={(e) => handleNestedInputChange('dataRefresh', 'dataRefresh', 'autoRefresh', e.target.checked)}
                  />
                  <span>Atualização automática</span>
                </label>
              </div>

              <div className="config-group">
                <label>Intervalo de atualização (minutos)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={config.dataRefresh.interval}
                  onChange={(e) => handleNestedInputChange('dataRefresh', 'dataRefresh', 'interval', parseInt(e.target.value))}
                />
              </div>

              <h3>
                <i className="fab fa-google"></i>
                Google Sheets
              </h3>

              <div className="config-group">
                <label>API Key do Google Sheets</label>
                <input 
                  type="password" 
                  value={config.googleSheets.apiKey}
                  onChange={(e) => handleNestedInputChange('googleSheets', 'googleSheets', 'apiKey', e.target.value)}
                  placeholder="Digite sua API Key"
                />
              </div>

              <div className="config-group">
                <label>ID da Planilha</label>
                <input 
                  type="text" 
                  value={config.googleSheets.spreadsheetId}
                  onChange={(e) => handleNestedInputChange('googleSheets', 'googleSheets', 'spreadsheetId', e.target.value)}
                  placeholder="ID da planilha do Google Sheets"
                />
              </div>

              <div className="config-group">
                <button 
                  className="btn btn-secondary"
                  onClick={testGoogleSheetsConnection}
                >
                  <i className="fas fa-plug"></i>
                  Testar Conexão
                </button>
              </div>

              {config.googleSheets.lastSync && (
                <div className="config-info">
                  <i className="fas fa-info-circle"></i>
                  Última sincronização: {new Date(config.googleSheets.lastSync).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'account' && (
            <div className="config-section">
              <h3>
                <i className="fas fa-user-circle"></i>
                Informações da Conta
              </h3>

              <div className="config-group">
                <label>Nome do Usuário</label>
                <input 
                  type="text" 
                  value={config.user.name}
                  onChange={(e) => handleNestedInputChange('user', 'user', 'name', e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="config-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={config.user.email}
                  onChange={(e) => handleNestedInputChange('user', 'user', 'email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="config-group">
                <label>Função</label>
                <select 
                  value={config.user.role}
                  onChange={(e) => handleNestedInputChange('user', 'user', 'role', e.target.value)}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Operador">Operador</option>
                  <option value="Visualizador">Visualizador</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="config-section">
              <h3>
                <i className="fas fa-cogs"></i>
                Configurações Avançadas
              </h3>

              <div className="config-group">
                <label>Cache de Dados</label>
                <button 
                  className="btn btn-warning"
                  onClick={() => {
                    localStorage.removeItem('veloigp_cache');
                    showInfo('Cache Limpo', 'Cache de dados foi limpo com sucesso');
                  }}
                >
                  <i className="fas fa-trash"></i>
                  Limpar Cache
                </button>
              </div>

              <div className="config-group">
                <label>Logs do Sistema</label>
                <button 
                  className="btn btn-info"
                  onClick={() => {
                    console.log('Logs do sistema:', {
                      config,
                      timestamp: new Date().toISOString(),
                      userAgent: navigator.userAgent
                    });
                    showInfo('Logs Exportados', 'Logs foram exportados para o console do navegador');
                  }}
                >
                  <i className="fas fa-download"></i>
                  Exportar Logs
                </button>
              </div>

              <div className="config-group">
                <label>Reset Completo</label>
                <button 
                  className="btn btn-danger"
                  onClick={resetConfig}
                >
                  <i className="fas fa-exclamation-triangle"></i>
                  Resetar Configurações
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="config-actions">
          <button 
            className="btn btn-primary"
            onClick={saveConfig}
            disabled={isLoading}
          >
            <i className="fas fa-save"></i>
            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={loadConfig}
          >
            <i className="fas fa-undo"></i>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VeloigpConfig;
