import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const SentimentDonutChart = ({ distribution = {}, onSegmentClick, activeFilter }) => {
  const data = [
    { name: 'Positive', value: distribution.positive || 0, color: '#10b981' },
    { name: 'Negative', value: distribution.negative || 0, color: '#ef4444' },
    { name: 'Neutral', value: distribution.neutral || 0, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold" style={{ color: item.payload.color }}>
            {item.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {item.value} articles ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Center label showing total
  const renderCenterLabel = () => {
    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        <tspan
          x="50%"
          dy="-0.5em"
          className="text-3xl font-bold fill-gray-900 dark:fill-white"
        >
          {total}
        </tspan>
        <tspan
          x="50%"
          dy="1.5em"
          className="text-xs fill-gray-500 dark:fill-gray-400"
        >
          Total Articles
        </tspan>
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-600">
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Share of Voice
        </h3>
      </div>
      
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            onClick={(data) => onSegmentClick && onSegmentClick(data.name)}
            cursor="pointer"
            strokeWidth={4}
            stroke="white"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                opacity={activeFilter && activeFilter !== 'all' && activeFilter !== entry.name ? 0.3 : 0.95}
                className="transition-opacity duration-200"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
          {renderCenterLabel()}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentDonutChart;
