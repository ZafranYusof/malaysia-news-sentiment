import React from 'react';

const TopSourcesHorizontal = ({ sourcesData = [] }) => {
  // Sort and take top 8 sources
  const topSources = sourcesData
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const maxCount = topSources.length > 0 ? topSources[0].total : 1;
  const totalArticles = topSources.reduce((sum, s) => sum + s.total, 0);

  // Color palette for sources
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];

  if (topSources.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-600">
        <p className="text-sm">No source data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Top News Sources
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          Top 8
        </span>
      </div>

      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
        {topSources.map((source, index) => {
          const percentage = ((source.total / totalArticles) * 100).toFixed(1);
          const barWidth = (source.total / maxCount) * 100;
          const color = colors[index % colors.length];

          return (
            <div 
              key={source.source || index} 
              className="group cursor-pointer"
            >
              {/* Source name and count */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
                    {source.source || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 flex-shrink-0 ml-3">
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    {source.total}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    ({percentage}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 group-hover:opacity-90"
                  style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${color}dd 0%, ${color}99 100%)`
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400 font-semibold">
            Total from top {topSources.length} sources:
          </span>
          <span className="text-sm font-black text-gray-900 dark:text-white">
            {totalArticles} articles
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopSourcesHorizontal;
