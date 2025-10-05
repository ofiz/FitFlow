const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// GET workout statistics
router.get('/workouts', auth, analyticsController.getWorkoutStats);

// GET nutrition statistics
router.get('/nutrition', auth, analyticsController.getNutritionStats);

// GET overview/dashboard
router.get('/overview', auth, analyticsController.getOverview);

module.exports = router;