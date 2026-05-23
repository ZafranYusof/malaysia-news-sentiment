import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = { positive: '#4CAF50', negative: '#f44336', neutral: '#9E9E9E' };

const SentimentPieChart = ({ data, onSegmentClick, activeFilter }) => {
  const chartData = [
    { name: 'Positive', value: data.positive, key: 'positive' },
    { name: 'Negative', value: data.negative, key: 'negative' },
    { name: 'Neutral', value: data.neutral, key: 'neutral' },
  ];

  const handleClick = (entry) => {
    if (onSegmentClick) {
      onSegmentClick(entry.key);
    }
  };

  return (
    <div className="pie-chart-container">
      <h3>Sentiment Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            onClick={handleClick}
            cursor="pointer"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.key}
                fill={COLORS[entry.key]}
                opacity={activeFilter && activeFilter !== entry.key ? 0.3 : 1}
                stroke={activeFilter === entry.key ? '#fff' : 'none'}
                strokeWidth={activeFilter === entry.key ? 3 : 0}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      {activeFilter && (
        <p className="filter-indicator">
          Filtering: <strong>{activeFilter}</strong>
          <button onClick={() => onSegmentClick(null)}>Clear</button>
        </p>
      )}
    </div>
  );
};

export default SentimentPieChart;
