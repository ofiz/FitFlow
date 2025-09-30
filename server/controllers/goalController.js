const Goal = require('../models/Goal');

// Get all goals
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create goal
exports.createGoal = async (req, res) => {
  try {
    const { title, current, target, unit } = req.body;
    
    // Validation
    if (!title || current === undefined || target === undefined || !unit) {
      return res.status(400).json({
        message: 'Title, current, target, and unit are required'
      });
    }

    const goal = new Goal({
      userId: req.user.id,
      ...req.body
    });
    
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update goal
exports.updateGoal = async (req, res) => {
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
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
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
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};