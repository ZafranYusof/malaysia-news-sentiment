const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAndAnalyzeNews, getTopSources, generateDigest, getKeywords, 
  getForecast, getRegionalSentiment, trackNewsView, handleSentimentVote,
  getTopViewedNews, toggleBookmarkStatus, getAdminDashboardStats, promoteToAdminBrowser,
  getAdminInsights
} = require('../controllers/newsController');

// Public fallback for admin promotion
router.get('/admin/promo', promoteToAdminBrowser);

// All routes protected (#3)
router.get('/',               protect, getAndAnalyzeNews);
router.get('/sources',        protect, getTopSources);
router.get('/keywords',       protect, getKeywords);
router.get('/regional',       protect, getRegionalSentiment);
router.get('/top',            protect, getTopViewedNews);
router.get('/admin/stats',    protect, getAdminDashboardStats);
router.get('/admin/insights', protect, getAdminInsights);

router.post('/digest',        protect, generateDigest);
router.post('/forecast',      protect, getForecast);
router.post('/:id/view',      protect, trackNewsView);
router.post('/:id/vote',      protect, handleSentimentVote);
router.post('/:id/bookmark',  protect, toggleBookmarkStatus);

module.exports = router;
