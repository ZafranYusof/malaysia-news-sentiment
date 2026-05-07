/**
 * engagementController.js — Code Quality #17
 * Handles all user-engagement actions: views, votes, top-viewed, bookmarks.
 * Extracted from newsController.js to reduce its responsibility and size.
 */
const Article = require('../models/Article');
const User    = require('../models/User');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── POST /api/news/:id/view ───────────────────────────────────
const trackNewsView = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: 'Article not found.' });

    // Track recently viewed if logged in (skip for guest)
    if (req.userId && req.userId !== 'guest' && !req.isGuest) {
      await User.findByIdAndUpdate(req.userId, {
        $push: {
          recentlyViewed: {
            $each:     [{ article: article._id, viewedAt: new Date() }],
            $position: 0,
            $slice:    10,
          },
        },
      });
    }
    // Broadcast update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('view_updated', { articleId: article._id, viewCount: article.viewCount });
    }

    res.json({ success: true, viewCount: article.viewCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── POST /api/news/:id/vote ───────────────────────────────────
const handleSentimentVote = async (req, res) => {
  try {
    const { sentiment, type } = req.body;
    const userId = req.userId;

    // Prevent duplicate votes using the voters array (Bug #3 Fix)
    const existing = await Article.findById(req.params.id).select('feedback');
    if (!existing) return res.status(404).json({ error: 'Article not found.' });

    const alreadyVoted = existing.feedback.voters?.some(
      (v) => v.toString() === userId.toString()
    );
    if (alreadyVoted) {
      return res.status(409).json({ error: 'You have already voted on this article.' });
    }

    const update = { $push: { 'feedback.voters': userId } };
    if (sentiment) update.$inc = { [`feedback.${sentiment}`]: 1 };
    if (type === 'up')   (update.$inc = update.$inc || {})['feedback.upVotes']   = 1;
    if (type === 'down') (update.$inc = update.$inc || {})['feedback.downVotes'] = 1;

    const article = await Article.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!article) return res.status(404).json({ error: 'Article not found.' });

    // Recalculate majority sentiment if enough votes
    const fb = article.feedback;
    const totals = [
      { s: 'Positive', c: fb.Positive },
      { s: 'Negative', c: fb.Negative },
      { s: 'Neutral',  c: fb.Neutral  },
    ].sort((a, b) => b.c - a.c);

    if (fb.Positive + fb.Negative + fb.Neutral > 5 && totals[0].c > totals[1].c) {
      article.sentiment = totals[0].s;
      await article.save();
    }

    res.json({ success: true, feedback: article.feedback, finalSentiment: article.sentiment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── GET /api/news/top ─────────────────────────────────────────
const getTopViewedNews = async (req, res) => {
  try {
    const { filter = 'today', category } = req.query;
    const match = {};

    if (category) match.topic = { $regex: escapeRegex(category), $options: 'i' };

    if (filter === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      match.createdAt = { $gte: startOfDay };
    } else if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      match.createdAt = { $gte: weekAgo };
    }

    const topNews = await Article.find(match)
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title sentiment viewCount source publishedAt urlToImage description content aiSentiment reason confidence isAlert topic feedback')
      .lean();

    res.json(topNews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── POST /api/news/:id/bookmark ──────────────────────────────
const toggleBookmarkStatus = async (req, res) => {
  try {
    const articleId = req.params.id;

    // Atomic bookmark toggle using $pull first, then $addToSet if nothing was removed
    const pullResult = await User.findOneAndUpdate(
      { _id: req.userId, bookmarks: articleId },
      { $pull: { bookmarks: articleId } },
      { new: true }
    );

    let bookmarked;
    if (pullResult) {
      // Was bookmarked, now removed
      bookmarked = false;
      await Article.findByIdAndUpdate(articleId, { $inc: { bookmarksCount: -1 } });
    } else {
      // Was not bookmarked, add it
      const addResult = await User.findByIdAndUpdate(
        req.userId,
        { $addToSet: { bookmarks: articleId } },
        { new: true }
      );
      if (!addResult) return res.status(404).json({ error: 'User not found.' });
      bookmarked = true;
      await Article.findByIdAndUpdate(articleId, { $inc: { bookmarksCount: 1 } });
    }

    const finalArticle = await Article.findById(articleId).select('bookmarksCount');
    const io = req.app.get('io');
    if (io) {
      io.emit('bookmark_updated', { articleId, bookmarksCount: finalArticle?.bookmarksCount || 0 });
    }

    res.json({ bookmarked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { trackNewsView, handleSentimentVote, getTopViewedNews, toggleBookmarkStatus };
