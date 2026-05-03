import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import SentimentPieChart from '../components/SentimentPieChart';
import AiDigestCard from '../components/AiDigestCard';
import WordCloud from '../components/WordCloud';
import ForecastCard from '../components/ForecastCard';
import ScrollToTop from '../components/ScrollToTop';
import AnalyzingOverlay from '../components/AnalyzingOverlay';
import usePullToRefresh from '../hooks/usePullToRefresh';
import useSwipeTabs from '../hooks/useSwipeTabs';
import { hapticImpact } from '../utils/haptics';

// #5 Lazy load chart components
const SentimentBarChart = lazy(() => import('../components/SentimentBarChart'));
const TrendLineChart = lazy(() => import('../components/TrendLineChart'));
const TopSourcesChart = lazy(() => import('../components/TopSourcesChart'));
const SentimentMap = lazy(() => import('../components/SentimentMap'));

const ChartFallback = () => (
  <div className="chart-lazy-fallback">
    <div className="chart-lazy-spinner" />
  </div>
);

import SourceCredibility from '../components/SourceCredibility';
import { List as VirtualList } from 'react-window';
import ExportPPT from '../components/ExportPPT';
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

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState('overview');
  const [tabSwitching, setTabSwitching] = useState(false); // #3 skeleton on tab switch
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showFabTooltip, setShowFabTooltip] = useState(false);

  // #3 Tab switch with brief skeleton
  const handleTabSwitch = useCallback((tab) => {
    if (tab === mobileTab) return;
    setTabSwitching(true);
    setMobileTab(tab);
    setTimeout(() => setTabSwitching(false), 150);
  }, [mobileTab]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // #1 Pull-to-refresh
  const handlePullRefresh = useCallback(async () => {
    await queryClient.invalidateQueries(['dashboardInit']);
    await queryClient.invalidateQueries(['topSources']);
    await queryClient.invalidateQueries(['regionalData']);
  }, [queryClient]);
  const { pullDistance, isRefreshing, onTouchStart: pullTouchStart, onTouchMove: pullTouchMove, onTouchEnd: pullTouchEnd } = usePullToRefresh(handlePullRefresh);

  // #8 Swipe between tabs
  const MOBILE_TABS = ['overview', 'charts', 'ai'];
  const { onTouchStart: swipeTouchStart, onTouchEnd: swipeTouchEnd } = useSwipeTabs(MOBILE_TABS, mobileTab, setMobileTab);

  // #13 FAB label tooltip on first visit
  useEffect(() => {
    if (!isMobile) return;
    const seen = localStorage.getItem('fab-tooltip-seen');
    if (!seen) {
      setShowFabTooltip(true);
      const timer = setTimeout(() => {
        setShowFabTooltip(false);
        localStorage.setItem('fab-tooltip-seen', '1');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

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
  const [showExportSheet, setShowExportSheet] = useState(false);

  // #11 Back gesture handling for export sheet
  useEffect(() => {
    if (!showExportSheet) return;
    window.history.pushState(null, '');
    const handlePopState = () => setShowExportSheet(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showExportSheet]);

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
    if (isMobile) setMobileTab('ai');
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
  };

  const kpiItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { 
      opacity: 1, scale: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const articleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 }
    }
  };

  const bannerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    }
  };

  return (
    <div
      className="dashboard-root"
      onTouchStart={(e) => { pullTouchStart(e); swipeTouchStart(e); }}
      onTouchMove={pullTouchMove}
      onTouchEnd={(e) => { pullTouchEnd(e); swipeTouchEnd(e); }}
    >
      {/* #1 Pull-to-refresh indicator */}
      {isMobile && (pullDistance > 0 || isRefreshing) && (
        <div className="pull-to-refresh-indicator" style={{ height: pullDistance, opacity: Math.min(pullDistance / 80, 1) }}>
          <div className={`ptr-spinner ${isRefreshing ? 'spinning' : ''}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </div>
        </div>
      )}
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
              <motion.div 
                className="dash-view-banner"
                variants={bannerVariants}
                initial="hidden"
                animate="visible"
              >
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
                        <motion.button
                          key={opt.key}
                          className={`btn-text-only time-filter-btn ${timeframe === opt.key ? 'is-active' : ''}`}
                          onClick={() => { setTimeframe(opt.key); setPage(1); }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  )}
                  <button className="btn-text-only" onClick={handleManualForecast}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                      <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
                    </svg>
                    AI Forecast
                  </button>
                  <ExportPPT articles={articles} distribution={distribution} sources={sources} query={currentQuery} />
                  <button className="btn-text-only" onClick={handlePrint}>Report</button>
                  <button className="btn-text-only" onClick={handleExport}>CSV</button>
                </div>
              </motion.div>
            </Skeleton>

            {/* Mobile Tab Layout */}
            {isMobile ? (
              <>
                <div className="mobile-dash-tabs">
                  <button
                    className={`mobile-dash-tab ${mobileTab === 'overview' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('overview')}
                  >
                    Overview
                  </button>
                  <button
                    className={`mobile-dash-tab ${mobileTab === 'charts' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('charts')}
                  >
                    Charts
                  </button>
                  <button
                    className={`mobile-dash-tab ${mobileTab === 'ai' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('ai')}
                  >
                    AI Insights
                  </button>
                </div>

                {/* #3 Skeleton on tab switch */}
                {tabSwitching && (
                  <div className="mobile-tab-skeleton">
                    <div className="skeleton-bar" style={{ width: '80%', height: 16 }} />
                    <div className="skeleton-bar" style={{ width: '60%', height: 12 }} />
                    <div className="skeleton-bar" style={{ width: '90%', height: 100 }} />
                  </div>
                )}

                {!tabSwitching && mobileTab === 'overview' && (
                  <div className="mobile-tab-content">
                    <Skeleton name="kpi-row" loading={isLoading}>
                      <motion.div 
                        className="kpi-row"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {KPI.map(c => (
                          <motion.div 
                            key={c.label} 
                            className="kpi-card"
                            variants={kpiItemVariants}
                            whileHover={{ scale: 1.03, y: -4 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                          >
                            <div className="kpi-label">{c.label}</div>
                            <div className={`kpi-value kpi-value--${c.mod}`}>{c.value}</div>
                            <div className="kpi-sub">{c.sub}</div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </Skeleton>

                    <Skeleton name="charts-grid" loading={isLoading}>
                      <motion.div 
                        className="charts-grid"
                        variants={chartVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <InlineErrorBoundary name="Pie Chart">
                          <SentimentPieChart distribution={distribution} />
                        </InlineErrorBoundary>
                      </motion.div>
                    </Skeleton>

                    <div className="articles-section" id="analysis-results" style={{ marginTop: '16px' }}>
                      <div className="section-toolbar">
                        <h2 className="section-heading">
                          {t('analysisResults')} <Skeleton name="article-count" loading={isLoading} inline><span className="section-count">{filteredArticles.length}</span></Skeleton>
                        </h2>
                        <div className="filter-rail-wrapper">
                          <div className="filter-rail">
                            {FILTER_OPTIONS.map(opt => (
                              <motion.button 
                                key={opt.key} 
                                className={`filter-pill ${filter === opt.key ? 'active' : ''}`} 
                                onClick={() => setFilter(opt.key)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {opt.label}
                              </motion.button>
                            ))}
                          </div>
                          <div className="filter-rail-fade-right" />
                        </div>
                      </div>

                      <motion.div 
                        className="articles-list"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Skeleton name="article-card" loading={isLoading || historyLoading} count={3}>
                          {filteredArticles.slice(0, 5).map((article) => (
                            <motion.div
                              key={article._id || article.url}
                              variants={articleVariants}
                            >
                              <ArticleCard 
                                article={article} 
                                onBookmark={toggleBookmark}
                                isBookmarked={user?.bookmarks?.includes(article._id || article.id)}
                              />
                            </motion.div>
                          ))}
                        </Skeleton>
                      </motion.div>

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
                  </div>
                )}

                {!tabSwitching && mobileTab === 'charts' && (
                  <div className="mobile-tab-content">
                    {articles.length === 0 && !isLoading ? (
                      /* #14 Empty state for Charts tab */
                      <div className="charts-empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
                        </svg>
                        <p>No chart data available</p>
                        <span>Search or analyze news to see charts</span>
                      </div>
                    ) : (
                      <Skeleton name="charts-grid" loading={isLoading}>
                        <motion.div 
                          className="charts-grid"
                          variants={chartVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Suspense fallback={<ChartFallback />}>
                            <InlineErrorBoundary name="Bar Chart">
                              <SentimentBarChart distribution={distribution} />
                            </InlineErrorBoundary>
                          </Suspense>
                          <Suspense fallback={<ChartFallback />}>
                            <InlineErrorBoundary name="Trend Chart">
                              <TrendLineChart trendsData={trends} />
                            </InlineErrorBoundary>
                          </Suspense>
                          <Suspense fallback={<ChartFallback />}>
                            <InlineErrorBoundary name="Sentiment Map">
                              <SentimentMap data={regionalData} loading={isLoading} />
                            </InlineErrorBoundary>
                          </Suspense>
                          <Suspense fallback={<ChartFallback />}>
                            <InlineErrorBoundary name="Sources Chart">
                              <TopSourcesChart sourcesData={sources} />
                            </InlineErrorBoundary>
                          </Suspense>
                        </motion.div>
                      </Skeleton>
                    )}
                  </div>
                )}

                {!tabSwitching && mobileTab === 'ai' && (
                  <div className="mobile-tab-content">
                    {(digest || digestLoading) && (
                      <AiDigestCard digest={digest} loading={digestLoading} topic={currentQuery} />
                    )}
                    <div className="forecast-wide-wrapper" style={{ marginTop: '16px' }}>
                      <InlineErrorBoundary name="AI Forecast">
                        <ForecastCard forecast={forecast} loading={forecastLoading} topic={currentQuery} />
                      </InlineErrorBoundary>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <Skeleton name="word-cloud" loading={isLoading}>
                        <InlineErrorBoundary name="Word Cloud">
                          <WordCloud words={keywords} />
                        </InlineErrorBoundary>
                      </Skeleton>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <InlineErrorBoundary name="Source Credibility">
                        <SourceCredibility />
                      </InlineErrorBoundary>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Desktop Layout - unchanged */
              <>
                <div className="dashboard-grid-layout">
                  <div className="dashboard-main-content">
                    {(digest || digestLoading) && !isHistoryView && (
                      <AiDigestCard digest={digest} loading={digestLoading} topic={currentQuery} />
                    )}
                    
                    <Skeleton name="kpi-row" loading={isLoading}>
                      <motion.div 
                        className="kpi-row"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {KPI.map(c => (
                          <motion.div 
                            key={c.label} 
                            className="kpi-card"
                            variants={kpiItemVariants}
                            whileHover={{ scale: 1.03, y: -4 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                          >
                            <div className="kpi-label">{c.label}</div>
                            <div className={`kpi-value kpi-value--${c.mod}`}>{c.value}</div>
                            <div className="kpi-sub">{c.sub}</div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </Skeleton>

                    <Skeleton name="charts-grid" loading={isLoading}>
                      <motion.div 
                        className="charts-grid"
                        variants={chartVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <InlineErrorBoundary name="Pie Chart">
                          <SentimentPieChart distribution={distribution} />
                        </InlineErrorBoundary>
                        <Suspense fallback={<ChartFallback />}>
                          <InlineErrorBoundary name="Bar Chart">
                            <SentimentBarChart distribution={distribution} />
                          </InlineErrorBoundary>
                        </Suspense>
                        <Suspense fallback={<ChartFallback />}>
                          <InlineErrorBoundary name="Sentiment Map">
                            <SentimentMap data={regionalData} loading={isLoading} />
                          </InlineErrorBoundary>
                        </Suspense>
                        <Suspense fallback={<ChartFallback />}>
                          <InlineErrorBoundary name="Trend Chart">
                            <TrendLineChart trendsData={trends} />
                          </InlineErrorBoundary>
                        </Suspense>
                        <Suspense fallback={<ChartFallback />}>
                          <InlineErrorBoundary name="Sources Chart">
                            <TopSourcesChart sourcesData={sources} />
                          </InlineErrorBoundary>
                        </Suspense>
                      </motion.div>
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
                    <InlineErrorBoundary name="Source Credibility">
                      <SourceCredibility />
                    </InlineErrorBoundary>
                  </aside>
                </div>

                <div className="articles-section" id="analysis-results" style={{ marginTop: '40px' }}>
                  <div className="section-toolbar">
                    <h2 className="section-heading">
                      {t('analysisResults')} <Skeleton name="article-count" loading={isLoading} inline><span className="section-count">{filteredArticles.length}</span></Skeleton>
                    </h2>
                    <div className="filter-rail">
                      {FILTER_OPTIONS.map(opt => (
                        <motion.button 
                          key={opt.key} 
                          className={`filter-pill ${filter === opt.key ? 'active' : ''}`} 
                          onClick={() => setFilter(opt.key)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.div 
                    className="articles-list"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Skeleton name="article-card" loading={isLoading || historyLoading} count={3}>
                      {/* #7 Virtualized list when > 20 articles */}
                      {filteredArticles.length > 20 ? (
                        <VirtualList
                          height={600}
                          itemCount={filteredArticles.length}
                          itemSize={140}
                          width="100%"
                          style={{ overflow: 'auto' }}
                        >
                          {({ index, style }) => {
                            const article = filteredArticles[index];
                            return (
                              <div style={style} key={article._id || article.url}>
                                <ArticleCard 
                                  article={article} 
                                  onBookmark={toggleBookmark}
                                  isBookmarked={user?.bookmarks?.includes(article._id || article.id)}
                                />
                              </div>
                            );
                          }}
                        </VirtualList>
                      ) : (
                        filteredArticles.map((article, idx) => (
                          <motion.div
                            key={article._id || article.url}
                            variants={articleVariants}
                          >
                            <ArticleCard 
                              article={article} 
                              onBookmark={toggleBookmark}
                              isBookmarked={user?.bookmarks?.includes(article._id || article.id)}
                            />
                          </motion.div>
                        ))
                      )}
                    </Skeleton>
                  </motion.div>

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
          </>
        )}
      </div>

      {/* Mobile FABs - AI Forecast + Export */}
      <div className="mobile-fab-container">
        {/* #13 FAB tooltip */}
        <AnimatePresence>
          {showFabTooltip && (
            <motion.div
              className="fab-tooltip fab-tooltip-secondary"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >Export</motion.div>
          )}
        </AnimatePresence>
        <motion.button
          className="mobile-fab-secondary"
          onClick={() => { hapticImpact('Light'); setShowExportSheet(true); }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Export options"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </motion.button>
        <AnimatePresence>
          {showFabTooltip && (
            <motion.div
              className="fab-tooltip fab-tooltip-primary"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >AI Forecast</motion.div>
          )}
        </AnimatePresence>
        <motion.button
          className="mobile-fab"
          onClick={() => { hapticImpact('Medium'); handleManualForecast(); }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="AI Forecast"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/>
            <path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/>
            <path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
          </svg>
        </motion.button>
      </div>

      {/* Export Bottom Sheet */}
      <AnimatePresence>
        {showExportSheet && (
          <>
            <motion.div
              className="export-sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportSheet(false)}
            />
            <motion.div
              className="export-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setShowExportSheet(false);
              }}
            >
              <div className="export-sheet-handle" />
              <div className="export-sheet-title">Export Options</div>
              <button className="export-sheet-option" onClick={() => { document.querySelector('.export-ppt-trigger')?.click(); setShowExportSheet(false); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
                </svg>
                <span>Export PPTX</span>
              </button>
              <button className="export-sheet-option" onClick={() => { handlePrint(); setShowExportSheet(false); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                <span>Print Report</span>
              </button>
              <button className="export-sheet-option" onClick={() => { handleExport(); setShowExportSheet(false); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <span>Export CSV</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ScrollToTop />
    </div>
  );
};

export default Dashboard;
