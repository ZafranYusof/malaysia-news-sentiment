const axios = require('axios');

async function verify() {
  const urls = [
    'https://rss.astroawani.com/rss/latest/public',
    'https://www.astroawani.com/latest/public/rss',
    'https://www.astroawani.com/rss/latest/public',
    'https://astroawani.com/feed'
  ];

  for (const url of urls) {
    console.log(`📡 PROBING: ${url}...`);
    try {
      const res = await axios.get(url, { 
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      console.log(`✅ SUCCESS [${res.status}]: Found ${res.data.length} chars of data.`);
      if (res.data.includes('<rss')) {
         console.log('💎 THIS IS A VALID RSS FEED!');
         return url;
      }
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }
}

verify();
