const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  weight: Number,
  notes: String,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Progress', progressSchema);