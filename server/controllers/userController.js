const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, currentWeight, targetWeight, height, age, gender, activityLevel, calorieGoal } = req.body;
    
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (currentWeight !== undefined) updateData.currentWeight = currentWeight;
    if (targetWeight !== undefined) updateData.targetWeight = targetWeight;
    if (height !== undefined) updateData.height = height;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (activityLevel !== undefined) updateData.activityLevel = activityLevel;
    if (calorieGoal !== undefined) updateData.calorieGoal = calorieGoal;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};