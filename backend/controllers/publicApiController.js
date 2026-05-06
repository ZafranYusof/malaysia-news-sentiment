const Article = require('../models/Article');
const { analyzeSentiment } = require('../services/openaiService');

/**
 * GET /api/v1/public/sentiment?text=xxx
 * Public sentiment analysis endpoint
 */
const publicSentimentAnalysis = async (req, res) => {
  try {
    const { text } = req.query;
    if (!text || text.trim().length < 5) {
      return res.status(400).json({ error: 'Query parameter "text" is required (min 5 characters).' });
    }

    const result = await analyzeSentiment(text.trim(), '');
    res.json({
      text: text.trim().substring(0, 500),
      sentiment: result.sentiment,
      confidence: result.confidence,
      language: result.language || 'en',
      analysis_source: result.analysis_source,
    });
  } catch (err) {
    console.error('Public sentiment error:', err.message);
    res.status(500).json({ error: 'Sentiment analysis failed.' });
  }
};

/**
 * GET /api/v1/public/articles?topic=xxx&limit=10
 * Public articles endpoint
 */
const publicArticles = async (req, res) => {
  try {
    const { topic, limit = 10, page = 1, sentiment } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const pageNum = Math.max(1, parseInt(page));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (topic) {
      const regex = new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: regex }, { description: regex }, { topic: regex }];
    }
    if (sentiment) {
      filter.sentiment = sentiment;
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .select('title description source sentiment confidence publishedAt url stateLocation language')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Article.countDocuments(filter),
    ]);

    res.json({
      articles,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('Public articles error:', err.message);
    res.status(500).json({ error: 'Failed to fetch articles.' });
  }
};

/**
 * GET /api/v1/public/sources
 * Public sources list
 */
const publicSources = async (req, res) => {
  try {
    const sources = await Article.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 }, lastArticle: { $max: '$publishedAt' } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
      { $project: { _id: 0, name: '$_id', articleCount: '$count', lastArticle: 1 } },
    ]);

    res.json({ sources });
  } catch (err) {
    console.error('Public sources error:', err.message);
    res.status(500).json({ error: 'Failed to fetch sources.' });
  }
};

/**
 * GET /api/v1/public/trending
 * Public trending topics
 */
const publicTrending = async (req, res) => {
  try {
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000); // Last 48h

    // Get recent articles and extract common topics
    const articles = await Article.find({ publishedAt: { $gte: since } })
      .select('title topic sentiment source')
      .sort({ viewCount: -1, publishedAt: -1 })
      .limit(100)
      .lean();

    // Count topics
    const topicCounts = {};
    articles.forEach(a => {
      const topic = (a.topic || 'general').toLowerCase();
      if (!topicCounts[topic]) topicCounts[topic] = { count: 0, sentiments: { Positive: 0, Negative: 0, Neutral: 0 } };
      topicCounts[topic].count++;
      topicCounts[topic].sentiments[a.sentiment] = (topicCounts[topic].sentiments[a.sentiment] || 0) + 1;
    });

    const trending = Object.entries(topicCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([topic, data]) => ({
        topic,
        articleCount: data.count,
        sentiments: data.sentiments,
      }));

    // Sentiment overview
    const sentimentOverview = { Positive: 0, Negative: 0, Neutral: 0 };
    articles.forEach(a => { sentimentOverview[a.sentiment] = (sentimentOverview[a.sentiment] || 0) + 1; });

    res.json({
      trending,
      totalArticles: articles.length,
      sentimentOverview,
      period: '48h',
    });
  } catch (err) {
    console.error('Public trending error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending topics.' });
  }
};

module.exports = { publicSentimentAnalysis, publicArticles, publicSources, publicTrending };
