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
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/reset-password/${resetToken}`;
    console.log('🔗 Reset URL:', resetUrl);

    // Send email with styled template
    try {
      await emailTransporter.sendMail({
        from: `"FitFlow" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '🔐 FitFlow - Password Reset Request',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #f5f5f5;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              }
              .email-container {
                max-width: 600px;
                margin: 40px auto;
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              }
              .email-header {
                background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
                padding: 40px 20px;
                text-align: center;
              }
              .logo {
                font-size: 32px;
                font-weight: 800;
                color: white;
                margin: 0;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
              }
              .email-body {
                padding: 40px 30px;
                background: white;
              }
              .email-body h2 {
                color: #333;
                font-size: 24px;
                margin-bottom: 20px;
                font-weight: 700;
              }
              .email-body p {
                color: #555;
                line-height: 1.6;
                margin-bottom: 20px;
                font-size: 16px;
              }
              .reset-button {
                display: inline-block;
                padding: 16px 40px;
                background: linear-gradient(135deg, #4ecdc4, #ff6b6b);
                color: white;
                text-decoration: none;
                border-radius: 10px;
                font-weight: 700;
                font-size: 18px;
                margin: 20px 0;
                box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
              }
              .reset-button:hover {
                box-shadow: 0 6px 20px rgba(78, 205, 196, 0.4);
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .warning {
                background: #fff3f3;
                border-left: 4px solid #ff6b6b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 8px;
              }
              .warning p {
                color: #333;
                margin: 0;
                font-size: 14px;
              }
              .email-footer {
                padding: 20px 30px;
                border-top: 1px solid #e0e0e0;
                text-align: center;
                background: #f9f9f9;
                color: #888;
                font-size: 14px;
              }
              .link-text {
                color: #4ecdc4;
                word-break: break-all;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <h1 class="logo">💪 FitFlow</h1>
              </div>
              <div class="email-body">
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your FitFlow account. Click the button below to create a new password:</p>
                
                <div class="button-container">
                  <a href="${resetUrl}" class="reset-button">Reset Password</a>
                </div>
                
                <p style="text-align: center; color: #888; font-size: 14px;">
                  Or copy and paste this link into your browser:<br>
                  <span class="link-text">${resetUrl}</span>
                </p>
                
                <div class="warning">
                  <p><strong>⏰ This link will expire in 1 hour</strong></p>
                </div>
                
                <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              </div>
              <div class="email-footer">
                <p>© 2025 FitFlow. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
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