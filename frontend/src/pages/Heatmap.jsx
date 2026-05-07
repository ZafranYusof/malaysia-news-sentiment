import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

// Simplified Malaysia state SVG paths (approximate boundaries)
const STATE_PATHS = {
  'Perlis': 'M 95 30 L 105 25 L 115 30 L 110 40 L 100 42 Z',
  'Kedah': 'M 85 42 L 115 35 L 125 50 L 130 70 L 115 80 L 95 75 L 80 60 Z',
  'Pulau Pinang': 'M 80 80 L 95 75 L 100 85 L 90 92 L 78 88 Z',
  'Perak': 'M 100 80 L 130 70 L 155 85 L 160 110 L 150 130 L 125 135 L 110 120 L 95 100 Z',
  'Kelantan': 'M 155 30 L 185 25 L 200 40 L 195 65 L 175 75 L 155 70 L 145 50 Z',
  'Terengganu': 'M 175 75 L 200 65 L 210 90 L 205 120 L 190 130 L 170 110 L 165 85 Z',
  'Pahang': 'M 150 100 L 170 90 L 190 110 L 200 140 L 190 170 L 165 175 L 145 160 L 140 130 Z',
  'Selangor': 'M 110 130 L 140 125 L 145 155 L 135 170 L 115 168 L 105 150 Z',
  'Kuala Lumpur': 'M 122 145 L 132 143 L 134 153 L 125 155 Z',
  'Putrajaya': 'M 130 158 L 138 156 L 140 163 L 132 164 Z',
  'Negeri Sembilan': 'M 115 170 L 140 165 L 150 180 L 140 195 L 120 192 L 110 180 Z',
  'Melaka': 'M 115 195 L 135 192 L 140 205 L 125 210 L 112 205 Z',
  'Johor': 'M 120 200 L 150 190 L 175 195 L 185 215 L 175 235 L 145 240 L 120 230 L 115 210 Z',
  'Sabah': 'M 320 30 L 380 20 L 400 35 L 395 65 L 375 80 L 345 75 L 325 60 L 315 45 Z',
  'Sarawak': 'M 250 55 L 320 40 L 345 60 L 350 85 L 330 100 L 290 105 L 260 95 L 245 75 Z',
  'Labuan': 'M 310 42 L 318 40 L 320 47 L 313 48 Z',
};

const getSentimentColor = (value, isDark) => {
  if (value > 0.3) return isDark ? '#22c55e' : '#16a34a';
  if (value > 0.1) return isDark ? '#4ade80' : '#22c55e';
  if (value > -0.1) return isDark ? '#eab308' : '#ca8a04';
  if (value > -0.3) return isDark ? '#f97316' : '#ea580c';
  return isDark ? '#ef4444' : '#dc2626';
};

