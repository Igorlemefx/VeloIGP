import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import { useMCPGoogleSheets } from '../hooks/useMCPGoogleSheets';
import './VeloigpReports.css';

interface ReportData {
  totalCalls: number;
  answeredCalls: number;
  abandonedCalls: number;
  answerRate: number;
  abandonmentRate: number;
  avgWaitTime: number;
  avgTalkTime: number;
  monthlyData: any[];
  weeklyData: any[];
  operatorData: any[];
  hourlyData: any[];
}

const VeloigpReports: React.FC = () => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { 
    isInitialized, 
    isLoading, 
    error, 
    processedData, 
    metrics, 
    processDataForAnalysis 
  } = useMCPGoogleSheets();

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'year' | 'month' | 'week'>('year');
  const [selectedOperator, setSelectedOperator] = useState<string>('all');
  const [selectedOperatorDetails, setSelectedOperatorDetails] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showOperatorSelector, setShowOperatorSelector] = useState(false);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showOperatorSelector && !target.closest('.operator-selector')) {
        setShowOperatorSelector(false);
      }
    };

    if (showOperatorSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOperatorSelector]);

  // Processar dados quando carregados
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { 
      processedData: !!processedData, 
      metrics: !!metrics, 
      isInitialized, 
      isLoading, 
      error 
    });
    
    if (processedData && metrics) {
      console.log('📊 Processando dados reais da planilha...');
      generateReportData();
    } else if (isInitialized && !isLoading && !error) {
      console.log('🔄 Tentando carregar dados da planilha...');
      // Tentar carregar dados da planilha em vez de usar exemplos
      processDataForAnalysis().catch(err => {
        console.error('❌ Erro ao carregar dados da planilha:', err);
        showError('Erro de Conexão', 'Não foi possível carregar dados da planilha. Verifique a API Key e tente novamente.');
      });
    }
  }, [processedData, metrics, isInitialized, isLoading, error]);

  const generateReportData = async () => {
    if (!processedData || !metrics) return;

    console.log('📊 Gerando relatório com dados reais...');
    console.log('📈 Dados processados:', processedData.length, 'registros');
    console.log('📊 Métricas:', metrics);

    setIsGeneratingReport(true);
    try {
      // Processar dados mensais (Janeiro até agora)
      const monthlyData = processMonthlyData(processedData);
      console.log('📅 Dados mensais processados:', monthlyData.length);
      
      // Processar dados das últimas 2 semanas
      const weeklyData = processWeeklyData(processedData);
      console.log('📆 Dados semanais processados:', weeklyData.length);
      
      // Processar dados dos operadores
      const operatorData = processOperatorData(processedData);
      console.log('👥 Dados dos operadores processados:', operatorData.length);
      
      // Processar dados por hora
      const hourlyData = processHourlyData(processedData);
      console.log('🕐 Dados por hora processados:', hourlyData.length);

      const report: ReportData = {
        totalCalls: metrics.totalCalls,
        answeredCalls: metrics.answeredCalls,
        abandonedCalls: metrics.abandonedCalls,
        answerRate: metrics.answerRate,
        abandonmentRate: metrics.abandonmentRate,
        avgWaitTime: metrics.avgWaitTimeSeconds,
        avgTalkTime: metrics.avgTalkTimeSeconds,
        monthlyData,
        weeklyData,
        operatorData,
        hourlyData
      };

      console.log('✅ Relatório gerado com sucesso:', report);
      setReportData(report);
      showSuccess('Relatório Gerado', `Dados reais processados: ${metrics.totalCalls} chamadas analisadas!`);
    } catch (err: any) {
      console.error('❌ Erro ao gerar relatório:', err);
      showError('Erro no Relatório', `Erro ao processar dados: ${err.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const processMonthlyData = (data: any[]) => {
    console.log('📅 Processando dados mensais...');
    const monthlyStats: { [key: string]: any } = {};
    
    data.forEach(row => {
      // Encontrar colunas dinamicamente
      const dataCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('data') && !key.toLowerCase().includes('atendimento')
      );
      const desconexaoCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('desconexão') || key.toLowerCase().includes('desconexao')
      );
      const tempoEsperaCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('tempo') && key.toLowerCase().includes('espera')
      );
      const tempoFaladoCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('tempo') && key.toLowerCase().includes('falado')
      );
      
      if (!dataCol) return; // Pular se não encontrar coluna de data
      
      const date = new Date(row[dataCol]);
      if (isNaN(date.getTime())) return; // Pular se data inválida
      
      const month = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          month,
          totalCalls: 0,
          answeredCalls: 0,
          abandonedCalls: 0,
          totalWaitTime: 0,
          totalTalkTime: 0,
          waitTimeCount: 0,
          talkTimeCount: 0
        };
      }

      monthlyStats[month].totalCalls++;
      
      if (desconexaoCol) {
        const desconexao = row[desconexaoCol] || '';
        if (desconexao.toLowerCase().includes('atendida') || 
            desconexao.toLowerCase().includes('completa') ||
            desconexao.toLowerCase().includes('finalizada')) {
          monthlyStats[month].answeredCalls++;
        } else if (desconexao.toLowerCase().includes('abandonada') ||
                   desconexao.toLowerCase().includes('desistiu') ||
                   desconexao.toLowerCase().includes('timeout')) {
          monthlyStats[month].abandonedCalls++;
        }
      } else {
        // Se não encontrar coluna de desconexão, assumir atendida
        monthlyStats[month].answeredCalls++;
      }

      const waitTime = tempoEsperaCol ? parseTimeToSeconds(row[tempoEsperaCol]) : 0;
      const talkTime = tempoFaladoCol ? parseTimeToSeconds(row[tempoFaladoCol]) : 0;
      
      if (waitTime > 0) {
        monthlyStats[month].totalWaitTime += waitTime;
        monthlyStats[month].waitTimeCount++;
      }
      
      if (talkTime > 0) {
        monthlyStats[month].totalTalkTime += talkTime;
        monthlyStats[month].talkTimeCount++;
      }
    });

    return Object.values(monthlyStats).map(month => ({
      ...month,
      answerRate: month.totalCalls > 0 ? (month.answeredCalls / month.totalCalls) * 100 : 0,
      abandonmentRate: month.totalCalls > 0 ? (month.abandonedCalls / month.totalCalls) * 100 : 0,
      avgWaitTime: month.waitTimeCount > 0 ? month.totalWaitTime / month.waitTimeCount : 0,
      avgTalkTime: month.talkTimeCount > 0 ? month.totalTalkTime / month.talkTimeCount : 0
    }));
  };

  const processWeeklyData = (data: any[]) => {
    console.log('📆 Processando dados semanais...');
    const weeklyStats: { [key: string]: any } = {};
    
    data.forEach(row => {
      const dataCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('data') && !key.toLowerCase().includes('atendimento')
      );
      
      if (!dataCol) return;
      
      const date = new Date(row[dataCol]);
      if (isNaN(date.getTime())) return;
      
      const week = `Semana ${Math.ceil(date.getDate() / 7)}`;
      
      if (!weeklyStats[week]) {
        weeklyStats[week] = {
          week,
          totalCalls: 0,
          answeredCalls: 0,
          abandonedCalls: 0,
          totalWaitTime: 0,
          totalTalkTime: 0,
          waitTimeCount: 0,
          talkTimeCount: 0
        };
      }

      weeklyStats[week].totalCalls++;
      // Lógica similar para answeredCalls, abandonedCalls, etc.
    });

    return Object.values(weeklyStats).map(week => ({
      ...week,
      answerRate: week.totalCalls > 0 ? (week.answeredCalls / week.totalCalls) * 100 : 0,
      abandonmentRate: week.totalCalls > 0 ? (week.abandonedCalls / week.totalCalls) * 100 : 0,
      avgWaitTime: week.waitTimeCount > 0 ? week.totalWaitTime / week.waitTimeCount : 0,
      avgTalkTime: week.talkTimeCount > 0 ? week.totalTalkTime / week.talkTimeCount : 0
    }));
  };

  const processOperatorData = (data: any[]) => {
    console.log('👥 Processando dados dos operadores...');
    const operatorStats: { [key: string]: any } = {};
    
    data.forEach(row => {
      // Encontrar colunas dinamicamente
      const operadorCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('operador')
      );
      const desconexaoCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('desconexão') || key.toLowerCase().includes('desconexao')
      );
      const tempoEsperaCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('tempo') && key.toLowerCase().includes('espera')
      );
      const tempoFaladoCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('tempo') && key.toLowerCase().includes('falado')
      );
      const pergunta1Col = Object.keys(row).find(key => 
        key.toLowerCase().includes('pergunta') && key.includes('1')
      );
      const pergunta2Col = Object.keys(row).find(key => 
        key.toLowerCase().includes('pergunta') && key.includes('2')
      );
      
      const operator = operadorCol ? (row[operadorCol] || 'Não identificado') : 'Não identificado';
      
      if (!operatorStats[operator]) {
        operatorStats[operator] = {
          operator,
          totalCalls: 0,
          answeredCalls: 0,
          abandonedCalls: 0,
          totalWaitTime: 0,
          totalTalkTime: 0,
          waitTimeCount: 0,
          talkTimeCount: 0,
          qualityScore: 0,
          qualityCount: 0
        };
      }

      operatorStats[operator].totalCalls++;
      
      if (desconexaoCol) {
        const desconexao = row[desconexaoCol] || '';
        if (desconexao.toLowerCase().includes('atendida') || 
            desconexao.toLowerCase().includes('completa') ||
            desconexao.toLowerCase().includes('finalizada')) {
          operatorStats[operator].answeredCalls++;
        } else if (desconexao.toLowerCase().includes('abandonada') ||
                   desconexao.toLowerCase().includes('desistiu') ||
                   desconexao.toLowerCase().includes('timeout')) {
          operatorStats[operator].abandonedCalls++;
        }
      } else {
        // Se não encontrar coluna de desconexão, assumir atendida
        operatorStats[operator].answeredCalls++;
      }

      const waitTime = tempoEsperaCol ? parseTimeToSeconds(row[tempoEsperaCol]) : 0;
      const talkTime = tempoFaladoCol ? parseTimeToSeconds(row[tempoFaladoCol]) : 0;
      
      if (waitTime > 0) {
        operatorStats[operator].totalWaitTime += waitTime;
        operatorStats[operator].waitTimeCount++;
      }
      
      if (talkTime > 0) {
        operatorStats[operator].totalTalkTime += talkTime;
        operatorStats[operator].talkTimeCount++;
      }

      // Calcular score de qualidade baseado nas perguntas
      const quality1 = pergunta1Col ? (parseFloat(row[pergunta1Col]) || 0) : 0;
      const quality2 = pergunta2Col ? (parseFloat(row[pergunta2Col]) || 0) : 0;
      
      if (quality1 > 0 || quality2 > 0) {
        operatorStats[operator].qualityScore += (quality1 + quality2) / 2;
        operatorStats[operator].qualityCount++;
      }
    });

    return Object.values(operatorStats).map(op => ({
      ...op,
      answerRate: op.totalCalls > 0 ? (op.answeredCalls / op.totalCalls) * 100 : 0,
      abandonmentRate: op.totalCalls > 0 ? (op.abandonedCalls / op.totalCalls) * 100 : 0,
      avgWaitTime: op.waitTimeCount > 0 ? op.totalWaitTime / op.waitTimeCount : 0,
      avgTalkTime: op.talkTimeCount > 0 ? op.totalTalkTime / op.talkTimeCount : 0,
      avgQualityScore: op.qualityCount > 0 ? op.qualityScore / op.qualityCount : 0
    }));
  };

  const processHourlyData = (data: any[]) => {
    console.log('🕐 Processando dados por hora...');
    const hourlyStats: { [key: number]: any } = {};
    
    data.forEach(row => {
      const horaCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('hora') && !key.toLowerCase().includes('atendimento')
      );
      
      if (!horaCol) return;
      
      const hora = new Date(`2000-01-01T${row[horaCol]}`).getHours();
      
      if (!hourlyStats[hora]) {
        hourlyStats[hora] = {
          hour: hora,
          totalCalls: 0,
          answeredCalls: 0,
          abandonedCalls: 0
        };
      }

      hourlyStats[hora].totalCalls++;
      // Lógica similar para answeredCalls, abandonedCalls
    });

    return Object.values(hourlyStats).map(hour => ({
      ...hour,
      answerRate: hour.totalCalls > 0 ? (hour.answeredCalls / hour.totalCalls) * 100 : 0,
      abandonmentRate: hour.totalCalls > 0 ? (hour.abandonedCalls / hour.totalCalls) * 100 : 0
    }));
  };

  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  const formatSecondsToMMSS = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRefreshData = async () => {
    try {
      await processDataForAnalysis();
      showSuccess('Dados Atualizados', 'Relatório atualizado com sucesso!');
    } catch (err: any) {
      showError('Erro na Atualização', `Erro ao atualizar dados: ${err.message}`);
    }
  };

  const handleOperatorSelect = (operatorId: string) => {
    if (operatorId === 'all') {
      setSelectedOperator('all');
      setSelectedOperatorDetails(null);
    } else {
      setSelectedOperator(operatorId);
      const operator = reportData?.operatorData.find(op => op.operator === operatorId);
      setSelectedOperatorDetails(operator);
    }
    setShowOperatorSelector(false);
  };

  const getFilteredData = () => {
    if (!reportData || selectedOperator === 'all') {
      return reportData;
    }

    // Filtrar dados por operador selecionado
    const filteredData = {
      ...reportData,
      operatorData: reportData.operatorData.filter(op => op.operator === selectedOperator),
    };

    return filteredData;
  };

  if (!isInitialized) {
    return (
      <div className="veloigp-reports">
        <div className="reports-header">
          <h1>Relatórios VeloIGP</h1>
          <p>Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="veloigp-reports">
      <div className="reports-header">
        <h1 className="velotax-title-1">
          <i className="fas fa-chart-line"></i>
          Relatórios VeloIGP
        </h1>
        <p>Análise completa de desempenho e métricas de atendimento</p>
        
        <div className="header-actions">
          <div className="operator-selector">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowOperatorSelector(!showOperatorSelector)}
            >
              <i className="fas fa-users"></i>
              {selectedOperator === 'all' ? 'Todos os Operadores' : selectedOperatorDetails?.operator || 'Selecionar Operador'}
              <i className="fas fa-chevron-down"></i>
            </button>
            
            {showOperatorSelector && (
              <div className="operator-dropdown">
                <div className="dropdown-header">
                  <h4>Selecionar Operador</h4>
                  <button 
                    className="close-btn"
                    onClick={() => setShowOperatorSelector(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="dropdown-content">
                  <button
                    className={`operator-option ${selectedOperator === 'all' ? 'selected' : ''}`}
                    onClick={() => handleOperatorSelect('all')}
                  >
                    <i className="fas fa-users"></i>
                    <span>Todos os Operadores</span>
                    <span className="operator-count">{reportData?.operatorData.length || 0}</span>
                  </button>
                  
                  {reportData?.operatorData.map((operator, index) => (
                    <button
                      key={index}
                      className={`operator-option ${selectedOperator === operator.operator ? 'selected' : ''}`}
                      onClick={() => handleOperatorSelect(operator.operator)}
                    >
                      <i className="fas fa-user"></i>
                      <span>{operator.operator}</span>
                      <span className="operator-count">{operator.totalCalls}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleRefreshData} 
            className="btn btn-secondary"
            disabled={isLoading}
          >
            <i className="fas fa-sync-alt"></i>
            Atualizar Dados
          </button>
        </div>
      </div>

      {/* Mensagem quando não há dados */}
      {!reportData && !isLoading && (
        <div className="no-data-message">
          <div className="no-data-content">
            <i className="fas fa-database"></i>
            <h3>Carregando Dados da Planilha</h3>
            <p>Conectando com o Google Sheets para carregar os dados reais...</p>
            <div className="loading-spinner"></div>
          </div>
        </div>
      )}

      {/* Seção Principal de Dados e Gráficos */}
      {reportData && (
        <div className="reports-main-section">
          {/* Subseção Superior - Visão Geral e Comparativos */}
          <div className="charts-section">
            <div className="chart-container">
              <h3>Evolução Mensal (Janeiro até agora)</h3>
              <div className="chart-placeholder">
                <p>Gráfico de evolução mensal será exibido aqui</p>
              </div>
            </div>
            
            <div className="chart-container">
              <h3>Comparativo Semanal</h3>
              <div className="chart-placeholder">
                <p>Gráfico comparativo semanal será exibido aqui</p>
              </div>
            </div>
          </div>

          {/* Subseção Inferior - Métricas Principais */}
          <div className="metrics-section">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="metric-content">
                  <h4>Total de Chamadas</h4>
                  <span className="metric-value">{reportData.totalCalls}</span>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="metric-content">
                  <h4>Taxa de Atendimento</h4>
                  <span className="metric-value">{reportData.answerRate.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-times-circle"></i>
                </div>
                <div className="metric-content">
                  <h4>Taxa de Abandono</h4>
                  <span className="metric-value">{reportData.abandonmentRate.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="metric-content">
                  <h4>Tempo Médio de Espera</h4>
                  <span className="metric-value">{formatSecondsToMMSS(reportData.avgWaitTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Operadores */}
          <div className="operators-section">
            <div className="operators-header">
              <h3>
                <i className="fas fa-users"></i>
                Análise dos Operadores
                {selectedOperator !== 'all' && (
                  <span className="selected-operator">
                    - {selectedOperatorDetails?.operator}
                  </span>
                )}
              </h3>
              <div className="operators-summary">
                <div className="summary-item">
                  <span className="label">Total de Operadores:</span>
                  <span className="value">{reportData.operatorData.length}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Chamadas Analisadas:</span>
                  <span className="value">{reportData.totalCalls}</span>
                </div>
              </div>
            </div>
            
            <div className="operators-grid">
              {getFilteredData()?.operatorData.map((operator, index) => (
                <div key={index} className="operator-card">
                  <div className="operator-header">
                    <h4>{operator.operator}</h4>
                    <span className={`operator-status ${
                      operator.avgQualityScore > 4 ? 'excellent' : 
                      operator.avgQualityScore > 3 ? 'good' : 
                      operator.avgQualityScore > 2 ? 'regular' : 'needs-improvement'
                    }`}>
                      {operator.avgQualityScore > 4 ? 'Excelente' : 
                       operator.avgQualityScore > 3 ? 'Bom' : 
                       operator.avgQualityScore > 2 ? 'Regular' : 'Precisa Melhorar'}
                    </span>
                  </div>
                  <div className="operator-metrics">
                    <div className="metric">
                      <span className="label">Total de Chamadas:</span>
                      <span className="value">{operator.totalCalls}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Taxa de Atendimento:</span>
                      <span className="value">{operator.answerRate.toFixed(1)}%</span>
                    </div>
                    <div className="metric">
                      <span className="label">Taxa de Abandono:</span>
                      <span className="value">{operator.abandonmentRate.toFixed(1)}%</span>
                    </div>
                    <div className="metric">
                      <span className="label">Tempo Médio de Espera:</span>
                      <span className="value">{formatSecondsToMMSS(operator.avgWaitTime)}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Tempo Médio de Atendimento:</span>
                      <span className="value">{formatSecondsToMMSS(operator.avgTalkTime)}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Score de Qualidade:</span>
                      <span className="value">{operator.avgQualityScore.toFixed(1)}/5</span>
                    </div>
                  </div>
                  <div className="operator-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleOperatorSelect(operator.operator)}
                    >
                      <i className="fas fa-chart-bar"></i>
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isGeneratingReport && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Gerando relatório...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VeloigpReports;