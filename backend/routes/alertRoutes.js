const express = require('express');
const router = express.Router();
const { protect, blockGuest } = require('../middleware/auth');
const { getAlerts, createAlert, updateAlert, deleteAlert, testAlert } = require('../controllers/alertController');

router.get('/',       protect, getAlerts);
router.post('/',      protect, blockGuest, createAlert);
router.put('/:id',    protect, blockGuest, updateAlert);
router.delete('/:id', protect, blockGuest, deleteAlert);
router.post('/test',  protect, blockGuest, testAlert);

module.exports = router;
