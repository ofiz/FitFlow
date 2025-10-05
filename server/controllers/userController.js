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
    const {
      name,
      currentWeight,
      targetWeight,
      height,
      age,
      gender,
      activityLevel,
      calorieGoal
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (currentWeight !== undefined) user.currentWeight = currentWeight;
    if (targetWeight !== undefined) user.targetWeight = targetWeight;
    if (height !== undefined) user.height = height;
    if (age !== undefined) user.age = age;
    if (gender) user.gender = gender;
    if (activityLevel) user.activityLevel = activityLevel;
    if (calorieGoal !== undefined) user.calorieGoal = calorieGoal;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user stats for analytics
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate BMI if height and weight are available
    let bmi = null;
    if (user.height > 0 && user.currentWeight > 0) {
      const heightInMeters = user.height / 100;
      bmi = (user.currentWeight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    // Calculate weight progress
    let weightProgress = null;
    if (user.currentWeight > 0 && user.targetWeight > 0) {
      const totalToLose = user.currentWeight - user.targetWeight;
      weightProgress = {
        current: user.currentWeight,
        target: user.targetWeight,
        remaining: totalToLose,
        percentage: totalToLose > 0 ? ((totalToLose / user.currentWeight) * 100).toFixed(1) : 0
      };
    }

    res.json({
      user: {
        name: user.name,
        email: user.email,
        currentWeight: user.currentWeight,
        targetWeight: user.targetWeight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel,
        calorieGoal: user.calorieGoal
      },
      bmi,
      weightProgress
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'New password must be at least 8 characters' 
      });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must contain uppercase, lowercase, number and special character' 
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};