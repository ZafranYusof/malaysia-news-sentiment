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
import ArticlePreviewModal from '../components/ArticlePreviewModal';
import ScrollToTop from '../components/ScrollToTop';
import LoadingScreen from '../components/LoadingScreen';
import { 
  fetchAndAnalyzeNews, getHistory, getStats, getTrends, getTopSources, 
  generateDigest, generateForecast, getRegionalData, getKeywords
} from '../services/api';
import { exportToCSV } from '../services/exportUtils';

const FILTER_OPTIONS = [
  { key: 'All',      label: 'All' },
  { key: 'Positive', label: 'Positive' },
  { key: 'Negative', label: 'Negative' },
  { key: 'Neutral',  label: 'Neutral' },
  { key: 'Alerts',   label: '🔴 Alerts', isAlert: true },
];

const calcDistribution = (arts) => ({
  Positive: arts.filter(a => a.sentiment === 'Positive').length,
  Negative: arts.filter(a => a.sentiment === 'Negative').length,
  Neutral:  arts.filter(a => a.sentiment === 'Neutral').length,
});

const TIME_OPTIONS = [
  { key: '',    label: 'All Time' },
  { key: '24h', label: 'Last 24H' },
  { key: '7d',  label: 'Last 7D' },
  { key: '30d', label: 'Last 30D' },
];

