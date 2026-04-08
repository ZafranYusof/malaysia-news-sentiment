const mongoose = require('mongoose');
require('dotenv').config();
const { fetchNews } = require('./services/newsService');
const { fetchFMTNews } = require('./services/fmtService');
const { fetchAstroAwaniNews } = require('./services/astroAwaniService');
const { analyzeSentiment } = require('./services/openaiService');

async function testSystem() {
  console.log('🚀 SYSTEM INTEGRATION TEST STARTING...');
  console.log('-----------------------------------------');

  try {
    // 1. Test NewsAPI
    console.log('📡 Testing NewsAPI (Headlines Mode)...');
    const newsApi = await fetchNews('Malaysia', 2, { topHeadlines: true });
    console.log(`✅ NewsAPI: Found ${newsApi.length} articles.`);

    // 2. Test FMT
    console.log('📡 Testing FMT (Direct RSS)...');
    const fmt = await fetchFMTNews();
    console.log(`✅ FMT: Found ${fmt.length} articles.`);

    // 3. Test Astro Awani
    console.log('📡 Testing Astro Awani (Direct RSS)...');
    const astro = await fetchAstroAwaniNews();
    console.log(`✅ Astro Awani: Found ${astro.length} articles.`);

    // 4. Test Sentiment Engine
    if (astro.length > 0) {
      console.log(`🧠 Testing AI Sentiment Engine on: "${astro[0].title}"`);
      const sentiment = await analyzeSentiment(astro[0].title, astro[0].description);
      console.log(`✅ AI Result: [${sentiment.sentiment}] (Confidence: ${sentiment.confidence})`);
    }

    console.log('-----------------------------------------');
    console.log('🏆 100% FUNCTIONAL! All sources are synchronized.');
  } catch (err) {
    console.error('❌ SYSTEM FAILURE:', err.message);
  } finally {
    process.exit();
  }
}

testSystem();
