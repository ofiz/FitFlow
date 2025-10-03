const mongoose = require('mongoose');

const triviaScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  totalAnswered: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  lastPlayedDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('TriviaScore', triviaScoreSchema);