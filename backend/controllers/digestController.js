const Article = require('../models/Article');
const { performAiRequest, generateDigest: aiGenerateDigest } = require('../services/openaiService');

/**
 * GET /api/v1/digest/daily
 * Generate AI summary of top articles from last 24h
 */
const generateDailyDigest = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const articles = await Article.find({ publishedAt: { $gte: since } })
      .sort({ viewCount: -1, publishedAt: -1 })
      .limit(20)
      .lean();

    if (!articles.length) {
      return res.json({
        digest: { en: 'No articles found in the last 24 hours.', ms: 'Tiada artikel ditemui dalam 24 jam lepas.' },
        articleCount: 0,
        sentimentMood: { emoji: '😐', text: 'No Data', textMs: 'Tiada Data' },
        highlights: [],
      });
    }

    // Calculate sentiment mood
    const sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
    articles.forEach(a => { sentimentCounts[a.sentiment] = (sentimentCounts[a.sentiment] || 0) + 1; });
    
    const total = articles.length;
    const posRatio = sentimentCounts.Positive / total;
    const negRatio = sentimentCounts.Negative / total;

    let sentimentMood;
    if (posRatio > 0.5) sentimentMood = { emoji: '😊', text: 'Mostly Positive', textMs: 'Kebanyakan Positif' };
    else if (negRatio > 0.5) sentimentMood = { emoji: '😟', text: 'Mostly Negative', textMs: 'Kebanyakan Negatif' };
    else if (posRatio > 0.3 && negRatio > 0.3) sentimentMood = { emoji: '🔀', text: 'Mixed', textMs: 'Bercampur' };
    else sentimentMood = { emoji: '😐', text: 'Neutral', textMs: 'Neutral' };

    // Generate AI digest
    const digestResult = await aiGenerateDigest(articles, 'Malaysia Daily News');

    // Extract highlights from top articles
    const highlights = articles.slice(0, 5).map(a => ({
      title: a.title,
      sentiment: a.sentiment,
      source: a.source,
    }));

    res.json({
      digest: digestResult.digest,
      articleCount: articles.length,
      sentimentMood,
      highlights,
      sentimentBreakdown: sentimentCounts,
      generatedAt: new Date(),
    });
  } catch (err) {
    console.error('Daily digest error:', err.message);
    res.status(500).json({ error: 'Failed to generate daily digest.' });
  }
};

/**
 * GET /api/v1/digest/topic/:topic
 * Generate AI summary for a specific topic
 */
const generateTopicDigest = async (req, res) => {
  try {
    const { topic } = req.params;
    if (!topic) return res.status(400).json({ error: 'Topic parameter required.' });

    const regex = new RegExp(topic, 'i');
    const articles = await Article.find({
      $or: [
        { title: regex },
        { description: regex },
        { topic: regex },
      ],
    })
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();

    if (!articles.length) {
      return res.json({
        digest: { en: `No articles found about "${topic}".`, ms: `Tiada artikel ditemui tentang "${topic}".` },
        articleCount: 0,
        topic,
      });
    }

    const digestResult = await aiGenerateDigest(articles, topic);

    const sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
    articles.forEach(a => { sentimentCounts[a.sentiment] = (sentimentCounts[a.sentiment] || 0) + 1; });

    res.json({
      digest: digestResult.digest,
      articleCount: articles.length,
      topic,
      sentimentBreakdown: sentimentCounts,
      generatedAt: new Date(),
    });
  } catch (err) {
    console.error('Topic digest error:', err.message);
    res.status(500).json({ error: 'Failed to generate topic digest.' });
  }
};

/**
 * GET /api/v1/digest/weekly
 * Generate weekly summary
 */
const generateWeeklyDigest = async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const articles = await Article.find({ publishedAt: { $gte: since } })
      .sort({ viewCount: -1, publishedAt: -1 })
      .limit(30)
      .lean();

    if (!articles.length) {
      return res.json({
        digest: { en: 'No articles found this week.', ms: 'Tiada artikel ditemui minggu ini.' },
        articleCount: 0,
        sentimentMood: { emoji: '😐', text: 'No Data', textMs: 'Tiada Data' },
      });
    }

    // Sentiment mood
    const sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
    articles.forEach(a => { sentimentCounts[a.sentiment] = (sentimentCounts[a.sentiment] || 0) + 1; });
    
    const total = articles.length;
    const posRatio = sentimentCounts.Positive / total;
    const negRatio = sentimentCounts.Negative / total;

    let sentimentMood;
    if (posRatio > 0.5) sentimentMood = { emoji: '😊', text: 'Mostly Positive', textMs: 'Kebanyakan Positif' };
    else if (negRatio > 0.5) sentimentMood = { emoji: '😟', text: 'Mostly Negative', textMs: 'Kebanyakan Negatif' };
    else if (posRatio > 0.3 && negRatio > 0.3) sentimentMood = { emoji: '🔀', text: 'Mixed', textMs: 'Bercampur' };
    else sentimentMood = { emoji: '😐', text: 'Neutral', textMs: 'Neutral' };

    const digestResult = await aiGenerateDigest(articles, 'Malaysia Weekly News Summary');

    // Top sources this week
    const sourceCounts = {};
    articles.forEach(a => { sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1; });
    const topSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      digest: digestResult.digest,
      articleCount: articles.length,
      sentimentMood,
      sentimentBreakdown: sentimentCounts,
      topSources,
      period: { from: since, to: new Date() },
      generatedAt: new Date(),
    });
  } catch (err) {
    console.error('Weekly digest error:', err.message);
    res.status(500).json({ error: 'Failed to generate weekly digest.' });
  }
};

module.exports = { generateDailyDigest, generateTopicDigest, generateWeeklyDigest };
