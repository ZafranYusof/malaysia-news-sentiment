const { fetchRSS } = require('./rssService');

/**
 * Dedicated Fetcher for Malaysiakini
 * Now uses shared RSS fetcher
 */
const fetchMalaysiakiniNews = () =>
  fetchRSS({
    url:           'https://www.malaysiakini.com/rss/en/news.rss',
    sourceName:    'Malaysiakini',
    provider:      'malaysiakini_direct',
    fallbackImage: 'https://www.malaysiakini.com/favicon-96x96.png',
  });

module.exports = { fetchMalaysiakiniNews };
