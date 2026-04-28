import React from 'react';

const SentimentBarChartCss = ({ distribution }) => {
  const total = Number(distribution.Positive || 0) + Number(distribution.Negative || 0) + Number(distribution.Neutral || 0);
  
  const getPct = (val) => (total > 0 ? Number(val) / total : 0);

  const data = [
    { name: 'Positive', value: Number(distribution.Positive || 0), color: 'var(--pos)', grad: 'linear-gradient(to top, rgba(48, 207, 121, 0.9), rgba(109, 223, 163, 0.75))' },
    { name: 'Neutral',  value: Number(distribution.Neutral  || 0), color: 'var(--neu)', grad: 'linear-gradient(to top, rgba(247, 165, 1, 0.9), rgba(255, 209, 102, 0.75))' },
    { name: 'Negative', value: Number(distribution.Negative || 0), color: 'var(--neg)', grad: 'linear-gradient(to top, rgba(245, 78, 78, 0.9), rgba(255, 128, 128, 0.75))' },
  ];
  
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const getScale = (val) => Number(val) / maxVal;

  return (
    <div className="chart-panel">
      <div className="chart-panel-hdr">
        <h3 className="chart-panel-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Sentiment Pulse (CSS)
        </h3>
        <span className="chart-panel-pill">Native</span>
      </div>
      
      <div className="css-chart-container" style={{ height: '220px', padding: '20px 0 40px' }}>
        <table className="charts-css column show-labels show-primary-axis" style={{ height: '100%', width: '100%', margin: '0' }}>
          <tbody>
            {data.map((item) => (
              <tr key={item.name}>
                <td style={{ 
                  '--size': getScale(item.value), 
                  '--color': item.grad,
                  position: 'relative',
                  border: 'none',
                  background: 'transparent'
                }}>
                  {/* Performance #48: Background Marker for consistent theme */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    fontWeight: '900',
                    color: 'var(--text-900)',
                    opacity: '0.06',
                    letterSpacing: '-2px',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}>
                    {item.name.substring(0, 3).toUpperCase()}
                  </div>

                  <span className="data-label" style={{ 
                    position: 'absolute', 
                    top: '-25px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: 'var(--text-900)',
                    zIndex: 2
                  }}>{item.value}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="css-chart-legend">
        {data.map(item => (
          <div key={item.name} className="legend-item">
            <span className="legend-dot" style={{ background: item.color }}></span>
            <span className="legend-text">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentBarChartCss;
