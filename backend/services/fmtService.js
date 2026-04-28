const { fetchRSS } = require('./rssService');

/**
 * Dedicated Fetcher for Free Malaysia Today (FMT)
 * (#25) Direct RSS Integration — now uses shared RSS fetcher
 */
const fetchFMTNews = () =>
  fetchRSS({
    url:           'https://www.freemalaysiatoday.com/feed/',
    sourceName:    'Free Malaysia Today (Direct)',
    provider:      'fmt_direct',
    fallbackImage: 'https://www.freemalaysiatoday.com/wp-content/uploads/2018/10/fmt-logo-new.png',
  });

module.exports = { fetchFMTNews };
