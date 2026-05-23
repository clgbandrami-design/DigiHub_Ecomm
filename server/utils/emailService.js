const { Resend } = require('resend');

const sendEmailOTP = async (email, otp) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not set in .env. Skipping real email send.');
    console.log('--- DEVELOPMENT OTP ---');
    console.log(`OTP for ${email}: ${otp}`);
    console.log('-----------------------');
    console.log('To send real emails, please create a free account at resend.com and set RESEND_API_KEY');
    return false; // Returning false will trigger the auto-verify bypass if configured in userController
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      // You can use a generic onboarding address or your verified domain here
      from: 'DigiHub <onboarding@resend.dev>',
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
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      console.log(`DEBUG: OTP for ${email} is ${otp}`);
      return false;
    }

    console.log(`✅ OTP sent to ${email} via Resend`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.log(`DEBUG: OTP for ${email} is ${otp}`);
    return false;
  }
};

module.exports = { sendEmailOTP };
