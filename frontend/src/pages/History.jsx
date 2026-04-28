import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ArticleCard from '../components/ArticleCard';
import ArticlePreviewModal from '../components/ArticlePreviewModal';
import { getHistory, deleteArticle, getStats } from '../services/api';
import { exportToCSV } from '../services/exportUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const History = () => {
  const queryClient = useQueryClient();
  
  // (#6, #7) Filters & Pagination state
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

  // (#17) Preview Modal
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
    { label: 'Total Analyzed', value: stats.total,    mod: 'total', sub: 'in database' },
    { label: 'Positive',       value: stats.sentiments.Positive, mod: 'pos',   sub: `${stats.total ? Math.round(stats.sentiments.Positive/stats.total*100) : 0}%` },
    { label: 'Negative',       value: stats.sentiments.Negative, mod: 'neg',   sub: `${stats.total ? Math.round(stats.sentiments.Negative/stats.total*100) : 0}%` },
    { label: 'Neutral',        value: stats.sentiments.Neutral,  mod: 'neu',   sub: `${stats.total ? Math.round(stats.sentiments.Neutral/stats.total*100) : 0}%` },
  ] : [];

  return (
    <div className="history-page">
      {error && (
        <div className="error-bar" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {stats && (
        <div className="kpi-row" style={{ marginBottom: 24 }}>
          {KPI.map(c => (
            <div key={c.label} className="kpi-card">
              <div className="kpi-label">{c.label}</div>
              <div className={`kpi-value kpi-value--${c.mod}`}>{c.value}</div>
              <div className="kpi-sub">{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* (#7) Advanced Filter Header */}
      <div className="history-toolbar">
        <div className="search-group">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input 
            type="text" 
            placeholder="Search history..." 
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={params.sentiment} onChange={(e) => handleParamChange('sentiment', e.target.value)}>
            <option value="">All Sentiment</option>
            <option value="Positive">Positive</option>
            <option value="Negative">Negative</option>
            <option value="Neutral">Neutral</option>
          </select>

          <div className="date-input-group">
            <input type="date" value={params.from} onChange={(e) => handleParamChange('from', e.target.value)} title="From Date" />
            <span>to</span>
            <input type="date" value={params.to} onChange={(e) => handleParamChange('to', e.target.value)} title="To Date" />
          </div>

          <button className="btn-outline" onClick={handleExport}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>

      <div className="articles-section">
        {loading ? (
          <div className="loading-state-centered">
            <div className="loading-ring" />
            <p>Filtering history...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="state-panel">
            <div className="state-icon">🗃️</div>
            <p className="state-title">No matches found</p>
            <p className="state-sub">Adjust your filters or try another search term.</p>
          </div>
        ) : (
          <>
            <div className="articles-list">
              {articles.map(article => (
                <ArticleCard 
                  key={article._id} 
                  article={article} 
                  onPreview={handlePreview} 
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* (#6) Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  disabled={params.page === 1} 
                  onClick={() => handleParamChange('page', params.page - 1)}
                  className="btn-pagination"
                >
                  Previous
                </button>
                <div className="pagination-info">
                   Page <strong>{params.page}</strong> of {totalPages}
                   <span className="total-label">({totalCount} items)</span>
                </div>
                <button 
                  disabled={params.page === totalPages} 
                  onClick={() => handleParamChange('page', params.page + 1)}
                  className="btn-pagination"
                >
                  Next
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
