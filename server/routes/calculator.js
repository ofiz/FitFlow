const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const calculatorController = require('../controllers/calculatorController');

// POST calculate calories
router.post('/calculate', auth, calculatorController.calculate);

// GET calculation history
router.get('/history', auth, calculatorController.getHistory);

module.exports = router;