const Dashboard = () => {
  const { user, toggleBookmark } = useAuth();
  const { t, lang } = useLanguage();
  const [articles, setArticles]           = useState([]);
  const [distribution, setDistribution]   = useState({ Positive: 0, Negative: 0, Neutral: 0 });
  const [trends, setTrends]               = useState([]);
  const [sources, setSources]             = useState([]);
  const [digest, setDigest]               = useState(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [forecast, setForecast]           = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [regionalData, setRegionalData]   = useState([]);
  const [regionalLoading, setRegionalLoading] = useState(false);
  const [keywords, setKeywords]           = useState([]);
  const [stats, setStats]                 = useState({ total: 0, sentiments: {}, alerts: 0 });
  const [initLoading, setInitLoading]     = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const [error, setError]                 = useState('');
  const [filter, setFilter]               = useState('All');
  const [timeframe, setTimeframe]         = useState('');
  const [isHistoryView, setIsHistoryView] = useState(true);
  const [currentQuery, setCurrentQuery]   = useState('');

  // (#17) Preview Modal state
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showPreview, setShowPreview]         = useState(false);

  const loadHistory = useCallback(async () => {
    setInitLoading(true);
    setError('');
    try {
      const params = { limit: 20 }; // Show 20 for a more complete recent overview
      if (timeframe) params.timeframe = timeframe;

      const [histData, statsData, trendsData, sourcesData, regData, kwData] = await Promise.all([
        getHistory(params),
        getStats(params).catch(() => ({ total: 0, sentiments: {}, alerts: 0 })),
        getTrends(params).catch(() => []),
        getTopSources(currentQuery ? { topic: currentQuery, ...params } : params).catch(() => []),
        getRegionalData(currentQuery ? { topic: currentQuery, ...params } : params).catch(() => []),
        getKeywords(params).catch(() => []),
      ]);
      const arts = histData.articles || [];
      setArticles(arts);
      setStats(statsData);
      setDistribution(statsData.sentiments || calcDistribution(arts));
      setTrends(trendsData || []);
      setSources(sourcesData || []);
      setRegionalData(regData || []);
      setKeywords(kwData || []);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Could not load analysis history.';
      setError(msg);
      console.error('loadHistory error:', err);
    } finally {
      setInitLoading(false);
    }
  }, [timeframe]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleSearch = async (query, pageSize, latest = false) => {
    setSearchLoading(true);
    setError('');
    setIsHistoryView(false);
    setCurrentQuery(latest ? 'Latest Headlines' : query);
    setDigest(null);

    const msg = latest ? 'Fetching Latest Headlines...' : `Searching for "${query}"...`;
    const searchToast = toast.loading(msg);

    try {
      const data = await fetchAndAnalyzeNews(query, pageSize, latest);
      const fetched = data.articles || [];
      
      if (fetched.length === 0) {
        toast.error('No articles found.', { id: searchToast });
        setIsHistoryView(true);
        loadHistory();
        return;
      }

      setArticles(fetched);
      setDistribution(data.sentimentDistribution || calcDistribution(fetched));

      toast.success(`Analyzed ${fetched.length} articles!`, { id: searchToast });

      const [newTrends, newSources, newReg] = await Promise.all([
        getTrends().catch(() => trends),
        getTopSources(query).catch(() => sources),
        getRegionalData(query).catch(() => []),
      ]);
      setTrends(newTrends);
      setSources(newSources);
      setRegionalData(newReg);

      if (fetched.length > 0) {
        setDigestLoading(true);
        setForecastLoading(true);
        
        generateDigest(fetched, query)
          .then(res => setDigest(res.digest || null))
          .catch(() => setDigest(null))
          .finally(() => setDigestLoading(false));

        generateForecast(fetched, query)
          .then(res => setForecast(res))
          .catch(() => setForecast(null))
          .finally(() => setForecastLoading(false));
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch news.';
      setError(msg);
      toast.error(msg, { id: searchToast });
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePreview = (article) => {
    setSelectedArticle(article);
    setShowPreview(true);
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
    { label: t('totalArticles'), value: counts.total,    mod: 'total', sub: t('articles analyzed') || 'articles analyzed' },
    { label: t('positive'),       value: counts.positive, mod: 'pos',   sub: `${counts.total ? Math.round(counts.positive / counts.total * 100) : 0}% ${t('ofTotal')}` },
    { label: t('negative'),       value: counts.negative, mod: 'neg',   sub: `${counts.total ? Math.round(counts.negative / counts.total * 100) : 0}% ${t('ofTotal')}` },
    { label: t('neutral'),        value: counts.neutral,  mod: 'neu',   sub: `${counts.total ? Math.round(counts.neutral  / counts.total * 100) : 0}% ${t('ofTotal')}` },
  ];

  const isLoading = initLoading || searchLoading;


  return (
    <div className="dashboard-root">
      <SearchBar onSearch={handleSearch} loading={searchLoading} />

      {error && (
        <div className="error-bar" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {isLoading && <LoadingScreen message={searchLoading ? t('analyzing') : 'Syncing News Matrix...'} />}

      {!isLoading && articles.length > 0 && (
        <>
          {/* Print-only Report Header (#3) */}
          <div className="report-header">
            <div className="report-brand">MY News <span>Sentiment</span></div>
            <div className="report-meta">
              <div>Topic: <strong>{currentQuery || 'Malaysia (Overview)'}</strong></div>
              <div>Generated by: {user?.name}</div>
              <div>Date: {new Date().toLocaleString(lang === 'en' ? 'en-MY' : 'ms-MY')}</div>
            </div>
          </div>

          <div className="dash-view-banner">
            {isHistoryView ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>
                  Showing <strong>{articles.length}</strong> of <strong>{stats.total || 0}</strong> previous analyses — search above to analyze new news
                </span>
                <div className="banner-actions">
                  <button className="btn-text-only" onClick={handlePrint}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/><path d="M9 9h1.5M9 13h6M9 17h6"/></svg>
                    PDF Report
                  </button>
                  <button className="btn-text-only" onClick={handleExport}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    CSV
                  </button>
                </div>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span>Showing results for <strong>"{currentQuery}"</strong></span>
                <div className="banner-actions">
                  <button className="btn-text-only" onClick={handlePrint}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/><path d="M9 9h1.5M9 13h6M9 17h6"/></svg>
                    PDF Report
                  </button>
                  <button className="btn-text-only" onClick={handleExport}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    CSV
                  </button>
                  <button className="dash-view-back" onClick={() => { setIsHistoryView(true); loadHistory(); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Back to history
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="dashboard-grid-layout">
            <div className="dashboard-main-content">
              {!isHistoryView && (
                <AiDigestCard digest={digest} loading={digestLoading} topic={currentQuery} />
              )}

              <div className="kpi-row">
                {KPI.map(c => (
                  <div key={c.label} className="kpi-card">
                    <div className="kpi-label">{c.label}</div>
                    <div className={`kpi-value kpi-value--${c.mod}`}>{c.value}</div>
                    <div className="kpi-sub">{c.sub}</div>
                  </div>
                ))}
                {counts.alerts > 0 && (
                  <div className="kpi-card">
                    <div className="kpi-label">{t('alerts')}</div>
                    <div className="kpi-value kpi-value--alert">{counts.alerts}</div>
                    <div className="kpi-sub">flagged articles</div>
                  </div>
                )}
              </div>

              <div className="charts-grid">
                <SentimentPieChart distribution={distribution} />
                <SentimentBarChart distribution={distribution} />
                <SentimentMap data={regionalData} loading={regionalLoading || isLoading} />
                <TrendLineChart trendsData={trends} />
                <TopSourcesChart sourcesData={sources} />
              </div>
            </div>
            
            <aside className="dashboard-side-panels">
              <ForecastCard forecast={forecast} loading={forecastLoading} topic={currentQuery} />
              <WordCloud words={keywords} />
            </aside>
          </div>

          <div className="articles-section">
            <div className="section-toolbar">
              <h2 className="section-heading">
                {isHistoryView ? t('recentHistory') : t('analysisResults')}
                <span className="section-count">{filteredArticles.length}</span>
              </h2>
              
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {/* Timeframe Rail */}
                <div className="filter-rail">
                  {TIME_OPTIONS.map(opt => (
                    <button 
                      key={opt.key}
                      className={`filter-pill ${timeframe === opt.key ? 'active' : ''}`}
                      onClick={() => setTimeframe(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Sentiment Rail */}
                <div className="filter-rail">
                  {FILTER_OPTIONS.map(opt => (
                    <button 
                      key={opt.key}
                      className={`filter-pill ${filter === opt.key ? 'active' : ''}`}
                      onClick={() => setFilter(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="articles-list">
              {filteredArticles.map(article => (
                <ArticleCard 
                  key={article._id || article.url} 
                  article={article} 
                  onPreview={handlePreview} 
                  onBookmark={toggleBookmark}
                  isBookmarked={user?.bookmarks?.includes(article._id || article.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {!isLoading && articles.length === 0 && !error && (
        <div className="state-panel">
          <div className="state-icon">🇲🇾</div>
          <p className="state-title">No Analysis Yet</p>
          <p className="state-sub">Search a topic above to begin analyzing Malaysian news headlines.</p>
        </div>
      )}

      <ArticlePreviewModal 
        article={selectedArticle} 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
      />
      <ScrollToTop />
    </div>
  );
};

export default Dashboard;
