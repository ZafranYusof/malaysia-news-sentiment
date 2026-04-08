const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Article = require('./models/Article');

dotenv.config({ path: path.join(__dirname, '.env') });

const decodeHTMLEntities = (text) => {
  if (!text) return '';
  return text
    .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d))
    .replace(/&#x([a-fA-F0-9]+);/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
    .replace(/&lsquo;/g, '‘').replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .replace(/&hellip;/g, '…');
};

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB for cleanup');

    const articles = await Article.find();
    console.log(`🧹 Cleaning up ${articles.length} historical articles...`);

    let count = 0;
    for (const art of articles) {
      const newTitle = decodeHTMLEntities(art.title);
      const newDesc = decodeHTMLEntities(art.description);
      
      if (newTitle !== art.title || newDesc !== art.description) {
        art.title = newTitle;
        art.description = newDesc;
        await art.save();
        count++;
      }
    }

    console.log(`✅ Success! Formatted ${count} articles.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup Failed:', err.message);
    process.exit(1);
  }
};

cleanup();
