import React from 'react';
import './MetricsCharts.css';

interface ChartData {
  label: string;
  value: number;
  color: string;
  icon: string;
}

interface MetricsChartsProps {
  data: ChartData[];
  title?: string;
  type?: 'bar' | 'donut' | 'line' | 'progress';
}

const MetricsCharts: React.FC<MetricsChartsProps> = ({
  data,
  title = 'Métricas de Performance',
  type = 'bar'
}) => {
  const maxValue = Math.max(...data.map(item => item.value));

  const renderBarChart = () => (
    <div className="chart-container chart-container--bar">
      <div className="chart-title">{title}</div>
      <div className="chart-content">
        {data.map((item, index) => (
          <div key={index} className="bar-item">
            <div className="bar-label">
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color
                }}
              >
                <span className="bar-value">{item.value.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDonutChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="chart-container chart-container--donut">
        <div className="chart-title">{title}</div>
        <div className="donut-wrapper">
          <svg className="donut-chart" viewBox="0 0 200 200">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const circumference = 2 * Math.PI * 80;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercentage * circumference / 100;
              
              cumulativePercentage += percentage;

              return (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 100 100)"
                  className="donut-segment"
                />
              );
            })}
          </svg>
          <div className="donut-center">
            <div className="donut-total">{total.toLocaleString()}</div>
            <div className="donut-label">Total</div>
          </div>
        </div>
        <div className="donut-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: item.color }}></div>
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProgressChart = () => (
    <div className="chart-container chart-container--progress">
      <div className="chart-title">{title}</div>
      <div className="progress-grid">
        {data.map((item, index) => (
          <div key={index} className="progress-item">
            <div className="progress-header">
              <i className={item.icon}></i>
              <span className="progress-label">{item.label}</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color
                }}
              >
                <span className="progress-value">{item.value.toLocaleString()}</span>
              </div>
            </div>
            <div className="progress-percentage">
              {((item.value / maxValue) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLineChart = () => (
    <div className="chart-container chart-container--line">
      <div className="chart-title">{title}</div>
      <div className="line-chart">
        <svg viewBox="0 0 400 200" className="line-svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {data.map((item, index) => (
                <stop
                  key={index}
                  offset={`${(index / (data.length - 1)) * 100}%`}
                  stopColor={item.color}
                />
              ))}
            </linearGradient>
          </defs>
          <polyline
            points={data.map((item, index) => 
              `${(index / (data.length - 1)) * 400},${200 - (item.value / maxValue) * 180}`
            ).join(' ')}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            className="line-path"
          />
          {data.map((item, index) => (
            <circle
              key={index}
              cx={(index / (data.length - 1)) * 400}
              cy={200 - (item.value / maxValue) * 180}
              r="6"
              fill={item.color}
              className="line-point"
            />
          ))}
        </svg>
        <div className="line-labels">
          {data.map((item, index) => (
            <div
              key={index}
              className="line-label"
              style={{ left: `${(index / (data.length - 1)) * 100}%` }}
            >
              <div className="line-label-value">{item.value.toLocaleString()}</div>
              <div className="line-label-text">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'donut':
        return renderDonutChart();
      case 'line':
        return renderLineChart();
      case 'progress':
        return renderProgressChart();
      default:
        return renderBarChart();
    }
  };

  return renderChart();
};

export default MetricsCharts;


