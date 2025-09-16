import { useState, useEffect, useCallback } from 'react';
import { mcpGoogleSheetsService, MCPResponse } from '../services/mcpGoogleSheetsService';

export interface UseMCPGoogleSheetsReturn {
  // Estado
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  
  // Dados
  rawData: any[] | null;
  processedData: any[] | null;
  metrics: any | null;
  headers: string[] | null;
  
  // Métodos
  initialize: () => Promise<void>;
  readSpreadsheet: (range?: string) => Promise<void>;
  readSheet: (sheetName: string, range?: string) => Promise<void>;
  listSheets: () => Promise<void>;
  getMetadata: () => Promise<void>;
  testConnection: () => Promise<void>;
  processDataForAnalysis: (range?: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useMCPGoogleSheets = (): UseMCPGoogleSheetsReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const [rawData, setRawData] = useState<any[] | null>(null);
  const [processedData, setProcessedData] = useState<any[] | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [headers, setHeaders] = useState<string[] | null>(null);

  // Ler dados da planilha
  const readSpreadsheet = useCallback(async (range: string = 'A:AN') => {
    if (!isInitialized) {
      setError('MCP Service não inicializado');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response: MCPResponse = await mcpGoogleSheetsService.readSpreadsheet(range);
      
      if (response.success) {
        setRawData(response.data.data);
        setHeaders(response.data.headers);
        setLastUpdate(new Date());
        console.log('✅ Dados da planilha lidos:', response.data);
      } else {
        setError(response.error || 'Erro ao ler planilha');
        console.error('❌ Erro ao ler planilha:', response.error);
      }
    } catch (err: any) {
      setError(`Erro ao ler planilha: ${err.message}`);
      console.error('❌ Erro ao ler planilha:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Inicializar o serviço MCP
  const initialize = useCallback(async () => {
    console.log('🔄 Iniciando MCP Google Sheets Service...');
    setIsLoading(true);
    setError(null);
    
    try {
      const response: MCPResponse = await mcpGoogleSheetsService.initialize();
      
      if (response.success) {
        setIsInitialized(true);
        setLastUpdate(new Date());
        console.log('✅ MCP Google Sheets Service inicializado:', response.data);
        
        // Após inicializar, carregar dados automaticamente
        console.log('🔄 Carregando dados da planilha...');
        await readSpreadsheet();
      } else {
        setError(response.error || 'Erro desconhecido ao inicializar MCP Service');
        console.error('❌ Erro ao inicializar MCP Service:', response.error);
      }
    } catch (err: any) {
      setError(`Erro ao inicializar MCP Service: ${err.message}`);
      console.error('❌ Erro ao inicializar MCP Service:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ler dados de uma aba específica
  const readSheet = useCallback(async (sheetName: string, range?: string) => {
    if (!isInitialized) {
      setError('MCP Service não inicializado');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response: MCPResponse = await mcpGoogleSheetsService.readSheet(sheetName, range);
      
      if (response.success) {
        setRawData(response.data.data);
        setHeaders(response.data.headers);
        setLastUpdate(new Date());
        console.log('✅ Dados da aba lidos:', response.data);
      } else {
        setError(response.error || 'Erro ao ler aba');
        console.error('❌ Erro ao ler aba:', response.error);
      }
    } catch (err: any) {
      setError(`Erro ao ler aba: ${err.message}`);
      console.error('❌ Erro ao ler aba:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Listar abas da planilha
  const listSheets = useCallback(async () => {
    if (!isInitialized) {
      setError('MCP Service não inicializado');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response: MCPResponse = await mcpGoogleSheetsService.listSheets();
      
      if (response.success) {
        console.log('✅ Abas da planilha:', response.data);
        setLastUpdate(new Date());
      } else {
        setError(response.error || 'Erro ao listar abas');
        console.error('❌ Erro ao listar abas:', response.error);
      }
    } catch (err: any) {
      setError(`Erro ao listar abas: ${err.message}`);
      console.error('❌ Erro ao listar abas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Obter metadados da planilha
  const getMetadata = useCallback(async () => {
    if (!isInitialized) {
      setError('MCP Service não inicializado');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response: MCPResponse = await mcpGoogleSheetsService.getSpreadsheetMetadata();
      
      if (response.success) {
        console.log('✅ Metadados da planilha:', response.data);
        setLastUpdate(new Date());
      } else {
        setError(response.error || 'Erro ao obter metadados');
        console.error('❌ Erro ao obter metadados:', response.error);
      }
    } catch (err: any) {
      setError(`Erro ao obter metadados: ${err.message}`);
      console.error('❌ Erro ao obter metadados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Testar conexão
  const testConnection = useCallback(async () => {
    if (!isInitialized) {
      setError('MCP Service não inicializado');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response: MCPResponse = await mcpGoogleSheetsService.testConnection();
      
      if (response.success) {
        console.log('✅ Conexão testada com sucesso:', response.data);
        setLastUpdate(new Date());
      } else {
        setError(response.error || 'Erro ao testar conexão');
        console.error('❌ Erro ao testar conexão:', response.error);
      }
    } catch (err: any) {
      setError(`Erro ao testar conexão: ${err.message}`);
      console.error('❌ Erro ao testar conexão:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Processar dados para análise
  const processDataForAnalysis = useCallback(async (range: string = 'A:AN') => {
    console.log('🔄 Processando dados para análise...', { isInitialized, range });
    
    if (!isInitialized) {
      setError('MCP Service não inicializado');
      console.error('❌ MCP Service não inicializado');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response: MCPResponse = await mcpGoogleSheetsService.processDataForAnalysis(range);
      
      if (response.success) {
        setProcessedData(response.data.processedData);
        setMetrics(response.data.metrics);
        setHeaders(response.data.headers);
        setLastUpdate(new Date());
        console.log('✅ Dados processados para análise:', response.data);
      } else {
        setError(response.error || 'Erro ao processar dados');
        console.error('❌ Erro ao processar dados:', response.error);
      }
    } catch (err: any) {
      setError(`Erro ao processar dados: ${err.message}`);
      console.error('❌ Erro ao processar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Atualizar todos os dados
  const refresh = useCallback(async () => {
    if (!isInitialized) {
      await initialize();
    }
    
    if (isInitialized) {
      await processDataForAnalysis();
    }
  }, [isInitialized, initialize, processDataForAnalysis]);

  // Inicializar automaticamente apenas uma vez
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initialize();
    }
  }, []); // Removido initialize da dependência para evitar loop

  // Carregar dados automaticamente após inicialização
  useEffect(() => {
    console.log('🔄 Verificando carregamento automático:', { 
      isInitialized, 
      isLoading, 
      hasProcessedData: !!processedData 
    });
    
    if (isInitialized && !isLoading && !processedData) {
      console.log('🚀 Iniciando carregamento automático de dados...');
      processDataForAnalysis();
    }
  }, [isInitialized, isLoading, processedData, processDataForAnalysis]);

  return {
    // Estado
    isInitialized,
    isLoading,
    error,
    lastUpdate,
    
    // Dados
    rawData,
    processedData,
    metrics,
    headers,
    
    // Métodos
    initialize,
    readSpreadsheet,
    readSheet,
    listSheets,
    getMetadata,
    testConnection,
    processDataForAnalysis,
    refresh
  };
};

export default useMCPGoogleSheets;
