import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import { useMCPGoogleSheets } from '../hooks/useMCPGoogleSheets';
import './VeloigpUnified.css';

interface SectionData {
  id: string;
  title: string;
  loaded: boolean;
  data: any;
  error?: string;
}

const VeloigpUnified: React.FC = () => {
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

  const [sections, setSections] = useState<SectionData[]>([
    { id: 'overview', title: 'Visão Geral', loaded: false, data: null },
    { id: 'operators', title: 'Análise de Operadores', loaded: false, data: null },
    { id: 'monthly', title: 'Evolução Mensal', loaded: false, data: null },
    { id: 'weekly', title: 'Análise Semanal', loaded: false, data: null },
    { id: 'hourly', title: 'Distribuição por Hora', loaded: false, data: null },
    { id: 'quality', title: 'Análise de Qualidade', loaded: false, data: null }
  ]);

  const [selectedOperator, setSelectedOperator] = useState<string>('all');
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('overview');
  
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Configurar Intersection Observer para detectar quando uma seção entra na viewport
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId) {
              setCurrentSection(sectionId);
              loadSectionData(sectionId);
            }
          }
        });
      },
      { 
        threshold: 0.3, // Carrega quando 30% da seção está visível
        rootMargin: '50px 0px' // Margem de 50px para carregar antes de ficar totalmente visível
      }
    );

    // Observar todas as seções
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Carregar dados de uma seção específica
  const loadSectionData = useCallback(async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || section.loaded || !processedData) return;

    console.log(`🔄 Carregando dados da seção: ${sectionId}`);
    
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, loaded: true } : s
    ));

    try {
      let sectionData = null;

      switch (sectionId) {
        case 'overview':
          sectionData = await generateOverviewData();
          break;
        case 'operators':
          sectionData = await generateOperatorsData();
          break;
        case 'monthly':
          sectionData = await generateMonthlyData();
          break;
        case 'weekly':
          sectionData = await generateWeeklyData();
          break;
        case 'hourly':
          sectionData = await generateHourlyData();
          break;
        case 'quality':
          sectionData = await generateQualityData();
          break;
      }

      setSections(prev => prev.map(s => 
        s.id === sectionId ? { ...s, data: sectionData } : s
      ));

      console.log(`✅ Dados da seção ${sectionId} carregados:`, sectionData);
    } catch (err: any) {
      console.error(`❌ Erro ao carregar seção ${sectionId}:`, err);
      setSections(prev => prev.map(s => 
        s.id === sectionId ? { ...s, error: err.message } : s
      ));
    }
  }, [sections, processedData]);

  // Gerar dados da visão geral
  const generateOverviewData = async () => {
    if (!metrics) return null;
    
    return {
      totalCalls: metrics.totalCalls,
      answeredCalls: metrics.answeredCalls,
      abandonedCalls: metrics.abandonedCalls,
      answerRate: metrics.answerRate,
      abandonmentRate: metrics.abandonmentRate,
      avgWaitTime: metrics.avgWaitTimeSeconds,
      avgTalkTime: metrics.avgTalkTimeSeconds,
      lastUpdate: new Date().toLocaleString('pt-BR')
    };
  };

  // Gerar dados dos operadores
  const generateOperatorsData = async () => {
    if (!processedData) return null;
    
    const operatorStats: { [key: string]: any } = {};
    
    processedData.forEach(row => {
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

  // Gerar dados mensais
  const generateMonthlyData = async () => {
    if (!processedData) return null;
    
    const monthlyStats: { [key: string]: any } = {};
    
    processedData.forEach(row => {
      const dataCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('data') && !key.toLowerCase().includes('atendimento')
      );
      
      if (!dataCol) return;
      
      const date = new Date(row[dataCol]);
      if (isNaN(date.getTime())) return;
      
      const month = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          month,
          totalCalls: 0,
          answeredCalls: 0,
          abandonedCalls: 0
        };
      }

      monthlyStats[month].totalCalls++;
      // Lógica similar para answeredCalls, abandonedCalls
    });

    return Object.values(monthlyStats).map(month => ({
      ...month,
      answerRate: month.totalCalls > 0 ? (month.answeredCalls / month.totalCalls) * 100 : 0,
      abandonmentRate: month.totalCalls > 0 ? (month.abandonedCalls / month.totalCalls) * 100 : 0
    }));
  };

  // Gerar dados semanais
  const generateWeeklyData = async () => {
    if (!processedData) return null;
    
    const weeklyStats: { [key: string]: any } = {};
    
    processedData.forEach(row => {
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
          abandonedCalls: 0
        };
      }

      weeklyStats[week].totalCalls++;
    });

    return Object.values(weeklyStats).map(week => ({
      ...week,
      answerRate: week.totalCalls > 0 ? (week.answeredCalls / week.totalCalls) * 100 : 0,
      abandonmentRate: week.totalCalls > 0 ? (week.abandonedCalls / week.totalCalls) * 100 : 0
    }));
  };

  // Gerar dados por hora
  const generateHourlyData = async () => {
    if (!processedData) return null;
    
    const hourlyStats: { [key: number]: any } = {};
    
    processedData.forEach(row => {
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
    });

    return Object.values(hourlyStats).map(hour => ({
      ...hour,
      answerRate: hour.totalCalls > 0 ? (hour.answeredCalls / hour.totalCalls) * 100 : 0,
      abandonmentRate: hour.totalCalls > 0 ? (hour.abandonedCalls / hour.totalCalls) * 100 : 0
    }));
  };

  // Gerar dados de qualidade
  const generateQualityData = async () => {
    if (!processedData) return null;
    
    const qualityStats = {
      totalEvaluations: 0,
      averageScore: 0,
      scoreDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      operatorQuality: [] as any[]
    };

    const operatorQuality: { [key: string]: any } = {};
    
    processedData.forEach(row => {
      const operadorCol = Object.keys(row).find(key => 
        key.toLowerCase().includes('operador')
      );
      const pergunta1Col = Object.keys(row).find(key => 
        key.toLowerCase().includes('pergunta') && key.includes('1')
      );
      const pergunta2Col = Object.keys(row).find(key => 
        key.toLowerCase().includes('pergunta') && key.includes('2')
      );
      
      const operator = operadorCol ? (row[operadorCol] || 'Não identificado') : 'Não identificado';
      const quality1 = pergunta1Col ? (parseFloat(row[pergunta1Col]) || 0) : 0;
      const quality2 = pergunta2Col ? (parseFloat(row[pergunta2Col]) || 0) : 0;
      
      if (quality1 > 0 || quality2 > 0) {
        const avgScore = (quality1 + quality2) / 2;
        const roundedScore = Math.round(avgScore);
        
        qualityStats.totalEvaluations++;
        qualityStats.averageScore += avgScore;
        qualityStats.scoreDistribution[roundedScore as keyof typeof qualityStats.scoreDistribution]++;
        
        if (!operatorQuality[operator]) {
          operatorQuality[operator] = {
            operator,
            totalEvaluations: 0,
            totalScore: 0,
            averageScore: 0
          };
        }
        
        operatorQuality[operator].totalEvaluations++;
        operatorQuality[operator].totalScore += avgScore;
      }
    });

    qualityStats.averageScore = qualityStats.totalEvaluations > 0 ? 
      qualityStats.averageScore / qualityStats.totalEvaluations : 0;

    qualityStats.operatorQuality = Object.values(operatorQuality).map(op => ({
      ...op,
      averageScore: op.totalEvaluations > 0 ? op.totalScore / op.totalEvaluations : 0
    }));

    return qualityStats;
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
      setIsGeneratingData(true);
      await processDataForAnalysis();
      
      // Resetar todas as seções para recarregar
      setSections(prev => prev.map(s => ({ ...s, loaded: false, data: null, error: undefined })));
      
      showSuccess('Dados Atualizados', 'Sistema atualizado com sucesso!');
    } catch (err: any) {
      showError('Erro na Atualização', `Erro ao atualizar dados: ${err.message}`);
    } finally {
      setIsGeneratingData(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isInitialized) {
    return (
      <div className="veloigp-unified">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="veloigp-unified" data-theme={theme}>
      {/* Header Fixo */}
      <div className="unified-header">
        <div className="header-content">
          <h1 className="velotax-title-1">
            <i className="fas fa-chart-line"></i>
            VeloIGP - Sistema Unificado
          </h1>
          <p>Análise completa de desempenho e métricas de atendimento</p>
          
          <div className="header-actions">
            <div className="section-navigation">
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`nav-button ${currentSection === section.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleRefreshData} 
              className="btn btn-primary"
              disabled={isGeneratingData}
            >
              <i className="fas fa-sync-alt"></i>
              {isGeneratingData ? 'Atualizando...' : 'Atualizar Dados'}
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Visão Geral */}
      <div 
        ref={el => { sectionRefs.current.overview = el; }}
        data-section-id="overview"
        className="section overview-section"
      >
        <div className="section-header">
          <h2>
            <i className="fas fa-tachometer-alt"></i>
            Visão Geral
          </h2>
          <p>Métricas principais do sistema</p>
        </div>
        
        <div className="section-content">
          {sections.find(s => s.id === 'overview')?.loaded ? (
            <div className="metrics-grid">
              {sections.find(s => s.id === 'overview')?.data && (
                <>
                  <div className="metric-card">
                    <div className="metric-icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="metric-content">
                      <h4>Total de Chamadas</h4>
                      <span className="metric-value">
                        {sections.find(s => s.id === 'overview')?.data.totalCalls}
                      </span>
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="metric-content">
                      <h4>Taxa de Atendimento</h4>
                      <span className="metric-value">
                        {sections.find(s => s.id === 'overview')?.data.answerRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-icon">
                      <i className="fas fa-times-circle"></i>
                    </div>
                    <div className="metric-content">
                      <h4>Taxa de Abandono</h4>
                      <span className="metric-value">
                        {sections.find(s => s.id === 'overview')?.data.abandonmentRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="metric-content">
                      <h4>Tempo Médio de Espera</h4>
                      <span className="metric-value">
                        {formatSecondsToMMSS(sections.find(s => s.id === 'overview')?.data.avgWaitTime || 0)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
              <p>Carregando métricas principais...</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Operadores */}
      <div 
        ref={el => { sectionRefs.current.operators = el; }}
        data-section-id="operators"
        className="section operators-section"
      >
        <div className="section-header">
          <h2>
            <i className="fas fa-users"></i>
            Análise de Operadores
          </h2>
          <p>Desempenho individual dos operadores</p>
        </div>
        
        <div className="section-content">
          {sections.find(s => s.id === 'operators')?.loaded ? (
            <div className="operators-grid">
              {sections.find(s => s.id === 'operators')?.data?.map((operator: any, index: number) => (
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
                      <span className="label">Score de Qualidade:</span>
                      <span className="value">{operator.avgQualityScore.toFixed(1)}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
              <p>Carregando dados dos operadores...</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção Mensal */}
      <div 
        ref={el => { sectionRefs.current.monthly = el; }}
        data-section-id="monthly"
        className="section monthly-section"
      >
        <div className="section-header">
          <h2>
            <i className="fas fa-calendar-alt"></i>
            Evolução Mensal
          </h2>
          <p>Análise de tendências por mês</p>
        </div>
        
        <div className="section-content">
          {sections.find(s => s.id === 'monthly')?.loaded ? (
            <div className="chart-container">
              <div className="chart-placeholder">
                <p>Gráfico de evolução mensal será exibido aqui</p>
                <div className="data-preview">
                  {sections.find(s => s.id === 'monthly')?.data?.map((month: any, index: number) => (
                    <div key={index} className="data-item">
                      <span className="month">{month.month}</span>
                      <span className="calls">{month.totalCalls} chamadas</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
              <p>Carregando dados mensais...</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção Semanal */}
      <div 
        ref={el => { sectionRefs.current.weekly = el; }}
        data-section-id="weekly"
        className="section weekly-section"
      >
        <div className="section-header">
          <h2>
            <i className="fas fa-calendar-week"></i>
            Análise Semanal
          </h2>
          <p>Comparativo de desempenho semanal</p>
        </div>
        
        <div className="section-content">
          {sections.find(s => s.id === 'weekly')?.loaded ? (
            <div className="chart-container">
              <div className="chart-placeholder">
                <p>Gráfico de análise semanal será exibido aqui</p>
                <div className="data-preview">
                  {sections.find(s => s.id === 'weekly')?.data?.map((week: any, index: number) => (
                    <div key={index} className="data-item">
                      <span className="week">{week.week}</span>
                      <span className="calls">{week.totalCalls} chamadas</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
              <p>Carregando dados semanais...</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção por Hora */}
      <div 
        ref={el => { sectionRefs.current.hourly = el; }}
        data-section-id="hourly"
        className="section hourly-section"
      >
        <div className="section-header">
          <h2>
            <i className="fas fa-clock"></i>
            Distribuição por Hora
          </h2>
          <p>Análise de volume de chamadas por horário</p>
        </div>
        
        <div className="section-content">
          {sections.find(s => s.id === 'hourly')?.loaded ? (
            <div className="chart-container">
              <div className="chart-placeholder">
                <p>Gráfico de distribuição horária será exibido aqui</p>
                <div className="data-preview">
                  {sections.find(s => s.id === 'hourly')?.data?.map((hour: any, index: number) => (
                    <div key={index} className="data-item">
                      <span className="hour">{hour.hour}h</span>
                      <span className="calls">{hour.totalCalls} chamadas</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
              <p>Carregando dados por hora...</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Qualidade */}
      <div 
        ref={el => { sectionRefs.current.quality = el; }}
        data-section-id="quality"
        className="section quality-section"
      >
        <div className="section-header">
          <h2>
            <i className="fas fa-star"></i>
            Análise de Qualidade
          </h2>
          <p>Métricas de qualidade do atendimento</p>
        </div>
        
        <div className="section-content">
          {sections.find(s => s.id === 'quality')?.loaded ? (
            <div className="quality-metrics">
              {sections.find(s => s.id === 'quality')?.data && (
                <>
                  <div className="quality-summary">
                    <div className="quality-card">
                      <h4>Score Médio Geral</h4>
                      <span className="quality-score">
                        {sections.find(s => s.id === 'quality')?.data.averageScore.toFixed(1)}/5
                      </span>
                    </div>
                    <div className="quality-card">
                      <h4>Total de Avaliações</h4>
                      <span className="quality-count">
                        {sections.find(s => s.id === 'quality')?.data.totalEvaluations}
                      </span>
                    </div>
                  </div>
                  
                  <div className="quality-distribution">
                    <h4>Distribuição de Scores</h4>
                    <div className="score-bars">
                      {Object.entries(sections.find(s => s.id === 'quality')?.data.scoreDistribution || {}).map(([score, count]) => (
                        <div key={score} className="score-bar">
                          <span className="score-label">{score} estrelas</span>
                          <div className="bar-container">
                            <div 
                              className="bar-fill" 
                              style={{ width: `${(count as number / sections.find(s => s.id === 'quality')?.data.totalEvaluations) * 100}%` }}
                            ></div>
                          </div>
                          <span className="score-count">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
              <p>Carregando dados de qualidade...</p>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isGeneratingData && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Atualizando dados do sistema...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VeloigpUnified;
