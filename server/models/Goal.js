const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  current: {
    type: Number,
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['weight', 'strength', 'endurance', 'other'],
    default: 'other'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Goal', goalSchema);