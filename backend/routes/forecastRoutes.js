const express = require('express');
const router = express.Router();
const { getForecast } = require('../controllers/forecastController');

// GET /api/forecast/:topic?days=7
router.get('/:topic', getForecast);

module.exports = router;
