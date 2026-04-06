const axios = require('axios');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Send OTP to phone
// @route   POST /api/users/otp/send
// @access  Public
const sendOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const response = await axios.get(`https://api.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=${phone}&authkey=${process.env.MSG91_AUTH_KEY}`);
    
    if (response.data.type === 'success') {
      res.status(200).json({ message: 'OTP sent successfully' });
    } else {
      res.status(400).json({ message: response.data.message || 'Failed to send OTP' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while sending OTP' });
  }
};

// @desc    Verify OTP and login/register
// @route   POST /api/users/otp/verify
// @access  Public
const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required' });
  }

  try {
    const response = await axios.get(`https://api.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${phone}&authkey=${process.env.MSG91_AUTH_KEY}`);
    
    if (response.data.type === 'success') {
      // Find or create user
      let user = await User.findOne({ phone });

      if (!user) {
        // Create a new user with the phone number if it doesn't exist
        user = await User.create({
          name: `User ${phone.slice(-4)}`, // Default name
          email: `${phone}@placeholder.com`, // Placeholder email
          phone,
          password: `OTP_USER_${Date.now()}`, // Random password, not used for OTP login
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: response.data.message || 'Invalid OTP' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while verifying OTP' });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};
