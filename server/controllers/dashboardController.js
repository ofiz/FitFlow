const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const User = require('../models/User');

// GET dashboard stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data first
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Get workouts this week
    const workoutsThisWeek = await Workout.countDocuments({
      userId,
      date: { $gte: weekAgo }
    });

    // Get workouts last week
    const twoWeeksAgo = new Date(weekAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
    
    const workoutsLastWeek = await Workout.countDocuments({
      userId,
      date: { $gte: twoWeeksAgo, $lt: weekAgo }
    });

    // Get calories today
    const mealsToday = await Meal.find({
      userId,
      date: { $gte: today }
    });
    
    const caloriesToday = mealsToday.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    
    const calorieGoal = user.calorieGoal || 2000; // ברירת מחדל
    const caloriesRemaining = calorieGoal - caloriesToday;

    // Calculate active streak
    let activeStreak = 0;
    let checkDate = new Date(today);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days max
      const workoutCount = await Workout.countDocuments({
        userId,
        date: {
          $gte: checkDate,
          $lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      if (workoutCount > 0) {
        activeStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({
      workoutsThisWeek,
      workoutsChange: workoutsThisWeek - workoutsLastWeek,
      caloriesToday,
      caloriesRemaining,
      currentWeight: user.currentWeight || 0,
      weightChange: -2, // Placeholder - implement later
      activeStreak
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};