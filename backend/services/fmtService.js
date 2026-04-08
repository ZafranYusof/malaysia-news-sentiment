const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

/**
 * Dedicated Fetcher for Free Malaysia Today (FMT)
 * (#25) Direct RSS Integration
 */
const fetchFMTNews = async () => {
  try {
    // FMT Official RSS Feed
    const response = await axios.get('https://www.freemalaysiatoday.com/feed/', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const jsonObj = parser.parse(response.data);
    
    const items = jsonObj.rss.channel.item || [];
    
    // Map RSS items to our internal format
    return items.slice(0, 15).map(item => {
      // Extract image from description or content if possible (FMT uses standard tags)
      let imageUrl = '';
      const content = item['content:encoded'] || item.description || '';
      const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) imageUrl = imgMatch[1];

      return {
        title:       item.title,
        description: (item.description || '').replace(/<[^>]*>?/gm, '').slice(0, 300),
        url:         item.link,
        urlToImage:  imageUrl || 'https://www.freemalaysiatoday.com/wp-content/uploads/2018/10/fmt-logo-new.png',
        publishedAt: item.pubDate,
        source:      'Free Malaysia Today (Direct)',
        content:     item['content:encoded'] || item.description,
        provider:    'fmt_direct'
      };
    });
  } catch (error) {
    console.error('FMT RSS Error:', error.message);
    return [];
  }
};

module.exports = { fetchFMTNews };
