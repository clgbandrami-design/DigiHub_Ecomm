const nodemailer = require('nodemailer');

const sendEmailOTP = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set in .env. Skipping real email send.');
    console.log('--- DEVELOPMENT OTP ---');
    console.log(`OTP for ${email}: ${otp}`);
    console.log('-----------------------');
    console.log('To send real emails, follow the guide in the chat.');
    return true; 
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'DigiHub - Your Verification OTP',
    html: `
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
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.log(`DEBUG: OTP for ${email} is ${otp}`);
    return false;
  }
};

module.exports = { sendEmailOTP };
