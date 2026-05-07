import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const biasColors = {
  left: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  center: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
  right: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  unknown: 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400',
};

const getScoreColor = (score) => {
  if (score >= 75) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

const getBarColor = (score) => {
  if (score >= 75) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const SourceCredibility = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('credibilityScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [biasFilter, setBiasFilter] = useState('all');
  const [selectedSource, setSelectedSource] = useState(null);

  useEffect(() => {
    fetchSources();
  }, [sortBy, sortOrder, biasFilter]);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/credibility', {
        params: { sort: sortBy, order: sortOrder, bias: biasFilter },
      });
      setSources(data.sources || []);
    } catch (err) {
      toast.error('Failed to load sources');
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(o => o === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Source Credibility</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Credibility scores and bias ratings for Malaysian news sources</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-2"
      >
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filter:</span>
        {['all', 'left', 'center', 'right', 'unknown'].map(b => (
          <motion.button
            key={b}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setBiasFilter(b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              biasFilter === b
                ? 'bg-accent text-white'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            {b === 'all' ? 'All' : b.charAt(0).toUpperCase() + b.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Sources Grid */}
      {sources.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No sources found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Source credibility data will appear here once seeded</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <div className="col-span-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('name')}>
              Source {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-2 text-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('credibilityScore')}>
              Credibility {sortBy === 'credibilityScore' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-2 text-center">Bias</div>
            <div className="col-span-2 text-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('factCheckScore')}>
              Fact Check {sortBy === 'factCheckScore' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-2 text-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('transparencyScore')}>
              Transparency {sortBy === 'transparencyScore' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-1"></div>
          </div>

          <AnimatePresence>
            {sources.map((source, i) => (
              <motion.div
                key={source._id || source.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -2, scale: 1.005 }}
                className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5 hover:border-accent/30 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedSource(selectedSource?._id === source._id ? null : source)}
              >
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{source.name}</p>
                    {source.url && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{source.url}</p>
                    )}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-lg font-bold ${getScoreColor(source.credibilityScore)}`}>
                      {source.credibilityScore}
                    </span>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getBarColor(source.credibilityScore)} transition-all`}
                        style={{ width: `${source.credibilityScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${biasColors[source.bias] || biasColors.unknown}`}>
                      {source.bias}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-sm font-semibold ${getScoreColor(source.factCheckScore)}`}>
                      {source.factCheckScore}/100
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-sm font-semibold ${getScoreColor(source.transparencyScore)}`}>
                      {source.transparencyScore}/100
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform ${selectedSource?._id === source._id ? 'rotate-180' : ''}`}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{source.name}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium mt-1 ${biasColors[source.bias] || biasColors.unknown}`}>
                        {source.bias}
                      </span>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(source.credibilityScore)}`}>
                      {source.credibilityScore}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getBarColor(source.credibilityScore)} transition-all`}
                      style={{ width: `${source.credibilityScore}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {selectedSource?._id === source._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-[#eee] dark:border-[#2a2a2a] grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Credibility</p>
                          <p className={`text-xl font-bold ${getScoreColor(source.credibilityScore)}`}>{source.credibilityScore}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fact Check</p>
                          <p className={`text-xl font-bold ${getScoreColor(source.factCheckScore)}`}>{source.factCheckScore}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transparency</p>
                          <p className={`text-xl font-bold ${getScoreColor(source.transparencyScore)}`}>{source.transparencyScore}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Articles</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{source.totalArticles}</p>
                        </div>
                      </div>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 text-xs text-accent hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visit website →
                        </a>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default SourceCredibility;
