const CalculatorResult = require('../models/Calculator');

// Calculate BMR using Mifflin-St Jeor Equation
function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calculate TDEE based on activity level
function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,      // Little or no exercise
    lightly: 1.375,      // 1-3 days/week
    moderately: 1.55,    // 3-5 days/week
    very: 1.725,         // 6-7 days/week
    extremely: 1.9       // Athlete level
  };
  
  return Math.round(bmr * multipliers[activityLevel]);
}

function adjustCaloriesForGoal(tdee, generalGoal) {
  switch(generalGoal) {
    case 'gain_mass':
      return tdee + 600;  // Add 600 calories for mass gain
    case 'lose_fat':
      return tdee - 450;  // Subtract 450 calories for fat loss
    case 'maintenance':
    default:
      return tdee;        // No adjustment for maintenance
  }
}

// Calculate calories
exports.calculate = async (req, res) => {
  try {
    const { age, weight, height, gender, activityLevel, generalGoal } = req.body; // ✏️ MODIFIED: Added generalGoal
    
    // Validation
    if (!age || !weight || !height || !gender || !activityLevel) {
      return res.status(400).json({
        message: 'All fields are required: age, weight, height, gender, activityLevel'
      });
    }

    // Validate ranges (important for health safety)
    if (age < 15 || age > 100) {
      return res.status(400).json({
        message: 'Age must be between 15 and 100'
      });
    }

    if (weight < 30 || weight > 300) {
      return res.status(400).json({
        message: 'Weight must be between 30 and 300 kg'
      });
    }

    if (height < 100 || height > 250) {
      return res.status(400).json({
        message: 'Height must be between 100 and 250 cm'
      });
    }

    // Calculate BMR and TDEE
    const bmr = Math.round(calculateBMR(weight, height, age, gender));
    const baseTdee = calculateTDEE(bmr, activityLevel); 
    const tdee = adjustCaloriesForGoal(baseTdee, generalGoal || 'maintenance'); 

    // Save calculation history
    const calculation = new CalculatorResult({
      userId: req.user.id,
      age,
      weight,
      height,
      gender,
      activityLevel,
      generalGoal: generalGoal || 'maintenance',
      bmr,
      tdee
    });
    
    await calculation.save();

    res.json({
      bmr,
      tdee,
      savedId: calculation._id
    });
  } catch (error) {
    console.error('Error calculating calories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get calculation history
exports.getHistory = async (req, res) => {
  try {
    const history = await CalculatorResult.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};