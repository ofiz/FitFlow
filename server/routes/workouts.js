const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const workoutController = require('../controllers/workoutController');

// GET all workouts
router.get('/', auth, workoutController.getWorkouts);

// GET workout by ID
router.get('/:id', auth, workoutController.getWorkoutById);

// POST create workout
router.post('/', auth, workoutController.createWorkout);

// PUT update workout
router.put('/:id', auth, workoutController.updateWorkout);

// DELETE workout
router.delete('/:id', auth, workoutController.deleteWorkout);

module.exports = router;