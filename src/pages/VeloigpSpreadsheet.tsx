import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import VirtualizedTable from '../components/VirtualizedTable';
import AdvancedExport from '../components/export/AdvancedExport';
import AdvancedFilters from '../components/filters/AdvancedFilters';
import InteractiveCharts from '../components/charts/InteractiveCharts';
import AdvancedSpreadsheetFilters from '../components/planilha/AdvancedSpreadsheetFilters';
import SpreadsheetExporter from '../components/planilha/SpreadsheetExporter';
import SimpleFunctionalLoading from '../components/ui/SimpleFunctionalLoading';
import { useInstantData } from '../hooks/useInstantData';
import './VeloigpSpreadsheet.css';

const VeloigpSpreadsheet: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'analysis' | 'operators' | 'periods'>('data');
  const [filteredData, setFilteredData] = useState<any[][]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedOperator] = useState<string>('');
  const [selectedPeriod] = useState<string>('');
  const [, setFilterConfig] = useState<any>(null);
  const { theme } = useTheme();

  // Hook de dados instantâneos
  const {
    data: cachedData,
    isLoading,
    error,
    isLoaded,
    reload,
    clearError
  } = useInstantData();

  useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      setFilteredData(cachedData.currentSheet.data);
      
      // Gerar análises básicas
      const analysis = {
        totalCalls: cachedData.currentSheet.data.length - 1,
        answerRate: 85.5, // Placeholder - calcular baseado nos dados
        averageTime: 3.2, // Placeholder - calcular baseado nos dados
        operators: getAvailableOperators().length
      };
      setAnalysisData(analysis);

      console.log('✅ Dados da planilha carregados com sucesso');
    }
  }, [cachedData]);

  const getAvailableOperators = () => {
    if (!data?.currentSheet?.data) return [];
    return Array.from(new Set(
      data.currentSheet.data
        .slice(1) // Pular cabeçalho
        .map((row: any[]) => row[2]) // Coluna do operador
        .filter(Boolean)
    )) as string[];
  };

  const getAvailablePeriods = () => {
    if (!data?.currentSheet?.data) return [];
    return Array.from(new Set(
      data.currentSheet.data
        .slice(1) // Pular cabeçalho
        .map((row: any[]) => row[0]) // Coluna da data
        .filter(Boolean)
    )) as string[];
  };

  const filterData = () => {
    if (!data?.currentSheet?.data) return;
    
    let filtered = data.currentSheet.data.slice(1); // Remove header
    
    if (selectedOperator) {
      filtered = filtered.filter((row: any[]) => row[2] === selectedOperator);
    }
    
    if (selectedPeriod) {
      filtered = filtered.filter((row: any[]) => row[0] === selectedPeriod);
    }
    
    setFilteredData(filtered);
  };

  useEffect(() => {
    filterData();
  }, [selectedOperator, selectedPeriod, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading real
  if (isLoading && !isLoaded) {
    return (
      <SimpleFunctionalLoading
        message="Carregando dados da planilha..."
        showProgress={true}
        progress={90}
      />
    );
  }

  if (error) {
    return (
      <div className="veloigp-spreadsheet">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Erro ao Carregar Dados</h3>
          <p>{error}</p>
          <button onClick={reload} className="retry-btn">
            <i className="fas fa-redo"></i>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="veloigp-spreadsheet" data-theme={theme}>
      {/* Header */}
      <div className="spreadsheet-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-table"></i>
            Dados da Planilha
          </h1>
          <p>Análise completa dos dados 55PBX conectados</p>
        </div>
        <div className="header-actions">
          <AdvancedExport 
            data={filteredData}
            headers={data?.currentSheet?.headers || []}
            title="Dados da Planilha - 55PBX"
            metadata={{
              totalRecords: filteredData.length,
              operators: getAvailableOperators(),
              periods: getAvailablePeriods(),
              generatedAt: new Date()
            }}
          />
          <button onClick={reload} className="refresh-btn">
            <i className="fas fa-sync-alt"></i>
            Atualizar
          </button>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="spreadsheet-tabs">
        <button
          className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <i className="fas fa-table"></i>
          Dados Brutos
        </button>
        <button
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          <i className="fas fa-chart-line"></i>
          Análise
        </button>
        <button
          className={`tab-btn ${activeTab === 'operators' ? 'active' : ''}`}
          onClick={() => setActiveTab('operators')}
        >
          <i className="fas fa-users"></i>
          Operadores
        </button>
        <button
          className={`tab-btn ${activeTab === 'periods' ? 'active' : ''}`}
          onClick={() => setActiveTab('periods')}
        >
          <i className="fas fa-calendar"></i>
          Períodos
        </button>
      </div>

      {/* Filtros Avançados da Planilha */}
      <AdvancedSpreadsheetFilters
        data={data?.currentSheet?.data || []}
        onFiltersChange={(filters) => {
          console.log('Filtros aplicados:', filters);
        }}
        onDataFiltered={setFilteredData}
      />

      {/* Exportador de Dados */}
      <SpreadsheetExporter
        data={filteredData.length > 0 ? filteredData : data?.currentSheet?.data || []}
        filename="dados-veloigp"
        onExport={(format) => {
          console.log(`Dados exportados em formato ${format}`);
        }}
      />

      {/* Filtros Avançados (Legacy) */}
      <AdvancedFilters
        data={data?.currentSheet?.data || []}
        onFilterChange={setFilteredData}
        onConfigChange={setFilterConfig}
      />

      {/* Conteúdo das Abas */}
      <div className="spreadsheet-content">
        {activeTab === 'data' && (
          <div className="tab-content">
            <div className="data-section">
              <div className="data-info">
                <h3>Dados da Planilha</h3>
                <p>Mostrando {filteredData.length} registros de {data?.currentSheet?.data?.length - 1 || 0} total</p>
              </div>

              {filteredData.length > 100 ? (
                <VirtualizedTable
                  data={[data?.currentSheet?.headers || [], ...filteredData]}
                  headers={data?.currentSheet?.headers || []}
                  height={500}
                  itemHeight={40}
                />
              ) : (
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        {(data?.currentSheet?.headers || []).map((header: string, index: number) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell || ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="tab-content">
            <div className="analysis-section">
              <h3>Análise dos Dados</h3>
              
              {analysisData && (
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <div className="card-header">
                      <i className="fas fa-phone"></i>
                      <h4>Total de Chamadas</h4>
                    </div>
                    <div className="card-value">{analysisData.totalCalls || 0}</div>
                  </div>
                  
                  <div className="analysis-card">
                    <div className="card-header">
                      <i className="fas fa-check-circle"></i>
                      <h4>Taxa de Atendimento</h4>
                    </div>
                    <div className="card-value">{(analysisData.answerRate || 0).toFixed(1)}%</div>
                  </div>
                  
                  <div className="analysis-card">
                    <div className="card-header">
                      <i className="fas fa-users"></i>
                      <h4>Operadores Ativos</h4>
                    </div>
                    <div className="card-value">{getAvailableOperators().length}</div>
                  </div>
                  
                  <div className="analysis-card">
                    <div className="card-header">
                      <i className="fas fa-clock"></i>
                      <h4>Tempo Médio</h4>
                    </div>
                    <div className="card-value">{(analysisData.averageTime || 0).toFixed(1)}min</div>
                  </div>
                </div>
              )}

              {/* Gráficos Interativos */}
              <InteractiveCharts
                data={filteredData}
                headers={data?.currentSheet?.headers || []}
                type="overview"
              />
            </div>
          </div>
        )}

        {activeTab === 'operators' && (
          <div className="tab-content">
            <div className="operators-section">
              <h3>Análise por Operador</h3>
              
              <div className="operators-grid">
                {getAvailableOperators().map(operator => {
                  const operatorData = filteredData.filter(row => row[2] === operator);
                  const calls = operatorData.length;
                  const answered = operatorData.filter(row => row[4] === 'answered').length;
                  const rate = calls > 0 ? (answered / calls) * 100 : 0;
                  
                  return (
                    <div key={operator} className="operator-card">
                      <div className="operator-header">
                        <i className="fas fa-user"></i>
                        <h4>{operator}</h4>
                      </div>
                      <div className="operator-stats">
                        <div className="stat">
                          <span className="stat-label">Chamadas:</span>
                          <span className="stat-value">{calls}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Atendidas:</span>
                          <span className="stat-value">{answered}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Taxa:</span>
                          <span className="stat-value">{rate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Gráfico de Operadores */}
              <InteractiveCharts
                data={filteredData}
                headers={data?.currentSheet?.headers || []}
                type="operators"
              />
            </div>
          </div>
        )}

        {activeTab === 'periods' && (
          <div className="tab-content">
            <div className="periods-section">
              <h3>Análise por Período</h3>
              
              <div className="periods-grid">
                {getAvailablePeriods().map(period => {
                  const periodData = filteredData.filter(row => row[0] === period);
                  const calls = periodData.length;
                  const answered = periodData.filter(row => row[4] === 'answered').length;
                  const rate = calls > 0 ? (answered / calls) * 100 : 0;
                  
                  return (
                    <div key={period} className="period-card">
                      <div className="period-header">
                        <i className="fas fa-calendar-day"></i>
                        <h4>{period}</h4>
                      </div>
                      <div className="period-stats">
                        <div className="stat">
                          <span className="stat-label">Chamadas:</span>
                          <span className="stat-value">{calls}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Atendidas:</span>
                          <span className="stat-value">{answered}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Taxa:</span>
                          <span className="stat-value">{rate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Gráfico de Períodos */}
              <InteractiveCharts
                data={filteredData}
                headers={data?.currentSheet?.headers || []}
                type="periods"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VeloigpSpreadsheet;