const express = require('express');
const router = express.Router();
const { getLiveFeed, streamFeed } = require('../controllers/feedController');

// Live feed - no auth required for public access
router.get('/live', getLiveFeed);

// SSE stream - no auth required
router.get('/stream', streamFeed);

module.exports = router;
