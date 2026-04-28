const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

/**
 * Generic RSS fetcher — replaces duplicated code in fmtService, astroAwaniService, malaysiakiniService.
 * Each source provides its own config; the core fetch/parse/map logic is shared.
 */

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

/**
 * Fetch and parse an RSS feed into normalised article objects.
 *
 * @param {Object} config
 * @param {string}  config.url          - RSS feed URL
 * @param {string}  config.sourceName   - Human-readable source name
 * @param {string}  config.provider     - Internal provider key
 * @param {string}  config.fallbackImage - Fallback image URL when none found
 * @param {number}  [config.limit=15]   - Max articles to return
 * @param {number}  [config.timeout=5000]
 * @returns {Promise<Array>}
 */
const fetchRSS = async ({ url, sourceName, provider, fallbackImage, limit = 15, timeout = 5000 }) => {
  try {
    const response = await axios.get(url, {
      timeout,
      headers: { 'User-Agent': USER_AGENT },
    });

    const jsonObj = parser.parse(response.data);
    const items = jsonObj.rss?.channel?.item || [];

    return items.slice(0, limit).map((item) => {
      let imageUrl = '';

      // Try media:content or enclosure first
      const media = item['media:content'] || item['enclosure'] || {};
      if (media['@_url']) {
        imageUrl = media['@_url'];
      } else {
        // Try extracting from content or description HTML
        const content = item['content:encoded'] || item.description || '';
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
      }

      return {
        title:       item.title ? String(item.title).replace(/<[^>]*>?/gm, '') : 'No Title',
        description: (item.description || '').replace(/<[^>]*>?/gm, '').slice(0, 300),
        url:         item.link,
        urlToImage:  imageUrl || fallbackImage,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        source:      sourceName,
        content:     item['content:encoded'] || item.description || '',
        provider,
      };
    });
  } catch (error) {
    console.error(`${sourceName} RSS Error:`, error.message);
    return [];
  }
};

module.exports = { fetchRSS };
