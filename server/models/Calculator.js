const mongoose = require('mongoose');

const calculatorResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'lightly', 'moderately', 'very', 'extremely'],
    required: true
  },
  bmr: {
    type: Number,
    required: true
  },
  tdee: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CalculatorResult', calculatorResultSchema);