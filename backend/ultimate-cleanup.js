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

const extractSourceFromUrl = (url) => {
  if (!url) return 'Unknown';
  const domain = url.toLowerCase();
  if (domain.includes('thestar.com.my')) return 'The Star';
  if (domain.includes('bernama.com')) return 'Bernama';
  if (domain.includes('astroawani.com')) return 'Astro Awani';
  if (domain.includes('freemalaysiatoday.com')) return 'FMT';
  if (domain.includes('malaymail.com')) return 'Malay Mail';
  if (domain.includes('bharian.com.my')) return 'Berita Harian';
  if (domain.includes('hmetro.com.my')) return 'Harian Metro';
  if (domain.includes('sinarharian.com.my')) return 'Sinar Harian';
  if (domain.includes('theedgemarkets.com')) return 'The Edge';
  if (domain.includes('nst.com.my')) return 'NST';
  if (domain.includes('malaysiakini.com')) return 'Malaysiakini';
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return host.split('.')[0].toUpperCase();
  } catch { return 'Unknown'; }
};

const calculateImpactScore = (name) => {
  const n = (name || '').toLowerCase();
  if (['bernama', 'the star', 'astro awani', 'fmt', 'malay mail'].some(s => n.includes(s))) return Math.floor(Math.random()*11) + 85; 
  if (['edge', 'new straits times', 'utusan', 'kosmo'].some(s => n.includes(s))) return Math.floor(Math.random()*15) + 65;
  return Math.floor(Math.random()*20) + 20;
};

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected for Ultimate Cleanup');

    const articles = await Article.find();
    console.log(`🚀 Processing ${articles.length} articles...`);

    let count = 0;
    for (const art of articles) {
      art.title = decodeHTMLEntities(art.title);
      art.description = decodeHTMLEntities(art.description);
      
      if (art.source === 'Unknown' || !art.source || art.source === 'UNKNOWN') {
        const detected = extractSourceFromUrl(art.url);
        art.source = detected;
      }
      
      // Refresh impact score based on updated source
      art.impactScore = calculateImpactScore(art.source);
      
      await art.save();
      count++;
    }

    console.log(`✅ Success! Intelligence synchronized for ${count} articles.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup Failed:', err.message);
    process.exit(1);
  }
};

cleanup();
