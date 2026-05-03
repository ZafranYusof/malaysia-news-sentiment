import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const QUICK_TOPICS = [
  'Malaysia economy',
  'Malaysia politics',
  'Malaysia education',
  'Ringgit',
  'Budget Malaysia',
  'Malaysia crime',
  'Malaysia technology',
  'Malaysia flood',
];

const RECENT_KEY = 'recent-searches';
const getRecentSearches = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
};
const saveRecentSearch = (q) => {
  const recent = getRecentSearches().filter(s => s !== q);
  recent.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 5)));
};

const SearchBar = ({ onSearch, loading }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('Malaysia');
  const [pageSize, setPageSize] = useState(10);
  const [showOptions, setShowOptions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query.trim());
    setRecentSearches(getRecentSearches());
    onSearch(query.trim(), pageSize);
  };

  const handleQuickTopic = (topic) => {
    setQuery(topic);
    onSearch(topic, pageSize);
  };

  return (
    <div className="filter-bar">
      <form onSubmit={handleSubmit} id="search-form">
        {isMobile ? (
          /* ── Mobile: Compact inline search ── */
          <>
            <div className="mobile-search-row">
              <div className="filter-input-wrap" style={{ flex: 1 }}>
                <span className="filter-input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </span>
                <input
                  id="news-search-input"
                  type="text"
                  className="filter-input"
                  placeholder={t('searchPlaceholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              <button id="search-btn" type="submit" className="btn-primary mobile-search-btn" disabled={loading || !query.trim()}>
                {loading ? (
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
              </button>
              <button type="button" className="mobile-options-btn" onClick={() => setShowOptions(!showOptions)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
                  <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
                </svg>
              </button>
            </div>
            {showOptions && (
              <div className="mobile-search-options">
                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} disabled={loading} className="filter-select">
                  <option value={5}>5 articles</option>
                  <option value={10}>10 articles</option>
                  <option value={20}>20 articles</option>
                </select>
                <button type="button" className="btn-outline latest-btn" onClick={() => { onSearch(query, pageSize, true); setShowOptions(false); }} disabled={loading}>
                  <div className="pulse-dot" /> Latest
                </button>
              </div>
            )}
            {showOptions && (
              <div className="topic-strips" role="list">
                {QUICK_TOPICS.slice(0, 4).map((topic) => (
                  <button key={topic} className="topic-chip" onClick={() => { handleQuickTopic(topic); setShowOptions(false); }} disabled={loading} role="listitem">{topic}</button>
                ))}
              </div>
            )}
            {/* #4 Recent search queries */}
            {isMobile && recentSearches.length > 0 && !showOptions && (
              <div className="recent-searches">
                <span className="recent-label">Recent:</span>
                {recentSearches.map((s) => (
                  <button key={s} className="recent-chip" onClick={() => { setQuery(s); onSearch(s, pageSize); }} disabled={loading}>{s}</button>
                ))}
              </div>
            )}
          </>
        ) : (
          /* ── Desktop: Original layout ── */
          <>
            <div className="filter-bar-top">
              <div className="filter-input-wrap">
                <span className="filter-input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </span>
                <input id="news-search-input" type="text" className="filter-input" placeholder={t('searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} disabled={loading} autoComplete="off" />
              </div>
              <select id="page-size-select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} disabled={loading} className="filter-select">
                <option value={5}>5 {t('totalArticles').toLowerCase()}</option>
                <option value={10}>10 {t('totalArticles').toLowerCase()}</option>
                <option value={20}>20 {t('totalArticles').toLowerCase()}</option>
              </select>
              <button type="button" className="btn-outline latest-btn" onClick={() => onSearch(query, pageSize, true)} disabled={loading}>
                <div className="pulse-dot" /> Latest News
              </button>
              <button id="search-btn" type="submit" className="btn-primary" disabled={loading || !query.trim()}>
                {loading ? (
                  <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.75s linear infinite', flexShrink: 0 }} />{t('analyzing')}</>
                ) : (
                  <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>{t('analyzeBtn')}</>
                )}
              </button>
            </div>
            <div className="topic-strips" role="list">
              <span className="topic-strip-label">{t('quickKeywords')}</span>
              {QUICK_TOPICS.map((topic) => (
                <button key={topic} className="topic-chip" onClick={() => handleQuickTopic(topic)} disabled={loading} role="listitem">{topic}</button>
              ))}
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
