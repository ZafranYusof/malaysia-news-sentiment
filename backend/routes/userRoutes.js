const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardLayout, saveDashboardLayout } = require('../controllers/userController');

// Protected routes
router.get('/dashboard-layout', protect, getDashboardLayout);
router.put('/dashboard-layout', protect, saveDashboardLayout);

module.exports = router;
