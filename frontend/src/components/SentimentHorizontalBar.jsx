import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SentimentHorizontalBar = ({ distribution = {} }) => {
  const data = [
    { name: 'Positive', value: distribution.positive || 0, color: '#10b981', lightColor: '#d1fae5' },
    { name: 'Negative', value: distribution.negative || 0, color: '#ef4444', lightColor: '#fee2e2' },
    { name: 'Neutral', value: distribution.neutral || 0, color: '#f59e0b', lightColor: '#fef3c7' },
  ].sort((a, b) => b.value - a.value); // Sort descending

  const maxValue = Math.max(...data.map(d => d.value));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const total = distribution.positive + distribution.negative + distribution.neutral;
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-2xl border-2" style={{ borderColor: item.payload.color }}>
          <p className="text-sm font-bold" style={{ color: item.payload.color }}>
            {item.payload.name}
          </p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {item.value}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {percent}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Sentiment Distribution
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          Horizontal Comparison
        </span>
      </div>
      
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#9ca3af" 
            style={{ fontSize: '13px', fontWeight: '600' }}
            width={75}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} />
          <defs>
            {data.map((entry, index) => (
              <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor={entry.color} stopOpacity={0.9}/>
                <stop offset="95%" stopColor={entry.color} stopOpacity={0.6}/>
              </linearGradient>
            ))}
          </defs>
          <Bar 
            dataKey="value" 
            radius={[0, 8, 8, 0]}
            maxBarSize={50}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#colorGradient${index})`}
                stroke={entry.color}
                strokeWidth={2}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentHorizontalBar;
