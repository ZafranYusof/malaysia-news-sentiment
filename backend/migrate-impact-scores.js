const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Article = require('./models/Article');

dotenv.config({ path: path.join(__dirname, '.env') });

const calculateImpactScore = (name) => {
  const n = (name || '').toLowerCase();
  if (['bernama', 'the star', 'astro awani', 'fmt', 'malay mail'].some(s => n.includes(s))) return Math.floor(Math.random()*11) + 85; 
  if (['edge', 'new straits times', 'utusan', 'kosmo'].some(s => n.includes(s))) return Math.floor(Math.random()*15) + 65;
  return Math.floor(Math.random()*20) + 20;
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');

    const articles = await Article.find({ $or: [{ impactScore: { $exists: false } }, { impactScore: 0 }] });
    console.log(`🚀 Migrating ${articles.length} articles...`);

    let count = 0;
    for (const art of articles) {
      art.impactScore = calculateImpactScore(art.source);
      await art.save();
      count++;
    }

    console.log(`✅ Success! Ranked ${count} historical articles.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
    process.exit(1);
  }
};

migrate();
