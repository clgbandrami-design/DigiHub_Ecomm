const axios = require('axios');

const sendEmailOTP = async (email, otp) => {
  const proxyUrl = process.env.VERCEL_PROXY_URL || 'https://digi-hub-ecomm.vercel.app/api/send-email';
  const proxySecret = process.env.PROXY_SECRET || 'super-secret-key-123';

  try {
    const response = await axios.post(
      proxyUrl,
      {
        email,
        otp,
        proxySecret
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    console.log(`✅ OTP sent to ${email} via Vercel Proxy`);
    return true;
  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('❌ Error sending email via Vercel Proxy:', errorMsg);
    throw new Error(`Proxy Error: ${errorMsg}`);
  }
};

module.exports = { sendEmailOTP };
