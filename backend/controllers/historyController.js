const mongoose = require('mongoose');
const Article  = require('../models/Article');
const User     = require('../models/User');

const isDbConnected = () => mongoose.connection.readyState === 1;

const sanitize = (str, max = 150) =>
  String(str || '').replace(/[<>"'\\]/g, '').trim().slice(0, max);

/**
 * GET /api/history
 * Supports: sentiment, topic, search, from, to, sortBy, page, limit
 * (#6 pagination, #7 search+date filter, #2 userId isolation)
 */
const getHistory = async (req, res) => {
  if (!isDbConnected()) {
    return res.json({ total: 0, pages: 0, page: 1, articles: [], warning: 'Database not connected.' });
  }
  try {
    const {
      sentiment,
      topic,
      search,
      from,
      to,
      sortBy = 'newest',
      page  = 1,
      limit = 20,
    } = req.query;

    const userId   = req.userId;
    const pageNum  = Math.max(parseInt(page)  || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip     = (pageNum - 1) * limitNum;

    const { timeframe } = req.query;
    const now = new Date();

    // ── Build Filter ──
    const filter = {};

    // User Isolation
    if (userId) {
      const { bookmarked } = req.query;
      if (bookmarked === 'true') {
        const user = await User.findById(userId);
        filter._id = { $in: user?.bookmarks || [] };
      } else {
        filter.$or = [
          { userId: new mongoose.Types.ObjectId(userId) },
          { userId: null },
          { userId: { $exists: false } },
        ];
      }
    }

    if (sentiment) filter.sentiment = sentiment;
    if (topic)     filter.topic = { $regex: sanitize(topic), $options: 'i' };

    if (search) {
      const s = sanitize(search, 100);
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: s, $options: 'i' } },
          { description: { $regex: s, $options: 'i' } },
        ],
      });
    }

    // ── Time range filter ──
    if (from || to) {
      filter.createdAt = {}; 
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    } else if (timeframe) {
      if (timeframe === '24h')      filter.createdAt = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      else if (timeframe === '7d')  filter.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      else if (timeframe === '30d') filter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }

    // ── Sort ──
    const sortMap = {
      newest:     { updatedAt: -1 },
      oldest:     { updatedAt:  1 },
      confidence: { confidence: -1 },
      published:  { publishedAt: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.newest;

    // ── Query with pagination ──
    const [total, articles] = await Promise.all([
      Article.countDocuments(filter),
      Article.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
    ]);

    res.json(JSON.parse(JSON.stringify({
      total,
      pages: Math.ceil(total / limitNum),
      page:  pageNum,
      limit: limitNum,
      articles,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/history/trends
 */
const getTrends = async (req, res) => {
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

    const trends = await Article.aggregate([
      { $match: match },
      { $group: {
          _id:   { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sentiment: '$sentiment' },
          count: { $sum: 1 },
      }},
      { $sort: { '_id.date': 1 } },
    ]);

    const grouped = {};
    trends.forEach(({ _id, count }) => {
      const { date, sentiment } = _id;
      if (!grouped[date]) grouped[date] = { date, Positive: 0, Negative: 0, Neutral: 0 };
      grouped[date][sentiment] = count;
    });

    res.json(JSON.parse(JSON.stringify(Object.values(grouped))));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/history/stats — summary stats for the current user
 */
const getStats = async (req, res) => {
  if (!isDbConnected()) return res.json({});
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

    // ── Get Global vs User Count ──
    const user = userId ? await User.findById(userId).select('analysisCount') : null;

    const [sentiments, alerts] = await Promise.all([
      Article.aggregate([
        { $match: match },
        { $group: { _id: '$sentiment', count: { $sum: 1 } } },
      ]),
      Article.countDocuments({ ...match, isAlert: true }),
    ]);

    const sentimentMap = { Positive: 0, Negative: 0, Neutral: 0 };
    let calculatedTotal = 0;
    sentiments.forEach(({ _id, count }) => { 
      if (_id) {
        sentimentMap[_id] = count; 
        calculatedTotal += count;
      }
    });

    // Use persistence counter if it exists and is larger (to preserve volume), 
    // but default to calculated total for dashboard consistency.
    const finalTotal = Math.max(calculatedTotal, user?.analysisCount || 0);

    res.json(JSON.parse(JSON.stringify({ total: finalTotal, sentiments: sentimentMap, alerts })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/history/:id
 */
const deleteArticle = async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database not connected.' });
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getHistory, getTrends, getStats, deleteArticle };
