const Meal = require('../models/Meal');

// Create meal
exports.createMeal = async (req, res) => {
  try {
    const { name, mealType, calories, protein, carbs, fats, time } = req.body;

    const meal = new Meal({
      userId: req.user.id,
      name,
      mealType,
      calories,
      protein,
      carbs,
      fats,
      time,
      date: new Date()
    });

    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    console.error('Error creating meal:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Get today's meals
exports.getTodayMeals = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      userId: req.user.id,
      date: { $gte: today }
    }).sort({ time: 1 });

    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update meal
exports.updateMeal = async (req, res) => {
  try {
    const { name, mealType, calories, protein, carbs, fats, time } = req.body;

    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, mealType, calories, protein, carbs, fats, time },
      { new: true, runValidators: true }
    );

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json(meal);
  } catch (error) {
    console.error('Error updating meal:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Get meals by specific date
exports.getMealsByDate = async (req, res) => {
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
    console.error('Error fetching meals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete meal
exports.deleteMeal = async (req, res) => {
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
    console.error('Error deleting meal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};