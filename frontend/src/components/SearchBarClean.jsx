import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

const QUICK_TOPICS = [
  'Malaysia economy',
  'Malaysia politics', 
  'Malaysia crime',
  'Malaysia education',
  'Ringgit',
  'Budget Malaysia',
];

const SearchBarClean = ({ onSearch, loading = false }) => {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSearch(query.trim(), limit, false);
    }
  };

  const handleQuickSearch = (topic) => {
    setQuery(topic);
    onSearch(topic, limit, false);
  };

  const handleLatestNews = () => {
    onSearch('', limit, true);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input Row */}
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Malaysian news articles..."
              disabled={loading}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>

          {/* Article Limit Selector */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={loading}
            className="px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <option value={5}>5 articles</option>
            <option value={10}>10 articles</option>
            <option value={20}>20 articles</option>
            <option value={30}>30 articles</option>
            <option value={50}>50 articles</option>
          </select>

          {/* Analyze Button */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            <Sparkles className="w-5 h-5" />
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center justify-between pt-2">
          {/* Quick Topics */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quick:
            </span>
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleQuickSearch(topic)}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Latest News Button */}
          <button
            type="button"
            onClick={handleLatestNews}
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Latest News
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBarClean;
