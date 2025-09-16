import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import { useMCPGoogleSheets } from '../hooks/useMCPGoogleSheets';
import { EnhancedManualDataProcessor, ManualDataRow, FiltroPeriodo, IndicadoresGerais, IndicadoresOperador } from '../services/enhancedManualDataProcessor';
import OperatorProfileSelector from '../components/operators/OperatorProfileSelector';
import PremiumButton from '../components/ui/PremiumButton';
import PremiumCard from '../components/ui/PremiumCard';
import './VeloigpManualReports.css';

const VeloigpManualReports: React.FC = () => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { 
    isInitialized, 
    isLoading, 
    error, 
    processedData, 
    processDataForAnalysis 
  } = useMCPGoogleSheets();

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

  const processor = useMemo(() => new EnhancedManualDataProcessor(), []);
  const geraisRef = useRef<HTMLDivElement>(null);
  const operadoresRef = useRef<HTMLDivElement>(null);

  // Configurar Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId === 'gerais' || sectionId === 'operadores') {
              setActiveSection(sectionId as 'gerais' | 'operadores');
            }
          }
        });
      },
      { 
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    if (geraisRef.current) observer.observe(geraisRef.current);
    if (operadoresRef.current) observer.observe(operadoresRef.current);

    return () => observer.disconnect();
  }, []);

  // Inicializar MCP Service automaticamente
  useEffect(() => {
    const initializeSystem = async () => {
      console.log('🚀 Iniciando sistema VeloIGP...');
      
      try {
        // Inicializar MCP Service se não estiver inicializado
        if (!isInitialized && !isLoading) {
          console.log('🔄 Inicializando MCP Google Sheets Service...');
          await processDataForAnalysis();
        }
      } catch (err) {
        console.error('❌ Erro na inicialização:', err);
        setIsInitialLoad(false);
      }
    };

    initializeSystem();
  }, [isInitialized, isLoading, processDataForAnalysis]);

  const processRawData = useCallback(async () => {
    if (!processedData) return;

    setIsProcessing(true);
    try {
      console.log('🔄 Processando dados brutos da planilha...');
      console.log('📊 Dados recebidos:', processedData.length, 'linhas');
      console.log('📋 Primeira linha de exemplo:', processedData[0]);
      console.log('🔍 Chaves disponíveis na primeira linha:', Object.keys(processedData[0] || {}));

      // Usar o processador aprimorado com motores de cálculo
      const processed = processor.processRawData(processedData);

      setRawData(processed);

      // Gerar filtros
      const periodFilters = processor.generatePeriodFilters();
      setFiltros(periodFilters);
      setFiltroSelecionado(periodFilters[0]); // Selecionar "Ontem" por padrão

      console.log('✅ Dados processados conforme manual:', processed.length, 'chamadas atendidas');
      showSuccess('Dados Processados', `Sistema carregado com ${processed.length} chamadas atendidas!`);
    } catch (err: any) {
      console.error('❌ Erro ao processar dados:', err);
      showError('Erro no Processamento', `Erro: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [processedData, processor, showSuccess, showError]);

  // Processar dados automaticamente quando carregados
  useEffect(() => {
    if (processedData && processedData.length > 0 && isInitialLoad) {
      console.log('🔄 Processando dados automaticamente...');
      processRawData();
    }
  }, [processedData, isInitialLoad, processRawData]);

  const calculateIndicators = useCallback(() => {
    if (!filtroSelecionado) {
      console.log('⚠️ Nenhum filtro selecionado');
      return;
    }

    if (rawData.length === 0) {
      console.log('⚠️ Nenhum dado disponível para cálculo');
      return;
    }

    try {
      console.log(`🔄 Calculando indicadores para ${filtroSelecionado.label}...`);
      console.log(`📊 Dados disponíveis: ${rawData.length} registros`);
      
      // Calcular indicadores gerais
      const gerais = processor.calculateIndicadoresGerais(rawData, filtroSelecionado);
      setIndicadoresGerais(gerais);

      // Calcular indicadores por operador
      const operadores = processor.calculateIndicadoresOperadores(rawData, filtroSelecionado);
      setIndicadoresOperadores(operadores);

      console.log('✅ Indicadores calculados:', { 
        gerais: {
          totalLigacoes: gerais.totalLigacoesAtendidas,
          tempoMedio: gerais.tempoMedioAtendimento,
          avaliacaoAtendimento: gerais.avaliacaoAtendimento,
          avaliacaoSolucao: gerais.avaliacaoSolucao
        }, 
        operadores: operadores.length 
      });

      // Mostrar feedback baseado nos resultados
      if (gerais.totalLigacoesAtendidas > 0) {
        showSuccess('Dados Processados', `${gerais.totalLigacoesAtendidas} chamadas encontradas para ${filtroSelecionado.label}`);
      } else {
        // Tentar próximo filtro automaticamente
        const currentIndex = filtros.findIndex(f => f.tipo === filtroSelecionado.tipo);
        if (currentIndex < filtros.length - 1) {
          const nextFilter = filtros[currentIndex + 1];
          console.log(`🔄 Tentando próximo filtro: ${nextFilter.label}`);
          setFiltroSelecionado(nextFilter);
        } else {
          showError('Nenhum Dado', `Nenhuma chamada encontrada em nenhum período. Verifique os dados da planilha.`);
        }
      }
    } catch (err: any) {
      console.error('❌ Erro ao calcular indicadores:', err);
      showError('Erro no Cálculo', `Erro ao processar dados: ${err.message}`);
    }
  }, [filtroSelecionado, rawData, processor, showSuccess, showError, filtros]);

  // Calcular indicadores quando filtro muda
  useEffect(() => {
    if (rawData.length > 0 && filtroSelecionado) {
      calculateIndicators();
    }
  }, [rawData, filtroSelecionado, calculateIndicators]);

  // Auto-selecionar filtro com dados se "Ontem" estiver vazio
  useEffect(() => {
    if (rawData.length > 0 && filtros.length > 0 && indicadoresGerais?.totalLigacoesAtendidas === 0) {
      console.log('🔄 Tentando outros filtros pois "Ontem" está vazio...');
      
      // Tentar "Semana" se "Ontem" estiver vazio
      if (filtroSelecionado?.tipo === 'ontem') {
        const semanaFilter = filtros.find(f => f.tipo === 'semana');
        if (semanaFilter) {
          console.log('📅 Mudando para filtro "Semana"');
          setFiltroSelecionado(semanaFilter);
        }
      }
      // Tentar "Mês" se "Semana" estiver vazio
      else if (filtroSelecionado?.tipo === 'semana') {
        const mesFilter = filtros.find(f => f.tipo === 'mes');
        if (mesFilter) {
          console.log('📅 Mudando para filtro "Mês"');
          setFiltroSelecionado(mesFilter);
        }
      }
      // Tentar "Ano" se "Mês" estiver vazio
      else if (filtroSelecionado?.tipo === 'mes') {
        const anoFilter = filtros.find(f => f.tipo === 'ano');
        if (anoFilter) {
          console.log('📅 Mudando para filtro "Ano"');
          setFiltroSelecionado(anoFilter);
        }
      }
    }
  }, [indicadoresGerais, filtros, filtroSelecionado, rawData]);

  const handleFiltroChange = (filtro: FiltroPeriodo) => {
    setFiltroSelecionado(filtro);
    setSelectedOperator(null); // Reset seleção de operador
    showSuccess('Filtro Alterado', `Visualizando dados de: ${filtro.label}`);
  };

  const handleSelectOperator = (operatorName: string | null) => {
    setSelectedOperator(operatorName);
    setShowOperatorProfile(true);
    if (operatorName) {
      showSuccess('Operador Selecionado', `Visualizando dados de: ${operatorName}`);
    }
  };

  const handleViewOperatorDetails = (operatorName: string) => {
    setSelectedOperator(operatorName);
    setShowOperatorSelector(false);
    scrollToSection('operadores');
    showSuccess('Detalhes do Operador', `Mostrando detalhes de: ${operatorName}`);
  };

  const toggleOperatorSelector = () => {
    setShowOperatorSelector(!showOperatorSelector);
    setShowOperatorProfile(false);
    if (!showOperatorSelector) {
      showSuccess('Seletor de Operadores', 'Seletor de operadores aberto');
    }
  };

  const closeOperatorProfile = () => {
    setShowOperatorProfile(false);
    setSelectedOperator(null);
  };

  const scrollToSection = (sectionId: 'gerais' | 'operadores') => {
    const targetRef = sectionId === 'gerais' ? geraisRef : operadoresRef;
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRefresh = async () => {
    try {
      await processDataForAnalysis();
      showSuccess('Dados Atualizados', 'Sistema atualizado com sucesso!');
    } catch (err: any) {
      showError('Erro na Atualização', `Erro: ${err.message}`);
    }
  };

  // Exportar dados básicos
  const handleExport = () => {
    if (!indicadoresGerais) {
      showError('Nenhum Dado', 'Não há dados para exportar');
      return;
    }

    try {
      const exportData = {
        periodo: filtroSelecionado?.label || 'Período',
        dataExportacao: new Date().toLocaleString('pt-BR'),
        indicadoresGerais: {
          totalLigacoesAtendidas: indicadoresGerais.totalLigacoesAtendidas,
          tempoMedioAtendimento: indicadoresGerais.tempoMedioAtendimento,
          avaliacaoAtendimento: indicadoresGerais.avaliacaoAtendimento,
          avaliacaoSolucao: indicadoresGerais.avaliacaoSolucao
        },
        operadores: indicadoresOperadores.map(op => ({
          nome: op.nomeAtendente,
          totalChamadas: op.totalLigacoesAtendidas,
          tempoMedio: op.tempoMedioAtendimento,
          avaliacao: op.avaliacaoAtendimento
        }))
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `veloigp-relatorio-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess('Exportado', 'Relatório exportado com sucesso!');
    } catch (err: any) {
      showError('Erro na Exportação', `Erro: ${err.message}`);
    }
  };

  // Gerar dados horários para gráficos
  const generateHourlyData = (data: ManualDataRow[]) => {
    const hourlyMap = new Map<number, number>();
    
    // Inicializar todas as horas com 0
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, 0);
    }
    
    data.forEach(row => {
      // Extrair hora da data (assumindo formato ISO)
      const date = new Date(row.data);
      if (!isNaN(date.getTime())) {
        const hour = date.getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      }
    });
    
    return Array.from(hourlyMap.entries()).map(([hour, calls]) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      calls
    }));
  };

  // Gerar dados diários para gráficos
  const generateDailyData = (data: ManualDataRow[]) => {
    const dailyMap = new Map<string, number>();
    
    data.forEach(row => {
      const date = new Date(row.data);
      if (!isNaN(date.getTime())) {
        const dayKey = date.toLocaleDateString('pt-BR', { weekday: 'short' });
        dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);
      }
    });
    
    return Array.from(dailyMap.entries()).map(([day, calls]) => ({
      day,
      calls
    }));
  };

  if (!isInitialized) {
    return (
      <div className="manual-reports loading-state">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h3>Inicializando Sistema VeloIGP</h3>
          <p>Conectando com a planilha Google Sheets...</p>
          <div className="loading-steps">
            <div className="step active">
              <i className="fas fa-link"></i>
              <span>Conectando com API</span>
            </div>
            <div className="step">
              <i className="fas fa-database"></i>
              <span>Carregando dados</span>
            </div>
            <div className="step">
              <i className="fas fa-chart-line"></i>
              <span>Processando indicadores</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manual-reports" data-theme={theme}>
      {/* Header Fixo */}
      <div className="manual-header">
        <div className="header-content">
          <h1 className="velotax-title-1">
            <i className="fas fa-chart-line"></i>
            Relatórios VeloIGP - Manual
          </h1>
          <p>Sistema desenvolvido conforme manual "Dados & Referencias.docx"</p>
          
          <div className="header-actions">
            <div className="filtros-container">
              <label>Período:</label>
              <div className="filtros-buttons">
                {filtros.map((filtro, index) => (
                  <button
                    key={index}
                    className={`filtro-btn ${filtroSelecionado?.tipo === filtro.tipo ? 'active' : ''}`}
                    onClick={() => handleFiltroChange(filtro)}
                  >
                    {filtro.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="action-buttons">
              <PremiumButton
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                icon={<i className="fas fa-sync-alt"></i>}
              >
                Atualizar
              </PremiumButton>
              
              {indicadoresGerais && indicadoresGerais.totalLigacoesAtendidas > 0 && (
                <PremiumButton
                  onClick={handleExport}
                  variant="secondary"
                  size="sm"
                  icon={<i className="fas fa-download"></i>}
                >
                  Exportar
                </PremiumButton>
              )}
            </div>
            
            <div className="section-navigation">
              <button
                className={`nav-btn ${activeSection === 'gerais' ? 'active' : ''}`}
                onClick={() => scrollToSection('gerais')}
              >
                <i className="fas fa-chart-pie"></i>
                Operação Geral
              </button>
              <button
                className={`nav-btn ${activeSection === 'operadores' ? 'active' : ''}`}
                onClick={() => scrollToSection('operadores')}
              >
                <i className="fas fa-users"></i>
                Operadores
              </button>
            </div>
            
            <button 
              onClick={handleRefresh} 
              className="btn btn-primary"
              disabled={isLoading || isProcessing}
            >
              <i className="fas fa-sync-alt"></i>
              {isLoading || isProcessing ? 'Processando...' : 'Atualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Operação Geral */}
      <div 
        ref={geraisRef}
        data-section-id="gerais"
        className="section gerais-section"
      >
        <div className="section-header">
          <h2>
            <i className="fas fa-chart-pie"></i>
            Operação Geral
          </h2>
          <p>Indicadores consolidados conforme manual VeloIGP</p>
        </div>
        
        <div className="section-content">
          {isProcessing ? (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
              <p>Processando dados da planilha...</p>
            </div>
          ) : indicadoresGerais ? (
            <div className="indicadores-gerais">
              <PremiumCard
                variant="gradient"
                size="lg"
                icon={<i className="fas fa-phone"></i>}
                title={indicadoresGerais.calculations?.totalLigacoes.formatted || indicadoresGerais.totalLigacoesAtendidas.toLocaleString('pt-BR')}
                subtitle="Total de Ligações Atendidas"
              >
                <p className="indicador-desc">
                  Soma da coluna A (considerando somente "Atendidas")
                  {indicadoresGerais.calculations?.totalLigacoes.isValid === false && (
                    <span className="error-indicator"> ⚠️ Erro no cálculo</span>
                  )}
                </p>
              </PremiumCard>

              <PremiumCard
                variant="elevated"
                size="lg"
                icon={<i className="fas fa-clock"></i>}
                title={indicadoresGerais.calculations?.tempoMedio.formatted || `${(indicadoresGerais.tempoMedioAtendimento / 60).toFixed(1)}min`}
                subtitle="Tempo Médio de Atendimento"
              >
                <p className="indicador-desc">
                  Média simples da coluna N (Tempo Falado)
                  {indicadoresGerais.calculations?.tempoMedio.isValid === false && (
                    <span className="error-indicator"> ⚠️ Erro no cálculo</span>
                  )}
                </p>
              </PremiumCard>

              <PremiumCard
                variant="outlined"
                size="lg"
                icon={<i className="fas fa-star"></i>}
                title={`${indicadoresGerais.calculations?.avaliacaoAtendimento.formatted || indicadoresGerais.avaliacaoAtendimento.toFixed(1)}/5`}
                subtitle="Avaliação do Atendimento"
              >
                <p className="indicador-desc">
                  Média simples da coluna AB (Pergunta 1 - Atendente)
                  {indicadoresGerais.calculations?.avaliacaoAtendimento.isValid === false && (
                    <span className="error-indicator"> ⚠️ Erro no cálculo</span>
                  )}
                </p>
              </PremiumCard>

              <PremiumCard
                variant="default"
                size="lg"
                icon={<i className="fas fa-check-circle"></i>}
                title={`${indicadoresGerais.calculations?.avaliacaoSolucao.formatted || indicadoresGerais.avaliacaoSolucao.toFixed(1)}/5`}
                subtitle="Avaliação da Solução"
              >
                <p className="indicador-desc">
                  Média simples da coluna AC (Pergunta 2 - Solução)
                  {indicadoresGerais.calculations?.avaliacaoSolucao.isValid === false && (
                    <span className="error-indicator"> ⚠️ Erro no cálculo</span>
                  )}
                </p>
              </PremiumCard>
            </div>
          ) : rawData.length === 0 ? (
            <div className="no-data-state">
              <div className="no-data-icon">
                <i className="fas fa-database"></i>
              </div>
              <h3>Nenhum Dado Encontrado</h3>
              <p>Não foram encontradas chamadas atendidas na planilha para o período selecionado.</p>
              <PremiumButton
                onClick={handleRefresh}
                variant="primary"
                size="lg"
                icon={<i className="fas fa-sync-alt"></i>}
              >
                Tentar Novamente
              </PremiumButton>
            </div>
          ) : (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
              <p>Calculando indicadores gerais...</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Operadores */}
      <div 
        ref={operadoresRef}
        data-section-id="operadores"
        className="section operadores-section"
      >
        <div className="section-header">
          <h2>
            <i className="fas fa-users"></i>
            Operadores Individuais
          </h2>
          <p>Análise individual conforme manual VeloIGP</p>
          
          <div className="section-actions">
            <PremiumButton
              onClick={toggleOperatorSelector}
              variant="outline"
              size="sm"
              icon={<i className="fas fa-search"></i>}
            >
              {showOperatorSelector ? 'Ocultar Seleção' : 'Selecionar Operador'}
            </PremiumButton>
          </div>
        </div>
        
        <div className="section-content">
          {/* Seletor de Perfil de Operadores */}
          {showOperatorSelector && (
            <div className="operator-profile-selector-container">
              <OperatorProfileSelector
                operators={indicadoresOperadores}
                selectedOperator={selectedOperator}
                onSelectOperator={handleSelectOperator}
                onViewProfile={handleViewOperatorDetails}
                onClose={() => setShowOperatorSelector(false)}
              />
            </div>
          )}

          {isProcessing ? (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
              <p>Processando dados dos operadores...</p>
            </div>
          ) : indicadoresOperadores.length > 0 ? (
            <div className="operadores-section">
              {selectedOperator ? (
                // Mostrar apenas o operador selecionado
                <div className="selected-operator-detail">
                  {(() => {
                    const operador = indicadoresOperadores.find(op => op.nomeAtendente === selectedOperator);
                    if (!operador) return null;
                    
                    return (
                      <div className="operador-card selected">
                        <div className="operador-header">
                          <h3>{operador.nomeAtendente}</h3>
                          <span className="selected-badge">
                            <i className="fas fa-check-circle"></i>
                            Operador Selecionado
                          </span>
                        </div>
                        
                        <div className="operador-metrics">
                          <div className="metric">
                            <span className="metric-label">Total de Chamadas:</span>
                            <span className="metric-value">
                              {operador.calculations?.totalLigacoes.formatted || operador.totalLigacoesAtendidas.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          
                          <div className="metric">
                            <span className="metric-label">Tempo Médio:</span>
                            <span className="metric-value">
                              {operador.calculations?.tempoMedio.formatted || `${(operador.tempoMedioAtendimento / 60).toFixed(1)}min`}
                            </span>
                          </div>
                          
                          <div className="metric">
                            <span className="metric-label">Avaliação Atendimento:</span>
                            <span className="metric-value">
                              {operador.calculations?.avaliacaoAtendimento.formatted || operador.avaliacaoAtendimento.toFixed(1)}/5
                            </span>
                          </div>
                          
                          <div className="metric">
                            <span className="metric-label">Avaliação Solução:</span>
                            <span className="metric-value">
                              {operador.calculations?.avaliacaoSolucao.formatted || operador.avaliacaoSolucao.toFixed(1)}/5
                            </span>
                          </div>
                        </div>
                        
                        <div className="operador-chart">
                          <div className="chart-bars">
                            <div className="chart-bar">
                              <span className="bar-label">Volume</span>
                              <div className="bar-container">
                                <div 
                                  className="bar-fill volume"
                                  style={{ width: `${Math.min(operador.totalLigacoesAtendidas / 10 * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="chart-bar">
                              <span className="bar-label">Qualidade</span>
                              <div className="bar-container">
                                <div 
                                  className="bar-fill quality"
                                  style={{ width: `${((operador.avaliacaoAtendimento + operador.avaliacaoSolucao) / 2 / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="operador-actions">
                          <PremiumButton
                            onClick={() => setSelectedOperator(null)}
                            variant="outline"
                            size="md"
                            icon={<i className="fas fa-arrow-left"></i>}
                          >
                            Voltar para Todos
                          </PremiumButton>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                // Mostrar resumo dos operadores
                <div className="operadores-summary">
                  <div className="summary-header">
                    <h3>
                      <i className="fas fa-users"></i>
                      Resumo dos Operadores
                    </h3>
                    <p>Total de {indicadoresOperadores.length} operadores ativos no período</p>
                  </div>
                  
                  <div className="operadores-stats">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-phone"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-value">
                          {indicadoresOperadores.reduce((sum, op) => sum + op.totalLigacoesAtendidas, 0).toLocaleString('pt-BR')}
                        </span>
                        <span className="stat-label">Total de Chamadas</span>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-star"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-value">
                          {(indicadoresOperadores.reduce((sum, op) => sum + op.avaliacaoAtendimento, 0) / indicadoresOperadores.length).toFixed(1)}
                        </span>
                        <span className="stat-label">Avaliação Média</span>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-trophy"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-value">
                          {indicadoresOperadores.filter(op => op.avaliacaoAtendimento >= 4.5).length}
                        </span>
                        <span className="stat-label">Top Performers</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="top-operators">
                    <h4>Top 5 Operadores</h4>
                    <div className="top-list">
                      {indicadoresOperadores
                        .sort((a, b) => b.totalLigacoesAtendidas - a.totalLigacoesAtendidas)
                        .slice(0, 5)
                        .map((operador, index) => (
                        <div key={operador.nomeAtendente} className="top-operator-item">
                          <div className="rank">#{index + 1}</div>
                          <div className="operator-info">
                            <span className="name">{operador.nomeAtendente}</span>
                            <span className="calls">{operador.totalLigacoesAtendidas} chamadas</span>
                          </div>
                          <div className="rating">
                            <i className="fas fa-star"></i>
                            {operador.avaliacaoAtendimento.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : rawData.length === 0 ? (
            <div className="no-data-state">
              <div className="no-data-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Nenhum Operador Encontrado</h3>
              <p>Não foram encontrados operadores com chamadas atendidas no período selecionado.</p>
              <PremiumButton
                onClick={handleRefresh}
                variant="primary"
                size="lg"
                icon={<i className="fas fa-sync-alt"></i>}
              >
                Tentar Novamente
              </PremiumButton>
            </div>
          ) : (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
              <p>Calculando indicadores dos operadores...</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Analytics - Simplificada */}
      {indicadoresGerais && indicadoresGerais.totalLigacoesAtendidas > 0 && (
        <div className="analytics-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-chart-line"></i>
              Resumo Visual
            </h2>
            <p>Gráficos básicos dos indicadores</p>
          </div>
          
          <div className="section-content">
            <div className="simple-charts">
              <div className="chart-item">
                <h3>Chamadas por Operador</h3>
                <div className="chart-placeholder">
                  {indicadoresOperadores.slice(0, 5).map((op, index) => (
                    <div key={index} className="operator-bar">
                      <span className="operator-name">{op.nomeAtendente}</span>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${(op.totalLigacoesAtendidas / Math.max(...indicadoresOperadores.map(o => o.totalLigacoesAtendidas))) * 100}%` }}
                        ></div>
                        <span className="bar-value">{op.totalLigacoesAtendidas}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="chart-item">
                <h3>Distribuição de Avaliações</h3>
                <div className="rating-summary">
                  <div className="rating-item">
                    <span>Atendimento:</span>
                    <div className="rating-stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i key={i} className={`fas fa-star ${i < Math.round(indicadoresGerais.avaliacaoAtendimento) ? 'active' : ''}`}></i>
                      ))}
                      <span className="rating-value">{indicadoresGerais.avaliacaoAtendimento.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="rating-item">
                    <span>Solução:</span>
                    <div className="rating-stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i key={i} className={`fas fa-star ${i < Math.round(indicadoresGerais.avaliacaoSolucao) ? 'active' : ''}`}></i>
                      ))}
                      <span className="rating-value">{indicadoresGerais.avaliacaoSolucao.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aba de Perfil do Operador */}
      {showOperatorProfile && selectedOperator && (
        <div className="operator-profile-modal">
          <div className="operator-profile-content">
            <div className="operator-profile-header">
              <h2>
                <i className="fas fa-user"></i>
                Perfil do Operador: {selectedOperator}
              </h2>
              <button 
                className="close-profile-btn"
                onClick={closeOperatorProfile}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="operator-profile-body">
              {(() => {
                const operador = indicadoresOperadores.find(op => op.nomeAtendente === selectedOperator);
                if (!operador) {
                  return (
                    <div className="no-operator-data">
                      <i className="fas fa-user-slash"></i>
                      <p>Dados do operador não encontrados</p>
                    </div>
                  );
                }
                
                return (
                  <div className="operator-details">
                    <div className="operator-stats">
                      <div className="stat-card">
                        <div className="stat-icon">
                          <i className="fas fa-phone"></i>
                        </div>
                        <div className="stat-content">
                          <h3>Total de Chamadas</h3>
                          <p className="stat-value">
                            {operador.calculations?.totalLigacoes.formatted || operador.totalLigacoesAtendidas.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-icon">
                          <i className="fas fa-clock"></i>
                        </div>
                        <div className="stat-content">
                          <h3>Tempo Médio</h3>
                          <p className="stat-value">
                            {operador.calculations?.tempoMedio.formatted || `${(operador.tempoMedioAtendimento / 60).toFixed(1)}min`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-icon">
                          <i className="fas fa-star"></i>
                        </div>
                        <div className="stat-content">
                          <h3>Avaliação Atendimento</h3>
                          <p className="stat-value">
                            {operador.calculations?.avaliacaoAtendimento.formatted || operador.avaliacaoAtendimento.toFixed(1)}/5
                          </p>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-icon">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-content">
                          <h3>Avaliação Solução</h3>
                          <p className="stat-value">
                            {operador.calculations?.avaliacaoSolucao.formatted || operador.avaliacaoSolucao.toFixed(1)}/5
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="operator-charts">
                      <h3>Análise de Performance</h3>
                      <div className="charts-grid">
                        <div className="chart-item">
                          <h4>Volume de Chamadas</h4>
                          <div className="bar-chart">
                            <div 
                              className="bar-fill"
                              style={{ 
                                width: `${Math.min((operador.totalLigacoesAtendidas / Math.max(...indicadoresOperadores.map(op => op.totalLigacoesAtendidas))) * 100, 100)}%` 
                              }}
                            ></div>
                            <span className="bar-value">{operador.totalLigacoesAtendidas}</span>
                          </div>
                        </div>
                        
                        <div className="chart-item">
                          <h4>Eficiência de Tempo</h4>
                          <div className="bar-chart">
                            <div 
                              className="bar-fill"
                              style={{ 
                                width: `${Math.min((operador.tempoMedioAtendimento / Math.max(...indicadoresOperadores.map(op => op.tempoMedioAtendimento))) * 100, 100)}%` 
                              }}
                            ></div>
                            <span className="bar-value">{(operador.tempoMedioAtendimento / 60).toFixed(1)}min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="operator-actions">
                      <PremiumButton
                        onClick={() => {
                          setShowOperatorProfile(false);
                          setShowOperatorSelector(true);
                        }}
                        variant="outline"
                        icon={<i className="fas fa-search"></i>}
                      >
                        Selecionar Outro Operador
                      </PremiumButton>
                      
                      <PremiumButton
                        onClick={handleExport}
                        variant="primary"
                        icon={<i className="fas fa-download"></i>}
                      >
                        Exportar Dados
                      </PremiumButton>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(isLoading || isProcessing) && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>{isLoading ? 'Carregando dados...' : 'Processando conforme manual...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VeloigpManualReports;
