const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { getHistory, getTrends, getStats, deleteArticle } = require('../controllers/historyController');

// All routes protected (#3)
router.get('/',        protect, getHistory);
router.get('/trends',  protect, getTrends);
router.get('/stats',   protect, getStats);
router.delete('/:id',  protect, deleteArticle);

module.exports = router;
