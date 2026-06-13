import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Digest = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [topicInput, setTopicInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [topicLoading, setTopicLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeTab === 'daily' && !dailyData) fetchDaily();
    if (activeTab === 'weekly' && !weeklyData) fetchWeekly();
  }, [activeTab]);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/digest/daily');
      setDailyData(data);
    } catch (err) {
      console.error('Failed to fetch daily digest:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekly = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/digest/weekly');
      setWeeklyData(data);
    } catch (err) {
      console.error('Failed to fetch weekly digest:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicDigest = async (e) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    setTopicLoading(true);
    try {
      const { data } = await api.get(`/digest/topic/${encodeURIComponent(topicInput.trim())}`);
      setTopicData(data);
    } catch (err) {
      console.error('Failed to fetch topic digest:', err);
    } finally {
      setTopicLoading(false);
    }
  };

  const handleShare = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDigestText = (digest) => {
    if (!digest) return '';
    if (typeof digest === 'string') return digest;
    return digest.en || digest.ms || JSON.stringify(digest);
  };

  const currentData = activeTab === 'daily' ? dailyData : activeTab === 'weekly' ? weeklyData : null;

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header - editorial style */}
      <div className="border-b-2 border-gray-900 dark:border-white pb-3">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              News Digest
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 tracking-wide uppercase">
              {formatDate()}
            </p>
          </div>
          {currentData && (
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>{currentData.articleCount} articles</span>
              {currentData.sentimentBreakdown && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {currentData.sentimentBreakdown.Positive || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    {currentData.sentimentBreakdown.Neutral || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {currentData.sentimentBreakdown.Negative || 0}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs - minimal underline style */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-[#2a2a2a]">
        {['daily', 'weekly', 'topic'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Daily/Weekly Content */}
      {(activeTab === 'daily' || activeTab === 'weekly') && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-400 mt-3">Loading digest...</p>
              </div>
            ) : currentData ? (
              <>
                {/* Sentiment mood - subtle */}
                {currentData.sentimentMood && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Overall mood:
                    </span>
                    <span>{currentData.sentimentMood.text}</span>
                  </div>
                )}

                {/* Main Digest */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                      {activeTab === 'daily' ? 'Today\'s Summary' : 'Weekly Roundup'}
                    </h2>
                    <button
                      onClick={() => handleShare(getDigestText(currentData.digest))}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {getDigestText(currentData.digest)}
                  </div>
                </div>

                {/* Highlights */}
                {currentData.highlights && currentData.highlights.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-[#2a2a2a] pt-5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
                      Key Stories
                    </h3>
                    <div className="space-y-0 divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                      {currentData.highlights.map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-start gap-3 py-2.5 group"
                        >
                          <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            h.sentiment === 'Positive' ? 'bg-green-500' :
                            h.sentiment === 'Negative' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`} />
                          <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex-1">
                            {h.title}
                          </span>
                          <span className="text-[11px] text-gray-400 flex-shrink-0 font-medium">
                            {h.source}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Sources (weekly) */}
                {currentData.topSources && (
                  <div className="border-t border-gray-200 dark:border-[#2a2a2a] pt-5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
                      Sources
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentData.topSources.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#333] rounded">
                          {s.name} <span className="text-gray-400 dark:text-gray-500">({s.count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400">No digest available for this period.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Topic Search */}
      {activeTab === 'topic' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <form onSubmit={fetchTopicDigest} className="flex gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Enter a topic..."
              className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
            />
            <button
              type="submit"
              disabled={topicLoading || !topicInput.trim()}
              className="px-5 py-2.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-40 transition-all"
            >
              {topicLoading ? (
                <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : 'Search'}
            </button>
          </form>

          {topicData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-end justify-between border-b border-gray-200 dark:border-[#2a2a2a] pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {topicData.topic}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {topicData.articleCount} articles found
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {topicData.sentimentBreakdown && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {topicData.sentimentBreakdown.Positive || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        {topicData.sentimentBreakdown.Neutral || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {topicData.sentimentBreakdown.Negative || 0}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => handleShare(getDigestText(topicData.digest))}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {getDigestText(topicData.digest)}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Digest;
