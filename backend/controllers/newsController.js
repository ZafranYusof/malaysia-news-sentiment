const mongoose   = require('mongoose');
const NodeCache  = require('node-cache');
const pLimit     = require('p-limit'); 

const { fetchFMTNews }      = require('../services/fmtService');
const { fetchAstroAwaniNews } = require('../services/astroAwaniService');
const { fetchMalaysiakiniNews } = require('../services/malaysiakiniService');
const { analyzeSentiment, analyseArticle, getClient } = require('../services/openaiService');
const Article = require('../models/Article');

// Helper: check if string is valid MongoDB ObjectId
const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id) && id !== 'guest';

// ── In-memory cache — 15 min TTL ──────────────────────
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });
const sentimentCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 }); // 1hr cache for sentiment results
const sentimentLimit = pLimit(5);

const isDbConnected = () => mongoose.connection.readyState === 1;

const calculateImpactScore = (name) => {
  const n = (name || '').toLowerCase();
  // Deterministic hash-based score within tier range (no Math.random)
  let hash = 0;
  for (let i = 0; i < n.length; i++) hash = ((hash << 5) - hash + n.charCodeAt(i)) | 0;
  const positiveHash = Math.abs(hash);

  if (['bernama', 'the star', 'astro awani', 'fmt', 'malay mail', 'malaysiakini'].some(s => n.includes(s)))
    return 85 + (positiveHash % 11);   // 85-95
  if (['edge', 'new straits times', 'utusan', 'kosmo'].some(s => n.includes(s)))
    return 65 + (positiveHash % 15);   // 65-79
  return 20 + (positiveHash % 20);     // 20-39
};

// ── Decoders & Sanitizers ──────────────────
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

