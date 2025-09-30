const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');

// GET all goals
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create goal
router.post('/', auth, async (req, res) => {
  try {
    const goal = new Goal({
      userId: req.user.id,
      ...req.body
    });
    
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update goal
router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;