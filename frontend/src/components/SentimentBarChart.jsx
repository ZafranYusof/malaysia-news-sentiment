import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontFamily: 'Inter,sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: 12.5, color: p.fill, marginTop: 2 }}>
          {p.name}: <strong style={{ color: '#0f172a' }}>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const SentimentBarChart = ({ distribution }) => {
  const data = [
    { name: 'Positive', value: distribution.Positive || 0, color: '#10b981' },
    { name: 'Negative', value: distribution.Negative || 0, color: '#ef4444' },
    { name: 'Neutral',  value: distribution.Neutral  || 0, color: '#f59e0b' },
  ];

  return (
    <div className="chart-panel">
      <div className="chart-panel-hdr">
        <h3 className="chart-panel-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Sentiment Breakdown
        </h3>
        <span className="chart-panel-pill">Current</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar dataKey="value" radius={[5, 5, 0, 0]}>
            {data.map(d => <Cell key={d.name} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentBarChart;
