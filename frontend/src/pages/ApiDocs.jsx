import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api/v1';

// ─── Method Badge ────────────────────────────────────────────────────────────
const MethodBadge = ({ method }) => {
  const colors = {
    GET: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20',
    POST: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    PUT: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
    PATCH: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    DELETE: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border whitespace-nowrap ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
};

// ─── Code Block ──────────────────────────────────────────────────────────────
const CodeBlock = ({ code, language = 'json' }) => {
  const [copied, setCopied] = useState(false);
  const text = typeof code === 'string' ? code : JSON.stringify(code, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-gray-900 dark:bg-black/50 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto font-mono leading-relaxed">
        <code>{text}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 rounded-md bg-white/10 text-white/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
};

// ─── Auth Badge ──────────────────────────────────────────────────────────────
const AuthBadge = ({ auth }) => {
  if (auth === 'none') return (
    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 dark:bg-green-500/5 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20">
      Public
    </span>
  );
  if (auth === 'admin') return (
    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
      Admin
    </span>
  );
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-50 dark:bg-yellow-500/5 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20">
      Auth Required
    </span>
  );
};

// ─── Try It Button (Public endpoints only) ───────────────────────────────────
const TryItButton = ({ endpoint }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tryIt = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = endpoint.path + (endpoint.params && endpoint.params.length
        ? '?' + endpoint.params
          .filter(p => p.required)
          .map(p => `${p.name}=${encodeURIComponent(p.name === 'text' ? 'Malaysia economy is growing' : 'malaysia')}`)
          .join('&')
        : '');
      const { data } = await api.get(url);
      setResponse(data);
    } catch (err) {
      setError(err.friendlyMessage || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={tryIt}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center gap-2"
      >
        {loading ? (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        )}
        Try it live
      </button>
      {response && <CodeBlock code={response} />}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ─── Endpoint Data ───────────────────────────────────────────────────────────
const apiCategories = [
  {
    id: 'public',
    title: 'Public',
    icon: '🌐',
    description: 'No authentication required. Access sentiment analysis and article data freely.',
    endpoints: [
      {
        method: 'GET',
        path: '/public/sentiment',
        description: 'Analyze sentiment of any text. Supports English and Bahasa Malaysia with AI-powered NLP models.',
        auth: 'none',
        params: [
          { name: 'text', type: 'string', required: true, description: 'Text to analyze (min 5 characters)' },
        ],
        example: {
          curl: `curl "${API_BASE}/public/sentiment?text=Malaysia%20economy%20growing%20strongly"`,
          response: { text: 'Malaysia economy growing strongly', sentiment: 'Positive', confidence: 0.82, language: 'en', analysis_source: 'ai' },
        },
      },
      {
        method: 'GET',
        path: '/public/articles',
        description: 'Fetch analyzed news articles with optional topic and sentiment filters. Supports pagination.',
        auth: 'none',
        params: [
          { name: 'topic', type: 'string', required: false, description: 'Filter by topic keyword' },
          { name: 'sentiment', type: 'string', required: false, description: 'Filter: Positive, Negative, or Neutral' },
          { name: 'limit', type: 'number', required: false, description: 'Results per page (max 50, default 10)' },
          { name: 'page', type: 'number', required: false, description: 'Page number (default 1)' },
        ],
        example: {
          curl: `curl "${API_BASE}/public/articles?topic=economy&sentiment=Positive&limit=5"`,
          response: { articles: [{ title: 'Malaysia GDP grows 5.2% in Q1', sentiment: 'Positive', confidence: 0.88, source: 'The Star' }], total: 42, page: 1, limit: 5, totalPages: 9 },
        },
      },
      {
        method: 'GET',
        path: '/public/sources',
        description: 'List all tracked news sources with article counts and last activity timestamps.',
        auth: 'none',
        params: [],
        example: {
          curl: `curl "${API_BASE}/public/sources"`,
          response: { sources: [{ name: 'FMT', articleCount: 156, lastArticle: '2026-05-06T12:00:00Z' }, { name: 'The Star', articleCount: 134, lastArticle: '2026-05-06T11:30:00Z' }] },
        },
      },
      {
        method: 'GET',
        path: '/public/trending',
        description: 'Get trending topics from the last 48 hours with sentiment breakdown per topic.',
        auth: 'none',
        params: [],
        example: {
          curl: `curl "${API_BASE}/public/trending"`,
          response: { trending: [{ topic: 'economy', articleCount: 15, sentiments: { Positive: 8, Negative: 3, Neutral: 4 } }], totalArticles: 100, sentimentOverview: { Positive: 40, Negative: 25, Neutral: 35 }, period: '48h' },
        },
      },
    ],
  },
  {
    id: 'auth',
    title: 'Authentication',
    icon: '🔐',
    description: 'User registration, login, and session management. Returns JWT tokens for protected endpoints.',
    endpoints: [
      {
        method: 'POST',
        path: '/auth/register',
        description: 'Register a new user account. Returns JWT token on success.',
        auth: 'none',
        params: [
          { name: 'name', type: 'string', required: true, description: 'Display name (2-50 characters)' },
          { name: 'email', type: 'string', required: true, description: 'Valid email address' },
          { name: 'password', type: 'string', required: true, description: 'Password (min 6 characters)' },
        ],
        bodyExample: true,
        example: {
          curl: `curl -X POST "${API_BASE}/auth/register" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Ali","email":"ali@example.com","password":"secure123"}'`,
          response: { token: 'eyJhbGciOiJIUzI1NiIs...', user: { id: 'usr_abc123', name: 'Ali', email: 'ali@example.com', role: 'user' } },
        },
      },
      {
        method: 'POST',
        path: '/auth/login',
        description: 'Authenticate with email and password. Returns JWT token valid for 7 days.',
        auth: 'none',
        params: [
          { name: 'email', type: 'string', required: true, description: 'Registered email address' },
          { name: 'password', type: 'string', required: true, description: 'Account password' },
        ],
        bodyExample: true,
        example: {
          curl: `curl -X POST "${API_BASE}/auth/login" \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"ali@example.com","password":"secure123"}'`,
          response: { token: 'eyJhbGciOiJIUzI1NiIs...', user: { id: 'usr_abc123', name: 'Ali', email: 'ali@example.com', role: 'user' } },
        },
      },
      {
        method: 'POST',
        path: '/auth/guest',
        description: 'Get a temporary guest token with limited access. No registration required.',
        auth: 'none',
        params: [],
        example: {
          curl: `curl -X POST "${API_BASE}/auth/guest"`,
          response: { token: 'eyJhbGciOiJIUzI1NiIs...', user: { id: 'guest_xyz', name: 'Guest', role: 'guest' }, expiresIn: '24h' },
        },
      },
      {
        method: 'GET',
        path: '/auth/me',
        description: 'Get the currently authenticated user profile and preferences.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/auth/me" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { id: 'usr_abc123', name: 'Ali', email: 'ali@example.com', role: 'user', preferences: { theme: 'dark', language: 'en' }, createdAt: '2026-01-15T08:00:00Z' },
        },
      },
      {
        method: 'PATCH',
        path: '/auth/preferences',
        description: 'Update user preferences (theme, language, notification settings).',
        auth: 'user',
        params: [
          { name: 'theme', type: 'string', required: false, description: 'UI theme: light or dark' },
          { name: 'language', type: 'string', required: false, description: 'Preferred language: en or ms' },
          { name: 'notifications', type: 'boolean', required: false, description: 'Enable email notifications' },
        ],
        bodyExample: true,
        example: {
          curl: `curl -X PATCH "${API_BASE}/auth/preferences" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"theme":"dark","language":"ms"}'`,
          response: { message: 'Preferences updated', preferences: { theme: 'dark', language: 'ms', notifications: true } },
        },
      },
      {
        method: 'PATCH',
        path: '/auth/profile',
        description: 'Update user profile information (name, avatar).',
        auth: 'user',
        params: [
          { name: 'name', type: 'string', required: false, description: 'New display name' },
          { name: 'avatar', type: 'string', required: false, description: 'Avatar URL' },
        ],
        bodyExample: true,
        example: {
          curl: `curl -X PATCH "${API_BASE}/auth/profile" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Ali Ahmad"}'`,
          response: { message: 'Profile updated', user: { id: 'usr_abc123', name: 'Ali Ahmad', email: 'ali@example.com' } },
        },
      },
    ],
  },
  {
    id: 'news',
    title: 'News & Analysis',
    icon: '📰',
    description: 'Core news endpoints for searching, analyzing, and interacting with Malaysian news articles.',
    endpoints: [
      {
        method: 'GET',
        path: '/news',
        description: 'Search and analyze news articles. Supports keyword search, pagination, and fresh data fetching.',
        auth: 'user',
        params: [
          { name: 'q', type: 'string', required: false, description: 'Search query keyword' },
          { name: 'latest', type: 'boolean', required: false, description: 'Fetch latest articles from sources' },
          { name: 'pageSize', type: 'number', required: false, description: 'Results per page (default 10)' },
          { name: 'refresh', type: 'boolean', required: false, description: 'Force refresh from news APIs' },
        ],
        example: {
          curl: `curl "${API_BASE}/news?q=ringgit&pageSize=5" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { articles: [{ id: 'art_001', title: 'Ringgit strengthens against USD', source: 'The Star', sentiment: 'Positive', confidence: 0.91, publishedAt: '2026-05-06T10:00:00Z' }], total: 28, pageSize: 5 },
        },
      },
      {
        method: 'GET',
        path: '/news/sources',
        description: 'Get top news sources ranked by article count and reliability.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/news/sources" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { sources: [{ name: 'FMT', count: 245, reliability: 0.87 }, { name: 'The Star', count: 198, reliability: 0.92 }] },
        },
      },
      {
        method: 'GET',
        path: '/news/keywords',
        description: 'Get trending keywords extracted from recent articles using NLP.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/news/keywords" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { keywords: [{ word: 'economy', count: 45, trend: 'up' }, { word: 'election', count: 32, trend: 'stable' }], period: '7d' },
        },
      },
      {
        method: 'GET',
        path: '/news/regional',
        description: 'Get sentiment analysis broken down by Malaysian states/regions.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/news/regional" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { regions: [{ state: 'Selangor', sentiment: 'Positive', score: 0.65, articleCount: 89 }, { state: 'Johor', sentiment: 'Neutral', score: 0.48, articleCount: 45 }] },
        },
      },
      {
        method: 'GET',
        path: '/news/top',
        description: 'Get top viewed/trending articles filtered by time period and category.',
        auth: 'user',
        params: [
          { name: 'filter', type: 'string', required: false, description: 'Time filter: today or week (default: today)' },
          { name: 'category', type: 'string', required: false, description: 'Category filter (e.g., politics, economy)' },
        ],
        example: {
          curl: `curl "${API_BASE}/news/top?filter=today&category=politics" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { articles: [{ id: 'art_005', title: 'PM announces new policy', views: 1250, sentiment: 'Neutral' }], filter: 'today', category: 'politics' },
        },
      },
      {
        method: 'GET',
        path: '/news/sentiment-timeline',
        description: 'Get sentiment scores over time for a specific topic. Useful for trend visualization.',
        auth: 'user',
        params: [
          { name: 'topic', type: 'string', required: false, description: 'Topic to track (default: general)' },
          { name: 'days', type: 'number', required: false, description: 'Number of days to look back (default: 7)' },
        ],
        example: {
          curl: `curl "${API_BASE}/news/sentiment-timeline?topic=economy&days=14" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { topic: 'economy', timeline: [{ date: '2026-05-01', positive: 12, negative: 3, neutral: 5 }, { date: '2026-05-02', positive: 8, negative: 6, neutral: 4 }], days: 14 },
        },
      },
      {
        method: 'GET',
        path: '/news/advanced-search',
        description: 'Advanced article search with multiple filters including source, date range, and sentiment.',
        auth: 'user',
        params: [
          { name: 'q', type: 'string', required: false, description: 'Search query' },
          { name: 'sentiment', type: 'string', required: false, description: 'Filter: Positive, Negative, Neutral' },
          { name: 'source', type: 'string', required: false, description: 'Filter by source name' },
          { name: 'dateFrom', type: 'string', required: false, description: 'Start date (ISO 8601)' },
          { name: 'dateTo', type: 'string', required: false, description: 'End date (ISO 8601)' },
        ],
        example: {
          curl: `curl "${API_BASE}/news/advanced-search?q=budget&sentiment=Positive&source=FMT&dateFrom=2026-04-01&dateTo=2026-05-01" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { articles: [{ id: 'art_010', title: 'Budget 2026 well received', source: 'FMT', sentiment: 'Positive', confidence: 0.89, publishedAt: '2026-04-15T09:00:00Z' }], total: 12, filters: { q: 'budget', sentiment: 'Positive', source: 'FMT' } },
        },
      },
      {
        method: 'POST',
        path: '/news/compare',
        description: 'Compare sentiment across multiple topics side by side.',
        auth: 'user',
        params: [
          { name: 'topics', type: 'array', required: true, description: 'Array of topic strings to compare (2-5 topics)' },
        ],
        bodyExample: true,
        example: {
          curl: `curl -X POST "${API_BASE}/news/compare" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"topics":["economy","politics","education"]}'`,
          response: { comparison: [{ topic: 'economy', positive: 45, negative: 20, neutral: 35, avgConfidence: 0.82 }, { topic: 'politics', positive: 30, negative: 40, neutral: 30, avgConfidence: 0.78 }] },
        },
      },
      {
        method: 'GET',
        path: '/news/heatmap',
        description: 'Get Malaysia geographic heatmap data showing sentiment intensity by region.',
        auth: 'user',
        params: [
          { name: 'days', type: 'number', required: false, description: 'Days to aggregate (default: 7)' },
        ],
        example: {
          curl: `curl "${API_BASE}/news/heatmap?days=7" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { heatmap: [{ state: 'Selangor', lat: 3.0738, lng: 101.5183, intensity: 0.78, articles: 89 }, { state: 'Penang', lat: 5.4164, lng: 100.3327, intensity: 0.62, articles: 45 }], days: 7 },
        },
      },
      {
        method: 'GET',
        path: '/news/categories',
        description: 'Get overview of all news categories with article counts and sentiment distribution.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/news/categories" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { categories: [{ name: 'Politics', count: 156, sentiment: { Positive: 40, Negative: 60, Neutral: 56 } }, { name: 'Economy', count: 120, sentiment: { Positive: 65, Negative: 25, Neutral: 30 } }] },
        },
      },
      {
        method: 'GET',
        path: '/news/category/:name',
        description: 'Get articles filtered by a specific category name.',
        auth: 'user',
        params: [
          { name: ':name', type: 'string', required: true, description: 'Category name (URL parameter)' },
        ],
        example: {
          curl: `curl "${API_BASE}/news/category/politics" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { category: 'politics', articles: [{ id: 'art_020', title: 'Parliament session begins', sentiment: 'Neutral', source: 'Bernama' }], total: 156 },
        },
      },
      {
        method: 'POST',
        path: '/news/digest',
        description: 'Generate an AI-powered news digest summarizing recent articles and trends.',
        auth: 'user',
        params: [],
        bodyExample: false,
        example: {
          curl: `curl -X POST "${API_BASE}/news/digest" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { digest: { summary: 'Today\'s Malaysian news is dominated by economic growth...', highlights: ['GDP growth exceeds expectations', 'New infrastructure projects announced'], sentiment: 'Positive', generatedAt: '2026-05-07T08:00:00Z' } },
        },
      },
      {
        method: 'POST',
        path: '/news/forecast',
        description: 'Generate AI-powered sentiment forecast predicting future trends based on historical data.',
        auth: 'user',
        params: [],
        bodyExample: false,
        example: {
          curl: `curl -X POST "${API_BASE}/news/forecast" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { forecast: { topic: 'general', predictions: [{ date: '2026-05-08', predictedSentiment: 'Positive', confidence: 0.72 }], model: 'time-series-v2', generatedAt: '2026-05-07T08:00:00Z' } },
        },
      },
      {
        method: 'POST',
        path: '/news/analyze-article',
        description: 'Perform deep AI analysis on a specific article including entity extraction, bias detection, and credibility scoring.',
        auth: 'user',
        params: [
          { name: 'url', type: 'string', required: false, description: 'Article URL to analyze' },
          { name: 'text', type: 'string', required: false, description: 'Article text content' },
        ],
        bodyExample: true,
        example: {
          curl: `curl -X POST "${API_BASE}/news/analyze-article" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"url":"https://www.thestar.com.my/news/article-123"}'`,
          response: { analysis: { sentiment: 'Positive', confidence: 0.88, entities: ['Malaysia', 'Bank Negara', 'GDP'], bias: 'low', credibility: 0.91, topics: ['economy', 'finance'], summary: 'Article discusses positive economic indicators...' } },
        },
      },
      {
        method: 'POST',
        path: '/news/:id/view',
        description: 'Track article view for analytics. Called when user opens an article.',
        auth: 'user',
        params: [
          { name: ':id', type: 'string', required: true, description: 'Article ID (URL parameter)' },
        ],
        example: {
          curl: `curl -X POST "${API_BASE}/news/art_001/view" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { message: 'View tracked', views: 126 },
        },
      },
      {
        method: 'POST',
        path: '/news/:id/vote',
        description: 'Vote on article sentiment accuracy. Helps improve model training.',
        auth: 'user',
        params: [
          { name: ':id', type: 'string', required: true, description: 'Article ID (URL parameter)' },
          { name: 'vote', type: 'string', required: true, description: 'Vote: agree or disagree' },
        ],
        bodyExample: true,
        example: {
          curl: `curl -X POST "${API_BASE}/news/art_001/vote" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"vote":"agree"}'`,
          response: { message: 'Vote recorded', votes: { agree: 45, disagree: 3 } },
        },
      },
      {
        method: 'POST',
        path: '/news/:id/bookmark',
        description: 'Toggle bookmark on an article. Bookmarked articles appear in user history.',
        auth: 'user',
        params: [
          { name: ':id', type: 'string', required: true, description: 'Article ID (URL parameter)' },
        ],
        example: {
          curl: `curl -X POST "${API_BASE}/news/art_001/bookmark" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { bookmarked: true, message: 'Article bookmarked' },
        },
      },
    ],
  },
  {
    id: 'entities',
    title: 'Entities',
    icon: '🔗',
    description: 'Entity extraction and relationship graph. Discover connections between people, organizations, and topics.',
    endpoints: [
      {
        method: 'GET',
        path: '/entities/graph',
        description: 'Get entity relationship graph data for visualization. Shows connections between entities mentioned in news.',
        auth: 'user',
        params: [
          { name: 'query', type: 'string', required: false, description: 'Filter by entity name or topic' },
          { name: 'timeframe', type: 'string', required: false, description: 'Time range: 7d, 30d, 90d' },
          { name: 'type', type: 'string', required: false, description: 'Entity type: person, org, location' },
        ],
        example: {
          curl: `curl "${API_BASE}/entities/graph?query=economy&timeframe=30d" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { nodes: [{ id: 'e1', name: 'Bank Negara', type: 'org', mentions: 45 }, { id: 'e2', name: 'Anwar Ibrahim', type: 'person', mentions: 89 }], edges: [{ source: 'e1', target: 'e2', weight: 12, context: 'economic policy' }] },
        },
      },
      {
        method: 'GET',
        path: '/entities/search',
        description: 'Search for entities by name with fuzzy matching.',
        auth: 'user',
        params: [
          { name: 'q', type: 'string', required: true, description: 'Search query for entity name' },
        ],
        example: {
          curl: `curl "${API_BASE}/entities/search?q=petronas" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { entities: [{ name: 'Petronas', type: 'org', mentions: 234, sentiment: 'Positive', lastSeen: '2026-05-06T15:00:00Z' }] },
        },
      },
      {
        method: 'GET',
        path: '/entities/:name',
        description: 'Get detailed information about a specific entity including sentiment history and related articles.',
        auth: 'user',
        params: [
          { name: ':name', type: 'string', required: true, description: 'Entity name (URL parameter)' },
        ],
        example: {
          curl: `curl "${API_BASE}/entities/Petronas" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { name: 'Petronas', type: 'org', totalMentions: 234, sentimentHistory: [{ date: '2026-05-01', sentiment: 'Positive', count: 8 }], relatedEntities: ['KLCC', 'Oil & Gas'], recentArticles: [{ id: 'art_050', title: 'Petronas Q1 results exceed expectations' }] },
        },
      },
    ],
  },
  {
    id: 'feed',
    title: 'Live Feed',
    icon: '📡',
    description: 'Real-time news feed and Server-Sent Events (SSE) stream for live updates.',
    endpoints: [
      {
        method: 'GET',
        path: '/feed/live',
        description: 'Get the 50 most recent articles with optional sentiment and language filters.',
        auth: 'none',
        params: [
          { name: 'sentiment', type: 'string', required: false, description: 'Filter: Positive, Negative, Neutral' },
          { name: 'language', type: 'string', required: false, description: 'Filter: en or ms' },
        ],
        example: {
          curl: `curl "${API_BASE}/feed/live?sentiment=Positive&language=en"`,
          response: { articles: [{ id: 'art_100', title: 'Tech sector booms in Malaysia', sentiment: 'Positive', source: 'The Edge', publishedAt: '2026-05-07T11:30:00Z' }], count: 50, lastUpdated: '2026-05-07T12:00:00Z' },
        },
      },
      {
        method: 'GET',
        path: '/feed/stream',
        description: 'Server-Sent Events (SSE) endpoint for real-time article updates. Connect and receive new articles as they are analyzed.',
        auth: 'none',
        params: [],
        example: {
          curl: `curl -N "${API_BASE}/feed/stream"`,
          response: 'event: article\ndata: {"id":"art_101","title":"Breaking: New policy announced","sentiment":"Neutral","source":"Bernama","publishedAt":"2026-05-07T12:05:00Z"}\n\nevent: heartbeat\ndata: {"timestamp":"2026-05-07T12:05:30Z"}',
        },
      },
    ],
  },
  {
    id: 'forecast',
    title: 'Forecast',
    icon: '🔮',
    description: 'AI-powered sentiment forecasting for specific topics.',
    endpoints: [
      {
        method: 'GET',
        path: '/forecast/:topic',
        description: 'Get sentiment forecast for a specific topic using time-series prediction models.',
        auth: 'none',
        params: [
          { name: ':topic', type: 'string', required: true, description: 'Topic to forecast (URL parameter)' },
          { name: 'days', type: 'number', required: false, description: 'Days to forecast ahead (default: 7, max: 30)' },
        ],
        example: {
          curl: `curl "${API_BASE}/forecast/economy?days=14"`,
          response: { topic: 'economy', forecast: [{ date: '2026-05-08', predicted: 'Positive', confidence: 0.74 }, { date: '2026-05-09', predicted: 'Positive', confidence: 0.71 }], model: 'lstm-v2', accuracy: 0.78 },
        },
      },
    ],
  },
  {
    id: 'digest',
    title: 'Digest',
    icon: '📋',
    description: 'AI-generated news digests summarizing key stories and trends.',
    endpoints: [
      {
        method: 'GET',
        path: '/digest/daily',
        description: 'Get today\'s AI-generated daily news digest with key highlights and sentiment summary.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/digest/daily" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { date: '2026-05-07', summary: 'Malaysian markets showed strong performance...', highlights: ['Ringgit strengthens 0.5%', 'New tech hub announced in Cyberjaya'], overallSentiment: 'Positive', articleCount: 145, generatedAt: '2026-05-07T06:00:00Z' },
        },
      },
      {
        method: 'GET',
        path: '/digest/weekly',
        description: 'Get weekly digest with trend analysis and week-over-week comparisons.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/digest/weekly" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { week: '2026-W19', summary: 'This week saw increased positive sentiment...', topTopics: ['economy', 'technology', 'education'], sentimentTrend: { thisWeek: 0.62, lastWeek: 0.55, change: '+12.7%' }, articleCount: 890 },
        },
      },
      {
        method: 'GET',
        path: '/digest/topic/:topic',
        description: 'Get a focused digest for a specific topic with deep analysis.',
        auth: 'user',
        params: [
          { name: ':topic', type: 'string', required: true, description: 'Topic name (URL parameter)' },
        ],
        example: {
          curl: `curl "${API_BASE}/digest/topic/economy" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { topic: 'economy', summary: 'Economic news this week focused on GDP growth...', articles: 45, sentiment: { Positive: 25, Negative: 8, Neutral: 12 }, keyEntities: ['Bank Negara', 'GDP', 'Ringgit'], generatedAt: '2026-05-07T06:00:00Z' },
        },
      },
    ],
  },
  {
    id: 'alerts',
    title: 'Alerts',
    icon: '🔔',
    description: 'Manage custom sentiment alerts. Get notified when topics match your criteria.',
    endpoints: [
      {
        method: 'GET',
        path: '/alerts',
        description: 'List all alerts configured by the current user.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/alerts" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { alerts: [{ id: 'alrt_001', topic: 'ringgit', sentiment: 'Negative', threshold: 0.8, channel: 'email', active: true, createdAt: '2026-04-01T10:00:00Z' }] },
        },
      },
      {
        method: 'POST',
        path: '/alerts',
        description: 'Create a new sentiment alert. Triggers when matching articles are detected.',
        auth: 'user',
        params: [
          { name: 'topic', type: 'string', required: true, description: 'Topic keyword to monitor' },
          { name: 'sentiment', type: 'string', required: false, description: 'Trigger on: Positive, Negative, Neutral, or any' },
          { name: 'threshold', type: 'number', required: false, description: 'Minimum confidence to trigger (0-1)' },
          { name: 'channel', type: 'string', required: false, description: 'Notification channel: email or push' },
        ],
        bodyExample: true,
        example: {
          curl: `curl -X POST "${API_BASE}/alerts" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"topic":"ringgit","sentiment":"Negative","threshold":0.8,"channel":"email"}'`,
          response: { id: 'alrt_002', topic: 'ringgit', sentiment: 'Negative', threshold: 0.8, channel: 'email', active: true, createdAt: '2026-05-07T12:00:00Z' },
        },
      },
      {
        method: 'PUT',
        path: '/alerts/:id',
        description: 'Update an existing alert configuration.',
        auth: 'user',
        params: [
          { name: ':id', type: 'string', required: true, description: 'Alert ID (URL parameter)' },
          { name: 'topic', type: 'string', required: false, description: 'Updated topic' },
          { name: 'active', type: 'boolean', required: false, description: 'Enable/disable alert' },
        ],
        bodyExample: true,
        example: {
          curl: `curl -X PUT "${API_BASE}/alerts/alrt_001" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"active":false}'`,
          response: { id: 'alrt_001', active: false, message: 'Alert updated' },
        },
      },
      {
        method: 'DELETE',
        path: '/alerts/:id',
        description: 'Permanently delete an alert.',
        auth: 'user',
        params: [
          { name: ':id', type: 'string', required: true, description: 'Alert ID (URL parameter)' },
        ],
        example: {
          curl: `curl -X DELETE "${API_BASE}/alerts/alrt_001" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { message: 'Alert deleted' },
        },
      },
      {
        method: 'POST',
        path: '/alerts/test',
        description: 'Send a test notification to verify alert channel configuration.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl -X POST "${API_BASE}/alerts/test" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { message: 'Test notification sent', channel: 'email' },
        },
      },
    ],
  },
  {
    id: 'credibility',
    title: 'Credibility',
    icon: '✅',
    description: 'Source credibility scoring and analysis. Evaluate news source reliability.',
    endpoints: [
      {
        method: 'GET',
        path: '/credibility',
        description: 'List all tracked sources with their credibility scores and metrics.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/credibility" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { sources: [{ name: 'The Star', score: 0.92, factualAccuracy: 0.94, bias: 'center', articleCount: 1250 }, { name: 'FMT', score: 0.87, factualAccuracy: 0.89, bias: 'center-left', articleCount: 980 }] },
        },
      },
      {
        method: 'GET',
        path: '/credibility/:sourceName',
        description: 'Get detailed credibility analysis for a specific news source.',
        auth: 'user',
        params: [
          { name: ':sourceName', type: 'string', required: true, description: 'Source name (URL parameter)' },
        ],
        example: {
          curl: `curl "${API_BASE}/credibility/The%20Star" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { name: 'The Star', score: 0.92, metrics: { factualAccuracy: 0.94, sourceDiversity: 0.88, correctionRate: 0.02, bias: 'center' }, history: [{ month: '2026-04', score: 0.91 }, { month: '2026-05', score: 0.92 }], totalArticles: 1250 },
        },
      },
    ],
  },
  {
    id: 'sources-analysis',
    title: 'Source Analysis',
    icon: '🔍',
    description: 'Calculated credibility scores based on algorithmic analysis.',
    endpoints: [
      {
        method: 'GET',
        path: '/sources/credibility',
        description: 'Get algorithmically calculated credibility scores for all sources based on cross-referencing and fact-checking.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/sources/credibility" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { sources: [{ name: 'Bernama', calculatedScore: 0.95, methodology: 'cross-reference', sampleSize: 500 }], lastCalculated: '2026-05-07T00:00:00Z' },
        },
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: '📊',
    description: 'Generate downloadable PDF reports with charts and analysis.',
    endpoints: [
      {
        method: 'POST',
        path: '/reports/generate',
        description: 'Generate a comprehensive PDF report with sentiment analysis, charts, and insights.',
        auth: 'user',
        params: [],
        bodyExample: false,
        example: {
          curl: `curl -X POST "${API_BASE}/reports/generate" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { reportId: 'rpt_001', status: 'generating', estimatedTime: '30s', downloadUrl: '/reports/download/rpt_001' },
        },
      },
      {
        method: 'POST',
        path: '/reports/topic',
        description: 'Generate a topic-focused PDF report with detailed analysis for a specific subject.',
        auth: 'user',
        params: [
          { name: 'topic', type: 'string', required: true, description: 'Topic for the report' },
          { name: 'days', type: 'number', required: false, description: 'Days to cover (default: 30)' },
        ],
        bodyExample: true,
        example: {
          curl: `curl -X POST "${API_BASE}/reports/topic" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"topic":"economy","days":30}'`,
          response: { reportId: 'rpt_002', topic: 'economy', status: 'generating', estimatedTime: '45s', downloadUrl: '/reports/download/rpt_002' },
        },
      },
    ],
  },
  {
    id: 'history',
    title: 'History',
    icon: '📜',
    description: 'User browsing history, dashboard data, and trend analytics.',
    endpoints: [
      {
        method: 'GET',
        path: '/history/dashboard-init',
        description: 'Get composite dashboard initialization data including stats, recent articles, and trends in a single request.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/history/dashboard-init" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { stats: { totalArticles: 5420, todayArticles: 45, avgSentiment: 0.62 }, recentArticles: [{ id: 'art_200', title: 'Latest news...' }], trends: { positive: 'up', negative: 'down' }, lastUpdated: '2026-05-07T12:00:00Z' },
        },
      },
      {
        method: 'GET',
        path: '/history',
        description: 'Get user\'s article browsing history with timestamps.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/history" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { history: [{ articleId: 'art_001', title: 'Malaysia GDP grows', viewedAt: '2026-05-07T10:30:00Z', bookmarked: true }], total: 156 },
        },
      },
      {
        method: 'GET',
        path: '/history/trends',
        description: 'Get historical trend data for sentiment analysis over time.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/history/trends" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { trends: [{ date: '2026-05-01', positive: 45, negative: 20, neutral: 35 }], period: '30d', overallTrend: 'improving' },
        },
      },
      {
        method: 'GET',
        path: '/history/stats',
        description: 'Get aggregated statistics about analyzed articles.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/history/stats" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { totalArticles: 5420, totalSources: 12, avgConfidence: 0.84, sentimentDistribution: { Positive: 2100, Negative: 1200, Neutral: 2120 }, lastUpdated: '2026-05-07T12:00:00Z' },
        },
      },
      {
        method: 'DELETE',
        path: '/history/:id',
        description: 'Remove a specific article from user browsing history.',
        auth: 'user',
        params: [
          { name: ':id', type: 'string', required: true, description: 'History entry ID (URL parameter)' },
        ],
        example: {
          curl: `curl -X DELETE "${API_BASE}/history/art_001" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { message: 'History entry removed' },
        },
      },
    ],
  },
  {
    id: 'share',
    title: 'Share & Embed',
    icon: '🔗',
    description: 'Public sharing and embedding of article analysis.',
    endpoints: [
      {
        method: 'GET',
        path: '/share/:articleId',
        description: 'Get shareable data for an article including sentiment analysis and metadata.',
        auth: 'none',
        params: [
          { name: ':articleId', type: 'string', required: true, description: 'Article ID (URL parameter)' },
        ],
        example: {
          curl: `curl "${API_BASE}/share/art_001"`,
          response: { article: { title: 'Malaysia GDP grows 5.2%', source: 'The Star', sentiment: 'Positive', confidence: 0.88 }, shareUrl: 'https://sentiment.my/share/art_001', ogImage: 'https://sentiment.my/og/art_001.png' },
        },
      },
      {
        method: 'GET',
        path: '/embed/:articleId',
        description: 'Get embeddable HTML/iframe code for displaying article sentiment on external sites.',
        auth: 'none',
        params: [
          { name: ':articleId', type: 'string', required: true, description: 'Article ID (URL parameter)' },
        ],
        example: {
          curl: `curl "${API_BASE}/embed/art_001"`,
          response: { embedCode: '<iframe src="https://sentiment.my/embed/art_001" width="400" height="200"></iframe>', embedUrl: 'https://sentiment.my/embed/art_001' },
        },
      },
    ],
  },
  {
    id: 'user',
    title: 'User Settings',
    icon: '👤',
    description: 'User dashboard layout and personalization settings.',
    endpoints: [
      {
        method: 'GET',
        path: '/user/dashboard-layout',
        description: 'Get the user\'s saved dashboard widget layout configuration.',
        auth: 'user',
        params: [],
        example: {
          curl: `curl "${API_BASE}/user/dashboard-layout" \\\n  -H "Authorization: Bearer YOUR_TOKEN"`,
          response: { layout: [{ widget: 'sentiment-overview', position: { x: 0, y: 0, w: 2, h: 1 } }, { widget: 'trending-topics', position: { x: 2, y: 0, w: 1, h: 1 } }] },
        },
      },
      {
        method: 'PUT',
        path: '/user/dashboard-layout',
        description: 'Save the user\'s dashboard widget layout configuration.',
        auth: 'user',
        params: [
          { name: 'layout', type: 'array', required: true, description: 'Array of widget position objects' },
        ],
        bodyExample: true,
        example: {
          curl: `curl -X PUT "${API_BASE}/user/dashboard-layout" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"layout":[{"widget":"sentiment-overview","position":{"x":0,"y":0,"w":2,"h":1}}]}'`,
          response: { message: 'Layout saved', layout: [{ widget: 'sentiment-overview', position: { x: 0, y: 0, w: 2, h: 1 } }] },
        },
      },
    ],
  },
  {
    id: 'admin',
    title: 'Admin',
    icon: '⚙️',
    description: 'Administrative endpoints for system monitoring and management. Requires admin role.',
    endpoints: [
      {
        method: 'GET',
        path: '/news/admin/stats',
        description: 'Get admin dashboard statistics including system health, processing queues, and user metrics.',
        auth: 'admin',
        params: [],
        example: {
          curl: `curl "${API_BASE}/news/admin/stats" \\\n  -H "Authorization: Bearer ADMIN_TOKEN"`,
          response: { totalUsers: 156, activeToday: 45, articlesProcessed: 5420, queueSize: 12, systemHealth: 'healthy', uptime: '15d 4h 23m' },
        },
      },
      {
        method: 'GET',
        path: '/news/admin/insights',
        description: 'Get AI-generated insights about system usage patterns and content trends.',
        auth: 'admin',
        params: [],
        example: {
          curl: `curl "${API_BASE}/news/admin/insights" \\\n  -H "Authorization: Bearer ADMIN_TOKEN"`,
          response: { insights: ['User engagement up 23% this week', 'Economy topic trending 3x normal volume', 'Model accuracy improved to 87%'], generatedAt: '2026-05-07T06:00:00Z' },
        },
      },
      {
        method: 'POST',
        path: '/news/admin/send-digest',
        description: 'Manually trigger digest email to all subscribed users.',
        auth: 'admin',
        params: [],
        example: {
          curl: `curl -X POST "${API_BASE}/news/admin/send-digest" \\\n  -H "Authorization: Bearer ADMIN_TOKEN"`,
          response: { message: 'Digest sent', recipients: 89, sentAt: '2026-05-07T12:00:00Z' },
        },
      },
      {
        method: 'GET',
        path: '/admin/metrics',
        description: 'Get detailed API metrics including response times, error rates, and endpoint usage.',
        auth: 'admin',
        params: [],
        example: {
          curl: `curl "${API_BASE}/admin/metrics" \\\n  -H "Authorization: Bearer ADMIN_TOKEN"`,
          response: { requests: { total: 45000, today: 1200, avgResponseTime: '120ms' }, errors: { total: 23, rate: '0.05%' }, topEndpoints: [{ path: '/public/sentiment', calls: 8900 }, { path: '/news', calls: 5600 }], uptime: '99.97%' },
        },
      },
    ],
  },
];

