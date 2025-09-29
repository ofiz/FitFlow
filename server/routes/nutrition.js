const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Meal = require('../models/Meal');

// GET meals for today
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const meals = await Meal.find({
      userId: req.user.id,
      date: { $gte: today }
    }).sort({ time: 1 });
    
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET meals by date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const meals = await Meal.find({
      userId: req.user.id,
      date: { $gte: date, $lt: nextDay }
    }).sort({ time: 1 });
    
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create meal
router.post('/meals', auth, async (req, res) => {
  try {
    const meal = new Meal({
      userId: req.user.id,
      ...req.body
    });
    
    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update meal
router.put('/meals/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE meal
router.delete('/meals/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    res.json({ message: 'Meal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;