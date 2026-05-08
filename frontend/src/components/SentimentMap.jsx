import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Sentiment classification from avgScore (0-1 scale)
const classifySentiment = (avgScore) => {
  if (avgScore === undefined || avgScore === null) return 'nodata';
  if (avgScore > 0.65) return 'positive';
  if (avgScore < 0.35) return 'negative';
  return 'neutral';
};

const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case 'positive': return '#22c55e';
    case 'negative': return '#ef4444';
    case 'neutral': return '#f59e0b';
    default: return '#4b5563';
  }
};

const formatSentimentScore = (avgScore) => {
  if (avgScore === undefined || avgScore === null) return '—';
  if (avgScore > 0.65) {
    const val = ((avgScore - 0.5) * 2).toFixed(2);
    return `+${val}`;
  }
  if (avgScore < 0.35) {
    const val = ((0.5 - avgScore) * 2).toFixed(2);
    return `-${val}`;
  }
  return '0.00';
};

// Simplified SVG paths for Malaysian states
const MALAYSIA_STATES = {
  'Perlis': {
    path: 'M 95,28 L 102,25 L 108,28 L 110,35 L 105,40 L 98,38 L 93,33 Z',
    labelX: 101, labelY: 33
  },
  'Kedah': {
    path: 'M 88,38 L 98,38 L 105,40 L 110,35 L 118,38 L 122,48 L 125,60 L 118,68 L 108,72 L 95,68 L 88,58 L 85,48 Z',
    labelX: 105, labelY: 55
  },
  'Pulau Pinang': {
    path: 'M 82,62 L 88,58 L 92,64 L 90,70 L 84,72 L 80,68 Z',
    labelX: 86, labelY: 66
  },
  'Perak': {
    path: 'M 95,68 L 108,72 L 118,68 L 128,72 L 138,80 L 145,95 L 142,110 L 135,120 L 125,125 L 115,120 L 105,112 L 98,100 L 92,88 L 90,78 Z',
    labelX: 118, labelY: 96
  },
  'Kelantan': {
    path: 'M 165,30 L 180,28 L 195,32 L 200,42 L 198,55 L 190,65 L 178,70 L 165,68 L 155,60 L 150,48 L 152,38 Z',
    labelX: 175, labelY: 50
  },
  'Terengganu': {
    path: 'M 178,70 L 190,65 L 198,55 L 205,60 L 210,72 L 208,88 L 202,100 L 195,108 L 185,105 L 175,95 L 168,82 L 170,75 Z',
    labelX: 190, labelY: 85
  },
  'Pahang': {
    path: 'M 138,80 L 155,60 L 165,68 L 175,75 L 175,95 L 185,105 L 195,108 L 192,120 L 182,132 L 170,138 L 155,135 L 145,128 L 135,120 L 142,110 L 145,95 Z',
    labelX: 162, labelY: 108
  },
  'Selangor': {
    path: 'M 105,112 L 115,120 L 125,125 L 135,128 L 140,138 L 135,148 L 125,152 L 115,148 L 108,140 L 102,128 L 100,118 Z',
    labelX: 118, labelY: 135
  },
  'Kuala Lumpur': {
    path: 'M 118,132 L 124,130 L 127,135 L 124,139 L 118,137 Z',
    labelX: 122, labelY: 135
  },
  'Putrajaya': {
    path: 'M 126,140 L 131,138 L 133,142 L 130,145 L 126,143 Z',
    labelX: 130, labelY: 142
  },
  'Negeri Sembilan': {
    path: 'M 115,148 L 125,152 L 135,148 L 140,155 L 138,165 L 130,172 L 120,170 L 112,162 L 110,155 Z',
    labelX: 125, labelY: 160
  },
  'Melaka': {
    path: 'M 112,170 L 120,170 L 130,172 L 132,180 L 126,186 L 118,185 L 112,178 Z',
    labelX: 122, labelY: 178
  },
  'Johor': {
    path: 'M 130,172 L 138,165 L 148,162 L 160,165 L 172,170 L 178,180 L 175,192 L 168,200 L 155,205 L 140,202 L 130,195 L 125,186 L 126,180 Z',
    labelX: 152, labelY: 185
  },
  'Sabah': {
    path: 'M 320,30 L 340,25 L 360,28 L 378,35 L 390,45 L 395,58 L 388,70 L 375,78 L 360,82 L 345,80 L 332,75 L 322,65 L 315,52 L 312,40 Z',
    labelX: 355, labelY: 55
  },
  'Sarawak': {
    path: 'M 270,65 L 290,58 L 310,55 L 322,65 L 332,75 L 345,80 L 360,82 L 358,92 L 348,100 L 335,105 L 318,108 L 300,105 L 285,98 L 272,88 L 265,78 Z',
    labelX: 312, labelY: 82
  },
  'Labuan': {
    path: 'M 305,42 L 312,40 L 315,45 L 312,49 L 306,47 Z',
    labelX: 310, labelY: 45
  }
};

