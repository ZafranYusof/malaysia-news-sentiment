const axios = require('axios');

/**
 * Fetches news from NewsAPI (Standard) or WorldNewsAPI
 * Supports 'topHeadlines' mode for latest releases
 */
const fetchNews = async (query, pageSize = 10, options = {}) => {
  const { topHeadlines = false } = options;

  // ── Option A: World News API (#3) ──────────────────────────
  if (!topHeadlines && process.env.WORLD_NEWS_API_KEY && !process.env.WORLD_NEWS_API_KEY.includes('your_')) {
    try {
      const response = await axios.get('https://api.worldnewsapi.com/search-news', {
        params: {
          text:        query,
          'number':    pageSize,
          'api-key':   process.env.WORLD_NEWS_API_KEY,
          earliest_publish_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });
      
      return (response.data.news || []).map(n => ({
        title:       n.title,
        description: n.summary || n.text?.slice(0, 200),
        content:     n.text,
        url:         n.url,
        urlToImage:  n.image,
        source:      { name: n.source_country || 'WorldNews' },
        publishedAt: n.publish_date
      }));
    } catch (err) {
      console.warn('WorldNewsAPI failed, trying fallback...');
    }
  }

  // ── Option B: NewsAPI (Standard) ───────────────────────────
  const endpoint = topHeadlines ? 'top-headlines' : 'everything';
  const url      = `https://newsapi.org/v2/${endpoint}`;
  
  const params = {
    apiKey:   process.env.NEWS_API_KEY,
    pageSize,
  };

  if (topHeadlines) {
    params.country = 'my'; // Focused on Malaysia latest news
    if (query && query !== 'Malaysia') params.q = query;
  } else {
    params.q        = query || 'Malaysia';
    params.language = 'en';
    params.sortBy   = 'publishedAt';
  }

  const newsApiResponse = await axios.get(url, { params, timeout: 10000 });

  if (newsApiResponse.data.status !== 'ok') {
    throw new Error(`NewsAPI error: ${newsApiResponse.data.message}`);
  }

  let articles = newsApiResponse.data.articles.filter(a => a.title && a.title !== '[Removed]');

  // -- Fail-Safe (#Breaking News Fallback) --
  if (topHeadlines && articles.length === 0) {
    console.log('🔄 Top-Headlines empty for [my], falling back to high-velocity search...');
    const fallbackResponse = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q:        'Malaysia',
        language: 'en',
        sortBy:   'publishedAt',
        pageSize,
        apiKey:   process.env.NEWS_API_KEY,
      },
      timeout: 5000
    });
    articles = fallbackResponse.data.articles.filter(a => a.title && a.title !== '[Removed]');
  }

  return articles;
};

module.exports = { fetchNews };
