const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate email format
        if (!isValidEmail(email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        res.status(201).json({
            message: "User registered successfully",
            token: token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error" })
    }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    // 4. Send token in cookie (HttpOnly)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // 5. Send success response
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    // Clear the cookie
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // Expire immediately
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Request password reset
// Request password reset
const forgotPassword = async (req, res) => {
  try {
    console.log('🔐 ===== FORGOT PASSWORD REQUEST =====');
    console.log('📧 Request body:', req.body);
    
    const { email } = req.body;
    console.log('📧 Email extracted:', email);

    // Validate email
    if (!email || !isValidEmail(email)) {
      console.log('❌ Invalid email format');
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    console.log('✅ Email format valid');

    // Find user
    console.log('🔍 Searching for user...');
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('⚠️ User not found for email:', email);
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: "If this email exists, a reset link has been sent" 
      });
    }

    console.log('✅ User found! ID:', user._id);

    // Generate reset token using SHA-1
    const resetToken = crypto
      .createHash('sha1')
      .update(`${user._id}${Date.now()}${Math.random()}`)
      .digest('hex');

    console.log('🔑 Reset token generated:', resetToken.substring(0, 10) + '...');

    // Save token and expiration (1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    console.log('💾 Token saved to database');
    console.log('⏰ Token expires at:', new Date(user.resetPasswordExpire));

    // Send email
    console.log('📤 Calling sendPasswordResetEmail...');
    console.log('📧 Sending to:', user.email);
    console.log('🔗 Reset token:', resetToken);
    
    const emailResult = await sendPasswordResetEmail(user.email, resetToken);

    console.log('📬 Email result:', emailResult);

    if (!emailResult.success) {
      console.error('❌ EMAIL FAILED!');
      console.error('Error:', emailResult.error);
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      return res.status(500).json({ message: "Error sending email" });
    }

    console.log('✅ ===== EMAIL SENT SUCCESSFULLY! =====');
    
    res.status(200).json({ 
      message: "Password reset email sent successfully" 
    });
  } catch (error) {
    console.error("❌ ===== FORGOT PASSWORD ERROR =====");
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token" 
      });
    }

    // Hash new password
    const saltRounds = 12;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    
    // Clear reset token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({ 
      message: "Password has been reset successfully" 
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  logoutUser,
  forgotPassword,
  resetPassword 
};