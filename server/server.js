const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));
}

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const workoutsRoutes = require('./routes/workouts');
const nutritionRoutes = require('./routes/nutrition');
const goalsRoutes = require('./routes/goals');
const userRoutes = require('./routes/user');
const calculatorRoutes = require('./routes/calculator');
const progressRoutes = require('./routes/progress');
const triviaRoutes = require('./routes/trivia');
const aiCoachRoutes = require('./routes/aiCoach');
const analyticsRoutes = require('./routes/analytics');

// Health check route
app.use('/api/test', require('./routes/healthcheck'));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/progress', progressRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/trivia', triviaRoutes);
app.use('/api/ai-coach', aiCoachRoutes);
app.use('/api/analytics', analyticsRoutes);

// Export app for testing
module.exports = app;

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Connect to MongoDB only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      
      // Auto-seed trivia questions if none exist
      const TriviaQuestion = require('./models/TriviaQuestion');
      const count = await TriviaQuestion.countDocuments();
      
      if (count === 0) {
        console.log('No trivia questions found. Seeding 20 questions...');
        const triviaController = require('./controllers/triviaController');
        
        await triviaController.seedQuestions(
          {}, 
          { json: (data) => console.log(data.message) }
        );
      }
    })
    .catch(err => console.log('MongoDB connection error:', err));
}