const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getLogs } = require('../controllers/auditController');

router.get('/', protect, authorize('admin'), getLogs);

module.exports = router;
