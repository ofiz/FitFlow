const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const triviaController = require('../controllers/triviaController');

// GET random question
router.get('/question', auth, triviaController.getRandomQuestion);

// POST submit answer
router.post('/answer', auth, triviaController.submitAnswer);

// GET user stats
router.get('/stats', auth, triviaController.getUserStats);

// POST seed questions (development only - remove in production)
router.post('/seed', triviaController.seedQuestions);

module.exports = router;