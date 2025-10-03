const mongoose = require('mongoose');

const triviaQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['vitamins', 'macronutrients', 'minerals', 'hydration', 'general'],
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  explanation: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('TriviaQuestion', triviaQuestionSchema);