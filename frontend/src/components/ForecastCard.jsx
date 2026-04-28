import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const ForecastCard = ({ forecast, loading, topic }) => {
  const { lang, t } = useLanguage();

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

  if (!forecast) return null;

  const { projectionScore } = forecast;
  // Use current language data, fallback to 'en'
  const langData = forecast[lang] || forecast['en'] || {};
  const { outlook, risks } = langData;

  if (!outlook) return null;

  // Color mapping based on projection score
  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--pos)';
    if (score >= 40) return 'var(--neu)';
    return 'var(--neg)';
  };

  return (
    <div className="forecast-panel premium-forecast">
      {/* Cinematic Header Bar */}
      <div className="forecast-title-bar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
        </svg>
        {t('forecastTitle') || 'RAMALAN SENTIMEN AI'}
      </div>

      <div className="forecast-meta-row">
        <span className="forecast-topic-label">{t('topic')}:</span>
        <span className="forecast-topic-value">{topic || t('generalOutlook')}</span>
      </div>

      <div className="forecast-split-layout">
        {/* Left column: Score Box */}
        <div className="forecast-score-box">
          <div className="score-main">
            <span className="score-num" style={{ color: getScoreColor(projectionScore) }}>{projectionScore}</span>
            <span className="score-slash">/100</span>
          </div>
          <div className="score-desc">{t('projectedSentiment') || 'SENTIMEN TERUNJUR'}</div>
        </div>
        
        {/* Right column: Interpretations */}
        <div className="forecast-details">
          <div className="outlook-section">
            {Array.isArray(outlook) ? (
              outlook.map((para, idx) => (
                <p key={idx} className="outlook-p">{String(para).replace(/\*/g, '')}</p>
              ))
            ) : (
              <p className="outlook-p">{String(outlook).replace(/\*/g, '')}</p>
            )}
          </div>
          
          {risks && risks.length > 0 && (
            <div className="risks-section">
              <h4 className="risks-title">{t('risksTrends') || 'TREND MENINGKAT / RISIKO'}:</h4>
              <ul className="risks-ul">
                {risks.map((risk, idx) => (
                  <li key={idx} className="risk-li">
                    <span className="bullet">•</span> {String(risk).replace(/\*/g, '')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="forecast-disclaimer-bar">
        {t('forecastDisclaimer') || 'Ramalan yang dijana AI berasaskan corak sentimen berita terkini.'}
      </div>
    </div>
  );
};

export default ForecastCard;
