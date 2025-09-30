const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const goalController = require('../controllers/goalController');

// GET all goals
router.get('/', auth, goalController.getAllGoals);

// POST create goal
router.post('/', auth, goalController.createGoal);

// PUT update goal
router.put('/:id', auth, goalController.updateGoal);

// DELETE goal
router.delete('/:id', auth, goalController.deleteGoal);

module.exports = router;