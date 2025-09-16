import React, { useState, useEffect } from 'react';
import predictiveAnalysisService from '../../services/predictiveAnalysisService';
import './PredictiveAnalytics.css';

interface PredictionData {
  period: string;
  predictedCalls: number;
  predictedEfficiency: number;
  predictedWaitTime: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

interface TrendAnalysis {
  calls: {
    current: number;
    previous: number;
    change: number;
    percentage: number;
  };
  efficiency: {
    current: number;
    previous: number;
    change: number;
    percentage: number;
  };
  waitTime: {
    current: number;
    previous: number;
    change: number;
    percentage: number;
  };
}

const PredictiveAnalytics: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'predictions' | 'trends' | 'insights'>('predictions');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    setPredictions(predictiveAnalysisService.getPredictions());
    setTrends(predictiveAnalysisService.getTrendAnalysis());
    setInsights(predictiveAnalysisService.getInsights());
    setRecommendations(predictiveAnalysisService.getRecommendations());
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'fas fa-arrow-up text-green-500';
      case 'down': return 'fas fa-arrow-down text-red-500';
      case 'stable': return 'fas fa-minus text-gray-500';
      default: return 'fas fa-question text-gray-500';
    }
  };

  const getTrendColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-500';
    if (percentage < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="predictive-analytics">
      <div className="analytics-header">
        <h2>
          <i className="fas fa-brain"></i>
          Análise Preditiva
        </h2>
        <p>Insights e previsões baseadas em dados históricos</p>
      </div>

      <div className="analytics-tabs">
        <button
          className={`tab-button ${activeTab === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictions')}
        >
          <i className="fas fa-crystal-ball"></i>
          Previsões
        </button>
        <button
          className={`tab-button ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          <i className="fas fa-chart-line"></i>
          Tendências
        </button>
        <button
          className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <i className="fas fa-lightbulb"></i>
          Insights
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'predictions' && (
          <div className="predictions-section">
            <h3>Previsões de Performance</h3>
            <div className="predictions-grid">
              {predictions.map((prediction, index) => (
                <div key={index} className="prediction-card">
                  <div className="prediction-header">
                    <h4>{prediction.period}</h4>
                    <div className="confidence-badge">
                      <i className="fas fa-shield-alt"></i>
                      <span className={getConfidenceColor(prediction.confidence)}>
                        {formatConfidence(prediction.confidence)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="prediction-metrics">
                    <div className="metric-item">
                      <div className="metric-label">Chamadas Previstas</div>
                      <div className="metric-value">
                        {prediction.predictedCalls.toLocaleString()}
                        <i className={getTrendIcon(prediction.trend)}></i>
                      </div>
                    </div>
                    
                    <div className="metric-item">
                      <div className="metric-label">Eficiência Prevista</div>
                      <div className="metric-value">
                        {prediction.predictedEfficiency.toFixed(1)}%
                        <i className={getTrendIcon(prediction.trend)}></i>
                      </div>
                    </div>
                    
                    <div className="metric-item">
                      <div className="metric-label">Tempo de Espera</div>
                      <div className="metric-value">
                        {Math.floor(prediction.predictedWaitTime / 60)}min
                        <i className={getTrendIcon(prediction.trend)}></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trends' && trends && (
          <div className="trends-section">
            <h3>Análise de Tendências</h3>
            <div className="trends-grid">
              <div className="trend-card">
                <div className="trend-header">
                  <i className="fas fa-phone"></i>
                  <h4>Volume de Chamadas</h4>
                </div>
                <div className="trend-content">
                  <div className="current-value">{trends.calls.current.toLocaleString()}</div>
                  <div className={`change-value ${getTrendColor(trends.calls.percentage)}`}>
                    <i className={trends.calls.percentage > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'}></i>
                    {Math.abs(trends.calls.percentage).toFixed(1)}%
                  </div>
                  <div className="previous-value">Anterior: {trends.calls.previous.toLocaleString()}</div>
                </div>
              </div>

              <div className="trend-card">
                <div className="trend-header">
                  <i className="fas fa-chart-line"></i>
                  <h4>Eficiência</h4>
                </div>
                <div className="trend-content">
                  <div className="current-value">{trends.efficiency.current.toFixed(1)}%</div>
                  <div className={`change-value ${getTrendColor(trends.efficiency.percentage)}`}>
                    <i className={trends.efficiency.percentage > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'}></i>
                    {Math.abs(trends.efficiency.percentage).toFixed(1)}%
                  </div>
                  <div className="previous-value">Anterior: {trends.efficiency.previous.toFixed(1)}%</div>
                </div>
              </div>

              <div className="trend-card">
                <div className="trend-header">
                  <i className="fas fa-clock"></i>
                  <h4>Tempo de Espera</h4>
                </div>
                <div className="trend-content">
                  <div className="current-value">{Math.floor(trends.waitTime.current / 60)}min</div>
                  <div className={`change-value ${getTrendColor(trends.waitTime.percentage)}`}>
                    <i className={trends.waitTime.percentage > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'}></i>
                    {Math.abs(trends.waitTime.percentage).toFixed(1)}%
                  </div>
                  <div className="previous-value">Anterior: {Math.floor(trends.waitTime.previous / 60)}min</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-section">
            <div className="insights-grid">
              <div className="insights-card">
                <h3>
                  <i className="fas fa-lightbulb"></i>
                  Insights Automáticos
                </h3>
                <div className="insights-list">
                  {insights.map((insight, index) => (
                    <div key={index} className="insight-item">
                      <i className="fas fa-info-circle"></i>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="recommendations-card">
                <h3>
                  <i className="fas fa-tasks"></i>
                  Recomendações
                </h3>
                <div className="recommendations-list">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="recommendation-item">
                      <i className="fas fa-check-circle"></i>
                      <span>{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictiveAnalytics;


