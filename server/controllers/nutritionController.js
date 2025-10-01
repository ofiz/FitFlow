const Meal = require('../models/Meal');

// Helper function 
function getDateFilter(period) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return { $gte: today };
    case 'week':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { $gte: weekAgo };
    case 'month':
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return { $gte: monthAgo };
    case 'year':
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return { $gte: yearAgo };
    default:
      return null;
  }
}

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

// Get meals with period filter
exports.getTodayMeals = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let query = { userId: req.user.id };
    
    if (period !== 'all') {
      const dateFilter = getDateFilter(period);
      if (dateFilter) {
        query.date = dateFilter;
      }
    }

    const meals = await Meal.find(query).sort({ time: 1 });
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