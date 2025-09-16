/**
 * Hook Otimizado para Relatórios - VeloIGP
 * Versão otimizada com memoização e performance melhorada
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMCPGoogleSheets } from './useMCPGoogleSheets';
import { EnhancedManualDataProcessor, ManualDataRow, FiltroPeriodo, IndicadoresGerais, IndicadoresOperador } from '../services/enhancedManualDataProcessor';

export interface UseReportsOptimizedReturn {
  // Estado
  isProcessing: boolean;
  isInitialLoad: boolean;
  activeSection: 'gerais' | 'operadores';
  selectedOperator: string | null;
  showOperatorSelector: boolean;
  showOperatorProfile: boolean;
  
  // Dados
  rawData: ManualDataRow[];
  filtros: FiltroPeriodo[];
  filtroSelecionado: FiltroPeriodo | null;
  indicadoresGerais: IndicadoresGerais | null;
  indicadoresOperadores: IndicadoresOperador[];
  
  // Métodos
  handleFiltroChange: (filtro: FiltroPeriodo) => void;
  handleSelectOperator: (operatorName: string | null) => void;
  handleViewOperatorDetails: (operatorName: string) => void;
  toggleOperatorSelector: () => void;
  closeOperatorProfile: () => void;
  scrollToSection: (sectionId: 'gerais' | 'operadores') => void;
  handleRefresh: () => Promise<void>;
  handleExport: () => void;
}

export const useReportsOptimized = (): UseReportsOptimizedReturn => {
  const { 
    isInitialized, 
    isLoading, 
    error, 
    processedData, 
    processDataForAnalysis 
  } = useMCPGoogleSheets();

  // Estados otimizados
  const [rawData, setRawData] = useState<ManualDataRow[]>([]);
  const [filtros, setFiltros] = useState<FiltroPeriodo[]>([]);
  const [filtroSelecionado, setFiltroSelecionado] = useState<FiltroPeriodo | null>(null);
  const [indicadoresGerais, setIndicadoresGerais] = useState<IndicadoresGerais | null>(null);
  const [indicadoresOperadores, setIndicadoresOperadores] = useState<IndicadoresOperador[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeSection, setActiveSection] = useState<'gerais' | 'operadores'>('gerais');
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [showOperatorSelector, setShowOperatorSelector] = useState(false);
  const [showOperatorProfile, setShowOperatorProfile] = useState(false);

  // Processador memoizado
  const processor = useMemo(() => new EnhancedManualDataProcessor(), []);

  // Processar dados brutos - memoizado
  const processRawData = useCallback(async () => {
    if (!processedData) return;

    setIsProcessing(true);
    try {
      const processed = processor.processRawData(processedData);
      setRawData(processed);

      const periodFilters = processor.generatePeriodFilters();
      setFiltros(periodFilters);
      setFiltroSelecionado(periodFilters[0]);

      console.log('✅ Dados processados:', processed.length, 'chamadas atendidas');
    } catch (err: any) {
      console.error('❌ Erro ao processar dados:', err);
    } finally {
      setIsProcessing(false);
      setIsInitialLoad(false);
    }
  }, [processedData, processor]);

  // Calcular indicadores - memoizado
  const calculateIndicators = useCallback(() => {
    if (!filtroSelecionado || rawData.length === 0) return;

    try {
      const gerais = processor.calculateIndicadoresGerais(rawData, filtroSelecionado);
      const operadores = processor.calculateIndicadoresOperadores(rawData, filtroSelecionado);

      setIndicadoresGerais(gerais);
      setIndicadoresOperadores(operadores);
    } catch (err: any) {
      console.error('❌ Erro ao calcular indicadores:', err);
    }
  }, [filtroSelecionado, rawData, processor]);

  // Handlers memoizados
  const handleFiltroChange = useCallback((filtro: FiltroPeriodo) => {
    setFiltroSelecionado(filtro);
    setSelectedOperator(null);
  }, []);

  const handleSelectOperator = useCallback((operatorName: string | null) => {
    setSelectedOperator(operatorName);
    setShowOperatorProfile(true);
  }, []);

  const handleViewOperatorDetails = useCallback((operatorName: string) => {
    setSelectedOperator(operatorName);
    setShowOperatorSelector(false);
    setShowOperatorProfile(true);
  }, []);

  const toggleOperatorSelector = useCallback(() => {
    setShowOperatorSelector(prev => !prev);
    setShowOperatorProfile(false);
  }, []);

  const closeOperatorProfile = useCallback(() => {
    setShowOperatorProfile(false);
    setSelectedOperator(null);
  }, []);

  const scrollToSection = useCallback((sectionId: 'gerais' | 'operadores') => {
    setActiveSection(sectionId);
    // Scroll será implementado no componente
  }, []);

  const handleRefresh = useCallback(async () => {
    if (isLoading) return;
    await processDataForAnalysis();
  }, [isLoading, processDataForAnalysis]);

  const handleExport = useCallback(() => {
    // Implementar exportação
    console.log('Exportando dados...');
  }, []);

  // Effects otimizados
  useEffect(() => {
    if (processedData && processedData.length > 0) {
      processRawData();
    }
  }, [processedData, processRawData]);

  useEffect(() => {
    if (filtroSelecionado && rawData.length > 0) {
      calculateIndicators();
    }
  }, [filtroSelecionado, rawData, calculateIndicators]);

  return {
    // Estado
    isProcessing,
    isInitialLoad,
    activeSection,
    selectedOperator,
    showOperatorSelector,
    showOperatorProfile,
    
    // Dados
    rawData,
    filtros,
    filtroSelecionado,
    indicadoresGerais,
    indicadoresOperadores,
    
    // Métodos
    handleFiltroChange,
    handleSelectOperator,
    handleViewOperatorDetails,
    toggleOperatorSelector,
    closeOperatorProfile,
    scrollToSection,
    handleRefresh,
    handleExport
  };
};
