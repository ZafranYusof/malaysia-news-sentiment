const axios = require('axios');

/**
 * Fetch Malaysian news from World News API
 * (#24) Integrate WorldNewsAPI
 */
const fetchWorldNews = async (query = '') => {
  const apiKey = process.env.WORLD_NEWS_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    console.warn('⚠️  WORLD_NEWS_API_KEY not configured. Skipping World News fetch.');
    return [];
  }

  try {
    // World News API parameters for Malaysia
    // docs: https://worldnewsapi.com/docs/search-news/
    const response = await axios.get('https://api.worldnewsapi.com/search-news', {
      timeout: 5000,
      params: {
        'api-key': apiKey,
        'source-countries': 'my',   // Malaysia
        'language': 'en,ms',        // English + Malay
        'text': query || 'Malaysia', // Search text
        'number': 20,                // max 20 results
      }
    });

    const articles = response.data.news || [];

    // Map to our internal standard format
    return articles.map(art => ({
      title:       art.title,
      description: art.text ? art.text.slice(0, 500) : '',
      url:         art.url,
      urlToImage:  art.image,
      publishedAt: art.publish_date,
      source:      art.authors && art.authors.length > 0 ? art.authors[0] : 'World News API',
      content:     art.text,
      // Metadata to track source
      provider:    'worldnewsapi',
    }));
  } catch (error) {
    console.error('World News API Error:', error.response?.data?.message || error.message);
    return [];
  }
};

module.exports = { fetchWorldNews };
