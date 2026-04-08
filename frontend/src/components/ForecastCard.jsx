import React from 'react';

const ForecastCard = ({ forecast, loading, topic }) => {
  if (loading) {
    return (
      <div className="forecast-panel is-loading">
        <div className="forecast-avatar skeleton" />
        <div className="forecast-body">
          <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '100%', height: '40px' }} />
        </div>
      </div>
    );
  }

  if (!forecast || !forecast.outlook) return null;

  const { outlook, risks, projectionScore } = forecast;

  // Color mapping based on projection score
  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--pos)';
    if (score >= 40) return 'var(--neu)';
    return 'var(--neg)';
  };

  return (
    <div className="forecast-panel">
      <div className="forecast-header">
        <div className="forecast-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10Z"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
          </svg>
          7-DAY SENTIMENT FORECAST
        </div>
        <div className="forecast-topic">Topic: <strong>{topic || 'General Outlook'}</strong></div>
      </div>

      <div className="forecast-main">
        <div className="forecast-projection">
          <div className="projection-value" style={{ color: getScoreColor(projectionScore) }}>
            {projectionScore}
            <span className="projection-unit">/100</span>
          </div>
          <div className="projection-label">Projected Sentiment</div>
        </div>
        
        <div className="forecast-content">
          <p className="forecast-outlook">{outlook}</p>
          
          {risks && risks.length > 0 && (
            <div className="forecast-risks">
              <span className="risk-label">Rising Trends / Risks:</span>
              <ul className="risk-list">
                {risks.map((risk, idx) => (
                  <li key={idx} className="risk-item">
                    <span className="risk-bullet">•</span> {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="forecast-footer">
        <div className="forecast-disclaimer">
          AI-generated prediction based on recent news sentiment patterns.
        </div>
      </div>
    </div>
  );
};

export default ForecastCard;
