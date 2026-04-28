import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import SentimentPieChart from '../components/SentimentPieChart';
import SentimentBarChart from '../components/SentimentBarChart';
import TrendLineChart from '../components/TrendLineChart';
import TopSourcesChart from '../components/TopSourcesChart';
import AiDigestCard from '../components/AiDigestCard';
import WordCloud from '../components/WordCloud';
import ForecastCard from '../components/ForecastCard';
import SentimentMap from '../components/SentimentMap';
import ScrollToTop from '../components/ScrollToTop';
import AnalyzingOverlay from '../components/AnalyzingOverlay';
import { InlineErrorBoundary } from '../components/ErrorBoundary';
import { Skeleton } from 'boneyard-js/react';
import { 
  fetchAndAnalyzeNews, getDashboardInit, getTopSources,
  generateDigest, generateForecast, getRegionalData, getHistory
} from '../services/api';
import { exportToCSV } from '../services/exportUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../context/SocketContext';

const FILTER_OPTIONS = [
  { key: 'All',      label: 'All' },
  { key: 'Positive', label: 'Positive' },
  { key: 'Negative', label: 'Negative' },
  { key: 'Neutral',  label: 'Neutral' },
  { key: 'Alerts',   label: '🔴 Alerts', isAlert: true },
];

const calcDistribution = (arts) => ({
  Positive: arts.filter(a => (a.sentiment || 'Neutral') === 'Positive').length,
  Negative: arts.filter(a => (a.sentiment || 'Neutral') === 'Negative').length,
  Neutral:  arts.filter(a => (a.sentiment || 'Neutral') === 'Neutral').length,
});

const TIME_OPTIONS = [
  { key: '',    label: 'All Time' },
  { key: '24h', label: 'Last 24H' },
  { key: '7d',  label: 'Last 7D' },
  { key: '30d', label: 'Last 30D' },
];

