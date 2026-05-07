import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const SENTIMENT_COLORS = {
  Positive: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  Negative: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  Neutral:  { bg: 'bg-gray-100 dark:bg-gray-700/30', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-400' },
};

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const SentimentBadge = ({ sentiment, language }) => {
  const colors = SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.Neutral;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${colors.bg} ${colors.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        {sentiment}
      </span>
      {language && (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 uppercase">
          {language === 'ms' ? 'BM' : 'EN'}
        </span>
      )}
    </div>
  );
};

const ArticleCard = ({ article, isNew }) => (
  <motion.a
    href={article.url}
    target="_blank"
    rel="noopener noreferrer"
    initial={isNew ? { opacity: 0, y: -20, scale: 0.95 } : false}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -3, scale: 1.01 }}
    className={`block p-4 rounded-2xl border transition-all hover:shadow-lg cursor-pointer no-underline
      bg-white dark:bg-[#1a1a1a] border-[#eee] dark:border-[#2a2a2a]
      ${isNew ? 'ring-2 ring-blue-400/50 dark:ring-blue-500/30' : ''}
    `}
  >
    {isNew && (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute inset-0 rounded-2xl bg-blue-500/5 pointer-events-none"
      />
    )}
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1.5">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
            {article.description}
          </p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <SentimentBadge sentiment={article.sentiment} language={article.language} />
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {article.source}
          </span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {timeAgo(article.publishedAt)}
          </span>
          {article.isAlert && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300">
              ⚠️ ALERT
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.a>
);

const LiveFeed = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  const [newCount, setNewCount] = useState(0);
  const [newArticleIds, setNewArticleIds] = useState(new Set());
  const [autoScroll, setAutoScroll] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const containerRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Fetch initial articles
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.sentiment = filter;
      if (langFilter !== 'all') params.language = langFilter;
      const { data } = await api.get('/feed/live', { params });
      setArticles(data.articles || []);
      setNewCount(0);
      setNewArticleIds(new Set());
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, langFilter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // SSE connection - use ref for autoScroll to avoid re-creating EventSource
  const autoScrollRef = useRef(autoScroll);
  useEffect(() => { autoScrollRef.current = autoScroll; }, [autoScroll]);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api/v1';
    const url = `${API_BASE}/feed/stream`;
    let reconnectTimer = null;
    let cancelled = false;
    
    const connect = () => {
      if (cancelled) return;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => setSseConnected(true);
      
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_articles' && data.articles?.length > 0) {
            setArticles(prev => {
              const existingUrls = new Set(prev.map(a => a.url));
              const genuinelyNew = data.articles.filter(a => !existingUrls.has(a.url));
              if (genuinelyNew.length === 0) return prev;
              
              const newIds = new Set(genuinelyNew.map(a => a._id || a.url));
              setNewArticleIds(prev => new Set([...prev, ...newIds]));
              
              if (!autoScrollRef.current) {
                setNewCount(prev => prev + genuinelyNew.length);
              }
              
              return [...genuinelyNew, ...prev].slice(0, 100);
            });
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        setSseConnected(false);
        es.close();
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear "new" status after 5s
  useEffect(() => {
    if (newArticleIds.size === 0) return;
    const timer = setTimeout(() => setNewArticleIds(new Set()), 5000);
    return () => clearTimeout(timer);
  }, [newArticleIds]);

  const showNewArticles = () => {
    setNewCount(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredArticles = articles.filter(a => {
    if (filter !== 'all' && a.sentiment !== filter) return false;
    if (langFilter !== 'all') {
      const artLang = a.language === 'ms' ? 'ms' : 'en';
      if (artLang !== langFilter) return false;
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Live Feed</h1>
          <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium ${
            sseConnected 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`} />
            {sseConnected ? 'Live' : 'Reconnecting...'}
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'Positive', 'Negative', 'Neutral'].map(s => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === s
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333]'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </motion.button>
          ))}
          <span className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
          {['all', 'en', 'ms'].map(l => (
            <motion.button
              key={l}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLangFilter(l)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                langFilter === l
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333]'
              }`}
            >
              {l === 'all' ? 'All' : l === 'ms' ? 'BM' : 'EN'}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* New articles banner */}
      <AnimatePresence>
        {newCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={showNewArticles}
            className="w-full py-2.5 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
          >
            ↑ {newCount} new article{newCount > 1 ? 's' : ''} available
          </motion.button>
        )}
      </AnimatePresence>

      {/* Articles list */}
      <div ref={containerRef} className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] animate-pulse">
                <div className="h-4 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded w-3/4 mb-3" />
                <div className="h-3 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded w-full mb-2" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded-full" />
                  <div className="h-5 w-12 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <motion.div
            className="text-center py-20 text-gray-400 dark:text-gray-500"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.svg
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-12 h-12 mx-auto mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </motion.svg>
            <p className="text-sm">No articles found</p>
          </motion.div>
        ) : (
          filteredArticles.map((article, i) => (
            <motion.div
              key={article._id || article.url}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
            >
              <ArticleCard
                article={article}
                isNew={newArticleIds.has(article._id || article.url)}
              />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default LiveFeed;
