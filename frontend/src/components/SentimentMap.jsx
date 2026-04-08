import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Malaysian Regional Sentiment Heatmap (#1)
 * Colors states based on average analyzed sentiment.
 */
const SentimentMap = ({ data = [], loading = false }) => {
  const { t } = useLanguage();

  // Helper to get color based on score (0 to 1)
  const getColor = (stateName) => {
    const stateData = data.find(d => d.state === stateName);
    if (!stateData || stateData.count === 0) return 'var(--border-light)';
    
    const score = stateData.avgScore; // 0=Neg, 0.5=Neu, 1=Pos
    if (score > 0.7) return '#4ade80'; // Positive Green
    if (score < 0.3) return '#f87171'; // Negative Red
    return '#fbbf24'; // Neutral Yellow/Amber
  };

  const getTooltip = (stateName) => {
    const stateData = data.find(d => d.state === stateName);
    if (!stateData) return `${stateName}: No data`;
    return `${stateName}: ${stateData.count} arts, Avg: ${Math.round(stateData.avgScore * 100)}%`;
  };

  return (
    <div className="sentiment-map-container">
      <div className="chart-header">
        <h3 className="chart-title">{t('stateSentiment')}</h3>
        <div className="map-legend">
          <div className="legend-item"><span className="dot" style={{background: '#4ade80'}}></span> Pos</div>
          <div className="legend-item"><span className="dot" style={{background: '#fbbf24'}}></span> Neu</div>
          <div className="legend-item"><span className="dot" style={{background: '#f87171'}}></span> Neg</div>
        </div>
      </div>

      <div className={`map-wrapper ${loading ? 'is-loading' : ''}`}>
        {/* High-Fidelity Malaysia SVG Map */}
        <svg viewBox="0 0 1000 450" className="malaysia-svg">
          {/* Detailed State Paths */}
          <g className="states-layer">
            {/* Perlis */}
            <path d="M125,58 L138,58 L138,70 L122,81 L115,70 Z" 
              fill={getColor('Perlis')} className="map-state" data-state="Perlis">
              <title>{getTooltip('Perlis')}</title>
            </path>
            {/* Kedah */}
            <path d="M125,58 L155,55 L165,85 L180,95 L175,130 L138,125 L122,81 L138,70 Z" 
              fill={getColor('Kedah')} className="map-state" data-state="Kedah">
              <title>{getTooltip('Kedah')}</title>
            </path>
            {/* Pulau Pinang */}
            <path d="M125,128 L142,128 L142,145 L130,155 L120,150 Z" 
              fill={getColor('Pulau Pinang')} className="map-state" data-state="Pulau Pinang">
              <title>{getTooltip('Pulau Pinang')}</title>
            </path>
            {/* Perak */}
            <path d="M142,128 L175,130 L220,155 L215,225 L165,220 L150,200 L145,150 Z" 
              fill={getColor('Perak')} className="map-state" data-state="Perak">
              <title>{getTooltip('Perak')}</title>
            </path>
            {/* Kelantan */}
            <path d="M180,95 L225,95 L260,115 L265,165 L220,155 Z" 
              fill={getColor('Kelantan')} className="map-state" data-state="Kelantan">
              <title>{getTooltip('Kelantan')}</title>
            </path>
            {/* Terengganu */}
            <path d="M260,115 L295,125 L320,165 L325,210 L285,215 L265,165 Z" 
              fill={getColor('Terengganu')} className="map-state" data-state="Terengganu">
              <title>{getTooltip('Terengganu')}</title>
            </path>
            {/* Pahang */}
            <path d="M220,155 L265,165 L285,215 L325,210 L345,310 L260,330 L250,265 L215,225 Z" 
              fill={getColor('Pahang')} className="map-state" data-state="Pahang">
              <title>{getTooltip('Pahang')}</title>
            </path>
            {/* Selangor */}
            <path d="M165,220 L215,225 L230,265 L235,305 L185,305 L175,250 Z" 
              fill={getColor('Selangor')} className="map-state" data-state="Selangor">
              <title>{getTooltip('Selangor')}</title>
            </path>
            {/* Kuala Lumpur (Spot) */}
            <circle cx="212" cy="272" r="6" fill="#000" stroke="#fff" strokeWidth="1">
              <title>{getTooltip('Kuala Lumpur')}</title>
            </circle>
            {/* Putrajaya (Spot) */}
            <circle cx="218" cy="285" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1">
              <title>{getTooltip('Putrajaya')}</title>
            </circle>
            {/* Negeri Sembilan */}
            <path d="M230,265 L250,265 L275,305 L245,335 L235,305 Z" 
              fill={getColor('Negeri Sembilan')} className="map-state" data-state="Negeri Sembilan">
              <title>{getTooltip('Negeri Sembilan')}</title>
            </path>
            {/* Melaka */}
            <path d="M245,285 L280,315 L265,340 L245,335 Z" 
              fill={getColor('Melaka')} className="map-state" data-state="Melaka">
              <title>{getTooltip('Melaka')}</title>
            </path>
            {/* Johor */}
            <path d="M260,330 L345,310 L385,385 L350,420 L295,400 L265,340 Z" 
              fill={getColor('Johor')} className="map-state" data-state="Johor">
              <title>{getTooltip('Johor')}</title>
            </path>

            {/* Borneo Connector Gap */}
            
            {/* Sarawak */}
            <path d="M520,280 L620,240 L700,240 L730,285 L760,250 L780,270 L780,320 L730,375 L620,380 L520,350 Z" 
              fill={getColor('Sarawak')} className="map-state" data-state="Sarawak">
              <title>{getTooltip('Sarawak')}</title>
            </path>
            {/* Sabah */}
            <path d="M780,230 L840,165 L925,185 L940,245 L880,345 L800,325 L780,270 L760,250 L730,285 L720,220 Z" 
              fill={getColor('Sabah')} className="map-state" data-state="Sabah">
              <title>{getTooltip('Sabah')}</title>
            </path>
            {/* Labuan (Spot) */}
            <circle cx="770" cy="235" r="4" fill="#db2777" stroke="#fff" strokeWidth="1">
              <title>{getTooltip('Labuan')}</title>
            </circle>
          </g>

          {/* Labels */}
          <g fontSize="10" fontWeight="600" fill="var(--text-400)" pointerEvents="none">
            <text x="145" y="85">Kedah</text>
            <text x="180" y="190">Perak</text>
            <text x="215" y="130">Kelantan</text>
            <text x="290" y="170">Terengganu</text>
            <text x="270" y="270">Pahang</text>
            <text x="325" y="375">Johor</text>
            <text x="630" y="315">Sarawak</text>
            <text x="845" y="255">Sabah</text>
            <text x="175" y="280">Selangor</text>
          </g>
        </svg>
      </div>
      
      <div className="map-footer">
        <p className="map-note">* Geographic detection based on news headlines metadata.</p>
      </div>
    </div>
  );
};

export default SentimentMap;
