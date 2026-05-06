import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import api from '../services/api';

const RANGE_OPTIONS = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
];

const TrendBadge = ({ trend }) => {
  const config = {
    improving: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', icon: '↑' },
    declining: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '↓' },
    stable:    { bg: 'bg-gray-100 dark:bg-gray-700/30', text: 'text-gray-700 dark:text-gray-300', icon: '→' },
  };
  const c = config[trend] || config.stable;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.icon} {trend.charAt(0).toUpperCase() + trend.slice(1)}
    </span>
  );
};

const StatCard = ({ label, value, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -3, scale: 1.02 }}
    className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] hover:shadow-lg transition-shadow"
  >
    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
    <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="p-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] shadow-lg text-xs">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
      <div className="space-y-0.5">
        <p className="text-gray-600 dark:text-gray-300">Sentiment: <span className="font-medium">{data?.avgSentiment?.toFixed(3)}</span></p>
        <p className="text-emerald-600">Positive: {data?.positiveCount}</p>
        <p className="text-red-500">Negative: {data?.negativeCount}</p>
        <p className="text-gray-500">Neutral: {data?.neutralCount}</p>
        <p className="text-blue-500">Total: {data?.totalArticles}</p>
      </div>
    </div>
  );
};

const SentimentTimeline = () => {
  const [topic, setTopic] = useState('');
  const [days, setDays] = useState(30);
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true);
      setSearched(true);
      const { data } = await api.get('/news/sentiment-timeline', {
        params: { topic: topic.trim() || undefined, days },
      });
      setTimeline(data.timeline || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
      setTimeline([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [topic, days]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTimeline();
  };

  // Find spikes (days where sentiment deviates significantly from average)
  const spikes = timeline.filter((d, i) => {
    if (timeline.length < 3) return false;
    const avg = timeline.reduce((s, x) => s + x.avgSentiment, 0) / timeline.length;
    return Math.abs(d.avgSentiment - avg) > 0.4;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Sentiment Timeline</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track how sentiment changes over time for any topic</p>
      </motion.div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic (e.g. economy, Anwar, flood)..."
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#222] rounded-xl p-1">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                days === opt.value
                  ? 'bg-white dark:bg-[#333] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : 'Analyze'}
        </button>
      </form>

      {/* Results */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] animate-pulse">
                <div className="h-3 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded w-2/3 mb-2" />
                <div className="h-5 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded w-1/2" />
              </div>
            ))}
          </div>
          <div className="h-64 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl animate-pulse" />
        </div>
      )}

      {!loading && searched && timeline.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 text-gray-400 dark:text-gray-500"
        >
          <motion.svg
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 mx-auto mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          >
            <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
          </motion.svg>
          <p className="text-sm">No data found for this topic and time range</p>
        </motion.div>
      )}

      {!loading && timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary stats */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total Articles" value={summary.totalArticles} delay={0.1} />
              <StatCard 
                label="Avg Sentiment" 
                value={summary.avgSentiment > 0 ? `+${summary.avgSentiment}` : summary.avgSentiment}
                sub={summary.avgSentiment > 0.1 ? 'Leaning positive' : summary.avgSentiment < -0.1 ? 'Leaning negative' : 'Mostly neutral'}
                delay={0.15}
              />
              <StatCard label="Trend" value={<TrendBadge trend={summary.trend} />} delay={0.2} />
              <StatCard 
                label="Peak Dates" 
                value={summary.peakPositiveDate ? `📈 ${summary.peakPositiveDate}` : 'N/A'}
                sub={summary.peakNegativeDate ? `📉 ${summary.peakNegativeDate}` : ''}
                delay={0.25}
              />
            </div>
          )}

          {/* Sentiment line chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Sentiment Score Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #eee)" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }}
                  tickFormatter={(d) => d.slice(5)} // MM-DD
                />
                <YAxis 
                  domain={[-1, 1]} 
                  tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" opacity={0.5} />
                <Line 
                  type="monotone" 
                  dataKey="avgSentiment" 
                  stroke="#2563eb" 
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563eb' }}
                  activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Volume area chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Article Volume</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #eee)" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }}
                  tickFormatter={(d) => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="positiveCount" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="neutralCount" stackId="1" stroke="#6b7280" fill="#6b7280" fillOpacity={0.2} />
                <Area type="monotone" dataKey="negativeCount" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" /> Positive</span>
              <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-gray-400/40" /> Neutral</span>
              <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/60" /> Negative</span>
            </div>
          </div>

          {/* Significant events */}
          {spikes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a]"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Significant Events</h3>
              <div className="space-y-2">
                {spikes.map((spike, i) => (
                  <motion.div
                    key={spike.date}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-3 text-xs"
                  >
                    <span className="font-mono text-gray-500 dark:text-gray-400 w-20">{spike.date}</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      spike.avgSentiment > 0 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {spike.avgSentiment > 0 ? '📈 Spike' : '📉 Drop'} ({spike.avgSentiment.toFixed(2)})
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{spike.totalArticles} articles</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SentimentTimeline;
