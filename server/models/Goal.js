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
  initial: {
    type: Number,
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);