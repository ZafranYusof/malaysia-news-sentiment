import React from 'react';

const SentimentPieChartCss = ({ distribution }) => {
  const total = Number(distribution.Positive || 0) + Number(distribution.Negative || 0) + Number(distribution.Neutral || 0);
  
  const getPct = (val) => (total > 0 ? Number(val) / total : 0);

  const data = [
    { name: 'Positive', value: Number(distribution.Positive || 0), color: 'var(--pos)', grad: 'var(--pos-grad)' },
    { name: 'Neutral',  value: Number(distribution.Neutral  || 0), color: 'var(--neu)', grad: 'linear-gradient(to right, #d97706, #fbbf24)' },
    { name: 'Negative', value: Number(distribution.Negative || 0), color: 'var(--neg)', grad: 'var(--neg-grad)' },
  ].filter(d => d.value > 0);

  // For charts.css pie, we need cumulative values or individual rows with sizes
  // But actually charts.css pie works best with certain structures.
  // A simpler way for Donut in charts.css:
  
  return (
    <div className="chart-panel">
      <div className="chart-panel-hdr">
        <h3 className="chart-panel-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M2 12h10"/>
          </svg>
          Sentiment Share (CSS)
        </h3>
        <span className="chart-panel-pill">Donut</span>
      </div>

      <div className="css-chart-container" style={{ height: '220px', padding: '10px 0' }}>
        {data.length === 0 ? (
          <div className="chart-empty-msg">No data available</div>
        ) : (
          <table className="charts-css pie donut" style={{ width: '180px', margin: '0 auto', border: 'none' }}>
            <caption style={{ display: 'none' }}> Sentiment Share </caption>
            <tbody>
              {(() => {
                let cumulative = 0;
                return data.map((item) => {
                  const size = getPct(item.value);
                  const start = cumulative;
                  const end = cumulative + size;
                  cumulative = end;
                  return (
                    <tr key={item.name}>
                      <td style={{ 
                        '--start': start.toFixed(4), 
                        '--end': end.toFixed(4), 
                        '--color': item.color
                      }}>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        )}
      </div>

      <div className="css-chart-legend">
        {data.map(item => (
          <div key={item.name} className="legend-item">
            <span className="legend-dot" style={{ background: item.color }}></span>
            <span className="legend-text">
              {item.name} ({Math.round(getPct(item.value) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentPieChartCss;
