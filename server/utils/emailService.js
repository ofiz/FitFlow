// server/utils/emailService.js
const emailTransporter = require('../config/emailConfig');

const createPasswordResetEmail = (resetLink, userEmail) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - FitFlow</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);">
              
              <!-- Header with Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #ff6b6b, #4ecdc4); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);">
                    🏋️ FitFlow
                  </h1>
                  <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 600;">
                    Your Fitness Journey Companion
                  </p>
                </td>
              </tr>
              
              <!-- Content Area -->
              <tr>
                <td style="padding: 50px 40px; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px);">
                  <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 700; text-align: center;">
                    Reset Your Password
                  </h2>
                  
                  <p style="margin: 0 0 25px 0; color: rgba(255, 255, 255, 0.85); font-size: 16px; line-height: 1.6; text-align: center;">
                    Hi there! 👋<br>
                    We received a request to reset the password for your FitFlow account associated with <strong style="color: #4ecdc4;">${userEmail}</strong>
                  </p>
                  
                  <p style="margin: 0 0 30px 0; color: rgba(255, 255, 255, 0.75); font-size: 14px; line-height: 1.6; text-align: center;">
                    Click the button below to create a new password. This link will expire in <strong>1 hour</strong> for security reasons.
                  </p>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${resetLink}" style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #4ecdc4, #ff6b6b); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 18px; font-weight: 700; box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3); transition: transform 0.3s ease;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Divider -->
                  <div style="margin: 35px 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);"></div>
                  
                  <!-- Alternative Link -->
                  <p style="margin: 0 0 15px 0; color: rgba(255, 255, 255, 0.7); font-size: 13px; line-height: 1.5; text-align: center;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0; text-align: center;">
                    <a href="${resetLink}" style="color: #4ecdc4; font-size: 13px; word-break: break-all; text-decoration: none;">
                      ${resetLink}
                    </a>
                  </p>
                  
                  <!-- Security Notice -->
                  <div style="margin-top: 35px; padding: 20px; background: rgba(255, 107, 107, 0.1); border-left: 4px solid #ff6b6b; border-radius: 8px;">
                    <p style="margin: 0; color: rgba(255, 255, 255, 0.85); font-size: 14px; line-height: 1.5;">
                      ⚠️ <strong>Security Notice:</strong><br>
                      If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background: rgba(0, 0, 0, 0.3); text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                  <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.6); font-size: 13px;">
                    Stay fit, stay focused 💪
                  </p>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                    © ${new Date().getFullYear()} FitFlow. All rights reserved.
                  </p>
                  <p style="margin: 15px 0 0 0; color: rgba(255, 255, 255, 0.4); font-size: 11px;">
                    This is an automated message, please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost'}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || '"FitFlow 🏋️" <fitflow.noreply@gmail.com>',
    to: email,
    subject: '🔐 Reset Your FitFlow Password',
    html: createPasswordResetEmail(resetLink, email)
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendPasswordResetEmail };