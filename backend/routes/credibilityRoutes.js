const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getSources, getSourceByName, analyzeSource, seedSources } = require('../controllers/credibilityController');

router.get('/',              protect, getSources);
router.get('/:sourceName',   protect, getSourceByName);
router.post('/analyze',      protect, authorize('admin'), analyzeSource);
router.post('/seed',         protect, authorize('admin'), seedSources);

module.exports = router;
