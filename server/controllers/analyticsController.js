const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const User = require('../models/User');

// Helper function to get date range
const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7));
  }

  return { startDate, endDate: new Date() };
};

// Get workout statistics
exports.getWorkoutStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const workouts = await Workout.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Calculate statistics
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    // Group workouts by day for chart data
    const workoutsByDay = {};
    workouts.forEach(workout => {
      const day = new Date(workout.date).toISOString().split('T')[0];
      if (!workoutsByDay[day]) {
        workoutsByDay[day] = {
          date: day,
          count: 0,
          duration: 0,
          calories: 0
        };
      }
      workoutsByDay[day].count += 1;
      workoutsByDay[day].duration += workout.duration || 0;
      workoutsByDay[day].calories += workout.caloriesBurned || 0;
    });

    const chartData = Object.values(workoutsByDay).map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: day.count,
      duration: day.duration,
      calories: day.calories
    }));

    res.json({
      summary: {
        totalWorkouts,
        totalDuration,
        totalCaloriesBurned,
        avgDuration
      },
      chartData,
      period
    });
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get nutrition statistics
exports.getNutritionStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const meals = await Meal.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Calculate statistics
    const totalMeals = meals.length;
    const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const totalFats = meals.reduce((sum, m) => sum + (m.fats || 0), 0);
    
    const avgCalories = totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0;

    // Group meals by day for chart data
    const mealsByDay = {};
    meals.forEach(meal => {
      const day = new Date(meal.date).toISOString().split('T')[0];
      if (!mealsByDay[day]) {
        mealsByDay[day] = {
          date: day,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          count: 0
        };
      }
      mealsByDay[day].calories += meal.calories || 0;
      mealsByDay[day].protein += meal.protein || 0;
      mealsByDay[day].carbs += meal.carbs || 0;
      mealsByDay[day].fats += meal.fats || 0;
      mealsByDay[day].count += 1;
    });

    const chartData = Object.values(mealsByDay).map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calories: day.calories,
      protein: day.protein,
      carbs: day.carbs,
      fats: day.fats,
      meals: day.count
    }));

    res.json({
      summary: {
        totalMeals,
        totalCalories,
        avgCalories,
        totalProtein,
        totalCarbs,
        totalFats
      },
      chartData,
      period
    });
  } catch (error) {
    console.error('Error fetching nutrition stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get overview/dashboard statistics
exports.getOverview = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get this week's data
    const { startDate: weekStart } = getDateRange('week');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Workouts this week
    const workoutsThisWeek = await Workout.countDocuments({
      userId: req.user.id,
      date: { $gte: weekStart }
    });

    // Meals today
    const mealsToday = await Meal.find({
      userId: req.user.id,
      date: { $gte: today }
    });

    const caloriesToday = mealsToday.reduce((sum, m) => sum + (m.calories || 0), 0);

    // Calculate if user has complete profile
    const hasCompleteProfile = user.currentWeight > 0 && 
                               user.targetWeight > 0 && 
                               user.height > 0;

    // Calculate BMI if possible
    let bmi = null;
    if (user.height > 0 && user.currentWeight > 0) {
      const heightInMeters = user.height / 100;
      bmi = (user.currentWeight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    res.json({
      user: {
        name: user.name,
        currentWeight: user.currentWeight,
        targetWeight: user.targetWeight,
        height: user.height,
        calorieGoal: user.calorieGoal
      },
      hasCompleteProfile,
      stats: {
        workoutsThisWeek,
        caloriesToday,
        calorieGoal: user.calorieGoal,
        bmi
      }
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};