const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { publicSentimentAnalysis, publicArticles, publicSources, publicTrending } = require('../controllers/publicApiController');

// Rate limiting: 100 requests/hour per IP (default)
// Higher limit if x-api-key header is provided
const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // If API key provided, allow higher rate
    if (req.headers['x-api-key']) return 1000;
    return 100;
  },
  message: { error: 'Rate limit exceeded. Max 100 requests/hour. Provide x-api-key header for higher limits.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(publicLimiter);

// GET /api/v1/public/sentiment?text=xxx
router.get('/sentiment', publicSentimentAnalysis);

// GET /api/v1/public/articles?topic=xxx&limit=10
router.get('/articles', publicArticles);

// GET /api/v1/public/sources
router.get('/sources', publicSources);

// GET /api/v1/public/trending
router.get('/trending', publicTrending);

module.exports = router;