const Heatmap = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [hoveredState, setHoveredState] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/news/heatmap?days=${days}`);
      setData(res.data);
    } catch (err) {
      console.error('Heatmap fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStateData = (stateName) => data.find(d => d.state === stateName) || { avgSentiment: 0, articleCount: 0, topTopic: 'N/A' };

  const handleMouseMove = (e) => {
    setTooltip({ x: e.clientX, y: e.clientY });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sentiment Heatmap</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Geographic sentiment distribution across Malaysia</p>
        </div>

        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="px-3 py-2 rounded-xl border border-[#eee] dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value={1}>Last 24 hours</option>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 relative"
      >
        {loading ? (
          <div className="space-y-4 p-6">
            <div className="h-64 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded-xl animate-pulse" />
            <div className="flex justify-center gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 w-16 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 430 260" className="w-full h-auto max-h-[500px]">
              {/* Background */}
              <rect width="430" height="260" fill="transparent" />

              {/* State paths */}
              {Object.entries(STATE_PATHS).map(([state, path]) => {
                const stateData = getStateData(state);
                const color = stateData.articleCount > 0
                  ? getSentimentColor(stateData.avgSentiment, isDark)
                  : (isDark ? '#333' : '#e5e7eb');

                return (
                  <path
                    key={state}
                    d={path}
                    fill={color}
                    stroke={hoveredState === state ? '#2563eb' : (isDark ? '#555' : '#999')}
                    strokeWidth={hoveredState === state ? 2 : 0.8}
                    className="cursor-pointer transition-all duration-200"
                    style={{ opacity: hoveredState && hoveredState !== state ? 0.5 : 1 }}
                    onMouseEnter={() => setHoveredState(state)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => setSelectedState(state === selectedState ? null : state)}
                  />
                );
              })}

              {/* State labels */}
              {Object.entries(STATE_PATHS).map(([state, path]) => {
                // Calculate centroid from path (simplified)
                const nums = path.match(/\d+/g).map(Number);
                const xs = nums.filter((_, i) => i % 2 === 0);
                const ys = nums.filter((_, i) => i % 2 === 1);
                const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
                const cy = ys.reduce((a, b) => a + b, 0) / ys.length;

                if (['Labuan', 'Putrajaya', 'Kuala Lumpur'].includes(state)) return null;

                return (
                  <text
                    key={`label-${state}`}
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    fontSize="6"
                    fill={isDark ? '#ccc' : '#333'}
                    className="pointer-events-none select-none"
                    fontWeight="500"
                  >
                    {state.length > 10 ? state.slice(0, 8) + '.' : state}
                  </text>
                );
              })}
            </svg>

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredState && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed z-50 pointer-events-none bg-white dark:bg-[#222] border border-[#eee] dark:border-[#333] rounded-xl p-3 shadow-lg"
                  style={{ left: tooltip.x + 15, top: tooltip.y - 10 }}
                >
                  {(() => {
                    const sd = getStateData(hoveredState);
                    return (
                      <>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{hoveredState}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Sentiment: <span className="font-medium">{sd.avgSentiment > 0 ? '+' : ''}{sd.avgSentiment.toFixed(2)}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Articles: {sd.articleCount}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Top: {sd.topTopic}</p>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#22c55e]" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#eab308]" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Neutral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#ef4444]" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Negative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#e5e7eb] dark:bg-[#333]" />
            <span className="text-xs text-gray-600 dark:text-gray-400">No data</span>
          </div>
        </div>
      </motion.div>

      {/* Selected state detail */}
      <AnimatePresence>
        {selectedState && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6"
          >
            {(() => {
              const sd = getStateData(selectedState);
              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedState}</h2>
                    <button
                      onClick={() => setSelectedState(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-[#111]">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{sd.articleCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Articles</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-[#111]">
                      <p className={`text-2xl font-bold ${sd.avgSentiment > 0 ? 'text-green-500' : sd.avgSentiment < 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                        {sd.avgSentiment > 0 ? '+' : ''}{sd.avgSentiment.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avg Sentiment</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-[#111]">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{sd.topTopic}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Top Topic</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* State summary table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">State Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#eee] dark:border-[#2a2a2a]">
                <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">State</th>
                <th className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Articles</th>
                <th className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Sentiment</th>
                <th className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Top Topic</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter(d => d.articleCount > 0)
                .sort((a, b) => b.articleCount - a.articleCount)
                .map((d, i) => (
                  <motion.tr
                    key={d.state}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ x: 3 }}
                    className="border-b border-[#eee] dark:border-[#2a2a2a] last:border-0 hover:bg-gray-50 dark:hover:bg-[#111] cursor-pointer transition-colors"
                    onClick={() => setSelectedState(d.state)}
                  >
                    <td className="py-2.5 text-gray-900 dark:text-white font-medium">{d.state}</td>
                    <td className="py-2.5 text-center text-gray-600 dark:text-gray-300">{d.articleCount}</td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.avgSentiment > 0.1 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                        d.avgSentiment < -0.1 ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                      }`}>
                        {d.avgSentiment > 0 ? '+' : ''}{d.avgSentiment.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 text-center text-gray-600 dark:text-gray-300 capitalize">{d.topTopic}</td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
          {data.filter(d => d.articleCount > 0).length === 0 && !loading && (
            <p className="text-center text-sm text-gray-400 py-8">No geographic data available for this period</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Heatmap;
