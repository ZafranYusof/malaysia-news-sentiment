const { fetchSource } = require('./rssService');

/**
 * Dedicated fetcher for Free Malaysia Today (FMT).
 * Thin wrapper kept for backward compatibility — all config now lives in
 * backend/config/newsSources.js (key: 'fmt').
 */
const fetchFMTNews = () => fetchSource('fmt');

module.exports = { fetchFMTNews };
