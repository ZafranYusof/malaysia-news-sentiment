const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Article = require('./models/Article');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const testAdminAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');

    // 1. Check if Impact Scores are being assigned
    const impactCheck = await Article.find({ impactScore: { $gt: 0 } }).limit(5);
    console.log('\n--- 🎯 IMPACT SCORE CHECK ---');
    if (impactCheck.length > 0) {
      impactCheck.forEach(a => console.log(`[${a.impactScore}] - ${a.source}: ${a.title.slice(0, 50)}...`));
    } else {
      console.log('⚠️ No articles with impact scores found yet (Need a new analysis run).');
    }

    // 2. Test the Share of Voice (SOV) calculation logic
    const totalArts = await Article.countDocuments();
    const stats = await Article.aggregate([
      { $group: { _id: '$topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);
    
    console.log('\n--- 📉 SHARE OF VOICE (SOV) PREVIEW ---');
    stats.forEach(t => {
      const sov = Math.round((t.count / (totalArts || 1)) * 100);
      console.log(`${t._id}: ${sov}% Share (${t.count} articles)`);
    });

    console.log('\n✅ Data Integrity Test Complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failed:', err.message);
    process.exit(1);
  }
};

testAdminAPI();
