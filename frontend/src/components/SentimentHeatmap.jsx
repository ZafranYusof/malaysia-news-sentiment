import React, { useState } from 'react';

const SentimentHeatmap = ({ data = [], loading = false }) => {
  const [flippedCards, setFlippedCards] = useState({});

  // Malaysian states
  const states = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah',
    'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur', 'Putrajaya', 'Labuan'
  ];

  // Generate heatmap data
  const heatmapData = states.map(state => {
    const stateData = data.find(d => d.state === state) || {};
    const total = stateData.count || 0;
    
    return {
      state,
      total,
      positive: stateData.positive || 0,
      negative: stateData.negative || 0,
      neutral: stateData.neutral || 0,
    };
  }).sort((a, b) => b.total - a.total); // Sort by total articles

  const toggleFlip = (state) => {
    setFlippedCards(prev => ({ ...prev, [state]: !prev[state] }));
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
          Click to flip
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

      {/* Flipcard Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
        {heatmapData.map((item) => {
          const isFlipped = flippedCards[item.state];
          
          return (
            <div
              key={item.state}
              className="relative h-24 cursor-pointer perspective-1000"
              onClick={() => toggleFlip(item.state)}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side - Grey with state name + total */}
                <div className="absolute w-full h-full backface-hidden bg-slate-100 dark:bg-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                    {item.state}
                  </span>
                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-700 dark:text-slate-300">
                      {item.total}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                      articles
                    </div>
                  </div>
                </div>

                {/* Back Side - Sentiment breakdown */}
                <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-900 rounded-xl p-2 shadow-md rotate-y-180 border border-gray-200 dark:border-gray-700">
                  <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-2 truncate">
                    {item.state}
                  </div>
                  <div className="space-y-1">
                    {/* Positive */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] text-gray-600 dark:text-gray-400">Positive</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {item.positive}
                      </span>
                    </div>
                    {/* Negative */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-[10px] text-gray-600 dark:text-gray-400">Negative</span>
                      </div>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">
                        {item.negative}
                      </span>
                    </div>
                    {/* Neutral */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <span className="text-[10px] text-gray-600 dark:text-gray-400">Neutral</span>
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {item.neutral}
                      </span>
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-500 dark:text-gray-400 text-center mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                    Total: {item.total}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default SentimentHeatmap;
