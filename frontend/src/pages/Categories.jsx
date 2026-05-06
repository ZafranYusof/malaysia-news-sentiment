import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const CATEGORY_ICONS = {
  Politics: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/>
      <path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/>
    </svg>
  ),
  Economy: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Sports: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
      <path d="M2 12h20"/>
    </svg>
  ),
  Crime: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Technology: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Entertainment: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    </svg>
  ),
  Health: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  Education: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Environment: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L12 14l4-4 4-4"/><path d="M21 3c-2 0-5 2-5 2s2 3 2 5"/>
    </svg>
  ),
  International: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  General: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
    </svg>
  ),
};

const CATEGORY_COLORS = {
  Politics: '#ef4444',
  Economy: '#f59e0b',
  Sports: '#22c55e',
  Crime: '#6b7280',
  Technology: '#3b82f6',
  Entertainment: '#a855f7',
  Health: '#ec4899',
  Education: '#06b6d4',
  Environment: '#10b981',
  International: '#6366f1',
  General: '#78716c',
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/news/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Categories fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryArticles = async (name) => {
    setArticlesLoading(true);
    try {
      const res = await api.get(`/news/category/${encodeURIComponent(name)}`);
      setArticles(res.data.articles || []);
    } catch (err) {
      console.error('Category articles error:', err);
      setArticles([]);
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleCategoryClick = (name) => {
    if (selectedCategory === name) {
      setSelectedCategory(null);
      setArticles([]);
    } else {
      setSelectedCategory(name);
      fetchCategoryArticles(name);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">News Categories</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Auto-categorized articles by topic</p>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat, i) => {
            const color = CATEGORY_COLORS[cat.name] || '#6b7280';
            const isSelected = selectedCategory === cat.name;

            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(cat.name)}
                className={`
                  bg-white dark:bg-[#1a1a1a] border rounded-2xl p-5 cursor-pointer transition-all
                  ${isSelected
                    ? 'border-[#2563eb] ring-2 ring-[#2563eb]/20 dark:border-[#2563eb]'
                    : 'border-[#eee] dark:border-[#2a2a2a] hover:border-[#ccc] dark:hover:border-[#444]'
                  }
                `}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {CATEGORY_ICONS[cat.name] || CATEGORY_ICONS.General}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cat.articleCount} articles</p>
                  </div>
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    cat.avgSentiment > 0.1 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                    cat.avgSentiment < -0.1 ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                  }`}>
                    {cat.avgSentiment > 0 ? '+' : ''}{cat.avgSentiment.toFixed(2)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Selected category articles */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCategory} Articles
              </h2>
              <button
                onClick={() => { setSelectedCategory(null); setArticles([]); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {articlesLoading ? (
              <div className="flex items-center justify-center h-20">
                <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
            ) : articles.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No articles found in this category</p>
            ) : (
              <div className="space-y-3">
                {articles.map((article, i) => (
                  <motion.div
                    key={article._id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a] hover:border-[#ccc] dark:hover:border-[#444] transition-colors"
                  >
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      article.sentiment === 'Positive' ? 'bg-green-500' :
                      article.sentiment === 'Negative' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#2563eb] dark:hover:text-[#60a5fa] transition-colors line-clamp-2"
                      >
                        {article.title}
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{article.source}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(article.publishedAt).toLocaleDateString('en-MY')}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      article.sentiment === 'Positive' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                      article.sentiment === 'Negative' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                    }`}>
                      {article.sentiment}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Categories;
