const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

/**
 * Dedicated Fetcher for Astro Awani
 * (#Breaking) Direct RSS Integration
 */
const fetchAstroAwaniNews = async () => {
  try {
    // Astro Awani Official RSS Feed (Updated to working www subdomain)
    const response = await axios.get('https://www.astroawani.com/rss/latest/public', {
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
    
    // Astro Awani structure: rss.channel.item
    const items = jsonObj.rss?.channel?.item || [];
    
    return items.slice(0, 15).map(item => {
      // Image extraction (Astro Awani usually uses <media:content> or <img> in description)
      let imageUrl = '';
      const media = item['media:content'] || item['enclosure'] || {};
      if (media['@_url']) {
        imageUrl = media['@_url'];
      } else {
        const descMatch = (item.description || '').match(/<img[^>]+src="([^">]+)"/);
        if (descMatch) imageUrl = descMatch[1];
      }

      return {
        title:       item.title ? String(item.title).replace(/<[^>]*>?/gm, '') : 'No Title',
        description: (item.description || '').replace(/<[^>]*>?/gm, '').slice(0, 300),
        url:         item.link,
        urlToImage:  imageUrl || 'https://www.astroawani.com/static/icons8-astro-awani-100.png',
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        source:      'Astro Awani',
        content:     item.description, // RSS doesn't usually have full content
        provider:    'astro_awani_direct'
      };
    });
  } catch (error) {
    console.error('Astro Awani RSS Error:', error.message);
    return [];
  }
};

module.exports = { fetchAstroAwaniNews };
