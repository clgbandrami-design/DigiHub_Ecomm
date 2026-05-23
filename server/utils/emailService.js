const axios = require('axios');

const sendEmailOTP = async (email, otp) => {
  if (!process.env.BREVO_API_KEY || !process.env.ADMIN_EMAIL) {
    console.warn('⚠️  BREVO_API_KEY or ADMIN_EMAIL not set in .env. Email delivery will fail.');
    return false;
  }

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { 
          name: 'DigiHub Admin', 
          email: process.env.ADMIN_EMAIL.trim()
        },
        to: [{ email: email }],
        subject: 'DigiHub - Your Verification OTP',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;">
            <h2 style="color: #2874f0; text-align: center;">Welcome to DigiHub</h2>
            <p>Hello,</p>
            <p>Your verification code for signing up is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; background: #f1f3f6; padding: 10px 20px; border-radius: 4px;">${otp}</span>
            </div>
            <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">DigiHub © 2024 - Premium Digital Assets</p>
          </div>
        `
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY.trim()
        }
      }
    );

    console.log(`✅ OTP sent to ${email} via Brevo`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error.response ? error.response.data : error.message);
    return false;
  }
};

module.exports = { sendEmailOTP };
