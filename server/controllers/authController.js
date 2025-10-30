const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const User = require('../models/User');
const emailTransporter = require('../config/emailConfig');

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

// Forgot Password - Send reset email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔍 Forgot password request for:', email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({ message: "No account found with this email" });
    }

    console.log('✅ User found:', user.email);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log('🔑 Generated reset token:', resetToken);

    // Hash token before saving to database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token and expiry to database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

    await user.save();
    console.log('💾 Token saved to database');
    console.log('⏰ Token expires at:', new Date(user.resetPasswordExpire));

    // Create reset URL (use plain token in URL, not hashed)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    console.log('🔗 Reset URL:', resetUrl);

    // Send email
    try {
      await emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: user.email,
        subject: 'FitFlow - Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password for FitFlow.</p>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4ecdc4; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });

      console.log('📧 Email sent successfully to:', user.email);
      res.status(200).json({ message: "Password reset email sent successfully" });
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // If email fails, clear the reset token
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      
      return res.status(500).json({ message: "Email could not be sent. Please try again later." });
    }

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password - Verify token and update password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('🔍 Reset password request with token');

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash the token from URL to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    console.log('✅ Valid token for user:', user.email);

    // Hash new password
    const saltRounds = 12;
    user.password = await bcrypt.hash(password, saltRounds);

    // Clear reset token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();
    console.log('✅ Password updated successfully');

    res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    console.error('❌ Reset password error:', error);
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