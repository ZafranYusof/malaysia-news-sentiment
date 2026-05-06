import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const TypewriterText = ({ text, speed = 15 }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse">|</span>}
    </span>
  );
};

const SentimentMoodBadge = ({ mood }) => {
  if (!mood) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a]">
      <span className="text-2xl">{mood.emoji}</span>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{mood.text}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{mood.textMs}</p>
      </div>
    </div>
  );
};

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

  const renderDigestContent = (digest) => {
    const text = getDigestText(digest);
    if (!text) return null;
    return (
      <div className="prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <TypewriterText text={text} speed={10} />
        </div>
      </div>
    );
  };

  const currentData = activeTab === 'daily' ? dailyData : activeTab === 'weekly' ? weeklyData : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
              <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/>
            </svg>
            News Digest
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-powered news summaries and insights</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
        {['daily', 'weekly', 'topic'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab === 'daily' ? '📅 Daily' : tab === 'weekly' ? '📊 Weekly' : '🔍 Topic'}
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
            className="space-y-4"
          >
            {loading ? (
              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Generating AI digest...</span>
                </div>
              </div>
            ) : currentData ? (
              <>
                {/* Mood + Stats */}
                <div className="flex flex-wrap gap-3">
                  <SentimentMoodBadge mood={currentData.sentimentMood} />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a]">
                    <span className="text-lg">📰</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentData.articleCount} articles</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">analyzed</p>
                    </div>
                  </div>
                  {currentData.sentimentBreakdown && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a]">
                      <div className="flex gap-1.5 text-xs">
                        <span className="text-green-500">+{currentData.sentimentBreakdown.Positive || 0}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{currentData.sentimentBreakdown.Neutral || 0}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-red-500">-{currentData.sentimentBreakdown.Negative || 0}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Digest Card */}
                <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activeTab === 'daily' ? '📋 Daily Summary' : '📊 Weekly Summary'}
                    </h2>
                    <button
                      onClick={() => handleShare(getDigestText(currentData.digest))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                      {copied ? '✓ Copied!' : '📋 Share'}
                    </button>
                  </div>
                  {renderDigestContent(currentData.digest)}
                </div>

                {/* Highlights */}
                {currentData.highlights && currentData.highlights.length > 0 && (
                  <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">🔑 Key Highlights</h3>
                    <ul className="space-y-2">
                      {currentData.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            h.sentiment === 'Positive' ? 'bg-green-500' :
                            h.sentiment === 'Negative' ? 'bg-red-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-gray-700 dark:text-gray-300">{h.title}</span>
                          <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{h.source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Top Sources (weekly) */}
                {currentData.topSources && (
                  <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">📡 Top Sources This Week</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentData.topSources.map((s, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 text-xs font-medium text-gray-700 dark:text-gray-300 border border-[#eee] dark:border-[#2a2a2a]">
                          {s.name} ({s.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No digest available. Click refresh to generate.</p>
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
          className="space-y-4"
        >
          <form onSubmit={fetchTopicDigest} className="flex gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Enter topic (e.g., economy, politics, flood)..."
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="submit"
              disabled={topicLoading || !topicInput.trim()}
              className="px-6 py-3 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-all"
            >
              {topicLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Generate'}
            </button>
          </form>

          {topicData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Topic: {topicData.topic}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{topicData.articleCount} articles found</p>
                </div>
                <button
                  onClick={() => handleShare(getDigestText(topicData.digest))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  {copied ? '✓ Copied!' : '📋 Share'}
                </button>
              </div>
              {topicData.sentimentBreakdown && (
                <div className="flex gap-3 text-xs">
                  <span className="text-green-500">Positive: {topicData.sentimentBreakdown.Positive || 0}</span>
                  <span className="text-gray-500">Neutral: {topicData.sentimentBreakdown.Neutral || 0}</span>
                  <span className="text-red-500">Negative: {topicData.sentimentBreakdown.Negative || 0}</span>
                </div>
              )}
              {renderDigestContent(topicData.digest)}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Digest;
