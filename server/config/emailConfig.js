const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if email is configured
const isEmailConfigured = () => {
  return !!(process.env.SMTP_HOST && 
            process.env.SMTP_PORT && 
            process.env.SMTP_USER && 
            process.env.SMTP_PASS);
};

// Create transporter only if configured, otherwise return mock
const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn('⚠️ Email not configured - using mock transporter for testing');
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 Mock email sent:', mailOptions.to, mailOptions.subject);
        return { messageId: 'mock-message-id' };
      }
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER, 
      pass: process.env.SMTP_PASS
    }
  });
};

const emailTransporter = createTransporter();

module.exports = emailTransporter;
