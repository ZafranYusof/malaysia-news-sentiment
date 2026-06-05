const { fetchSource } = require('./rssService');

/**
 * Dedicated fetcher for Malaysiakini.
 * Thin wrapper kept for backward compatibility — all config now lives in
 * backend/config/newsSources.js (key: 'malaysiakini').
 */
const fetchMalaysiakiniNews = () => fetchSource('malaysiakini');

module.exports = { fetchMalaysiakiniNews };
