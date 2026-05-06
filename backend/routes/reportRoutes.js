const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generatePDFReport, generateTopicReport } = require('../controllers/reportController');

// POST /api/reports/generate — generate full PDF report
router.post('/generate', protect, generatePDFReport);

// POST /api/reports/topic — generate topic-specific report
router.post('/topic', protect, generateTopicReport);

module.exports = router;
