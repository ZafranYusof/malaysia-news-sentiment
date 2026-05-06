import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ArticleCard from '../components/ArticleCard';
import ArticlePreviewModal from '../components/ArticlePreviewModal';
import { getHistory, deleteArticle, getStats } from '../services/api';
import { exportToCSV } from '../services/exportUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Download, Clock, ChevronLeft, ChevronRight, Archive } from 'lucide-react';

const History = () => {
  const queryClient = useQueryClient();
  
  const [params, setParams] = useState({
    search: '',
    sentiment: '',
    from: '',
    to: '',
    sortBy: 'newest',
    page: 1,
    limit: 50
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef(null);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleParamChange('search', value);
    }, 400);
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  // Preview Modal
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showPreview, setShowPreview]         = useState(false);

  // Queries
  const { 
    data: historyData, 
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
    error: historyError 
  } = useQuery({
    queryKey: ['history', params],
    queryFn: () => getHistory(params),
    staleTime: 30000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: () => getStats(),
    staleTime: 60000,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteArticle(id),
    onSuccess: () => {
      toast.success('Article deleted');
      queryClient.invalidateQueries(['history']);
      queryClient.invalidateQueries(['stats']);
    },
    onError: () => {
      toast.error('Failed to delete article.');
    }
  });

  // Derived data
  const articles = historyData?.articles || [];
  const totalPages = historyData?.pages || 1;
  const totalCount = historyData?.total || 0;
  const stats = statsData || null;
  const loading = isHistoryLoading || isHistoryFetching;
  const error = historyError?.message || '';

  const handleParamChange = (name, value) => {
    setParams(prev => ({ ...prev, [name]: value, page: name === 'page' ? value : 1 }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently remove this analysis from history?')) return;
    deleteMutation.mutate(id);
  };

  const handlePreview = (article) => {
    setSelectedArticle(article);
    setShowPreview(true);
  };

  const handleExport = () => {
    if (articles.length === 0) return toast.error('No articles to export.');
    exportToCSV(articles, `history-export-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Export started');
  };

  const KPI = stats ? [
    { label: 'Total Analyzed', value: stats.total, color: 'text-blue-600', sub: 'in database' },
    { label: 'Positive', value: stats.sentiments.Positive, color: 'text-emerald-600', sub: `${stats.total ? Math.round(stats.sentiments.Positive/stats.total*100) : 0}%` },
    { label: 'Negative', value: stats.sentiments.Negative, color: 'text-red-500', sub: `${stats.total ? Math.round(stats.sentiments.Negative/stats.total*100) : 0}%` },
    { label: 'Neutral', value: stats.sentiments.Neutral, color: 'text-amber-500', sub: `${stats.total ? Math.round(stats.sentiments.Neutral/stats.total*100) : 0}%` },
  ] : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock size={24} className="text-blue-600" />
          History
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your past searches and analyses
        </p>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          {KPI.map(c => (
            <div key={c.label} className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-4">
              <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{c.label}</div>
              <div className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{c.sub}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search history..." 
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 rounded-xl outline-none text-gray-900 dark:text-white placeholder:text-gray-400 transition-colors"
          />
        </div>

        {/* Sentiment Filter */}
        <select
          value={params.sentiment}
          onChange={(e) => handleParamChange('sentiment', e.target.value)}
          className="px-3 py-2 text-xs font-medium bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-xl text-gray-700 dark:text-gray-300 outline-none"
        >
          <option value="">All Sentiment</option>
          <option value="Positive">Positive</option>
          <option value="Negative">Negative</option>
          <option value="Neutral">Neutral</option>
        </select>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={params.from}
            onChange={(e) => handleParamChange('from', e.target.value)}
            className="px-2.5 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-xl text-gray-700 dark:text-gray-300 outline-none"
            title="From Date"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={params.to}
            onChange={(e) => handleParamChange('to', e.target.value)}
            className="px-2.5 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-xl text-gray-700 dark:text-gray-300 outline-none"
            title="To Date"
          />
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-colors"
        >
          <Download size={14} /> Export
        </button>
      </motion.div>

      {/* Articles */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Filtering history...</p>
          </div>
        ) : articles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
          >
            <Archive size={48} className="text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-base font-semibold text-gray-700 dark:text-gray-300">No matches found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Adjust your filters or try another search term.</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {articles.map(article => (
                <motion.div key={article._id} variants={itemVariants}>
                  <ArticleCard 
                    article={article} 
                    onPreview={handlePreview} 
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-2">
                <button 
                  disabled={params.page === 1} 
                  onClick={() => handleParamChange('page', params.page - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page <strong className="text-gray-900 dark:text-white">{params.page}</strong> of {totalPages}
                  <span className="text-xs ml-2 text-gray-400">({totalCount} items)</span>
                </div>
                <button 
                  disabled={params.page === totalPages} 
                  onClick={() => handleParamChange('page', params.page + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ArticlePreviewModal 
        key={selectedArticle?._id || 'history-preview'}
        article={selectedArticle} 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
      />
    </div>
  );
};

export default History;
