const express = require('express');
const router = express.Router();
const { getShareData, getEmbedCode } = require('../controllers/shareController');

// Public routes - no auth needed
router.get('/share/:articleId', getShareData);
router.get('/embed/:articleId', getEmbedCode);

module.exports = router;
