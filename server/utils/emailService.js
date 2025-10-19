const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (email, resetToken) => {
  console.log('📧 ===== SENDING EMAIL =====');
  console.log('To:', email);
  console.log('Token:', resetToken);
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  console.log('Reset URL:', resetUrl);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true,
    logger: true
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || 'FitFlow <noreply@fitflow.com>',
    to: email,
    subject: 'Password Reset Request - FitFlow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4ecdc4;">Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; margin: 20px 0; 
                  background: linear-gradient(135deg, #4ecdc4, #ff6b6b); 
                  color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent! Message ID:', info.messageId);
    console.log('Response:', info.response);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    return { success: false, error: error.message };
  }
};

module.exports = { sendPasswordResetEmail };