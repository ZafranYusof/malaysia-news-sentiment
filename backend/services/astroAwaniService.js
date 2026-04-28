const { fetchRSS } = require('./rssService');

/**
 * Dedicated Fetcher for Astro Awani
 * (#Breaking) Direct RSS Integration — now uses shared RSS fetcher
 */
const fetchAstroAwaniNews = () =>
  fetchRSS({
    url:           'https://www.astroawani.com/rss/latest/public',
    sourceName:    'Astro Awani',
    provider:      'astro_awani_direct',
    fallbackImage: 'https://www.astroawani.com/static/icons8-astro-awani-100.png',
  });

module.exports = { fetchAstroAwaniNews };
