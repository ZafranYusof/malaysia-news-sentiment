const mongoose   = require('mongoose');
const NodeCache  = require('node-cache');
const { fetchNews }         = require('../services/newsService');
const { fetchWorldNews }    = require('../services/worldNewsService');
const { fetchFMTNews }      = require('../services/fmtService');
const { fetchAstroAwaniNews } = require('../services/astroAwaniService');
const { analyzeSentiment, getClient } = require('../services/openaiService');
const Article = require('../models/Article');

// ── In-memory cache (#10) — 15 min TTL ──────────────────────
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

const isDbConnected = () => mongoose.connection.readyState === 1;

// ── Decoders & Sanitizers (#Text Cleanup) ──────────────────
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

// ── Crisis keywords (#already implemented) ───────────────────
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

// ── Source & Impact Detective (#Media Enrichment) ──────────
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
    const pageSize = Math.min(parseInt(req.query.pageSize) || 12, 60);

    const cacheKey = latest ? `news_raw_latest_${pageSize}` : `news_raw_${q}_${pageSize}`;
    let rawArticles = cache.get(cacheKey);

    if (!rawArticles) {
      // ── Fetch from multi-source stack (#24, #25) ──────────────────
      const [newsApiArts, worldNewsApiArts, fmtDirectArts, astroAwaniArts] = await Promise.all([
        fetchNews(q, pageSize, { topHeadlines: latest }),
        fetchWorldNews(q).catch(() => []),
        fetchFMTNews().catch(() => []), 
        fetchAstroAwaniNews().catch(() => []),
      ]);

      // ── Intelligent Filtering for Specific Search (#Fix: Topic Clarity) ──
      // If we are searching for a specific topic (not just generic Malaysia/Latest),
      // we MUST filter RSS articles to ensure they contain the keyword.
      // Identify if we are searching for a specific topic (not just generic labels)
      const queryWords = q.toLowerCase().split(/\s+/).filter(w => {
        const forbidden = ['malaysia', 'breaking', 'news', 'latest', 'today', 'headline'];
        return w.length > 3 && !forbidden.includes(w);
      });
      
      const filterByQuery = (arts) => {
        if (queryWords.length === 0) return arts; // Broad search = no filter
        return arts.filter(a => {
          const text = `${a.title} ${a.description || ''}`.toLowerCase();
          return queryWords.some(w => text.includes(w));
        });
      };

      const filteredAstro = filterByQuery(astroAwaniArts);
      const filteredFMT   = filterByQuery(fmtDirectArts);
      const filteredWorld = filterByQuery(worldNewsApiArts);

      // ── Merge & Sort by Date Descending (#Fix: Chronological Accuracy) ──
      // This ensures April 5 news (from RSS feeds) always appears above older news.
      const mergedRaw = [...newsApiArts, ...filteredWorld, ...filteredAstro, ...filteredFMT]
        .filter(art => art && art.url)
        .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
      
      const seenUrls = new Set();
      rawArticles = mergedRaw.filter(art => {
        if (!art.url || seenUrls.has(art.url)) return false;
        seenUrls.add(art.url);
        return true;
      }).slice(0, pageSize);

      // Final fallback if everything got filtered out
      if (rawArticles.length === 0 && newsApiArts.length > 0) {
        rawArticles = newsApiArts.slice(0, pageSize);
      }

      if (rawArticles.length > 0) {
        cache.set(cacheKey, rawArticles);
      }
    } else {
      console.log(`📦 Cache hit (Raw): ${cacheKey}`);
    }

    if (rawArticles.length === 0) {
      return res.json({ articles: [], message: `No specific articles found for "${q}".` });
    }

    const analyzedArticles = await Promise.all(
      rawArticles.map(async (article) => {
        try {
          if (isDbConnected()) {
            const existing = await Article.findOne({ url: article.url });
            
            if (existing) {
              // ── Update Metadata (#Fix: Bump to top of history & associate with user) ──
              // We reuse existing sentiment analysis to save API costs
              const updated = await Article.findOneAndUpdate(
                { _id: existing._id },
                { 
                  $set: { 
                    userId: req.userId || existing.userId || null, 
                    topic:  q || existing.topic 
                  } 
                },
                { new: true } 
              );
              return updated.toObject();
            }
          }

          // ── New Analysis ─────────────────────────────────────
          const sentimentResult = await analyzeSentiment(article.title, article.description);
          const alert = isAlertArticle(article.title, article.description);

          let sourceName = article.source?.name || 'Unknown';
          if (sourceName === 'Unknown' || !sourceName) {
            sourceName = extractSourceFromUrl(article.url);
          }

          const impact = calculateImpactScore(
            sourceName,
            sentimentResult.sentiment,
            alert,
            article.title,
            article.description,
            article.content
          );

          const articleData = {
            title:       decodeHTMLEntities(article.title),
            description: decodeHTMLEntities(article.description || ''),
            content:     decodeHTMLEntities(article.content     || ''),
            source:      sourceName,
            url:         article.url,
            urlToImage:  article.urlToImage  || '',
            publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
            topic:       q,
            sentiment:   sentimentResult.sentiment,
            aiSentiment: sentimentResult.sentiment,
            confidence:  sentimentResult.confidence,
            reason:      sentimentResult.reason,
            isAlert:     alert,
            userId:      req.userId || null,
            impactScore: impact,
          };

          if (isDbConnected()) {
            const saved = await Article.findOneAndUpdate(
              { url: article.url },
              { $set: articleData },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            return saved.toObject();
          } else {
            console.error('❌ Database disconnected. News analyzed but not saved to history.');
          }
          return articleData;
        } catch (err) {
          console.error(`Skipping article: ${err.message}`);
          return null;
        }
      })
    );

    const results = analyzedArticles.filter(Boolean);
    
    // Nuclear option to strip all Mongoose proxying/internals
    const plainResults = JSON.parse(JSON.stringify(results));
    
    const sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
    plainResults.forEach(a => { if (sentimentCounts[a.sentiment] !== undefined) sentimentCounts[a.sentiment]++; });

    const payload = { total: plainResults.length, sentimentDistribution: sentimentCounts, articles: plainResults };
    
    // ── Track Analysis Volume (#Fix: Ensure KPI always increases) ──
    if (req.userId) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.userId, { $inc: { analysisCount: plainResults.length } }).catch(() => null);
    }

    res.json(payload);
  } catch (error) {
    console.error('Error in getAndAnalyzeNews:', error.message);
    res.status(500).json({ error: `Backend Error: ${error.message}` });
  }
};

