import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import toast from 'react-hot-toast';
import api from '../services/api';

const COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

const Compare = () => {
  const [topics, setTopics] = useState(['', '']);
  const [days, setDays] = useState(30);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const addTopic = () => {
    if (topics.length >= 5) return;
    setTopics([...topics, '']);
  };

  const removeTopic = (idx) => {
    if (topics.length <= 2) return;
    setTopics(topics.filter((_, i) => i !== idx));
  };

  const updateTopic = (idx, val) => {
    const updated = [...topics];
    updated[idx] = val;
    setTopics(updated);
  };

  const handleCompare = async () => {
    const validTopics = topics.filter(t => t.trim());
    if (validTopics.length < 2) {
      toast.error('Enter at least 2 topics to compare');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/news/compare', { topics: validTopics, days });
      setResults(data.comparison);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  // Prepare radar data
  const radarData = results ? [
    { dimension: 'Positive %', ...Object.fromEntries(results.map(r => [r.topic, r.positivePercent])) },
    { dimension: 'Negative %', ...Object.fromEntries(results.map(r => [r.topic, r.negativePercent])) },
    { dimension: 'Neutral %', ...Object.fromEntries(results.map(r => [r.topic, r.neutralPercent])) },
    { dimension: 'Articles', ...Object.fromEntries(results.map(r => [r.topic, Math.min(r.articleCount, 100)])) },
    { dimension: 'Avg Score', ...Object.fromEntries(results.map(r => [r.topic, Math.round(r.avgSentiment * 100)])) },
  ] : [];

  // Bar chart data
  const barData = results ? results.map(r => ({
    topic: r.topic,
    Positive: r.positivePercent,
    Negative: r.negativePercent,
    Neutral: r.neutralPercent,
  })) : [];

  // Winner
  const winner = results ? results.reduce((best, r) => r.positivePercent > best.positivePercent ? r : best, results[0]) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comparative Analysis</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Compare sentiment across multiple topics</p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6"
      >
        <div className="space-y-3">
          {topics.map((topic, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }} />
              <input
                type="text"
                value={topic}
                onChange={(e) => updateTopic(idx, e.target.value)}
                placeholder={`Topic ${idx + 1} (e.g. economy, politics)`}
                className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
              />
              {topics.length > 2 && (
                <button
                  onClick={() => removeTopic(idx)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          {topics.length < 5 && (
            <button
              onClick={addTopic}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              + Add Topic
            </button>
          )}

          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <button
            onClick={handleCompare}
            disabled={loading}
            className="ml-auto px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M21 16v5h-5"/><path d="M3 16v5h5"/><path d="M4 12h16"/>
              </svg>
            )}
            Compare
          </button>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Winner Banner */}
            {winner && winner.articleCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">Most Positive Topic</p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-200">{winner.topic} — {winner.positivePercent}% positive</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Multi-Dimension Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <PolarRadiusAxis tick={{ fontSize: 10 }} />
                    {results.map((r, i) => (
                      <Radar
                        key={r.topic}
                        name={r.topic}
                        dataKey={r.topic}
                        stroke={COLORS[i]}
                        fill={COLORS[i]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Sentiment Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Positive" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Neutral" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Table */}
            <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-[#eee] dark:border-[#2a2a2a]">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Detailed Statistics</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#eee] dark:border-[#2a2a2a]">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Topic</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Articles</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Avg Score</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-green-600">Positive</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-yellow-600">Neutral</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-red-600">Negative</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={r.topic} className="border-b border-[#eee] dark:border-[#2a2a2a] last:border-0">
                        <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                            {r.topic}
                          </div>
                        </td>
                        <td className="text-center px-3 py-3 text-gray-600 dark:text-gray-400">{r.articleCount}</td>
                        <td className="text-center px-3 py-3 text-gray-600 dark:text-gray-400">{r.avgSentiment}</td>
                        <td className="text-center px-3 py-3 text-green-600 font-medium">{r.positivePercent}%</td>
                        <td className="text-center px-3 py-3 text-yellow-600 font-medium">{r.neutralPercent}%</td>
                        <td className="text-center px-3 py-3 text-red-600 font-medium">{r.negativePercent}%</td>
                        <td className="text-center px-3 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${
                            r.trend === 'improving' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' :
                            r.trend === 'declining' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' :
                            'bg-gray-100 dark:bg-white/5 text-gray-500'
                          }`}>
                            {r.trend === 'improving' ? '↑' : r.trend === 'declining' ? '↓' : '→'} {r.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Compare;
