const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateDailyDigest, generateTopicDigest, generateWeeklyDigest } = require('../controllers/digestController');

// GET /api/v1/digest/daily — today's AI-generated news digest
router.get('/daily', protect, generateDailyDigest);

// GET /api/v1/digest/weekly — weekly summary
router.get('/weekly', protect, generateWeeklyDigest);

// GET /api/v1/digest/topic/:topic — AI summary for a topic
router.get('/topic/:topic', protect, generateTopicDigest);

module.exports = router;
