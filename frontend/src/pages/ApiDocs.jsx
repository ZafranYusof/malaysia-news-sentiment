import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api/v1';

const endpoints = [
  {
    method: 'GET',
    path: '/public/sentiment',
    description: 'Analyze sentiment of any text. Supports English and Bahasa Malaysia.',
    params: [
      { name: 'text', type: 'string', required: true, description: 'Text to analyze (min 5 characters)' },
    ],
    example: {
      curl: `curl "${API_BASE}/public/sentiment?text=Malaysia%20economy%20growing%20strongly"`,
      response: {
        text: 'Malaysia economy growing strongly',
        sentiment: 'Positive',
        confidence: 0.82,
        language: 'en',
        analysis_source: 'ai',
      },
    },
  },
  {
    method: 'GET',
    path: '/public/articles',
    description: 'Fetch analyzed news articles with optional topic filter.',
    params: [
      { name: 'topic', type: 'string', required: false, description: 'Filter by topic keyword' },
      { name: 'sentiment', type: 'string', required: false, description: 'Filter: Positive, Negative, or Neutral' },
      { name: 'limit', type: 'number', required: false, description: 'Results per page (max 50, default 10)' },
      { name: 'page', type: 'number', required: false, description: 'Page number (default 1)' },
    ],
    example: {
      curl: `curl "${API_BASE}/public/articles?topic=economy&limit=5"`,
      response: {
        articles: [
          { title: 'Malaysia GDP grows 5.2% in Q1', sentiment: 'Positive', confidence: 0.88, source: 'The Star' },
        ],
        total: 42,
        page: 1,
        limit: 5,
        totalPages: 9,
      },
    },
  },
  {
    method: 'GET',
    path: '/public/sources',
    description: 'List all news sources with article counts.',
    params: [],
    example: {
      curl: `curl "${API_BASE}/public/sources"`,
      response: {
        sources: [
          { name: 'FMT', articleCount: 156, lastArticle: '2026-05-06T12:00:00Z' },
          { name: 'The Star', articleCount: 134, lastArticle: '2026-05-06T11:30:00Z' },
        ],
      },
    },
  },
  {
    method: 'GET',
    path: '/public/trending',
    description: 'Get trending topics from the last 48 hours with sentiment breakdown.',
    params: [],
    example: {
      curl: `curl "${API_BASE}/public/trending"`,
      response: {
        trending: [
          { topic: 'economy', articleCount: 15, sentiments: { Positive: 8, Negative: 3, Neutral: 4 } },
        ],
        totalArticles: 100,
        sentimentOverview: { Positive: 40, Negative: 25, Neutral: 35 },
        period: '48h',
      },
    },
  },
];

const MethodBadge = ({ method }) => {
  const colors = {
    GET: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20',
    POST: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
};

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
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  );
};

const TryItButton = ({ endpoint }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tryIt = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = endpoint.path + (endpoint.params.length ? '?' + endpoint.params
        .filter(p => p.required)
        .map(p => `${p.name}=${encodeURIComponent(p.name === 'text' ? 'Malaysia economy is growing' : 'malaysia')}`)
        .join('&') : '');
      
      const { data } = await api.get(url.replace('/public/', '/public/'));
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

const ApiDocs = () => {
  const [expandedIdx, setExpandedIdx] = useState(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>
          </svg>
          Public API Documentation
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Access Malaysia news sentiment data programmatically
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Base URL</h3>
          <code className="text-xs text-accent break-all">{API_BASE}/public</code>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Rate Limit</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">100 requests/hour per IP</p>
          <p className="text-xs text-gray-400 mt-1">1000/hour with API key</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Authentication</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Optional: <code className="text-accent">x-api-key</code> header</p>
          <p className="text-xs text-gray-400 mt-1">Higher rate limits with key</p>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🔑 API Key</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          The public API works without authentication. For higher rate limits, include an API key in your requests:
        </p>
        <CodeBlock code={`curl -H "x-api-key: YOUR_API_KEY" "${API_BASE}/public/trending"`} />
        <p className="text-xs text-gray-400 mt-3">
          Contact the admin to request an API key for production use.
        </p>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Endpoints</h2>
        
        {endpoints.map((ep, idx) => (
          <motion.div
            key={idx}
            className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <MethodBadge method={ep.method} />
              <code className="text-sm font-mono text-gray-900 dark:text-white">{ep.path}</code>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 hidden sm:inline">{ep.description}</span>
              <svg
                className={`ml-auto w-4 h-4 text-gray-400 transition-transform ${expandedIdx === idx ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <AnimatePresence>
              {expandedIdx === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[#eee] dark:border-[#2a2a2a]"
                >
                  <div className="p-5 space-y-5">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{ep.description}</p>

                    {/* Parameters */}
                    {ep.params.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Parameters</h4>
                        <div className="border border-[#eee] dark:border-[#2a2a2a] rounded-xl overflow-hidden">
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
                              {ep.params.map((p, pi) => (
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
                      <CodeBlock code={ep.example.curl} language="bash" />
                    </div>

                    {/* Example Response */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Example Response</h4>
                      <CodeBlock code={ep.example.response} />
                    </div>

                    {/* Try It */}
                    <TryItButton endpoint={ep} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Rate Limit Info */}
      <div className="bg-yellow-50 dark:bg-yellow-500/5 border border-yellow-200 dark:border-yellow-500/20 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">⚠️ Rate Limiting</h3>
        <ul className="text-xs text-yellow-700 dark:text-yellow-400/80 space-y-1">
          <li>• Without API key: 100 requests per hour per IP</li>
          <li>• With API key: 1,000 requests per hour</li>
          <li>• Rate limit headers included in response: <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code></li>
          <li>• Exceeding limit returns HTTP 429 with retry information</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiDocs;
