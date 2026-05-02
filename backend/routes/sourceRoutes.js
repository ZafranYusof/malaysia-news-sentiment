const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSourceCredibility } = require('../controllers/sourceController');

// GET /api/sources/credibility
router.get('/credibility', protect, getSourceCredibility);

module.exports = router;