const sanitize = (str, max = 150) =>
  decodeHTMLEntities(String(str || '').replace(/[<>"'\\]/g, '').trim()).slice(0, max);

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const MALAYSIA_TERMS = [
  'malaysia', 'malaysian', 'kuala lumpur', 'putrajaya', 'selangor', 'johor', 'penang',
  'pulau pinang', 'sabah', 'sarawak', 'kelantan', 'terengganu', 'kedah', 'perlis',
  'pahang', 'perak', 'melaka', 'negeri sembilan', 'labuan', 'umno', 'bn', 'pakatan',
  'perikatan', 'anwar', 'ringgit', 'bursa malaysia',
];

const MALAYSIA_SOURCE_HINTS = [
  '.com.my', 'bernama.com', 'thestar.com.my', 'astroawani.com', 'freemalaysiatoday.com',
  'malaymail.com', 'bharian.com.my', 'hmetro.com.my', 'sinarharian.com.my',
  'theedgemarkets.com', 'nst.com.my', 'newstraittimes.com', 'malaysiakini.com',
];

const isGenericMalaysiaQuery = (query, latest = false) => {
  if (latest) return true;
  const normalized = String(query || '').trim().toLowerCase();
  return !normalized || normalized === 'malaysia';
};

const isMalaysiaRelevantArticle = (article = {}) => {
  const haystack = `${article.title || ''} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  const sourceName = String(article.source?.name || article.source || '').toLowerCase();
  const url = String(article.url || '').toLowerCase();
  return MALAYSIA_TERMS.some(term => haystack.includes(term))
    || MALAYSIA_SOURCE_HINTS.some(hint => {
      const hintBase = hint.replace('.com.my', '').replace('.com', '');
      return url.includes(hint) || sourceName.includes(hintBase);
    });
};

const CRISIS_KEYWORDS = [
  'flood', 'banjir', 'crisis', 'krisis', 'corruption', 'rasuah', 'scandal',
  'arrested', 'ditangkap', 'emergency', 'darurat', 'attack', 'serangan',
  'death', 'kematian', 'mati', 'collapse', 'runtuh', 'explosion', 'letupan',
  'drought', 'bankrupt', 'muflis', 'riot', 'rusuhan', 'murder', 'bunuh',
  'accident', 'kemalangan', 'resign', 'letak jawatan', 'harga naik',
  'price hike', 'inflation', 'inflasi', 'fuel price', 'harga minyak',
  'layoff', 'retrenchment', 'buang kerja', 'protest', 'protes', 'fire', 'kebakaran',
  'hack', 'breach', 'robbery', 'rompak', 'kidnap', 'culik', 'rape', 'rogol',
];

const isAlertArticle = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
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
  if (domain.includes('newstraittimes.com') || domain.includes('nst.com.my')) return 'NST';
  if (domain.includes('kinitv.com')) return 'KiniTV';
  if (domain.includes('malaysiakini.com')) return 'Malaysiakini';
  
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return host.split('.')[0].toUpperCase();
  } catch { return 'Source'; }
};

const getAndAnalyzeNews = async (req, res) => {
  try {
    const q        = sanitize(req.query.q || 'Malaysia');
    const latest   = req.query.latest === 'true';
    const refresh  = req.query.refresh === 'true'; // #Fix: Bypass cache for debugging/new source verification
    const pageSize = Math.min(parseInt(req.query.pageSize) || 12, 60);

    const cacheKey = latest ? `news_raw_latest_${pageSize}` : `news_raw_${q}_${pageSize}`;
    let rawArticles = refresh ? null : cache.get(cacheKey);

    if (!rawArticles) {
      if (refresh) console.log(`🔄 Cache bypass triggered for: ${cacheKey}`);
      const [fmtDirectArts, astroAwaniArts, mkiniArts] = await Promise.all([
        fetchFMTNews().catch(() => []), 
        fetchAstroAwaniNews().catch(() => []),
        fetchMalaysiakiniNews().catch(() => []),
      ]);

      const queryWords = q.toLowerCase().split(/\s+/).filter(w => {
        const forbidden = ['malaysia', 'breaking', 'news', 'latest', 'today', 'headline'];
        return w.length > 3 && !forbidden.includes(w);
      });
      
      const filterByQuery = (arts) => {
        if (queryWords.length === 0) return arts;
        return arts.filter(a => {
          const text = `${a.title} ${a.description || ''}`.toLowerCase();
          return queryWords.some(w => text.includes(w));
        });
      };

      const filteredAstro = filterByQuery(astroAwaniArts);
      const filteredFMT   = filterByQuery(fmtDirectArts);
      const filteredMKini = filterByQuery(mkiniArts);
      const mergedRaw = [...filteredAstro, ...filteredFMT, ...filteredMKini]
        .filter(art => art && art.url)
        .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
      
      const seenUrls = new Set();
      rawArticles = mergedRaw.filter(art => {
        if (!art.url || seenUrls.has(art.url)) return false;
        seenUrls.add(art.url);
        return true;
      });

      if (isGenericMalaysiaQuery(q, latest)) {
        const malaysiaScoped = rawArticles.filter(isMalaysiaRelevantArticle);
        if (malaysiaScoped.length > 0) rawArticles = malaysiaScoped;
      }
      rawArticles = rawArticles.slice(0, pageSize);

      if (rawArticles.length > 0) cache.set(cacheKey, rawArticles);
    }

    if (rawArticles.length === 0) {
      return res.json({ articles: [], message: `No specific articles found for "${q}".` });
    }

    const urls = rawArticles.map(a => a.url);
    const existingArticles = isDbConnected() ? await Article.find({ url: { $in: urls } }).lean() : [];
    const existingMap = new Map(existingArticles.map(a => [a.url, a]));

    // Emit progress via Socket.io for real-time loading feedback
    const io = req.app.get('io');
    let analyzed = 0;
    const totalToAnalyze = rawArticles.length;

    const analyzedArticles = await Promise.all(
      rawArticles.map((article) =>
        sentimentLimit(async () => {
          try {
            if (isDbConnected()) {
              const existing = existingMap.get(article.url);
              if (existing) {
                let correctedSource = existing.source;
                if (['ollama', 'ai', 'local'].includes(String(correctedSource).toLowerCase())) {
                  correctedSource = extractSourceFromUrl(existing.url);
                }
                analyzed++;
                if (io) io.emit('analysis_progress', { done: analyzed, total: totalToAnalyze });
                return await Article.findOneAndUpdate(
                  { _id: existing._id },
                  { $set: { userId: req.userId || existing.userId || null, topic: q || existing.topic, source: correctedSource } },
                  { new: true, lean: true } 
                );
              }
            }

            // Check sentiment cache first (avoid re-analyzing same article)
            const sentCacheKey = `sent_${article.url}`;
            let analysis = sentimentCache.get(sentCacheKey);
            if (!analysis) {
              analysis = await analyseArticle(article.title, article.description);
              sentimentCache.set(sentCacheKey, analysis);
            }
            const alert = isAlertArticle(article.title, article.description);
            analyzed++;
            if (io) io.emit('analysis_progress', { done: analyzed, total: totalToAnalyze });
            let sourceName = article.source?.name || 'Unknown';
            if (sourceName === 'Unknown' || !sourceName) sourceName = extractSourceFromUrl(article.url);

            const impact = calculateImpactScore(sourceName);

            const articleData = {
              title:       decodeHTMLEntities(article.title),
              description: decodeHTMLEntities(article.description || ''),
              content:     decodeHTMLEntities(article.content     || ''),
              source:      sourceName,
              url:         article.url,
              urlToImage:  article.urlToImage  || '',
              publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
              topic:       q,
              ...analysis,
              isAlert:     alert,
              userId:      req.userId || null,
              impactScore: impact,
            };

            if (isDbConnected()) {
              return await Article.findOneAndUpdate(
                { url: article.url },
                { $set: articleData },
                { upsert: true, new: true, lean: true, setDefaultsOnInsert: true }
              );
            }
            return articleData;
          } catch (err) {
            console.error(`Skipping article: ${err.message}`);
            return null;
          }
        })
      )
    );

    // Broadcast new analysis metrics to Admin
    if (io) {
      io.emit('system_stats_updated', { type: 'analysis_batch', count: analyzedArticles.length });
      io.emit('analysis_progress', { done: totalToAnalyze, total: totalToAnalyze, complete: true });
    }

    const results = analyzedArticles.filter(Boolean);
    const sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
    results.forEach(a => { 
      const key = a.sentiment || 'Neutral';
      if (sentimentCounts[key] !== undefined) sentimentCounts[key]++; 
    });

    const payload = { total: results.length, sentimentDistribution: sentimentCounts, articles: results };
    if (req.userId) {
      const User = require('../models/User');
      const updatedUser = await User.findByIdAndUpdate(
        req.userId, 
        { $inc: { analysisCount: results.length } },
        { new: true }
      ).catch(() => null);

      // Broadcast to Admins
      const io = req.app.get('io');
      if (io && updatedUser) {
        io.emit('user_activity', { 
          userId: updatedUser._id, 
          userName: updatedUser.name,
          analysisCount: updatedUser.analysisCount,
          timestamp: new Date()
        });
      }
    }
    res.json(payload);
  } catch (error) {
    console.error('Error in getAndAnalyzeNews:', error.message);
    res.status(500).json({ error: `Backend Error: ${error.message}` });
  }
};

const getTopSources = async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  try {
    const topic  = sanitize(req.query.topic || '');
    const { timeframe } = req.query;
    const userId = req.userId;
    const match = {};
    if (topic) match.topic = { $regex: escapeRegex(topic), $options: 'i' };
    if (timeframe) {
      const now = new Date();
      if (timeframe === '24h') match.createdAt = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      else if (timeframe === '7d') match.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      else if (timeframe === '30d') match.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }
    if (isValidObjectId(userId)) {
      match.userId = new mongoose.Types.ObjectId(userId);
    } else {
      match.$or = [{ userId: null }, { userId: { $exists: false } }];
    }
    const results = await Article.aggregate([
      { $match: match },
      { $group: {
          _id:      '$source',
          total:    { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } },
          neutral:  { $sum: { $cond: [{ $eq: ['$sentiment', 'Neutral'] },  1, 0] } },
      }},
      { $sort:    { total: -1 } },
      { $limit:   10 },
      { $project: { source: '$_id', total: 1, positive: 1, negative: 1, neutral: 1, _id: 0 } },
    ]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateDigest = async (req, res) => {
  try {
    const { articles, topic } = req.body;
    if (!articles || articles.length === 0) return res.json({ digest: null });
    const { generateDigest: fetchDigest } = require('../services/openaiService');
    const result = await fetchDigest(articles, topic);
    res.json(result);
  } catch (error) {
    res.json({ digest: null, error: error.message });
  }
};

const getKeywords = async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  try {
    const { timeframe } = req.query;
    const userId = req.userId;
    const match  = {};
    if (isValidObjectId(userId)) {
      match.$or = [{ userId: new mongoose.Types.ObjectId(userId) }, { userId: null }, { userId: { $exists: false } }];
    }
    if (timeframe) {
      const now = new Date();
      if (timeframe === '24h') match.createdAt = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      else if (timeframe === '7d') match.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      else if (timeframe === '30d') match.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }
    const articles = await Article.find(match).select('title description').limit(200).lean();
    const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','was','are','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','this','that','these','those','it','its','he','she','they','we','you','i','his','her','their','our','your','my','as','if','so','than','then','when','where','how','what','which','who','not','no','more','also','after','before','about','up','out','over','new','says','said','akan','yang','di','ke','dari','dan','pada','untuk','dengan','dalam','tidak','telah','bagi','ini','itu','ada']);
    const freq = {};
    articles.forEach(({ title, description }) => {
      const words = `${title} ${description}`.toLowerCase().replace(/[^a-zA-Z\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP.has(w));
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    });
    const keywords = Object.entries(freq).filter(([, v]) => v > 1).sort((a, b) => b[1] - a[1]).slice(0, 60).map(([word, count]) => ({ word, count }));
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getForecast = async (req, res) => {
  try {
    const { articles, topic } = req.body;
    if (!articles || articles.length === 0) return res.json({ forecast: null });
    const { generateForecast } = require('../services/openaiService');
    const forecast = await generateForecast(articles, sanitize(topic, 100));
    res.json(forecast);
  } catch (error) {
    res.json({ outlook: 'Forecast service unavailable.', risks: [], projectionScore: 50 });
  }
};

const getRegionalSentiment = async (req, res) => {
  try {
    const topic  = sanitize(req.query.topic || '');
    const { timeframe } = req.query;
    const userId = req.userId;
    if (!userId) return res.json([]);
    const match = { stateLocation: { $ne: 'General' } };
    if (topic) match.topic = { $regex: escapeRegex(topic), $options: 'i' };
    if (timeframe) {
      const now = new Date();
      if (timeframe === '24h') match.createdAt = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      else if (timeframe === '7d') match.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      else if (timeframe === '30d') match.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }
    if (isValidObjectId(userId)) {
      match.userId = new mongoose.Types.ObjectId(userId);
    } else {
      match.$or = [{ userId: null }, { userId: { $exists: false } }];
    }
    const regionalData = await Article.aggregate([
      { $match: match },
      { $group: { _id: '$stateLocation', count: { $sum: 1 }, positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, 0] } }, negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } }, neutral:  { $sum: { $cond: [{ $eq: ['$sentiment', 'Neutral'] }, 1, 0] } } } },
      { $project: { state: '$_id', count: 1, avgScore: { $divide: [{ $add: ['$positive', { $multiply: ['$neutral', 0.5] }] }, '$count'] } } }
    ]);
    res.json(regionalData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getArticleAnalysis = async (req, res) => {
  try {
    const { article } = req.body;
    if (!article || !article.title) return res.status(400).json({ error: 'Article required.' });
    const { analyzeDetailedArticle } = require('../services/openaiService');
    const analysis = await analyzeDetailedArticle(article);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAndAnalyzeNews,
  getTopSources,
  generateDigest,
  getKeywords,
  getForecast,
  getRegionalSentiment,
  getArticleAnalysis,
};
