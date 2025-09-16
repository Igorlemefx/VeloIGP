import React from 'react';
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
import './PerformanceCharts.css';

// interface ChartData {
//   name: string;
//   value: number;
//   color?: string;
// }

interface PerformanceChartsProps {
  data: {
    callsPerDay: Array<{ date: string; total: number; answered: number; rate: number }>;
    operatorPerformance: Array<{ name: string; calls: number; rate: number; satisfaction: number }>;
    queueDistribution: Array<{ queue: string; calls: number; rate: number }>;
    qualityDistribution: Array<{ quality: string; count: number; percentage: number }>;
    timeDistribution: Array<{ hour: string; calls: number }>;
  };
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ data }) => {
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  // Validar dados e fornecer fallbacks
  const safeData = {
    callsPerDay: data?.callsPerDay || [],
    operatorPerformance: data?.operatorPerformance || [],
    queueDistribution: data?.queueDistribution || [],
    qualityDistribution: data?.qualityDistribution || [],
    timeDistribution: data?.timeDistribution || []
  };

  return (
    <div className="performance-charts">
      <div className="charts-grid">
        {/* Gráfico de Chamadas por Dia */}
        <div className="chart-container">
          <h3>Evolução de Chamadas por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={safeData.callsPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                stackId="1"
                stroke="#667eea"
                fill="#667eea"
                fillOpacity={0.6}
                name="Total de Chamadas"
              />
              <Area
                type="monotone"
                dataKey="answered"
                stackId="2"
                stroke="#28a745"
                fill="#28a745"
                fillOpacity={0.6}
                name="Chamadas Atendidas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Performance dos Operadores */}
        <div className="chart-container">
          <h3>Performance dos Operadores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={safeData.operatorPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="calls" fill="#667eea" name="Total de Chamadas" />
              <Bar dataKey="rate" fill="#28a745" name="Taxa de Atendimento (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Distribuição por Filas */}
        <div className="chart-container">
          <h3>Distribuição por Filas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={safeData.queueDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ queue, percentage }: any) => `${queue}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="calls"
              >
                {safeData.queueDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Distribuição de Qualidade */}
        <div className="chart-container">
          <h3>Distribuição de Qualidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={safeData.qualityDistribution} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="quality" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#f093fb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Distribuição por Horário */}
        <div className="chart-container full-width">
          <h3>Distribuição de Chamadas por Horário</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={safeData.timeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="calls"
                stroke="#667eea"
                strokeWidth={3}
                dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Satisfação vs Taxa de Atendimento */}
        <div className="chart-container full-width">
          <h3>Satisfação vs Taxa de Atendimento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={safeData.operatorPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="rate" fill="#28a745" name="Taxa de Atendimento (%)" />
              <Bar yAxisId="right" dataKey="satisfaction" fill="#ffc107" name="Satisfação Média" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
