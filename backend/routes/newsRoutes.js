const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Code Quality #17: Handlers now live in dedicated, focused controllers
const { getAndAnalyzeNews, getTopSources, generateDigest, getKeywords, getForecast, getRegionalSentiment, getArticleAnalysis } = require('../controllers/newsController');
const { trackNewsView, handleSentimentVote, getTopViewedNews, toggleBookmarkStatus } = require('../controllers/engagementController');
const { getAdminDashboardStats, getAdminInsights, triggerDigest } = require('../controllers/adminController');

// ── News analysis ─────────────────────────────────────────────
router.get('/',               protect, getAndAnalyzeNews);
router.get('/sources',        protect, getTopSources);
router.get('/keywords',       protect, getKeywords);
router.get('/regional',       protect, getRegionalSentiment);
router.get('/top',            protect, getTopViewedNews);
router.post('/digest',        protect, generateDigest);
router.post('/forecast',      protect, getForecast);
router.post('/analyze-article', protect, getArticleAnalysis);

// ── Admin (role-gated) ────────────────────────────────────────
router.get('/admin/stats',    protect, authorize('admin'), getAdminDashboardStats);
router.get('/admin/insights', protect, authorize('admin'), getAdminInsights);
router.post('/admin/send-digest', protect, authorize('admin'), triggerDigest);

// ── Engagement ────────────────────────────────────────────────
router.post('/:id/view',      protect, trackNewsView);
router.post('/:id/vote',      protect, handleSentimentVote);
router.post('/:id/bookmark',  protect, toggleBookmarkStatus);

module.exports = router;
