const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard'); 

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});