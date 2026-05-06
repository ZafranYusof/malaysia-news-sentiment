const Article = require('../models/Article');

/**
 * GET /api/feed/live
 * Returns latest 50 articles sorted by publishedAt desc, with sentiment
 */
const getLiveFeed = async (req, res) => {
  try {
    const { sentiment, language } = req.query;
    const filter = {};
    
    if (sentiment && ['Positive', 'Negative', 'Neutral'].includes(sentiment)) {
      filter.sentiment = sentiment;
    }
    if (language && ['en', 'ms', 'bm'].includes(language.toLowerCase())) {
      filter.language = language.toLowerCase() === 'bm' ? 'ms' : language.toLowerCase();
    }

    const articles = await Article.find(filter)
      .sort({ publishedAt: -1 })
      .limit(50)
      .select('title source url publishedAt sentiment confidence language description stateLocation isAlert')
      .lean();

    res.json({ success: true, count: articles.length, articles });
  } catch (err) {
    console.error('[Feed] getLiveFeed error:', err.message);
    res.status(500).json({ error: 'Failed to fetch live feed' });
  }
};

/**
 * GET /api/feed/stream
 * SSE endpoint that pushes new articles as they arrive
 * Polls DB every 30s for new articles since last check
 */
const streamFeed = async (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  let lastCheck = new Date();
  let isAlive = true;

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    if (!isAlive) return;
    res.write(`:heartbeat\n\n`);
  }, 15000);

  // Poll for new articles every 30s
  const poller = setInterval(async () => {
    if (!isAlive) return;
    try {
      const newArticles = await Article.find({ publishedAt: { $gt: lastCheck } })
        .sort({ publishedAt: -1 })
        .limit(10)
        .select('title source url publishedAt sentiment confidence language description stateLocation isAlert')
        .lean();

      if (newArticles.length > 0) {
        lastCheck = new Date();
        res.write(`data: ${JSON.stringify({ type: 'new_articles', articles: newArticles, timestamp: lastCheck.toISOString() })}\n\n`);
      }
    } catch (err) {
      console.error('[Feed] SSE poll error:', err.message);
    }
  }, 30000);

  // Cleanup on client disconnect
  req.on('close', () => {
    isAlive = false;
    clearInterval(heartbeat);
    clearInterval(poller);
  });
};

module.exports = { getLiveFeed, streamFeed };
