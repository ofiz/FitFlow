const Workout = require('../models/Workout');
const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper function for date filtering
function getDateFilter(period) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return { $gte: today };
    case 'week':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { $gte: weekAgo };
    case 'month':
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return { $gte: monthAgo };
    case 'year':
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return { $gte: yearAgo };
    default:
      return null;
  }
}

// Get all workouts
exports.getWorkouts = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let query = { userId: req.user.id };
    
    if (period !== 'all') {
      const dateFilter = getDateFilter(period);
      if (dateFilter) {
        query.date = dateFilter;
      }
    }
    
    const workouts = await Workout.find(query).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single workout
exports.getWorkoutById = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid workout ID format' });
    }

    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create workout
exports.createWorkout = async (req, res) => {
  try {
    const { title, exercises, duration, difficulty, caloriesBurned, notes } = req.body;

    const workout = new Workout({
      userId: req.user.id,
      title,
      exercises,
      duration,
      difficulty,
      caloriesBurned,
      notes,
      date: new Date()
    });

    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    console.error('Error creating workout:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Update workout
exports.updateWorkout = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid workout ID format' });
    }

    const { title, exercises, duration, difficulty, caloriesBurned, notes } = req.body;

    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, exercises, duration, difficulty, caloriesBurned, notes },
      { new: true, runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    console.error('Error updating workout:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete workout
exports.deleteWorkout = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid workout ID format' });
    }

    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};