import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontFamily: 'Inter,sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: 12.5, color: p.stroke, marginTop: 2 }}>
          {p.name}: <strong style={{ color: '#0f172a' }}>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const TrendLineChart = ({ trendsData = [] }) => (
  <div className="chart-panel" style={{ gridColumn: '1 / -1' }}>
    <div className="chart-panel-hdr">
      <h3 className="chart-panel-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        Sentiment Trend Timeline
      </h3>
      <span className="chart-panel-pill">Historical</span>
    </div>
    {!trendsData || trendsData.length === 0 ? (
      <div className="chart-empty-msg">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <span>Trends build as you analyze news over multiple days</span>
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={trendsData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.12}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.12}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gNeu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.12}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
          <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={v => <span style={{ color: '#6b7280', fontSize: 12, fontFamily: 'Inter' }}>{v}</span>} />
          <Area type="monotone" dataKey="Positive" stroke="#10b981" strokeWidth={2} fill="url(#gPos)" dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
          <Area type="monotone" dataKey="Negative" stroke="#ef4444" strokeWidth={2} fill="url(#gNeg)" dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
          <Area type="monotone" dataKey="Neutral"  stroke="#f59e0b" strokeWidth={2} fill="url(#gNeu)" dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default TrendLineChart;
