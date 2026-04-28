import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const getBarColor = (avgScore) => {
  if (avgScore === undefined || avgScore === null) return '#4b5563';
  if (avgScore > 0.65)  return '#10b981'; // Positive
  if (avgScore < 0.35)  return '#ef4444'; // Negative
  return '#f59e0b';                        // Neutral
};

const getBarGradientId = (avgScore) => {
  if (avgScore > 0.65)  return 'url(#rgnPos)';
  if (avgScore < 0.35)  return 'url(#rgnNeg)';
  return 'url(#rgnNeu)';
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const pct = Math.round((d.avgScore ?? 0.5) * 100);
  const label = pct > 65 ? 'Positive' : pct < 35 ? 'Negative' : 'Neutral';
  const color = getBarColor(d.avgScore);

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontFamily: 'Inter,sans-serif',
      boxShadow: 'var(--shadow-lg)', minWidth: 160
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-900)', marginBottom: 4 }}>{d.state}</p>
      <p style={{ fontSize: 12, color: 'var(--text-400)', marginBottom: 6 }}>{d.count} article{d.count !== 1 ? 's' : ''} analyzed</p>
      <p style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color }} />
        {label} — {pct}% score
      </p>
    </div>
  );
};

const SentimentMap = ({ data = [], loading = false }) => {
  const { t } = useLanguage();

  // Sort by count desc, filter out states with no articles, cap at 16
  const chartData = useMemo(() =>
    [...data]
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 16)
      .map(d => ({
        state: d.state,
        count: d.count,
        avgScore: d.avgScore ?? 0.5,
        score: Math.round((d.avgScore ?? 0.5) * 100),
      })),
  [data]);

  const isEmpty = !loading && chartData.length === 0;

  return (
    <div className="sentiment-map-container">
      <div className="chart-header">
        <h3 className="chart-title">{t('stateSentiment')}</h3>
        <div className="map-legend">
          <div className="legend-item"><span className="dot" style={{ background: '#10b981' }} /> Positive</div>
          <div className="legend-item"><span className="dot" style={{ background: '#f59e0b' }} /> Neutral</div>
          <div className="legend-item"><span className="dot" style={{ background: '#ef4444' }} /> Negative</div>
        </div>
      </div>

      <div className={`map-wrapper ${loading ? 'is-loading' : ''}`} style={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isEmpty ? (
          <div className="chart-empty-msg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            <span>No specific Malaysian states detected in the current news analysis. Try a different topic or analyze more articles.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 36)} debounce={200}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 60, left: 0, bottom: 4 }}
              barCategoryGap="28%"
            >
              <defs>
                <linearGradient id="rgnPos" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="rgnNeg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <linearGradient id="rgnNeu" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>

              <XAxis
                type="number"
                domain={[0, 'dataMax + 1']}
                tick={{ fill: 'var(--text-400)', fontSize: 11, fontFamily: 'Inter' }}
                axisLine={false} tickLine={false}
                label={{ value: 'Articles', position: 'insideBottomRight', offset: -4, style: { fill: 'var(--text-400)', fontSize: 10 } }}
              />
              <YAxis
                type="category"
                dataKey="state"
                width={110}
                tick={{ fill: 'var(--text-700)', fontSize: 12, fontFamily: 'Inter', fontWeight: 500 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg)', opacity: 0.4 }} />

              <Bar
                dataKey="count"
                radius={[0, 6, 6, 0]}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={getBarGradientId(entry.avgScore)} />
                ))}
                <LabelList
                  dataKey="score"
                  position="right"
                  formatter={(v) => `${v}%`}
                  style={{ fill: 'var(--text-400)', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="map-footer">
        <p className="map-note">* Ranked by article count · Score = average sentiment (0–100%)</p>
      </div>
    </div>
  );
};

export default SentimentMap;
