// Componente para verificar status da conexão com Google Sheets
import React, { useState, useEffect, useCallback } from 'react';
import { googleSheetsService } from '../../services/googleSheetsService';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<any>(null);

  const checkConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Verificando conexão com Google Sheets...');
      
      // Testar conexão com a planilha real
      const spreadsheetData = await googleSheetsService.getSpreadsheetData('1IBT4S1_saLE6XbalxWV-FjzPsTFuAaSknbdgKI1FMhM');
      
      if (spreadsheetData && spreadsheetData.length > 0) {
        const sheetData = spreadsheetData[0];
        setSpreadsheetInfo({
          title: 'Nova Base telefonia',
          totalRows: sheetData.rowCount,
          totalColumns: sheetData.colCount,
          lastModified: new Date().toISOString()
        });
        
        setIsConnected(true);
        setLastCheck(new Date());
        onConnectionChange?.(true);
        
        console.log('✅ Conexão com Google Sheets estabelecida com sucesso');
        console.log(`📊 Dados: ${sheetData.rowCount} linhas, ${sheetData.colCount} colunas`);
      } else {
        throw new Error('Nenhum dado encontrado na planilha');
      }
    } catch (error) {
      console.error('❌ Erro na conexão com Google Sheets:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setIsConnected(false);
      setLastCheck(new Date());
      onConnectionChange?.(false);
    } finally {
      setIsLoading(false);
    }
  }, [onConnectionChange]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const getStatusIcon = () => {
    if (isLoading) return '🔄';
    if (isConnected === true) return '✅';
    if (isConnected === false) return '❌';
    return '⏳';
  };

  const getStatusText = () => {
    if (isLoading) return 'Verificando conexão...';
    if (isConnected === true) return 'Conectado com Google Sheets';
    if (isConnected === false) return 'Erro na conexão';
    return 'Aguardando verificação...';
  };

  const getStatusColor = () => {
    if (isLoading) return 'var(--veloacademy-warning)';
    if (isConnected === true) return 'var(--veloacademy-success)';
    if (isConnected === false) return 'var(--veloacademy-error)';
    return 'var(--veloacademy-gray-500)';
  };

  return (
    <div className="connection-status">
      <div className="status-header">
        <div className="status-indicator">
          <span className="status-icon">{getStatusIcon()}</span>
          <span 
            className="status-text"
            style={{ color: getStatusColor() }}
          >
            {getStatusText()}
          </span>
        </div>
        <button 
          className="refresh-btn"
          onClick={checkConnection}
          disabled={isLoading}
        >
          {isLoading ? '🔄' : '🔄'} Atualizar
        </button>
      </div>

      {spreadsheetInfo && (
        <div className="spreadsheet-info">
          <h4>📊 Informações da Planilha</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Título:</span>
              <span className="value">{spreadsheetInfo.title}</span>
            </div>
            <div className="info-item">
              <span className="label">Linhas:</span>
              <span className="value">{spreadsheetInfo.totalRows}</span>
            </div>
            <div className="info-item">
              <span className="label">Colunas:</span>
              <span className="value">{spreadsheetInfo.totalColumns}</span>
            </div>
            <div className="info-item">
              <span className="label">Última verificação:</span>
              <span className="value">
                {lastCheck ? lastCheck.toLocaleTimeString('pt-BR') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-details">
          <h4>❌ Detalhes do Erro</h4>
          <p>{error}</p>
        </div>
      )}

      {isConnected && (
        <div className="success-message">
          <p>🎉 Dados reais da planilha carregados com sucesso!</p>
          <p>O sistema está processando informações atualizadas da operação.</p>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;

