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
  weight: {
    type: Number,
    min: 20,
    max: 300
  },
  height: {
    type: Number,
    min: 100,
    max: 250
  },
  age: {
    type: Number,
    min: 10,
    max: 120
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male'
  },
  notes: String,
  date: {
    type: Date,
    default: Date.now
  },
  // AI Analysis Results
  aiAnalysis: {
    bodyFatEstimate: {
      type: Number,
      min: 0,
      max: 100
    },
    bmi: {
      type: Number,
      min: 10,
      max: 50
    },
    muscleScore: {
      type: Number,
      min: 0,
      max: 100
    },
    postureScore: {
      type: Number,
      min: 0,
      max: 100
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    analysisVersion: String,
    modelType: String,
    analyzedAt: {
      type: Date,
      default: Date.now
    },
    poseQuality: {
      edgeClarity: Number,
      brightness: Number,
      contrast: Number,
      qualityScore: Number
    }
  }
});

module.exports = mongoose.model('Progress', progressSchema);