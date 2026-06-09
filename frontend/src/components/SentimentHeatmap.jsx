import React from 'react';

const SentimentHeatmap = ({ data = [], loading = false }) => {
  // Malaysian states
  const states = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah',
    'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur', 'Putrajaya', 'Labuan'
  ];

  // Generate heatmap data
  const heatmapData = states.map(state => {
    const stateData = data.find(d => d.state === state) || {};
    const total = (stateData.positive || 0) + (stateData.negative || 0) + (stateData.neutral || 0);
    
    // Calculate sentiment score (-1 to 1)
    const score = total > 0 
      ? ((stateData.positive || 0) - (stateData.negative || 0)) / total 
      : 0;
    
    return {
      state,
      total,
      positive: stateData.positive || 0,
      negative: stateData.negative || 0,
      neutral: stateData.neutral || 0,
      score,
    };
  }).sort((a, b) => b.total - a.total); // Sort by total articles

  // Get color based on sentiment score
  const getColor = (score) => {
    if (score > 0.3) return { bg: 'bg-emerald-500', text: 'text-emerald-900', label: 'Very Positive' };
    if (score > 0.1) return { bg: 'bg-emerald-400', text: 'text-emerald-800', label: 'Positive' };
    if (score > -0.1) return { bg: 'bg-amber-400', text: 'text-amber-900', label: 'Neutral' };
    if (score > -0.3) return { bg: 'bg-red-400', text: 'text-red-800', label: 'Negative' };
    return { bg: 'bg-red-500', text: 'text-red-900', label: 'Very Negative' };
  };

  // Get intensity (size) based on total articles
  const maxTotal = Math.max(...heatmapData.map(d => d.total));
  const getIntensity = (total) => {
    if (maxTotal === 0) return 'opacity-30';
    const ratio = total / maxTotal;
    if (ratio > 0.7) return 'opacity-100';
    if (ratio > 0.4) return 'opacity-75';
    if (ratio > 0.2) return 'opacity-60';
    return 'opacity-40';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Regional Sentiment Heatmap
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          By State
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Sentiment:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-400"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Negative</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
        {heatmapData.map((item) => {
          const color = getColor(item.score);
          const intensity = getIntensity(item.total);
          
          return (
            <div
              key={item.state}
              className={`${color.bg} ${intensity} rounded-xl p-3 transition-all duration-200 hover:scale-105 hover:opacity-100 cursor-pointer group relative`}
              title={`${item.state}: ${item.total} articles`}
            >
              <div className="flex flex-col">
                <span className={`text-xs font-bold ${color.text} truncate`}>
                  {item.state}
                </span>
                <span className={`text-lg font-black ${color.text} mt-1`}>
                  {item.total}
                </span>
                <span className={`text-[10px] font-semibold ${color.text} opacity-80 mt-0.5`}>
                  {item.total > 0 ? ((item.positive / item.total) * 100).toFixed(0) : 0}% pos
                </span>
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
                  <div className="font-bold mb-1">{item.state}</div>
                  <div className="space-y-1 text-[11px]">
                    <div>✅ Positive: {item.positive} ({item.total > 0 ? ((item.positive/item.total)*100).toFixed(0) : 0}%)</div>
                    <div>⚠️ Negative: {item.negative} ({item.total > 0 ? ((item.negative/item.total)*100).toFixed(0) : 0}%)</div>
                    <div>➖ Neutral: {item.neutral} ({item.total > 0 ? ((item.neutral/item.total)*100).toFixed(0) : 0}%)</div>
                  </div>
                  <div className="border-t border-gray-700 mt-2 pt-1 font-semibold">
                    Total: {item.total} articles
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SentimentHeatmap;
