const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const nutritionController = require('../controllers/nutritionController');

// GET meals for today
router.get('/today', auth, nutritionController.getTodayMeals);

// GET meals by date
router.get('/date/:date', auth, nutritionController.getMealsByDate);

// POST create meal
router.post('/meals', auth, nutritionController.createMeal);

// PUT update meal
router.put('/meals/:id', auth, nutritionController.updateMeal);

// DELETE meal
router.delete('/meals/:id', auth, nutritionController.deleteMeal);

module.exports = router;