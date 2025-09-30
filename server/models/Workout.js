const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    weight: Number,
    duration: Number
  }],
  duration: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String
});

module.exports = mongoose.model('Workout', workoutSchema);