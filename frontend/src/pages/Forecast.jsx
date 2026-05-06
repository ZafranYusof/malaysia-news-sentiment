import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Legend } from 'recharts';
import api from '../services/api';

const Forecast = () => {
  const [topic, setTopic] = useState('');
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchForecast = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/forecast/${encodeURIComponent(topic.trim())}?days=${days}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate forecast');
    } finally {
      setLoading(false);
    }
  }, [topic, days]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchForecast();
  };

  // Combine historical + predicted for chart
  const chartData = data ? [
    ...data.historical.map(h => ({
      date: h.date,
      sentiment: h.sentiment,
      type: 'historical',
    })),
    ...data.predicted.map(p => ({
      date: p.date,
      predicted: p.predictedSentiment,
      confidenceUpper: Math.min(1, p.predictedSentiment + (1 - p.confidence) * 0.5),
      confidenceLower: Math.max(-1, p.predictedSentiment - (1 - p.confidence) * 0.5),
      type: 'predicted',
    })),
  ] : [];

  const trendColor = data?.trend === 'Improving' ? '#22c55e' : data?.trend === 'Declining' ? '#ef4444' : '#f59e0b';
  const trendIcon = data?.trend === 'Improving' ? '↗' : data?.trend === 'Declining' ? '↘' : '→';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sentiment Forecast</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Predict future sentiment trends using historical data</p>
        </div>
      </motion.div>

      {/* Search Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. economy, politics, education..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#eee] dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Days Ahead</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#eee] dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75"/>
                  </svg>
                  Forecasting...
                </span>
              ) : 'Generate Forecast'}
            </button>
          </div>
        </div>
      </motion.form>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5 hover:shadow-lg transition-shadow"
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expected Trend</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{trendIcon}</span>
                  <span className="text-lg font-bold" style={{ color: trendColor }}>{data.trend}</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5 hover:shadow-lg transition-shadow"
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Articles Analyzed</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{data.totalArticles}</div>
                <div className="text-xs text-gray-400">over {data.daysAnalyzed} days</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5 hover:shadow-lg transition-shadow"
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Confidence</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {data.predicted.length > 0 ? `${Math.round(data.predicted[0].confidence * 100)}%` : 'N/A'}
                </div>
                <div className="text-xs text-gray-400">first day prediction</div>
              </motion.div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Sentiment Forecast Chart</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        tickFormatter={(val) => val.slice(5)}
                      />
                      <YAxis
                        domain={[-1, 1]}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        tickFormatter={(val) => val.toFixed(1)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card, #fff)',
                          border: '1px solid var(--border, #eee)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(value, name) => [value?.toFixed(3), name === 'sentiment' ? 'Historical' : name === 'predicted' ? 'Predicted' : name]}
                      />
                      <Legend />
                      {/* Confidence band */}
                      <Area
                        type="monotone"
                        dataKey="confidenceUpper"
                        stroke="none"
                        fill="#2563eb"
                        fillOpacity={0.08}
                        name="Confidence Band"
                      />
                      <Area
                        type="monotone"
                        dataKey="confidenceLower"
                        stroke="none"
                        fill="#fff"
                        fillOpacity={1}
                        name=" "
                      />
                      {/* Historical line */}
                      <Line
                        type="monotone"
                        dataKey="sentiment"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        name="Historical"
                        connectNulls={false}
                      />
                      {/* Predicted line (dashed) */}
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, fill: '#7c3aed' }}
                        name="Predicted"
                        connectNulls={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* AI Insight */}
            {data.aiInsight && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-accent/5 to-purple-500/5 border border-accent/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                  <span className="text-sm font-semibold text-accent">AI Insight</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.aiInsight}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!data && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enter a topic to forecast</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Analyze historical sentiment data and predict future trends for any news topic in Malaysia.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Forecast;