const SentimentMap = ({ data = [], loading = false }) => {
  const { t } = useLanguage();

  // Build lookup map from data
  const stateDataMap = useMemo(() => {
    const map = {};
    data.forEach(d => {
      map[d.state] = d;
    });
    return map;
  }, [data]);

  // Table data sorted by count desc
  const tableData = useMemo(() =>
    [...data]
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count),
    [data]
  );

  const isEmpty = !loading && tableData.length === 0;

  const getStateColor = (stateName) => {
    const stateInfo = stateDataMap[stateName];
    if (!stateInfo || stateInfo.count === 0) return '#4b5563';
    const sentiment = classifySentiment(stateInfo.avgScore);
    // Vary intensity based on score distance from center
    if (sentiment === 'positive') {
      const intensity = Math.min(1, (stateInfo.avgScore - 0.65) / 0.35);
      return intensity > 0.5 ? '#16a34a' : '#22c55e';
    }
    if (sentiment === 'negative') {
      const intensity = Math.min(1, (0.35 - stateInfo.avgScore) / 0.35);
      return intensity > 0.5 ? '#dc2626' : '#ef4444';
    }
    return '#f59e0b';
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sentiment Heatmap</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Geographic sentiment distribution across Malaysia</p>
      </div>

      {/* Map Area */}
      <div className={`mx-4 rounded-lg bg-gray-900 dark:bg-[#0a0a0a] p-4 ${loading ? 'animate-pulse' : ''}`}>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="mt-3 text-sm text-center">No state data available. Analyze more articles to see geographic distribution.</span>
          </div>
        ) : (
          <svg
            viewBox="0 0 440 220"
            className="w-full h-auto"
            style={{ maxHeight: '320px' }}
          >
            {/* State polygons */}
            {Object.entries(MALAYSIA_STATES).map(([stateName, stateGeo]) => (
              <g key={stateName}>
                <path
                  d={stateGeo.path}
                  fill={getStateColor(stateName)}
                  stroke="#1f2937"
                  strokeWidth="1"
                  opacity="0.9"
                  className="transition-all duration-300 hover:opacity-100 hover:stroke-white hover:stroke-2"
                >
                  <title>{`${stateName}: ${stateDataMap[stateName] ? stateDataMap[stateName].count + ' articles' : 'No data'}`}</title>
                </path>
                <text
                  x={stateGeo.labelX}
                  y={stateGeo.labelY}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="6"
                  fontWeight="500"
                  style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                >
                  {stateName === 'Kuala Lumpur' ? 'KL' : 
                   stateName === 'Pulau Pinang' ? 'P.Pinang' :
                   stateName === 'Negeri Sembilan' ? 'N.Sembilan' :
                   stateName}
                </text>
              </g>
            ))}

            {/* Sea labels */}
            <text x="60" y="130" fill="#374151" fontSize="7" fontStyle="italic" opacity="0.5">South China Sea</text>
            <text x="240" y="140" fill="#374151" fontSize="7" fontStyle="italic" opacity="0.5">South China Sea</text>
          </svg>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-3 px-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#22c55e]"></span>
          <span className="text-xs text-gray-600 dark:text-gray-400">Positive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#f59e0b]"></span>
          <span className="text-xs text-gray-600 dark:text-gray-400">Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#ef4444]"></span>
          <span className="text-xs text-gray-600 dark:text-gray-400">Negative</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#4b5563]"></span>
          <span className="text-xs text-gray-600 dark:text-gray-400">No data</span>
        </div>
      </div>

      {/* State Summary Table */}
      {tableData.length > 0 && (
        <div className="px-4 pb-5">
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400">State</th>
                  <th className="text-center px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400">Articles</th>
                  <th className="text-center px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400">Sentiment</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400">Top Topic</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => {
                  const sentiment = classifySentiment(row.avgScore);
                  const color = getSentimentColor(sentiment);
                  const scoreText = formatSentimentScore(row.avgScore);
                  const bgClass = sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                                  sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                                  'bg-amber-500/20 text-amber-400';

                  return (
                    <tr
                      key={row.state}
                      className={`border-t border-gray-100 dark:border-gray-700/50 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{row.state}</td>
                      <td className="px-4 py-2.5 text-center text-gray-600 dark:text-gray-300">{row.count}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${bgClass}`}>
                          {scoreText}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs">
                        {row.topTopic || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentMap;
