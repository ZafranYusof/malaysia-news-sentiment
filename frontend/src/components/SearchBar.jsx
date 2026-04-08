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

const SearchBar = ({ onSearch, loading }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('Malaysia');
  const [pageSize, setPageSize] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim(), pageSize);
  };

  const handleQuickTopic = (topic) => {
    setQuery(topic);
    onSearch(topic, pageSize);
  };

  return (
    <div className="filter-bar">
      <form onSubmit={handleSubmit} id="search-form">
        <div className="filter-bar-top">
          {/* Search Input */}
          <div className="filter-input-wrap">
            <span className="filter-input-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              aria-label="Search news topic"
              autoComplete="off"
            />
          </div>

          {/* Article count */}
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            disabled={loading}
            className="filter-select"
            aria-label="Number of articles"
          >
            <option value={5}>5 {t('totalArticles').toLowerCase()}</option>
            <option value={10}>10 {t('totalArticles').toLowerCase()}</option>
            <option value={20}>20 {t('totalArticles').toLowerCase()}</option>
          </select>

          <button
            type="button"
            className="btn-outline latest-btn"
            onClick={() => onSearch(query, pageSize, true)}
            disabled={loading}
          >
            <div className="pulse-dot" />
            Latest News
          </button>

          {/* Analyze */}
          <button
            id="search-btn"
            type="submit"
            className="btn-primary"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <>
                <div style={{
                  width: 13, height: 13,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.75s linear infinite',
                  flexShrink: 0,
                }} />
                {t('analyzing')}
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                {t('analyzeBtn')}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick topic chips */}
      <div className="topic-strips" role="list" aria-label="Quick topics">
        <span className="topic-strip-label">{t('quickKeywords')}</span>
        {QUICK_TOPICS.map((topic) => (
          <button
            key={topic}
            className="topic-chip"
            onClick={() => handleQuickTopic(topic)}
            disabled={loading}
            role="listitem"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
