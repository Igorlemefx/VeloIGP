import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './InteractiveCharts.css';

interface ChartData {
  name: string;
  value?: number;
  [key: string]: any;
}

interface InteractiveChartsProps {
  data: any[][];
  headers: string[];
  type: 'overview' | 'operators' | 'periods' | 'trends';
}

const InteractiveCharts: React.FC<InteractiveChartsProps> = ({ 
  data, 
  headers, 
  type 
}) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedChart, setSelectedChart] = useState<string>('line');
  const [loading, setLoading] = useState(false);

  // Cores do tema Velotax
  const colors = [
    'var(--velotax-blue)', // Navy
    'var(--velotax-teal)', // Teal
    'var(--velotax-orange)', // Orange
    'var(--velotax-purple)', // Purple
    'var(--velotax-magenta)', // Magenta
    'var(--velotax-info)', // Light Blue
    'var(--velotax-warning)', // Yellow
    'var(--velotax-success)'  // Green
  ];

  useEffect(() => {
    processData();
  }, [data, headers, type]); // eslint-disable-line react-hooks/exhaustive-deps

  const processData = () => {
    setLoading(true);
    
    try {
      let processedData: ChartData[] = [];

      switch (type) {
        case 'overview':
          processedData = processOverviewData();
          break;
        case 'operators':
          processedData = processOperatorsData();
          break;
        case 'periods':
          processedData = processPeriodsData();
          break;
        case 'trends':
          processedData = processTrendsData();
          break;
        default:
          processedData = [];
      }

      setChartData(processedData);
    } catch (error) {
      console.error('Erro ao processar dados do gráfico:', error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const processOverviewData = (): ChartData[] => {
    if (!data || data.length === 0) return [];

    const overview = {
      totalChamadas: data.length - 1,
      chamadasAtendidas: data.filter((row, index) => 
        index > 0 && row[4] === 'Atendida'
      ).length,
      chamadasPerdidas: data.filter((row, index) => 
        index > 0 && row[4] === 'Perdida'
      ).length,
      tempoMedio: 3.2 // Placeholder
    };

    return [
      { name: 'Atendidas', value: overview.chamadasAtendidas, color: colors[1] },
      { name: 'Perdidas', value: overview.chamadasPerdidas, color: colors[2] }
    ];
  };

  const processOperatorsData = (): ChartData[] => {
    if (!data || data.length === 0) return [];

    const operatorIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('operador') || 
      h?.toLowerCase().includes('operator')
    );
    const statusIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('chamada') || 
      h?.toLowerCase().includes('status')
    );

    if (operatorIndex === -1 || statusIndex === -1) return [];

    const operatorStats = data.slice(1).reduce((acc, row) => {
      const operator = row[operatorIndex];
      const status = row[statusIndex];
      
      if (!acc[operator]) {
        acc[operator] = { total: 0, atendidas: 0 };
      }
      
      acc[operator].total++;
      if (status === 'Atendida') {
        acc[operator].atendidas++;
      }
      
      return acc;
    }, {} as Record<string, { total: number; atendidas: number }>);

    return Object.entries(operatorStats).map(([operator, stats], index) => ({
      name: operator,
      total: stats.total,
      atendidas: stats.atendidas,
      perdidas: stats.total - stats.atendidas,
      taxaAtendimento: (stats.atendidas / stats.total) * 100,
      color: colors[index % colors.length]
    }));
  };

  const processPeriodsData = (): ChartData[] => {
    if (!data || data.length === 0) return [];

    const dateIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('data') || 
      h?.toLowerCase().includes('date')
    );
    const statusIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('chamada') || 
      h?.toLowerCase().includes('status')
    );

    if (dateIndex === -1 || statusIndex === -1) return [];

    const periodStats = data.slice(1).reduce((acc, row) => {
      const date = row[dateIndex];
      const status = row[statusIndex];
      
      if (!acc[date]) {
        acc[date] = { total: 0, atendidas: 0 };
      }
      
      acc[date].total++;
      if (status === 'Atendida') {
        acc[date].atendidas++;
      }
      
      return acc;
    }, {} as Record<string, { total: number; atendidas: number }>);

    return Object.entries(periodStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats]) => ({
        name: date,
        total: stats.total,
        atendidas: stats.atendidas,
        perdidas: stats.total - stats.atendidas,
        taxaAtendimento: (stats.atendidas / stats.total) * 100
      }));
  };

  const processTrendsData = (): ChartData[] => {
    // Implementar análise de tendências
    return processPeriodsData(); // Por enquanto, usar dados de períodos
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Carregando gráfico...</p>
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="chart-empty">
          <i className="fas fa-chart-line"></i>
          <p>Nenhum dado disponível para o gráfico</p>
        </div>
      );
    }

    switch (selectedChart) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="atendidas" 
                stroke={colors[1]} 
                strokeWidth={3}
                name="Chamadas Atendidas"
              />
              <Line 
                type="monotone" 
                dataKey="perdidas" 
                stroke={colors[2]} 
                strokeWidth={3}
                name="Chamadas Perdidas"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="atendidas" fill={colors[1]} name="Atendidas" />
              <Bar dataKey="perdidas" fill={colors[2]} name="Perdidas" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="atendidas" 
                stackId="1" 
                stroke={colors[1]} 
                fill={colors[1]}
                fillOpacity={0.6}
                name="Atendidas"
              />
              <Area 
                type="monotone" 
                dataKey="perdidas" 
                stackId="2" 
                stroke={colors[2]} 
                fill={colors[2]}
                fillOpacity={0.6}
                name="Perdidas"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={120}
                fill="var(--velotax-blue)"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="interactive-charts">
      <div className="charts-header">
        <h3>
          <i className="fas fa-chart-line"></i>
          Gráficos Interativos
        </h3>
        <div className="chart-controls">
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            className="chart-type-select"
          >
            <option value="line">Linha</option>
            <option value="bar">Barras</option>
            <option value="area">Área</option>
            <option value="pie">Pizza</option>
          </select>
          <button onClick={processData} className="refresh-chart-btn">
            <i className="fas fa-sync-alt"></i>
            Atualizar
          </button>
        </div>
      </div>

      <div className="chart-container">
        {renderChart()}
      </div>

      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Total de Registros:</span>
          <span className="stat-value">{chartData.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tipo de Análise:</span>
          <span className="stat-value">{type}</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCharts;