const Dashboard = () => {
  const { user, toggleBookmark } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const socket = useSocket();
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [filter, setFilter]               = useState('All');
  const [page, setPage]                 = useState(1);
  const LIMIT                           = 10;
  const [timeframe, setTimeframe]         = useState('');
  const [isHistoryView, setIsHistoryView] = useState(true);
  const [currentQuery, setCurrentQuery]   = useState('');

  // 1. Dashboard Init Query (History Mode)
  const { 
    data: dashboardData, 
    isFetching: isDashboardFetching,
    isLoading: isDashboardLoading,
    error: dashboardError 
  } = useQuery({
    queryKey: ['dashboardInit', timeframe, page],
    queryFn: () => getDashboardInit({ limit: LIMIT, page, timeframe }),
    enabled: isHistoryView,
    staleTime: 60000,
  });

  // 2. Top Sources Query
  const { data: sourcesData, isLoading: isSourcesLoading } = useQuery({
    queryKey: ['topSources', isHistoryView ? '' : currentQuery],
    queryFn: () => getTopSources(isHistoryView ? '' : currentQuery),
    staleTime: 60000,
  });

  // 3. Regional Data Query
  const { data: regData, isLoading: isRegLoading } = useQuery({
    queryKey: ['regionalData', isHistoryView ? '' : currentQuery],
    queryFn: () => getRegionalData(isHistoryView ? '' : currentQuery),
    staleTime: 60000,
  });

  // States that still need manual management (Search results, AI generation)
  const [searchArticles, setSearchArticles] = useState([]);
  const [searchDistribution, setSearchDistribution] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [digest, setDigest]               = useState(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [forecast, setForecast]           = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [manualError, setManualError]     = useState('');

  // Reset page when timeframe changes
  useEffect(() => {
    setPage(1);
  }, [timeframe]);

  // Derived Values
  const articles = isHistoryView ? (dashboardData?.history?.articles || []) : searchArticles;
  const distribution = isHistoryView 
    ? (dashboardData?.stats?.sentiments || { Positive: 0, Negative: 0, Neutral: 0 })
    : (searchDistribution || { Positive: 0, Negative: 0, Neutral: 0 });
  const trends = dashboardData?.trends || [];
  const sources = sourcesData || [];
  const regionalData = regData || [];
  const keywords = dashboardData?.keywords || [];
  const stats = dashboardData?.stats || { total: 0, sentiments: {}, alerts: 0 };
  const error = manualError || (dashboardError ? (dashboardError.friendlyMessage || 'Could not load analysis history. Please check if the server is running.') : '');
  
  const initLoading = isDashboardLoading && isHistoryView;
  const historyLoading = isDashboardFetching && !isDashboardLoading && isHistoryView;

  const loadForecastAndDigest = useCallback((fetchedArticles, query) => {
    if (!fetchedArticles.length) {
      setDigest(null);
      setForecast(null);
      setDigestLoading(false);
      setForecastLoading(false);
      return;
    }

    setDigestLoading(true);
    setForecastLoading(true);

    generateDigest(fetchedArticles, query)
      .then(res => setDigest(res.digest || null))
      .catch(() => setDigest(null))
      .finally(() => setDigestLoading(false));

    generateForecast(fetchedArticles, query)
      .then(res => setForecast(res))
      .catch(() => setForecast(null))
      .finally(() => setForecastLoading(false));
  }, []);

  // Automatically trigger forecast when history data loads and we don't have one
  useEffect(() => {
    if (isHistoryView && articles.length > 0 && !digest && !forecast && !digestLoading && !forecastLoading) {
      loadForecastAndDigest(articles, 'Recent History');
    }
  }, [articles, isHistoryView, digest, forecast, digestLoading, forecastLoading, loadForecastAndDigest]);

  const handleManualForecast = () => {
    loadForecastAndDigest(articles, isHistoryView ? 'History Overview' : currentQuery);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = async (query, pageSize, latest = false) => {
    setSearchLoading(true);
    setManualError('');
    setIsHistoryView(false);
    setCurrentQuery(latest ? 'Latest Headlines' : query);
    setDigest(null);

    const msg = latest ? 'Fetching Latest Headlines...' : `Searching for "${query}"...`;
    const searchToast = toast.loading(msg);
    setAnalysisProgress({ done: 0, total: 0 });

    // Listen for real-time progress updates
    const progressHandler = (data) => {
      setAnalysisProgress(data);
      if (data.total > 0) {
        toast.loading(`Analyzing ${data.done}/${data.total} articles...`, { id: searchToast });
      }
      if (data.complete) setAnalysisProgress(null);
    };
    if (socket) socket.on('analysis_progress', progressHandler);

    try {
      const data = await fetchAndAnalyzeNews(query, pageSize, latest);
      const fetched = data.articles || [];
      
      if (fetched.length === 0) {
        toast.error('No articles found.', { id: searchToast });
        setIsHistoryView(true);
        return;
      }

      setSearchArticles(fetched);
      setSearchDistribution(data.sentimentDistribution || calcDistribution(fetched));
      toast.success(`Analyzed ${fetched.length} articles!`, { id: searchToast });

      queryClient.invalidateQueries(['dashboardInit']);
      loadForecastAndDigest(fetched, query);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.error || err.message || 'Failed to fetch news.';
      setManualError(msg);
      toast.error(msg, { id: searchToast });
    } finally {
      setSearchLoading(false);
      setAnalysisProgress(null);
      if (socket) socket.off('analysis_progress');
    }
  };

  const handleExport = () => {
    const filename = isHistoryView ? 'malaysia-news-history.csv' : `sentiment-analysis-${currentQuery}.csv`;
    exportToCSV(articles, filename);
    toast.success('Successfully exported to CSV');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredArticles = (() => {
    if (filter === 'All')    return articles;
    if (filter === 'Alerts') return articles.filter(a => a.isAlert);
    return articles.filter(a => a.sentiment === filter);
  })();

  const counts = {
    total:    stats.total || articles.length,
    positive: stats.sentiments?.Positive || articles.filter(a => a.sentiment === 'Positive').length,
    negative: stats.sentiments?.Negative || articles.filter(a => a.sentiment === 'Negative').length,
    neutral:  stats.sentiments?.Neutral || articles.filter(a => a.sentiment === 'Neutral').length,
    alerts:   stats.alerts || articles.filter(a => a.isAlert).length,
  };

  const KPI = [
    { label: t('totalArticles'), value: counts.total,    mod: 'total', sub: 'articles analyzed' },
    { label: t('positive'),       value: counts.positive, mod: 'pos',   sub: `${counts.total ? Math.round(counts.positive / counts.total * 100) : 0}% of total` },
    { label: t('negative'),       value: counts.negative, mod: 'neg',   sub: `${counts.total ? Math.round(counts.negative / counts.total * 100) : 0}% of total` },
    { label: t('neutral'),        value: counts.neutral,  mod: 'neu',   sub: `${counts.total ? Math.round(counts.neutral  / counts.total * 100) : 0}% of total` },
  ];

  const isLoading = initLoading || searchLoading;

  return (
    <div className="dashboard-root">
      <AnalyzingOverlay progress={analysisProgress} />
      <SearchBar onSearch={handleSearch} loading={searchLoading} />

      {error && (
        <div className="error-bar" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}


      {/* Search results or history sections */}
      <div className={`dashboard-content-wrapper ${isLoading ? 'loading-mask' : ''}`}>
        {!error && (articles.length > 0 || isLoading) && (
          <>
            <Skeleton name="dash-banner" loading={isLoading}>
              <div className="dash-view-banner">
                {isHistoryView ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>Showing <strong>{articles.length}</strong> previous analyses</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <span>Showing results for <strong>"{currentQuery}"</strong></span>
                    <button className="dash-view-back" onClick={() => { setIsHistoryView(true); setManualError(''); }}>Back</button>
                  </>
                )}
                <div className="banner-actions">
                  {isHistoryView && (
                    <div className="time-filter-group">
                      {TIME_OPTIONS.map(opt => (
                        <button
                          key={opt.key}
                          className={`btn-text-only ${timeframe === opt.key ? 'is-active' : ''}`}
                          onClick={() => { setTimeframe(opt.key); setPage(1); }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <button className="btn-text-only" onClick={handleManualForecast}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                      <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
                    </svg>
                    AI Forecast
                  </button>
                  <button className="btn-text-only" onClick={handlePrint}>Report</button>
                  <button className="btn-text-only" onClick={handleExport}>CSV</button>
                </div>
              </div>
            </Skeleton>

            <div className="dashboard-grid-layout">
              <div className="dashboard-main-content">
                {(digest || digestLoading) && !isHistoryView && (
                  <AiDigestCard digest={digest} loading={digestLoading} topic={currentQuery} />
                )}
                
                <Skeleton name="kpi-row" loading={isLoading}>
                  <div className="kpi-row">
                    {KPI.map(c => (
                      <div key={c.label} className="kpi-card">
                        <div className="kpi-label">{c.label}</div>
                        <div className={`kpi-value kpi-value--${c.mod}`}>{c.value}</div>
                        <div className="kpi-sub">{c.sub}</div>
                      </div>
                    ))}
                  </div>
                </Skeleton>

                <Skeleton name="charts-grid" loading={isLoading}>
                  <div className="charts-grid">
                    <InlineErrorBoundary name="Pie Chart">
                      <SentimentPieChart distribution={distribution} />
                    </InlineErrorBoundary>
                    <InlineErrorBoundary name="Bar Chart">
                      <SentimentBarChart distribution={distribution} />
                    </InlineErrorBoundary>
                    <InlineErrorBoundary name="Sentiment Map">
                      <SentimentMap data={regionalData} loading={isLoading} />
                    </InlineErrorBoundary>
                    <InlineErrorBoundary name="Trend Chart">
                      <TrendLineChart trendsData={trends} />
                    </InlineErrorBoundary>
                    <InlineErrorBoundary name="Sources Chart">
                      <TopSourcesChart sourcesData={sources} />
                    </InlineErrorBoundary>
                  </div>
                </Skeleton>
                
                <div className="forecast-wide-wrapper" style={{ marginTop: '32px' }}>
                  <InlineErrorBoundary name="AI Forecast">
                    <ForecastCard forecast={forecast} loading={forecastLoading} topic={currentQuery} />
                  </InlineErrorBoundary>
                </div>
              </div>
              
              <aside className="dashboard-side-panels">
                <Skeleton name="word-cloud" loading={isLoading}>
                  <InlineErrorBoundary name="Word Cloud">
                    <WordCloud words={keywords} />
                  </InlineErrorBoundary>
                </Skeleton>
              </aside>
            </div>

            <div className="articles-section" id="analysis-results" style={{ marginTop: '40px' }}>
              <div className="section-toolbar">
                <h2 className="section-heading">
                  {t('analysisResults')} <Skeleton name="article-count" loading={isLoading} inline><span className="section-count">{filteredArticles.length}</span></Skeleton>
                </h2>
                <div className="filter-rail">
                  {FILTER_OPTIONS.map(opt => (
                    <button key={opt.key} className={`filter-pill ${filter === opt.key ? 'active' : ''}`} onClick={() => setFilter(opt.key)}>{opt.label}</button>
                  ))}
                </div>
              </div>

              <div className="articles-list">
                <Skeleton name="article-card" loading={isLoading || historyLoading} count={3}>
                  {filteredArticles.map(article => (
                    <ArticleCard 
                      key={article._id || article.url} 
                      article={article} 
                      onBookmark={toggleBookmark}
                      isBookmarked={user?.bookmarks?.includes(article._id || article.id)}
                    />
                  ))}
                </Skeleton>
              </div>

              {/* Pagination Controls (#6) */}
              {isHistoryView && stats.total > LIMIT && (
                <div className="pagination" style={{ marginTop: '20px' }}>
                  <button 
                    disabled={page === 1 || isLoading} 
                    onClick={() => handlePageChange(page - 1)}
                    className="btn-pagination"
                  >
                    Previous
                  </button>
                  <div className="pagination-info">
                     Page <strong>{page}</strong> of {Math.ceil(stats.total / LIMIT)}
                     <span className="total-label">({stats.total} total)</span>
                  </div>
                  <button 
                    disabled={page >= Math.ceil(stats.total / LIMIT) || isLoading} 
                    onClick={() => handlePageChange(page + 1)}
                    className="btn-pagination"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ScrollToTop />
    </div>
  );
};

export default Dashboard;
