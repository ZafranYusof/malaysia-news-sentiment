const { fetchSource } = require('./rssService');

/**
 * Dedicated fetcher for Astro Awani.
 * Thin wrapper kept for backward compatibility — all config now lives in
 * backend/config/newsSources.js (key: 'astro_awani'). To change Astro Awani's
 * URL/format, edit the registry, not this file.
 */
const fetchAstroAwaniNews = () => fetchSource('astro_awani');

module.exports = { fetchAstroAwaniNews };
