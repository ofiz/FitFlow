const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stats
router.get('/stats', auth, dashboardController.getStats);

module.exports = router;