// ─── Sidebar TOC ─────────────────────────────────────────────────────────────
const Sidebar = ({ categories, activeSection, onNavigate }) => {
  return (
    <nav className="hidden lg:block w-56 shrink-0 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="space-y-1">
        <button
          onClick={() => onNavigate('overview')}
          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeSection === 'overview'
              ? 'bg-accent/10 text-accent'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onNavigate('authentication')}
          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeSection === 'authentication'
              ? 'bg-accent/10 text-accent'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          Authentication
        </button>
        <button
          onClick={() => onNavigate('errors')}
          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeSection === 'errors'
              ? 'bg-accent/10 text-accent'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          Error Codes
        </button>
        <button
          onClick={() => onNavigate('realtime')}
          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeSection === 'realtime'
              ? 'bg-accent/10 text-accent'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          Real-time / SSE
        </button>
        <div className="pt-2 pb-1 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Endpoints</span>
        </div>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onNavigate(cat.id)}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              activeSection === cat.id
                ? 'bg-accent/10 text-accent'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span>{cat.title}</span>
            <span className="ml-auto text-[10px] text-gray-400">{cat.endpoints.length}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// ─── Endpoint Card ───────────────────────────────────────────────────────────
const EndpointCard = ({ endpoint, isPublic }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <MethodBadge method={endpoint.method} />
        <code className="text-xs font-mono text-gray-900 dark:text-white truncate">{endpoint.path}</code>
        <AuthBadge auth={endpoint.auth} />
        <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-2 hidden md:inline truncate flex-1">{endpoint.description}</span>
        <svg
          className={`shrink-0 ml-auto w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#eee] dark:border-[#2a2a2a]"
          >
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">{endpoint.description}</p>

              {/* Parameters */}
              {endpoint.params && endpoint.params.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {endpoint.bodyExample ? 'Body Parameters' : 'Query Parameters'}
                  </h4>
                  <div className="border border-[#eee] dark:border-[#2a2a2a] rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-white/5">
                          <th className="text-left px-3 py-2 font-medium text-gray-500">Name</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-500">Type</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-500">Required</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-500">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoint.params.map((p, pi) => (
                          <tr key={pi} className="border-t border-[#eee] dark:border-[#2a2a2a]">
                            <td className="px-3 py-2 font-mono text-accent">{p.name}</td>
                            <td className="px-3 py-2 text-gray-500">{p.type}</td>
                            <td className="px-3 py-2">
                              {p.required ? (
                                <span className="text-red-500 font-medium">Yes</span>
                              ) : (
                                <span className="text-gray-400">No</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Example Request */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Example Request</h4>
                <CodeBlock code={endpoint.example.curl} language="bash" />
              </div>

              {/* Example Response */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Example Response</h4>
                <CodeBlock code={endpoint.example.response} />
              </div>

              {/* Try It (public only) */}
              {isPublic && <TryItButton endpoint={endpoint} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const ApiDocs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedCategories, setExpandedCategories] = useState(new Set(apiCategories.map(c => c.id)));
  const sectionRefs = useRef({});

  // Filter endpoints by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return apiCategories;
    const q = searchQuery.toLowerCase();
    return apiCategories
      .map(cat => ({
        ...cat,
        endpoints: cat.endpoints.filter(ep =>
          ep.path.toLowerCase().includes(q) ||
          ep.method.toLowerCase().includes(q) ||
          ep.description.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.endpoints.length > 0);
  }, [searchQuery]);

  const totalEndpoints = apiCategories.reduce((sum, cat) => sum + cat.endpoints.length, 0);

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    const el = sectionRefs.current[sectionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex gap-8 max-w-7xl mx-auto"
    >
      {/* Sidebar */}
      <Sidebar
        categories={apiCategories}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-8 pb-20">
        {/* Header */}
        <motion.div
          ref={el => sectionRefs.current['overview'] = el}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>
            </svg>
            API Documentation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Complete reference for the Malaysia News Sentiment Analysis API. {totalEndpoints} endpoints across {apiCategories.length} categories.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search endpoints... (e.g. sentiment, POST, bookmark)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#eee] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Base URL', value: API_BASE, mono: true },
            { label: 'Total Endpoints', value: totalEndpoints },
            { label: 'Auth Method', value: 'JWT Bearer' },
            { label: 'Rate Limit', value: '100 req/hr' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-sm font-medium text-gray-900 dark:text-white ${stat.mono ? 'font-mono text-xs break-all' : ''}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Authentication Section */}
        <motion.div
          ref={el => sectionRefs.current['authentication'] = el}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🔐 Authentication
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Protected endpoints require a JWT Bearer token in the <code className="text-accent bg-accent/5 px-1.5 py-0.5 rounded">Authorization</code> header.
            Obtain a token via <code className="text-accent bg-accent/5 px-1.5 py-0.5 rounded">/auth/login</code> or <code className="text-accent bg-accent/5 px-1.5 py-0.5 rounded">/auth/register</code>.
          </p>
          <CodeBlock code={`# Include in all protected requests:\ncurl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." "${API_BASE}/news"`} language="bash" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-green-50 dark:bg-green-500/5 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 font-medium">Public</span>
              <span className="text-gray-500">No token needed</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-yellow-50 dark:bg-yellow-500/5 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20 font-medium">Auth Required</span>
              <span className="text-gray-500">Valid JWT token</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-medium">Admin</span>
              <span className="text-gray-500">Admin role JWT</span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Token Lifecycle</h4>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <li>• Tokens expire after <strong>7 days</strong></li>
              <li>• Guest tokens expire after <strong>24 hours</strong></li>
              <li>• Include token in header: <code className="text-accent">Authorization: Bearer &lt;token&gt;</code></li>
              <li>• Expired tokens return <code className="text-accent">401 Unauthorized</code></li>
            </ul>
          </div>
        </motion.div>

        {/* Error Codes Section */}
        <motion.div
          ref={el => sectionRefs.current['errors'] = el}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            ⚠️ Error Codes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All errors follow a consistent JSON format with an error message and optional details.
          </p>
          <CodeBlock code={`{\n  "error": "Validation failed",\n  "message": "Text parameter is required and must be at least 5 characters",\n  "statusCode": 400\n}`} />
          <div className="border border-[#eee] dark:border-[#2a2a2a] rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-500">Code</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-500">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { code: 200, status: 'OK', desc: 'Request successful' },
                  { code: 201, status: 'Created', desc: 'Resource created successfully' },
                  { code: 400, status: 'Bad Request', desc: 'Invalid parameters or missing required fields' },
                  { code: 401, status: 'Unauthorized', desc: 'Missing or invalid authentication token' },
                  { code: 403, status: 'Forbidden', desc: 'Insufficient permissions (e.g., admin-only endpoint)' },
                  { code: 404, status: 'Not Found', desc: 'Resource does not exist' },
                  { code: 429, status: 'Too Many Requests', desc: 'Rate limit exceeded. Check Retry-After header' },
                  { code: 500, status: 'Internal Error', desc: 'Server error. Contact admin if persistent' },
                ].map((err, i) => (
                  <tr key={i} className="border-t border-[#eee] dark:border-[#2a2a2a]">
                    <td className="px-4 py-2.5 font-mono font-bold text-gray-900 dark:text-white">{err.code}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300">{err.status}</td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">{err.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Real-time / SSE Section */}
        <motion.div
          ref={el => sectionRefs.current['realtime'] = el}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📡 Real-time Updates (SSE)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The API supports Server-Sent Events (SSE) for real-time article updates. Connect to the stream endpoint to receive new articles as they are analyzed.
          </p>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">JavaScript Example</h4>
            <CodeBlock code={`const eventSource = new EventSource('${API_BASE}/feed/stream');\n\neventSource.addEventListener('article', (event) => {\n  const article = JSON.parse(event.data);\n  console.log('New article:', article.title, article.sentiment);\n});\n\neventSource.addEventListener('heartbeat', (event) => {\n  // Connection keep-alive\n});\n\neventSource.onerror = () => {\n  // Auto-reconnects by default\n  console.log('Connection lost, reconnecting...');\n};`} language="javascript" />
          </div>
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Event Types</h4>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <li>• <code className="text-accent">article</code> — New article analyzed (includes full article data)</li>
              <li>• <code className="text-accent">heartbeat</code> — Keep-alive signal (every 30s)</li>
              <li>• <code className="text-accent">error</code> — Stream error notification</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>Note:</strong> SSE connections auto-reconnect on disconnect. No authentication required for the public stream. Average latency from article ingestion to stream delivery is ~2 seconds.
            </p>
          </div>
        </motion.div>

        {/* Rate Limiting */}
        <div className="bg-yellow-50 dark:bg-yellow-500/5 border border-yellow-200 dark:border-yellow-500/20 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">⚡ Rate Limiting</h3>
          <ul className="text-xs text-yellow-700 dark:text-yellow-400/80 space-y-1">
            <li>• Without auth: <strong>100 requests/hour</strong> per IP</li>
            <li>• With auth token: <strong>1,000 requests/hour</strong></li>
            <li>• Admin accounts: <strong>10,000 requests/hour</strong></li>
            <li>• Headers: <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code></li>
            <li>• Exceeding returns HTTP 429 with <code>Retry-After</code> header (seconds)</li>
          </ul>
        </div>

        {/* Endpoint Categories */}
        {filteredCategories.map((cat) => (
          <motion.div
            key={cat.id}
            ref={el => sectionRefs.current[cat.id] = el}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <button
              onClick={() => toggleCategory(cat.id)}
              className="w-full flex items-center gap-3 group"
            >
              <span className="text-xl">{cat.icon}</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{cat.title}</h2>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                {cat.endpoints.length} endpoint{cat.endpoints.length > 1 ? 's' : ''}
              </span>
              <svg
                className={`ml-auto w-5 h-5 text-gray-400 transition-transform ${expandedCategories.has(cat.id) ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 pl-9">{cat.description}</p>

            <AnimatePresence>
              {expandedCategories.has(cat.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 overflow-hidden"
                >
                  {cat.endpoints.map((ep, idx) => (
                    <EndpointCard
                      key={`${cat.id}-${idx}`}
                      endpoint={ep}
                      isPublic={ep.auth === 'none' && ep.method === 'GET' && ep.path.startsWith('/public')}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* No Results */}
        {filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No endpoints match "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-accent text-xs hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#eee] dark:border-[#2a2a2a] pt-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Malaysia News Sentiment Analysis API v1.0 — Built with NanoT5 & HuggingFace Models
          </p>
          <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
            {totalEndpoints} endpoints • JWT Authentication • SSE Real-time • Rate Limited
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ApiDocs;