// ── GET /api/news/sources?topic=... ──────────────────────────
const getTopSources = async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  try {
    const topic  = sanitize(req.query.topic || '');
    const { timeframe } = req.query;
    const userId = req.userId;

    const match = {};
    if (topic) match.topic = { $regex: topic, $options: 'i' };

    // Timeframe filter
    if (timeframe) {
      const now = new Date();
      if (timeframe === '24h')      match.createdAt = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      else if (timeframe === '7d')  match.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      else if (timeframe === '30d') match.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }

    // Show user's own + legacy articles
    if (userId) {
      match.$or = [
        { userId: new mongoose.Types.ObjectId(userId) },
        { userId: null }, { userId: { $exists: false } },
      ];
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

// ── POST /api/news/digest ─────────────────────────────────────
const generateDigest = async (req, res) => {
  try {
    const { articles, topic } = req.body;
    if (!articles || articles.length === 0) return res.json({ digest: null });
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_')) {
      return res.json({ digest: null, warning: 'OpenAI key not configured.' });
    }

    const sanitizedTopic = sanitize(topic, 100);
    const articleSummary = articles
      .slice(0, 15)
      .map((a, i) => `${i + 1}. [${a.sentiment}] ${sanitize(a.title, 120)}`)
      .join('\n');

    const prompt = `You are an expert Malaysian news analyst fluent in English and Bahasa Malaysia.
Based on the following news articles about "${sanitizedTopic}", write a concise 2-3 sentence summary of the overall sentiment and key themes.
Mention whether coverage is mostly positive, negative, or neutral and why. Be specific about the exact topics dominating the news.

Articles:
${articleSummary}

Write ONLY the summary paragraph, no titles or labels.`;

    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 220,
    });

    res.json({ digest: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Digest error:', error.message);
    res.json({ digest: null, error: error.message });
  }
};

// ── GET /api/news/keywords ────────────────────────────────────
// Returns word frequency from recent article titles/descriptions
const getKeywords = async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  try {
    const { timeframe } = req.query;
    const userId = req.userId;
    const match  = {};

    if (userId) {
      match.$or = [
        { userId: new mongoose.Types.ObjectId(userId) },
        { userId: null }, { userId: { $exists: false } },
      ];
    }

    if (timeframe) {
      const now = new Date();
      if (timeframe === '24h')      match.createdAt = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      else if (timeframe === '7d')  match.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      else if (timeframe === '30d') match.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }

    const articles = await Article.find(match).select('title description').limit(200).lean();

    // Stopwords
    const STOP = new Set([
      'the','a','an','and','or','but','in','on','at','to','for','of','with',
      'by','from','is','was','are','were','be','been','being','have','has','had',
      'do','does','did','will','would','could','should','may','might','this',
      'that','these','those','it','its','he','she','they','we','you','i','his',
      'her','their','our','your','my','as','if','so','than','then','when','where',
      'how','what','which','who','not','no','more','also','after','before','about',
      'up','out','over','new','says','said','akan','yang','di','ke','dari','dan',
      'pada','untuk','dengan','dalam','tidak','telah','bagi','ini','itu','ada',
    ]);

    const freq = {};
    articles.forEach(({ title, description }) => {
      const words = `${title} ${description}`
        .toLowerCase()
        .replace(/[^a-zA-Z\u00C0-\u024F\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOP.has(w));
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    });

    const keywords = Object.entries(freq)
      .filter(([, v]) => v > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 60)
      .map(([word, count]) => ({ word, count }));

    res.json(JSON.parse(JSON.stringify(keywords)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── POST /api/news/forecast ──────────────────────────────────
const getForecast = async (req, res) => {
  try {
    const { articles, topic } = req.body;
    if (!articles || articles.length === 0) return res.json({ forecast: null });
    
    // Import generateForecast here to avoid circular dependencies if needed, 
    // though openaiService is already available if we require it.
    const { generateForecast } = require('../services/openaiService');
    
    const forecast = await generateForecast(articles, sanitize(topic, 100));
    res.json(forecast);
  } catch (error) {
    console.error('Forecast controller error:', error.message);
    res.json({ outlook: 'Forecast service unavailable.', risks: [], projectionScore: 50 });
  }
};

/**
 * GET /api/news/regional?topic=...
 * Aggregates sentiment by state for the map heatmap (#1)
 */
const getRegionalSentiment = async (req, res) => {
  try {
    const topic  = sanitize(req.query.topic || '');
    const { timeframe } = req.query;
    const userId = req.userId;
    if (!userId) return res.json([]);

    const match = { stateLocation: { $ne: 'General' } };
    if (topic) match.topic = { $regex: topic, $options: 'i' };

    // Timeframe filter
    if (timeframe) {
      const now = new Date();
      if (timeframe === '24h')      match.createdAt = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      else if (timeframe === '7d')  match.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      else if (timeframe === '30d') match.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }

    // User isolation
    match.$or = [
      { userId: new mongoose.Types.ObjectId(userId) },
      { userId: null }, { userId: { $exists: false } }
    ];

    const regionalData = await Article.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$stateLocation',
          count: { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } },
          neutral:  { $sum: { $cond: [{ $eq: ['$sentiment', 'Neutral'] }, 1, 0] } }
        }
      },
      {
        $project: {
          state: '$_id',
          count: 1,
          avgScore: {
            $divide: [
              { $add: ['$positive', { $multiply: ['$neutral', 0.5] }] },
              '$count'
            ]
          }
        }
      }
    ]);
    res.json(JSON.parse(JSON.stringify(regionalData)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/news/:id/view (#1 Tracking)
 */
const trackNewsView = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }, { new: true });
    if (!article) return res.status(404).json({ error: 'Article not found' });

    // Track recently viewed if logged in (#3)
    if (req.userId) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.userId, {
        $push: { 
          recentlyViewed: { 
            $each: [{ article: article._id, viewedAt: new Date() }],
            $position: 0,
            $slice: 10 
          }
        }
      });
    }
    res.json({ success: true, viewCount: article.viewCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/news/:id/vote (#2 Hybrid Sentiment)
 */
const handleSentimentVote = async (req, res) => {
  try {
    const { sentiment, type } = req.body; // sentiment: Positive/Negative/Neutral, type: up/down
    const update = {};
    
    if (sentiment) update[`feedback.${sentiment}`] = 1;
    if (type === 'up')   update['feedback.upVotes'] = 1;
    if (type === 'down') update['feedback.downVotes'] = 1;

    const article = await Article.findByIdAndUpdate(
      req.params.id, 
      { $inc: update }, 
      { new: true }
    );

    // Recalculate majority sentiment (#2.2)
    const fb = article.feedback;
    const totals = [
      { s: 'Positive', c: fb.Positive },
      { s: 'Negative', c: fb.Negative },
      { s: 'Neutral',  c: fb.Neutral }
    ].sort((a, b) => b.c - a.c);

    // If enough users voted (> 5 votes) and majority found, update main sentiment
    if (fb.Positive + fb.Negative + fb.Neutral > 5 && totals[0].c > totals[1].c) {
      article.sentiment = totals[0].s;
      await article.save();
    }

    res.json({ success: true, feedback: article.feedback, finalSentiment: article.sentiment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/news/top (#1 Popularity Filters)
 */
const getTopViewedNews = async (req, res) => {
  try {
    const { filter = 'today', category } = req.query;
    const match = {};

    if (category) match.topic = { $regex: category, $options: 'i' };

    const now = new Date();
    if (filter === 'today') {
      match.createdAt = { $gte: new Date(now.setHours(0,0,0,0)) };
    } else if (filter === 'week') {
      const weekAgo = new Date();
      match.createdAt = { $gte: new Date(weekAgo.setDate(weekAgo.getDate() - 7)) };
    }

    const topNews = await Article.find(match)
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title sentiment viewCount source publishedAt urlToImage description content aiSentiment reason confidence isAlert topic feedback')
      .lean();
      
    res.json(JSON.parse(JSON.stringify(topNews)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/news/:id/bookmark (#3)
 */
const toggleBookmarkStatus = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    const isBookmarked = user.bookmarks.includes(req.params.id);

    if (isBookmarked) {
      user.bookmarks.pull(req.params.id);
      await Article.findByIdAndUpdate(req.params.id, { $inc: { bookmarksCount: -1 } });
    } else {
      user.bookmarks.push(req.params.id);
      await Article.findByIdAndUpdate(req.params.id, { $inc: { bookmarksCount: 1 } });
    }

    await user.save();
    res.json({ bookmarked: !isBookmarked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/stats (#4 Admin Dashboard)
 */
const getAdminDashboardStats = async (req, res) => {
  try {
    const User = require('../models/User');
    
    // We fetch each metric with a safety fallback to ensure one failure doesn't block the dashboard
    const safeExec = async (promise, fallback) => {
      try { return await promise; } 
      catch (err) { console.error('Admin Metric Error:', err.message); return fallback; }
    };

    const overviewStats = await safeExec(Article.aggregate([
      { $group: {
        _id: null,
        totalUniqueArticles: { $sum: 1 },
        pos: { $sum: { $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, 0] } },
        neg: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } },
        neu: { $sum: { $cond: [{ $eq: ['$sentiment', 'Neutral'] }, 1, 0] } },
      }}
    ]), []);

    const totalUsers    = await safeExec(User.countDocuments(), 0);
    const usersStats    = await safeExec(User.aggregate([{ $group: { _id: null, totalAnalysed: { $sum: '$analysisCount' } } }]), []);
    const totalViews    = await safeExec(Article.aggregate([{ $group: { _id: null, count: { $sum: '$viewCount' } } }]), []);
    const recentUsers   = await safeExec(User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'), []);
    const recentArticles= await safeExec(Article.find().sort({ createdAt: -1 }).limit(5).select('title sentiment source publishedAt topic impactScore'), []);
    const topImpactArticles = await safeExec(Article.find().sort({ impactScore: -1 }).limit(5).select('title source impactScore sentiment'), []);
    
    // Continue with other stats...
    const popularTopics = await safeExec(Article.aggregate([
      { $group: { _id: '$topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]), []);
    const topSources    = await safeExec(Article.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]), []);
    const activityStats = await safeExec(Article.aggregate([
      { $group: { 
          hour: { $hour: { $toDate: '$createdAt' } }, 
          count: { $sum: 1 }
      }},
      { $sort: { hour: 1 } }
    ]), []);

    const totalAnalysedCount = usersStats[0]?.totalAnalysed || overviewStats[0]?.totalUniqueArticles || 0;

    res.json({
      overview: {
        totalArticles: totalAnalysedCount,
        totalUnique: overviewStats[0]?.totalUniqueArticles || 0,
        totalUsers,
        totalViews: totalViews[0]?.count || 0
      },
      sentiment: {
        Positive: overviewStats[0]?.pos || 0,
        Negative: overviewStats[0]?.neg || 0,
        Neutral: overviewStats[0]?.neu || 0
      },
      recentUsers,
      recentArticles,
      topImpactArticles,
      popularTopics: (popularTopics || []).map(t => ({ 
        topic: t._id, 
        count: t.count,
        sov: Math.round((t.count / (overviewStats[0]?.totalUniqueArticles || 1)) * 100)
      })),
      topSources: (topSources || []).map(s => ({ source: s._id, count: s.count })),
      activityTimeline: activityStats,
      operational: {
        latency: `${Date.now() - (req.startTime || Date.now())}ms`,
        openai: (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_')) ? 'Stable' : 'Not Configured',
        mongodb: require('mongoose').connection.readyState === 1 ? 'Health: 100%' : 'Disconnected'
      }
    });
  } catch (error) {
    console.error('getAdminDashboardStats Critical Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/news/admin/promo?secret=...&email=...
 * Fallback browser-based admin promotion for restricted terminal environments.
 */
const promoteToAdminBrowser = async (req, res) => {
  try {
    const { email, secret } = req.query;
    if (secret !== 'mynews_secret_2026') return res.status(403).send('Invalid secret.');
    
    const User = require('../models/User');
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    
    if (!user) return res.send(`User [${email}] not found.`);
    res.send(`SUCCESS! ${email} is now an ADMIN. Please log out and back in.`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

/**
 * Calculate Impact Score (0-100) based on multiple factors:
 * - Source credibility & reach (40 points)
 * - Sentiment intensity (20 points)
 * - Crisis/Alert keywords (20 points)
 * - Content depth (10 points)
 * - High-impact topic keywords (10 points)
 */
const calculateImpactScore = (sourceName, sentiment, isAlert, title = '', description = '', content = '') => {
  let score = 0;
  const n = (sourceName || '').toLowerCase();
  const text = `${title} ${description}`.toLowerCase();

  // ── 1. Source Credibility & Reach (40 points) ──────────────
  // Tier 1: National news agencies & major outlets
  if (['bernama', 'the star', 'astro awani', 'fmt', 'malay mail'].some(s => n.includes(s))) {
    score += 40;
  }
  // Tier 2: Established regional/business outlets
  else if (['edge', 'new straits times', 'nst', 'utusan', 'berita harian', 'harian metro', 'sinar harian', 'malaysiakini'].some(s => n.includes(s))) {
    score += 30;
  }
  // Tier 3: Other sources
  else {
    score += 15;
  }

  // ── 2. Sentiment Intensity (20 points) ─────────────────────
  // Negative news typically has higher impact (crisis, problems)
  if (sentiment === 'Negative') {
    score += 20;
  } else if (sentiment === 'Positive') {
    score += 12; // Positive news still impactful but less urgent
  } else {
    score += 8; // Neutral news has moderate impact
  }

  // ── 3. Crisis/Alert Keywords (20 points) ───────────────────
  if (isAlert) {
    score += 20;
  }

  // ── 4. Content Depth (10 points) ───────────────────────────
  const contentLength = (content || description || '').length;
  if (contentLength > 1000) {
    score += 10; // In-depth article
  } else if (contentLength > 500) {
    score += 7;
  } else if (contentLength > 200) {
    score += 4;
  } else {
    score += 2; // Brief mention
  }

  // ── 5. High-Impact Topic Keywords (10 points) ──────────────
  const HIGH_IMPACT_TOPICS = [
    // Political
    'parliament', 'parlimen', 'prime minister', 'perdana menteri', 'election', 'pilihan raya',
    'government', 'kerajaan', 'policy', 'dasar', 'law', 'undang-undang', 'cabinet', 'kabinet',
    // Economic
    'economy', 'ekonomi', 'gdp', 'kdnk', 'budget', 'bajet', 'inflation', 'inflasi',
    'ringgit', 'bank negara', 'interest rate', 'kadar faedah', 'unemployment', 'pengangguran',
    // Crisis/Emergency
    'pandemic', 'pandemik', 'covid', 'lockdown', 'pkp', 'disaster', 'bencana',
    'emergency', 'darurat', 'flood', 'banjir', 'earthquake', 'gempa',
    // Social Issues
    'corruption', 'rasuah', 'scandal', 'protest', 'protes', 'strike', 'mogok',
    'crime', 'jenayah', 'safety', 'keselamatan', 'education', 'pendidikan',
    // Infrastructure
    'mrt', 'lrt', 'infrastructure', 'infrastruktur', 'development', 'pembangunan',
  ];

  const matchedTopics = HIGH_IMPACT_TOPICS.filter(kw => text.includes(kw));
  if (matchedTopics.length >= 3) {
    score += 10;
  } else if (matchedTopics.length >= 2) {
    score += 7;
  } else if (matchedTopics.length >= 1) {
    score += 4;
  }

  // ── Normalize to 0-100 range ───────────────────────────────
  return Math.min(Math.max(score, 0), 100);
};

const getAdminInsights = async (req, res) => {
  try {
    const openai = require('../services/openaiService').getClient();
    const recent = await Article.find().sort({ createdAt: -1 }).limit(10).select('title sentiment topic');
    const prompt = `Analyze these 10 news headlines from Malaysia: ${recent.map(a => `[${a.sentiment}] ${a.title}`).join(' | ')}. Return exactly 2 strategic points. Point 1: One Specific Crisis/Risk. Point 2: One Positive Opportunity. Keep each point under 20 words. No numbers.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150
    });
    
    const lines = completion.choices[0].message.content.split('\n').filter(l => l.trim().length > 5);
    res.json({
      risk: lines[0]?.replace('Point 1:', '').trim() || 'No critical risks.',
      opportunity: lines[1]?.replace('Point 2:', '').trim() || 'Stable market conditions.'
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { 
  getAndAnalyzeNews, 
  getTopSources, 
  generateDigest, 
  getKeywords, 
  getForecast: (req, res) => res.json({ message: "Legacy Forecast Removed" }), // Placeholder if used in routes
  getRegionalSentiment,
  trackNewsView,
  handleSentimentVote,
  getTopViewedNews,
  toggleBookmarkStatus,
  getAdminDashboardStats,
  promoteToAdminBrowser,
  getAdminInsights
};
