const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // CORS configuration for Vercel Serverless Function
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow Render to hit this API
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, otp, proxySecret } = req.body;

  // Simple security check so only your Render backend can use this endpoint
  if (!proxySecret || proxySecret !== process.env.PROXY_SECRET) {
    return res.status(401).json({ message: 'Unauthorized Request. Invalid Proxy Secret.' });
  }

  if (!email || !otp) {
    return res.status(400).json({ message: 'Missing email or OTP payload.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      connectionTimeout: 5000,
    });

    const mailOptions = {
      from: `DigiHub <${process.env.GMAIL_USER}>`,
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

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully via Vercel proxy.' });

  } catch (error) {
    console.error('Vercel Email Proxy Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
